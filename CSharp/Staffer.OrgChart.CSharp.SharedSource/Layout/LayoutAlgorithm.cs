using System;
using System.Linq;
using Staffer.OrgChart.Misc;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Applies layout.
    /// </summary>
    public static class LayoutAlgorithm
    {
        /// <summary>
        /// Computes bounding rectangle in diagram space.
        /// Useful for rendering the chart, as boxes frequently go into negative side horizontally, and have a special root box on top - all of those should not be accounted for.
        /// </summary>
        public static Rect ComputeVisualBoundingRect([NotNull]Tree<int, Box> visualTree)
        {
            if (visualTree.Roots.Count != 1)
            {
                throw new InvalidOperationException("Visual tree is not initialized");
            }

            var left = double.MaxValue;
            var right = double.MinValue;
            var top = double.MaxValue;
            var bottom = double.MinValue;

            visualTree.IterateParentFirst(node =>
            {
                if (node.Level == 0)
                {
                    // system root is not accounted for
                    return true;
                }

                var box = node.Element;
                var topleft = box.Frame.Exterior.TopLeft;
                left = Math.Min(left, topleft.X);
                top = Math.Min(top, topleft.Y);

                var bottomRight = box.Frame.Exterior.BottomRight;
                right = Math.Max(right, bottomRight.X);
                bottom = Math.Max(bottom, bottomRight.Y);

                return !box.IsCollapsed;
            });

            return new Rect(left, top, right - left, bottom - top);
        }

        /// <summary>
        /// Initializes <paramref name="state"/> and performs all layout operations.
        /// </summary>
        public static void Apply([NotNull]LayoutState state)
        {
            // verify the root
            if (state.Diagram.Boxes.SystemRoot == null)
            {
                throw new InvalidOperationException("SystemRoot is not initialized on the box container");
            }

            state.CurrentOperation = LayoutState.Operation.Preparing;

            var tree = Tree<int, Box>.Build(state.Diagram.Boxes.BoxesById.Values, x => x.Id, x => x.VisualParentId);

            // verify the root
            if (tree.Roots.Count != 1 || tree.Roots[0].Element.Id != state.Diagram.Boxes.SystemRoot.Id)
            {
                throw new Exception("SystemRoot is not on the top of the visual tree");
            }

            // set the tree 
            tree.UpdateHierarchyStats();
            state.AttachVisualTree(tree);

            if (state.BoxSizeFunc != null)
            {
                // apply box sizes
                foreach (var box in state.Diagram.Boxes.BoxesById.Values.Where(x => x.IsDataBound))
                {
                    box.Frame.Exterior = new Rect(state.BoxSizeFunc(box.DataId));
                }
            }

            state.CurrentOperation = LayoutState.Operation.VerticalLayout;
            VerticalLayout(state, tree.Roots[0]);

            state.CurrentOperation = LayoutState.Operation.HorizontalLayout;
            HorizontalLayout(state, tree.Roots[0]);

            state.CurrentOperation = LayoutState.Operation.ConnectorsLayout;
            RouteConnectors(state);

            state.Diagram.VisualTree = state.VisualTree;

            state.CurrentOperation = LayoutState.Operation.Completed;
        }

        /// <summary>
        /// Re-entrant layout algorithm,
        /// </summary>
        public static void HorizontalLayout([NotNull]LayoutState state, [NotNull]Tree<int, Box>.TreeNode branchRoot)
        {
            if (true == branchRoot.ParentNode?.Element.IsCollapsed)
            {
                return;
            }

            var level = state.PushLayoutLevel(branchRoot);
            try
            {
                level.EffectiveLayoutStrategy.ApplyHorizontalLayout(state, level);
            }
            finally
            {
                state.PopLayoutLevel();
            }
        }

        /// <summary>
        /// Re-entrant layout algorithm.
        /// </summary>
        public static void VerticalLayout([NotNull]LayoutState state, [NotNull]Tree<int, Box>.TreeNode branchRoot)
        {
            if (true == branchRoot.ParentNode?.Element.IsCollapsed)
            {
                return;
            }

            var level = state.PushLayoutLevel(branchRoot);
            try
            {
                level.EffectiveLayoutStrategy.ApplyVerticalLayout(state, level);
            }
            finally
            {
                state.PopLayoutLevel();
            }
        }

        private static void RouteConnectors([NotNull]LayoutState state)
        {
            if (state.VisualTree == null)
            {
                throw new InvalidOperationException("Visual tree not attached");
            }

            state.VisualTree.IterateParentFirst(node =>
            {
                if (node.Element.IsCollapsed)
                {
                    return false;
                }

                if (!node.Element.IsAutoGenerated)
                {
                    var layoutStrategy = state.RequireLayoutStrategy(node);
                    layoutStrategy.RouteConnectors(state, node);
                }

                return true;
            });
        }

        /// <summary>
        /// Moves a given branch horizontally, except its root box.
        /// </summary>
        public static void MoveChildrenOnly([NotNull]LayoutState state, LayoutState.LayoutLevel layoutLevel, double offset)
        {
            foreach (var child in layoutLevel.BranchRoot.Children)
            {
                Tree<int, Box>.TreeNode.IterateChildFirst(child,
                    node =>
                    {
                        var rect = node.Element.Frame.Exterior;
                        node.Element.Frame.Exterior = new Rect(new Point(rect.TopLeft.X + offset, rect.TopLeft.Y),
                            rect.Size);
                        return true;
                    });
            }

            layoutLevel.Boundary.ReloadFromBranch(state.Diagram.Boxes.BoxesById);
        }

        /// <summary>
        /// Moves a given branch horizontally, including its root box.
        /// </summary>
        public static void MoveBranch([NotNull]LayoutState state, LayoutState.LayoutLevel layoutLevel, double offset)
        {
            Tree<int, Box>.TreeNode.IterateChildFirst(layoutLevel.BranchRoot,
                node =>
                {
                    var rect = node.Element.Frame.Exterior;
                    node.Element.Frame.Exterior = new Rect(new Point(rect.TopLeft.X + offset, rect.TopLeft.Y),
                        rect.Size);
                    return true;
                });

            layoutLevel.Boundary.ReloadFromBranch(state.Diagram.Boxes.BoxesById);
        }
    }
}