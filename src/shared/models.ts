import { PlayStateEnum } from "./constants";
import { Server } from "socket.io";
import { ServerGameState } from "../server/lib/gameState";
import e from "express";

export type Stand = {
  playerID: string;
  letter: Letter;
  currentCardIdx: number;
  totalCards: number;
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
  Wildcard = "*",
  Hidden = "?",
}

export type PlayerProperties = {
  Name: string;
};

export enum PlayerType {
  Player = "player",
  NPC = "npc",
  Bonus = "bonus",
  Wildcard = "wildcard",
}

export type GuessingSheet = {
  // after a clue is agreed upon, this stores each player's view of the clue
  hints: string[];
  notes: string[];
};

// TODO: separate client models, server models, and shared models
export type ClientGameState = {
  //
  // Common properties, shared across scenes
  //
  playerID: string;
  scene: string;
  players: { [playerID: string]: PlayerProperties };

  //
  // GameScene properties
  //
  visibleLetters: Stand[];
  playState: PlayStateEnum;
  clues: { [playerID: string]: ClueV2 }; // TODO: Currently, this leaks info to client
  votes: { [playerID: string]: number };
  guessingSheet: GuessingSheet;
  flower: Flower;
};

export type Flower = {
  red: number;
  green: number;
  greenLocked: number;
};

export type ClueV2 = {
  word: string;
  assignedStands: Stand[];
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
