using System;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Arranges child boxes in a single line under the parent.
    /// Can be configured to position parent in the middle, on the left or right from children.
    /// </summary>
    public class LinearLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// Alignment of the parent box above child boxes.
        /// </summary>
        public BranchParentAlignment ParentAlignment;

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

            if (node.Children.Count > 0)
            {
                for (var i = 0; i < node.Children.Count; i++)
                {
                    var child = node.Children[i];

                    // re-enter layout algorithm for child branch
                    LayoutAlgorithm.HorizontalLayout(state, child);
                }

                if (ParentAlignment == BranchParentAlignment.Center)
                {
                    var rect = node.Element.Frame.Exterior;
                    var leftmost = node.Children[0].Element.Frame.Exterior.TopLeft.X;
                    var rightmost = node.Children[node.Children.Count - 1].Element.Frame.Exterior.BottomRight.X;
                    var desiredCenter = leftmost + (rightmost - leftmost)/2;

                    var newRect = new Rect(new Point(desiredCenter - rect.Size.Width/2, rect.TopLeft.Y), rect.Size);
                    node.Element.Frame.Exterior = newRect;

                    for (var i = 0; i < level.Boundary.Left.Count; i++)
                    {
                        var left = level.Boundary.Left[i];
                        var right = level.Boundary.Right[i];
                        if (node.Element.Id == left.BoxId && left.BoxId == right.BoxId)
                        {
                            level.Boundary.Left[i] = new Boundary.Step(node.Element.Id, node.Element.VisualParentId, newRect.TopLeft.X);
                            level.Boundary.Right[i] = new Boundary.Step(node.Element.Id, node.Element.VisualParentId, newRect.BottomRight.X);
                        }
                    }
                }
            }
        }
    }
}