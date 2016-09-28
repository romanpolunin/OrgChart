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
        public abstract void Apply([NotNull]Box box, [NotNull]LayoutState state);
    }
}