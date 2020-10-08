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
import { Button } from "../objects/button";
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

  // Buttons
  giveClueButton: Button;
  nextSceneButton: Button;
  guessingSheetButton: Button;
  activeCluesButton: Button;
  nextLetterButton: Button;
  iAmReadyButton: Button;

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
    const Y_OFFSET = 150;
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

    // Buttons
    this.giveClueButton = new Button(this, 0, 0, "Give Clue", () => {
      if (this.gameState.playState === PlayStateEnum.INTERPRET_HINT) {
        return;
      }
      this._closeAll();
      toggleOpenClose(this.clueDialog);
    });
    this.nextSceneButton = new Button(this, 0, 0, "Next Scene", () => {
      this.socket.emit(E.NextScene);
    });
    this.guessingSheetButton = new Button(this, 0, 0, "Guessing Sheet", () => {
      this._closeAll();
      toggleOpenClose(this.guessingSheet);
    });
    this.activeCluesButton = new Button(this, 0, 0, "Active Clues", () => {
      this._closeAll();
      toggleOpenClose(this.activeClues);
    });
    this.nextLetterButton = new Button(this, 0, 0, "Go to Next Letter", () => {
      this.socket.emit(E.NextVisibleLetter);
    });
    this.iAmReadyButton = new Button(this, 0, 0, "I'm Ready", () => {
      this.socket.emit(E.PlayerReady);
    });
    const group = this.add.group([
      this.giveClueButton,
      this.nextSceneButton,
      this.guessingSheetButton,
      this.activeCluesButton,
      this.nextLetterButton,
      this.iAmReadyButton,
    ]);
    Phaser.Actions.GridAlign(group.getChildren(), {
      cellWidth: this.nextSceneButton.width + 16,
      cellHeight: this.nextSceneButton.height,
      x: 32,
      y: this.cameras.main.height - this.nextSceneButton.height - 16,
    });

    // Dialogs
    this.clueDialog = new Dialog(
      this,
      "What is your clue?",
      () => {
        this.activeClues.open();
      },
      (content: string) => {
        const validClue = giveClue(this.socket, content, this.gameState);
        if (!validClue) {
          // Let user know and prompt for another clue
        }
        this.activeClues.open();
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
    this.guessingSheet.setGameState(this.gameState.guessingSheet);
    this.activeClues.update();

    if (this.gameState.playState == PlayStateEnum.DISCUSS) {
      this.giveClueButton.setDisabled(false);
    } else {
      this.giveClueButton.setDisabled(true);
    }

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
