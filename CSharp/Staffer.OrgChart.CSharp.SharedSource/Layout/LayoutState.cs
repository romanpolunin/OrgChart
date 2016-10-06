using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace Staffer.OrgChart.Layout.CSharp
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
        [DebuggerDisplay("{BranchRoot.Element.Id}, {Boundary.Top}..{Boundary.Bottom}, {EffectiveLayoutStrategy.GetType().Name}")]
        public struct LayoutLevel
        {
            /// <summary>
            /// Root parent for this subtree.
            /// </summary>
            public readonly Tree<int, Box>.TreeNode BranchRoot;
            /// <summary>
            /// Layout strategy in effect at this level, derived from <see cref="BranchRoot"/> or its parents.
            /// </summary>
            public readonly LayoutStrategyBase EffectiveLayoutStrategy;
            /// <summary>
            /// Boundaries of this entire subtree.
            /// </summary>
            public readonly Boundary Boundary;

            /// <summary>
            /// Ctr.
            /// </summary>
            public LayoutLevel([NotNull] Tree<int, Box>.TreeNode node, [NotNull] LayoutStrategyBase effectiveLayoutStrategy,
                [NotNull] Boundary boundary)
            {
                BranchRoot = node;
                EffectiveLayoutStrategy = effectiveLayoutStrategy;
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
        public Tree<int, Box> VisualTree { get; private set; }

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
        public void AttachVisualTree(Tree<int, Box> tree)
        {
            if (VisualTree != null)
            {
                throw new InvalidOperationException("Already initialized");
            }

            VisualTree = tree;
            for (var i = 0; i < tree.Depth; i++)
            {
                m_pooledBoundaries.Add(new Boundary(Diagram.LayoutSettings.Resolution));
            }
        }

        /// <summary>
        /// Push a new box onto the layout stack, thus getting deeper into layout hierarchy.
        /// Automatically allocates a Bondary object from pool.
        /// </summary>
        public LayoutLevel PushLayoutLevel([NotNull] Tree<int, Box>.TreeNode node)
        {
            var layoutStrategy = RequireLayoutStrategy(node);

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

            var result = new LayoutLevel(node, layoutStrategy, boundary);
            m_layoutStack.Push(result);

            BoundaryChanged?.Invoke(this, new BoundaryChangedEventArgs(boundary, result, this));

            return result;
        }

        /// <summary>
        /// Determines an instance of <see cref="LayoutStrategyBase"/> to be used for layout of this node.
        /// </summary>
        [NotNull]
        public LayoutStrategyBase RequireLayoutStrategy(Tree<int, Box>.TreeNode node)
        {
            LayoutStrategyBase layoutStrategy;
            if (node.Element.LayoutStrategyId != null)
            {
                // is it explicitly specified?
                layoutStrategy = Diagram.LayoutSettings.LayoutStrategies[node.Element.LayoutStrategyId];
            }
            else if (m_layoutStack.Count > 0)
            {
                // can we inherit it from previous level?
                layoutStrategy = m_layoutStack.Peek().EffectiveLayoutStrategy;
            }
            else
            {
                layoutStrategy = Diagram.LayoutSettings.RequireDefaultLayoutStrategy();
            }
            return layoutStrategy;
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
                        var overlap = higherLevel.Boundary.ComputeOverlap(innerLevel.Boundary,
                            higherLevel.EffectiveLayoutStrategy.SiblingSpacing, Diagram.LayoutSettings.BranchSpacing);

                        if (overlap > 0)
                        {
                            LayoutAlgorithm.MoveBranch(this, innerLevel, overlap);
                            BoundaryChanged?.Invoke(this,
                                new BoundaryChangedEventArgs(innerLevel.Boundary, innerLevel, this));
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