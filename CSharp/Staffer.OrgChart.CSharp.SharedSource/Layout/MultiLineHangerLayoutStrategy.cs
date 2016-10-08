using System;
using Staffer.OrgChart.Annotations;
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
        /// A chance for layout strategy to append special auto-generated boxes into the visual tree. 
        /// </summary>
        public override void PreProcessThisNode(LayoutState state, [NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout([NotNull]LayoutState state, LayoutState.LayoutLevel level)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Allocates and routes connectors.
        /// </summary>
        public override void RouteConnectors([NotNull] LayoutState state, [NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node)
        {
            throw new NotImplementedException();
        }
    }
}