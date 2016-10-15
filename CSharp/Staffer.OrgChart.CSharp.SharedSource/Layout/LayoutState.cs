using System;
using System.Collections.Generic;
using System.Diagnostics;
using Staffer.OrgChart.Annotations;
using Staffer.OrgChart.Misc;

namespace Staffer.OrgChart.Layout
{
    /// <summary>
    /// Holds state for a particular layout operation, 
    /// such as reference to the <see cref="Diagram"/>, current stack of boundaries etc.
    /// </summary>
    public class LayoutState
    {
        /// <summary>
        /// Current layout operation.
        /// </summary>
        public enum Operation
        {
            /// <summary>
            /// No op.
            /// </summary>
            Idle,
            /// <summary>
            /// Making initial preparations, creating visual tree.
            /// </summary>
            Preparing,
            /// <summary>
            /// Pre-layout modifications of the visual tree.
            /// </summary>
            PreprocessVisualTree,
            /// <summary>
            /// Vertical layout in progress.
            /// </summary>
            VerticalLayout,
            /// <summary>
            /// Horizontal layout in progress.
            /// </summary>
            HorizontalLayout,
            /// <summary>
            /// Creating and positioning connectors.
            /// </summary>
            ConnectorsLayout,
            /// <summary>
            /// All layout operations have been completed.
            /// </summary>
            Completed
        }

        /// <summary>
        /// State of the layout operation for a particular level of hierarchy.
        /// </summary>
        [DebuggerDisplay("{BranchRoot.Element.Id}, {Boundary.BoundingRect.Top}..{Boundary.BoundingRect.Bottom}")]
        public struct LayoutLevel
        {
            /// <summary>
            /// Root parent for this subtree.
            /// </summary>
            public readonly Tree<int, Box, NodeLayoutInfo>.TreeNode BranchRoot;
            /// <summary>
            /// Boundaries of this entire subtree.
            /// </summary>
            public readonly Boundary Boundary;

            /// <summary>
            /// Ctr.
            /// </summary>
            public LayoutLevel([NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node, [NotNull] Boundary boundary)
            {
                BranchRoot = node;
                Boundary = boundary;
            }
        }

        /// <summary>
        /// Current operation in progress.
        /// </summary>
        public Operation CurrentOperation
        {
            get { return m_currentOperation; }
            set
            {
                m_currentOperation = value;
                OperationChanged?.Invoke(this, new LayoutStateOperationChangedEventArgs(this));
            }
        }

        /// <summary>
        /// Stack of the layout roots, as algorithm proceeds in depth-first fashion.
        /// Every box has a <see cref="Boundary"/> object associated with it, to keep track of corresponding visual tree's edges.
        /// </summary>
        [NotNull]
        private readonly Stack<LayoutLevel> m_layoutStack = new Stack<LayoutLevel>();
        /// <summary>
        /// Pool of currently-unused <see cref="Boundary"/> objects. They are added and removed here as they are taken for use in <see cref="m_layoutStack"/>.
        /// </summary>
        [NotNull]
        private readonly List<Boundary> m_pooledBoundaries = new List<Boundary>();

        private Operation m_currentOperation;

        /// <summary>
        /// Reference to the diagram for which a layout is being computed.
        /// </summary>
        [NotNull]
        public Diagram Diagram { get; }

        /// <summary>
        /// Delegate that provides information about sizes of boxes.
        /// First argument is the underlying data item id.
        /// Return value is the size of the corresponding box.
        /// This one should be implemented by the part of rendering engine that performs content layout inside a box.
        /// </summary>
        [CanBeNull]
        public Func<string, Size> BoxSizeFunc { get; set; }

        /// <summary>
        /// Visual tree of boxes.
        /// </summary>
        [CanBeNull]
        public Tree<int, Box, NodeLayoutInfo> VisualTree { get; private set; }

        /// <summary>
        /// Gets fired when any <see cref="Boundary"/> is modified by methods of this object.
        /// </summary>
        [CanBeNull]
        public event EventHandler<BoundaryChangedEventArgs> BoundaryChanged;

        /// <summary>
        /// Gets fired when <see cref="CurrentOperation"/> is changed on this object.
        /// </summary>
        [CanBeNull]
        public event EventHandler<LayoutStateOperationChangedEventArgs> OperationChanged;

        /// <summary>
        /// Ctr.
        /// </summary>
        public LayoutState([NotNull] Diagram diagram)
        {
            Diagram = diagram;
        }

        /// <summary>
        /// Initializes the visual tree and pool of boundary objects.
        /// </summary>
        public void AttachVisualTree(Tree<int, Box, NodeLayoutInfo> tree)
        {
            if (VisualTree != null)
            {
                throw new InvalidOperationException("Already initialized");
            }

            VisualTree = tree;
            for (var i = 0; i < tree.Depth; i++)
            {
                m_pooledBoundaries.Add(new Boundary());
            }
        }

        /// <summary>
        /// Push a new box onto the layout stack, thus getting deeper into layout hierarchy.
        /// Automatically allocates a Bondary object from pool.
        /// </summary>
        public LayoutLevel PushLayoutLevel([NotNull] Tree<int, Box, NodeLayoutInfo>.TreeNode node)
        {
            if (m_pooledBoundaries.Count == 0)
            {
                throw new InvalidOperationException("Hierarchy is deeper than expected");
            }

            var boundary = m_pooledBoundaries[m_pooledBoundaries.Count - 1];
            m_pooledBoundaries.RemoveAt(m_pooledBoundaries.Count - 1);

            switch (CurrentOperation)
            {
                case Operation.VerticalLayout:
                    boundary.Prepare(node.Element);
                    break;

                case Operation.HorizontalLayout:
                    boundary.PrepareForHorizontalLayout(node.Element);
                    break;
                default:
                    throw new InvalidOperationException("This operation can only be invoked when performing vertical or horizontal layouts");
            }

            var result = new LayoutLevel(node, boundary);
            m_layoutStack.Push(result);

            BoundaryChanged?.Invoke(this, new BoundaryChangedEventArgs(boundary, result, this));

            return result;
        }

        /// <summary>
        /// Merges a provided spacer box into the current branch boundary.
        /// </summary>
        public void MergeSpacer([NotNull]Box spacerBox)
        {
            if (CurrentOperation != Operation.HorizontalLayout)
            {
                throw new InvalidOperationException("Spacers can only be merged during horizontal layout");
            }

            if (m_layoutStack.Count == 0)
            {
                throw new InvalidOperationException("Cannot merge spacers at top nesting level");
            }

            var level = m_layoutStack.Peek();
            level.Boundary.MergeFrom(spacerBox);

            BoundaryChanged?.Invoke(this, new BoundaryChangedEventArgs(level.Boundary, level, this));
        }

        /// <summary>
        /// Pops a box from current layout stack, thus getting higher out from layout hierarchy.
        /// Automatically merges corresponding popped <see cref="Boundary"/> into the new-leaf level.
        /// </summary>
        public void PopLayoutLevel()
        {
            var innerLevel = m_layoutStack.Pop();

            BoundaryChanged?.Invoke(this, new BoundaryChangedEventArgs(innerLevel.Boundary, innerLevel, this));

            // if this was not the root, merge boundaries into current level
            if (m_layoutStack.Count > 0)
            {
                var higherLevel = m_layoutStack.Peek();

                switch (CurrentOperation)
                {
                    case Operation.VerticalLayout:
                        higherLevel.Boundary.VerticalMergeFrom(innerLevel.Boundary);
                        break;

                    case Operation.HorizontalLayout:
                    {
                        var strategy = higherLevel.BranchRoot.RequireState().RequireLayoutStrategy();

                        var overlap = higherLevel.Boundary.ComputeOverlap(
                            innerLevel.Boundary, strategy.SiblingSpacing, Diagram.LayoutSettings.BranchSpacing);

                        if (overlap > 0)
                        {
                            LayoutAlgorithm.MoveBranch(this, innerLevel, overlap);
                            BoundaryChanged?.Invoke(this, new BoundaryChangedEventArgs(innerLevel.Boundary, innerLevel, this));
                        }

                        higherLevel.Boundary.MergeFrom(innerLevel.Boundary);
                    }
                        break;
                    default:
                        throw new InvalidOperationException(
                            "This operation can only be invoked when performing vertical or horizontal layouts");
                }

                BoundaryChanged?.Invoke(this, new BoundaryChangedEventArgs(higherLevel.Boundary, higherLevel, this));
            }

            // return boundary to the pool
            m_pooledBoundaries.Add(innerLevel.Boundary);
        }
    }
}