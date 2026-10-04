/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import { BOX_NONE, Box } from "../box";
import { BoxTree } from "../box-tree";
import { Connector } from "../connector";
import { DOUBLE_MIN, Dimensions, Edge, Point, Rect } from "../geometry";
import { LayoutAlgorithm } from "../layout-algorithm";
import type { LayoutLevel, LayoutState } from "../layout-state";
import { BranchParentAlignment, LayoutStrategyBase } from "../layout-strategy";
import { LinearLayoutStrategy } from "./linear-layout-strategy";

/**
 * Children packed onto vertical spines, with one horizontal carrier under the parent.
 * Falls back to a linear row when there are few children.
 */
export class MultiLineFishboneLayoutStrategy extends LinearLayoutStrategy {
  /** Maximum number of vertical spines. */
  maxGroups = 4;

  override preProcessThisNode(state: LayoutState, node: BoxTree.Node): void {
    if (this.maxGroups <= 0) {
      throw new Error("MaxGroups must be a positive value");
    }

    if (node.childCount <= this.maxGroups * 2) {
      super.preProcessThisNode(state, node);
      return;
    }

    node.state.numberOfSiblings = node.childCount;
    if (node.state.numberOfSiblings === 0) {
      return;
    }

    node.state.numberOfSiblingColumns = this.maxGroups;
    node.state.numberOfSiblingRows = div(node.state.numberOfSiblings, this.maxGroups * 2);
    if (node.state.numberOfSiblings % (this.maxGroups * 2) !== 0) {
      node.state.numberOfSiblingRows++;
    }

    node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    for (let i = 0; i < node.state.numberOfSiblingColumns; i++) {
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
    if (node.state.numberOfSiblingColumns > 1) {
      node.addRegularChild(Box.special(BOX_NONE, node.element.id, false));
    }
  }

  override applyVerticalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxGroups * 2) {
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

    const adapter = new SingleFishboneLayoutAdapter(node);
    while (adapter.nextGroup()) {
      LayoutAlgorithm.verticalLayout(state, adapter.specialRoot);
    }
  }

  override applyHorizontalLayout(state: LayoutState, level: LayoutLevel): void {
    const node = level.branchRoot;
    if (node.state.numberOfSiblings <= this.maxGroups * 2) {
      super.applyHorizontalLayout(state, level);
      return;
    }

    if (node.level === 0) {
      node.state.siblingsRowV = new Dimensions(node.state.top, node.state.bottom);
    }

    if (node.assistantsRoot != null) {
      LayoutAlgorithm.horizontalLayout(state, node.assistantsRoot);
    }

    const adapter = new SingleFishboneLayoutAdapter(node);
    while (adapter.nextGroup()) {
      LayoutAlgorithm.horizontalLayout(state, adapter.specialRoot);
    }

    const rect = node.state;
    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    if (node.level > 0) {
      let diff: number;
      if (node.state.numberOfSiblingColumns > 1) {
        const leftCarrier = children[node.state.numberOfSiblings + 1]!.state.centerH;
        const rightCarrier =
          children[node.state.numberOfSiblings + node.state.numberOfSiblingColumns]!.state.centerH;
        const desiredCenter =
          node.state.numberOfSiblings === 1 || this.parentAlignment === BranchParentAlignment.Center
            ? leftCarrier + (rightCarrier - leftCarrier) / 2
            : this.parentAlignment === BranchParentAlignment.Left
              ? leftCarrier + this.childConnectorHookLength
              : rightCarrier - this.childConnectorHookLength;
        diff = rect.centerH - desiredCenter;
      } else {
        const carrier = children[1 + node.state.numberOfSiblings]!.state.centerH;
        diff = rect.centerH - carrier;
      }
      LayoutAlgorithm.moveChildrenOnly(state, level, diff);
    }

    if (node.level > 0) {
      let ix = node.state.numberOfSiblings;
      const verticalSpacer = children[ix]!;
      verticalSpacer.state.adjustSpacer(
        rect.centerH - this.parentConnectorShield / 2,
        rect.bottom,
        this.parentConnectorShield,
        children[0]!.state.siblingsRowV.from - rect.bottom,
      );
      state.mergeSpacer(verticalSpacer);
      ix++;
      ix += node.state.numberOfSiblingColumns;

      if (node.state.numberOfSiblingColumns > 1) {
        const horizontalSpacer = children[ix]!;
        const leftmost = children[node.state.numberOfSiblings + 1]!.state.topLeft;
        const rightmost = children[ix - 1]!.state.right;
        horizontalSpacer.state.adjustSpacer(
          leftmost.x,
          leftmost.y - this.parentChildSpacing,
          rightmost - leftmost.x,
          this.parentChildSpacing,
        );
        state.mergeSpacer(horizontalSpacer);
      }
    }
  }

  override routeConnectors(state: LayoutState, node: BoxTree.Node): void {
    if (node.state.numberOfSiblings <= this.maxGroups * 2) {
      super.routeConnectors(state, node);
      return;
    }

    const children = node.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    let count = 1 + node.state.numberOfSiblings + node.state.numberOfSiblingColumns;
    if (node.state.numberOfSiblingColumns > 1) {
      count++;
    }

    const segments: Edge[] = new Array(count);
    const rootRect = node.state;
    const center = rootRect.centerH;
    let ix = 0;

    const space = children[0]!.state.siblingsRowV.from - rootRect.bottom;
    segments[ix++] = new Edge(
      new Point(center, rootRect.bottom),
      new Point(center, rootRect.bottom + space - this.childConnectorHookLength),
    );

    const iterator = new GroupIterator(node.state.numberOfSiblings, node.state.numberOfSiblingColumns);
    while (iterator.nextGroup()) {
      const carrier = children[1 + node.state.numberOfSiblings + iterator.group]!.state;
      const from = carrier.centerH;
      let isLeft = true;
      let countOnThisSide = 0;
      for (let i = iterator.fromIndex; i < iterator.fromIndex + iterator.count; i++) {
        const to = isLeft ? children[i]!.state.right : children[i]!.state.left;
        const y = children[i]!.state.centerV;
        segments[ix++] = new Edge(new Point(from, y), new Point(to, y));

        countOnThisSide++;
        if (countOnThisSide === iterator.maxOnLeft) {
          countOnThisSide = 0;
          if (isLeft) {
            segments[1 + node.state.numberOfSiblings + iterator.group] = new Edge(
              new Point(carrier.centerH, carrier.top - this.childConnectorHookLength),
              new Point(carrier.centerH, children[i]!.state.centerV),
            );
          }
          isLeft = !isLeft;
        }
      }
    }

    ix += node.state.numberOfSiblingColumns;
    if (node.state.numberOfSiblingColumns > 1) {
      const leftGroup = children[1 + node.state.numberOfSiblings]!.state;
      const rightGroup =
        children[1 + node.state.numberOfSiblings + node.state.numberOfSiblingColumns - 1]!.state;
      segments[ix] = new Edge(
        new Point(leftGroup.centerH, leftGroup.top - this.childConnectorHookLength),
        new Point(rightGroup.centerH, rightGroup.top - this.childConnectorHookLength),
      );
    }

    node.state.connector = new Connector(segments);
  }
}

class GroupIterator {
  group = 0;
  fromIndex = 0;
  count = 0;
  maxOnLeft = 0;

  constructor(
    private readonly numberOfSiblings: number,
    private readonly numberOfGroups: number,
  ) {}

  countInGroup(): number {
    const countInRow = this.numberOfGroups * 2;
    let result = 0;
    let countToThisGroup = this.group * 2 + 2;
    let firstInRow = 0;
    while (true) {
      const countInThisRow =
        firstInRow >= this.numberOfSiblings - countInRow
          ? this.numberOfSiblings - firstInRow
          : countInRow;
      if (countInThisRow >= countToThisGroup) {
        result += 2;
      } else {
        countToThisGroup--;
        if (countInThisRow >= countToThisGroup) {
          result++;
        }
        break;
      }
      firstInRow += countInThisRow;
    }
    return result;
  }

  nextGroup(): boolean {
    this.fromIndex = this.fromIndex + this.count;
    if (this.fromIndex > 0) {
      this.group++;
    }
    this.count = this.countInGroup();
    this.maxOnLeft = div(this.count, 2) + (this.count % 2);
    return this.count !== 0;
  }
}

class TreeNodeView extends BoxTree.Node {
  prepare(): void {
    if (this.children == null) {
      this.children = [];
    } else {
      this.children.length = 0;
    }
  }

  addChildView(node: BoxTree.Node): void {
    if (this.children == null) {
      this.children = [];
    }
    this.children.push(node);
  }
}

/** Lays out one spine. The multi-line strategy runs this once per group. */
class SingleFishboneLayoutAdapter extends LayoutStrategyBase {
  override readonly supportsAssistants = false;
  readonly realRoot: BoxTree.Node;
  readonly specialRoot: TreeNodeView;
  readonly iterator: GroupIterator;

  constructor(realRoot: BoxTree.Node) {
    super();
    this.iterator = new GroupIterator(realRoot.state.numberOfSiblings, realRoot.state.numberOfSiblingColumns);
    this.realRoot = realRoot;
    this.specialRoot = new TreeNodeView(Box.special(BOX_NONE, realRoot.element.id, true));
    this.specialRoot.level = realRoot.level;
    this.specialRoot.parentNode = realRoot;
    this.specialRoot.state.effectiveLayoutStrategy = this;

    const parentStrategy = realRoot.state.requireLayoutStrategy();
    if (!(parentStrategy instanceof MultiLineFishboneLayoutStrategy)) {
      throw new Error("Fishbone group adapter requires MultiLineFishboneLayoutStrategy");
    }
    this.siblingSpacing = parentStrategy.siblingSpacing;
    this.parentConnectorShield = parentStrategy.parentConnectorShield;
    this.parentChildSpacing = parentStrategy.parentChildSpacing;
    this.parentAlignment = parentStrategy.parentAlignment;
    this.childConnectorHookLength = parentStrategy.childConnectorHookLength;
  }

  nextGroup(): boolean {
    if (!this.iterator.nextGroup()) {
      return false;
    }

    this.specialRoot.state.numberOfSiblings = this.iterator.count;
    this.specialRoot.prepare();
    const children = this.realRoot.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    for (let i = 0; i < this.iterator.count; i++) {
      this.specialRoot.addChildView(children[this.iterator.fromIndex + i]!);
    }

    const spacer = children[this.realRoot.state.numberOfSiblings + 1 + this.iterator.group]!;
    this.specialRoot.addChildView(spacer);
    this.specialRoot.state.copyExteriorFrom(this.realRoot.state);
    return true;
  }

  override preProcessThisNode(_state: LayoutState, _node: BoxTree.Node): void {
    throw new Error("Not supported");
  }

  override applyVerticalLayout(state: LayoutState, _level: LayoutLevel): void {
    const children = this.specialRoot.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    let prevRowBottom =
      this.realRoot.assistantsRoot != null
        ? this.realRoot.assistantsRoot.state.branchExterior.bottom
        : this.specialRoot.state.siblingsRowV.to;

    for (let i = 0; i < this.iterator.maxOnLeft; i++) {
      const spacing = i === 0 ? this.parentChildSpacing : this.siblingSpacing;
      const child = children[i]!;
      const frame = child.state;
      frame.moveTo(frame.left, prevRowBottom + spacing);

      let rowExterior = new Dimensions(frame.top, frame.bottom);
      const i2 = i + this.iterator.maxOnLeft;
      if (i2 < this.iterator.count) {
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
    if (level.branchRoot !== this.specialRoot) {
      throw new Error("Wrong root node received");
    }

    const children = this.specialRoot.children;
    if (children == null) {
      throw new Error("Children are not set");
    }

    let left = true;
    let countOnThisSide = 0;
    for (let i = 0; i < this.iterator.count; i++) {
      const child = children[i]!;
      LayoutAlgorithm.horizontalLayout(state, child);

      countOnThisSide++;
      if (countOnThisSide !== this.iterator.maxOnLeft || !left) {
        continue;
      }

      LayoutAlgorithm.alignHorizontalCenters(state, level, children.slice(0, this.iterator.maxOnLeft));
      left = false;
      countOnThisSide = 0;

      let rightmost = DOUBLE_MIN;
      for (let k = 0; k < i; k++) {
        rightmost = Math.max(rightmost, children[k]!.state.branchExterior.right);
      }
      rightmost = Math.max(rightmost, child.state.right);

      const spacer = children[this.specialRoot.state.numberOfSiblings]!;
      spacer.state.adjustSpacer(
        rightmost,
        children[0]!.state.siblingsRowV.from,
        this.siblingSpacing,
        child.state.siblingsRowV.to - children[0]!.state.siblingsRowV.from,
      );
      level.boundary.mergeFrom(spacer);
    }

    LayoutAlgorithm.alignHorizontalCenters(
      state,
      level,
      children.slice(this.iterator.maxOnLeft, this.iterator.count),
    );
  }

  override routeConnectors(_state: LayoutState, _node: BoxTree.Node): void {
    throw new Error("Not supported");
  }
}

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}
