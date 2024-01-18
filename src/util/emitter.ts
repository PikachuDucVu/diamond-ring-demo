import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";

export type MessageEvents = {
  checkingBoard: (type: "swapping" | "auto") => void;
  rollBackGems: () => void;
};

export const emitter = new EventEmitter() as TypedEmitter<MessageEvents>;
