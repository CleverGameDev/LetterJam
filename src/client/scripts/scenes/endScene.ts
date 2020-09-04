import PhaserLogo from "../objects/phaserLogo";
import { SceneEnum } from "../../../shared/constants";
import { E, EType } from "../../../shared/events";
import { ClientGameState } from "../../../shared/models";

export default class EndScene extends Phaser.Scene {
  socket: SocketIO.Socket;
  gameState: ClientGameState;

  constructor() {
    super({ key: SceneEnum.EndScene });
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
    const logo = new PhaserLogo(
      this,
      this.cameras.main.width / 2 - 100,
      400
    ).setScale(0.25, 0.25);
    logo.on("pointerdown", () => this.socket.emit(E.NextScene));

    this.socket.on(E.ChangeScene, (data: EType[E.ChangeScene]) => {
      this.scene.start(data.scene, {
        socket: this.socket,
        gameState: this.gameState,
      });
    });
  }
}
