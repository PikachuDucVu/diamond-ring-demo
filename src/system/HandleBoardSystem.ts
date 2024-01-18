import { ZoomEffect } from "./../util/types";
import { GameManager } from "../main";
import { emitter } from "../util/emitter";
import { CELL_SIZE } from "../Constants";

export const registerHandleBoardSystem = (manager: GameManager) => {
  const board = manager.context.board;
  const gameState = manager.context.gameState;
  const zoomEffect = manager.context.zoomEffect;
  const effects = manager.context.effects;
  const wait = manager.context.wait;

  const checkAllBoard = async (type: "swapping" | "auto") => {
    const matches = board.checkAllMatches();

    if (matches.length === 0 && type === "swapping") {
      await wait(0.25);
      emitter.emit("rollBackGems");
      return;
    } else {
      for (let i = 0; i < matches.length; i += 1) {
        const cellsEmpty = [];
        for (let j = 0; j < matches[i].length; j += 2) {
          const col = matches[i][j];
          const row = matches[i][j + 1];
          board.changeGemType(col, row, "empty");
          cellsEmpty.push([col, row]);
          zoomEffect.push({
            index: row * board.col + col,
            fromScale: 1,
            toScale: -0.1,
            duration: 0.5,
            elapsed: 0,
          });
        }
      }
      await wait(0.25);

      for (let i = 0; i < board.row; i++) {
        for (let j = 0; j < board.col; j++) {
          if (board.getCellType(j, i) === "empty") {
            for (let k = i; k > 0; k--) {
              if (board.getCellType(j, k - 1) === "empty") continue;
              //push effect offset from start to end
              effects.push({
                index: j + k * board.col,
                fromOffsetX: 0,
                fromOffsetY: (CELL_SIZE / 1.5) * -(i - k),
                toOffsetX: 0,
                toOffsetY: 0,
                duration: 0.15 * (i - k),
                elapsed: 0,
              });
              board.changeGemType(j, k, "gem", board.getGemColor(j, k - 1));
              board.changeGemType(j, k - 1, "empty");
            }
          }
        }
      }
      // board.randomBoard();
      // if (hasEmpty) {
      //   await wait(0.5);
      //   emitter.emit("checkingBoard", "auto");
      // }
    }
  };

  emitter.on("checkingBoard", checkAllBoard);

  manager.addSystem(async () => {
    return {
      process() {},

      dispose() {
        emitter.off("checkingBoard", checkAllBoard);
      },
    };
  });
};
