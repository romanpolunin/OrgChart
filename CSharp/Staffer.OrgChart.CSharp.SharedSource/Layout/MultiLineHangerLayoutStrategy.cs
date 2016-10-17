using System;
using Staffer.OrgChart.Annotations;
using Staffer.OrgChart.Misc;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Arranges child boxes in a single line under the parent.
    /// Can be configured to position parent in the middle, on the left or right from children.
    /// </summary>
    public class MultiLineHangerLayoutStrategy : LinearLayoutStrategy
    {
        /// <summary>
        /// Maximum number of siblings in a horizontal row.
        /// </summary>
        public int MaxSiblingsPerRow = 4;
        
        /// <summary>
        /// A chance for layout strategy to append special auto-generated boxes into the visual tree. 
        /// </summary>
        public override void PreProcessThisNode([NotNull]LayoutState state, [NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node)
        {
            if (MaxSiblingsPerRow <= 0 || MaxSiblingsPerRow%2 != 0)
            {
                throw new InvalidOperationException(nameof(MaxSiblingsPerRow) + " must be a positive even value");
            }

            if (node.ChildCount <= MaxSiblingsPerRow)
            {
                // fall back to linear layout, only have one row of boxes
                base.PreProcessThisNode(state, node);
                return;
            }

            if (node.ChildCount > 0)
            {
                var nodeState = node.RequireState();
                nodeState.SiblingsCount = node.ChildCount;

                // only add spacers for non-collapsed boxes under system root
                if (node.Level > 0 && !node.Element.IsCollapsed)
                {
                    var lastRowBoxCount = node.ChildCount%MaxSiblingsPerRow;

                    // add one (for vertical spacer) into the count of layout columns
                    nodeState.NumberOfSiblingColumns = 1 + MaxSiblingsPerRow;

                    nodeState.NumberOfSiblingRows = node.ChildCount/MaxSiblingsPerRow;
                    if (lastRowBoxCount != 0)
                    {
                        nodeState.NumberOfSiblingRows++;
                    }

                    // include vertical spacers into the count of layout siblings
                    nodeState.SiblingsCount = node.ChildCount + nodeState.NumberOfSiblingRows;
                    if (lastRowBoxCount > 0 && lastRowBoxCount <= MaxSiblingsPerRow/2)
                    {
                        // don't need the last spacer, last row is half-full or even less
                        nodeState.SiblingsCount--;
                    }

                    if (nodeState.SiblingsCount == 0)
                    {
                        throw new Exception();
                    }

                    // sibling middle-spacers have to be inserted between siblings
                    var ix = MaxSiblingsPerRow/2;
                    while (ix < nodeState.SiblingsCount)
                    {
                        var siblingSpacer = Box.Special(Box.None, node.Element.Id);
                        node.InsertChild(ix, siblingSpacer);
                        ix += nodeState.NumberOfSiblingColumns;
                    }

                    // add parent vertical spacer to the end
                    var verticalSpacer = Box.Special(Box.None, node.Element.Id);
                    node.AddChild(verticalSpacer);

                    // add horizontal spacers to the end
                    for (var i = 0; i < nodeState.NumberOfSiblingRows; i++)
                    {
                        var horizontalSpacer = Box.Special(Box.None, node.Element.Id);
                        node.AddChild(horizontalSpacer);
                    }
                }
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            if (level.BranchRoot.ChildCount <= MaxSiblingsPerRow)
            {
                // fall back to linear layout, only have one row of boxes
                base.ApplyVerticalLayout(state, level);
                return;
            }

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

                var nodeState = node.RequireState();

                var prevRowExterior = node.Element.Frame.SiblingsRowV;

                for (var row = 0; row < nodeState.NumberOfSiblingRows; row++)
                {
                    var siblingsRowExterior = Dimensions.MinMax();

                    var from = row*nodeState.NumberOfSiblingColumns;
                    var to = Math.Min(from + nodeState.NumberOfSiblingColumns, nodeState.SiblingsCount);
                    for (var i = from; i < to; i++)
                    {
                        var child = node.Children[i];
                        if (child.Element.IsSpecial)
                        {
                            // skip vertical spacers for now
                            continue;
                        }

                        var rect = child.Element.Frame.Exterior;

                        var top = prevRowExterior.To + ParentChildSpacing;
                        child.Element.Frame.Exterior = new Rect(
                            rect.Left,
                            top,
                            rect.Size.Width,
                            rect.Size.Height);

                        siblingsRowExterior += new Dimensions(top, top + rect.Size.Height);
                    }

                    siblingsRowExterior = new Dimensions(siblingsRowExterior.From, siblingsRowExterior.To + state.Diagram.LayoutSettings.BoxVerticalMargin);

                    // now assign size to the vertical spacer
                    var spacerIndex = (to - from > nodeState.NumberOfSiblingColumns/2) ? from + nodeState.NumberOfSiblingColumns/2 : -1;
                    if (spacerIndex > -1)
                    {
                        node.Children[spacerIndex].Element.Frame.Exterior = 
                            new Rect(0, siblingsRowExterior.From, ParentConnectorShield, siblingsRowExterior.To - siblingsRowExterior.From);
                    }

                    for (var i = from; i < to; i++)
                    {
                        var child = node.Children[i];
                        child.Element.Frame.SiblingsRowV = siblingsRowExterior;

                        // re-enter layout algorithm for child branch
                        LayoutAlgorithm.VerticalLayout(state, child);
                    }

                    prevRowExterior = siblingsRowExterior;
                }
            }
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            if (level.BranchRoot.ChildCount <= MaxSiblingsPerRow)
            {
                // fall back to linear layout, only have one row of boxes
                base.ApplyHorizontalLayout(state, level);
                return;
            }

            var node = level.BranchRoot;

            if (node.ChildCount > 0)
            {
                var nodeState = node.RequireState();

                for (var row = 0; row < nodeState.NumberOfSiblingRows; row++)
                {
                    var from = row * nodeState.NumberOfSiblingColumns;
                    var to = Math.Min(from + nodeState.NumberOfSiblingColumns, nodeState.SiblingsCount);

                    for (var i = from; i < to; i++)
                    {
                        var child = node.Children[i];
                        // re-enter layout algorithm for child branch
                        LayoutAlgorithm.HorizontalLayout(state, child);
                    }
                }

                if (ParentAlignment == BranchParentAlignment.Center)
                {
                    var rect = node.Element.Frame.Exterior;
                    var leftmost = node.Children[0].Element.Frame.Exterior.CenterH;
                    var rightmost = node.Children[Math.Min(nodeState.SiblingsCount - 1, nodeState.NumberOfSiblingColumns - 1)].Element.Frame.Exterior.CenterH;
                    var desiredCenter = leftmost + (rightmost - leftmost)/2;
                    var center = rect.CenterH;
                    var diff = center - desiredCenter;
                    LayoutAlgorithm.MoveChildrenOnly(state, level, diff);

                    // vertical connector from parent
                    var verticalSpacerBox = node.Children[nodeState.SiblingsCount].Element;
                    verticalSpacerBox.Frame.Exterior = new Rect(
                        center - ParentConnectorShield/2,
                        rect.Bottom,
                        ParentConnectorShield,
                        node.Children[0].Element.Frame.SiblingsRowV.From - rect.Bottom);

                    state.MergeSpacer(verticalSpacerBox);

                    // horizontal protectors
                    for (var row = 0; row < nodeState.NumberOfSiblingRows; row++)
                    {
                        var firstInRow = node.Children[row * nodeState.NumberOfSiblingColumns].Element.Frame;
                        var lastInRow = node.Children[Math.Min((row + 1) * nodeState.NumberOfSiblingColumns - 1, nodeState.SiblingsCount - 1)].Element.Frame;

                        var horizontalSpacerBox = node.Children[nodeState.SiblingsCount + row].Element;
                        horizontalSpacerBox.Frame.Exterior = new Rect(
                            firstInRow.Exterior.Left,
                            firstInRow.SiblingsRowV.From - ParentChildSpacing,
                            lastInRow.Exterior.Right - firstInRow.Exterior.Left,
                            ParentChildSpacing);

                        state.MergeSpacer(horizontalSpacerBox);
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
            if (node.ChildCount <= MaxSiblingsPerRow)
            {
                // fall back to linear layout, only have one row of boxes
                base.RouteConnectors(state, node);
                return;
            }

            var childCount = node.ChildCount;
            if (childCount == 0)
            {
                return;
            }

            var nodeState = node.RequireState();

            if (nodeState.SiblingsCount == 0)
            {
                node.Element.Frame.Connector = null;
                return;
            }

            if (node.Children == null)
            {
                throw new Exception("State is present, but children not set");
            }

            // one parent connector (also serves as mid-sibling carrier) and horizontal carriers
            var count = 1 + nodeState.NumberOfSiblingRows;

            foreach (var child in node.Children)
            {
                // normal boxes get one upward hook 
                if (!child.Element.IsSpecial)
                {
                    count++;
                }
            }

            var segments = new Edge[count];

            var rootRect = node.Element.Frame.Exterior;
            var center = rootRect.CenterH;

            var verticalCarrierHeight = node.Children[nodeState.SiblingsCount - 1].Element.Frame.SiblingsRowV.From 
                - ChildConnectorHookLength - rootRect.Bottom;

            // vertical connector from parent to last row
            segments[0] = new Edge(new Point(center, rootRect.Bottom), new Point(center, rootRect.Bottom + verticalCarrierHeight));

            // short hook for each child
            var ix = 1;
            for (var i = 0; i < nodeState.SiblingsCount; i++)
            {
                var child = node.Children[i].Element;
                if (!child.IsSpecial)
                {
                    var childRect = child.Frame.Exterior;
                    var childCenter = childRect.CenterH;
                    segments[ix++] = new Edge(new Point(childCenter, childRect.Top),
                        new Point(childCenter, childRect.Top - ChildConnectorHookLength));
                }
            }

            // horizontal carriers
            for (var firstInRowIndex = 1; firstInRowIndex < count - nodeState.NumberOfSiblingRows; firstInRowIndex += MaxSiblingsPerRow)
            {
                var firstInRow = segments[firstInRowIndex];
                var lastInRow = segments[Math.Min(firstInRowIndex + MaxSiblingsPerRow - 1, count - nodeState.NumberOfSiblingRows - 1)];
                segments[ix++] = new Edge(
                    new Point(firstInRow.To.X, firstInRow.To.Y),
                    new Point(lastInRow.To.X, firstInRow.To.Y));
            }

            node.Element.Frame.Connector = new Connector(segments);
        }
    }
}