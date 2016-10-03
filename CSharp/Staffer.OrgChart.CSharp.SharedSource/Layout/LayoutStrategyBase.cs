namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Alignment of a parent box above children nodes.
    /// </summary>
    public enum BranchParentAlignment
    {
        InvalidValue = 0,
        Left,
        Center,
        Right
    }

    /// <summary>
    /// Base class for all chart layout strategies.
    /// </summary>
    public abstract class LayoutStrategyBase
    {
        /// <summary>
        /// Minimum distance between a parent box and any child box.
        /// </summary>
        public double ParentChildSpacing = 20;

        /// <summary>
        /// Minimum distance between two sibling boxes.
        /// </summary>
        public double SiblingSpacing = 20;

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyVerticalLayout([NotNull] LayoutState state, LayoutState.LayoutLevel level);

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyHorizontalLayout([NotNull] LayoutState state, LayoutState.LayoutLevel level);
    }
}