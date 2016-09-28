using System;
using System.Linq;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// Applies layout.
    /// </summary>
    public class LayoutProcessor
    {
        /// <summary>
        /// Runtime state of the layout process, plus all external dependencies.
        /// Cannot be re-used across multiple layout operations.
        /// </summary>
        public LayoutState State { get; }

        /// <summary>
        /// Ctr.
        /// </summary>
        public LayoutProcessor()
        {
            State = new LayoutState();
        }

        /// <summary>
        /// Initializes <see cref="State"/> and performs all layout operations.
        /// </summary>
        public void Apply([NotNull] Diagram diagram, [NotNull] DiagramLayoutSettings diagramLayoutSettings)
        {
            // initialize tree structure
            State.InitVisualTree(Tree<int, Box>.Build(diagram.Boxes.Boxes.Values, x => x.Id, x => x.VisualParentId));

            // apply box sizes
            foreach (var box in diagram.Boxes.Boxes.Values.Where(x => x.IsDataBound))
            {
                box.Frame.Exterior = new Rect(State.SizesFunc(box.DataId));
            }

            // position boxes vertically
            State.VisualTree.IterateChildFirst(VerticalLayout);

            // position boxes horizontally
            State.VisualTree.IterateChildFirst(HorizontalLayout);
        }

        private bool HorizontalLayout(Tree<int, Box>.TreeNode arg)
        {
            
            return true;
        }

        private bool VerticalLayout(Tree<int, Box>.TreeNode arg)
        {
            return true;
        }

        /// <summary>
        /// Changes coordinates of every <see cref="Frame"/> in the <paramref name="diagram"/> so they satisfy <paramref name="diagramLayoutSettings"/>.
        /// </summary>
        public void ApplyToFrames([NotNull] Diagram diagram, [NotNull]DiagramLayoutSettings diagramLayoutSettings)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Changes coordinates of every <see cref="Connector"/> in the <paramref name="diagram"/> so they satisfy <paramref name="diagramLayoutSettings"/>.
        /// </summary>
        public void ApplyToConnectors([NotNull] Diagram diagram, [NotNull]DiagramLayoutSettings diagramLayoutSettings)
        {
            throw new NotImplementedException();
        }
    }
}