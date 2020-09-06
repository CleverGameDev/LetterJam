import { PlayStateEnum } from "../shared/constants";
import { Clue, FullClue, Stand, ClientGameState } from "../shared/models";

// E is an Enum of the Event names
export enum E {
  /* Events sent by Server */
  // General
  SyncGameState = "syncGameState",
  ChangeScene = "changeScene", // when a new scene should be loaded by all clients
  // TODO: Could replace ServeReady if sent to just new client

  /* Events sent by Clients */
  // General
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
  // General
  [E.ChangeScene]: {
    sceneKey: string;
  };
  [E.SyncGameState]: ClientGameState;

  // LobbyScene
  [E.PlayerJoined]: {
    playerID: string;
    playerName: string;
  };
  [E.PlayerLeft]: {
    playerID: string;
    playerName: string;
  };
  [E.SetPlayerName]: string;

  // GameScene
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
