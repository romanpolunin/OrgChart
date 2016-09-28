using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Staffer.OrgChart.Layout.CSharp;

namespace Staffer.OrgChart.CSharp.Test.Layout
{
    [TestClass]
    public class LayoutTest
    {
        [TestMethod]
        public void TestDataSource()
        {
            var dataSource = new TestDataSource();
            new TestDataGen().GenerateDataItems(dataSource);

            var boxContainer = new BoxContainer(dataSource);

            Assert.AreEqual(dataSource.Items.Count, boxContainer.Boxes.Count);
            var rootCount1 = dataSource.Items.Values.Count(x => x.ParentId == null);
            var rootCount2 = boxContainer.Boxes.Values.Count(x => x.VisualParentId == 0);
            Assert.AreEqual(1, rootCount1);
            Assert.AreEqual(1, rootCount2);
        }
    }
}
