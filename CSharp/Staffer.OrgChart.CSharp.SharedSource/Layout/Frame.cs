using System.Diagnostics;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// A rectangular frame in the diagram logical coordinate space,
    /// with its shape and connectors.
    /// </summary>
    [DebuggerDisplay("{Exterior.TopLeft.X}:{Exterior.TopLeft.Y}, {Exterior.Size.Width}x{Exterior.Size.Height}")]
    public class Frame
    {
        /// <summary>
        /// Exterior bounds of this frame.
        /// </summary>
        public Rect Exterior;

        /// <summary>
        /// Connectors to dependent objects.
        /// </summary>
        [CanBeNull]
        public Connector Connector;
    }
}
