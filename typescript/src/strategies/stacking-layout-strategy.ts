/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import type { BoxTree } from "../box-tree";
import { Dimensions, Rect, Size } from "../geometry";
import { LayoutAlgorithm } from "../layout-algorithm";
import type { LayoutLevel, LayoutState } from "../layout-state";
import { BranchParentAlignment, LayoutStrategyBase, StackOrientation } from "../layout-strategy";

/**
 * Rows or columns of children with no connectors.
 * The parent grows to cover a horizontal row.
 */
export class StackingLayoutStrategy extends LayoutStrategyBase {
  orientation = StackOrientation.SingleRowHorizontal;
  override readonly supportsAssistants = false;

  constructor() {
    super();
    this.parentAlignment = BranchParentAlignment.Invalid;
    this.childConnectorHookLength = 0;
    this.parentConnectorShield = 0;
    this.siblingSpacing = 5;
  }

  override preProcessThisNode(_state: LayoutState, node: BoxTree.Node): void {
    node.state.numberOfSiblings = node.element.isCollapsed ? 0 : node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }
    if (
      this.orientation !== StackOrientation.SingleRowHorizontal &&
      this.orientation !== StackOrientation.SingleColumnVertical
    ) {
      throw new Error(`Unsupported value for orientation: ${this.orientation}`);
    }
  }

  override applyVerticalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;

    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }
    if (node.state.numberOfSiblings === 0) {
      return;
    }

    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    if (this.orientation === StackOrientation.SingleRowHorizontal) {
      let siblingsRowExterior = Dimensions.minMax();
      const top =
        node.assistantsRoot == null
          ? node.state.siblingsRowV.to + this.parentChildSpacing
          : node.state.branchExterior.bottom + this.parentChildSpacing;

      for (let i = 0; i < node.state.numberOfSiblings; i++) {
        const child = children[i]!;
        child.state.moveTo(0, top);
        child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
        siblingsRowExterior = Dimensions.union(
          siblingsRowExterior,
          new Dimensions(top, top + child.state.size.height),
        );
      }

      siblingsRowExterior = new Dimensions(siblingsRowExterior.from, siblingsRowExterior.to);
      for (let i = 0; i < node.state.numberOfSiblings; i++) {
        const child = children[i]!;
        child.state.siblingsRowV = siblingsRowExterior;
        LayoutAlgorithm.verticalLayout(state, child);
      }
      return;
    }

    if (this.orientation === StackOrientation.SingleColumnVertical) {
      let prevRowExterior = new Dimensions(node.state.siblingsRowV.from, node.state.siblingsRowV.to);
      for (let row = 0; row < node.state.numberOfSiblings; row++) {
        const child = children[row]!;
        const top = prevRowExterior.to + (row === 0 ? this.parentChildSpacing : this.siblingSpacing);
        child.state.moveTo(child.state.left, top);
        child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
        const rowExterior = new Dimensions(top, top + child.state.size.height);
        child.state.siblingsRowV = rowExterior;
        LayoutAlgorithm.verticalLayout(state, child);
        prevRowExterior = new Dimensions(
          rowExterior.from,
          Math.max(child.state.branchExterior.bottom, rowExterior.to),
        );
      }
    }
  }

  override applyHorizontalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    const children = node.children ?? [];

    for (const child of children) {
      LayoutAlgorithm.horizontalLayout(state, child);
    }

    if (node.childCount === 0) {
      return;
    }

    if (this.orientation === StackOrientation.SingleRowHorizontal) {
      const width = children[node.state.numberOfSiblings - 1]!.state.right - children[0]!.state.left;
      node.state.size = new Size(Math.max(node.state.size.width, width), node.state.size.height);
      const center = (children[0]!.state.left + children[node.childCount - 1]!.state.right) / 2;
      LayoutAlgorithm.moveChildrenOnly(state, level, node.state.centerH - center);
      return;
    }

    if (this.orientation === StackOrientation.SingleColumnVertical) {
      LayoutAlgorithm.alignHorizontalCenters(state, level, children);
      const diff = node.state.centerH - children[0]!.state.centerH;
      LayoutAlgorithm.moveChildrenOnly(state, level, diff);
    }
  }

  override routeConnectors(_state: LayoutState, _node: BoxTree.Node): void {
    // This strategy draws no connectors.
  }
}
