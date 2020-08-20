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

export enum PlayerType {
  Player = "player",
  NPC = "npc",
  Bonus = "bonus",
}

export type GameState = {
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

// I think we can combine letters and visibleIndex into one field
// where the value is a tuple of the two but I couldn't think of
// a good name for it
export type ServerGameState = {
  numPlayers: number;
  numNPCs: number;
  letters: {
    [id: string]: Letter[];
  };
  visibleIndex: {
    [id: string]: number;
  };
  deck: Letter[];
  // redTokens,
  // greenTokens
};
