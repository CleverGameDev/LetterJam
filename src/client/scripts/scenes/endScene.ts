import { MaxPlayers, SceneEnum } from "../../../shared/constants";
import { E } from "../../../shared/events";
import { ClientGameState } from "../../../shared/models";
import GameLogo from "../objects/gameLogo";

type GuessVsActual = {
  player: Phaser.GameObjects.Text;
  guess: Phaser.GameObjects.Text;
  actual: Phaser.GameObjects.Text;
};
export default class EndScene extends Phaser.Scene {
  socket: SocketIO.Socket;
  gameState: ClientGameState;

  guessVsActuals: GuessVsActual[];

  constructor() {
    super({ key: SceneEnum.EndScene });
    this.guessVsActuals = [];
  }

  preload(): void {
    this.load.image("phaser-logo", "assets/img/phaser-logo.png");
  }

  init({ socket, gameState }): void {
    this.socket = socket;
    this.gameState = gameState;
  }

  create(): void {
    this.add.text(0, 0, `END SCENE`, {
      color: "#000000",
      fontSize: 36,
    });
    const logo = new GameLogo(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - 200
    ).setScale(0.25, 0.25);
    logo.on("pointerdown", () => this.socket.emit(E.NextScene));

    const Y_OFFSET = 50;
    const player = this.add.text(200, Y_OFFSET, ``, {
      color: "#000000",
      fontSize: 24,
    });
    const guess = this.add.text(500, Y_OFFSET, `Guess`, {
      color: "#000000",
      fontSize: 24,
    });
    const actual = this.add.text(800, Y_OFFSET, `Actual`, {
      color: "#000000",
      fontSize: 24,
    });

    for (let i = 0; i < MaxPlayers; i++) {
      const player = this.add
        .text(200, Y_OFFSET + 50 * (i + 1), `<PLAYER>`, {
          color: "#000000",
          fontSize: 24,
        })
        .setVisible(false);
      const guess = this.add
        .text(500, Y_OFFSET + 50 * (i + 1), `<GUESS>`, {
          color: "#000000",
          fontSize: 24,
        })
        .setVisible(false);
      const actual = this.add
        .text(800, Y_OFFSET + 50 * (i + 1), `<ACTUAL>`, {
          color: "#000000",
          fontSize: 24,
        })
        .setVisible(false);
      this.guessVsActuals.push({
        player,
        guess,
        actual,
      });
    }
  }

  update(): void {
    this.gameState = this.registry.get("gameState");
    const playerIDs = Object.keys(this.gameState?.players || {}).sort();
    for (let i = 0; i < MaxPlayers; i++) {
      const x = this.guessVsActuals[i];
      if (i < playerIDs.length) {
        // player name
        const playerName = this.gameState.players[playerIDs[i]].Name;
        let currentPlayerMarker = "";
        if (playerIDs[i] == this.gameState.playerID) {
          currentPlayerMarker = " [*]";
        }

        x.player.setVisible(true);
        x.player.setText(`${playerName}${currentPlayerMarker}`);
        const { guess, actual } = this.gameState.endGame.guessVsActual[
          playerIDs[i]
        ];

        // guess
        x.guess.setVisible(true);
        x.guess.setText(guess);

        // actual
        x.actual.setVisible(true);
        x.actual.setText(actual);
      }
    }
  }
}
