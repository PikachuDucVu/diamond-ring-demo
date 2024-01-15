// export type SystemType =
//   | "before"
//   | "after"
//   | "normal"
//   | "fixedStep"
//   | "fixedStepBefore"
//   | "fixedStepAfter";

// export const TypeOrder: Record<SystemType, number> = {
//   fixedStepBefore: 0,
//   fixedStep: 1,
//   fixedStepAfter: 2,
//   before: 3,
//   normal: 4,
//   after: 5,
// };

// export interface System {
//   process?(delta: number): void;
//   dispose?(): void;
//   type?: SystemType;
// }

// export type MaybePromise<T> = T | Promise<T>;
// export type SystemFactoryFunc = () => MaybePromise<System>;
// export type SystemFactory = {
//   func: SystemFactoryFunc;
//   type: SystemType;
// };

// export class Manager<ContextType> {
//   public static FIXED_STEP = 0.015;

//   private _ctx: any = {};

//   private funcs: SystemFactory[] = [];
//   private systems: System[] = [];

//   private initializing = false;
//   private initialized = false;

//   private accumulate = 0;

//   public get context(): ContextType {
//     return this._ctx;
//   }

//   register<K extends string, T>(
//     key: K,
//     dependency: T
//   ): Manager<ContextType & { [key in K]: T }> {
//     this._ctx[key] = dependency;
//     return this as any;
//   }

//   onBefore(func: SystemFactoryFunc, fixedStep = false) {
//     this.funcs.push({ func, type: fixedStep ? "fixedStepBefore" : "before" });
//   }

//   onAfter(func: SystemFactoryFunc, fixedStep = false) {
//     this.funcs.push({ func, type: fixedStep ? "fixedStepAfter" : "after" });
//   }

//   addFixedStepSystem(func: SystemFactoryFunc) {
//     this.addSystem(func, true);
//   }

//   addSystem(func: SystemFactoryFunc, fixedStep = false) {
//     this.funcs.push({ func, type: fixedStep ? "fixedStep" : "normal" });
//   }

//   private async initialize() {
//     this.initializing = true;
//     this.funcs.sort((a, b) => TypeOrder[a.type] - TypeOrder[b.type]);
//     console.log(this.funcs);
//     for (const factory of this.funcs) {
//       let result = factory.func();
//       if (result instanceof Promise) {
//         result = await result;
//       }
//       result.type = factory.type;
//       this.systems.push(result);
//     }
//     this.initializing = false;
//     this.initialized = true;
//   }

//   process(delta: number) {
//     if (!this.initialized && !this.initializing) {
//       this.initialize();
//       return;
//     }
//     if (!this.initialized) {
//       return;
//     }
//     this.accumulate += delta;
//     while (this.accumulate >= Manager.FIXED_STEP) {
//       this.accumulate -= Manager.FIXED_STEP;
//       for (const system of this.systems) {
//         if (system.type === "fixedStepBefore")
//           system.process?.(Manager.FIXED_STEP);
//       }
//       for (const system of this.systems) {
//         if (system.type === "fixedStep") system.process?.(Manager.FIXED_STEP);
//       }
//       for (const system of this.systems) {
//         if (system.type === "fixedStepAfter")
//           system.process?.(Manager.FIXED_STEP);
//       }
//     }
//     for (const system of this.systems) {
//       if (system.type === "before") system.process?.(delta);
//     }
//     for (const system of this.systems) {
//       if (system.type === "normal") system.process?.(delta);
//     }
//     for (const system of this.systems) {
//       if (system.type === "after") system.process?.(delta);
//     }
//   }

//   dispose() {
//     for (const system of this.systems) {
//       system.dispose?.();
//     }
//   }
// }

export interface System {
  process?(delta: number): void;
  dispose?(): void;
}

export type MaybePromise<T> = T | Promise<T>;
export type SystemFactory = () => MaybePromise<System>;

export class Manager<ContextType> {
  public static FIXED_STEP = 0.015;

  private _ctx: any = {};

  private beforeFuncs: SystemFactory[] = [];
  private afterFuncs: SystemFactory[] = [];

  private funcs: SystemFactory[] = [];
  private fixedStepFuncs: SystemFactory[] = [];

  private beforeSystems: System[] = [];
  private afterSystems: System[] = [];

  private systems: System[] = [];
  private fixedStepSystems: System[] = [];

  private initializing = false;
  private initialized = false;

  private accumulate = 0;

  public get context(): ContextType {
    return this._ctx;
  }

  register<K extends string, T>(
    key: K,
    dependency: T
  ): Manager<ContextType & { [key in K]: T }> {
    this._ctx[key] = dependency;
    return this as any;
  }

  onBefore(func: SystemFactory) {
    this.beforeFuncs.push(func);
  }

  onAfter(func: SystemFactory) {
    this.afterFuncs.push(func);
  }

  addSystem(func: SystemFactory, fixedStep = false) {
    if (fixedStep) {
      this.fixedStepFuncs.push(func);
    } else {
      this.funcs.push(func);
    }
  }

  private async initialize() {
    this.initializing = true;
    for (const func of this.beforeFuncs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.beforeSystems.push(result);
    }
    for (const func of this.funcs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.systems.push(result);
    }
    for (const func of this.fixedStepFuncs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.systems.push(result);
    }
    for (const func of this.afterFuncs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.afterSystems.push(result);
    }
    this.initializing = false;
    this.initialized = true;
  }

  process(delta: number) {
    if (!this.initialized && !this.initializing) {
      this.initialize();
      return;
    }
    if (!this.initialized) {
      return;
    }
    this.accumulate += delta;
    while (this.accumulate >= Manager.FIXED_STEP) {
      this.accumulate -= Manager.FIXED_STEP;
      for (const system of this.fixedStepSystems) {
        system.process?.(Manager.FIXED_STEP);
      }
    }
    for (const system of this.beforeSystems) {
      system.process?.(delta);
    }
    for (const system of this.systems) {
      system.process?.(delta);
    }
    for (const system of this.afterSystems) {
      system.process?.(delta);
    }
  }

  dispose() {
    for (const system of this.systems) {
      system.dispose?.();
    }

    for (const system of this.fixedStepSystems) {
      system.dispose?.();
    }

    for (const system of this.beforeSystems) {
      system.dispose?.();
    }

    for (const system of this.afterSystems) {
      system.dispose?.();
    }
  }
}
