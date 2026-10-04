/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import { BOX_NONE, Box } from "../box";
import type { BoxTree } from "../box-tree";
import { Connector } from "../connector";
import { Dimensions, Edge, Point, Rect } from "../geometry";
import { LayoutAlgorithm } from "../layout-algorithm";
import type { LayoutLevel, LayoutState } from "../layout-state";
import { BranchParentAlignment, LayoutStrategyBase } from "../layout-strategy";

/** One vertical column, offset to the left or the right of the parent. */
export class SingleColumnLayoutStrategy extends LayoutStrategyBase {
  override readonly supportsAssistants = true;

  override preProcessThisNode(_state: LayoutState, node: BoxTree.Node): void {
    if (
      this.parentAlignment !== BranchParentAlignment.Left &&
      this.parentAlignment !== BranchParentAlignment.Right
    ) {
      throw new Error("Unsupported value for ParentAlignment");
    }

    node.state.numberOfSiblings = node.element.isCollapsed ? 0 : node.childCount;
    if (node.state.numberOfSiblings > 0 && node.level > 0) {
      node.state.numberOfSiblingColumns = 1;
      node.state.numberOfSiblingRows = node.childCount;
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
  }

  override applyVerticalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;

    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }

    if (node.assistantsRoot != null) {
      node.assistantsRoot.state.copyExteriorFrom(node.state);
      LayoutAlgorithm.verticalLayout(state, node.assistantsRoot);
    }

    let prevRowExterior = new Dimensions(
      node.state.siblingsRowV.from,
      node.assistantsRoot == null ? node.state.siblingsRowV.to : node.state.branchExterior.bottom,
    );

    const children = node.children ?? [];
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

  override applyHorizontalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    const nodeState = node.state;

    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }

    const children = node.children ?? [];
    for (let row = 0; row < nodeState.numberOfSiblings; row++) {
      LayoutAlgorithm.horizontalLayout(state, children[row]!);
    }

    const column: BoxTree.Node[] = [];
    for (let i = 0; i < node.state.numberOfSiblings; i++) {
      column.push(children[i]!);
    }
    const edges = LayoutAlgorithm.alignHorizontalCenters(state, level, column);

    if (node.level > 0 && node.childCount > 0) {
      const rect = node.state;
      let diff: number;
      if (this.parentAlignment === BranchParentAlignment.Left) {
        diff = rect.centerH + this.parentConnectorShield / 2 - edges.from;
      } else if (this.parentAlignment === BranchParentAlignment.Right) {
        diff = rect.centerH - this.parentConnectorShield / 2 - edges.to;
      } else {
        throw new Error("Invalid ParentAlignment setting");
      }

      LayoutAlgorithm.moveChildrenOnly(state, level, diff);

      const verticalSpacer = node.level > 0 ? children[node.childCount - 1] : null;
      if (verticalSpacer != null) {
        const spacerTop = node.state.bottom;
        const spacerBottom = children[node.childCount - 2]!.state.bottom;
        verticalSpacer.state.adjustSpacer(
          rect.centerH - this.parentConnectorShield / 2,
          spacerTop,
          this.parentConnectorShield,
          spacerBottom - spacerTop,
        );
        state.mergeSpacer(verticalSpacer);
      }
    }
  }

  override routeConnectors(_state: LayoutState, node: BoxTree.Node): void {
    if (node.childCount === 0) {
      return;
    }

    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    const count = 1 + node.state.numberOfSiblings;
    const segments: Edge[] = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;
    const verticalCarrierHeight =
      children[node.state.numberOfSiblings - 1]!.state.centerV - node.state.bottom;

    segments[0] = new Edge(
      new Point(center, rootRect.bottom),
      new Point(center, rootRect.bottom + verticalCarrierHeight),
    );

    for (let ix = 0; ix < node.state.numberOfSiblings; ix++) {
      const rect = children[ix]!.state;
      const destination = this.parentAlignment === BranchParentAlignment.Left ? rect.left : rect.right;
      segments[1 + ix] = new Edge(new Point(center, rect.centerV), new Point(destination, rect.centerV));
    }

    node.state.connector = new Connector(segments);
  }
}
