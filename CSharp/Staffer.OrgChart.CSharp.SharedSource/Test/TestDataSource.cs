using System;
using System.Collections.Generic;
using Staffer.OrgChart.Layout.CSharp;

namespace Staffer.OrgChart.CSharp.Test.Layout
{
    /// <summary>
    /// Test data source implementation.
    /// </summary>
    public class TestDataSource : IChartDataSource
    {
        /// <summary>
        /// All items.
        /// </summary>
        public readonly Dictionary<string, TestDataItem> Items = new Dictionary<string, TestDataItem>();

        /// <summary>
        /// Implementation for <see cref="IChartDataSource.GetParentKeyFunc"/>.
        /// </summary>
        public string GetParentKey([NotNull]string itemId)
        {
            return Items[itemId].ParentId;
        }

        /// <summary>
        /// Access to all data items.
        /// </summary>
        public IEnumerable<string> AllDataItemIds => Items.Keys;

        /// <summary>
        /// Delegate that provides information about parent-child relationship of boxes.
        /// First argument is the underlying data item id.
        /// Return value is the parent data item id.
        /// This one should be implemented by the underlying data source.
        /// </summary>
        public Func<string, string> GetParentKeyFunc => GetParentKey;
    }
}