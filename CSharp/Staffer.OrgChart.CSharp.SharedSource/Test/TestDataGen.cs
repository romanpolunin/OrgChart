using System;
using System.Collections.Generic;
using System.Diagnostics;
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
                var layerSize = 5 + prevLayerSize + random.Next(prevLayerSize * 2);
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

            // now mark first five boxes 
            for (var i = 0; i < Math.Max(1, items.Count/10); i++)
            {
                items[i].IsAssistant = true;
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

            var seed = 0;//Environment.TickCount;
            Debug.WriteLine(seed.ToString());
            var random = new Random(seed);
            foreach (var box in boxContainer.BoxesById.Values)
            {
                if (!box.IsSpecial)
                {
                    box.Frame.Exterior = new Rect(new Size(minWidth + random.Next(widthVariation), minHeight + random.Next(heightVariation)));
                }
            }
        }
    }
}