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

    /// <summary>
    /// Arranges child boxes in a single line under the parent.
    /// Can be configured to position parent in the middle, on the left or right from children.
    /// </summary>
    public class LinearLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout(LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;
            var top = node.Element.Frame.Exterior.BottomRight.Y + ParentChildSpacing;

            foreach (var child in node.Children)
            {
                var rect = child.Element.Frame.Exterior;

                child.Element.Frame.Exterior = new Rect(rect.TopLeft.X, top, rect.Size.Width, rect.Size.Height);
            }

            foreach (var child in node.Children)
            {
                // re-enter layout algorithm for child branch
                LayoutAlgorithm.VerticalLayout(state, child);
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout(LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;
            //var leftmost = double.MaxValue;
            //var rightmost = double.MinValue;

            for (var i = 0; i < node.Children.Count; i++)
            {
                var child = node.Children[i];

                var rect = child.Element.Frame.Exterior;
                var leftEdge = i == 0 ? node.Element.Frame.Exterior.TopLeft.X : node.Children[i - 1].Element.Frame.Exterior.BottomRight.X + SiblingSpacing;
                child.Element.Frame.Exterior = new Rect(new Point(leftEdge, rect.TopLeft.Y), rect.Size);

                // re-enter layout algorithm for child branch
                LayoutAlgorithm.HorizontalLayout(state, child);
            }
        }
    }

}