import * as _ from "lodash";
import {
  BaseNPCCards,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
} from "../../shared/constants";
import { ServerGameState, getPlayerIDs } from "../../shared/models";

// This should all live on the server actually
const getFullDeck = () => {
  const letters = [];
  for (const key of Object.keys(LetterDistribution)) {
    letters.push(...Array(LetterDistribution[key]).fill(key));
  }
  return letters;
};

const drawCards = (playerIDs: string[]) => {
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

export const initGameState = (): ServerGameState => {
  return {
    // Global
    sceneIndex: 0,
    room: "someRoom",
    players: new Map(),
    numNPCs: 0,

    // GameScene
    letters: {},
    visibleIndex: {},
    deck: [],

    clues: {},
    votes: {},
  };
};

export const setupNewGame = (gameState: ServerGameState): any => {
  const playerIDs = getPlayerIDs(gameState);
  const { playerHands, npcHands, deck } = drawCards(playerIDs);

  const numNPCs = MaxPlayers - playerIDs.length;
  const visibleIndex = {};
  for (const key of playerIDs) {
    visibleIndex[key] = 0;
  }
  for (let i = 0; i < numNPCs; i++) {
    visibleIndex[`N${i + 1}`] = 0;
  }

  // Update gameState
  gameState.numNPCs = numNPCs;
  gameState.deck = deck;
  gameState.letters = {
    ...playerHands,
    ...npcHands,
  };
  gameState.visibleIndex = visibleIndex;
};
