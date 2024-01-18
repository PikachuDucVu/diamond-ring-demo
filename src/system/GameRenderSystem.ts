import { Texture, Vector2 } from "gdxts";
import { GameManager } from "../main";

import { Easing, lerp } from "../util/math";
import { BOARD_X, GAP, CELL_SIZE, BOARD_Y } from "../Constants";

export const GameRenderSystem = (manager: GameManager) => {
  manager.addSystem(async () => {
    const gl = manager.context.gl;
    const batch = manager.context.batch;
    const board = manager.context.board;
    const effects = manager.context.effects;
    const zoomEffect = manager.context.zoomEffect;
    const whiteTexture = Texture.createWhiteTexture(gl);
    const gameState = manager.context.gameState;
    const GEM_COLORS = manager.context.GEM_COLORS;

    const offsetVector = new Vector2(0, 0);
    const getCurrentOffset = (index: number) => {
      offsetVector.set(0, 0);
      for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        if (effect.index === index) {
          offsetVector.set(
            lerp(
              effect.fromOffsetX,
              effect.toOffsetX,
              effect.elapsed / effect.duration
            ),
            lerp(
              effect.fromOffsetY,
              effect.toOffsetY,
              effect.elapsed / effect.duration
            )
          );
          break;
        }
      }
      return offsetVector;
    };

    const getScale = (index: number) => {
      let scale = 0;
      for (let i = zoomEffect.length - 1; i >= 0; i--) {
        const effect = zoomEffect[i];
        if (effect.index === index) {
          scale = lerp(
            effect.fromScale,
            effect.toScale,
            effect.elapsed / effect.duration
          );
          break;
        }
      }
      return scale;
    };

    return {
      process() {
        for (let x = 0; x < board.col; x++) {
          for (let y = 0; y < board.row; y++) {
            const highlighted = gameState.highlightedGem === y * board.col + x;
            if (highlighted) continue;
            const cellType = board.getCellType(x, y);
            if (cellType === "gem") {
              const color = board.getGemColor(x, y);
              const offset = getCurrentOffset(y * board.col + x);
              batch.setColor(GEM_COLORS[color]);
              batch.draw(
                whiteTexture,
                BOARD_X + GAP + x * (CELL_SIZE + GAP) + offset.x,
                BOARD_Y + GAP + y * (CELL_SIZE + GAP) + offset.y,
                CELL_SIZE,
                CELL_SIZE
              );
            } else if (cellType === "empty") {
              const offset = getCurrentOffset(y * board.col + x);
              const color = board.getGemColor(x, y);
              batch.setColor(GEM_COLORS[color]);
              batch.draw(
                whiteTexture,
                BOARD_X + GAP + x * (CELL_SIZE + GAP) + offset.x,
                BOARD_Y + GAP + y * (CELL_SIZE + GAP) + offset.y,
                CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE / 2,
                CELL_SIZE / 2,
                0,
                getScale(y * board.col + x),
                getScale(y * board.col + x)
              );
            }
          }
        }
        for (let x = 0; x < board.col; x++) {
          for (let y = 0; y < board.row; y++) {
            const highlighted = gameState.highlightedGem === y * board.col + x;
            if (highlighted) {
              const color = board.getGemColor(x, y);
              batch.setColor(GEM_COLORS[color]);
              batch.draw(
                whiteTexture,
                BOARD_X + GAP + x * (CELL_SIZE + GAP),
                BOARD_Y + GAP + y * (CELL_SIZE + GAP),
                CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE / 2,
                CELL_SIZE / 2,
                lerp(
                  -Math.PI / 32,
                  Math.PI / 32,
                  Easing.Sinusoidal.Out(gameState.stateTime * 5) + 0.5
                ),
                1.2,
                1.2
              );
              continue;
            }
          }
        }
      },

      dispose() {},
    };
  });
};
