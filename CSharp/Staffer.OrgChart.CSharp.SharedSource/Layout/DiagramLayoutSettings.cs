using System;
using System.Collections.Generic;
using Staffer.OrgChart.Annotations;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Layout settings bound per-frame.
    /// </summary>
    public class DiagramLayoutSettings
    {
        private double m_resolution;
        private double m_branchSpacing;

        /// <summary>
        /// All unique layout strategies (semantically similar to CSS style sheets) referenced by sub-trees in the diagram.
        /// </summary>
        [NotNull] public Dictionary<string, LayoutStrategyBase> LayoutStrategies { get; }

        /// <summary>
        /// Optional explicitly specified default layout strategy to use for root boxes with <see cref="Box.LayoutStrategyId"/> set to <c>null</c>.
        /// If <c>null</c> or invalid, <see cref="RequireDefaultLayoutStrategy"/> will throw up.
        /// </summary>
        [CanBeNull] public string DefaultLayoutStrategyId { get; set; }

        /// <summary>
        /// Minimum space between boxes that belong to different branches.
        /// </summary>
        public double BranchSpacing
        {
            get { return m_branchSpacing; }
            set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), value, "Cannot be negative");
                }
                m_branchSpacing = value;
            }
        }

        /// <summary>
        /// Resolution of the Z-buffer used by layout algorithm.
        /// Indicates number of logical coordinate units per step of the scan grid.
        /// The smaller is this number, the more precise is the process of detecting collisions between boxes,
        /// larger values will lead to some unnecessary gaps being added - algorithm becomes overly sensitive.
        /// </summary>
        public double Resolution
        {
            get { return m_resolution; }
            set
            {
                if (value < 1.0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value));
                }
                m_resolution = value;
            }
        }

        /// <summary>
        /// Ctr.
        /// </summary>
        public DiagramLayoutSettings()
        {
            Resolution = 5;
            BranchSpacing = 50;
            LayoutStrategies = new Dictionary<string, LayoutStrategyBase>();
        }

        /// <summary>
        /// Layout strategy to be used for root boxes with <see cref="Box.LayoutStrategyId"/> set to <c>null</c>.
        /// </summary>
        /// <exception cref="InvalidOperationException"><see cref="DefaultLayoutStrategyId"/> is null or not valid</exception>
        public LayoutStrategyBase RequireDefaultLayoutStrategy()
        {
            LayoutStrategyBase result;
            if (string.IsNullOrEmpty(DefaultLayoutStrategyId)
                || !LayoutStrategies.TryGetValue(DefaultLayoutStrategyId, out result))
            {
                throw new InvalidOperationException(nameof(DefaultLayoutStrategyId) + " is null or not valid");
            }

            return result;
        }
    }
}