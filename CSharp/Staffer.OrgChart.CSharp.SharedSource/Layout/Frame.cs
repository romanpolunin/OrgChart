using System.Diagnostics;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// A rectangular frame in the diagram logical coordinate space.
    /// </summary>
    [DebuggerDisplay("{Exterior.TopLeft.X}:{Exterior.TopLeft.Y}, {Exterior.Size.Width}x{Exterior.Size.Height}")]
    public class Frame
    {
        /// <summary>
        /// Exterior bounds of this frame.
        /// </summary>
        public Rect Exterior;
    }
}
