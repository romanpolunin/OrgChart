using System;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Base class for all chart layout strategies.
    /// </summary>
    public abstract class LayoutStrategyBase
    {
        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyVerticalLayout([NotNull]Box box, [NotNull]LayoutState state);

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public abstract void ApplyHorizontalLayout([NotNull]Box box, [NotNull]LayoutState state);
    }

    /// <summary>
    /// Arranges child boxes in a single line under the parent.
    /// Can be configured to position parent in the middle, on the left or right from children.
    /// </summary>
    public class LinearLayoutStrategy : LayoutStrategyBase
    {
        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyVerticalLayout(Box box, LayoutState state)
        {
            var layoutStrategy = state.Diagram.LayoutSettings.LayoutStrategies[box.LayoutStrategyId];
            throw new NotImplementedException();
        }

        /// <summary>
        /// Applies layout changes to a given box and its children.
        /// </summary>
        public override void ApplyHorizontalLayout(Box box, LayoutState state)
        {
            throw new System.NotImplementedException();
        }
    }

}