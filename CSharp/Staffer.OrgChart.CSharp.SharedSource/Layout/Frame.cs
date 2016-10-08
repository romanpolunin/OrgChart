using System;
using System.Diagnostics;
using Staffer.OrgChart.Annotations;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// A rectangular frame in the diagram logical coordinate space,
    /// with its shape and connectors.
    /// </summary>
    [DebuggerDisplay("{Exterior.Left}:{Exterior.Top}, {Exterior.Size.Width}x{Exterior.Size.Height}")]
    public class Frame
    {
        /// <summary>
        /// Exterior bounds of this frame.
        /// </summary>
        public Rect Exterior;

        /// <summary>
        /// Exterior vertical boundaries of the layout row of siblings of this frame.
        /// </summary>
        public Dimensions SiblingsRowV;

        /// <summary>
        /// Connectors to dependent objects.
        /// </summary>
        [CanBeNull]
        public Connector Connector;

        /// <summary>
        /// Resets content to start a fresh layout.
        /// Does not modify size of the <see cref="Exterior"/>.
        /// </summary>
        public void ResetLayout()
        {
            Exterior = new Rect(new Point(), Exterior.Size);
            Connector = null;
            SiblingsRowV = Dimensions.MinMax();
        }
    }

    /// <summary>
    /// Edges of a bunch of siblings on vertical or horizontal axis.
    /// </summary>
    public struct Dimensions
    {
        /// <summary>
        /// Min value.
        /// </summary>
        public readonly double From;
        /// <summary>
        /// Max value.
        /// </summary>
        public readonly double To;

        /// <summary>
        /// Ctr.
        /// </summary>
        public static Dimensions MinMax()
        {
            return new Dimensions(double.MaxValue, double.MinValue);
        }
        
        /// <summary>
        /// Ctr.
        /// </summary>
        public Dimensions(double from, double to)
        {
            From = from;
            To = to;
        }

        /// <summary>
        /// Computes combined dimension.
        /// </summary>
        public static Dimensions operator +(Dimensions x, Dimensions y)
        {
            return new Dimensions(Math.Min(x.From, y.From), Math.Max(x.To, y.To));
        }
    }
}
