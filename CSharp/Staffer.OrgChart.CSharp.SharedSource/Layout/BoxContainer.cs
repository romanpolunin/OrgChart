using System.Collections.Generic;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// A container for a bunch of <see cref="Box"/> objects. Defines scope of uniqueness of their identifiers.
    /// Used by <see cref="LayoutState"/> when computing boxes.
    /// </summary>
    public class BoxContainer
    {
        private int m_lastBoxId;
        private readonly Dictionary<int, Box> m_boxesById = new Dictionary<int, Box>();
        private readonly Dictionary<string, Box> m_boxesByDataId = new Dictionary<string, Box>();

        /// <summary>
        /// Access to internal collection of boxes.
        /// </summary>
        public IReadOnlyDictionary<int, Box> BoxesById => m_boxesById;

        /// <summary>
        /// Access to internal collection of boxes.
        /// </summary>
        public IReadOnlyDictionary<string, Box> BoxesByDataId => m_boxesByDataId;

        /// <summary>
        /// Auto-generated system root box. Added to guarantee a single-root hierarchy.
        /// </summary>
        [CanBeNull]
        public Box SystemRoot { get; set; }

        /// <summary>
        /// Ctr.
        /// </summary>
        public BoxContainer()
        {
        }

        /// <summary>
        /// Ctr. for case with readily available data source.
        /// </summary>
        public BoxContainer([NotNull]IChartDataSource source)
        {
            ReloadBoxes(source);
        }

        /// <summary>
        /// Wipes out and re-loads boxes collection from the data store.
        /// </summary>
        public void ReloadBoxes([NotNull]IChartDataSource source)
        {
            m_boxesByDataId.Clear();
            m_boxesById.Clear();
            m_lastBoxId = 0;

            // generate system root box, 
            // but don't add it to the list of boxes yet
            SystemRoot = new Box(++m_lastBoxId, true);
            
            // add data-bound boxes
            foreach (var dataId in source.AllDataItemIds)
            {
                AddBox(dataId);
            }

            // initialize hierarchy links
            foreach (var box in m_boxesById.Values)
            {
                var parentDataId = string.IsNullOrEmpty(box.DataId) ? null : source.GetParentKeyFunc(box.DataId);
                box.VisualParentId = string.IsNullOrEmpty(parentDataId) ? SystemRoot.Id : m_boxesByDataId[parentDataId].Id;
            }

            // now add the root
            m_boxesById.Add(SystemRoot.Id, SystemRoot);
        }

        /// <summary>
        /// Creates a new <see cref="Box"/> and adds it to collection.
        /// </summary>
        /// <param name="dataId">Optional identifier of the external data item</param>
        /// <returns>Newly created Box object</returns>
        public Box AddBox(string dataId)
        {
            var box = new Box(NextBoxId(), dataId);
            m_boxesById.Add(box.Id, box);
            if (!string.IsNullOrEmpty(dataId))
            {
                m_boxesByDataId.Add(box.DataId, box);
            }

            return box;
        }

        /// <summary>
        /// Generates a new identifier for a <see cref="Box"/>.
        /// </summary>
        public int NextBoxId()
        {
            m_lastBoxId++;
            return m_lastBoxId;
        }
    }
}