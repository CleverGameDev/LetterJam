import { PlayStateEnum } from "../shared/constants";
import * as m from "../shared/models";

// E is an Enum of the Event names
export enum E {
  /* Events sent by Server */
  // General
  SyncGameState = "syncGameState",
  ChangeScene = "changeScene", // when a new scene should be loaded by all clients

  /* Events sent by Clients */
  // General
  NextScene = "nextScene",

  // LobbyScene
  PlayerJoined = "playerJoined",
  PlayerLeft = "playerLeft",
  SetPlayerName = "setPlayerName",

  // GameScene
  ChangePlayState = "changePlayState",
  NextVisibleLetter = "nextVisibleLetter",
  UpdateClue = "updateClue",
  Vote = "vote",
  PlayerReady = "playerReady",
  UpdateClueNote = "updateClueNote",
}

// EType is a lookup from Event Name to Event Type
export type EType = {
  // General
  [E.ChangeScene]: {
    sceneKey: string;
  };
  [E.SyncGameState]: m.ClientGameState;

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
  [E.UpdateClue]: m.ClueV2;
  [E.Vote]: {
    senderID: string;
    votedName: string;
  };
  [E.PlayerReady]: void;
  [E.UpdateClueNote]: {
    clueIdx: number;
    note: string;
  };
};
