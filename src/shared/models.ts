export type Stand = {
  player: string;
  playerType: PlayerType;
  letter: Letter;
};

// No J, Q, V, X, or Z
export enum Letter {
  A = "a",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
  G = "g",
  H = "h",
  I = "i",
  K = "k",
  L = "l",
  M = "m",
  N = "n",
  O = "o",
  P = "p",
  R = "r",
  S = "s",
  T = "t",
  U = "u",
  W = "w",
  Y = "y",
}

export type PlayerID = string;

export type PlayerProperties = {
  Name: string;
};

export enum PlayerType {
  Player = "player",
  NPC = "npc",
  Bonus = "bonus",
}

export type ClientGameState = {
  visibleLetters: Stand[];
};

export type Clue = {
  playerID: string;
  wordLength: number;
  numPlayers: number;
  numNPCs: number;
  numBonus: number;
  useWildcard: boolean;
};

export type FullClue = Clue & {
  word: string;
};
