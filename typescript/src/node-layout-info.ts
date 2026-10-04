/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import type { Connector } from "./connector";
import { Dimensions, Point, Rect, Size } from "./geometry";
import type { LayoutStrategyBase } from "./layout-strategy";

/** Layout measurements attached to one visual-tree node. */
export class NodeLayoutInfo {
  #strategy: LayoutStrategyBase | null = null;

  /** Hidden because an ancestor is collapsed. */
  isHidden = false;
  /** Regular children that participate as siblings. Spacers are often excluded. */
  numberOfSiblings = 0;
  /** Rows of immediate children. Meaning depends on the strategy. */
  numberOfSiblingRows = 0;
  /** Columns of immediate children. Meaning depends on the strategy. */
  numberOfSiblingColumns = 0;

  topLeft: Point = new Point(0, 0);
  size: Size = new Size(0, 0);
  branchExterior: Rect = Rect.zero();
  siblingsRowV: Dimensions = new Dimensions(0, 0);
  connector: Connector | null = null;

  /** Derived from settings, inheritance, or the optimizer. */
  set effectiveLayoutStrategy(value: LayoutStrategyBase) {
    this.#strategy = value;
  }

  requireLayoutStrategy(): LayoutStrategyBase {
    if (this.#strategy == null) {
      throw new Error("EffectiveLayoutStrategy is not set");
    }
    return this.#strategy;
  }

  get left(): number {
    return this.topLeft.x;
  }

  get right(): number {
    return this.topLeft.x + this.size.width;
  }

  get top(): number {
    return this.topLeft.y;
  }

  get bottom(): number {
    return this.topLeft.y + this.size.height;
  }

  get centerH(): number {
    return this.topLeft.x + this.size.width / 2;
  }

  get centerV(): number {
    return this.topLeft.y + this.size.height / 2;
  }

  moveTo(x: number, y: number): void {
    this.topLeft = new Point(x, y);
  }

  /** Copies position and exterior measurements. Does not copy the connector. */
  copyExteriorFrom(other: NodeLayoutInfo): void {
    this.topLeft = other.topLeft;
    this.size = other.size;
    this.branchExterior = other.branchExterior;
    this.siblingsRowV = other.siblingsRowV;
  }

  /** Places a spacer and resets its branch exterior to that rectangle. */
  adjustSpacer(x: number, y: number, w: number, h: number): void {
    this.topLeft = new Point(x, y);
    this.size = new Size(w, h);
    this.branchExterior = Rect.of(x, y, w, h);
  }
}
