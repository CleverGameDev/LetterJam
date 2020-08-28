import {
  Clue,
  Letter,
  PlayerID,
  PlayerProperties,
  PlayerType,
  Stand,
} from "../../shared/models";

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

  getVisibleLetters = (currentPlayerID: string): Stand[] => {
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
  };
}
