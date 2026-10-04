/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import type { BoxTree } from "./box-tree";
import type { LayoutLevel, LayoutState } from "./layout-state";

/** Where the parent sits relative to its children. */
export enum BranchParentAlignment {
  /** Do not use. Stacking strategies keep this value. */
  Invalid = 0,
  /** Parent on the left of its children. */
  Left = 1,
  /** Parent centered above its children. */
  Center = 2,
  /** Parent on the right of its children. */
  Right = 3,
}

/** Direction used by `StackingLayoutStrategy`. */
export enum StackOrientation {
  Invalid = 0,
  /** One horizontal row, left to right. */
  SingleRowHorizontal = 1,
  /** One vertical column, top to bottom. */
  SingleColumnVertical = 2,
}

/** Shared settings and operations for a layout style. */
export abstract class LayoutStrategyBase {
  parentAlignment = BranchParentAlignment.Invalid;
  /** Minimum gap between a parent box and a child box. */
  parentChildSpacing = 20;
  /** Width reserved so long vertical connectors stay clear. */
  parentConnectorShield = 50;
  /** Minimum gap between two sibling boxes. */
  siblingSpacing = 20;
  /** Length of the short segment that enters a child box. */
  childConnectorHookLength = 5;

  /** When false, assistants are laid out as ordinary children. */
  abstract readonly supportsAssistants: boolean;

  /** Insert spacers or other special boxes before measurement. */
  abstract preProcessThisNode(state: LayoutState, node: BoxTree.Node): void;

  abstract applyVerticalLayout(state: LayoutState, level: LayoutLevel): void;

  abstract applyHorizontalLayout(state: LayoutState, level: LayoutLevel): void;

  abstract routeConnectors(state: LayoutState, node: BoxTree.Node): void;
}
