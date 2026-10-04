/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# test data generator.
 */

import type { BoxContainer } from "../box-container";
import type { ChartDataItem, ChartDataSource } from "../data-source";
import { Size } from "../geometry";
import { DotNetRandom } from "./dotnet-random";

export interface TestDataItem extends ChartDataItem {
  parentId: string | null;
  isAssistant: boolean;
}

/** In-memory chart used by the demo and the parity tests. */
export class TestDataSource implements ChartDataSource {
  readonly items = new Map<string, TestDataItem>();

  get allDataItemIds(): string[] {
    return [...this.items.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  getParentKey(itemId: string): string | null {
    const item = this.items.get(itemId);
    if (item == null) {
      throw new Error(`Unknown data id ${itemId}`);
    }
    return item.parentId;
  }

  getDataItem(itemId: string): TestDataItem {
    const item = this.items.get(itemId);
    if (item == null) {
      throw new Error(`Unknown data id ${itemId}`);
    }
    return item;
  }
}

/** Builds the same hierarchies as `OrgChart.Test.TestDataGen`. */
export class TestDataGen {
  generateDataItems(dataSource: TestDataSource, count: number, percentAssistants: number): void {
    for (const item of generateRandomDataItems(count, percentAssistants)) {
      dataSource.items.set(item.id, item);
    }
  }

  /** Seeded sizes, matching `TestDataGen.GenerateBoxSizes`. */
  static generateBoxSizes(boxContainer: BoxContainer): void {
    const minWidth = 50;
    const minHeight = 50;
    const widthVariation = 50;
    const heightVariation = 50;
    const random = new DotNetRandom(0);
    for (const box of boxContainer.boxesById.values()) {
      if (!box.isSpecial) {
        box.size = new Size(
          minWidth + random.next(widthVariation),
          minHeight + random.next(heightVariation),
        );
      }
    }
  }
}

function generateRandomDataItems(itemCount: number, percentAssistants: number): TestDataItem[] {
  if (itemCount < 0) {
    throw new RangeError("Count must be zero or positive");
  }

  const random = new DotNetRandom(0);
  const items: TestDataItem[] = [];
  for (let i = 0; i < itemCount; i++) {
    items.push({ id: String(i), parentId: null, isAssistant: false });
  }

  let firstInLayer = 1;
  let prevLayerSize = 1;
  while (firstInLayer < itemCount) {
    const layerSize = 15 + prevLayerSize + random.next(prevLayerSize * 2);
    for (let i = firstInLayer; i < firstInLayer + layerSize && i < itemCount; i++) {
      const parentIndex = firstInLayer - 1 - random.next(prevLayerSize);
      items[i]!.parentId = items[parentIndex]!.id;
    }
    firstInLayer += layerSize;
    prevLayerSize = layerSize;
  }

  for (let i = 0; i < Math.trunc(items.length / 2); i++) {
    const from = random.next(items.length);
    const to = random.next(items.length);
    const temp = items[from]!;
    items[from] = items[to]!;
    items[to] = temp;
  }

  if (percentAssistants > 0) {
    const assistantCount = Math.min(
      items.length,
      Math.ceil((items.length * percentAssistants) / 100),
    );
    for (let i = 0; i < assistantCount; i++) {
      items[random.next(items.length)]!.isAssistant = true;
    }
  }

  return items;
}
