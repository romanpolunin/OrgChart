using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Left and right edges of some group of boxes.
    /// </summary>
    public class Boundary
    {
        /// <summary>
        /// A single step of the boundary.
        /// Each individual element in <see cref="Left"/> and <see cref="Right"/> collections
        /// represents one step of the boundary.
        /// </summary>
        public struct Step
        {
            /// <summary>
            /// Which <see cref="Box"/> holds this edge.
            /// </summary>
            public readonly int BoxId;
            /// <summary>
            /// Horizontal position of the edge.
            /// </summary>
            public readonly double X;

            /// <summary>
            /// Ctr.
            /// </summary>
            public Step(int boxId, double x)
            {
                BoxId = boxId;
                X = x;
            }
        }

        /// <summary>
        /// Number of logical units per step of the boundary.
        /// Each individual element in <see cref="Left"/> and <see cref="Right"/> collections
        /// represents one step of the boundary.
        /// </summary>
        public readonly double Resolution;
        /// <summary>
        /// Top edge.
        /// </summary>
        public double Top;
        /// <summary>
        /// Bottom edge.
        /// </summary>
        public double Bottom;

        /// <summary>
        /// Left edge. Each element is a point in some logical space.
        /// Vertical position is determined by the index of the element offset from <see cref="Top"/>,
        /// using certain resolution (resolution is defined externally).
        /// </summary>
        public List<Step> Left;
        /// <summary>
        /// Right edge. Each element is a point in some logical space.
        /// </summary>
        public List<Step> Right;

        /// <summary>
        /// Ctr.
        /// </summary>
        /// <param name="resolution">Resolution of the boundary, cannot be less than 1.0</param>
        public Boundary(double resolution)
        {
            if (resolution < 1.0)
            {
                throw new ArgumentOutOfRangeException(nameof(resolution));
            }

            Resolution = resolution;
            Left = new List<Step>();
            Right = new List<Step>();
        }

        /// <summary>
        /// Resets the edges, use when re-using this object from pool.
        /// </summary>
        public void Prepare([NotNull]Box box)
        {
            Left.Clear();
            Right.Clear();

            // adjust the top edge to fit the logical grid
            var rect = box.Frame.Exterior;
            Top = Math.Floor(rect.TopLeft.Y / Resolution) * Resolution - Resolution;
            Bottom = Top + rect.Size.Height + Resolution;

            var n = (int)Math.Ceiling((Bottom - Top) / Resolution);
            if (Left.Capacity < n)
            {
                Left.Capacity = n;
                Right.Capacity = n;
            }

            for (var i = 0; i < n; i++)
            {
                Left.Add(new Step(box.Id, rect.TopLeft.X));
                Right.Add(new Step(box.Id, rect.BottomRight.X));
            }
        }

        /// <summary>
        /// Merges another boundary into this one, potentially pushing its edges out.
        /// </summary>
        public void MergeFrom([NotNull]Boundary other)
        {
            if (Top > other.Top)
            {
                throw new ArgumentException("Other cannot be above myself");
            }

            AssertState();

            // Adjust number of steps in left and right edges
            var newHeight = Math.Max(Bottom, other.Bottom) - Math.Min(Top, other.Top);

            var n = (int)Math.Ceiling(newHeight / Resolution);
            if (Left.Capacity < n)
            {
                Left.Capacity = n;
                Right.Capacity = n;
            }

            while (Left.Count < n)
            {
                Left.Add(new Step(Box.None, double.MaxValue));
                Right.Add(new Step(Box.None, double.MinValue));
            }

            int myFrom, myTo;
            int theirFrom, theirTo;

            if (Top > other.Top)
            {
                myFrom = 0;
                theirFrom = (int)Math.Floor((Top - other.Top)/Resolution);
            }
            else
            {
                myFrom = (int)Math.Floor((other.Top - Top)/Resolution);
                theirFrom = 0;
            }

            if (Bottom > other.Bottom)
            {
                myTo = Left.Count - (int)Math.Ceiling((other.Bottom - Bottom)/Resolution);
                theirTo = other.Left.Count - 1;
            }
            else
            {
                myTo = Left.Count - 1;
                theirTo = other.Left.Count - (int)Math.Ceiling((Bottom - other.Bottom)/Resolution);
            }

            // process overlapping part only
            for (int i = myFrom, k = theirFrom; i < myTo && k < theirTo; i++, k++)
            {
                if (Left[i].X > other.Left[k].X)
                {
                    Left[i] = other.Left[k];
                }

                if (Right[i].X < other.Right[k].X)
                {
                    Right[i] = other.Right[k];
                }
            }

            Bottom = Math.Max(Bottom, other.Bottom);
        }

        /// <summary>
        /// Returns max horizontal overlap between myself and <paramref name="other"/>.
        /// </summary>
        public double ComputeOverlap([NotNull]Boundary other)
        {
            AssertState();

            int myFrom, myTo;
            int theirFrom, theirTo;

            if (Top > other.Top)
            {
                myFrom = 0;
                theirFrom = (int)Math.Floor((Top - other.Top)/Resolution);
            }
            else
            {
                myFrom = (int)Math.Floor((other.Top - Top)/Resolution);
                theirFrom = 0;
            }

            if (Bottom > other.Bottom)
            {
                myTo = Left.Count - (int)Math.Ceiling((other.Bottom - Bottom)/Resolution);
                theirTo = other.Left.Count - 1;
            }
            else
            {
                myTo = Left.Count - 1;
                theirTo = other.Left.Count - (int)Math.Ceiling((Bottom - other.Bottom)/Resolution);
            }

            // process overlapping part only
            var offense = 0.0d;
            for (int i = myFrom, k = theirFrom; i < myTo && k < theirTo; i++, k++)
            {
                var diff = Right[i].X - other.Left[k].X;
                if (diff > offense)
                {
                    offense = diff;
                }
            }

            return offense;
        }

        /// <summary>
        /// Returns max horizontal overlap between myself and <paramref name="rect"/>.
        /// </summary>
        public double ComputeOverlap(Rect rect)
        {
            AssertState();

            int myFrom, myTo;

            if (Top > rect.TopLeft.Y)
            {
                myFrom = 0;
            }
            else
            {
                myFrom = (int) Math.Floor((rect.TopLeft.Y - Top)/Resolution);
            }

            if (Bottom > rect.BottomRight.Y)
            {
                myTo = Left.Count - (int)Math.Ceiling((rect.BottomRight.Y - Bottom)/Resolution);
            }
            else
            {
                myTo = Left.Count - 1;
            }

            // process overlapping part only
            var offense = 0.0d;
            for (var i = myFrom; i <= myTo; i++)
            {
                var diff = Right[i].X - rect.TopLeft.X;
                if (diff > offense)
                {
                    offense = diff;
                }
            }

            return offense;
        }

        private void AssertState()
        {
            if (Top > Bottom)
            {
                throw new InvalidOperationException($"Bottom {Bottom} is under top {Top}");
            }
        }
    }
}