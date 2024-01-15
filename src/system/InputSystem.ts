import {
  BOARD_COLS,
  BOARD_ROWS,
  calculateGridPos,
  checkAllMatches,
} from "../Constants";
import { GameManager } from "../main";

export const InputSystem = (manager: GameManager) => {
  manager.addSystem(async () => {
    const batch = manager.context.batch;
    const inputHandler = manager.context.inputHandler;
    const gameState = manager.context.gameState;

    let color = -1;

    checkAllMatches(gameState.board, gameState.queuedGems);

    return {
      process() {
        if (inputHandler.isTouched()) {
          const { x, y } = inputHandler.getTouchedWorldCoord();
          const { gridX, gridY } = calculateGridPos(x, y);
          if (
            gridX < 0 ||
            gridX >= BOARD_COLS ||
            gridY < 0 ||
            gridY >= BOARD_COLS
          ) {
            return;
          }
          if (
            color === -1 &&
            gameState.board[gridX + gridY * BOARD_COLS].state === "gem" &&
            gameState.selectedGems.length === 0
          ) {
            color = gameState.board[gridX + gridY * BOARD_COLS].color as number;
            gameState.selectedGems.push(gridX + gridY * BOARD_COLS);
          }

          if (
            gameState.selectedGems.length === 1 &&
            gameState.selectedGems[0] !== gridX + gridY * BOARD_COLS &&
            gameState.board[gridX + gridY * BOARD_COLS].state === "gem" &&
            (gameState.selectedGems[0] === gridX + (gridY + 1) * BOARD_COLS ||
              gameState.selectedGems[0] === gridX + (gridY - 1) * BOARD_COLS ||
              gameState.selectedGems[0] === gridX + 1 + gridY * BOARD_COLS ||
              gameState.selectedGems[0] === gridX - 1 + gridY * BOARD_COLS)
          ) {
            gameState.selectedGems.push(gridX + gridY * BOARD_COLS);
          }
        } else {
          // swap gem positions
          if (gameState.selectedGems.length === 2) {
            const oldPos = gameState.selectedGems[0];
            const newPos = gameState.selectedGems[1];
            const temp = gameState.board[oldPos].color;
            gameState.board[oldPos].color = gameState.board[newPos].color;
            gameState.board[newPos].color = temp;

            const matches: number[] = [];
            matches.push(newPos);
            let countGems = 1;

            // check around up down right left, if same gems add at matches
            // check next pos in row
            for (
              let i = newPos + 1;
              i < Math.floor(newPos / BOARD_COLS) * BOARD_COLS + BOARD_COLS;
              i++
            ) {
              if (gameState.board[i].color === gameState.board[newPos].color) {
                countGems++;
                console.log("next row", countGems);
                if (countGems >= 2) {
                  matches.push(i);
                }
              } else {
                break;
              }
            }
            // check previous pos in row
            countGems = 1;
            for (
              let i = newPos - 1;
              i >= Math.floor(newPos / BOARD_COLS) * BOARD_COLS;
              i--
            ) {
              if (gameState.board[i].color === gameState.board[newPos].color) {
                countGems++;
                console.log("previos row", countGems);

                if (countGems >= 2) {
                  matches.push(i);
                }
              } else {
                break;
              }
            }
            // check next pos in col
            countGems = 1;
            for (
              let i = newPos + BOARD_COLS;
              i < BOARD_COLS * BOARD_ROWS;
              i += BOARD_COLS
            ) {
              if (gameState.board[i].color === gameState.board[newPos].color) {
                countGems++;
                console.log("next col", countGems);

                if (countGems >= 2) {
                  matches.push(i);
                }
              } else {
                break;
              }
            }
            // check previous pos in col
            countGems = 1;
            for (let i = newPos - BOARD_COLS; i >= 0; i -= BOARD_COLS) {
              if (gameState.board[i].color === gameState.board[newPos].color) {
                countGems++;
                console.log("back row", countGems);

                if (countGems >= 2) {
                  matches.push(i);
                }
              } else {
                break;
              }
            }

            if (matches.length >= 3) {
              for (let i = 0; i < matches.length; i++) {
                gameState.board[matches[i]].state = "empty";
              }
            } else {
              setTimeout(() => {
                const temp = gameState.board[oldPos].color;
                gameState.board[oldPos].color = gameState.board[newPos].color;
                gameState.board[newPos].color = temp;
              }, 500);
            }
          }

          color = -1;
          gameState.selectedGems = [];
        }
      },
      dispose() {},
    };
  });
};
