namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Left and right edges of some group of boxes.
    /// </summary>
    public class Boundary
    {
        /// <summary>
        /// Merges another boundary into this one, potentially pushing its edges out.
        /// </summary>
        public void MergeFrom([NotNull]Boundary boundary)
        {
            //throw new System.NotImplementedException();
        }
    }
}