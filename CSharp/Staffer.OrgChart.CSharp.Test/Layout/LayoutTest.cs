using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Staffer.OrgChart.Layout;
using Staffer.OrgChart.Test;

namespace Staffer.OrgChart.CSharp.Test.Layout
{
    [TestClass]
    public class LayoutTest
    {
        [TestMethod]
        public void TestDataSource()
        {
            var dataSource = new TestDataSource();
            new TestDataGen().GenerateDataItems(dataSource, 10);

            var boxContainer = new BoxContainer(dataSource);

            Assert.AreEqual(dataSource.Items.Count, boxContainer.BoxesById.Count);
            var rootCount1 = dataSource.Items.Values.Count(x => x.ParentId == null);
            var rootCount2 = boxContainer.BoxesById.Values.Count(x => x.ParentId == 0);
            Assert.AreEqual(1, rootCount1);
            Assert.AreEqual(1, rootCount2);
        }

        [TestMethod]
        public void TestLayout()
        {
            var dataSource = new TestDataSource();
            new TestDataGen().GenerateDataItems(dataSource, 10);

            var boxContainer = new BoxContainer(dataSource);
            TestDataGen.GenerateBoxSizes(boxContainer);

            var diagram = new Diagram();
            diagram.Boxes = boxContainer;

            diagram.LayoutSettings.LayoutStrategies.Add("default", new LinearLayoutStrategy());
            diagram.LayoutSettings.DefaultLayoutStrategyId = "default";

            var state = new LayoutState(diagram)
            {
                BoxSizeFunc = dataId => boxContainer.BoxesByDataId[dataId].Frame.Exterior.Size
            };

            LayoutAlgorithm.Apply(state);

            Assert.AreEqual(5, diagram.VisualTree?.Depth);
        }
    }
}
