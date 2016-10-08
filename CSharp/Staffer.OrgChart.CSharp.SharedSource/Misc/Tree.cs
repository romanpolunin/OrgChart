using System;
using System.Collections.Generic;
using System.Reflection;
using Staffer.OrgChart.Annotations;

namespace Staffer.OrgChart.Misc
{
    /// <summary>
    /// General-purpose tree builder.
    /// </summary>
    /// <typeparam name="TKey">Type of the element identifier</typeparam>
    /// <typeparam name="TValue">Type of the element</typeparam>
    /// <typeparam name="TValueState">Type of the additional state object bound to the element</typeparam>
    public class Tree<TKey, TValue, TValueState>
        where TValue : class
    {
        /// <summary>
        /// Node wrapper.
        /// </summary>
        public class TreeNode
        {
            private List<TreeNode> m_children;
            private TValueState m_state;

            /// <summary>
            /// Hierarchy level.
            /// </summary>
            public int Level { get; protected internal set; }

            /// <summary>
            /// Reference to value element.
            /// </summary>
            public TValue Element { get; }

            /// <summary>
            /// Optional additional information associated with the <see cref="Element"/> in this node.
            /// </summary>
            public TValueState State
            {
                [NotNull]
                set
                {
                    m_state = value;
                }
            }

            private static readonly bool ValueIsByRef = !typeof(TValueState).GetTypeInfo().IsValueType;

            /// <summary>
            /// Returns value of <see cref="State"/>, throws if it is default or <c>null</c>.
            /// </summary>
            [NotNull]
            public TValueState RequireState()
            {
                if (ValueIsByRef && ReferenceEquals(m_state, null))
                {
                    throw new InvalidOperationException("State is not set");
                }
                return m_state;
            }

            /// <summary>
            /// Reference to parent node wrapper.
            /// </summary>
            [CanBeNull]
            public TreeNode ParentNode { get; set; }

            /// <summary>
            /// References to child node wrappers.
            /// </summary>
            [CanBeNull]
            public IReadOnlyList<TreeNode> Children => m_children;

            /// <summary>
            /// Number of children nodes.
            /// </summary>
            public int ChildCount => m_children == null ? 0 : m_children.Count;

            /// <summary>
            /// Adds a new child to the list. Returns reference to self.
            /// </summary>
            public TreeNode AddChild([NotNull] TreeNode child)
            {
                if (m_children == null)
                {
                    m_children = new List<TreeNode>();
                }

                m_children.Add(child);
                child.ParentNode = this;
                child.Level = Level + 1;

                return this;
            }

            /// <summary>
            /// Adds a new child to the list. Returns reference to self.
            /// </summary>
            public TreeNode AddChild([NotNull] TValue child)
            {
                AddChild(new TreeNode(child));
                return this;
            }

            /// <summary>
            /// Ctr.
            /// </summary>
            public TreeNode([NotNull]TValue element)
            {
                Element = element;
            }

            /// <summary>
            /// Goes through all elements depth-first. Applies <paramref name="func"/> to all children recursively, then to the parent.
            /// If <paramref name="func"/> returns <c>false</c>, it will stop entire processing.
            /// </summary>
            /// <param name="root">Current node</param>
            /// <param name="func">A func to evaluate on <paramref name="root"/> and its children. Whenever it returns false, iteration stops</param>
            /// <returns>True if <paramref name="func"/> never returned <c>false</c></returns>
            public static bool IterateChildFirst([NotNull]TreeNode root, [NotNull] Func<TreeNode, bool> func)
            {
                if (root.Children != null)
                {
                    foreach (var child in root.Children)
                    {
                        if (!IterateChildFirst(child, func))
                        {
                            return false;
                        }
                    }
                }

                return func(root);
            }

            /// <summary>
            /// Goes through all elements depth-first. Applies <paramref name="func"/> to the parent first, then to all children recursively.
            /// In this mode, children at each level decide for themselves whether they want to iterate further down, e.g. <paramref name="func"/> can cut-off a branch.
            /// </summary>
            /// <param name="root">Current node</param>
            /// <param name="func">A func to evaluate on <paramref name="root"/> and its children. Whenever it returns false, iteration stops</param>
            /// <returns>True if <paramref name="func"/> never returned <c>false</c></returns>
            public static bool IterateParentFirst([NotNull]TreeNode root, [NotNull] Func<TreeNode, bool> func)
            {
                if (!func(root))
                {
                    return false;
                }

                if (root.Children != null)
                {
                    foreach (var child in root.Children)
                    {
                        // Ignore returned value, in this mode children at each level 
                        // decide for themselves whether they want to iterate further down.
                        IterateParentFirst(child, func);
                    }
                }

                return true;
            }
        }

        /// <summary>
        /// Root node wrappers.
        /// </summary>
        public List<TreeNode> Roots { get; }

        /// <summary>
        /// Dictionary of all node wrappers.
        /// Nodes are always one-to-one with elements, so they are identified by element keys.
        /// </summary>
        public Dictionary<TKey, TreeNode> Nodes { get; }

        /// <summary>
        /// Func to extract element key from element.
        /// </summary>
        public Func<TValue, TKey> GetKeyFunc { get; private set; }

        /// <summary>
        /// Func to extract parent key from element.
        /// </summary>
        public Func<TValue, TKey> GetParentKeyFunc { get; private set; }

        /// <summary>
        /// Max value of <see cref="TreeNode.Level"/> plus one (because root nodes are level zero).
        /// </summary>
        public int Depth { get; private set; }

        /// <summary>
        /// Ctr.
        /// </summary>
        public Tree(Func<TValue, TKey> getParentKeyFunc, Func<TValue, TKey> getKeyFunc)
        {
            GetParentKeyFunc = getParentKeyFunc;
            GetKeyFunc = getKeyFunc;
            Roots = new List<TreeNode>();
            Nodes = new Dictionary<TKey, TreeNode>();
        }

        /// <summary>
        /// Goes through all elements depth-first. Applies <paramref name="func"/> to all children recursively, then to the parent.
        /// If <paramref name="func"/> returns <c>false</c>, it will stop entire processing.
        /// </summary>
        /// <param name="func">A func to evaluate on items of <see cref="Roots"/> and their children. Whenever it returns false, iteration stops</param>
        /// <returns>True if <paramref name="func"/> never returned <c>false</c></returns>
        public bool IterateChildFirst([NotNull] Func<TreeNode, bool> func)
        {
            foreach (var root in Roots)
            {
                if (!TreeNode.IterateChildFirst(root, func))
                {
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Goes through all elements depth-first. Applies <paramref name="func"/> to the parent first, then to all children recursively.
        /// In this mode children at each level decide for themselves whether they want to iterate further down, e.g. <paramref name="func"/> can cut-off a branch.
        /// </summary>
        /// <param name="func">A func to evaluate on items of <see cref="Roots"/> and their children. Whenever it returns false, iteration stops</param>
        /// <returns>True if <paramref name="func"/> never returned <c>false</c></returns>
        public bool IterateParentFirst([NotNull] Func<TreeNode, bool> func)
        {
            foreach (var root in Roots)
            {
                // Ignore returned value, in this mode children at each level 
                // decide for themselves whether they want to iterate further down.
                TreeNode.IterateParentFirst(root, func);
            }

            return true;
        }

        /// <summary>
        /// Constructs a new tree.
        /// </summary>
        /// <param name="source">Source collection of elements, will be iterated only once</param>
        /// <param name="getKeyFunc">Func to extract key of the element. Key must not be null and must be unique across all elements of <paramref name="source"/></param>
        /// <param name="getParentKeyFunc">Func to extract parent key of the element</param>
        public static Tree<TKey, TValue, TValueState> Build([NotNull] IEnumerable<TValue> source, Func<TValue, TKey> getKeyFunc,
            Func<TValue, TKey> getParentKeyFunc)
        {
            var result = new Tree<TKey, TValue, TValueState>(getParentKeyFunc, getKeyFunc);

            // build dictionary of nodes
            foreach (var item in source)
            {
                var key = getKeyFunc(item);

                if (ReferenceEquals(null, key))
                {
                    throw new Exception("Null key for an element");
                }

                if (result.Nodes.ContainsKey(key))
                {
                    throw new Exception("Duplicate key: " + key);
                }

                var node = new TreeNode(item);
                result.Nodes.Add(getKeyFunc(item), node);
            }

            // build the tree
            foreach (var node in result.Nodes.Values)
            {
                var parentKey = getParentKeyFunc(node.Element);

                TreeNode parentNode;
                if (result.Nodes.TryGetValue(parentKey, out parentNode))
                {
                    parentNode.AddChild(node);
                }
                else
                {
                    // In case of data errors, parent key may be not null, but parent node is not there.
                    // Just add the node to roots.
                    result.Roots.Add(node);
                }
            }

            return result;
        }

        /// <summary>
        /// Update every node's <see cref="TreeNode.Level"/> and <see cref="Depth"/> of the tree.
        /// </summary>
        public void UpdateHierarchyStats()
        {
            // initialize hierarchy level numbers
            Depth = 0;
            IterateParentFirst(x =>
            {
                if (x.ParentNode != null)
                {
                    x.Level = x.ParentNode.Level + 1;
                    Depth = Math.Max(1 + x.Level, Depth);
                }
                else
                {
                    x.Level = 0;
                    Depth = 1;
                }
                return true;
            });
        }
    }
}