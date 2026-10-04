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
import { LayoutStrategyBase } from "../layout-strategy";

/** Assistants alternate down the left and right of one vertical carrier. */
export class FishboneAssistantsLayoutStrategy extends LayoutStrategyBase {
  override readonly supportsAssistants = false;

  override preProcessThisNode(_state: LayoutState, node: BoxTree.Node): void {
    node.state.numberOfSiblings = node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }

    node.state.numberOfSiblingColumns = 1;
    node.state.numberOfSiblingRows = div(node.state.numberOfSiblings, 2);
    if (node.state.numberOfSiblings % 2 !== 0) {
      node.state.numberOfSiblingRows++;
    }
    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
  }

  override applyVerticalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    if (node.level === 0) {
      throw new Error("Should never be invoked on root node");
    }

    const children = node.children;
    if (children == null) {
      return;
    }

    let prevRowBottom = node.state.siblingsRowV.to;
    const maxOnLeft = maxOnLeftOf(node);
    for (let i = 0; i < maxOnLeft; i++) {
      const spacing = i === 0 ? this.parentChildSpacing : this.siblingSpacing;
      const child = children[i]!;
      const frame = child.state;
      frame.moveTo(frame.left, prevRowBottom + spacing);

      let rowExterior = new Dimensions(frame.top, frame.bottom);
      const i2 = i + maxOnLeft;
      if (i2 < node.state.numberOfSiblings) {
        const child2 = children[i2]!;
        const frame2 = child2.state;
        frame2.moveTo(frame2.left, prevRowBottom + spacing);

        if (frame2.bottom > frame.bottom) {
          frame.moveTo(frame.left, frame2.centerV - frame.size.height / 2);
        } else if (frame2.bottom < frame.bottom) {
          frame2.moveTo(frame2.left, frame.centerV - frame2.size.height / 2);
        }

        frame2.branchExterior = Rect.fromCorner(frame2.topLeft, frame2.size);
        rowExterior = Dimensions.union(rowExterior, new Dimensions(frame2.top, frame2.bottom));
        frame2.siblingsRowV = rowExterior;
        LayoutAlgorithm.verticalLayout(state, child2);
        prevRowBottom = frame2.branchExterior.bottom;
      }

      frame.branchExterior = Rect.fromCorner(frame.topLeft, frame.size);
      frame.siblingsRowV = rowExterior;
      LayoutAlgorithm.verticalLayout(state, child);
      prevRowBottom = Math.max(prevRowBottom, frame.branchExterior.bottom);
    }
  }

  override applyHorizontalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }

    const children = node.children ?? [];
    let left = true;
    let countOnThisSide = 0;
    const maxOnLeft = maxOnLeftOf(node);
    for (let i = 0; i < node.state.numberOfSiblings; i++) {
      const child = children[i]!;
      LayoutAlgorithm.horizontalLayout(state, child);

      countOnThisSide++;
      if (countOnThisSide !== maxOnLeft || !left) {
        continue;
      }

      LayoutAlgorithm.alignHorizontalCenters(state, level, children.slice(0, maxOnLeft));
      left = false;
      countOnThisSide = 0;

      let rightmost = DOUBLE_MIN;
      for (let k = 0; k <= i; k++) {
        rightmost = Math.max(rightmost, children[k]!.state.branchExterior.right);
      }

      if (node.state.numberOfSiblings % 2 !== 0) {
        rightmost = Math.max(rightmost, child.state.right);
      } else {
        const opposite = children[node.state.numberOfSiblings - 1]!;
        if (opposite.element.isCollapsed || opposite.childCount === 0) {
          rightmost = Math.max(rightmost, child.state.right);
        } else {
          rightmost = Math.max(rightmost, child.state.branchExterior.right);
        }
      }

      const spacer = children[node.state.numberOfSiblings]!;
      spacer.state.adjustSpacer(
        rightmost,
        node.state.bottom,
        this.parentConnectorShield,
        node.state.branchExterior.bottom - node.state.bottom,
      );
      level.boundary.mergeFrom(spacer);
    }

    LayoutAlgorithm.alignHorizontalCenters(
      state,
      level,
      children.slice(maxOnLeft, node.state.numberOfSiblings),
    );

    if (node.level > 0 && node.state.numberOfSiblings > 0) {
      const carrier = children[node.state.numberOfSiblings]!.state.centerH;
      LayoutAlgorithm.moveChildrenOnly(state, level, node.state.centerH - carrier);
    }
  }

  override routeConnectors(_state: LayoutState, node: BoxTree.Node): void {
    let count = node.state.numberOfSiblings;
    if (count === 0) {
      return;
    }

    const children = node.children;
    if (children == null || node.parentNode == null) {
      throw new Error("Assistant connectors require a parent and children");
    }

    const needsCarrier = node.parentNode.childCount === 0;
    if (needsCarrier) {
      count++;
    }

    const segments: Edge[] = new Array(count);
    let ix = 0;
    const maxOnLeft = maxOnLeftOf(node);
    const carrier = children[node.state.numberOfSiblings]!.state;
    const from = carrier.centerH;

    let isLeft = true;
    let countOnThisSide = 0;
    let bottomMost = DOUBLE_MIN;
    for (let i = 0; i < node.state.numberOfSiblings; i++) {
      const to = isLeft ? children[i]!.state.right : children[i]!.state.left;
      const y = children[i]!.state.centerV;
      bottomMost = Math.max(bottomMost, y);
      segments[ix++] = new Edge(new Point(from, y), new Point(to, y));

      countOnThisSide++;
      if (countOnThisSide === maxOnLeft) {
        countOnThisSide = 0;
        isLeft = !isLeft;
      }
    }

    if (needsCarrier) {
      segments[node.state.numberOfSiblings] = new Edge(
        new Point(carrier.centerH, carrier.top),
        new Point(carrier.centerH, bottomMost),
      );
    }

    node.state.connector = new Connector(segments);
  }
}

function maxOnLeftOf(node: BoxTree.Node): number {
  return div(node.state.numberOfSiblings, 2) + (node.state.numberOfSiblings % 2);
}

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}
