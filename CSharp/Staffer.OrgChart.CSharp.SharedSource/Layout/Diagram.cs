namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// A collection of <see cref="Frame"/> and <see cref="Connector"/> objects.
    /// </summary>
    public class Diagram
    {
        /// <summary>
        /// Diagram layout styles.
        /// </summary>
        public DiagramLayoutSettings LayoutSettings { get; }

        /// <summary>
        /// All boxes.
        /// </summary>
        public BoxContainer Boxes { get; private set; }

        /// <summary>
        /// Ctr.
        /// </summary>
        public Diagram()
        {
            LayoutSettings = new DiagramLayoutSettings();
        }

        /// <summary>
        /// Sets collection of boxes in this diagram.
        /// </summary>
        public void SetBoxes([NotNull] BoxContainer boxContainer)
        {
            Boxes = boxContainer;
        }
    }
}