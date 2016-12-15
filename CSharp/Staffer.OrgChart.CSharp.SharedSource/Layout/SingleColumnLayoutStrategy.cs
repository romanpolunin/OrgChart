using System;
using System.Collections.Generic;
using Staffer.OrgChart.Annotations;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Arranges child boxes in a single vertical column under the parent, 
    /// somewhat offset to the left or to the right, depending on <see cref="LayoutStrategyBase.ParentAlignment"/>.
    /// Cannot be configured to position parent in the middle of children.
    /// Children are attached to a central vertical carrier going from parent's bottom.
    /// </summary>
    public class SingleColumnLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// A chance for layout strategy to append special auto-generated boxes into the visual tree. 
        /// </summary>
        public override void PreProcessThisNode([NotNull]LayoutState state, [NotNull] BoxTree.TreeNode node)
        {
            if (ParentAlignment != BranchParentAlignment.Left
                && ParentAlignment != BranchParentAlignment.Right)
            {
                throw new InvalidOperationException("Unsupported value for " + nameof(ParentAlignment));
            }

            node.State.NumberOfSiblings = node.Element.IsCollapsed ? 0 : node.ChildCount;

            // only add spacers for non-collapsed boxes
            if (node.State.NumberOfSiblings > 0 && node.Level > 0)
            {
                // add one (for vertical spacer) into the count of layout columns
                node.State.NumberOfSiblingColumns = 1;
                node.State.NumberOfSiblingRows = node.ChildCount;

                // add parent's vertical carrier to the end
                var verticalSpacer = Box.Special(Box.None, node.Element.Id, false);
                node.AddRegularChild(verticalSpacer);
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

            var prevRowExterior = node.Element.Frame.SiblingsRowV;

            for (var row = 0; row < node.State.NumberOfSiblings; row++)
            {
                // first, compute
                var child = node.Children[row];
                var rect = child.Element.Frame.Exterior;

                var top = prevRowExterior.To + ParentChildSpacing;
                child.Element.Frame.Exterior = new Rect(
                    rect.Left,
                    top,
                    rect.Size.Width,
                    rect.Size.Height);
                child.Element.Frame.BranchExterior = child.Element.Frame.Exterior;

                var rowExterior = new Dimensions(top, top + rect.Size.Height);

                child = node.Children[row];
                child.Element.Frame.SiblingsRowV = rowExterior;

                // re-enter layout algorithm for child branch
                LayoutAlgorithm.VerticalLayout(state, child);

                var childBranchBottom = child.Element.Frame.BranchExterior.Bottom;

                prevRowExterior = new Dimensions(rowExterior.From, Math.Max(childBranchBottom, rowExterior.To));
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout([NotNull] LayoutState state, LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;

            var nodeState = node.State;

            // first, perform horizontal layout for every node in this column
            for (var row = 0; row < nodeState.NumberOfSiblings; row++)
            {
                var child = node.Children[row];

                // re-enter layout algorithm for child branch
                // siblings are guaranteed not to offend each other
                LayoutAlgorithm.HorizontalLayout(state, child);
            }

            // now align the column
            var edges = LayoutAlgorithm.AlignHorizontalCenters(state, level, EnumerateColumn(node));

            if (node.Level > 0)
            {
                var rect = node.Element.Frame.Exterior;
                double diff;
                if (ParentAlignment == BranchParentAlignment.Left)
                {
                    var desiredLeft = rect.CenterH + ParentConnectorShield/2;
                    diff = desiredLeft - edges.From;
                }
                else if (ParentAlignment == BranchParentAlignment.Right)
                {
                    var desiredRight = rect.CenterH - ParentConnectorShield/2;
                    diff = desiredRight - edges.To;
                }
                else
                {
                    throw new InvalidOperationException("Invalid ParentAlignment setting");
                }

                // vertical connector from parent
                LayoutAlgorithm.MoveChildrenOnly(state, level, diff);

                // spacer for the vertical carrier 
                var verticalSpacerBox = node.Level > 0 ? node.Children[node.ChildCount - 1].Element : null;
                if (verticalSpacerBox != null)
                {
                    var spacerTop = node.Element.Frame.Exterior.Bottom;
                    var spacerBottom = node.Children[node.ChildCount - 2].Element.Frame.Exterior.Bottom;
                    verticalSpacerBox.Frame.Exterior = new Rect(
                        rect.CenterH - ParentConnectorShield/2,
                        spacerTop,
                        ParentConnectorShield,
                        spacerBottom - spacerTop);
                    verticalSpacerBox.Frame.BranchExterior = verticalSpacerBox.Frame.Exterior;
                    state.MergeSpacer(verticalSpacerBox);
                }
            }
        }

        private IEnumerable<BoxTree.TreeNode> EnumerateColumn(BoxTree.TreeNode branchRoot)
        {
            for (var i = 0; i < branchRoot.State.NumberOfSiblings; i++)
            {
                yield return branchRoot.Children[i];
            }
        }

        /// <summary>
        /// Allocates and routes connectors.
        /// </summary>
        public override void RouteConnectors([NotNull] LayoutState state, [NotNull] BoxTree.TreeNode node)
        {
            // one parent connector (also serves as mid-sibling carrier) and horizontal carriers
            var count = 1 + node.State.NumberOfSiblings;

            var segments = new Edge[count];

            var rootRect = node.Element.Frame.Exterior;
            var center = rootRect.CenterH;

            var verticalCarrierHeight = node.Children[node.State.NumberOfSiblings - 1].Element.Frame.Exterior.CenterV - node.Element.Frame.Exterior.Bottom;

            // big vertical connector, from parent to last row
            segments[0] = new Edge(new Point(center, rootRect.Bottom), new Point(center, rootRect.Bottom + verticalCarrierHeight));

            for (var ix = 0; ix < node.State.NumberOfSiblings; ix++)
            {
                var rect = node.Children[ix].Element.Frame.Exterior;
                var destination = ParentAlignment == BranchParentAlignment.Left ? rect.Left : rect.Right;
                segments[1 + ix] = new Edge(
                    new Point(center, rect.CenterV),
                    new Point(destination, rect.CenterV));
            }

            node.Element.Frame.Connector = new Connector(segments);
        }
    }
}