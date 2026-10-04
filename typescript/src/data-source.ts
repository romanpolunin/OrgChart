/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

/** One record the chart is built from. */
export interface ChartDataItem {
  /** Unique identifier of this data element. */
  readonly id: string;
  /** When true, the box is laid out with the assistant strategy. */
  readonly isAssistant: boolean;
}

/**
 * Read-only access to the hierarchy.
 * `allDataItemIds` may be enumerated more than once and must stay stable.
 */
export interface ChartDataSource {
  readonly allDataItemIds: Iterable<string>;
  /** Parent data id, or null when this item is a root. */
  getParentKey(itemId: string): string | null;
  getDataItem(itemId: string): ChartDataItem;
}
