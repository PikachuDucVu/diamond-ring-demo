import { GEM_COLORS_COUNT } from "../Constants";

export type CellType = "empty" | "gem" | "block";

const noop = () => {};
export class Deferred {
  public promise: Promise<void>;
  public resolve: () => void = noop;
  public reject: () => void = noop;
  public elapsed = 0;
  constructor(public duration: number) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export interface Effect {
  duration: number;
  elapsed: number;
}

export interface GemOffsetEffect extends Effect {
  index: number;
  fromOffsetX: number;
  fromOffsetY: number;
  toOffsetX: number;
  toOffsetY: number;
}

export interface ZoomEffect extends Effect {
  index: number;
  fromScale: number;
  toScale: number;
}
