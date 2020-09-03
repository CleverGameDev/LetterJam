import PhaserLogo from "../objects/phaserLogo";
import { SceneEnum } from "../../../shared/constants";
import { E, EType } from "../../../shared/events";

const key = SceneEnum.SetupScene;

export default class SetupScene extends Phaser.Scene {
  socket: SocketIO.Socket;
  id: number;
  players: string[];

  constructor() {
    super({ key });
  }

  preload(): void {
    this.load.image("phaser-logo", "assets/img/phaser-logo.png");
  }

  init({ socket, id, players }): void {
    this.socket = socket;
    this.id = id;
    this.players = players;
  }

  create(): void {
    this.add.text(0, 0, `${key}`, {
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
        id: this.id,
        players: this.players,
      });
    });
  }
}
