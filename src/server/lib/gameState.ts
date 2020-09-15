import * as _ from "lodash";
import {
  BaseNPCCards,
  DefaultPlayerName,
  LetterDistribution,
  MaxPlayers,
  NPCCardGrowth,
  NPCPlayerIDPrefix,
  PlayStateEnum,
  PlayStates,
  SceneEnum,
  Scenes,
  WildcardPlayerID,
} from "../../shared/constants";
import {
  ClientGameState,
  ClueV2,
  Flower,
  GuessingSheet,
  Letter,
  PlayerProperties,
  PlayerType,
  Stand,
} from "../../shared/models";

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
  voteMap: { [playerID: string]: string }; // tracks who voted for who
  guessingSheet: { [playerID: string]: GuessingSheet };
  playStateIndex: number;
  playersReady: { [playerID: string]: boolean };
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
    this.voteMap = {};
    this.guessingSheet = {};
    this.playStateIndex = 0;
    this.playersReady = {};
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
    this.voteMap = {};
  }

  vote(senderID: string, recipientID: string): void {
    // TODO: ignore the vote if there's not a clue yet from that player
    this.voteMap[senderID] = recipientID;
  }

  getVotes() {
    return _.countBy(this.voteMap);
  }

  setPlayerToReady(playerID: string) {
    if (
      this.getPlayState() == PlayStateEnum.DISCUSS &&
      !this.getWinningClue()
    ) {
      // need a winning clue before it makes sense to be ready
      return;
    }

    this.playersReady[playerID] = !this.playersReady[playerID];
    if (this.areAllPlayersReady()) {
      this.advancePlayState();
    }
  }

  areAllPlayersReady(): boolean {
    // flatten into array of bool (true/false),
    // then convert to numbers (1/0) so we can reduce()
    const readyPlayersArr = Array.from(
      Object.values(this.playersReady)
    ).map((b) => Number(b));
    const readyPlayers = readyPlayersArr.reduce((a, b) => {
      return a + b;
    });
    const totalPlayers = this.getPlayerIDs().length;
    return readyPlayers >= totalPlayers;
  }

  resetPlayersReady(): void {
    this.playersReady = {};
  }

  getStands(currentPlayerID: string): Stand[] {
    const visibleLetters = [];
    for (const playerID of Object.keys(this.letters)) {
      const stand = {
        playerID: playerID,
        letter: this.letters[playerID][this.visibleLetterIdx[playerID]],
        totalCards: this.letters[playerID].length,
        currentCardIdx: this.visibleLetterIdx[playerID],
      };
      if (playerID === currentPlayerID) {
        stand.letter = Letter.Hidden;
        visibleLetters.unshift(stand);
      } else {
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
    const votes = this.getVotes();
    const playerID = _.maxBy(Object.keys(votes), (key) => votes[key]);
    const maxVotes = votes[playerID];
    if (maxVotes == 0) {
      return null;
    }

    return playerID;
  }

  provideHint() {
    const { playerID, clue } = this.getWinningClue();
    const [winningPlayerID, winningClue] = [playerID, clue];

    // The player who provided the hint takes a turn token
    this.takeTurnToken(winningPlayerID);

    // Update each player's GuessingSheet with the winningClue from their perspective
    this.getPlayerIDs().forEach((p) => {
      let hintText = "";
      for (let i = 0; i < winningClue.assignedStands.length; i++) {
        const stand = winningClue.assignedStands[i];
        if (stand.playerID == p) {
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
        return this.getPlayerType(s.playerID) == PlayerType.NPC;
      })
    );
    npcStands.forEach((s: Stand) => {
      this.visibleLetterIdx[s.playerID] += 1;
    });
  }

  tryAddPlayer(playerID: string) {
    // If it's lobby scene, then add that player to the players list
    if (this.getScene() === SceneEnum.LobbyScene) {
      if (!this.players[playerID]) {
        this.players[playerID] = {
          Name: DefaultPlayerName,
        };
      }
    }
  }
  getPlayerType(playerID: string) {
    if (this.players[playerID]) {
      return PlayerType.Player;
    } else if (playerID == WildcardPlayerID) {
      return PlayerType.Wildcard;
    } else {
      return PlayerType.NPC;
    }
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

  getWinningClue() {
    const playerID = this.getPlayerWhoWonVote();
    if (
      // If there wasn't a player who won the vote
      !playerID ||
      // The winning player didn't submit a clue
      !this.clues[playerID]
      // TODO: The winning player cannot take a clue token
    ) {
      return null;
    }
    return { playerID, clue: this.clues[playerID] };
  }

  advancePlayState(): void {
    // Check if it's valid to advance to the next state
    switch (PlayStates[this.playStateIndex]) {
      case PlayStateEnum.DISCUSS:
        if (!this.getWinningClue()) {
          console.warn("advancePlayState(): unable to determine winning clue");
          this.resetPlayersReady();
          return;
        }
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
        this.resetVotesAndClues();
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
      this.visibleLetterIdx[`${NPCPlayerIDPrefix}${i + 1}`] = 0;
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

      visibleLetters: this.getStands(playerID),
      playState: this.getPlayState(),
      clues: this.clues,
      votes: this.getVotes(),
      guessingSheet: this.getGuessingSheet(playerID),
      flower: this.flower,
      playersReady: this.playersReady,
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
    npcHands[`${NPCPlayerIDPrefix}${i + 1}`] = deck.splice(
      0,
      BaseNPCCards + NPCCardGrowth * i
    );
  }

  return {
    playerHands,
    npcHands,
    deck,
  };
};
