import * as _ from "lodash";
import {
  Clue,
  Letter,
  PlayerID,
  PlayerProperties,
  PlayerType,
  Stand,
} from "../../shared/models";
import {
  BaseNPCCards,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
} from "../../shared/constants";

export class ServerGameState {
  //
  // Common properties, shared across scenes
  //
  room: string;

  sceneIndex: number;
  players: Map<PlayerID, PlayerProperties>;
  numNPCs: number;

  //
  // GameScene properties
  //
  letters: {
    [id: string]: Letter[];
  };
  visibleLetterIdx: {
    [id: string]: number;
  };
  deck: Letter[];
  // redTokens,
  // greenTokens
  clues: { [playerID: string]: Clue };
  votes: { [playerID: string]: number };

  constructor() {
    this.sceneIndex = 0;
    this.room = "someRoom";
    this.players = new Map();
    this.numNPCs = 0;
    this.letters = {};
    this.visibleLetterIdx = {};
    this.deck = [];
    this.clues = {};
    this.votes = {};
  }

  getPlayerIDs() {
    return Array.from(this.players.keys());
  }

  getPlayerNames() {
    return this.getPlayerIDs().map((n) => this.players.get(n).Name);
  }

  resetVotesAndClues() {
    this.clues = {};
    this.votes = {};
  }

  getVisibleLetters(currentPlayerID: string): Stand[] {
    const visibleLetters = [];
    for (const key of Object.keys(this.letters)) {
      // If the letters belong to other players
      if (key !== currentPlayerID) {
        let stand: Stand;
        // Is it a human player?
        if (this.players.has(key)) {
          stand = {
            player: this.players.get(key).Name,
            playerType: PlayerType.Player,
            letter: this.letters[key][this.visibleLetterIdx[key]],
          };
        } else {
          // It's an NPC deck
          stand = {
            player: key,
            playerType: PlayerType.NPC,
            letter: this.letters[key][this.visibleLetterIdx[key]],
          };
        }
        visibleLetters.push(stand);
      }
    }
    return visibleLetters;
  }

  // setupNewGame is done separately from the constructor because
  // it requires us to know the number of connected players.
  //
  // (future) Consider isolating the per-game state from other server state.
  setupNewGame() {
    const playerIDs = this.getPlayerIDs();
    const { playerHands, npcHands, deck } = drawCards(playerIDs);

    const numNPCs = MaxPlayers - playerIDs.length;
    const visibleLetterIdx = {};
    for (const key of playerIDs) {
      visibleLetterIdx[key] = 0;
    }
    for (let i = 0; i < numNPCs; i++) {
      visibleLetterIdx[`N${i + 1}`] = 0;
    }

    // Update gameState
    this.numNPCs = numNPCs;
    this.deck = deck;
    this.letters = {
      ...playerHands,
      ...npcHands,
    };
    this.visibleLetterIdx = visibleLetterIdx;
  }
}

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
