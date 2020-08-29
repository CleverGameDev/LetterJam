import Dialog from "../objects/dialog";
import { E, EType } from "../../../shared/events";

export default class LobbyScene extends Phaser.Scene {
  players: string[];
  socket: SocketIO.Socket;
  id: number;
  playerTexts;
  dialog: Dialog;
  rexUI: any;

  constructor() {
    super({ key: "LobbyScene" });
    this.playerTexts = [];
    this.dialog = new Dialog(
      this,
      " ",
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
    const url =
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js";
    this.load.scenePlugin({
      key: "rexuiplugin",
      url: url,
      sceneKey: "rexUI",
    });
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

  createButton = (scene, text) => {
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

  create() {
    const buttons = this.rexUI.add
      .buttons({
        anchor: {
          centerX: "center",
          centerY: "center+200",
        },
        orientation: "x",
        buttons: [
          this.createButton(this, "Rename"),
          this.add.sprite(150, 150, "play-btn").setScale(0.25, 0.25),
        ],
        space: { item: 8 },
      })
      .layout();

    buttons
      .on("button.click", (button, index) => {
        if (index == 0) {
          this.dialog.open();
        } else if (index == 1) {
          this.socket.emit(E.NextScene);
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

    this.add.text(0, 0, `LOBBY SCENE`, {
      color: "#000000",
      fontSize: 36,
    });

    this.drawPlayerTexts();

    this.dialog.create();
    this.dialog.open();

    this.socket.on(E.ChangeScene, (data: EType[E.ChangeScene]) => {
      this.scene.start(data.scene, {
        socket: this.socket,
        id: this.id,
        players: this.players,
      });
    });

    this.socket.on(E.PlayerLeft, (data: EType[E.PlayerLeft]) => {
      const playerSet = new Set(this.players);
      if (!playerSet.has(data.playerName)) {
        return;
      }
      playerSet.delete(data.playerName);
      this.players = Array.from(playerSet);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });

    this.socket.on(E.PlayerJoined, (data: EType[E.PlayerJoined]) => {
      const playerSet = new Set(this.players);
      if (playerSet.has(data.playerName)) {
        return;
      }
      this.players.push(data.playerName);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });

    this.socket.on(E.PlayerRenamed, (data: EType[E.PlayerRenamed]) => {
      const updatedPlayers = new Set(this.players);
      updatedPlayers.delete(data.oldPlayerName);
      updatedPlayers.add(data.newPlayerName);
      this.players = Array.from(updatedPlayers);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });
  }
}
