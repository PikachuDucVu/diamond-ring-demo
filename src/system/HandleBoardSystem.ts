import { Color, ShapeRenderer, Texture } from "gdxts";
import { GameManager } from "../main";
import {
  BOARD_COLS,
  BOARD_ROWS,
  CELL_COLORS,
  CELL_SIZE,
  OFFSET,
  START_Y,
} from "../Constants";

export const registerHandleBoardSystem = (manager: GameManager) => {
  manager.addSystem(async () => {
    const gameState = manager.context.gameState;

    return {
      process() {},

      dispose() {},
    };
  });
};
