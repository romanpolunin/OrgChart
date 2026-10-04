/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 * TypeScript port of the C# layout engine.
 */

import type { Edge } from "./geometry";

/** A visual connector made of one or more straight segments. */
export class Connector {
  readonly segments: Edge[];

  constructor(segments: Edge[]) {
    if (segments.length === 0) {
      throw new Error("Need at least one segment");
    }
    this.segments = segments;
  }
}
