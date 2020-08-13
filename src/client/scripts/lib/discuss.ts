import * as models from "src/shared/models";

// if false, clue is not valid
export const giveClue = (
  socket,
  id: string,
  word: string,
  gameState: models.GameState
): boolean => {
  const clue = generateClue(id, word, gameState);
  if (!clue) {
    return false;
  }
  // send clue to server. sending a second clue should override the first since
  // each player can only have one active clue
  socket.emit("updateClue", clue);
};

const generateClue = (
  id: string,
  word: string,
  gameState: models.GameState
): models.Clue | false => {
  // Don't check if the word is actually a word,
  // just check if it's valid given the game state
  let wildcard = "";
  const clue: models.Clue = {
    playerID: id,
    wordLength: word.length,
    numPlayers: 0,
    numNPCs: 0,
    numBonus: 0,
    useWildcard: false,
  };
  const playerTypeLetters = getLettersByPlayerType(gameState);
  const usedLetters = [];
  const normalizedWord = word.toLowerCase();

  // Doesn't properly work if different players have the same letter
  for (const c of normalizedWord) {
    if (usedLetters.indexOf(c) !== -1) {
      continue;
    }
    if (playerTypeLetters[models.PlayerType.Player].indexOf(c) !== -1) {
      clue.numPlayers++;
    } else if (playerTypeLetters[models.PlayerType.NPC].indexOf(c) !== -1) {
      clue.numNPCs++;
    } else if (playerTypeLetters[models.PlayerType.Bonus].indexOf(c) !== -1) {
      clue.numBonus++;
    } else {
      if (wildcard) {
        return false;
      }
      wildcard = c;
      clue.useWildcard = true;
    }
    usedLetters.push(c);
  }
  return clue;
};

// Helper function to separate visible letters by type of player
const getLettersByPlayerType = (gameState: models.GameState) => {
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
export const vote = (socket, senderID, votedID) => {
  socket.emit("vote", {
    senderID,
    votedID,
  });
};
