using System;
using System.Collections.Generic;
using Staffer.OrgChart.Annotations;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Arranges "assistant" child boxes in a single vertically stretched group, stuffed onto "fish bones" on left and right sides of vertical carrier.
    /// Can only be configured to position parent in the middle of children.
    /// </summary>
    public class FishboneAssistantsLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// A chance for layout strategy to append special auto-generated boxes into the visual tree. 
        /// </summary>
        public override void PreProcessThisNode([NotNull] LayoutState state, [NotNull] BoxTree.TreeNode node)
        {
            if (ParentAlignment != BranchParentAlignment.Center)
            {
                throw new InvalidOperationException("Unsupported value for " + nameof(ParentAlignment));
            }

            node.State.NumberOfSiblings = node.ChildCount;

            // only add spacers for non-collapsed boxes
            if (node.State.NumberOfSiblings > 0)
            {
                // using column == group here, 
                // and each group consists of two vertical stretches of boxes with a vertical carrier in between
                node.State.NumberOfSiblingColumns = 1;
                node.State.NumberOfSiblingRows = node.State.NumberOfSiblings/2;
                if (node.State.NumberOfSiblings%2 != 0)
                {
                    node.State.NumberOfSiblingRows++;
                }

                // a vertical carrier from parent 
                var parentSpacer = Box.Special(Box.None, node.Element.Id, false);
                node.AddRegularChild(parentSpacer);
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout([NotNull] LayoutState state, [NotNull] LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;
            if (node.Level == 0)
            {
                throw new InvalidOperationException("Should never be invoked on root node");
            }

            var prevRowBottom = node.Element.Frame.SiblingsRowV.To;

            var iterator = new GroupIterator(node.State.NumberOfSiblings);
            for (var i = 0; i < iterator.MaxOnLeft; i++)
            {
                var child = node.Children[i];
                var frame = child.Element.Frame;
                var rect = frame.Exterior;
                frame.Exterior = new Rect(rect.Left, prevRowBottom + ParentChildSpacing, rect.Size.Width, rect.Size.Height);

                var rowExterior = new Dimensions(frame.Exterior.Top, frame.Exterior.Bottom);

                var i2 = i + iterator.MaxOnLeft;
                if (i2 < node.State.NumberOfSiblings)
                {
                    var child2 = node.Children[i2];
                    var frame2 = child2.Element.Frame;
                    var rect2 = child2.Element.Frame.Exterior;
                    frame2.Exterior = new Rect(rect2.Left, prevRowBottom + ParentChildSpacing, rect2.Size.Width, rect2.Size.Height);

                    if (frame2.Exterior.Bottom > frame.Exterior.Bottom)
                    {
                        frame.Exterior = new Rect(rect.Left, frame2.Exterior.CenterV - rect.Size.Height/2, rect.Size.Width, rect.Size.Height);
                    }
                    else if (frame2.Exterior.Bottom < frame.Exterior.Bottom)
                    {
                        frame2.Exterior = new Rect(rect2.Left, frame.Exterior.CenterV - rect2.Size.Height/2, rect2.Size.Width, rect2.Size.Height);
                    }

                    frame2.BranchExterior = frame2.Exterior;
                    rowExterior += new Dimensions(frame2.Exterior.Top, frame2.Exterior.Bottom + state.Diagram.LayoutSettings.BoxVerticalMargin);

                    frame2.SiblingsRowV = rowExterior;
                    LayoutAlgorithm.VerticalLayout(state, child2);
                    prevRowBottom = frame2.BranchExterior.Bottom;
                }

                frame.BranchExterior = frame.Exterior;
                frame.SiblingsRowV = rowExterior;
                LayoutAlgorithm.VerticalLayout(state, child);
                prevRowBottom = Math.Max(prevRowBottom, frame.BranchExterior.Bottom);
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout([NotNull] LayoutState state, [NotNull] LayoutState.LayoutLevel level)
        {
            var node = level.BranchRoot;
            if (node.Level == 0)
            {
                node.Element.Frame.SiblingsRowV = new Dimensions(node.Element.Frame.Exterior.Top, node.Element.Frame.Exterior.Bottom);
            }

            var iterator = new GroupIterator(node.State.NumberOfSiblings);

            var left = true;
            var countOnThisSide = 0;
            for (var i = 0; i < node.State.NumberOfSiblings; i++)
            {
                var child = node.Children[i];
                LayoutAlgorithm.HorizontalLayout(state, child);

                // we go top-bottom to layout left side of the group,
                // then add a carrier protector
                // then top-bottom to fill right side of the group
                if (++countOnThisSide == iterator.MaxOnLeft)
                {
                    if (left)
                    {
                        // horizontally align children in left pillar
                        LayoutAlgorithm.AlignHorizontalCenters(state, level, EnumerateSiblings(node, 0, iterator.MaxOnLeft));

                        left = false;
                        countOnThisSide = 0;

                        var rightmost = double.MinValue;
                        for (var k = 0; k < i; k++)
                        {
                            rightmost = Math.Max(rightmost, node.Children[k].Element.Frame.BranchExterior.Right);
                        }

                        // vertical spacer does not have to be extended to the bottom of the lowest branch,
                        // unless the lowest branch on the right side has some children and is expanded
                        if (node.State.NumberOfSiblings % 2 != 0)
                        {
                            rightmost = Math.Max(rightmost, child.Element.Frame.Exterior.Right);
                        }
                        else
                        {
                            var opposite = node.Children[node.State.NumberOfSiblings - 1];
                            if (opposite.Element.IsCollapsed || opposite.ChildCount == 0)
                            {
                                rightmost = Math.Max(rightmost, child.Element.Frame.Exterior.Right);
                            }
                            else
                            {
                                rightmost = Math.Max(rightmost, child.Element.Frame.BranchExterior.Right);
                            }
                        }

                        // integrate protector for group's vertical carrier 
                        var spacer = node.Children[node.State.NumberOfSiblings].Element;
                        spacer.Frame.Exterior = new Rect(
                            rightmost,
                            node.Children[0].Element.Frame.SiblingsRowV.From,
                            state.Diagram.LayoutSettings.BranchSpacing,
                            node.Element.Frame.BranchExterior.Bottom - node.Children[0].Element.Frame.SiblingsRowV.From
                            );
                        spacer.Frame.BranchExterior = spacer.Frame.Exterior;
                        level.Boundary.MergeFrom(spacer);
                    }
                    else
                    {
                        // horizontally align children in right pillar
                        LayoutAlgorithm.AlignHorizontalCenters(state, level, EnumerateSiblings(node, iterator.MaxOnLeft, node.State.NumberOfSiblings));
                    }
                }
            }

            var rect = node.Element.Frame.Exterior;

            if (ParentAlignment == BranchParentAlignment.Center)
            {
                if (node.Level > 0)
                {
                    double diff;
                    var carrier = node.Children[node.State.NumberOfSiblings].Element.Frame.Exterior.CenterH;
                    var desiredCenter = rect.CenterH;
                    diff = desiredCenter - carrier;
                    LayoutAlgorithm.MoveChildrenOnly(state, level, diff);
                }
            }
            else
            {
                throw new InvalidOperationException("Invalid ParentAlignment setting");
            }

            if (node.Level > 0)
            {
                // vertical connector from parent
                var carrier = node.Children[node.State.NumberOfSiblings].Element;
                carrier.Frame.Exterior = new Rect(
                    rect.CenterH - ParentConnectorShield/2,
                    rect.Bottom,
                    ParentConnectorShield,
                    node.Children[0].Element.Frame.SiblingsRowV.From - rect.Bottom);
                carrier.Frame.BranchExterior = carrier.Frame.Exterior;
                state.MergeSpacer(carrier);
            }
        }

        /// <summary>
        /// Allocates and routes connectors.
        /// </summary>
        public override void RouteConnectors([NotNull] LayoutState state, [NotNull] BoxTree.TreeNode node)
        {
            var count = node.State.NumberOfSiblings;

            var segments = new Edge[count];

            var ix = 0;

            // one hook for each child
            var iterator = new GroupIterator(node.State.NumberOfSiblings);
            var carrier = node.Children[node.State.NumberOfSiblings].Element.Frame.Exterior;
            var from = carrier.CenterH;

            var isLeft = true;
            var countOnThisSide = 0;
            for (var i = 0; i < count; i++)
            {
                var to = isLeft ? node.Children[i].Element.Frame.Exterior.Right : node.Children[i].Element.Frame.Exterior.Left;
                var y = node.Children[i].Element.Frame.Exterior.CenterV;
                segments[ix++] = new Edge(new Point(from, y), new Point(to, y));

                if (++countOnThisSide == iterator.MaxOnLeft)
                {
                    countOnThisSide = 0;
                    if (isLeft)
                    {
                        // one for each vertical carrier
                        segments[1 + node.State.NumberOfSiblings] = new Edge(
                            new Point(carrier.CenterH, carrier.Top - ChildConnectorHookLength),
                            new Point(carrier.CenterH, node.Children[i].Element.Frame.Exterior.CenterV));
                    }
                    isLeft = !isLeft;
                }
            }

            node.Element.Frame.Connector = new Connector(segments);
        }

        private class GroupIterator
        {
            public int MaxOnLeft;

            public GroupIterator(int numberOfSiblings)
            {
                MaxOnLeft = numberOfSiblings/2 + numberOfSiblings%2;
            }
        }

        private IEnumerable<BoxTree.TreeNode> EnumerateSiblings(BoxTree.TreeNode node, int from, int to)
        {
            for (var i = from; i < to; i++)
            {
                yield return node.Children[i];
            }
        }
    }
}