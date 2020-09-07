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

// TODO: How to persist this across server restarts
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
  isGameOver: boolean;

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
    this.isGameOver = false;
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

  getPlayerWhoWonVote() {
    // TODO: handle ties, right now it just returns one of the tied players
    const playerID = _.maxBy(Object.keys(this.votes), (key) => this.votes[key]);
    const maxVotes = this.votes[playerID];
    if (maxVotes == 0) {
      return null;
    }

    return playerID;
  }

  provideHint() {
    const winningPlayerID = this.getPlayerWhoWonVote();
    const winningClue = this.clues[winningPlayerID];

    // The player who provided the hint takes a turn token
    this.takeTurnToken(winningPlayerID);

    // Update each player's GuessingSheet with the winningClue from their perspective
    this.getPlayerIDs().forEach((p) => {
      let hintText = "";
      for (let i = 0; i < winningClue.assignedStands.length; i++) {
        const stand = winningClue.assignedStands[i];
        if (this.getPlayerIDFromName(stand.player) == p) {
          hintText += "?";
        } else {
          hintText += stand.letter;
        }
      }
      this.guessingSheet[p].hints.push(hintText);
    });

    // Advance NPC stands that were used in the clue
    const npcStands = _.uniq(
      winningClue.assignedStands.filter((s) => {
        return s.playerType == PlayerType.NPC;
      })
    );
    npcStands.forEach((s: Stand) => {
      this.visibleLetterIdx[s.player] += 1;
    });
  }

  takeTurnToken(playerID: string) {
    // TODO: This logic is simplified. It needs to be updated
    // to handle the requirements to unlock more green tokens
    if (this.flower.red > 0) {
      this.flower.red -= 1;
    } else if (this.flower.green > 0) {
      this.flower.green -= 1;
    } else if (this.flower.greenLocked > 0) {
      this.flower.greenLocked -= 1;
    } else {
      console.warn("invalid state: cannot take a turn token");
    }
  }

  advanceScene(): void {
    this.sceneIndex++;
    this.sceneIndex %= Scenes.length;
    this.resetVotesAndClues();
  }

  advancePlayState(): void {
    // Check if it's valid to advance to the next state
    const playerID = this.getPlayerWhoWonVote();
    switch (PlayStates[this.playStateIndex]) {
      case PlayStateEnum.DISCUSS:
        // If there wasn't a player who won the vote
        if (!playerID) {
          return;
        }
        if (!this.clues[playerID]) {
          // The winning player didn't submit a clue
          return;
        }
        // TODO: The winning player cannot take a clue token
        break;
    }

    this.playStateIndex++;
    this.playStateIndex %= PlayStates.length;
    this.resetPlayersReady();

    switch (PlayStates[this.playStateIndex]) {
      case PlayStateEnum.DISCUSS:
        this.resetVotesAndClues();
        break;
      case PlayStateEnum.PROVIDE_HINT:
        this.provideHint();

        // Step forward again, as there's no user interaction here.
        this.advancePlayState();
        break;
      case PlayStateEnum.INTERPRET_HINT:
        // Remind users that their sheet is updated (ex. cause the guessing sheet to pop-up)
        // Players can jot down guesses

        // DECIDE_TO_MOVE_ON -- not yet clear if this needs to be a different UI state
        //
        // Players can click "decide to move on" (aka "Now I know my letter") or not
        // If yes
        //   If player has more letters, they get their next letter.
        //   If player is out of letters, go to "bonus letters" condition.
        //
        // When should player guess their final word? Probably as part of endScene
        break;
      case PlayStateEnum.CHECK_END_CONDITION:
        // Game is over if
        // (1) no clue tokens remain for the next round
        if (
          !(this.flower.green || this.flower.red || this.flower.greenLocked)
        ) {
          this.isGameOver = true;
          return;
        }

        // TODO: (2) everyone decides they don’t need any more clues

        // Step forward again, as there's no user interaction here.
        this.advancePlayState();
        break;
    }
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
