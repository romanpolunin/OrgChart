/*
 * Copyright (c) Roman Polunin 2016. 
 * MIT license, see https://opensource.org/licenses/MIT. 
*/
using System;
using System.Collections.Generic;
using OrgChart.Annotations;
using OrgChart.Misc;

namespace OrgChart.Layout
{
    /// <summary>
    /// Our tree logic instantiated for <see cref="Box"/> and <see cref="NodeLayoutInfo"/>.
    /// </summary>
    public class BoxTree : Tree<int, Box, NodeLayoutInfo>
    {
        /// <summary>
        /// Ctr.
        /// </summary>
        public BoxTree(Func<Box, int> getParentKeyFunc, Func<Box, int> getKeyFunc) : base(getParentKeyFunc, getKeyFunc)
        {
        }

        /// <summary>
        /// Constructs a new tree.
        /// </summary>
        /// <param name="source">Source collection of elements, will be iterated only once</param>
        /// <param name="getKeyFunc">Func to extract key of the element. Key must not be null and must be unique across all elements of <paramref name="source"/></param>
        /// <param name="getParentKeyFunc">Func to extract parent key of the element</param>
        public static BoxTree Build([NotNull] IEnumerable<Box> source, Func<Box, int> getKeyFunc,
            Func<Box, int> getParentKeyFunc)
        {
            var result = new BoxTree(getParentKeyFunc, getKeyFunc);

            // build dictionary of nodes
            foreach (var item in source)
            {
                var key = getKeyFunc(item);

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
                    if (node.Element.IsAssistant && parentNode.Element.ParentId != Box.None)
                    {
                        parentNode.AddAssistantChild(node, () => Box.Special(Box.None, parentNode.Element.Id, true));
                    }
                    else
                    {
                        parentNode.AddRegularChild(node);
                    }
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
    }
}