import {
  Color,
  MultiTextureBatch,
  ViewportInputHandler,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";
import { getAssets } from "./Assets";
import { WORLD_WIDTH, WORLD_HEIGHT } from "./Constants";
import { Manager } from "./system-manager";
import { GameRenderSystem } from "./system/GameRenderSystem";
import { InputSystem } from "./system/InputSystem";
import { registerHandleBoardSystem } from "./system/HandleBoardSystem";
import { Deferred, GemOffsetEffect, ZoomEffect } from "./util/types";
import { Board } from "./system/Board";

const init = async () => {
  const stage = createStage();
  const canvas = stage.getCanvas();

  const viewport = createViewport(canvas, WORLD_WIDTH, WORLD_HEIGHT, {
    crop: false,
  });

  const gl = viewport.getContext();
  const camera = viewport.getCamera();
  camera.setYDown(true);

  const assets = getAssets(gl);

  await assets.finishLoading();

  const batch = new MultiTextureBatch(gl);
  batch.setYDown(true);

  const inputHandler = new ViewportInputHandler(viewport);

  const gameState = {
    dragging: false,
    highlightedGem: -1,
    stateTime: 0,
    swapping: false,
    moves: 30,
  };

  const gameConfig = {
    started: false,
    ended: false,
  };

  const board = new Board(8, 8);
  board.randomBoard();

  const effects: GemOffsetEffect[] = [];
  const zoomEffect: ZoomEffect[] = [];
  const pendings: Deferred[] = [];
  const wait = (seconds: number) => {
    const deferred = new Deferred(seconds);
    pendings.push(deferred);
    return deferred.promise;
  };
  const GEM_COLORS = [Color.RED, Color.GREEN, Color.BLUE, Color.WHITE];

  const manager = new Manager()
    .register("camera", camera)
    .register("viewport", viewport)
    .register("gl", gl)
    .register("assets", assets)
    .register("batch", batch)
    .register("gameState", gameState)
    .register("board", board)
    .register("effects", effects)
    .register("zoomEffect", zoomEffect)
    .register("wait", wait)
    .register("gameConfig", gameConfig)
    .register("GEM_COLORS", GEM_COLORS)
    .register("inputHandler", inputHandler);

  gl.clearColor(0, 0, 0, 1);
  GameRenderSystem(manager);
  InputSystem(manager);
  registerHandleBoardSystem(manager);

  const loop = createGameLoop((delta: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    batch.setProjection(camera.combined);
    batch.begin();
    // update pendings
    for (let i = pendings.length - 1; i >= 0; i--) {
      const pending = pendings[i];
      pending.elapsed += delta;
      if (pending.elapsed >= pending.duration) {
        pending.resolve();
        pendings.splice(i, 1);
      }
    }
    // update effects
    for (let i = effects.length - 1; i >= 0; i--) {
      const effect = effects[i];
      effect.elapsed += delta;
      if (effect.elapsed >= effect.duration) {
        effect.elapsed = effect.duration;
        effects.splice(i, 1);
      }
    }
    for (let i = zoomEffect.length - 1; i >= 0; i--) {
      const effect = zoomEffect[i];
      effect.elapsed += delta;
      if (effect.elapsed >= effect.duration) {
        effect.elapsed = effect.duration;
        zoomEffect.splice(i, 1);
      }
    }

    manager.process(delta);
    batch.end();
  });

  return {
    manager,
    dispose() {
      loop.stop();
      batch.dispose();
      assets.dispose();
      manager.dispose();
      inputHandler.cleanup();
    },
  };
};

export type GameManager = Awaited<ReturnType<typeof init>>["manager"];
init();
