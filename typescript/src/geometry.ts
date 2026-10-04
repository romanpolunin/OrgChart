/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

/** Smallest positive IEEE-754 double. Matches C# `double.Epsilon`, not machine epsilon. */
export const DOUBLE_EPSILON = Number.MIN_VALUE;

/** Matches C# `double.MinValue`. */
export const DOUBLE_MIN = -Number.MAX_VALUE;

/** Matches C# `double.MaxValue`. */
export const DOUBLE_MAX = Number.MAX_VALUE;

/** True when `value` is `double.MinValue` (or lower). */
export function isMinValue(value: number): boolean {
  return value <= DOUBLE_MIN + DOUBLE_EPSILON;
}

/** True when `value` is `double.MaxValue` (or higher). */
export function isMaxValue(value: number): boolean {
  return value >= DOUBLE_MAX - DOUBLE_EPSILON;
}

/** True when `value` is close enough to zero for the C# `IsZero` helper. */
export function isZero(value: number): boolean {
  return value <= DOUBLE_EPSILON && value >= -DOUBLE_EPSILON;
}

/** True when two doubles compare equal under the C# `IsEqual` helper. */
export function isEqual(value: number, other: number): boolean {
  return Math.abs(value - other) <= DOUBLE_EPSILON;
}

/** A point in diagram coordinates. */
export class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  /** Returns a point moved horizontally by `offsetX`. */
  moveH(offsetX: number): Point {
    return new Point(this.x + offsetX, this.y);
  }
}

/** Width and height in diagram coordinates. */
export class Size {
  constructor(
    readonly width: number,
    readonly height: number,
  ) {}
}

/**
 * A rectangle in diagram coordinates.
 * The four-number factory rejects a negative width or height.
 * `fromCorner` does not, matching the C# `(Point, Size)` constructor.
 */
export class Rect {
  readonly topLeft: Point;
  readonly size: Size;

  private constructor(topLeft: Point, size: Size) {
    this.topLeft = topLeft;
    this.size = size;
  }

  static of(x: number, y: number, w: number, h: number): Rect {
    if (w < 0) {
      throw new RangeError("Width cannot be negative");
    }
    if (h < 0) {
      throw new RangeError("Height cannot be negative");
    }
    return new Rect(new Point(x, y), new Size(w, h));
  }

  static fromCorner(topLeft: Point, size: Size): Rect {
    return new Rect(topLeft, size);
  }

  static zero(): Rect {
    return new Rect(new Point(0, 0), new Size(0, 0));
  }

  static union(x: Rect, y: Rect): Rect {
    const left = Math.min(x.left, y.left);
    const top = Math.min(x.top, y.top);
    const right = Math.max(x.right, y.right);
    const bottom = Math.max(x.bottom, y.bottom);
    return Rect.of(left, top, right - left, bottom - top);
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

  moveH(offsetX: number): Rect {
    return new Rect(new Point(this.left + offsetX, this.top), this.size);
  }
}

/** Edges of a run of siblings on one axis. */
export class Dimensions {
  constructor(
    readonly from: number,
    readonly to: number,
  ) {}

  /** Identity value for union: from is +inf, to is -inf. */
  static minMax(): Dimensions {
    return new Dimensions(DOUBLE_MAX, DOUBLE_MIN);
  }

  static union(x: Dimensions, y: Dimensions): Dimensions {
    return new Dimensions(Math.min(x.from, y.from), Math.max(x.to, y.to));
  }
}

/** One straight connector segment. */
export class Edge {
  constructor(
    readonly from: Point,
    readonly to: Point,
  ) {}
}
