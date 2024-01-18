import { GEM_COLORS_COUNT } from "../Constants";
import { emitter } from "../util/emitter";
import { CellType } from "../util/types";

export class Board {
  private cellTypes: CellType[] = [];
  private gemColors: number[] = [];
  constructor(public col: number, public row: number) {
    this.cellTypes = new Array(col * row).fill("empty");
    this.gemColors = new Array(col * row).fill(-1);
  }
  randomBoard() {
    for (let i = 0; i < this.cellTypes.length; i++) {
      if (this.cellTypes[i] === "empty") {
        this.cellTypes[i] = "gem";
        this.gemColors[i] = Math.floor(Math.random() * GEM_COLORS_COUNT);
      }
    }
  }
  getCellType(col: number, row: number) {
    return this.cellTypes[row * this.col + col];
  }
  getGemColor(col: number, row: number) {
    return this.gemColors[row * this.col + col];
  }
  setCell(x: number, y: number, cellType: CellType, gemColor: number = -1) {
    this.cellTypes[y * this.col + x] = cellType;
    this.gemColors[y * this.col + x] = gemColor;
  }
  private checkRow(row: number) {
    const match = [];
    for (let i = 0; i < this.col; i++) {
      if (this.getCellType(i, row) === "gem") {
        if (i === 0) {
          match.push([i, row]);
        } else {
          const prev = this.getGemColor(i - 1, row);
          const curr = this.getGemColor(i, row);
          if (prev === curr) {
            if (match.length === 0) {
              match.push([i - 1, row]);
            } else {
              match[match.length - 1].push(i, row);
            }
          } else {
            match.push([i, row]);
          }
        }
      }
    }
    return match.filter((m) => m.length >= 3 * 2);
  }

  private checkCol(col: number) {
    const match = [];
    for (let i = 0; i < this.row; i++) {
      if (this.getCellType(col, i) === "gem") {
        if (i === 0) {
          match.push([col, i]);
        } else {
          const prev = this.getGemColor(col, i - 1);
          const curr = this.getGemColor(col, i);
          if (prev === curr) {
            if (match.length === 0) {
              match.push([col, i - 1]);
            } else {
              match[match.length - 1].push(col, i);
            }
          } else {
            match.push([col, i]);
          }
        }
      }
    }
    return match.filter((m) => m.length >= 3 * 2);
  }

  checkAllMatches() {
    const matches: number[][] = [];
    for (let i = 0; i < this.row; i++) {
      const rowMatches = this.checkRow(i);
      matches.push(...rowMatches);
    }
    for (let i = 0; i < this.col; i++) {
      const colMatches = this.checkCol(i);
      matches.push(...colMatches);
    }
    return matches;
  }

  changeGemType(
    col: number,
    row: number,
    type: CellType,
    color = this.getGemColor(col, row)
  ) {
    this.setCell(col, row, type, color);
  }

  moveEmptyCell() {
    let hasEmpty = false;
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.getCellType(j, i) === "empty") {
          for (let k = i; k > 0; k--) {
            if (this.getCellType(j, k - 1) === "empty") continue;
            this.changeGemType(j, k, "gem", this.getGemColor(j, k - 1));
            this.changeGemType(j, k - 1, "empty");
            hasEmpty = true;
          }
        }
      }
    }
    return hasEmpty;
  }
}
