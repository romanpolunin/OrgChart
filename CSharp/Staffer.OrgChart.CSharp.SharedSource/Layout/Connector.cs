namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// A connector between two <see cref="Frame"/> objects.
    /// </summary>
    public class Connector
    {
        /// <summary>
        /// Ctr.
        /// </summary>
        public Connector([NotNull]Edge[] segments)
        {
            Segments = segments;
        }

        /// <summary>
        /// All individual segments of a connector, sorted from beginning to end.
        /// </summary>
        [NotNull]
        public Edge[] Segments { get; }
    }
}