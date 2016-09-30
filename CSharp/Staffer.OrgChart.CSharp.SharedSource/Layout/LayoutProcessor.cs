using System;
using System.Linq;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Applies layout.
    /// </summary>
    public static class LayoutProcessor
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

            var tree = Tree<int, Box>.Build(state.Diagram.Boxes.Boxes.Values, x => x.Id, x => x.VisualParentId);

            // verify the root
            if (tree.Roots.Count != 1 || tree.Roots[0].Element.Id != state.Diagram.Boxes.SystemRoot.Id)
            {
                throw new Exception("SystemRoot is not on the top of the visual tree");
            }

            // set the tree 
            tree.UpdateHierarchyStats();
            state.AttachVisualTree(tree);

            // apply box sizes
            foreach (var box in state.Diagram.Boxes.Boxes.Values.Where(x => x.IsDataBound))
            {
                box.Frame.Exterior = new Rect(state.BoxSizeFunc(box.DataId));
            }

            VerticalLayout(state, tree.Roots[0]);
            HorizontalLayout(state, tree.Roots[0]);
        }

        /// <summary>
        /// Re-entrant layout algorithm,
        /// </summary>
        public static void HorizontalLayout(LayoutState state, Tree<int, Box>.TreeNode branchRoot)
        {
            if (branchRoot.Children.Count == 0)
            {
                // boxes which don't have children do not need any special layout
                return;
            }

            var level = state.PushLayoutLevel(branchRoot);
            try
            {
                level.EffectiveLayoutStrategy.ApplyHorizontalLayout(branchRoot, state, level);
            }
            finally
            {
                state.PopLayoutLevel();
            }
        }

        /// <summary>
        /// Re-entrant layout algorithm.
        /// </summary>
        public static void VerticalLayout(LayoutState state, Tree<int, Box>.TreeNode branchRoot)
        {
            if (branchRoot.Children.Count == 0)
            {
                // boxes which don't have children do not need any special layout
                return;
            }

            var level = state.PushLayoutLevel(branchRoot);
            try
            {
                level.EffectiveLayoutStrategy.ApplyVerticalLayout(branchRoot, state, level);
            }
            finally
            {
                state.PopLayoutLevel();
            }
        }

        private static void RouteConnectors([NotNull]LayoutState state)
        {
            throw new NotImplementedException();
        }
    }
}