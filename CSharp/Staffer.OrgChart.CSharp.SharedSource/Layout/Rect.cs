namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// A rectangle in the diagram logical coordinate space.
    /// </summary>
    public struct Rect
    {
        /// <summary>
        /// Top-left corner.
        /// </summary>
        public readonly Point TopLeft;
        /// <summary>
        /// Computed bottom-right corner.
        /// </summary>
        public Point BottomRight => new Point(TopLeft.X + Size.Width, TopLeft.Y + Size.Height);

        /// <summary>
        /// Size of the rectangle.
        /// </summary>
        public readonly Size Size;

        /// <summary>
        /// Ctr. to help client code prevent naming conflicts with Rect, Point and Size type names.
        /// </summary>
        public Rect(float x, float y, float w, float h)
        {
            TopLeft = new Point(x, y);
            Size = new Size(w, h);
        }

        /// <summary>
        /// Ctr. for case with known location.
        /// </summary>
        public Rect(Point topLeft, Size size)
        {
            TopLeft = topLeft;
            Size = size;
        }

        /// <summary>
        /// Ctr. for case with only the size known.
        /// </summary>
        public Rect(Size size)
        {
            TopLeft = new Point(0, 0);
            Size = size;
        }
    }
}