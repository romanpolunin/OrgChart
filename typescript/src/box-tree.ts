/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import { BOX_NONE, Box } from "./box";
import type { LayoutState } from "./layout-state";
import { NodeLayoutInfo } from "./node-layout-info";

/**
 * Visual tree of boxes.
 * `BoxTree.Node` is the nested node type, matching the C# nested class.
 */
export class BoxTree {
  root: BoxTree.Node | null = null;
  /** Nodes for boxes stored in the container, keyed by box id. Spacers are not included. */
  readonly nodes = new Map<number, BoxTree.Node>();
  /** Maximum node level plus one. */
  depth = 0;

  iterateChildFirst(func: (node: BoxTree.Node) => boolean): boolean {
    if (this.root == null) {
      throw new Error("Root is not set");
    }
    return this.root.iterateChildFirst(func);
  }

  iterateParentFirst(
    enter: (node: BoxTree.Node) => boolean,
    exit?: (node: BoxTree.Node) => void,
  ): void {
    if (this.root == null) {
      throw new Error("Root is not set");
    }
    this.root.iterateParentFirst(enter, exit);
  }

  /** Recomputes every node's level and the tree depth. */
  updateHierarchyStats(): void {
    this.depth = 0;
    this.iterateParentFirst((node) => {
      if (node.parentNode != null) {
        node.level = node.parentNode.level;
        if (!node.parentNode.isAssistantRoot) {
          node.level++;
        }
        this.depth = Math.max(1 + node.level, this.depth);
      } else {
        node.level = 0;
        this.depth = 1;
      }
      return true;
    });
  }

  /** Builds a tree from the diagram's boxes. */
  static build(state: LayoutState): BoxTree {
    const result = new BoxTree();

    for (const box of state.diagram.boxes.boxesById.values()) {
      result.nodes.set(box.id, new BoxTree.Node(box));
    }

    for (const node of result.nodes.values()) {
      const parentKey = node.element.parentId;
      const parentNode = result.nodes.get(parentKey);
      if (parentNode !== undefined) {
        if (node.element.isAssistant && parentNode.element.parentId !== BOX_NONE) {
          parentNode.addAssistantChild(node);
        } else {
          parentNode.addRegularChild(node);
        }
      } else if (result.root != null) {
        throw new Error(`More than one root found: ${node.element.id}`);
      } else {
        result.root = node;
      }
    }

    return result;
  }
}

export namespace BoxTree {
  export class Node {
    level = 0;
    readonly element: Box;
    readonly state = new NodeLayoutInfo();
    parentNode: Node | null = null;
    children: Node[] | null = null;
    /** Separate root so assistant layout can reuse the same strategies. */
    assistantsRoot: Node | null = null;

    constructor(element: Box) {
      this.element = element;
    }

    get childCount(): number {
      return this.children == null ? 0 : this.children.length;
    }

    /**
     * True when this node is its parent's assistant root.
     * The extra parentheses match a Bridge.NET workaround that was also
     * the behavior of the C# expression, and they stay so the port is obvious.
     */
    get isAssistantRoot(): boolean {
      return (this.parentNode == null ? undefined : this.parentNode.assistantsRoot) === this;
    }

    addAssistantChild(child: Node): Node {
      if (this.assistantsRoot == null) {
        this.assistantsRoot = new Node(Box.special(BOX_NONE, this.element.id, true));
        this.assistantsRoot.parentNode = this;
        this.assistantsRoot.level = this.level + 1;
      }
      this.assistantsRoot.addRegularChild(child);
      return this;
    }

    addRegularChild(child: Node | Box): Node {
      return this.insertRegularChild(this.childCount, child);
    }

    insertRegularChild(index: number, child: Node | Box): Node {
      const node = child instanceof Node ? child : new Node(child);
      if (this.children == null) {
        this.children = [];
      }
      this.children.splice(index, 0, node);
      node.parentNode = this;
      node.level = this.level + 1;
      return this;
    }

    /** Children first, then this node. Returning false from `func` stops the walk. */
    iterateChildFirst(func: (node: Node) => boolean): boolean {
      if (this.assistantsRoot != null && !this.assistantsRoot.iterateChildFirst(func)) {
        return false;
      }
      if (this.children != null) {
        for (const child of this.children) {
          if (!child.iterateChildFirst(func)) {
            return false;
          }
        }
      }
      return func(this);
    }

    /**
     * This node first, then descendants.
     * A false `enter` skips this node's descendants and still calls `exit`.
     * Siblings keep going either way.
     */
    iterateParentFirst(enter: (node: Node) => boolean, exit?: (node: Node) => void): boolean {
      if (!enter(this)) {
        exit?.(this);
        return false;
      }

      this.assistantsRoot?.iterateParentFirst(enter, exit);

      if (this.children != null) {
        for (const child of this.children) {
          child.iterateParentFirst(enter, exit);
        }
      }

      exit?.(this);
      return true;
    }

    /**
     * Moves assistant children into the regular child list.
     * Used when the chosen strategy does not support assistants.
     */
    suppressAssistants(): void {
      if (this.assistantsRoot == null) {
        return;
      }
      const assistants = this.assistantsRoot.children;
      if (assistants != null) {
        for (const child of assistants) {
          this.addRegularChild(child);
        }
      }
      this.assistantsRoot = null;
    }
  }
}
