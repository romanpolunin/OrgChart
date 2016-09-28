using System;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Applies layout.
    /// </summary>
    public class LayoutProcessor
    {
        /// <summary>
        /// Changes coordinates of every <see cref="Frame"/> in the <paramref name="diagram"/> so they satisfy <paramref name="diagramLayoutSettings"/>.
        /// </summary>
        public void ApplyToFrames([NotNull] Diagram diagram, [NotNull]DiagramLayoutSettings diagramLayoutSettings)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Changes coordinates of every <see cref="Connector"/> in the <paramref name="diagram"/> so they satisfy <paramref name="diagramLayoutSettings"/>.
        /// </summary>
        public void ApplyToConnectors([NotNull] Diagram diagram, [NotNull]DiagramLayoutSettings diagramLayoutSettings)
        {
            throw new NotImplementedException();
        }
    }
}