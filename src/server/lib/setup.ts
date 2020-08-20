import * as _ from "lodash";
import {
  BaseNPCCards,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
} from "../../shared/constants";

// This should all live on the server actually
const getFullDeck = () => {
  const letters = [];
  for (const key of Object.keys(LetterDistribution)) {
    letters.push(...Array(LetterDistribution[key]).fill(key));
  }
  return letters;
};

export const setupNewGame = (players) => {
  const playerHands = {};
  const npcHands = {};

  const fullDeck = getFullDeck();
  const chunks = _.chunk(_.shuffle(fullDeck), fullDeck.length / players.length);
  const deck = [];

  // This part should be handled by player interaction
  // For now, just assign players 5 random letters each
  for (const index in chunks) {
    const word = chunks[index].splice(0, 5);
    playerHands[players[index]] = word;
    deck.push(...chunks[index]);
  }

  // Take the remaining letters to populate NPC hands
  for (let i = 0; i < MaxPlayers - players.length; i++) {
    npcHands[`N${i + 1}`] = deck.splice(0, BaseNPCCards + NPCCardGrowth * i);
  }

  return {
    playerHands,
    npcHands,
    deck,
  };
};
