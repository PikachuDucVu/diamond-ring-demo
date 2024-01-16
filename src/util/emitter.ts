import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";

export type MessageEvents = {
  gameStart: () => void;
  checkingBoard: () => void;
  swapGems: (oldPos: number, newPos: number) => void;
  rollBackGems: () => void;
  spawnGems: () => void;
  moveEmptyCells: () => void;
};

export const emitter = new EventEmitter() as TypedEmitter<MessageEvents>;
