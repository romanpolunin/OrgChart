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
        public readonly float X;
        /// <summary>
        /// Y-coordinate.
        /// </summary>
        public readonly float Y;

        /// <summary>
        /// Ctr.
        /// </summary>
        public Point(float x, float y)
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
        public readonly float Width;
        /// <summary>
        /// Y-coordinate.
        /// </summary>
        public readonly float Height;

        /// <summary>
        /// Ctr.
        /// </summary>
        public Size(float w, float h)
        {
            Width = w;
            Height = h;
        }
    }
}