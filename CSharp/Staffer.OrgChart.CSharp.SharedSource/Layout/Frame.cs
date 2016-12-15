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
        /// External boundaries of this branch, updated by <see cref="LayoutAlgorithm"/> 
        /// after each merge of <see cref="Boundary"/> containing children boxes.
        /// </summary>
        public Rect BranchExterior;

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
            BranchExterior = Exterior;
            Connector = null;
            SiblingsRowV = Dimensions.MinMax();
        }

        /// <summary>
        /// Copies data from another frame.
        /// </summary>
        /// <param name="other"></param>
        public void CopyExterior([NotNull]Frame other)
        {
            Exterior = other.Exterior;
            BranchExterior = other.BranchExterior;
            SiblingsRowV = other.SiblingsRowV;
        }
    }
}
