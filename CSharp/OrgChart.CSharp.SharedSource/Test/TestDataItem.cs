using System;
using OrgChart.Annotations;
using OrgChart.Layout;

namespace OrgChart.Test
{
    /// <summary>
    /// A data item wrapper.
    /// </summary>
    public class TestDataItem : IChartDataItem
    {
        /// <summary>
        /// Data item id.
        /// </summary>
        [NotNull]
        public string Id { get; set; }
        /// <summary>
        /// <c>True</c> if corresponding box should be rendered as assistant.
        /// </summary>
        public bool IsAssistant { get; set; }
        /// <summary>
        /// Optional identifier of the parent data item.
        /// </summary>
        [CanBeNull]
        public string ParentId { get; set; }
        /// <summary>
        /// Some string field.
        /// </summary>
        [CanBeNull]
        public string String1 { get; set; }
        /// <summary>
        /// Some string field.
        /// </summary>
        [CanBeNull]
        public string String2 { get; set; }
        /// <summary>
        /// Some date-time field.
        /// </summary>
        public DateTime Date1 { get; set; }
    }
}