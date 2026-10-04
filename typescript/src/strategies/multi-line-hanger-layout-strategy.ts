/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import { BOX_NONE, Box } from "../box";
import type { BoxTree } from "../box-tree";
import { Connector } from "../connector";
import { DOUBLE_MIN, Dimensions, Edge, Point, Rect } from "../geometry";
import { LayoutAlgorithm } from "../layout-algorithm";
import type { LayoutLevel, LayoutState } from "../layout-state";
import { LinearLayoutStrategy } from "./linear-layout-strategy";

/**
 * Several rows of children hung from horizontal carriers.
 * Falls back to a single linear row when the children fit in one row.
 * `maxSiblingsPerRow` must be a positive even number.
 */
export class MultiLineHangerLayoutStrategy extends LinearLayoutStrategy {
  maxSiblingsPerRow = 4;

  override preProcessThisNode(state: LayoutState, node: BoxTree.Node): void {
    if (this.maxSiblingsPerRow <= 0 || this.maxSiblingsPerRow % 2 !== 0) {
      throw new Error("MaxSiblingsPerRow must be a positive even value");
    }

    if (node.childCount <= this.maxSiblingsPerRow) {
      super.preProcessThisNode(state, node);
      return;
    }

    node.state.numberOfSiblings = node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }

    const lastRowBoxCount = node.childCount % this.maxSiblingsPerRow;
    node.state.numberOfSiblingColumns = 1 + this.maxSiblingsPerRow;
    node.state.numberOfSiblingRows = div(node.childCount, this.maxSiblingsPerRow);
    if (lastRowBoxCount !== 0) {
      node.state.numberOfSiblingRows++;
    }

    node.state.numberOfSiblings = node.childCount + node.state.numberOfSiblingRows;
    if (lastRowBoxCount > 0 && lastRowBoxCount <= div(this.maxSiblingsPerRow, 2)) {
      node.state.numberOfSiblings--;
    }

    let ix = div(this.maxSiblingsPerRow, 2);
    while (ix < node.state.numberOfSiblings) {
      node.insertRegularChild(ix, Box.special(BOX_NONE, node.element.id, false));
      ix += node.state.numberOfSiblingColumns;
    }

    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    for (let i = 0; i < node.state.numberOfSiblingRows; i++) {
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
  }

  override applyVerticalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxSiblingsPerRow) {
      super.applyVerticalLayout(state, level);
      return;
    }

    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }

    if (node.assistantsRoot != null) {
      node.assistantsRoot.state.copyExteriorFrom(node.state);
      LayoutAlgorithm.verticalLayout(state, node.assistantsRoot);
    }

    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    let prevRowExterior = new Dimensions(
      node.state.siblingsRowV.from,
      node.assistantsRoot == null ? node.state.siblingsRowV.to : node.state.branchExterior.bottom,
    );

    for (let row = 0; row < node.state.numberOfSiblingRows; row++) {
      let siblingsRowExterior = Dimensions.minMax();
      const spacing = row === 0 ? this.parentChildSpacing : this.siblingSpacing;
      const from = row * node.state.numberOfSiblingColumns;
      const to = Math.min(from + node.state.numberOfSiblingColumns, node.state.numberOfSiblings);

      for (let i = from; i < to; i++) {
        const child = children[i]!;
        if (child.element.isSpecial) {
          continue;
        }
        const top = prevRowExterior.to + spacing;
        child.state.moveTo(child.state.left, top);
        child.state.branchExterior = Rect.fromCorner(child.state.topLeft, child.state.size);
        siblingsRowExterior = Dimensions.union(
          siblingsRowExterior,
          new Dimensions(top, top + child.state.size.height),
        );
      }

      siblingsRowExterior = new Dimensions(siblingsRowExterior.from, siblingsRowExterior.to);
      let siblingsBottom = DOUBLE_MIN;
      for (let i = from; i < to; i++) {
        const child = children[i]!;
        child.state.siblingsRowV = siblingsRowExterior;
        LayoutAlgorithm.verticalLayout(state, child);
        siblingsBottom = Math.max(siblingsBottom, child.state.branchExterior.bottom);
      }

      prevRowExterior = new Dimensions(
        siblingsRowExterior.from,
        Math.max(siblingsBottom, siblingsRowExterior.to),
      );

      const spacerIndex = from + div(node.state.numberOfSiblingColumns, 2);
      if (spacerIndex < node.state.numberOfSiblings) {
        const spacerBottom =
          row === node.state.numberOfSiblingRows - 1
            ? children[spacerIndex - 1]!.state.siblingsRowV.to
            : prevRowExterior.to;
        children[spacerIndex]!.state.adjustSpacer(
          0,
          prevRowExterior.from,
          this.parentConnectorShield,
          spacerBottom - prevRowExterior.from,
        );
      }
    }
  }

  override applyHorizontalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxSiblingsPerRow) {
      super.applyHorizontalLayout(state, level);
      return;
    }

    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }

    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    for (let col = 0; col < node.state.numberOfSiblingColumns; col++) {
      for (let row = 0; row < node.state.numberOfSiblingRows; row++) {
        const ix = row * node.state.numberOfSiblingColumns + col;
        if (ix >= node.state.numberOfSiblings) {
          break;
        }
        LayoutAlgorithm.horizontalLayout(state, children[ix]!);
      }
      LayoutAlgorithm.alignHorizontalCenters(state, level, columnNodes(node, col));
    }

    const rect = node.state;
    const spacer = children[div(node.state.numberOfSiblingColumns, 2)]!;
    LayoutAlgorithm.moveChildrenOnly(state, level, rect.centerH - spacer.state.centerH);

    const verticalSpacer = children[node.state.numberOfSiblings]!;
    verticalSpacer.state.adjustSpacer(
      rect.centerH - this.parentConnectorShield / 2,
      rect.bottom,
      this.parentConnectorShield,
      children[0]!.state.siblingsRowV.from - rect.bottom,
    );
    state.mergeSpacer(verticalSpacer);

    let spacing = this.parentChildSpacing;
    for (
      let firstInRowIndex = 0;
      firstInRowIndex < node.state.numberOfSiblings;
      firstInRowIndex += node.state.numberOfSiblingColumns
    ) {
      const firstInRow = children[firstInRowIndex]!.state;
      const lastInRow =
        children[
          Math.min(firstInRowIndex + node.state.numberOfSiblingColumns - 1, node.state.numberOfSiblings - 1)
        ]!.state;
      const horizontalSpacer =
        children[
          1 + node.state.numberOfSiblings + div(firstInRowIndex, node.state.numberOfSiblingColumns)
        ]!;
      const width =
        lastInRow.right >= verticalSpacer.state.right
          ? lastInRow.right - firstInRow.left
          : verticalSpacer.state.right - firstInRow.left;
      horizontalSpacer.state.adjustSpacer(
        firstInRow.left,
        firstInRow.siblingsRowV.from - spacing,
        width,
        spacing,
      );
      state.mergeSpacer(horizontalSpacer);
      spacing = this.siblingSpacing;
    }
  }

  override routeConnectors(state: LayoutState, node: BoxTree.Node): void {
    if (node.state.numberOfSiblings <= this.maxSiblingsPerRow) {
      super.routeConnectors(state, node);
      return;
    }

    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    let count = 1 + node.state.numberOfSiblingRows;
    for (const child of children) {
      if (!child.element.isSpecial) {
        count++;
      }
    }

    const segments: Edge[] = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;
    const verticalCarrierHeight =
      children[node.state.numberOfSiblings - 1]!.state.siblingsRowV.from -
      this.childConnectorHookLength -
      rootRect.bottom;

    segments[0] = new Edge(
      new Point(center, rootRect.bottom),
      new Point(center, rootRect.bottom + verticalCarrierHeight),
    );

    let ix = 1;
    for (let i = 0; i < node.state.numberOfSiblings; i++) {
      const child = children[i]!;
      if (!child.element.isSpecial) {
        const childRect = child.state;
        segments[ix++] = new Edge(
          new Point(childRect.centerH, childRect.top),
          new Point(childRect.centerH, childRect.top - this.childConnectorHookLength),
        );
      }
    }

    const lastChildHookIndex = count - node.state.numberOfSiblingRows - 1;
    for (
      let firstInRowIndex = 1;
      firstInRowIndex < count - node.state.numberOfSiblingRows;
      firstInRowIndex += this.maxSiblingsPerRow
    ) {
      const firstInRow = segments[firstInRowIndex]!;
      const lastInRow = segments[Math.min(firstInRowIndex + this.maxSiblingsPerRow - 1, lastChildHookIndex)]!;
      if (lastInRow.from.x < segments[0]!.from.x) {
        segments[ix++] = new Edge(
          new Point(firstInRow.to.x, firstInRow.to.y),
          new Point(segments[0]!.to.x, firstInRow.to.y),
        );
      } else {
        segments[ix++] = new Edge(
          new Point(firstInRow.to.x, firstInRow.to.y),
          new Point(lastInRow.to.x, firstInRow.to.y),
        );
      }
    }

    node.state.connector = new Connector(segments);
  }
}

function columnNodes(branchRoot: BoxTree.Node, col: number): BoxTree.Node[] {
  const children = branchRoot.children;
  if (children == null) {
    return [];
  }
  const result: BoxTree.Node[] = [];
  for (let row = 0; row < branchRoot.state.numberOfSiblingRows; row++) {
    const ix = row * branchRoot.state.numberOfSiblingColumns + col;
    if (ix >= branchRoot.state.numberOfSiblings) {
      break;
    }
    result.push(children[ix]!);
  }
  return result;
}

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}
