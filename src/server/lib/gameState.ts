import * as _ from "lodash";
import {
  FullClue,
  Letter,
  PlayerProperties,
  PlayerType,
  Stand,
  ClientGameState,
  GuessingSheet,
  Flower,
  ClueV2,
} from "../../shared/models";
import {
  BaseNPCCards,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
  Scenes,
  PlayStates,
  PlayStateEnum,
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

  flower: Flower;

  // TODO: consider using PlayerID type alias instead of string
  clues: { [playerID: string]: ClueV2 };
  votes: { [playerID: string]: number };
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
    this.guessingSheet = {};
    this.playStateIndex = 0;
    this.playersReady = new Set();
    this.flower = {
      red: 0,
      green: 0,
      greenLocked: 0,
    };
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
    // Are we in the right play state?
    if (this.getPlayState() != PlayStateEnum.PROVIDE_HINT) {
      console.warn(`cannot provideHint in playState: ${this.getPlayState()}`);
      return;
    }

    // Does someone have a winning clue?
    const playerID = _.maxBy(Object.keys(this.votes), (key) => this.votes[key]);
    const maxVotes = this.votes[playerID];
    if (maxVotes == 0) {
      console.warn(`cannot provide hint because no clue has >0 votes`);
      return;
    }

    // Update each player's GuessingSheet with the winningClue from their perspective
    const winningClue = this.clues[playerID];
    this.getPlayerIDs().forEach((playerID) => {
      let hintText = "";
      for (let i = 0; i < winningClue.assignedStands.length; i++) {
        const stand = winningClue.assignedStands[i];
        if (this.getPlayerIDFromName(stand.player) == playerID) {
          hintText += "?";
        } else {
          hintText += stand.letter;
        }
      }
      this.guessingSheet[playerID].hints.push(hintText);
    });

    // TODO
    // takeTurnToken(playerID)
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
        this.flower.red = 6;
        this.flower.green = 2;
        this.flower.greenLocked = 3;
        break;
      case 4:
        this.flower.red = 4;
        this.flower.green = 6;
        this.flower.greenLocked = 1;
        break;
      case 5:
        this.flower.red = 5;
        this.flower.green = 5;
        this.flower.greenLocked = 1;
        break;
      case 6:
        this.flower.red = 6;
        this.flower.green = 4;
        this.flower.greenLocked = 1;
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
      flower: this.flower,
    };
  }

  // TODO: Update flower (turn counter) during the vote / provide hint phase
  // // Perform the logic to take turns
  // // Returns true if successful, false otherwise
  // public takeTurnToken(playerID: integer): boolean {
  //   // Perform logic to take turns
  //   // If this is the first time a player has offered a clue, take a red token
  //   if (!this.playersTakenTurns.includes(playerID)) {
  //     this.playersTakenTurns.push(playerID);
  //     this.redTokens--;
  //   } else if (this.greenTokens > 0) {
  //     this.greenTokens--;
  //   } else {
  //     // With no more tokens available, the game is over?
  //     return false;
  //   }
  //   this.unlockGreenTokens();
  //   return true;
  // }

  // // Unlocks the green tokens if all the red tokens have been taken
  // private unlockGreenTokens() {
  //   if (this.redTokens == 0) {
  //     this.greenTokens += this.greenTokensLocked;
  //     this.greenTokensLocked = 0;
  //   }
  // }
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
