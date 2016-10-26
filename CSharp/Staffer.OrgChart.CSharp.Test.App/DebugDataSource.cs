using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Windows.Storage;
using Newtonsoft.Json.Linq;
using Staffer.OrgChart.Layout;
using Staffer.OrgChart.Test;

namespace Staffer.OrgChart.CSharp.Test.App
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
    }
}
