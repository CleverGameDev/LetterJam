import { PlayStateEnum } from "../shared/constants";
import { Clue, FullClue, Stand, ClientGameState } from "../shared/models";

// E is an Enum of the Event names
export enum E {
  // Preload Scene
  ServerReady = "serverReady",

  // General
  SyncGameState = "syncGameState",
  ChangeScene = "changeScene",
  NextScene = "nextScene",

  // LobbyScene
  PlayerJoined = "playerJoined",
  PlayerLeft = "playerLeft",
  SetPlayerName = "setPlayerName",

  // GameScene
  GetVisibleLetters = "getVisibleLetters",
  ChangePlayState = "changePlayState",
  NextVisibleLetter = "nextVisibleLetter",
  UpdateClue = "updateClue",
  Vote = "vote",
  PlayerReady = "playerReady",
}

// EType is a lookup from Event Name to Event Type
export type EType = {
  [E.ServerReady]: ClientGameState;

  [E.SyncGameState]: ClientGameState;

  [E.ChangeScene]: {
    scene: string;
  };

  [E.PlayerJoined]: {
    playerID: string;
    playerName: string;
  };

  [E.PlayerLeft]: {
    playerID: string;
    playerName: string;
  };

  [E.SetPlayerName]: string;

  [E.ChangePlayState]: {
    playState: PlayStateEnum;
  };

  [E.NextVisibleLetter]: void;

  [E.UpdateClue]: FullClue;

  [E.Vote]: {
    senderID: string;
    votedID: string;
  };

  [E.PlayerReady]: void;
};
