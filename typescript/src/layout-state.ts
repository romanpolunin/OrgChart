/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import { Boundary } from "./boundary";
import type { BoxTree } from "./box-tree";
import type { Diagram } from "./diagram";
import { Rect } from "./geometry";
import { LayoutAlgorithm } from "./layout-algorithm";
import type { Size } from "./geometry";

/** Which pass `LayoutAlgorithm.apply` is in. */
export enum LayoutOperation {
  Idle = 0,
  Preparing = 1,
  PreprocessVisualTree = 2,
  VerticalLayout = 3,
  HorizontalLayout = 4,
  ConnectorsLayout = 5,
  Completed = 6,
}

/** One branch on the layout stack, with the boundary that tracks it. */
export class LayoutLevel {
  constructor(
    readonly branchRoot: BoxTree.Node,
    readonly boundary: Boundary,
  ) {}
}

export class BoundaryChangedEventArgs {
  constructor(
    readonly boundary: Boundary,
    readonly layoutLevel: LayoutLevel,
    readonly state: LayoutState,
  ) {}
}

export class LayoutStateOperationChangedEventArgs {
  constructor(readonly state: LayoutState) {}
}

type BoundaryHandler = (sender: LayoutState, args: BoundaryChangedEventArgs) => void;
type OperationHandler = (sender: LayoutState, args: LayoutStateOperationChangedEventArgs) => void;

/**
 * Mutable state for one call to `LayoutAlgorithm.apply`.
 * Holds the diagram, the boundary pool, and the callbacks for box size and strategy choice.
 */
export class LayoutState {
  readonly diagram: Diagram;
  /** Returns the size of the box for a data id. */
  boxSizeFunc: ((dataId: string) => Size) | null = null;
  /** Returns a strategy id for a node, or null to keep the inherited strategy. */
  layoutOptimizerFunc: ((node: BoxTree.Node) => string | null) | null = null;

  #currentOperation = LayoutOperation.Idle;
  readonly #layoutStack: LayoutLevel[] = [];
  readonly #pooledBoundaries: Boundary[] = [];
  readonly #boundaryHandlers: BoundaryHandler[] = [];
  readonly #operationHandlers: OperationHandler[] = [];

  constructor(diagram: Diagram) {
    this.diagram = diagram;
  }

  get currentOperation(): LayoutOperation {
    return this.#currentOperation;
  }

  set currentOperation(value: LayoutOperation) {
    this.#currentOperation = value;
    const args = new LayoutStateOperationChangedEventArgs(this);
    for (const handler of this.#operationHandlers) {
      handler(this, args);
    }
  }

  addBoundaryChanged(handler: BoundaryHandler): void {
    this.#boundaryHandlers.push(handler);
  }

  addOperationChanged(handler: OperationHandler): void {
    this.#operationHandlers.push(handler);
  }

  /** Makes sure the pool can cover the tree's depth. */
  attachVisualTree(tree: BoxTree): void {
    while (this.#pooledBoundaries.length < tree.depth) {
      this.#pooledBoundaries.push(new Boundary());
    }
  }

  /** Pushes a branch and takes a boundary from the pool. */
  pushLayoutLevel(node: BoxTree.Node): LayoutLevel {
    if (this.#pooledBoundaries.length === 0) {
      this.#pooledBoundaries.push(new Boundary());
    }
    const boundary = this.#pooledBoundaries.pop()!;

    switch (this.currentOperation) {
      case LayoutOperation.VerticalLayout:
        boundary.prepare(node);
        break;
      case LayoutOperation.HorizontalLayout:
        boundary.prepareForHorizontalLayout(node);
        break;
      default:
        throw new Error("This operation can only be invoked when performing vertical or horizontal layouts");
    }

    const result = new LayoutLevel(node, boundary);
    this.#layoutStack.push(result);
    this.#raiseBoundary(boundary, result);
    return result;
  }

  /** Folds a spacer into the current horizontal boundary. */
  mergeSpacer(spacer: BoxTree.Node): void {
    if (this.currentOperation !== LayoutOperation.HorizontalLayout) {
      throw new Error("Spacers can only be merged during horizontal layout");
    }
    if (this.#layoutStack.length === 0) {
      throw new Error("Cannot merge spacers at top nesting level");
    }

    const level = this.#layoutStack[this.#layoutStack.length - 1]!;
    level.boundary.mergeFrom(spacer);
    this.#raiseBoundary(level.boundary, level);
  }

  /**
   * Pops a branch.
   * During horizontal layout, shifts it right when it overlaps the branch already placed,
   * then merges the boundaries.
   */
  popLayoutLevel(): void {
    const innerLevel = this.#layoutStack.pop();
    if (innerLevel == null) {
      throw new Error("Layout stack is empty");
    }

    this.#raiseBoundary(innerLevel.boundary, innerLevel);

    if (this.#layoutStack.length > 0) {
      const higherLevel = this.#layoutStack[this.#layoutStack.length - 1]!;

      switch (this.currentOperation) {
        case LayoutOperation.VerticalLayout:
          higherLevel.boundary.verticalMergeFrom(innerLevel.boundary);
          higherLevel.branchRoot.state.branchExterior = higherLevel.boundary.boundingRect;
          break;
        case LayoutOperation.HorizontalLayout: {
          if (higherLevel.branchRoot.assistantsRoot !== innerLevel.branchRoot) {
            const strategy = higherLevel.branchRoot.state.requireLayoutStrategy();
            const overlap = higherLevel.boundary.computeOverlap(
              innerLevel.boundary,
              strategy.siblingSpacing,
              this.diagram.layoutSettings.branchSpacing,
            );
            if (overlap > 0) {
              LayoutAlgorithm.moveBranch(this, innerLevel, overlap);
              this.#raiseBoundary(innerLevel.boundary, innerLevel);
            }
          }

          higherLevel.boundary.mergeFrom(innerLevel.boundary);
          const bounds = higherLevel.boundary.boundingRect;
          const exterior = higherLevel.branchRoot.state.branchExterior;
          higherLevel.branchRoot.state.branchExterior = Rect.of(
            bounds.left,
            exterior.top,
            bounds.size.width,
            exterior.size.height,
          );
          break;
        }
        default:
          throw new Error("This operation can only be invoked when performing vertical or horizontal layouts");
      }

      this.#raiseBoundary(higherLevel.boundary, higherLevel);
    }

    this.#pooledBoundaries.push(innerLevel.boundary);
  }

  #raiseBoundary(boundary: Boundary, level: LayoutLevel): void {
    if (this.#boundaryHandlers.length === 0) {
      return;
    }
    const args = new BoundaryChangedEventArgs(boundary, level, this);
    for (const handler of this.#boundaryHandlers) {
      handler(this, args);
    }
  }
}
