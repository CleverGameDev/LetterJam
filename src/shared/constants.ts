import { Letter } from "./models";

export const COLOR_PRIMARY = 0x1565c0;
export const COLOR_HOVER = 0xfffff;
export const COLOR_SECONDARY = 0x003c8f;

export const LetterDistribution = {
  [Letter.A]: 4,
  [Letter.B]: 2,
  [Letter.C]: 3,
  [Letter.D]: 3,
  [Letter.E]: 6,
  [Letter.F]: 2,
  [Letter.G]: 2,
  [Letter.H]: 3,
  [Letter.I]: 4,
  [Letter.K]: 2,
  [Letter.L]: 3,
  [Letter.M]: 2,
  [Letter.N]: 3,
  [Letter.O]: 4,
  [Letter.P]: 2,
  [Letter.R]: 4,
  [Letter.S]: 4,
  [Letter.T]: 4,
  [Letter.U]: 3,
  [Letter.W]: 2,
  [Letter.Y]: 2,
};

export const VictoryPoints = {
  2: {
    "0-7": 0,
    "8-16": 1,
    "17-25": 2,
    "26-34": 3,
    "35-42": 4,
    "43-500": 5,
  },
  3: {
    "0-12": 0,
    "13-24": 1,
    "25-36": 2,
    "37-48": 3,
    "49-60": 4,
    "61-500": 5,
  },
  4: {
    "0-15": 0,
    "16-31": 1,
    "32-47": 2,
    "48-63": 3,
    "64-79": 4,
    "80-500": 5,
  },
  5: {
    "0-19": 0,
    "20-39": 1,
    "40-59": 2,
    "60-79": 3,
    "80-99": 4,
    "100-500": 5,
  },
  6: {
    "0-22": 0,
    "23-45": 1,
    "46-68": 2,
    "69-91": 3,
    "92-114": 4,
    "115-500": 5,
  },
};

export const VictoryPhrase = {
  1: "edible",
  2: "tasty",
  3: "yummy",
  4: "delicious",
  5: "supersweet",
};

export const BaseNPCCards = 7;
export const NPCCardGrowth = 1;
export const MaxPlayers = 6;
export const DefaultPlayerNames = [
  "Elephant",
  "Frog",
  "Lion",
  "Horse",
  "Squid",
];
export const NPCPlayerIDPrefix = "NPC ";
export const WildcardPlayerID = "Wildcard";
export const WildcardPlayerName = "Wild";

export enum SceneEnum {
  LobbyScene = "LobbyScene",
  SetupScene = "SetupScene",
  GameScene = "GameScene",
  EndScene = "EndScene",
}

export const Scenes = [
  SceneEnum.LobbyScene,
  SceneEnum.SetupScene,
  SceneEnum.GameScene,
  SceneEnum.EndScene,
];

export enum PlayStateEnum {
  DISCUSS = "discuss",
  PROVIDE_HINT = "provide_hint",
  INTERPRET_HINT = "interpret_hint",
  CHECK_END_CONDITION = "check_end_condition",
}

export const PlayStates = [
  PlayStateEnum.DISCUSS,
  PlayStateEnum.PROVIDE_HINT,
  PlayStateEnum.INTERPRET_HINT,
  PlayStateEnum.CHECK_END_CONDITION,
];

export const WildcardStand = {
  playerID: WildcardPlayerID,
  letter: Letter.Wildcard,
  currentCardIdx: 1,
  totalCards: 1,
};
