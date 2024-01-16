import { BOARD_COLS } from "../Constants";
import { GameManager } from "../main";
import { emitter } from "../util/emitter";
import { Cell } from "../util/types";

export const registerHandleBoardSystem = (manager: GameManager) => {
  const gameState = manager.context.gameState;
  let matched = false;

  const checkMatches = (board: Cell[]) => {
    const matches: number[] = [];
    let countMatchesGemPerTime = 0;
    for (let i = 0; i < board.length; i++) {
      countMatchesGemPerTime = 1;
      matches.length = 0;
      if (board[i].state === "gem") {
        matches.push(i);

        for (
          let j = i + 1;
          j < Math.floor(i / BOARD_COLS) * BOARD_COLS + BOARD_COLS;
          j++
        ) {
          if (board[i].color === board[j].color && board[j].state === "gem") {
            matches.push(j);
            countMatchesGemPerTime++;
            continue;
          } else {
            break;
          }
        }
        // check next pos in column
        if (countMatchesGemPerTime < 3) {
          countMatchesGemPerTime = 1;
        }
        for (let j = i + BOARD_COLS; j < board.length; j += BOARD_COLS) {
          if (board[i].color === board[j].color && board[j].state === "gem") {
            matches.push(j);
            countMatchesGemPerTime++;
            continue;
          } else {
            break;
          }
        }

        if (countMatchesGemPerTime >= 3) {
          gameState.queuedGems.push(...matches);
          matched = true;
        }
      }
    }
  };

  const swapGems = (index1: number, index2: number) => {
    const temp = gameState.board[index1];
    gameState.board[index1] = gameState.board[index2];
    gameState.board[index2] = temp;
    // gameState.moves++;
    emitter.emit("checkingBoard");
    gameState.selectedGems.length = 0;
  };

  emitter.on("swapGems", swapGems);

  const moveEmptyCells = () => {
    if (!gameState.emptyCells.length) {
      return;
    }
    for (let i = 0; i < gameState.emptyCells.length; i++) {
      const index = gameState.emptyCells[i];
      const currentRow = Math.floor(index / BOARD_COLS);
      const currentCol = index % BOARD_COLS;
      for (let j = currentRow; j > 0; j--) {
        const indexAbove = j * BOARD_COLS + currentCol;
        const indexCurrent = (j - 1) * BOARD_COLS + currentCol;
        gameState.board[indexAbove] = gameState.board[indexCurrent];
      }
      gameState.board[currentCol] = { state: "empty" };
    }
    gameState.emptyCells.length = 0;
    emitter.emit("spawnGems");
  };
  emitter.on("moveEmptyCells", moveEmptyCells);

  const spawnNewGems = () => {
    for (let i = 0; i < gameState.board.length; i++) {
      if (gameState.board[i].state === "empty") {
        const randomColor = Math.floor(Math.random() * 4);
        gameState.board[i] = {
          state: "gem",
          color: randomColor,
        };
      }
    }
    emitter.emit("checkingBoard");
  };
  emitter.on("spawnGems", spawnNewGems);

  const handleCheckBoard = () => {
    checkMatches(gameState.board);

    if (gameState.queuedGems.length) {
      setTimeout(() => {
        for (let i = 0; i < gameState.queuedGems.length; i++) {
          gameState.board[gameState.queuedGems[i]].state = "empty";
          gameState.emptyCells.push(gameState.queuedGems[i]);
        }
        gameState.queuedGems.length = 0;
        setTimeout(() => {
          emitter.emit("moveEmptyCells");
        }, 200);
      }, 500);
    } else {
      if (!matched) {
        setTimeout(() => {
          emitter.emit("rollBackGems");
        }, 500);
      }
      matched = false;
    }
  };

  manager.addSystem(async () => {
    emitter.on("checkingBoard", handleCheckBoard);
    emitter.emit("checkingBoard");

    return {
      process() {},

      dispose() {
        emitter.off("checkingBoard", handleCheckBoard);
        emitter.off("swapGems", swapGems);
        emitter.off("moveEmptyCells", moveEmptyCells);
      },
    };
  });
};
