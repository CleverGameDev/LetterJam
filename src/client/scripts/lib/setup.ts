import {
  BaseNPCCards,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
} from "src/shared/constants";

// This should all live on the server actually
export const getFullDeck = () => {
  const letters = [];
  for (const key of Object.keys(LetterDistribution)) {
    letters.push(...Array(LetterDistribution[key]).fill(key));
  }
  return letters;
};

export const shuffle = (arr) => {
  const arrCopy = [...arr];
  for (let i = 0; i < arrCopy.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arrCopy[i];
    arrCopy[i] = arrCopy[j];
    arrCopy[j] = temp;
  }
  return arrCopy;
};

export const _splitToChunks = (array, parts) => {
  const result = [];
  for (let i = parts; i > 0; i--) {
    result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
};

export const test = () => {
  // Dummy variable, should get this from actual number of players at start
  const numPlayers = 2;
  const playerHands = {};
  const npcHands = {};

  const chunks = _splitToChunks(shuffle(getFullDeck()), numPlayers);
  const deck = [];

  // This part should be handled by player interaction
  // For now, just assign players 5 random letters each
  for (const index in chunks) {
    const word = chunks[index].splice(0, 5);
    playerHands[index] = word;
    deck.push(...chunks[index]);
  }

  // Take the remaining letters to populate NPC hands
  for (let i = 0; i < MaxPlayers - numPlayers; i++) {
    npcHands[i] = deck.splice(0, BaseNPCCards + NPCCardGrowth * i);
  }

  // playerHands, npcHands, and deck are now populated
};
