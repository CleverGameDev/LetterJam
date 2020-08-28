import { Clue, Stand } from "../shared/models";

// E is an Enum of the Event names
export enum E {
  Ready = "ready",

  ChangeScene = "changeScene",

  GetVisibleLetters = "getVisibleLetters",
  VisibleLetters = "visibleLetters",

  Clues = "clues",
  UpdateClue = "updateClue",

  WinningVote = "winningVote",
  Vote = "vote",
}

// EType is a lookup from Event Name to Event Type
export type EType = {
  [E.Ready]: {
    id: string;
    scene: string;
    players: string[];
  };

  [E.ChangeScene]: {
    scene: string;
  };

  [E.VisibleLetters]: Stand[];

  [E.Clues]: { [playerID: string]: Clue };
  [E.UpdateClue]: Clue;

  [E.WinningVote]: {
    playerID: string;
    votes: number;
  };

  [E.Vote]: {
    senderID: string;
    votedID: string;
  };
};
