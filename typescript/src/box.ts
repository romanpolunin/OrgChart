/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import { Size } from "./geometry";

/** Box id used when a box has no parent. */
export const BOX_NONE = -1;

/**
 * A box on a diagram.
 * Data-bound boxes come from a chart data item.
 * Special boxes are spacers created by a layout strategy.
 */
export class Box {
  /** Strategy id for this box and its regular children. Null inherits the default. */
  layoutStrategyId: string | null = null;
  /** Strategy id for assistant children. Null inherits the default. */
  assistantLayoutStrategyId: string | null = null;
  /** Width and height supplied by the caller. */
  size: Size = new Size(0, 0);
  /** When true, children are left out of layout. */
  isCollapsed = false;

  /**
   * @param dataId Data item id. Null for special boxes.
   * @param id Unique id inside the parent `BoxContainer`. Never zero.
   * @param parentId Parent box id, or `BOX_NONE`.
   */
  private constructor(
    readonly dataId: string | null,
    readonly id: number,
    readonly parentId: number,
    readonly isSpecial: boolean,
    readonly disableCollisionDetection: boolean,
    readonly isAssistant: boolean,
  ) {
    if (id === 0) {
      throw new RangeError("Box id must not be 0");
    }
  }

  /** Data-bound or manually added box. */
  static create(dataId: string | null, id: number, parentId: number, isAssistant: boolean): Box {
    return new Box(dataId, id, parentId, false, false, isAssistant);
  }

  /** Auto-generated spacer or system root. */
  static special(id: number, visualParentId: number, disableCollisionDetection: boolean): Box {
    return new Box(null, id, visualParentId, true, disableCollisionDetection, false);
  }

  /** True when this box was created from a data item. */
  get isDataBound(): boolean {
    return this.dataId != null && this.dataId.length > 0;
  }
}
