import * as fs from "fs";
import * as _ from "lodash";
import path from "path";
import trie from "trie-prefix-tree";
import {
  BaseNPCCards,
  DefaultPlayerNames,
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

const wordTree = prepareWordTrie();

function prepareWordTrie() {
  // We can provide more word sets and allow users to choose
  // if we want themed games
  const data = fs.readFileSync(
    path.join(__dirname, "../wordLists/words_alpha.txt"),
    "utf8"
  );
  const allWords = data.split("\r\n");
  const validWords = [];
  for (const word of allWords) {
    if (word.length >= 5) {
      validWords.push(word);
    }
  }
  return trie(validWords);
}

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
  clueTokens: { [playerID: string]: number }; // tracks how many clue tokens each player has taken

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
    this.clueTokens = {};
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
        finalWord: "",
      }
    );
  }

  updateClueNote(playerID: string, clueIdx: number, note: string) {
    this.guessingSheet[playerID].notes[clueIdx] = note;
  }

  updateFinalWord(playerID: string, word: string) {
    this.guessingSheet[playerID].finalWord = word;
  }

  getPlayerWhoWonVote() {
    const votes = this.getVotes();
    const sortedPlayers = _.reverse(
      _.sortBy(Object.keys(votes), (key) => votes[key])
    );

    const [first, second] = [sortedPlayers[0], sortedPlayers[1]];

    // if 0 votes, no one has won yet
    if (votes[first] == 0) {
      return null;
    }

    // if it's a tie, no one won
    if (votes[first] == votes[second]) {
      return null;
    }

    return first;
  }

  provideHint() {
    const { playerID, clue } = this.getWinningClue();
    const [winningPlayerID, winningClue] = [playerID, clue];

    // The player who provided the hint takes a turn token
    this.takeClueToken(winningPlayerID);

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
      this.guessingSheet[p].notes.push("");
    });

    // Advance NPC stands that were used in the clue
    const npcStands = _.uniq(
      winningClue.assignedStands.filter((s) => {
        return this.getPlayerType(s.playerID) == PlayerType.NPC;
      })
    );
    npcStands.forEach((s: Stand) => {
      this.visibleLetterIdx[s.playerID] += 1;

      // When the last card in NPC stack is drawn, earn a green clue token
      if (
        this.visibleLetterIdx[s.playerID] ==
        this.letters[s.playerID].length - 1
      ) {
        this.flower.green += 1;
      }

      // Once its stack is empty, the nonplayer stand draws its new cards from the deck
      if (
        this.visibleLetterIdx[s.playerID] >
        this.letters[s.playerID].length - 1
      ) {
        this.letters[s.playerID].push(this.drawCardFromDeck());
      }
    });
  }

  tryAddPlayer(playerID: string) {
    // If it's lobby scene, then add that player to the players list
    if (this.getScene() === SceneEnum.LobbyScene) {
      if (!this.players[playerID]) {
        this.players[playerID] = {
          Name: this.getRandomPlayerName(),
        };
      }
    }
  }

  getRandomPlayerName() {
    const currentPlayers = this.getPlayerNames();

    // choose a unique player name from the default player names
    const names = _.shuffle(DefaultPlayerNames);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (currentPlayers.indexOf(name) < 0) {
        return name;
      }
    }

    // uh, this shouldn't happen but just in case!
    return "Player";
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

  // TODO: canGiveClue() -- add a check to ensure it's possible to give a clue
  // Returns false if failed to take a clueToken
  takeClueToken(playerID: string): boolean {
    const playerIDs = this.getPlayerIDs();
    let redTokensPerPlayer = 1;
    if (playerIDs.length === 3) {
      redTokensPerPlayer = 2;
    } else if (playerIDs.length === 2) {
      redTokensPerPlayer = 3;
    }

    if (this.clueTokens[playerID] < redTokensPerPlayer) {
      // Take a red token
      if (this.flower.red <= 0) {
        // no red tokens remain -- this shoudn't never happen based on logic above and
        // baseline number of red tokens
        console.error("no red tokens remain, but player is trying to take one");
        return false;
      }
      this.flower.red -= 1;

      // Unlock more green tokens?
      if (this.flower.red == 0) {
        this.flower.green += this.flower.greenLocked;
        this.flower.greenLocked = 0;
      }
    } else {
      if (this.flower.green <= 0) {
        // This could happen if some no green tokens remain but some red tokens remain,
        // i.e. some players have given few or no hints.
        // It could also happen if no clues remain in the game.
        return false;
      }
      this.flower.green -= 1;
    }

    this.clueTokens[playerID] += 1;
    return true;
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
  setupNewGame(force?: boolean): void {
    // get players
    const playerIDs = this.getPlayerIDs();
    if (this.deck.length > 0 && !force) {
      return;
    }

    // deal cards
    const MAX_ATTEMPTS = 100;
    for (let i = 0; i <= MAX_ATTEMPTS; i++) {
      try {
        const { playerHands, npcHands, deck } = drawCards(playerIDs);
        this.deck = deck;
        this.letters = {
          ...playerHands,
          ...npcHands,
        };
        break;
      } catch (err) {
        if (i == MAX_ATTEMPTS) {
          throw Error("failed to generate starting words for players");
        }
        // keep trying ...
      }
    }

    // initialize visibleLetterIdx
    // (reference the current card in each player's stack that is visible)
    this.numNPCs = MaxPlayers - playerIDs.length;
    for (const key of playerIDs) {
      this.visibleLetterIdx[key] = 0;
    }
    for (let i = 0; i < this.numNPCs; i++) {
      this.visibleLetterIdx[`${NPCPlayerIDPrefix}${i + 1}`] = 0;
    }

    for (const key of playerIDs) {
      // initialize guessingSheets
      this.guessingSheet[key] = {
        hints: [],
        notes: [],
        finalWord: "",
      };
      // initialize clueTokens counts
      this.clueTokens[key] = 0;
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

  getEndGame() {
    if (this.getScene() == SceneEnum.EndScene) {
      // Guess Vs Actual
      const guessVsActual = {};
      const playerIDs = this.getPlayerIDs();
      for (const key of playerIDs) {
        const guess = this.guessingSheet[key].finalWord;
        const actual = this.letters[key];
        guessVsActual[key] = {
          guess,
          actual,
        };
      }

      // TODO Compute score
      const score = 999;

      return {
        guessVsActual,
        score,
      };
    } else {
      return {
        guessVsActual: {},
        score: 0,
      };
    }
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
      myVote: this.voteMap[playerID],
      guessingSheet: this.getGuessingSheet(playerID),
      flower: this.flower,
      playersReady: this.playersReady,
      endGame: this.getEndGame(),
    };
  }

  drawCardFromDeck(): Letter {
    return this.deck.pop();
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

  // Assign a word to each player
  // Someday, handled by player interaction: https://trello.com/c/nH9z61yi/130-setupscene-create-a-word-for-your-neighbor
  const fullDeck = getFullDeck();
  const chunks = _.chunk(
    _.shuffle(fullDeck),
    fullDeck.length / playerIDs.length
  );
  for (let i = 0; i < playerIDs.length; i++) {
    // We really just need one word; getting anagrams gets all valid
    // word permutations and can be costly for long lists of characters
    // Cut down the size of the chunk
    let possibleWords = [];
    for (let j = 5; j < chunks[i].length; j++) {
      possibleWords = wordTree.getSubAnagrams(chunks[i].slice(j - 5, j).join());
      if (possibleWords.length !== 0) {
        break;
      }
    }
    if (possibleWords.length === 0) {
      throw Error(`No words found for player ${i}`);
    }
    playerHands[playerIDs[i]] = possibleWords[0];

    for (const letter of playerHands[playerIDs[i]]) {
      chunks[i].splice(chunks[i].indexOf(letter), 1);
    }

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
