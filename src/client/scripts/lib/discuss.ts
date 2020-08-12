type Stand = {
  player: string;
  playerType: PlayerType;
  letter: Letter;
};

// No J, Q, V, X, or Z
enum Letter {
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  K,
  L,
  M,
  N,
  O,
  P,
  R,
  S,
  T,
  U,
  W,
  Y,
}

enum PlayerType {
  Player,
  NPC,
  Bonus,
}

type GameState = {
  visibleLetters: Stand[];
};

type Clue = {
  playerID: string;
  wordLength: number;
  numPlayers: number;
  numNPCs: number;
  numBonus: number;
  useWildcard: boolean;
};

// if false, clue is not valid
export const giveClue = (
  id: string,
  word: string,
  gameState: GameState
): boolean => {
  const clue = generateClue(id, word, gameState);
  if (!clue) {
    return false;
  }
  // send clue to server. sending a second clue should override the first since
  // each player can only have one active clue
};

const generateClue = (id, word: string, gameState: GameState): Clue | false => {
  // Don't check if the word is actually a word,
  // just check if it's valid given the game state
  let wildcard = "";
  const clue: Clue = {
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
    if (playerTypeLetters[PlayerType.Player].indexOf(c) !== -1) {
      clue.numPlayers++;
    } else if (playerTypeLetters[PlayerType.NPC].indexOf(c) !== -1) {
      clue.numNPCs++;
    } else if (playerTypeLetters[PlayerType.Bonus].indexOf(c) !== -1) {
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
const getLettersByPlayerType = (gameState: GameState) => {
  const playerTypeLetters = {
    [PlayerType.Player]: [],
    [PlayerType.NPC]: [],
    [PlayerType.Bonus]: [],
  };
  for (const stand of gameState.visibleLetters) {
    playerTypeLetters[stand.playerType].push(stand.letter);
  }
  return playerTypeLetters;
};

// Get available clues from the server
// const getClues = () => {}

// Send vote to server. PlayerID can be accessed from clue
// const vote = (playerID) => {}
