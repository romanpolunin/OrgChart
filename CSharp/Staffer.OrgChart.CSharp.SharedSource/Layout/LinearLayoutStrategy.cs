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
                nodeState.NormalChildCount = normalChildCount;

                if (node.Level > 0 && normalChildCount > 0 && !node.Element.IsCollapsed)
                {
                    var horizontalSpacer = Box.Special(Box.None, node.Element.Id);
                    node.AddChild(horizontalSpacer);

                    var verticalSpacer = Box.Special(Box.None, node.Element.Id);
                    node.AddChild(verticalSpacer);
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

            if (node.ChildCount > 0)
            {
                if (node.Children == null)
                {
                    throw new Exception("State is present, but children not set");
                }
                
                var siblingsRowExterior = Dimensions.MinMax();
                var nodeState = node.RequireState();
                for (var i = 0; i < nodeState.NormalChildCount; i++)
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

                for (var i = 0; i < nodeState.NormalChildCount; i++)
                {
                    var child = node.Children[i];
                    child.Element.Frame.SiblingsRowV = siblingsRowExterior;

                    // re-enter layout algorithm for child branch
                    LayoutAlgorithm.VerticalLayout(state, child);
                }
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;

            if (node.ChildCount > 0)
            {
                var nodeState = node.RequireState();

                for (var i = 0; i < nodeState.NormalChildCount; i++)
                {
                    var child = node.Children[i];
                    // re-enter layout algorithm for child branch
                    LayoutAlgorithm.HorizontalLayout(state, child);
                }

                if (ParentAlignment == BranchParentAlignment.Center)
                {
                    var rect = node.Element.Frame.Exterior;
                    var leftmost = node.Children[0].Element.Frame.Exterior.Left;
                    var rightmost = node.Children[nodeState.NormalChildCount - 1].Element.Frame.Exterior.Right;
                    var desiredCenter = leftmost + (rightmost - leftmost)/2;
                    var center = rect.Left + rect.Size.Width/2;
                    var diff = center - desiredCenter;
                    LayoutAlgorithm.MoveChildrenOnly(state, level, diff);

                    if (node.ChildCount > nodeState.NormalChildCount)
                    {
                        var horizontalSpacerBox = node.Children[nodeState.NormalChildCount].Element;
                        horizontalSpacerBox.Frame.Exterior = new Rect(
                            leftmost + diff,
                            node.Children[0].Element.Frame.SiblingsRowV.From - ParentChildSpacing,
                            rightmost - leftmost,
                            ParentChildSpacing);

                        state.MergeSpacer(horizontalSpacerBox);

                        var verticalSpacerBox = node.Children[nodeState.NormalChildCount + 1].Element;
                        verticalSpacerBox.Frame.Exterior = new Rect(
                            center - ParentConnectorShield/2,
                            rect.Bottom,
                            ParentConnectorShield,
                            horizontalSpacerBox.Frame.Exterior.Top - rect.Bottom);

                        state.MergeSpacer(verticalSpacerBox);
                    }
                }
                else
                {
                    throw new InvalidOperationException("Invalid ParentAlignment setting");
                }
            }
        }

        /// <summary>
        /// Allocates and routes connectors.
        /// </summary>
        public override void RouteConnectors([NotNull] LayoutState state, [NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node)
        {
            var childCount = node.ChildCount;
            if (childCount == 0)
            {
                return;
            }

            var normalChildCount = node.RequireState().NormalChildCount;

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
            var center = rootRect.Left + rootRect.Size.Width / 2;

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
                    var childCenter = childRect.Left + childRect.Size.Width / 2;
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