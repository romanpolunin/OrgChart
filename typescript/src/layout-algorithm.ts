/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import type { Box } from "./box";
import type { BoxTree } from "./box-tree";
import { BoxTree as BoxTreeValue } from "./box-tree";
import { DOUBLE_MAX, DOUBLE_MIN, Dimensions, isEqual, Point, Rect } from "./geometry";
import type { LayoutStrategyBase } from "./layout-strategy";
import { LayoutLevel, LayoutOperation, LayoutState } from "./layout-state";

/** Runs the layout passes and the shared branch-move helpers. */
export class LayoutAlgorithm {
  /**
   * Bounding rectangle of the visible data-bound boxes.
   * Special boxes, including the system root, are left out.
   */
  static computeBranchVisualBoundingRect(visualTree: BoxTree): Rect {
    let result = Rect.zero();
    let initialized = false;

    visualTree.iterateParentFirst((node) => {
      const box = node.element;
      if (!node.state.isHidden && !box.isSpecial) {
        const rect = Rect.fromCorner(node.state.topLeft, node.state.size);
        result = initialized ? Rect.union(result, rect) : rect;
        initialized = true;
      }
      return !box.isCollapsed;
    });

    return result;
  }

  /** Builds the visual tree and runs every layout pass. */
  static apply(state: LayoutState): void {
    if (state.diagram.boxes.systemRoot == null) {
      throw new Error("SystemRoot is not initialized on the box container");
    }

    state.currentOperation = LayoutOperation.Preparing;

    const tree = BoxTreeValue.build(state);
    state.diagram.visualTree = tree;

    if (tree.root == null || tree.root.element.id !== state.diagram.boxes.systemRoot.id) {
      throw new Error("SystemRoot is not on the top of the visual tree");
    }

    tree.updateHierarchyStats();
    state.attachVisualTree(tree);

    tree.iterateParentFirst((node) => {
      node.state.isHidden =
        node.parentNode != null && (node.parentNode.state.isHidden || node.parentNode.element.isCollapsed);
      return true;
    });

    state.currentOperation = LayoutOperation.PreprocessVisualTree;

    if (state.boxSizeFunc != null) {
      const sizeOf = state.boxSizeFunc;
      for (const box of state.diagram.boxes.boxesById.values()) {
        if (box.isDataBound && box.dataId != null) {
          box.size = sizeOf(box.dataId);
        }
      }
    }

    for (const box of state.diagram.boxes.boxesById.values()) {
      assertBoxSize(box);
    }

    tree.iterateParentFirst((node) => {
      node.state.moveTo(0, 0);
      node.state.size = node.element.size;
      node.state.branchExterior = Rect.fromCorner(new Point(0, 0), node.element.size);
      return true;
    });

    preprocessVisualTree(state, tree);
    tree.updateHierarchyStats();

    state.currentOperation = LayoutOperation.VerticalLayout;
    LayoutAlgorithm.verticalLayout(state, tree.root);

    state.currentOperation = LayoutOperation.HorizontalLayout;
    LayoutAlgorithm.horizontalLayout(state, tree.root);

    state.currentOperation = LayoutOperation.ConnectorsLayout;
    routeConnectors(state, tree);

    state.currentOperation = LayoutOperation.Completed;
  }

  /** Lays out one branch horizontally. Re-entered by the strategies. */
  static horizontalLayout(state: LayoutState, branchRoot: BoxTree.Node): void {
    if (branchRoot.state.isHidden) {
      throw new Error(`Branch root ${branchRoot.element.id} does not affect layout`);
    }

    const level = state.pushLayoutLevel(branchRoot);
    try {
      if (
        branchRoot.level === 0 ||
        ((branchRoot.state.numberOfSiblings > 0 || branchRoot.assistantsRoot != null) &&
          !branchRoot.element.isCollapsed)
      ) {
        branchRoot.state.requireLayoutStrategy().applyHorizontalLayout(state, level);
      }
    } finally {
      state.popLayoutLevel();
    }
  }

  /** Lays out one branch vertically. Re-entered by the strategies. */
  static verticalLayout(state: LayoutState, branchRoot: BoxTree.Node): void {
    if (branchRoot.state.isHidden) {
      throw new Error(`Branch root ${branchRoot.element.id} does not affect layout`);
    }

    const level = state.pushLayoutLevel(branchRoot);
    try {
      if (
        branchRoot.level === 0 ||
        ((branchRoot.state.numberOfSiblings > 0 || branchRoot.assistantsRoot != null) &&
          !branchRoot.element.isCollapsed)
      ) {
        branchRoot.state.requireLayoutStrategy().applyVerticalLayout(state, level);
      }
    } finally {
      state.popLayoutLevel();
    }
  }

  /** Moves every descendant of the current branch except the branch root. */
  static moveChildrenOnly(_state: LayoutState, layoutLevel: LayoutLevel, offset: number): void {
    const children = layoutLevel.branchRoot.children;
    if (children == null || children.length === 0) {
      throw new Error("Should never be invoked when children not set");
    }

    for (const child of children) {
      moveOne(child, offset);
    }

    layoutLevel.boundary.reloadFromBranch(layoutLevel.branchRoot);
    layoutLevel.branchRoot.state.branchExterior = layoutLevel.boundary.boundingRect;
  }

  /** Moves a whole branch, including its root, and refreshes that level's boundary. */
  static moveBranch(_state: LayoutState, layoutLevel: LayoutLevel, offset: number): void {
    moveOne(layoutLevel.branchRoot, offset);
    layoutLevel.boundary.reloadFromBranch(layoutLevel.branchRoot);
    layoutLevel.branchRoot.state.branchExterior = layoutLevel.boundary.boundingRect;
  }

  /**
   * Shifts a subset of sibling branches so their boxes share one horizontal center.
   * Returns the leftmost and rightmost branch edges after the move.
   */
  static alignHorizontalCenters(
    _state: LayoutState,
    level: LayoutLevel,
    subset: Iterable<BoxTree.Node>,
  ): Dimensions {
    const nodes = [...subset];
    let center = DOUBLE_MIN;
    for (const child of nodes) {
      const c = child.state.centerH;
      if (c > center) {
        center = c;
      }
    }

    let leftmost = DOUBLE_MAX;
    let rightmost = DOUBLE_MIN;
    for (const child of nodes) {
      const c = child.state.centerH;
      if (!isEqual(c, center)) {
        moveOne(child, center - c);
      }
      leftmost = Math.min(leftmost, child.state.branchExterior.left);
      rightmost = Math.max(rightmost, child.state.branchExterior.right);
    }

    level.boundary.reloadFromBranch(level.branchRoot);
    return new Dimensions(leftmost, rightmost);
  }
}

function assertBoxSize(box: Box): void {
  // The height check repeats the width test. That matches the C# method.
  if (box.size.width >= 0 && box.size.width <= 1_000_000_000) {
    if (box.size.height >= 0 && box.size.width <= 1_000_000_000) {
      return;
    }
  }
  throw new Error(`Box ${box.id} has invalid size: ${box.size.width}x${box.size.height}`);
}

function preprocessVisualTree(state: LayoutState, visualTree: BoxTree): void {
  const regular: LayoutStrategyBase[] = [state.diagram.layoutSettings.requireDefaultLayoutStrategy()];
  const assistants: LayoutStrategyBase[] = [state.diagram.layoutSettings.requireDefaultAssistantLayoutStrategy()];

  visualTree.iterateParentFirst(
    (node) => {
      if (node.state.isHidden) {
        return false;
      }

      let strategy: LayoutStrategyBase | null = null;
      if (state.layoutOptimizerFunc != null) {
        const suggestedStrategyId = state.layoutOptimizerFunc(node);
        if (suggestedStrategyId != null && suggestedStrategyId.length > 0) {
          const found = state.diagram.layoutSettings.layoutStrategies.get(suggestedStrategyId);
          if (found === undefined) {
            throw new Error(`Unknown layout strategy ${suggestedStrategyId}`);
          }
          strategy = found;
        }
      }

      if (node.isAssistantRoot) {
        if (strategy == null) {
          const assistantId = node.parentNode?.element.assistantLayoutStrategyId;
          strategy =
            assistantId != null
              ? requiredStrategy(state, assistantId)
              : assistants[assistants.length - 1]!;
        }
        assistants.push(strategy);
      } else {
        if (strategy == null) {
          const layoutId = node.element.layoutStrategyId;
          strategy =
            layoutId != null ? requiredStrategy(state, layoutId) : regular[regular.length - 1]!;
        }
        regular.push(strategy);
        if (!strategy.supportsAssistants) {
          node.suppressAssistants();
        }
      }

      node.state.effectiveLayoutStrategy = strategy;
      node.state.requireLayoutStrategy().preProcessThisNode(state, node);
      return (!node.element.isCollapsed && node.childCount > 0) || node.assistantsRoot != null;
    },
    (node) => {
      if (!node.state.isHidden) {
        if (node.isAssistantRoot) {
          assistants.pop();
        } else {
          regular.pop();
        }
      }
    },
  );
}

function requiredStrategy(state: LayoutState, id: string): LayoutStrategyBase {
  const strategy = state.diagram.layoutSettings.layoutStrategies.get(id);
  if (strategy === undefined) {
    throw new Error(`Unknown layout strategy ${id}`);
  }
  return strategy;
}

function routeConnectors(state: LayoutState, visualTree: BoxTree): void {
  visualTree.iterateParentFirst((node) => {
    if (
      node.element.isCollapsed ||
      (node.state.numberOfSiblings === 0 && node.assistantsRoot == null)
    ) {
      return false;
    }
    if (node.level === 0) {
      return true;
    }
    if (!node.element.isSpecial || node.isAssistantRoot) {
      node.state.requireLayoutStrategy().routeConnectors(state, node);
      return true;
    }
    return false;
  });
}

function moveOne(root: BoxTree.Node, offset: number): void {
  root.iterateChildFirst((node) => {
    if (!node.state.isHidden) {
      node.state.topLeft = node.state.topLeft.moveH(offset);
      node.state.branchExterior = node.state.branchExterior.moveH(offset);
    }
    return true;
  });
}
