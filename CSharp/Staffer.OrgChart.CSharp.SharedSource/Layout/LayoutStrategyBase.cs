using Staffer.OrgChart.Annotations;
using Staffer.OrgChart.Misc;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Alignment of a parent box above children nodes.
    /// </summary>
    public enum BranchParentAlignment
    {
        /// <summary>
        /// Default value is invalid, do not use it.
        /// </summary>
        InvalidValue = 0,
        /// <summary>
        /// Put parent on the left side of children.
        /// </summary>
        Left,
        /// <summary>
        /// Put parent in the middle above children.
        /// </summary>
        Center,
        /// <summary>
        /// Put parent on the right side of children.
        /// </summary>
        Right
    }

    /// <summary>
    /// Base class for all chart layout strategies.
    /// </summary>
    public abstract class LayoutStrategyBase
    {
        /// <summary>
        /// Alignment of the parent box above child boxes.
        /// </summary>
        public BranchParentAlignment ParentAlignment;

        /// <summary>
        /// Minimum distance between a parent box and any child box.
        /// </summary>
        public double ParentChildSpacing = 20;

        /// <summary>
        /// Width of the area used to protect long vertical segments of connectors.
        /// </summary>
        public double ParentConnectorShield = 50;

        /// <summary>
        /// Minimum distance between two sibling boxes.
        /// </summary>
        public double SiblingSpacing = 20;

        /// <summary>
        /// Length of the small angled connector segment entering every child box.
        /// </summary>
        public double ChildConnectorHookLength = 5;

        /// <summary>
        /// A chance for layout strategy to insert special auto-generated boxes into the visual tree. 
        /// </summary>
        public abstract void PreProcessThisNode([NotNull] LayoutState state, [NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node);

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyVerticalLayout([NotNull] LayoutState state, LayoutState.LayoutLevel level);

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyHorizontalLayout([NotNull] LayoutState state, LayoutState.LayoutLevel level);

        /// <summary>
        /// Allocates and routes connectors.
        /// </summary>
        public abstract void RouteConnectors([NotNull]LayoutState state, [NotNull]Tree<int, Box, NodeLayoutInfo>.TreeNode node);
    }
}