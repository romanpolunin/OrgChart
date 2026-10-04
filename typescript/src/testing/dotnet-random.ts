/*
 * Copyright (c) Roman Polunin 2016.
 * MIT license, see https://opensource.org/licenses/MIT.
 *
 * Matches the legacy System.Random(int seed) sequence used by the C# test data generator.
 * .NET keeps that Knuth subtractive generator for `new Random(seed)` so seeded runs stay stable.
 */

const MBIG = 2147483647;
const MSEED = 161803398;

/** Seeded generator compatible with `new System.Random(seed)` on modern .NET. */
export class DotNetRandom {
  readonly #seedArray = new Array<number>(56).fill(0);
  #inext = 0;
  #inextp = 21;

  constructor(seed: number) {
    const subtraction = seed === -2147483648 ? 2147483647 : Math.abs(seed);
    let mj = MSEED - subtraction;
    this.#seedArray[55] = mj;
    let mk = 1;
    for (let i = 1; i < 55; i++) {
      const ii = (21 * i) % 55;
      this.#seedArray[ii] = mk;
      mk = mj - mk;
      if (mk < 0) {
        mk += MBIG;
      }
      mj = this.#seedArray[ii]!;
    }
    for (let k = 1; k < 5; k++) {
      for (let i = 1; i < 56; i++) {
        this.#seedArray[i] = this.#seedArray[i]! - this.#seedArray[1 + ((i + 30) % 55)]!;
        if (this.#seedArray[i]! < 0) {
          this.#seedArray[i] = this.#seedArray[i]! + MBIG;
        }
      }
    }
    this.#inext = 0;
    this.#inextp = 21;
  }

  /** `Next()` or `Next(maxValue)`, matching the C# overloads. */
  next(maxValue?: number): number {
    if (maxValue === undefined) {
      return this.#internalSample();
    }
    if (maxValue < 0) {
      throw new RangeError("maxValue cannot be negative");
    }
    return Math.trunc(this.#sample() * maxValue);
  }

  #sample(): number {
    return this.#internalSample() * (1 / MBIG);
  }

  #internalSample(): number {
    let locINext = this.#inext;
    let locINextp = this.#inextp;
    if (++locINext >= 56) {
      locINext = 1;
    }
    if (++locINextp >= 56) {
      locINextp = 1;
    }

    let retVal = this.#seedArray[locINext]! - this.#seedArray[locINextp]!;
    if (retVal === MBIG) {
      retVal--;
    }
    if (retVal < 0) {
      retVal += MBIG;
    }

    this.#seedArray[locINext] = retVal;
    this.#inext = locINext;
    this.#inextp = locINextp;
    return retVal;
  }
}
