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

export class ServerGameState {
  //
  // Common properties, shared across scenes
  //
  room: string;

  sceneIndex: number;
  players: Map<PlayerID, PlayerProperties>;
  numNPCs: number;

  //
  // GameScene properties
  //
  letters: {
    [id: string]: Letter[];
  };
  visibleLetterIdx: {
    [id: string]: number;
  };
  deck: Letter[];
  // redTokens,
  // greenTokens
  clues: { [playerID: string]: Clue };
  votes: { [playerID: string]: number };

  constructor() {
    this.sceneIndex = 0;
    this.room = "someRoom";
    this.players = new Map();
    this.numNPCs = 0;
    this.letters = {};
    this.visibleLetterIdx = {};
    this.deck = [];
    this.clues = {};
    this.votes = {};
  }

  getPlayerIDs() {
    return Array.from(this.players.keys());
  }

  getPlayerNames() {
    return this.getPlayerIDs().map((n) => this.players.get(n).Name);
  }

  resetVotesAndClues() {
    this.clues = {};
    this.votes = {};
  }
}
