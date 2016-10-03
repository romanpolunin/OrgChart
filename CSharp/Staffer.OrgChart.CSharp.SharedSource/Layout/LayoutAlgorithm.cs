using System;
using System.Linq;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Applies layout.
    /// </summary>
    public static class LayoutAlgorithm
    {
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

            // apply box sizes
            foreach (var box in state.Diagram.Boxes.BoxesById.Values.Where(x => x.IsDataBound))
            {
                box.Frame.Exterior = new Rect(state.BoxSizeFunc(box.DataId));
            }

            state.CurrentOperation = LayoutState.Operation.VerticalLayout;
            VerticalLayout(state, tree.Roots[0]);

            state.CurrentOperation = LayoutState.Operation.HorizontalLayout;
            HorizontalLayout(state, tree.Roots[0]);

            state.CurrentOperation = LayoutState.Operation.Completed;
        }

        /// <summary>
        /// Re-entrant layout algorithm,
        /// </summary>
        public static void HorizontalLayout([NotNull]LayoutState state, [NotNull]Tree<int, Box>.TreeNode branchRoot)
        {
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

        /// <summary>
        /// Moves a given branch horizontally.
        /// Adjusts coordinates of each box in the branch, and also left/right edges of the associated boundary.
        /// </summary>
        public static void FixHorizontalOverlap([NotNull]LayoutState state, [NotNull] LayoutState.LayoutLevel layoutLevel, double overlap)
        {
            if (overlap <= 0)
            {
                return;
            }

            overlap += state.Diagram.LayoutSettings.BranchSpacing;

            Tree<int, Box>.TreeNode.IterateChildFirst(layoutLevel.BranchRoot,
                node =>
                {
                    var rect = node.Element.Frame.Exterior;
                    node.Element.Frame.Exterior = new Rect(new Point(rect.TopLeft.X + overlap, rect.TopLeft.Y), rect.Size);
                    return true;
                });

            var boundary = layoutLevel.Boundary;
            for (var i = 0; i < boundary.Left.Count; i++)
            {
                var step = boundary.Left[i];
                if (step.BoxId != Box.None)
                {
                    boundary.Left[i] = new Boundary.Step(step.BoxId, step.X + overlap);
                }

                step = boundary.Right[i];
                if (step.BoxId != Box.None)
                {
                    boundary.Right[i] = new Boundary.Step(step.BoxId, step.X + overlap);
                }
            }
        }

        private static void RouteConnectors([NotNull]LayoutState state)
        {
            throw new NotImplementedException();
        }
    }
}