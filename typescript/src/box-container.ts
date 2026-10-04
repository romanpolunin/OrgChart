/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import { BOX_NONE, Box } from "./box";
import type { ChartDataSource } from "./data-source";

/** Owns the boxes for one diagram and the uniqueness of their ids. */
export class BoxContainer {
  #lastBoxId = 0;
  readonly boxesById = new Map<number, Box>();
  readonly boxesByDataId = new Map<string, Box>();
  /** Invisible root that lets the diagram have several visible roots. */
  systemRoot: Box | null = null;

  constructor(source?: ChartDataSource) {
    if (source != null) {
      this.reloadBoxes(source);
    }
  }

  /** Clears the container and builds one box per data item, plus the system root. */
  reloadBoxes(source: ChartDataSource): void {
    this.boxesByDataId.clear();
    this.boxesById.clear();
    this.#lastBoxId = 0;

    this.systemRoot = Box.special(++this.#lastBoxId, BOX_NONE, true);
    this.boxesById.set(this.systemRoot.id, this.systemRoot);

    const map = new Map<string, number>();
    for (const dataId of source.allDataItemIds) {
      map.set(dataId, this.nextBoxId());
    }

    for (const dataId of source.allDataItemIds) {
      const parentDataId = dataId.length === 0 ? null : source.getParentKey(dataId);
      const visualParentId =
        parentDataId == null || parentDataId.length === 0
          ? this.systemRoot.id
          : required(map, parentDataId);
      this.#add(dataId, required(map, dataId), visualParentId, source.getDataItem(dataId).isAssistant);
    }
  }

  /** Creates a box with the next id and adds it. */
  addBox(dataId: string | null, visualParentId: number, isAssistant: boolean): Box {
    return this.#add(dataId, this.nextBoxId(), visualParentId, isAssistant);
  }

  nextBoxId(): number {
    this.#lastBoxId++;
    return this.#lastBoxId;
  }

  #add(dataId: string | null, id: number, visualParentId: number, isAssistant: boolean): Box {
    const box = Box.create(dataId, id, visualParentId, isAssistant);
    this.boxesById.set(box.id, box);
    if (box.dataId != null && box.dataId.length > 0) {
      this.boxesByDataId.set(box.dataId, box);
    }
    return box;
  }
}

function required(map: Map<string, number>, key: string): number {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`No box id for data id ${key}`);
  }
  return value;
}
