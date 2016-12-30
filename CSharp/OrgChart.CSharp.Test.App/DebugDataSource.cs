/*
 * Copyright (c) Roman Polunin 2016. 
 * MIT license, see https://opensource.org/licenses/MIT. 
*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Windows.Storage;
using Newtonsoft.Json.Linq;
using OrgChart.Layout;
using OrgChart.Test;

namespace OrgChart.CSharp.Test.App
{
    public class DebugDataSource : IChartDataSource
    {
        public async Task Load()
        {
            var text = await FileIO.ReadTextAsync(await StorageFile.GetFileFromPathAsync(
                @"C:\Users\roman.roman-PC\Videos\Data.json"));
            var data = JArray.Parse(text);

            Parsed = data.Select(x => new TestDataItem
            {
                Id = x["Node"]["Id"].ToString(),
                ParentId = x["Node"]["ParentId"].ToString(),
                String1 = x["Org"]["Org"]["Name"].ToString()
            }).ToDictionary(x => x.Id);
        }

        public Dictionary<string, TestDataItem> Parsed { get; set; }

        public IEnumerable<string> AllDataItemIds
        {
            get { return Parsed.Keys; }
        }

        public Func<string, string> GetParentKeyFunc
        {
            get { return x => Parsed[x].ParentId; }
        }

        public Func<string, IChartDataItem> GetDataItemFunc
        {
            get { return x => Parsed[x]; }
        }

        public async Task ApplyState(BoxContainer boxContainer)
        {
            var text = await FileIO.ReadTextAsync(await StorageFile.GetFileFromPathAsync(
                @"C:\Users\roman.roman-PC\Videos\Data2.json"));
            var data = JObject.Parse(text);

            foreach (JProperty prop in ((JObject)data["entries"]).Properties())
            {
                var rec = ((JArray)prop.Value)[0];
                var dataId = rec["value"]["dataId"].ToString();
                if (!string.IsNullOrEmpty(dataId))
                {
                    var idvalue = rec["value"]["layoutStrategyId"];
                    if (idvalue != null)
                    {
                        boxContainer.BoxesByDataId[dataId].LayoutStrategyId = idvalue.ToString();
                    }
                }
            }
        }
    }
}
