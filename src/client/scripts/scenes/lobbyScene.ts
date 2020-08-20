import PhaserLogo from "../objects/phaserLogo";
import PlayBtn from "../objects/playBtn";
import Dialog from "../objects/dialog";

export default class LobbyScene extends Phaser.Scene {
  players: string[];
  socket;
  id: number;
  playerTexts;
  dialog: Dialog;

  constructor() {
    super({ key: "LobbyScene" });
    this.playerTexts = [];
    this.dialog = new Dialog(
      this,
      "Enter name",
      "What is your player name?",
      null,
      (content) => {
        this.socket.emit("setPlayerName", content);
      }
    );
  }

  preload() {
    this.load.image("phaser-logo", "assets/img/phaser-logo.png");
    this.load.image("play-btn", "assets/img/play-btn.png");
    this.dialog.preload();
  }

  init({ socket, id, players }) {
    this.socket = socket;
    this.id = id;
    this.players = players;
  }

  clearPlayerTexts = () => {
    for (const text of this.playerTexts) {
      text.destroy();
    }
    this.playerTexts = [];
  };

  drawPlayerTexts = () => {
    this.players.forEach((p, idx) => {
      const text = this.add
        .text(this.cameras.main.width - 15, 100 * idx, `player = ${p}`, {
          color: "#000000",
          fontSize: 36,
        })
        .setOrigin(1, 0);
      this.playerTexts.push(text);
    });
  };

  create() {
    const logo = new PhaserLogo(
      this,
      this.cameras.main.width / 2 - 50,
      600
    ).setScale(0.25, 0.25);
    logo.on("pointerdown", () => this.dialog.open());
    const playBtn = new PlayBtn(
      this,
      this.cameras.main.width / 2 + 50,
      600
    ).setScale(0.25, 0.25);
    playBtn.on("pointerdown", () => this.socket.emit("nextScene"));

    this.add.text(0, 0, `LOBBY SCENE`, {
      color: "#000000",
      fontSize: 36,
    });

    this.drawPlayerTexts();

    this.dialog.create();
    this.dialog.open();

    this.socket.on("update", (data) => {
      this.scene.start(data.scene, {
        socket: this.socket,
        id: this.id,
        players: this.players,
      });
    });

    this.socket.on("playerLeft", (data) => {
      const playerSet = new Set(this.players);
      if (!playerSet.has(data.playerName)) {
        return;
      }
      playerSet.delete(data.playerName);
      this.players = Array.from(playerSet);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });

    this.socket.on("playerJoined", (data) => {
      const playerSet = new Set(this.players);
      if (playerSet.has(data.playerName)) {
        return;
      }
      this.players.push(data.playerName);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });

    this.socket.on("playerRenamed", (data) => {
      const updatedPlayers = new Set(this.players);
      updatedPlayers.delete(data.oldPlayerName);
      updatedPlayers.add(data.newPlayerName);
      this.players = Array.from(updatedPlayers);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });
  }
}
