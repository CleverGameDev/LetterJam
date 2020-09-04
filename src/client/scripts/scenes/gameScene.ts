import * as _ from "lodash";
import PlayStateText from "../objects/playStateText";
import Flower from "../objects/flower";
import GuessingSheet from "../objects/guessingSheet";
import { SelfStand } from "../objects/stand";
import ActiveClues from "../objects/activeClues";
import Dialog from "../objects/dialog";
import { giveClue, vote } from "../lib/discuss";

import { PlayStateEnum, SceneEnum } from "../../../shared/constants";
import { ClientGameState } from "../../../shared/models";
import { E, EType } from "../../../shared/events";

const key = SceneEnum.GameScene;

export default class GameScene extends Phaser.Scene {
  socket: SocketIO.Socket;
  gameState: ClientGameState;

  fpsText: Phaser.GameObjects.Text;
  playStateText: Phaser.GameObjects.Text;
  guessingSheet: GuessingSheet;
  activeClues: ActiveClues;
  flower: Flower;
  selfStand: SelfStand;
  dialog: Dialog;
  voteDialog: Dialog;
  board;
  winningVoteText: Phaser.GameObjects.Text;

  rexUI: any; // global plugin

  constructor() {
    super({ key });
    this.board = [];

    this.dialog = new Dialog(
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
    this.voteDialog = new Dialog(
      this,
      " ",
      "Who are you voting for?",
      null,
      (votedName: string) => {
        vote(this.socket, this.gameState.playerID, votedName);
      }
    );
  }

  init({ socket, gameState }): void {
    this.socket = socket;
    this.gameState = gameState;
  }

  _clearVisibleLetters = (): void => {
    for (const text of this.board) {
      text.destroy();
    }
    this.board = [];
  };

  _drawVisibleLetters = (): void => {
    this.gameState.visibleLetters.forEach((stand, idx) => {
      const label = this.add.text(100 + 200 * idx, 200, stand.player, {
        color: "#000000",
        fontSize: 36,
      });
      const letter = this.add.text(100 + 200 * idx, 250, stand.letter, {
        color: "#000000",
        fontSize: 36,
      });
      this.board.push(label);
      this.board.push(letter);
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
    // Scene title
    this.add.text(0, 0, `${key}`, {
      color: "#000000",
      fontSize: 36,
    });

    this.guessingSheet = new GuessingSheet(this);
    this.guessingSheet.setVisible(false);

    // Game sub-state
    this.playStateText = new PlayStateText(this);
    this.flower = new Flower(this, _.keys(this.gameState.players).length);
    // TODO: add playerID and deck for self
    this.selfStand = new SelfStand(this, "playerID", 2);

    // display the Phaser.VERSION
    this.add
      .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
        color: "#000000",
        fontSize: 24,
      })
      .setOrigin(1, 0);

    // this.socket.on(E.ChangeScene, (data: EType[E.ChangeScene]) => {
    //   this.scene.start(data.scene, {
    //     socket: this.socket,
    //     id: this.id,
    //     players: this.players,
    //   });
    // });

    this.winningVoteText = this.add.text(
      400,
      500,
      // `${data.playerID} has most votes with ${data.votes} votes`,
      `player TODO has the most votes with TODO votes`,
      {
        color: "#000000",
        fontSize: 36,
      }
    );
    this.winningVoteText.visible = false;

    // Discuss UI elements
    this.dialog.create();
    this.voteDialog.create();

    this.activeClues = new ActiveClues(this);
    this.activeClues.setVisible(false);

    this._drawVisibleLetters();

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
            this.guessingSheet.setVisible(!this.guessingSheet.visible);
            break;
          case 1:
            this.socket.emit(E.NextScene);
            break;
          case 2:
            if (!this.activeClues.visible) {
              this._clearVisibleLetters();
            } else {
              this._drawVisibleLetters();
            }
            this.activeClues.setVisible(!this.activeClues.visible);
            break;
          case 3:
            this.dialog.open();
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

  update(): void {
    this.playStateText.update(this.gameState.playState);
    this.flower.update();
    this._clearVisibleLetters();
    this._drawVisibleLetters();

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
        // If hint is invalid, allow retrying or exiting
        // If exit => go to DISCUSS
        // If hint is valid
        // Player now assigns tokens to letters
        // Recall: Letters can be player letters, NPC letters, or wildcard
        // Each person's "guessing sheet" can be automatically updated.
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
        // If NPC letter was used, it should also be updated.
        //
        // When should player guess their final word? Probably as part of endScene
        break;
      case PlayStateEnum.CHECK_END_CONDITION:
        // (1) If you end a round with no clue tokens for the next round, the game is over
        // OR (2) The game ends with leftover tokens if everyone decides they don’t need any more clues.
        break;
      default:
        break;
    }
  }
}
