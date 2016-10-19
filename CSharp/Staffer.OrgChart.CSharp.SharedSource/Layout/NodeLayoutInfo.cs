using System;
using Staffer.OrgChart.Annotations;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Additional information attached to every box in the nodes of visual tree.
    /// </summary>
    public class NodeLayoutInfo
    {
        /// <summary>
        /// Effective layout strategy, derived from settings or inherited from parent.
        /// </summary>
        public LayoutStrategyBase EffectiveLayoutStrategy
        {
            [NotNull]
            set { m_effectiveLayoutStrategy = value; }
        }

        /// <summary>
        /// Returns value of <see cref="EffectiveLayoutStrategy"/>, throws if <c>null</c>.
        /// </summary>
        [NotNull]
        public LayoutStrategyBase RequireLayoutStrategy()
        {
            if (m_effectiveLayoutStrategy == null)
            {
                throw new Exception(nameof(EffectiveLayoutStrategy) + " is not set");
            }

            return m_effectiveLayoutStrategy;
        }

        /// <summary>
        /// Number of visible children in this node's immediate children list
        /// that are affecting each other as siblings during layout.
        /// Some special auto-generated spacer boxes may not be included into this number,
        /// those are manually merged into the <see cref="Boundary"/> after other boxes are ready.
        /// </summary>
        public int SiblingsCount;

        /// <summary>
        /// Number of sibling rows. Used by strategies that arrange box's immediate children in more than one line.
        /// </summary>
        public int NumberOfSiblingRows;

        /// <summary>
        /// Number of sibling columns. Used by strategies that arrange box's immediate children in more than one column.
        /// </summary>
        public int NumberOfSiblingColumns;

        /// <summary>
        /// External boundaries of this branch, updated by <see cref="LayoutAlgorithm"/> 
        /// after each merge of <see cref="Boundary"/> containing children boxes.
        /// </summary>
        public Rect BranchExterior;

        private LayoutStrategyBase m_effectiveLayoutStrategy;
    }
}