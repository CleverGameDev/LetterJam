import PhaserLogo from "../objects/phaserLogo";

const key = "SetupScene";

export default class SetupScene extends Phaser.Scene {
  socket;
  id: number;
  players: string[];

  constructor() {
    super({ key });
  }

  preload() {
    this.load.image("phaser-logo", "assets/img/phaser-logo.png");
  }

  init({ socket, id, players }) {
    this.socket = socket;
    this.id = id;
    this.players = players;
  }

  create() {
    this.add.text(0, 0, `${key}`, {
      color: "#000000",
      fontSize: 36,
    });

    const logo = new PhaserLogo(
      this,
      this.cameras.main.width / 2 - 100,
      400
    ).setScale(0.25, 0.25);
    logo.on("pointerdown", () => this.socket.emit("nextScene"));
    this.socket.on("changeScene", (data) => {
      this.scene.start(data.scene, {
        socket: this.socket,
        id: this.id,
        players: this.players,
      });
    });
  }
}
