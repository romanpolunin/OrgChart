/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import type { BoxContainer } from "./box-container";
import type { BoxTree } from "./box-tree";
import type { LayoutStrategyBase } from "./layout-strategy";

/** Strategies and spacing shared by a diagram. */
export class DiagramLayoutSettings {
  #branchSpacing = 50;
  readonly layoutStrategies = new Map<string, LayoutStrategyBase>();
  defaultAssistantLayoutStrategyId: string | null = null;
  defaultLayoutStrategyId: string | null = null;

  /** Minimum space between boxes that belong to different branches. */
  get branchSpacing(): number {
    return this.#branchSpacing;
  }

  set branchSpacing(value: number) {
    if (value < 0) {
      throw new RangeError("Branch spacing cannot be negative");
    }
    this.#branchSpacing = value;
  }

  requireDefaultLayoutStrategy(): LayoutStrategyBase {
    return this.#require(this.defaultLayoutStrategyId, "DefaultLayoutStrategyId");
  }

  requireDefaultAssistantLayoutStrategy(): LayoutStrategyBase {
    return this.#require(this.defaultAssistantLayoutStrategyId, "DefaultAssistantLayoutStrategyId");
  }

  #require(id: string | null, name: string): LayoutStrategyBase {
    if (id == null || id.length === 0) {
      throw new Error(`${name} is null or not valid`);
    }
    const strategy = this.layoutStrategies.get(id);
    if (strategy === undefined) {
      throw new Error(`${name} is null or not valid`);
    }
    return strategy;
  }
}

/** Boxes, settings, and the visual tree produced by layout. */
export class Diagram {
  readonly layoutSettings = new DiagramLayoutSettings();
  #boxes: BoxContainer | null = null;
  visualTree: BoxTree | null = null;

  get boxes(): BoxContainer {
    if (this.#boxes == null) {
      throw new Error("Boxes are not set");
    }
    return this.#boxes;
  }

  set boxes(value: BoxContainer) {
    this.visualTree = null;
    this.#boxes = value;
  }
}
