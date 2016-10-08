using System;
using System.Collections.Generic;
using Staffer.OrgChart.Annotations;
using Staffer.OrgChart.Misc;

namespace Staffer.OrgChart.Layout
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
            [CanBeNull]
            public readonly Box Box;
            /// <summary>
            /// Horizontal position of the edge.
            /// </summary>
            public readonly double X;

            /// <summary>
            /// Ctr.
            /// </summary>
            public Step([CanBeNull]Box box, double x)
            {
                Box = box;
                X = x;
            }
        }

        /// <summary>
        /// Number of logical units per step of the boundary.
        /// Each individual element in <see cref="Left"/> and <see cref="Right"/> collections
        /// represents one step of the boundary.
        /// </summary>
        public double Resolution { get; }
        /// <summary>
        /// Bounding rectangle.
        /// </summary>
        public Rect BoundingRect { get; private set; }

        /// <summary>
        /// Left edge. Each element is a point in some logical space.
        /// Vertical position is determined by the index of the element offset from Top,
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
        public void PrepareForHorizontalLayout([NotNull]Box box)
        {
            Prepare(box);

            var n = (int)Math.Ceiling(BoundingRect.Size.Height / Resolution);
            if (Left.Capacity < n)
            {
                Left.Capacity = n;
                Right.Capacity = n;
            }

            var rect = box.Frame.Exterior;
            for (var i = 0; i < n; i++)
            {
                Left.Add(new Step(box, rect.Left));
                Right.Add(new Step(box, rect.Right));
            }
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

            BoundingRect = AdjustRect(rect);
        }

        private Rect AdjustRect(Rect rect)
        {
            var top = Math.Floor(rect.Top / Resolution) * Resolution;
            var bottom = Math.Ceiling(rect.Bottom / Resolution) * Resolution;
            return new Rect(rect.Left, top, rect.Size.Width, bottom - top);
        }

        /// <summary>
        /// Merges another boundary into this one, potentially pushing its edges out.
        /// </summary>
        public void VerticalMergeFrom([NotNull]Boundary other)
        {
            if (BoundingRect.Top > other.BoundingRect.Top)
            {
                throw new ArgumentException("Other cannot be above myself");
            }
            
            BoundingRect += other.BoundingRect;
        }

        /// <summary>
        /// Merges another boundary into this one, potentially pushing its edges out.
        /// </summary>
        public void MergeFrom([NotNull]Boundary other)
        {
            if (BoundingRect.Top > other.BoundingRect.Top)
            {
                throw new ArgumentException("Other cannot be above myself");
            }

            // Adjust number of steps in left and right edges
            var newHeight = Math.Max(BoundingRect.Bottom, other.BoundingRect.Bottom) - Math.Min(BoundingRect.Top, other.BoundingRect.Top);

            var n = (int)Math.Ceiling(newHeight / Resolution);
            if (Left.Capacity < n)
            {
                Left.Capacity = n;
                Right.Capacity = n;
            }

            while (Left.Count < n)
            {
                Left.Add(new Step(null, double.MaxValue));
                Right.Add(new Step(null, double.MinValue));
            }

            int myFrom;
            int theirFrom;

            if (BoundingRect.Top > other.BoundingRect.Top)
            {
                myFrom = 0;
                theirFrom = (int)Math.Floor((BoundingRect.Top - other.BoundingRect.Top)/Resolution);
            }
            else
            {
                myFrom = (int)Math.Floor((other.BoundingRect.Top - BoundingRect.Top)/Resolution);
                theirFrom = 0;
            }

            // from top - take overlapping part only, but go as for down as possible
            for (int i = myFrom, k = theirFrom; k < other.Left.Count; i++, k++)
            {
                if (other.Left[k].Box != null && Left[i].X > other.Left[k].X)
                {
                    Left[i] = other.Left[k];
                }

                if (other.Right[k].Box != null && Right[i].X < other.Right[k].X)
                {
                    Right[i] = other.Right[k];
                }
            }

            BoundingRect += other.BoundingRect;
        }

        /// <summary>
        /// Merges a box into this one, potentially pushing its edges out.
        /// </summary>
        public void MergeFrom([NotNull]Box box)
        {
            var rect = box.Frame.Exterior;
            if (BoundingRect.Top > rect.Top)
            {
                throw new ArgumentException("Other cannot be above myself");
            }

            // Adjust number of steps in left and right edges
            var newHeight = Math.Max(BoundingRect.Bottom, rect.Bottom) - Math.Min(BoundingRect.Top, rect.Top);

            var n = (int)Math.Ceiling(newHeight / Resolution);
            if (Left.Capacity < n)
            {
                Left.Capacity = n;
                Right.Capacity = n;
            }

            while (Left.Count < n)
            {
                Left.Add(new Step(null, double.MaxValue));
                Right.Add(new Step(null, double.MinValue));
            }

            int myFrom, myTo;

            if (BoundingRect.Top > rect.Top)
            {
                myFrom = 0;
            }
            else
            {
                myFrom = (int)Math.Floor((rect.Top - BoundingRect.Top)/Resolution);
            }

            if (BoundingRect.Bottom > rect.Bottom)
            {
                myTo = Left.Count - (int)Math.Ceiling((BoundingRect.Bottom - rect.Bottom) /Resolution);
            }
            else
            {
                myTo = Left.Count;
            }

            // process overlapping part only
            for (var i = myFrom; i < myTo; i++)
            {
                if (Left[i].X > rect.Left)
                {
                    Left[i] = new Step(box, rect.Left);
                }

                if (Right[i].X < rect.Right)
                {
                    Right[i] = new Step(box, rect.Right);
                }
            }

            BoundingRect += AdjustRect(rect);
        }

        /// <summary>
        /// Returns max horizontal overlap between myself and <paramref name="other"/>.
        /// </summary>
        public double ComputeOverlap([NotNull]Boundary other, double siblingSpacing, double branchSpacing)
        {
            int myFrom, myTo;
            int theirFrom, theirTo;

            if (BoundingRect.Top > other.BoundingRect.Top)
            {
                myFrom = 0;
                theirFrom = (int)Math.Floor((BoundingRect.Top - other.BoundingRect.Top) /Resolution);
            }
            else
            {
                myFrom = (int)Math.Floor((other.BoundingRect.Top - BoundingRect.Top) /Resolution);
                theirFrom = 0;
            }

            if (BoundingRect.Bottom > other.BoundingRect.Bottom)
            {
                myTo = Left.Count - (int)Math.Ceiling((BoundingRect.Bottom - other.BoundingRect.Bottom) /Resolution);
                theirTo = other.Left.Count - 1;
            }
            else
            {
                myTo = Left.Count - 1;
                theirTo = other.Left.Count - (int)Math.Ceiling((other.BoundingRect.Bottom - BoundingRect.Bottom) /Resolution);
            }

            // process overlapping part only
            var offense = 0.0d;
            for (int i = myFrom, k = theirFrom; i < myTo && k < theirTo; i++, k++)
            {
                var siblings = Right[i].Box?.VisualParentId == other.Left[k].Box?.VisualParentId;
                var desiredSpacing = siblings ? siblingSpacing : branchSpacing;

                var diff = Right[i].X + desiredSpacing - other.Left[k].X;
                if (diff > offense)
                {
                    offense = diff;
                }
            }

            return offense;
        }

        /// <summary>
        /// Re-initializes left and right edges based on actual coordinates of boxes.
        /// </summary>
        public void ReloadFromBranch(Tree<int, Box, NodeLayoutInfo>.TreeNode branchRoot, [NotNull] IReadOnlyDictionary<int, Box> boxes)
        {
            var leftmost = double.MaxValue;
            var rightmost = double.MinValue;
            for (var i = 0; i < Left.Count; i++)
            {
                var left = Left[i];
                if (left.Box != null)
                {
                    Left[i] = new Step(left.Box, left.Box.Frame.Exterior.Left);
                    leftmost = Math.Min(leftmost, Left[i].X);
                }

                var right = Right[i];
                if (right.Box != null)
                {
                    Right[i] = new Step(right.Box, right.Box.Frame.Exterior.Right);
                    rightmost = Math.Max(rightmost, Right[i].X);
                }
            }
            
            BoundingRect = new Rect(new Point(Left[0].X, BoundingRect.Top),
                new Size(rightmost - leftmost, BoundingRect.Size.Height));
        }
    }
}