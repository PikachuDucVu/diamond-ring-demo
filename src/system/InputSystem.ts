import { BOARD_COLS, BOARD_ROWS, calculateGridPos } from "../Constants";
import { GameManager } from "../main";
import { emitter } from "../util/emitter";

export const InputSystem = (manager: GameManager) => {
  manager.addSystem(async () => {
    const inputHandler = manager.context.inputHandler;
    const gameState = manager.context.gameState;

    let color = -1;

    const lastMove = [-1, -1];

    const rollBackMove = () => {
      if (lastMove[0] === -1 || lastMove[1] === -1) {
        return;
      }
      const temp = gameState.board[lastMove[0]];
      gameState.board[lastMove[0]] = gameState.board[lastMove[1]];
      gameState.board[lastMove[1]] = temp;

      gameState.selectedGems.length = 0;
      lastMove[0] = -1;
      lastMove[1] = -1;
    };
    emitter.on("rollBackGems", rollBackMove);

    return {
      process() {
        if (inputHandler.isTouched()) {
          const { x, y } = inputHandler.getTouchedWorldCoord();
          const { gridX, gridY } = calculateGridPos(x, y);
          console.log(gridX + gridY * BOARD_COLS);
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
          if (gameState.selectedGems.length === 2) {
            lastMove[0] = gameState.selectedGems[0];
            lastMove[1] = gameState.selectedGems[1];
            console.log(lastMove);

            emitter.emit(
              "swapGems",
              gameState.selectedGems[0],
              gameState.selectedGems[1]
            );
            color = -1;
          }
        }
      },
      dispose() {
        emitter.off("rollBackGems", rollBackMove);
      },
    };
  });
};
