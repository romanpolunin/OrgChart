using System;
using System.Diagnostics;
using Staffer.OrgChart.Annotations;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// A box in some <see cref="Diagram"/>. Has <see cref="Frame"/> and layout-related config such as <see cref="LayoutStrategyId"/>.
    /// This is a purely visual object, created based on underlying chart's data.
    /// </summary>
    [DebuggerDisplay("{Id}, {Frame.Exterior.Left}:{Frame.Exterior.Top}, {Frame.Exterior.Size.Width}x{Frame.Exterior.Size.Height}")]
    public class Box
    {
        /// <summary>
        /// Value to be used for box identifier to indicate an absent box.
        /// </summary>
        public const int None = -1;

        /// <summary>
        /// Identifier of this box. Unique in the scope of the parent <see cref="BoxContainer"/>.
        /// </summary>
        public readonly int Id;
        /// <summary>
        /// Identifier of the parent box, usually driven by corresponding relationship between underlying data items.
        /// This parent is for the visual connections and arrangement of children boxes with their parents.
        /// </summary>
        public readonly int ParentId;

        /// <summary>
        /// Identifier of some externally provided data item for which this box was created.
        /// Can be null for auto-generated boxes and manually added boxes.
        /// </summary>
        [CanBeNull] public readonly string DataId;

        /// <summary>
        /// This box has been auto-generated for layout purposes,
        /// so it can be deleted and re-created as needed.
        /// Special boxes are usually not stored in the <see cref="BoxContainer"/> (except <see cref="BoxContainer.SystemRoot"/>).
        /// </summary>
        public readonly bool IsSpecial;

        /// <summary>
        /// If <c>true</c>, this box has to be rendered using a special layout strategy directly under the parent.
        /// Assistants are always on top of other siblinbgs.
        /// </summary>
        /// <seealso cref="IChartDataItem.IsAssistant"/>
        public readonly bool IsAssistant;

        /// <summary>
        /// <c>False</c> (default) to enable collision detection for this box,
        /// e.g. whether it can make impact on <see cref="Boundary"/>.
        /// </summary>
        public readonly bool DisableCollisionDetection;

        /// <summary>
        /// Layout strategy that should be used to apply layout on this Box and its children.
        /// References an element in <see cref="DiagramLayoutSettings.LayoutStrategies"/>.
        /// If <c>null</c>, use settings.
        /// </summary>
        [CanBeNull] public string LayoutStrategyId;

        /// <summary>
        /// Bounding box.
        /// </summary>
        [NotNull] public readonly Frame Frame;

        /// <summary>
        /// When <c>true</c>, layout operations can be applied only to this box.
        /// Its children will not participate in the layout.
        /// </summary>
        public bool IsCollapsed;
        
        /// <summary>
        /// When <c>true</c>, this box and its children will not participate in the layout.
        /// Is automatically set to <c>true</c> when any parent upwards is <see cref="IsCollapsed"/>.
        /// </summary>
        public bool AffectsLayout;
        
        /// <summary>
        /// <c>true</c> is this box is bound to some data item.
        /// </summary>
        public bool IsDataBound => !string.IsNullOrEmpty(DataId);

        /// <summary>
        /// Ctr. for normal and data-bound boxes.
        /// </summary>
        public Box([CanBeNull]string dataId, int id, int parentId, bool isAssistant) : this(dataId, id, parentId, false, false, isAssistant)
        {
        }

        /// <summary>
        /// Ctr. for auto-generated boxes.
        /// </summary>
        [NotNull]
        public static Box Special(int id, int visualParentId, bool disableCollisionDetection)
        {
            return new Box(null, id, visualParentId, true, disableCollisionDetection, false);
        }

        private Box([CanBeNull] string dataId, int id, int parentId, bool isSpecial, bool disableCollisionDetection, bool isAssistant)
        {
            if (id == 0)
            {
                throw new ArgumentOutOfRangeException(nameof(id));
            }

            Id = id;
            ParentId = parentId;
            DataId = dataId;
            Frame = new Frame();
            IsSpecial = isSpecial;
            IsAssistant = isAssistant;
            AffectsLayout = true;
            DisableCollisionDetection = disableCollisionDetection;
        }
    }
}