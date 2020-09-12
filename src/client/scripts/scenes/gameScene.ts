import * as _ from "lodash";
import PlayStateText from "../objects/playStateText";
import Flower from "../objects/flower";
import GuessingSheet from "../objects/guessingSheet";
import { SelfStand } from "../objects/stand";
import ActiveClues from "../objects/activeClues";
import Dialog from "../objects/dialog";
import { ActiveCluesTable, GuessingTable } from "../objects/table";
import { giveClue, vote } from "../lib/discuss";

import {
  PlayStateEnum,
  SceneEnum,
  WildcardPlayerName,
  MaxPlayers,
} from "../../../shared/constants";
import { ClientGameState, Stand, Letter } from "../../../shared/models";
import { E } from "../../../shared/events";

const key = SceneEnum.GameScene;

type UIStand = {
  letter: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
  counter: Phaser.GameObjects.Text;
};

export default class GameScene extends Phaser.Scene {
  socket: SocketIO.Socket;
  gameState: ClientGameState;

  fpsText: Phaser.GameObjects.Text;
  playStateText: Phaser.GameObjects.Text;
  guessingSheet: GuessingSheet;
  activeClues: ActiveClues;
  flower: Flower;
  selfStand: SelfStand;
  clueDialog: Dialog;
  voteDialog: Dialog;
  guessingSheetTable: GuessingTable;
  activeCluesTable: ActiveCluesTable;
  board: UIStand[];
  winningVoteText: Phaser.GameObjects.Text;

  rexUI: any; // global plugin

  constructor() {
    super({ key });
    this.board = [];
  }

  init({ socket, gameState }): void {
    this.socket = socket;
    this.gameState = gameState;
  }

  _createVisibleLetters = (): void => {
    // TODO: Move this and _refreshVisibleLetters to a separate file
    const styleLarge = {
      color: "#000000",
      fontSize: 72,
    };
    const styleMedium = {
      color: "#000000",
      fontSize: 20,
    };
    const X_OFFSET = 50;
    const Y_OFFSET = 200;
    const WIDTH = 180;

    for (let i = 0; i < MaxPlayers; i++) {
      const letter = this.add.text(
        X_OFFSET + WIDTH * i,
        Y_OFFSET,
        "$",
        styleLarge
      );
      const label = this.add.text(
        X_OFFSET + WIDTH * i,
        Y_OFFSET + 80,
        "<Name>",
        styleMedium
      );
      const counter = this.add.text(
        X_OFFSET + WIDTH * i,
        Y_OFFSET + 112,
        "<Counter>",
        styleMedium
      );

      this.board.push({
        letter,
        label,
        counter,
      });
    }

    // Draw a wildcard stand
    const lastIdx = MaxPlayers;
    const letter = this.add.text(
      X_OFFSET + WIDTH * lastIdx,
      Y_OFFSET,
      Letter.Wildcard,
      styleLarge
    );
    const label = this.add.text(
      X_OFFSET + WIDTH * lastIdx,
      Y_OFFSET + 80,
      WildcardPlayerName,
      styleMedium
    );
    const counter = this.add.text(
      X_OFFSET + WIDTH * lastIdx,
      Y_OFFSET + 112,
      `-`,
      styleMedium
    );
    this.board.push({
      letter,
      label,
      counter,
    });
  };

  _createButton = (scene: GameScene, text: string) => {
    return scene.rexUI.add.label({
      width: 100,
      height: 40,
      background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0xae3f4b),
      text: scene.add.text(0, 0, text, {
        fontSize: 18,
      }),
      space: {
        left: 10,
        right: 10,
      },
      align: "center",
    });
  };

  create(): void {
    this.gameState = this.registry.get("gameState");

    this.guessingSheetTable = new GuessingTable(this, "Guessing Sheet", 10, [
      { text: "1" },
      { text: "2" },
      { text: "3" },
      { text: "4" },
      { text: "5" },
      { text: "6" },
      { text: "7" },
      { text: "8" },
      { text: "9..." },
      { text: "???" },
    ]);

    this.activeCluesTable = new ActiveCluesTable(
      this,
      this.socket,
      this.gameState.playerID,
      "Active Clues",
      8,
      [
        { text: "Player" },
        { text: "Word Length" },
        { text: "Players used" },
        { text: "NPCs used" },
        { text: "Bonuses used" },
        { text: "Wildcard used" },
        { text: "Votes" },
        { text: "" },
      ]
    );

    // Dialogs
    this.clueDialog = new Dialog(
      this,
      "Enter clue here",
      "What is your clue?",
      null,
      (content: string) => {
        const validClue = giveClue(this.socket, content, this.gameState);
        if (!validClue) {
          // Let user know and prompt for another clue
        }
      }
    );
    this.clueDialog.create();

    this.voteDialog = new Dialog(
      this,
      " ",
      "Who are you voting for?",
      null,
      (votedName: string) => {
        vote(this.socket, this.gameState.playerID, votedName);
      }
    );
    this.voteDialog.create();

    // Scene title
    this.add.text(0, 0, `${key}`, {
      color: "#000000",
      fontSize: 36,
    });

    this.guessingSheet = new GuessingSheet(this, this.guessingSheetTable);
    this.guessingSheet.setVisible(false);

    // Game sub-state
    this._createVisibleLetters();

    this.playStateText = new PlayStateText(this);
    this.flower = new Flower(this);

    // display the Phaser.VERSION
    this.add
      .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
        color: "#000000",
        fontSize: 24,
      })
      .setOrigin(1, 0);

    this.winningVoteText = this.add.text(400, 500, "", {
      color: "#000000",
      fontSize: 36,
    });
    this.winningVoteText.visible = false;

    // Discuss UI elements
    this.clueDialog.create();
    this.voteDialog.create();
    this.guessingSheetTable.create();
    this.activeCluesTable.create();

    this.activeClues = new ActiveClues(this, this.activeCluesTable);

    const buttons = this.rexUI.add
      .buttons({
        anchor: {
          centerX: "center",
          bottom: "bottom-10",
        },
        orientation: "x",
        buttons: [
          this._createButton(this, "Guessing Sheet"),
          this._createButton(this, "Next Scene"),
          this._createButton(this, "Active Clues"),
          this._createButton(this, "Give Clue"),
          this._createButton(this, "Vote for a Clue"),
          this._createButton(this, "Go to next letter"),
          this._createButton(this, "I am ready"),
        ],
        space: { item: 8 },
      })
      .layout();

    buttons
      .on("button.click", (button, index: number) => {
        switch (index) {
          case 0:
            this.guessingSheetTable.open();
            break;
          case 1:
            this.socket.emit(E.NextScene);
            break;
          case 2:
            this.activeCluesTable.open();
            break;
          case 3:
            this.clueDialog.open();
            break;
          case 4:
            this.voteDialog.open();
            break;
          case 5:
            this.socket.emit(E.NextVisibleLetter);
            break;
          case 6:
            this.socket.emit(E.PlayerReady);
            break;
          default:
            break;
        }
      })
      .on("button.out", function (button, index) {
        if (typeof button.getElement === "function") {
          button.getElement("background").setStrokeStyle();
        }
        button.setInteractive({ cursor: "default" });
      })
      .on("button.over", function (button, index) {
        if (typeof button.getElement === "function") {
          button.getElement("background").setStrokeStyle(3, 0xa23a47);
        }
        button.setInteractive({ useHandCursor: true });
      });
  }

  _refreshWinningVoteText() {
    const playerID = _.maxBy(
      Object.keys(this.gameState.votes),
      (key) => this.gameState.votes[key]
    );
    const maxVotes = this.gameState.votes[playerID];
    if (maxVotes > 0) {
      const playerName = this.gameState.players[playerID].Name;
      this.winningVoteText.setText(
        `${playerName} has most votes with ${maxVotes} votes`
      );
      this.winningVoteText.setVisible(true);
    } else {
      this.winningVoteText.setText("");
      this.winningVoteText.setVisible(false);
    }
  }

  getStandName(s: Stand) {
    // get name for player or NPC
    const player = this.gameState.players[s.playerID];
    if (player) {
      return player.Name; // Player
    }

    return s.playerID; // NPC or wildcard
  }

  _refreshVisibleLetters() {
    this.gameState.visibleLetters.forEach((stand, idx) => {
      this.board[idx].label.setText(this.getStandName(stand));
      this.board[idx].letter.setText(stand.letter);
      this.board[idx].counter.setText(
        `${stand.currentCardIdx + 1}/${stand.totalCards}`
      );
    });

    // No updates to Wildcard stand
  }

  update(): void {
    this.gameState = this.registry.get("gameState");
    this.playStateText.update(this.gameState.playState);

    this.flower.setFlowerData(this.gameState.flower);
    this.flower.update();
    this._refreshVisibleLetters();
    this._refreshWinningVoteText();
    this.guessingSheet.setClueWords(this.gameState.guessingSheet.hints);

    switch (this.gameState.playState) {
      case PlayStateEnum.DISCUSS:
        // Concluded when one player's hint is chosen.
        // Chosen via voting in game, and then clicking continue once there's agreement (could also have timer)
        if (this.activeClues) {
          this.activeClues.update();
        }
        break;
      case PlayStateEnum.PROVIDE_HINT:
        // If player IS NOT the hint provider
        // Wait to receive the hint

        // If player IS the hint provider
        // Player takes a clue token.
        // Player prompted with UI to give the hint
        // If exit => go to DISCUSS
        // If hint is valid
        // Player now assigns tokens to letters
        // Recall: Letters can be player letters, NPC letters, or wildcard
        // Each person's "guessing sheet" can be automatically updated.
        break;
      case PlayStateEnum.INTERPRET_HINT:
        break;
      case PlayStateEnum.CHECK_END_CONDITION:
        break;
      default:
        break;
    }
  }
}
