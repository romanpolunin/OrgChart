namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// A point in the diagram logical coordinate space.
    /// </summary>
    public struct Point
    {
        /// <summary>
        /// X-coordinate.
        /// </summary>
        public readonly double X;
        /// <summary>
        /// Y-coordinate.
        /// </summary>
        public readonly double Y;

        /// <summary>
        /// Ctr.
        /// </summary>
        public Point(double x, double y)
        {
            X = x;
            Y = y;
        }
    }

    /// <summary>
    /// A point in the diagram logical coordinate space.
    /// </summary>
    public struct Size
    {
        /// <summary>
        /// X-coordinate.
        /// </summary>
        public readonly double Width;
        /// <summary>
        /// Y-coordinate.
        /// </summary>
        public readonly double Height;

        /// <summary>
        /// Ctr.
        /// </summary>
        public Size(double w, double h)
        {
            Width = w;
            Height = h;
        }
    }
}