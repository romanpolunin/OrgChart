using System;
using System.Collections.Generic;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Layout settings bound per-frame.
    /// </summary>
    public class DiagramLayoutSettings
    {
        /// <summary>
        /// All unique layout strategies (semantically similar to CSS style sheets) referenced by sub-trees in the diagram.
        /// </summary>
        [NotNull] public IReadOnlyDictionary<string, LayoutStrategyBase> LayoutStrategies { get; }

        /// <summary>
        /// Optional explicitly specified default layout strategy to use for root boxes with <see cref="Box.LayoutStrategyId"/> set to <c>null</c>.
        /// If <c>null</c> or invalid, <see cref="RequireDefaultLayoutStrategy"/> will throw up.
        /// </summary>
        [CanBeNull] public string DefaultLayoutStrategyId { get; }

        /// <summary>
        /// Ctr.
        /// </summary>
        public DiagramLayoutSettings()
        {
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