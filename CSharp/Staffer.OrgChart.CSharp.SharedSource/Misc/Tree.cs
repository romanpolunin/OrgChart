using System;
using System.Collections.Generic;
using System.Linq;

namespace Staffer.OrgChart.Layout.CSharp
{
    /// <summary>
    /// General-purpose tree builder.
    /// </summary>
    /// <typeparam name="TKey">Type of the element identifier</typeparam>
    /// <typeparam name="TValue">Type of the element</typeparam>
    public class Tree<TKey, TValue>
        where TValue : class
    {
        /// <summary>
        /// Node wrapper.
        /// </summary>
        public class TreeNode
        {
            /// <summary>
            /// Hierarchy level.
            /// </summary>
            public int Level { get; protected internal set; }

            /// <summary>
            /// Reference to value element.
            /// </summary>
            public TValue Element { get; }

            /// <summary>
            /// Reference to parent node wrapper.
            /// </summary>
            public TreeNode ParentNode { get; set; }

            /// <summary>
            /// References to child node wrappers.
            /// </summary>
            public List<TreeNode> Children { get; }

            /// <summary>
            /// Ctr.
            /// </summary>
            public TreeNode(TValue element)
            {
                Element = element;
                Children = new List<TreeNode>();
            }

            /// <summary>
            /// Goes through all elements depth-first. Applies <paramref name="func"/> to all children recursively, then to the parent.
            /// </summary>
            /// <param name="root">Current node</param>
            /// <param name="func">A func to evaluate on <paramref name="root"/> and its children. Whenever it returns false, iteration stops</param>
            /// <returns>True if <paramref name="func"/> never returned <c>false</c></returns>
            public static bool IterateChildFirst(TreeNode root, [NotNull] Func<TreeNode, bool> func)
            {
                if (root != null)
                {
                    foreach (var child in root.Children)
                    {
                        if (!IterateChildFirst(child, func))
                        {
                            return false;
                        }
                    }

                    if (!func(root))
                    {
                        return false;
                    }
                }
                return true;
            }

            /// <summary>
            /// Goes through all elements depth-first. Applies <paramref name="func"/> to the parent first, then to all children recursively.
            /// </summary>
            /// <param name="root">Current node</param>
            /// <param name="func">A func to evaluate on <paramref name="root"/> and its children. Whenever it returns false, iteration stops</param>
            /// <returns>True if <paramref name="func"/> never returned <c>false</c></returns>
            public static bool IterateParentFirst(TreeNode root, [NotNull] Func<TreeNode, bool> func)
            {
                if (root != null)
                {
                    if (!func(root))
                    {
                        return false;
                    }

                    foreach (var child in root.Children)
                    {
                        if (!IterateParentFirst(child, func))
                        {
                            return false;
                        }
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
        /// Dictionary of all node wrappers identified by element keys.
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
        /// </summary>
        /// <param name="func">A func to evaluate on items of <see cref="Roots"/> and their children. Whenever it returns false, iteration stops</param>
        /// <returns>True if <paramref name="func"/> never returned <c>false</c></returns>
        public bool IterateParentFirst([NotNull] Func<TreeNode, bool> func)
        {
            foreach (var root in Roots)
            {
                if (!TreeNode.IterateParentFirst(root, func))
                {
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Constructs a new tree.
        /// </summary>
        /// <param name="source">Source collection of elements, will be iterated only once</param>
        /// <param name="getKeyFunc">Func to extract key of the element. Key must not be null and must be unique across all elements of <paramref name="source"/></param>
        /// <param name="getParentKeyFunc">Func to extract parent key of the element</param>
        public static Tree<TKey, TValue> Build([NotNull] IEnumerable<TValue> source, Func<TValue, TKey> getKeyFunc,
            Func<TValue, TKey> getParentKeyFunc)
        {
            var result = new Tree<TKey, TValue>(getParentKeyFunc, getKeyFunc);

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
                if (!ReferenceEquals(null, parentKey) && result.Nodes.TryGetValue(parentKey, out parentNode))
                {
                    node.ParentNode = parentNode;
                    parentNode.Children.Add(node);
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
            IterateParentFirst(x =>
            {
                if (x.ParentNode != null)
                {
                    x.Level = x.ParentNode.Level + 1;
                }
                else
                {
                    x.Level = 0;
                }
                return true;
            });

            Depth = 1 + Nodes.Values.Max(x => x.Level);
        }
    }
}