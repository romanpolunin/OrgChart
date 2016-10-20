using System;
using Staffer.OrgChart.Annotations;
using Staffer.OrgChart.Misc;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Arranges child boxes in a single line under the parent.
    /// Can be configured to position parent in the middle, on the left or right from children.
    /// </summary>
    public class LinearLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// A chance for layout strategy to append special auto-generated boxes into the visual tree. 
        /// </summary>
        public override void PreProcessThisNode([NotNull]LayoutState state, [NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node)
        {
            var normalChildCount = node.ChildCount;
            if (normalChildCount > 0)
            {
                var nodeState = node.RequireState();
                nodeState.SiblingsCount = node.Element.IsCollapsed ? 0 : normalChildCount;

                // only add spacers for non-collapsed boxes
                if (!node.Element.IsCollapsed)
                {
                    var verticalSpacer = Box.Special(Box.None, node.Element.Id);
                    node.AddChild(verticalSpacer);

                    var horizontalSpacer = Box.Special(Box.None, node.Element.Id);
                    node.AddChild(horizontalSpacer);
                }
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;

            if (node.Level == 0)
            {
                node.Element.Frame.SiblingsRowV = new Dimensions(node.Element.Frame.Exterior.Top, node.Element.Frame.Exterior.Bottom);
            }

            if (!node.HaveState)
            {
                return;
            }

            var siblingsRowExterior = Dimensions.MinMax();
            var nodeState = node.RequireState();
            if (nodeState.SiblingsCount == 0)
            {
                return;
            }

            for (var i = 0; i < nodeState.SiblingsCount; i++)
            {
                var child = node.Children[i];
                var rect = child.Element.Frame.Exterior;

                var top = node.Element.Frame.SiblingsRowV.To + ParentChildSpacing;
                child.Element.Frame.Exterior = new Rect(
                    rect.Left,
                    top,
                    rect.Size.Width,
                    rect.Size.Height);

                siblingsRowExterior += new Dimensions(top, top + rect.Size.Height);
            }

            siblingsRowExterior = new Dimensions(siblingsRowExterior.From, siblingsRowExterior.To);

            for (var i = 0; i < nodeState.SiblingsCount; i++)
            {
                var child = node.Children[i];
                child.Element.Frame.SiblingsRowV = siblingsRowExterior;

                // re-enter layout algorithm for child branch
                LayoutAlgorithm.VerticalLayout(state, child);
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;

            if (!node.HaveState)
            {
                return;
            }

            var nodeState = node.RequireState();

            if (nodeState.SiblingsCount == 0)
            {
                return;
            }

            for (var i = 0; i < nodeState.SiblingsCount; i++)
            {
                var child = node.Children[i];
                // re-enter layout algorithm for child branch
                LayoutAlgorithm.HorizontalLayout(state, child);
            }

            if (ParentAlignment == BranchParentAlignment.Center)
            {
                var rect = node.Element.Frame.Exterior;
                var leftmost = node.Children[0].Element.Frame.Exterior.CenterH;
                var rightmost = node.Children[nodeState.SiblingsCount - 1].Element.Frame.Exterior.CenterH;
                var desiredCenter = leftmost + (rightmost - leftmost)/2;
                var center = rect.CenterH;
                var diff = center - desiredCenter;
                LayoutAlgorithm.MoveChildrenOnly(state, level, diff);

                if (node.Level > 0)
                {
                    // vertical connector from parent 
                    var verticalSpacerBox = node.Children[nodeState.SiblingsCount].Element;
                    verticalSpacerBox.Frame.Exterior = new Rect(
                        center - ParentConnectorShield/2,
                        rect.Bottom,
                        ParentConnectorShield,
                        node.Children[0].Element.Frame.SiblingsRowV.From - rect.Bottom);

                    state.MergeSpacer(verticalSpacerBox);

                    // horizontal protector
                    var firstInRow = node.Children[0].Element.Frame;

                    var horizontalSpacerBox = node.Children[nodeState.SiblingsCount + 1].Element;
                    horizontalSpacerBox.Frame.Exterior = new Rect(
                        firstInRow.Exterior.Left,
                        firstInRow.SiblingsRowV.From - ParentChildSpacing,
                        node.Children[nodeState.SiblingsCount - 1].Element.Frame.Exterior.Right - firstInRow.Exterior.Left,
                        ParentChildSpacing);

                    state.MergeSpacer(horizontalSpacerBox);
                }
            }
            else
            {
                throw new InvalidOperationException("Invalid ParentAlignment setting");
            }
        }

        /// <summary>
        /// Allocates and routes connectors.
        /// </summary>
        public override void RouteConnectors([NotNull] LayoutState state, [NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node)
        {
            if (!node.HaveState)
            {
                return;
            }

            var normalChildCount = node.RequireState().SiblingsCount;

            var count = normalChildCount == 0
                ? 0 // no visible children = no edges
                : normalChildCount == 1
                    ? 1 // one child = one direct edge between parent and child
                    : 1 // one downward edge for parent 
                      + 1 // one for horizontal carrier
                      + normalChildCount; // one upward edge for each child

            if (count == 0)
            {
                node.Element.Frame.Connector = null;
                return;
            }

            var segments = new Edge[count];

            var rootRect = node.Element.Frame.Exterior;
            var center = rootRect.CenterH;

            if (node.Children == null)
            {
                throw new Exception("State is present, but children not set");
            }

            if (count == 1)
            {
                segments[0] = new Edge(new Point(center, rootRect.Bottom),
                    new Point(center, node.Children[0].Element.Frame.Exterior.Top));
            }
            else
            {
                var space = node.Children[0].Element.Frame.SiblingsRowV.From - rootRect.Bottom;

                segments[0] = new Edge(new Point(center, rootRect.Bottom),
                    new Point(center, rootRect.Bottom + space - ChildConnectorHookLength));

                for (var i = 0; i < normalChildCount; i++)
                {
                    var childRect = node.Children[i].Element.Frame.Exterior;
                    var childCenter = childRect.CenterH;
                    segments[1 + i] = new Edge(new Point(childCenter, childRect.Top),
                        new Point(childCenter, childRect.Top - ChildConnectorHookLength));
                }

                segments[count - 1] = new Edge(
                    new Point(segments[1].To.X, segments[1].To.Y),
                    new Point(segments[count-2].To.X, segments[1].To.Y));
            }

            node.Element.Frame.Connector = new Connector(segments);
        }
    }
}