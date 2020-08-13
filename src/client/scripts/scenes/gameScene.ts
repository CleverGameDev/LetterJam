import PhaserLogo from "../objects/phaserLogo";
import PlayStateText from "../objects/playStateText";
import GuessingSheet from "../objects/guessingSheet";

const key = "GameScene";

export enum PLAY_STATE {
  DISCUSS = "discuss",
  PROVIDE_HINT = "provide_hint",
  INTERPRET_HINT = "interpret_hint",
  CHECK_END_CONDITION = "check_end_condition",
}

export default class GameScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  playStateText: Phaser.GameObjects.Text;
  guessingSheet: GuessingSheet;

  playState: PLAY_STATE;
  socket;
  id: number;
  players: string[];

  constructor() {
    super({ key });
  }

  init({ socket, id, players }) {
    this.socket = socket;
    this.id = id;
    this.players = players;
  }

  create() {
    // Scene title
    this.add.text(0, 0, `${key}`, {
      color: "#000000",
      fontSize: 36,
    });

    // interative game logos.. these are buttons that let us navigate around
    const logo1 = new PhaserLogo(this, this.cameras.main.width / 2 - 100, 0);
    const logo2 = new PhaserLogo(this, this.cameras.main.width / 2 + 100, 400);
    logo1.on("pointerdown", this.iteratePlayState, this);
    logo2.on("pointerdown", () => this.socket.emit("nextScene"));

    // Guessing sheet, and a button to show/hide the guessing sheet
    this.guessingSheet = new GuessingSheet(this);
    const guessingSheetButton = new PhaserLogo(
      this,
      0,
      this.cameras.main.height * 0.9
    )
      .setOrigin(0, 0)
      .setScale(0.1, 0.1);
    guessingSheetButton.on("pointerdown", () =>
      this.guessingSheet.setVisible(!this.guessingSheet.visible)
    );

    // Game sub-state
    this.playStateText = new PlayStateText(this);
    this.playState = PLAY_STATE.DISCUSS;

    // display the Phaser.VERSION
    this.add
      .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
        color: "#000000",
        fontSize: 24,
      })
      .setOrigin(1, 0);

    this.socket.on("update", (data) => {
      this.scene.start(data.scene, {
        socket: this.socket,
        id: this.id,
        players: this.players,
      });
    });
  }

  iteratePlayState(pointer) {
    const currentStateIdx = Object.values(PLAY_STATE).indexOf(this.playState);
    const numStates = Object.values(PLAY_STATE).length;

    this.playState = Object.values(PLAY_STATE)[
      (currentStateIdx + 1) % numStates
    ];
  }

  update() {
    this.playStateText.update(this.playState);

    switch (this.playState) {
      case PLAY_STATE.DISCUSS:
        // Concluded when one player's hint is chosen.
        // Chosen via voting in game, and then clicking continue once there's agreement (could also have timer)
        break;
      case PLAY_STATE.PROVIDE_HINT:
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
        // Each person's "guessing sheet", can be automatically updated.
        break;
      case PLAY_STATE.INTERPRET_HINT:
        // Remindind users that their sheet is updated
        // e.g. cause the guessing sheet to pop-up
        // Players cna jot down guesses

        // DECIDE_TO_MOVE_ON -- not yet clear this needs to be a different UI state
        //
        // Players can click "decide to move on" or not
        // Each player chooses "Now I know my letter" or not.
        // If yes => they get a new letter.
        // If player is out of letter => go to "bonus letters" condition
        // If  you  return  your  last  card to your row, draw a new one from the deck
        // If NPC letter was used, it should also be updated.
        // Do you want to guess your final word?
        break;
      case PLAY_STATE.CHECK_END_CONDITION:
        // (1) If you end a round with no clue tokens for the next round, the game is over
        // OR (2) The game ends with leftover tokens if everyone decides they don’t need any more clues.
        break;
      default:
        break;
    }
  }
}
