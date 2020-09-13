import * as _ from "lodash";
import PlayStateText from "../objects/playStateText";
import Flower from "../objects/flower";
import GuessingSheet from "../objects/guessingSheet";
import { SelfStand } from "../objects/stand";
import ActiveClues from "../objects/activeClues";
import Dialog from "../objects/dialog";
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
  ready: Phaser.GameObjects.Text;
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

  _createStands = (): void => {
    // TODO: Move this and _refreshStands to a separate file
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
      const ready = this.add.text(
        X_OFFSET + WIDTH * i,
        Y_OFFSET + 144,
        "<Ready>",
        styleMedium
      );

      this.board.push({
        letter,
        label,
        counter,
        ready,
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
    const ready = this.add.text(
      X_OFFSET + WIDTH * lastIdx,
      Y_OFFSET + 144,
      ``,
      styleMedium
    );
    this.board.push({
      letter,
      label,
      counter,
      ready,
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

    // Scene title
    this.add.text(0, 0, `${key}`, {
      color: "#000000",
      fontSize: 36,
    });

    this.guessingSheet = new GuessingSheet(this);

    // Game sub-state
    this._createStands();

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

    this.activeClues = new ActiveClues(this);

    const buttons = this.rexUI.add
      .buttons({
        anchor: {
          centerX: "center",
          bottom: "bottom-10",
        },
        orientation: "x",
        buttons: [
          this._createButton(this, "Next Scene"),
          this._createButton(this, "Guessing Sheet"),
          this._createButton(this, "Active Clues"),
          this._createButton(this, "Give Clue"),
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
            this.socket.emit(E.NextScene);
            break;
          case 1:
            if (this.guessingSheet.isActive()) {
              this.guessingSheet.close();
            } else {
              this.guessingSheet.open();
            }
            break;
          case 2:
            if (this.activeClues.isActive()) {
              this.activeClues.close();
            } else {
              this.activeClues.open();
            }
            break;
          case 3:
            this.clueDialog.open();
            break;
          case 4:
            this.socket.emit(E.NextVisibleLetter);
            break;
          case 5:
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

  _refreshStands() {
    this.gameState.visibleLetters.forEach((stand, idx) => {
      this.board[idx].label.setText(this.getStandName(stand));
      this.board[idx].letter.setText(stand.letter);
      this.board[idx].counter.setText(
        `${stand.currentCardIdx + 1}/${stand.totalCards}`
      );
      const readyText = this.gameState.playersReady[stand.playerID]
        ? "ready!"
        : "";
      this.board[idx].ready.setText(readyText);
    });

    // No updates to Wildcard stand
  }

  update(): void {
    this.gameState = this.registry.get("gameState");
    this.playStateText.update(this.gameState.playState);

    this.flower.setFlowerData(this.gameState.flower);
    this.flower.update();
    this._refreshStands();
    this._refreshWinningVoteText();
    this.guessingSheet.setClueWords(this.gameState.guessingSheet.hints);

    switch (this.gameState.playState) {
      case PlayStateEnum.DISCUSS:
        if (this.activeClues) {
          this.activeClues.update();
        }
        break;
    }
  }
}
