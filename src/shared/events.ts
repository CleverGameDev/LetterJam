import { PlayStateEnum } from "../shared/constants";
import { Clue, FullClue, Stand } from "../shared/models";

// E is an Enum of the Event names
export enum E {
  ServerReady = "serverReady",

  ChangeScene = "changeScene",
  NextScene = "nextScene",

  PlayerJoined = "playerJoined",
  PlayerLeft = "playerLeft",

  SetPlayerName = "setPlayerName",
  PlayerRenamed = "playerRenamed",

  GetVisibleLetters = "getVisibleLetters",
  VisibleLetters = "visibleLetters",

  ChangePlayState = "changePlayState",

  LetterOrdering = "letterOrdering",
  NextVisibleLetter = "nextVisibleLetter",

  Clues = "clues",
  UpdateClue = "updateClue",

  WinningVote = "winningVote",
  Vote = "vote",

  PlayerReady = "playerReady",
}

// EType is a lookup from Event Name to Event Type
export type EType = {
  [E.ServerReady]: {
    id: string;
    scene: string;
    players: string[];
  };

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
  [E.PlayerRenamed]: {
    playerID: string;
    oldPlayerName: string;
    newPlayerName: string;
  };

  [E.VisibleLetters]: Stand[];

  [E.ChangePlayState]: {
    playState: PlayStateEnum;
  };

  [E.NextVisibleLetter]: void;

  [E.LetterOrdering]: string[];

  [E.Clues]: { [playerID: string]: Clue };
  [E.UpdateClue]: FullClue;

  [E.WinningVote]: {
    playerID: string;
    votes: number;
  };

  [E.Vote]: {
    senderID: string;
    votedID: string;
  };

  [E.PlayerReady]: void;
};
