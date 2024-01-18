import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  BOARD_X,
  BOARD_Y,
  CELL_SIZE,
  DRAG_THRESHOLD,
  GAP,
} from "../Constants";
import { GameManager } from "../main";
import { emitter } from "../util/emitter";

export const InputSystem = (manager: GameManager) => {
  const inputHandler = manager.context.inputHandler;
  const board = manager.context.board;
  const gameState = manager.context.gameState;
  const wait = manager.context.wait;
  const effects = manager.context.effects;
  const gameConfig = manager.context.gameConfig;

  const lastChangedGem = {
    oldX: -1,
    oldY: -1,
    newX: -1,
    newY: -1,
  };

  const swapTiles = async (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    action: "swap" | "rollBack" = "swap"
  ) => {
    // spawn effects
    gameState.swapping = true;
    const offsetX = (toX - fromX) * (CELL_SIZE + GAP);
    const offsetY = (toY - fromY) * (CELL_SIZE + GAP);
    effects.push({
      index: fromY * board.col + fromX,
      fromOffsetX: 0,
      fromOffsetY: 0,
      toOffsetX: offsetX,
      toOffsetY: offsetY,
      duration: 0.2,
      elapsed: 0,
    });
    effects.push({
      index: toY * board.col + toX,
      fromOffsetX: 0,
      fromOffsetY: 0,
      toOffsetX: -offsetX,
      toOffsetY: -offsetY,
      duration: 0.2,
      elapsed: 0,
    });

    // wait for effect to finish
    await wait(0.2);

    // update board
    if (
      board.getCellType(fromX, fromY) !== "gem" ||
      board.getCellType(toX, toY) !== "gem"
    ) {
      return;
    }

    const fromColor = board.getGemColor(fromX, fromY);
    const toColor = board.getGemColor(toX, toY);
    board.setCell(fromX, fromY, "gem", toColor);
    board.setCell(toX, toY, "gem", fromColor);
    if (action === "swap") {
      emitter.emit("checkingBoard", "swapping");
    }
    gameState.swapping = false;
  };

  setTimeout(() => {
    emitter.emit("checkingBoard", "auto");
    gameConfig.started = true;
  }, 1000);

  const handleRollBack = async () => {
    if (lastChangedGem.oldX === -1) {
      return;
    }
    const { oldX, oldY, newX, newY } = lastChangedGem;
    await swapTiles(newX, newY, oldX, oldY, "rollBack");
    lastChangedGem.oldX = -1;
    lastChangedGem.oldY = -1;
    lastChangedGem.newX = -1;
    lastChangedGem.newY = -1;
  };

  emitter.on("rollBackGems", handleRollBack);

  manager.addSystem(async () => {
    return {
      process(delta: number) {
        // process inputs
        if (
          inputHandler.isTouched() &&
          gameConfig.started &&
          !gameConfig.ended
        ) {
          if (!gameState.dragging && !gameState.swapping) {
            const touched = inputHandler.getTouchedWorldCoord();
            const x = touched.x;
            const y = touched.y;
            if (
              x >= BOARD_X &&
              x <= BOARD_X + BOARD_WIDTH &&
              y >= BOARD_Y &&
              y <= BOARD_Y + BOARD_HEIGHT
            ) {
              const col = Math.floor((x - BOARD_X) / (CELL_SIZE + GAP));
              const row = Math.floor((y - BOARD_Y) / (CELL_SIZE + GAP));
              if (
                board.getCellType(col, row) === "gem" &&
                col >= 0 &&
                row >= 0 &&
                col < board.col &&
                row < board.row
              ) {
                gameState.dragging = true;
                gameState.highlightedGem = row * board.col + col;
              }
            }
          } else if (gameState.highlightedGem !== -1) {
            gameState.stateTime += delta;
            const touched = inputHandler.getTouchedWorldCoord();
            const x = touched.x;
            const y = touched.y;
            const gridX = Math.floor((x - BOARD_X) / (CELL_SIZE + GAP));
            const gridY = Math.floor((y - BOARD_Y) / (CELL_SIZE + GAP));
            const gridCenterX =
              BOARD_X + GAP + gridX * (CELL_SIZE + GAP) + CELL_SIZE / 2;
            const gridCenterY =
              BOARD_Y + GAP + gridY * (CELL_SIZE + GAP) + CELL_SIZE / 2;

            const highlightedGridX = gameState.highlightedGem % board.col;
            const highlightedGridY = Math.floor(
              gameState.highlightedGem / board.col
            );

            const sameCell =
              gridX === highlightedGridX && gridY === highlightedGridY;
            const nearCell =
              (Math.abs(highlightedGridX - gridX) === 1 ||
                Math.abs(highlightedGridY - gridY) === 1) &&
              (Math.abs(highlightedGridX - gridX) === 0 ||
                Math.abs(highlightedGridY - gridY) === 0);

            const validCell =
              gridX >= 0 &&
              gridX < board.col &&
              gridY >= 0 &&
              gridY < board.row &&
              board.getCellType(gridX, gridY) === "gem" &&
              board.getCellType(highlightedGridX, highlightedGridY) === "gem";

            if (!sameCell && nearCell && validCell) {
              const distance = Math.sqrt(
                (gridCenterX - x) ** 2 + (gridCenterY - y) ** 2
              );
              if (distance < DRAG_THRESHOLD * CELL_SIZE) {
                gameState.highlightedGem = -1;
                gameState.stateTime = 0;

                lastChangedGem.oldX = highlightedGridX;
                lastChangedGem.oldY = highlightedGridY;
                lastChangedGem.newX = gridX;
                lastChangedGem.newY = gridY;
                swapTiles(highlightedGridX, highlightedGridY, gridX, gridY);
              }
            }
          }
        } else {
          if (gameState.dragging) {
            gameState.dragging = false;
            gameState.highlightedGem = -1;
            gameState.stateTime = 0;
          }
        }
      },
      dispose() {},
    };
  });
};
