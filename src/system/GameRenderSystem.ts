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

export const GameRenderSystem = (manager: GameManager) => {
  manager.addSystem(async () => {
    const batch = manager.context.batch;
    const whiteTexture = Texture.createWhiteTexture(manager.context.gl);
    const gameState = manager.context.gameState;
    const gl = manager.context.gl;

    const shapeRenderer = new ShapeRenderer(gl);

    return {
      process() {
        batch.begin();
        // draw grid game board
        for (let i = 0; i < BOARD_COLS * BOARD_ROWS; i++) {
          if (
            gameState.board[i].state === "block" ||
            gameState.board[i].state === "empty"
          ) {
            continue;
          }
          const color = gameState.board[i].color as number;
          batch.setColor(Color.fromString(CELL_COLORS[color]));
          batch.draw(
            whiteTexture,
            CELL_SIZE * (i % BOARD_COLS) + OFFSET * 1.5,
            START_Y + Math.floor(i / BOARD_COLS) * CELL_SIZE,
            CELL_SIZE - OFFSET,
            CELL_SIZE - OFFSET
          );
        }

        batch.end();

        shapeRenderer.setProjection(manager.context.camera.combined);
        shapeRenderer.begin();

        shapeRenderer.end();
      },

      dispose() {},
    };
  });
};
