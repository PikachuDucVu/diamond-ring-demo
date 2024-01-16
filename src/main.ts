import {
  MultiTextureBatch,
  ViewportInputHandler,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";
import { getAssets } from "./Assets";
import { WORLD_WIDTH, WORLD_HEIGHT, BOARD_COLS, BOARD_ROWS } from "./Constants";
import { Manager } from "./system-manager";
import { GameRenderSystem } from "./system/GameRenderSystem";
import { InputSystem } from "./system/InputSystem";
import { Cell, GameState } from "./util/types";
import { registerHandleBoardSystem } from "./system/HandleBoardSystem";

const getBlockedCellIndices = (_level: number): number[] => {
  return [];
};

const createRandomInitialBoard = (
  level: number,
  roster: [number, number, number, number]
) => {
  const blockIndices = getBlockedCellIndices(level);
  const board: Cell[] = [];
  for (let i = 0; i < BOARD_COLS * BOARD_ROWS; i++) {
    if (blockIndices.includes(i)) {
      board.push({ state: "block" });
      continue;
    }
    const color = roster[Math.floor(Math.random() * roster.length)];
    board.push({ state: "gem", color });
  }
  return board;
};

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

  const gameState: GameState = {
    bossHealth: 100,
    moves: 0,
    roster: [0, 1, 2, 3],
    board: createRandomInitialBoard(1, [0, 1, 2, 3]),
    selectedGems: [],
    queuedGems: [],
    emptyCells: [],
  };

  const inputHandler = new ViewportInputHandler(viewport);

  const manager = new Manager()
    .register("camera", camera)
    .register("viewport", viewport)
    .register("gl", gl)
    .register("assets", assets)
    .register("batch", batch)
    .register("gameState", gameState)
    .register("inputHandler", inputHandler);

  // TODO: board render system
  // TODO: board input system, capture touched down, touched up, and dragged: mark cell as selected, go back, fire connected event
  // TODO: listen to connected event, mark cells as empty, new gems logic will be implemented later, effect spawning and damage logic will be implemented later too
  // TODO: line render system, outline

  gl.clearColor(0, 0, 0, 1);

  GameRenderSystem(manager);
  InputSystem(manager);
  registerHandleBoardSystem(manager);

  const loop = createGameLoop((delta: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    batch.setProjection(camera.combined);
    manager.process(delta);
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
