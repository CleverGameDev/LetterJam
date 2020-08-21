import * as _ from "lodash";
import {
  BaseNPCCards,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
} from "../../shared/constants";
import { PlayerID, ServerGameState } from "../../shared/models";

// This should all live on the server actually
const getFullDeck = () => {
  const letters = [];
  for (const key of Object.keys(LetterDistribution)) {
    letters.push(...Array(LetterDistribution[key]).fill(key));
  }
  return letters;
};

export const setupNewGame = (playerIDs: PlayerID[]): any => {
  const playerHands = {}; // map from player ID to their word
  const npcHands = {}; // map from NPC ID to their stack of letters
  const deck = [];

  // This part should be handled by player interaction
  // For now, just assign players 5 random letters each
  const fullDeck = getFullDeck();
  const chunks = _.chunk(
    _.shuffle(fullDeck),
    fullDeck.length / playerIDs.length
  );
  for (let i = 0; i < playerIDs.length; i++) {
    // Take 5 letters from the chunk and assign it to the player
    const word = chunks[i].splice(0, 5);
    playerHands[playerIDs[i]] = word;

    // Take the remaining letters from the chunk and add back to the deck
    deck.push(...chunks[i]);
  }

  // Take the remaining letters to populate NPC hands
  for (let i = 0; i < MaxPlayers - playerIDs.length; i++) {
    npcHands[`N${i + 1}`] = deck.splice(0, BaseNPCCards + NPCCardGrowth * i);
  }

  return {
    playerHands,
    npcHands,
    deck,
  };
};
