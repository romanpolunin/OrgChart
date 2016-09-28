using System;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Base class for all chart layout strategies.
    /// </summary>
    public abstract class LayoutStrategyBase
    {
        /// <summary>
        /// Minimum distance between a parent box and any child box.
        /// </summary>
        public float ParentChildSpacing = 50;

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyVerticalLayout([NotNull] Tree<int, Box>.TreeNode node, [NotNull] LayoutState state, LayoutState.LayoutLevel level);

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyHorizontalLayout([NotNull] Tree<int, Box>.TreeNode box, [NotNull] LayoutState state, LayoutState.LayoutLevel level);
    }

    /// <summary>
    /// Arranges child boxes in a single line under the parent.
    /// Can be configured to position parent in the middle, on the left or right from children.
    /// </summary>
    public class LinearLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout(Tree<int, Box>.TreeNode node, LayoutState state, LayoutState.LayoutLevel level)
        {
            var layoutStrategy = level.EffectiveLayoutStrategy;

            var top = node.Element.Frame.Exterior.BottomRight.Y + layoutStrategy.ParentChildSpacing;

            foreach (var child in node.Children)
            {
                var rect = child.Element.Frame.Exterior;

                child.Element.Frame.Exterior = new Rect(rect.TopLeft.X, top, rect.Size.Width, rect.Size.Height);
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout(Tree<int, Box>.TreeNode box, LayoutState state, LayoutState.LayoutLevel level)
        {
            //throw new System.NotImplementedException();
        }
    }

}