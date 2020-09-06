import * as _ from "lodash";
import {
  FullClue,
  Letter,
  PlayerProperties,
  PlayerType,
  Stand,
  ClientGameState,
  GuessingSheet,
} from "../../shared/models";
import {
  BaseNPCCards,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
  Scenes,
  PlayStates,
} from "../../shared/constants";

// TODO: How to persist this across  restarts
export class ServerGameState {
  //
  // Common properties, shared across scenes
  //
  room: string;

  sceneIndex: number;
  players: { [playerID: string]: PlayerProperties };
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

  // flower
  redTokens: number;
  greenTokens: number;
  greenTokensLocked: number;

  // TODO: consider using PlayerID type alias instead of string
  clues: { [playerID: string]: FullClue };
  votes: { [playerID: string]: number };
  clueWords: { [playerID: string]: string };
  guessingSheet: { [playerID: string]: GuessingSheet };
  playStateIndex: number;
  playersReady: Set<string>;

  constructor() {
    this.sceneIndex = 0;
    this.room = "someRoom";
    this.players = {};
    this.numNPCs = 0;
    this.letters = {};
    this.visibleLetterIdx = {};
    this.deck = [];
    this.clues = {};
    this.votes = {};
    this.clueWords = {};
    this.guessingSheet = {};
    this.playStateIndex = 0;
    this.playersReady = new Set();
  }

  getPlayerIDs(): string[] {
    return Array.from(_.keys(this.players));
  }

  getPlayerNames(): string[] {
    return this.getPlayerIDs().map((n) => this.players[n].Name);
  }

  getPlayerIDFromName(name: string): string {
    for (const id of this.getPlayerIDs()) {
      if (this.players[id].Name === name) {
        return id;
      }
    }
    return "";
  }

  resetVotesAndClues(): void {
    this.clues = {};
    this.votes = {};
  }

  areAllPlayersReady(): boolean {
    return this.playersReady.size >= this.getPlayerIDs().length;
  }

  resetPlayersReady(): void {
    this.playersReady = new Set();
  }

  getVisibleLetters(currentPlayerID: string): Stand[] {
    const visibleLetters = [];
    for (const key of Object.keys(this.letters)) {
      // If the letters belong to other players
      if (key !== currentPlayerID) {
        let stand: Stand;
        // Is it a human player?
        if (this.players[key]) {
          stand = {
            player: this.players[key].Name,
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

  getGuessingSheet(playerID: string) {
    return (
      this.guessingSheet[playerID] || {
        hints: [],
        notes: [],
      }
    );
  }

  provideHint() {
    // Get the hint word from the player with the most votes
    this.getPlayerIDs().forEach((playerID) => {
      // add hint

      // let out: string[][] = [];
      // const letters = [];
      // const visibleLetters = this.getVisibleLetters(playerID);
      // for (const playerName of letterordering) {
      //   if (playerName === "*") {
      //     letters.push("*");
      //     continue;
      //   }
      //   let found = false;
      //   for (const stand of this.visibleLetters) {
      //     if (stand.player === playerName) {
      //       letters.push(stand.letter);
      //       found = true;
      //       break;
      //     }
      //   }
      //   if (!found) {
      //     letters.push("?");
      //   }
      // }

      // return out;
      this.guessingSheet[playerID].hints.push("abcdef");
    });
  }

  // setupNewGame is done separately from the constructor because
  // it requires us to know the number of connected players.
  //
  // (future) Consider isolating the per-game state from other server state.
  setupNewGame(): void {
    // get players
    const playerIDs = this.getPlayerIDs();

    // deal cards
    const { playerHands, npcHands, deck } = drawCards(playerIDs);
    this.deck = deck;
    this.letters = {
      ...playerHands,
      ...npcHands,
    };

    // determine visible letters
    this.numNPCs = MaxPlayers - playerIDs.length;
    for (const key of playerIDs) {
      this.visibleLetterIdx[key] = 0;
    }
    for (let i = 0; i < this.numNPCs; i++) {
      this.visibleLetterIdx[`N${i + 1}`] = 0;
    }

    // initialize guessingSheets
    for (const key of playerIDs) {
      this.guessingSheet[key] = {
        hints: [],
        notes: [],
      };
    }

    // determine flower starting # of tokens
    switch (playerIDs.length) {
      case 2:
      case 3:
        this.redTokens = 6;
        this.greenTokens = 2;
        this.greenTokensLocked = 3;
        break;
      case 4:
        this.redTokens = 4;
        this.greenTokens = 6;
        this.greenTokensLocked = 1;
        break;
      case 5:
        this.redTokens = 5;
        this.greenTokens = 5;
        this.greenTokensLocked = 1;
        break;
      case 6:
        this.redTokens = 6;
        this.greenTokens = 4;
        this.greenTokensLocked = 1;
        break;
      default:
        throw Error("invalid number of players. 2-6 players supported");
    }
  }

  getScene() {
    return Scenes[this.sceneIndex];
  }

  getPlayState() {
    return PlayStates[this.playStateIndex];
  }

  getClientGameState(playerID: string): ClientGameState {
    return {
      playerID,
      scene: this.getScene(),
      players: this.players,

      visibleLetters: this.getVisibleLetters(playerID),
      playState: this.getPlayState(),
      clues: this.clues,
      votes: this.votes,
      guessingSheet: this.getGuessingSheet(playerID),
    };
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
