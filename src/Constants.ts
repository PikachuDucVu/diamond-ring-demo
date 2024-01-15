import { Cell } from "./util/types";

export const WORLD_WIDTH = 500;
export const WORLD_HEIGHT = 1000;
export const BOARD_COLS = 8;
export const BOARD_ROWS = 8;
export const OFFSET = 10;

export const CELL_SIZE = (WORLD_WIDTH - OFFSET * 2) / BOARD_COLS;

export const CELL_COLORS = ["F5F7F8", "F4CE14", "495E57", "45474B"];
export const START_Y = (WORLD_HEIGHT - CELL_SIZE * BOARD_ROWS - OFFSET) / 2;

export const calculateGridPos = (x: number, y: number) => {
  const gridX = Math.floor((x - OFFSET) / CELL_SIZE);
  const gridY = Math.floor((y - START_Y) / CELL_SIZE);
  return { gridX, gridY };
};
