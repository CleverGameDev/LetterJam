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
  sceneIndex: number;

  players: Map<PlayerID, PlayerProperties>;
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

  clues: { [playerID: string]: Clue };
  votes: { [playerID: string]: number };
};

export const getPlayerIDs = (s: ServerGameState) =>
  Array.from(s.players.keys());
export const getPlayerNames = (s: ServerGameState) =>
  getPlayerIDs(s).map((n) => s.players.get(n).Name);

export const resetVotesAndClues = (s: ServerGameState) => {
  s.clues = {};
  s.votes = {};
};
