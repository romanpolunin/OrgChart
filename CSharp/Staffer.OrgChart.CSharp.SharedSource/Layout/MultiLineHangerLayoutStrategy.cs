using Staffer.OrgChart.Misc;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Arranges child boxes in a single line under the parent.
    /// Can be configured to position parent in the middle, on the left or right from children.
    /// </summary>
    public class MultiLineHangerLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// Maximum number of sibling child boxes in a single row.
        /// Excess is wrapped to next lines.
        /// </summary>
        public int MaxSiblingsPerRow;

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;
            if (!node.Element.IsCollapsed && node.Children.Count > 0)
            {
                var top = node.Element.Frame.Exterior.Bottom + ParentChildSpacing;

                var countInRow = 0;
                foreach (var child in node.Children)
                {
                    var rect = child.Element.Frame.Exterior;

                    child.Element.Frame.Exterior = new Rect(rect.Left, top, rect.Size.Width, rect.Size.Height);

                    // re-enter layout algorithm for child branch
                    LayoutAlgorithm.VerticalLayout(state, child);

                    countInRow++;

                    if (countInRow == MaxSiblingsPerRow)
                    {
                        countInRow = 0;
                        //top = 
                    }
                }
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;

            if (!node.Element.IsCollapsed && node.Children.Count > 0)
            {
                foreach (var child in node.Children)
                {
                    // re-enter layout algorithm for child branch
                    LayoutAlgorithm.HorizontalLayout(state, child);
                }

                if (ParentAlignment == BranchParentAlignment.Center)
                {
                    var rect = node.Element.Frame.Exterior;
                    var leftmost = node.Children[0].Element.Frame.Exterior.Left;
                    var rightmost = node.Children[node.Children.Count - 1].Element.Frame.Exterior.Right;
                    var desiredCenter = leftmost + (rightmost - leftmost)/2;
                    var center = rect.Left + rect.Size.Width/2;
                    var diff = center - desiredCenter;
                    LayoutAlgorithm.MoveChildrenOnly(state, level, diff);
                }
            }
        }

        /// <summary>
        /// Allocates and routes connectors.
        /// </summary>
        public override void RouteConnectors([NotNull] LayoutState state, [NotNull] Tree<int, Box>.TreeNode node)
        {
            var count = node.Children.Count == 0
                ? 0 // no children = no edges
                : node.Children.Count == 1
                    ? 1 // one child = one direct edge between parent and child
                    : 1 // one downward edge for parent 
                      + 1 // one for horizontal carrier
                      + node.Children.Count; // one upward edge for each child

            if (count == 0)
            {
                node.Element.Frame.Connector = null;
                return;
            }

            var segments = new Edge[count];

            var rootRect = node.Element.Frame.Exterior;
            var center = rootRect.Left + rootRect.Size.Width / 2;
            var height = node.Children[0].Element.Frame.Exterior.Top - rootRect.Bottom;

            if (count == 1)
            {
                segments[0] = new Edge(new Point(center, rootRect.Bottom),
                    new Point(center, rootRect.Bottom + height));
            }
            else
            {
                height = height/2;

                segments[0] = new Edge(new Point(center, rootRect.Bottom),
                    new Point(center, rootRect.Bottom + height));

                for (var i = 0; i < node.Children.Count; i++)
                {
                    var childRect = node.Children[i].Element.Frame.Exterior;
                    var childCenter = childRect.Left + childRect.Size.Width / 2;
                    segments[1 + i] = new Edge(new Point(childCenter, childRect.Top),
                        new Point(childCenter, childRect.Top - height));
                }

                segments[count - 1] = new Edge(
                    new Point(segments[1].To.X, segments[1].To.Y),
                    new Point(segments[count-2].To.X, segments[1].To.Y));
            }

            node.Element.Frame.Connector = new Connector(segments);
        }
    }
}