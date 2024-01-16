export type CellState = "empty" | "gem" | "block";
export type Cell = {
  state: CellState;
  color?: number;
};
export type GameState = {
  board: Cell[];
  roster: [number, number, number, number];
  bossHealth: number;
  moves: number;
  selectedGems: number[];
  queuedGems: number[];
  emptyCells: number[];
};
