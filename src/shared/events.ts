import { Clue, Stand } from "../shared/models";

// E is an Enum of the Event names
export enum E {
  ChangeScene = "changeScene",

  GetVisibleLetters = "getVisibleLetters",
  VisibleLetters = "visibleLetters",

  Clues = "clues",
  UpdateClue = "updateClue",

  WinningVote = "winningVote",
}

// EType is a lookup from Event Name to Event Type
export type EType = {
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
};
