using System;
using Staffer.OrgChart.Annotations;
using Staffer.OrgChart.Layout;

namespace Staffer.OrgChart.Test
{
    /// <summary>
    /// A data item wrapper.
    /// </summary>
    public class TestDataItem
    {
        /// <summary>
        /// Data item id.
        /// </summary>
        [NotNull]
        public string Id;
        /// <summary>
        /// Optional identifier of the parent data item.
        /// </summary>
        [CanBeNull]
        public string ParentId;
        /// <summary>
        /// Some string field.
        /// </summary>
        [CanBeNull]
        public string String1;
        /// <summary>
        /// Some string field.
        /// </summary>
        [CanBeNull]
        public string String2;
        /// <summary>
        /// Some date-time field.
        /// </summary>
        [CanBeNull]
        public DateTime Date1;
    }
}