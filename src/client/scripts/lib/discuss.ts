import * as models from "../../../shared/models";
import { E, EType } from "../../../shared/events";

// if false, clue is not valid
export const giveClue = (
  socket: SocketIO.Socket,
  word: string,
  gameState: models.ClientGameState
): boolean => {
  const clue = generateClue(word, gameState);
  if (!clue) {
    return false;
  }

  // send clue to server. sending a second clue should override the first since
  // each player can only have one active clue
  socket.emit(E.UpdateClue, <models.ClueV2>clue);
};

const generateClue = (
  word: string,
  gameState: models.ClientGameState
): models.ClueV2 | false => {
  // Don't check if the word is actually a word,
  // just check if it's valid given the game state
  const normalizedWord = word.toLowerCase();

  const clueV2: models.ClueV2 = {
    word: word,
    assignedStands: [],
  };
  let wildcardLetter = "";
  for (const c of normalizedWord) {
    const s = getBestStand(gameState, c);

    // wild card case
    if (s.playerType == models.PlayerType.Wildcard) {
      if (wildcardLetter != "" && wildcardLetter != c) {
        // Wildcard can only be used for one letter
        return false;
      }
      wildcardLetter = c;
    }

    clueV2.assignedStands.push(s);
  }

  return clueV2;
};

const getBestStand = (
  gameState: models.ClientGameState,
  letter: string
): models.Stand => {
  for (let i = 0; i < gameState.visibleLetters.length; i++) {
    const stand = gameState.visibleLetters[i];
    if (stand.letter == letter) {
      return stand;
    }
  }

  return {
    player: "wildcard",
    playerType: models.PlayerType.Wildcard,
    letter: models.Letter.Wildcard,
  };
};

// Helper function to separate visible letters by type of player
const getLettersByPlayerType = (gameState: models.ClientGameState) => {
  const playerTypeLetters = {
    [models.PlayerType.Player]: [],
    [models.PlayerType.NPC]: [],
    [models.PlayerType.Bonus]: [],
  };
  for (const stand of gameState.visibleLetters) {
    playerTypeLetters[stand.playerType].push(stand.letter);
  }
  return playerTypeLetters;
};

// Send vote to server. PlayerID can be accessed from clue
export const vote = (
  socket: SocketIO.Socket,
  senderID: string,
  votedID: string
): void => {
  const v: EType[E.Vote] = {
    senderID,
    votedID,
  };
  socket.emit(E.Vote, v);
};
