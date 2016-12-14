using System;
using System.Collections.Generic;
using Staffer.OrgChart.Annotations;
using Staffer.OrgChart.Layout;

namespace Staffer.OrgChart.Test
{
    /// <summary>
    /// Test data generator utility.
    /// </summary>
    public class TestDataGen
    {
        /// <summary>
        /// Adds some data items into supplied <paramref name="dataSource"/>.
        /// </summary>
        public void GenerateDataItems([NotNull] TestDataSource dataSource, int count)
        {
            foreach (var item in GenerateRandomDataItems(count))
            {
                dataSource.Items.Add(item.Id, item);
            }
        }

        private IEnumerable<TestDataItem> GenerateRandomDataItems(int itemCount)
        {
            if (itemCount < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(itemCount), itemCount, "Count must be zero or positive");
            }

            var random = new Random(0);

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
                var layerSize = 20 + prevLayerSize + random.Next(prevLayerSize * 2);
                for (var i = firstInLayer; i < firstInLayer + layerSize && i < itemCount; i++)
                {
                    var parentIndex = firstInLayer - 1 - random.Next(prevLayerSize);
                    items[i].ParentId = items[parentIndex].Id;
                }

                firstInLayer = firstInLayer + layerSize;
                prevLayerSize = layerSize;
            }

            // now shuffle the items a bit, to prevent clients from assuming that data always comes in hierarchical order
            for (var i = 0; i < items.Count/2; i++)
            {
                var from = random.Next(items.Count);
                var to = random.Next(items.Count);
                var temp = items[from];
                items[from] = items[to];
                items[to] = temp;
            }

            // now mark up to one quarter of the boxes as assistants
            for (var i = 0; i < items.Count/4; i++)
            {
                var k = random.Next(items.Count);
                items[k].IsAssistant = true;
            }

            foreach (var item in items)
            {
                yield return item;
            }
        }

        /// <summary>
        /// Some random box sizes.
        /// </summary>
        public static void GenerateBoxSizes([NotNull] BoxContainer boxContainer)
        {
            const int minWidth = 50;
            const int minHeight = 50;
            const int widthVariation = 50;
            const int heightVariation = 50;

            var random = new Random(0);
            foreach (var box in boxContainer.BoxesById.Values)
            {
                box.Frame.Exterior = box.IsSpecial
                    ? new Rect(new Size(minWidth, minHeight))
                    : new Rect(new Size(minWidth + random.Next(widthVariation), minHeight + random.Next(heightVariation)));
            }
        }
    }
}