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

/** One row of children under the parent. */
export class LinearLayoutStrategy extends LayoutStrategyBase {
  override readonly supportsAssistants = true;

  override preProcessThisNode(_state: LayoutState, node: BoxTree.Node): void {
    if (node.childCount === 0) {
      return;
    }

    node.state.numberOfSiblings = node.element.isCollapsed ? 0 : node.childCount;
    if (node.element.isCollapsed) {
      return;
    }

    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
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

    if (node.state.numberOfSiblings === 0) {
      return;
    }

    let siblingsRowExterior = Dimensions.minMax();
    const top =
      node.assistantsRoot == null
        ? node.state.siblingsRowV.to + this.parentChildSpacing
        : node.state.branchExterior.bottom + this.parentChildSpacing;

    const children = requiredChildren(node);
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
  }

  override applyHorizontalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;

    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }

    const children = node.children ?? [];
    for (let i = 0; i < node.state.numberOfSiblings; i++) {
      LayoutAlgorithm.horizontalLayout(state, children[i]!);
    }

    if (node.level > 0 && node.childCount > 0) {
      const rect = node.state;
      const leftmost = children[0]!.state.centerH;
      const rightmost = children[node.state.numberOfSiblings - 1]!.state.centerH;
      const desiredCenter =
        node.state.numberOfSiblings === 1 || this.parentAlignment === BranchParentAlignment.Center
          ? leftmost + (rightmost - leftmost) / 2
          : this.parentAlignment === BranchParentAlignment.Left
            ? leftmost + this.childConnectorHookLength
            : rightmost - this.childConnectorHookLength;
      LayoutAlgorithm.moveChildrenOnly(state, level, rect.centerH - desiredCenter);

      const verticalSpacer = children[node.state.numberOfSiblings]!;
      verticalSpacer.state.adjustSpacer(
        rect.centerH - this.parentConnectorShield / 2,
        rect.bottom,
        this.parentConnectorShield,
        children[0]!.state.siblingsRowV.from - rect.bottom,
      );
      state.mergeSpacer(verticalSpacer);

      const firstInRow = children[0]!.state;
      const horizontalSpacer = children[node.state.numberOfSiblings + 1]!;
      horizontalSpacer.state.adjustSpacer(
        firstInRow.left,
        firstInRow.siblingsRowV.from - this.parentChildSpacing,
        children[node.state.numberOfSiblings - 1]!.state.right - firstInRow.left,
        this.parentChildSpacing,
      );
      state.mergeSpacer(horizontalSpacer);
    }
  }

  override routeConnectors(_state: LayoutState, node: BoxTree.Node): void {
    const normalChildCount = node.state.numberOfSiblings;
    const count =
      normalChildCount === 0 ? 0 : normalChildCount === 1 ? 1 : 1 + 1 + normalChildCount;

    if (count === 0) {
      node.state.connector = null;
      return;
    }

    const children = node.children;
    if (children == null) {
      throw new Error("State is present, but children not set");
    }

    const segments: Edge[] = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;

    if (count === 1) {
      segments[0] = new Edge(new Point(center, rootRect.bottom), new Point(center, children[0]!.state.top));
    } else {
      const space = children[0]!.state.siblingsRowV.from - rootRect.bottom;
      segments[0] = new Edge(
        new Point(center, rootRect.bottom),
        new Point(center, rootRect.bottom + space - this.childConnectorHookLength),
      );

      for (let i = 0; i < normalChildCount; i++) {
        const childRect = children[i]!.state;
        const childCenter = childRect.centerH;
        segments[1 + i] = new Edge(
          new Point(childCenter, childRect.top),
          new Point(childCenter, childRect.top - this.childConnectorHookLength),
        );
      }

      segments[count - 1] = new Edge(
        new Point(segments[1]!.to.x, segments[1]!.to.y),
        new Point(segments[count - 2]!.to.x, segments[1]!.to.y),
      );
    }

    node.state.connector = new Connector(segments);
  }
}

export function requiredChildren(node: BoxTree.Node): BoxTree.Node[] {
  if (node.children == null) {
    throw new Error("Children are not set");
  }
  return node.children;
}
