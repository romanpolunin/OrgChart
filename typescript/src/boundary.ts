/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import type { BoxTree } from "./box-tree";
import { DOUBLE_MAX, DOUBLE_MIN, isEqual, isZero, Point, Rect, Size } from "./geometry";

/** One vertical run of a left or right edge. */
export class BoundaryStep {
  constructor(
    readonly node: BoxTree.Node,
    readonly x: number,
    readonly top: number,
    readonly bottom: number,
  ) {}

  changeTop(newTop: number): BoundaryStep {
    return new BoundaryStep(this.node, this.x, newTop, this.bottom);
  }

  changeBottom(newBottom: number): BoundaryStep {
    return new BoundaryStep(this.node, this.x, this.top, newBottom);
  }

  changeOwner(newNode: BoxTree.Node, newX: number): BoundaryStep {
    return new BoundaryStep(newNode, newX, this.top, this.bottom);
  }

  changeX(newX: number): BoundaryStep {
    return new BoundaryStep(this.node, newX, this.top, this.bottom);
  }
}

/**
 * Left and right edges of a branch, used to keep sibling branches from overlapping.
 * Set `Boundary.validate` to check the edge lists after every splice, as the C# debug build does.
 */
export class Boundary {
  static validate = false;

  boundingRect: Rect = Rect.zero();
  left: BoundaryStep[] = [];
  right: BoundaryStep[] = [];
  readonly #spacerMerger: Boundary | null;

  constructor(fromPublic = true) {
    if (fromPublic) {
      this.#spacerMerger = new Boundary(false);
    } else {
      this.#spacerMerger = null;
    }
  }

  /** Resets the edges and seeds them with this node's own left and right sides. */
  prepareForHorizontalLayout(node: BoxTree.Node): void {
    this.prepare(node);
    if (node.element.disableCollisionDetection) {
      return;
    }

    const rect = node.state;
    this.left.push(new BoundaryStep(node, rect.left, rect.top, rect.bottom));
    this.right.push(new BoundaryStep(node, rect.right, rect.top, rect.bottom));
  }

  /** Clears the edges. Used when the boundary is taken from the pool. */
  prepare(node: BoxTree.Node): void {
    this.left.length = 0;
    this.right.length = 0;
    this.boundingRect = Rect.fromCorner(node.state.topLeft, node.state.size);
  }

  /** Vertical layout only needs the bounding rectangle. */
  verticalMergeFrom(other: Boundary): void {
    this.boundingRect = Rect.union(this.boundingRect, other.boundingRect);
  }

  /**
   * Merges another boundary into this one.
   * The other boundary's steps are rewritten as they are consumed.
   */
  mergeFrom(other: Boundary | BoxTree.Node): void {
    if (other instanceof Boundary) {
      this.#mergeBoundary(other);
      return;
    }
    this.#mergeNode(other);
  }

  #mergeNode(node: BoxTree.Node): void {
    if (node.element.disableCollisionDetection || isZero(node.state.size.height)) {
      return;
    }
    if (this.#spacerMerger == null) {
      throw new Error("Spacer merger is not available");
    }
    this.#spacerMerger.prepareForHorizontalLayout(node);
    this.#mergeBoundary(this.#spacerMerger);
  }

  #mergeBoundary(other: Boundary): void {
    if (other.boundingRect.top >= other.boundingRect.bottom) {
      throw new Error(
        `Cannot merge boundary of height ${other.boundingRect.bottom - other.boundingRect.top}`,
      );
    }

    let merge: "r" | "l" | "\0" = "r";
    while (merge !== "\0") {
      const mySteps = merge === "r" ? this.right : this.left;
      const theirSteps = merge === "r" ? other.right : other.left;
      let i = 0;
      let k = 0;
      for (; k < theirSteps.length && i < mySteps.length; ) {
        const my = mySteps[i]!;
        const th = theirSteps[k]!;

        if (my.bottom <= th.top) {
          i++;
          continue;
        }

        if (th.bottom <= my.top) {
          mySteps.splice(i, 0, th);
          k++;
          this.#validateState();
          continue;
        }

        const theirWins = merge === "r" ? my.x <= th.x : my.x >= th.x;

        if (isEqual(my.top, th.top)) {
          if (isEqual(my.bottom, th.bottom)) {
            if (theirWins) {
              mySteps[i] = th;
            }
            i++;
            k++;
            this.#validateState();
          } else if (my.bottom < th.bottom) {
            if (theirWins) {
              mySteps[i] = my.changeOwner(th.node, th.x);
            }
            theirSteps[k] = th.changeTop(my.bottom);
            i++;
            this.#validateState();
          } else if (theirWins) {
            mySteps[i] = my.changeTop(th.bottom);
            mySteps.splice(i, 0, th);
            i++;
            k++;
            this.#validateState();
          } else {
            k++;
            this.#validateState();
          }
        } else if (isEqual(my.bottom, th.bottom)) {
          if (my.top < th.top) {
            if (theirWins) {
              mySteps[i] = my.changeBottom(th.top);
              mySteps.splice(i + 1, 0, th);
              i++;
            }
            i++;
            k++;
            this.#validateState();
          } else if (theirWins) {
            mySteps[i] = th;
            i++;
            k++;
            this.#validateState();
          } else {
            mySteps.splice(i, 0, th.changeBottom(my.top));
            i++;
            i++;
            k++;
            this.#validateState();
          }
        } else if (my.top < th.top && my.bottom < th.bottom) {
          if (theirWins) {
            mySteps[i] = my.changeBottom(th.top);
            mySteps.splice(i + 1, 0, new BoundaryStep(th.node, th.x, th.top, my.bottom));
            i++;
          }
          theirSteps[k] = th.changeTop(my.bottom);
          i++;
          this.#validateState();
        } else if (my.top < th.top && my.bottom > th.bottom) {
          if (theirWins) {
            mySteps[i] = my.changeBottom(th.top);
            mySteps.splice(i + 1, 0, th);
            mySteps.splice(i + 2, 0, my.changeTop(th.bottom));
            i += 2;
          }
          k++;
          this.#validateState();
        } else if (my.bottom > th.bottom) {
          if (theirWins) {
            mySteps[i] = my.changeTop(th.bottom);
            mySteps.splice(i, 0, th);
          } else {
            mySteps.splice(i, 0, th.changeBottom(my.top));
          }
          i++;
          k++;
          this.#validateState();
        } else if (theirWins) {
          mySteps[i] = th.changeBottom(my.bottom);
          theirSteps[k] = th.changeTop(my.bottom);
          i++;
          this.#validateState();
        } else {
          mySteps.splice(i, 0, th.changeBottom(my.top));
          i++;
          theirSteps[k] = th.changeTop(my.bottom);
          i++;
          this.#validateState();
        }
      }

      if (i === mySteps.length) {
        while (k < theirSteps.length) {
          mySteps.push(theirSteps[k]!);
          k++;
          this.#validateState();
        }
      }

      merge = merge === "r" ? "l" : "\0";
    }

    this.boundingRect = Rect.union(this.boundingRect, other.boundingRect);
  }

  /** Maximum horizontal overlap between this boundary's right edge and `other`'s left edge. */
  computeOverlap(other: Boundary, siblingSpacing: number, branchSpacing: number): number {
    let i = 0;
    let k = 0;
    let offense = 0;
    while (i < this.right.length && k < other.left.length) {
      const my = this.right[i]!;
      const th = other.left[k]!;

      if (my.bottom <= th.top) {
        i++;
      } else if (th.bottom <= my.top) {
        k++;
      } else {
        if (!my.node.element.disableCollisionDetection && !th.node.element.disableCollisionDetection) {
          const desiredSpacing =
            my.node.element.isSpecial || th.node.element.isSpecial
              ? 0
              : my.node.element.parentId === th.node.element.parentId
                ? siblingSpacing
                : branchSpacing;
          const diff = my.x + desiredSpacing - th.x;
          if (diff > offense) {
            offense = diff;
          }
        }

        if (my.bottom >= th.bottom) {
          k++;
        }
        if (th.bottom >= my.bottom) {
          i++;
        }
      }
    }
    return offense;
  }

  /** Rewrites edge positions from the boxes after a horizontal move. */
  reloadFromBranch(branchRoot: BoxTree.Node): void {
    let leftmost = DOUBLE_MAX;
    let rightmost = DOUBLE_MIN;

    for (let i = 0; i < this.left.length; i++) {
      const step = this.left[i]!;
      const newLeft = step.node.state.left;
      this.left[i] = step.changeX(newLeft);
      leftmost = Math.min(leftmost, newLeft);
    }

    for (let i = 0; i < this.right.length; i++) {
      const step = this.right[i]!;
      const newRight = step.node.state.right;
      this.right[i] = step.changeX(newRight);
      rightmost = Math.max(rightmost, newRight);
    }

    leftmost = Math.min(branchRoot.state.left, leftmost);
    rightmost = Math.max(branchRoot.state.right, rightmost);

    this.boundingRect = Rect.fromCorner(
      new Point(leftmost, this.boundingRect.top),
      new Size(rightmost - leftmost, this.boundingRect.size.height),
    );
  }

  #validateState(): void {
    if (!Boundary.validate) {
      return;
    }
    validateEdge(this.left, "Left");
    validateEdge(this.right, "Right");
  }
}

function validateEdge(steps: BoundaryStep[], name: string): void {
  for (let i = 1; i < steps.length; i++) {
    const step = steps[i]!;
    const prev = steps[i - 1]!;
    if (
      isEqual(step.top, step.bottom) ||
      step.top < prev.bottom ||
      step.top <= prev.top ||
      step.bottom <= step.top ||
      step.bottom <= prev.bottom
    ) {
      throw new Error(`State error at ${name} index ${i}`);
    }
  }
}
