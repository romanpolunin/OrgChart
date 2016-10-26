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
        public int NumberOfSiblings;

        /// <summary>
        /// Number of sibling rows. Used by strategies that arrange box's immediate children into more than one line.
        /// Meaning of "row" may differ.
        /// </summary>
        public int NumberOfSiblingRows;

        /// <summary>
        /// Number of sibling columns. Used by strategies that arrange box's immediate children into more than one column.
        /// Meaning of "column" may differ, e.g. it may include one or more boxes per each logical row.
        /// </summary>
        public int NumberOfSiblingColumns;

        /// <summary>
        /// Number of non-special child boxes with <see cref="Box.IsDataBound"/>
        /// </summary>
        public int NumberOfAssistants;

        private LayoutStrategyBase m_effectiveLayoutStrategy;
    }
}