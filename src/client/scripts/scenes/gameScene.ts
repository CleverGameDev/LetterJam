import {
  MaxPlayers,
  PlayStateEnum,
  SceneEnum,
  WildcardPlayerName,
} from "../../../shared/constants";
import { E } from "../../../shared/events";
import { ClientGameState, Letter, Stand } from "../../../shared/models";
import { giveClue } from "../lib/discuss";
import ActiveClues from "../objects/activeClues";
import Dialog from "../objects/dialog";
import Flower from "../objects/flower";
import GuessingSheet from "../objects/guessingSheet";
import PlayStateText from "../objects/playStateText";
import { toggleOpenClose } from "../objects/util";

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

  playStateText: Phaser.GameObjects.Text;
  guessingSheet: GuessingSheet;
  activeClues: ActiveClues;
  flower: Flower;
  clueDialog: Dialog;
  board: UIStand[];
  previousPlayState: PlayStateEnum;

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

    // Discuss UI elements
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
            this._closeAll();
            toggleOpenClose(this.guessingSheet);
            break;
          case 2:
            this._closeAll();
            toggleOpenClose(this.activeClues);
            break;
          case 3:
            this._closeAll();
            toggleOpenClose(this.clueDialog);
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

    // Dialogs
    this.clueDialog = new Dialog(
      this,
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
      const isPlayer = this.gameState.players[stand.playerID];
      let readyText = this.gameState.playersReady[stand.playerID]
        ? "ready!"
        : "not ready";
      if (!isPlayer) {
        readyText = "";
      }
      this.board[idx].ready.setText(readyText);
      this.gameState.playersReady[stand.playerID]
        ? this.board[idx].ready.setColor("green")
        : this.board[idx].ready.setColor("red");
    });

    // No updates to Wildcard stand
  }

  _closeAll() {
    this.clueDialog.close();
    this.activeClues.close();
    this.guessingSheet.close();
  }

  update(): void {
    this.gameState = this.registry.get("gameState");
    this.playStateText.update(this.gameState.playState);

    this.flower.setFlowerData(this.gameState.flower);
    this.flower.update();
    this._refreshStands();
    this.guessingSheet.setClueWords(this.gameState.guessingSheet.hints);
    this.activeClues.update();

    if (this.previousPlayState !== this.gameState.playState) {
      switch (this.gameState.playState) {
        case PlayStateEnum.DISCUSS:
          if (this.activeClues) {
            this._closeAll();
            this.activeClues.open();
          }
          break;
        case PlayStateEnum.INTERPRET_HINT:
          if (this.guessingSheet) {
            this._closeAll();
            this.guessingSheet.open();
          }
          break;
        default:
          break;
      }
      this.previousPlayState = this.gameState.playState;
    }
  }
}
