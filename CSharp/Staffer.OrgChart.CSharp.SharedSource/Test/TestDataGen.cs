using System;
using System.Collections.Generic;
using Staffer.OrgChart.Layout.CSharp;

namespace Staffer.OrgChart.CSharp.Test.Layout
{
    /// <summary>
    /// Test data generator utility.
    /// </summary>
    public class TestDataGen
    {
        /// <summary>
        /// Adds some data items into supplied <paramref name="dataSource"/>.
        /// </summary>
        public void GenerateDataItems([NotNull] TestDataSource dataSource)
        {
            foreach (var item in GenerateRandomDataItems())
            {
                dataSource.Items.Add(item.Id, item);
            }
        }

        private IEnumerable<TestDataItem> GenerateRandomDataItems()
        {
            var random = new Random(0);

            var itemCount = 1000;
            var items = new List<TestDataItem>(itemCount);
            for (var i = 0; i < itemCount; i++)
            {
                items.Add(new TestDataItem
                {
                    Id = i.ToString()
                });
            }

            var firstInLayer = 1;
            var prevLayerSize = 1;
            while (firstInLayer < itemCount)
            {
                var layerSize = prevLayerSize + random.Next(prevLayerSize * 2);
                for (var i = firstInLayer; i < firstInLayer + layerSize && i < itemCount; i++)
                {
                    var parentIndex = firstInLayer - 1 - random.Next(prevLayerSize);
                    items[i].ParentId = items[parentIndex].Id;
                }

                firstInLayer = firstInLayer + layerSize;
                prevLayerSize = layerSize;
            }

            foreach (var item in items)
            {
                yield return item;
            }
        }

        private void GenerateBoxes([NotNull] BoxContainer boxContainer)
        {
            const int minWidth = 50;
            const int minHeight = 30;

            var random = new Random(Environment.TickCount);
            for (var i = 0; i < 1000; i++)
            {
                var size = new Point(minWidth + random.Next(200), minHeight + random.Next(200));
                //boxContainer.AddBox().Frame.Exterior = new Rect(size);
            }
        }
    }
}