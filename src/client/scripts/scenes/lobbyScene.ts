import Dialog from "../objects/dialog";
import {
  SceneEnum,
  MaxPlayers,
  DefaultPlayerName,
} from "../../../shared/constants";
import { E, EType } from "../../../shared/events";
import { ClientGameState } from "../../../shared/models";

export default class LobbyScene extends Phaser.Scene {
  socket: SocketIO.Socket;
  gameState: ClientGameState;

  playerTexts: Phaser.GameObjects.Text[];
  dialog: Dialog;
  rexUI: any; // global plugin

  constructor() {
    super({ key: SceneEnum.LobbyScene });
    this.playerTexts = [];
    this.dialog = new Dialog(
      this,
      " ",
      "What is your player name?",
      null,
      (content: string) => {
        this.socket.emit("setPlayerName", content);
      }
    );
  }

  init({ socket, gameState }): void {
    this.socket = socket;
    this.gameState = gameState;
  }

  createButton = (scene: LobbyScene, text: string) => {
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
    const buttons = this.rexUI.add
      .buttons({
        anchor: {
          centerX: "center",
          bottom: "bottom-10",
        },
        orientation: "x",
        buttons: [
          this.createButton(this, "Rename"),
          this.createButton(this, "Start Game"),
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

    this.dialog.create();
    if (
      this.gameState.players[this.gameState.playerID].Name == DefaultPlayerName
    ) {
      this.dialog.open();
    }

    for (let i = 0; i < MaxPlayers; i++) {
      const text = this.add
        .text(this.cameras.main.width - 15, 100 * i, "", {
          color: "#000000",
          fontSize: 36,
        })
        .setOrigin(1, 0);
      text.setVisible(false);
      this.playerTexts.push(text);
    }

    // Generic handler for any scene
    this.socket.on(E.SyncGameState, (data: EType[E.SyncGameState]) => {
      this.gameState = data;
      // this.refreshUI();
    });

    this.socket.on(E.ChangeScene, (data: EType[E.ChangeScene]) => {
      // TODO: consider merging this logic with the above, adding
      // if data.scene != current scene ... change scene
      this.scene.start(data.scene, {
        socket: this.socket,
        gameState: this.gameState,
      });
    });

    this.refreshUI();
  }

  refreshUI() {
    // update player texts
    console.log(this.gameState);
    const playerIDs = Object.keys(this.gameState.players).sort();
    const numPlayers = playerIDs.length;
    for (let i = 0; i < MaxPlayers; i++) {
      const pt = this.playerTexts[i];
      console.log({ i, pt });
      if (i < numPlayers) {
        const playerName = this.gameState.players[playerIDs[i]].Name;
        let currentPlayerMarker = "";
        if (playerIDs[i] == this.gameState.playerID) {
          currentPlayerMarker = " [*]";
        }

        pt.setVisible(true);
        console.log({ playerName, currentPlayerMarker });
        console.log("PT DATA:", pt.data);
        pt.setText(`player = ${playerName}${currentPlayerMarker}`);
      } else {
        pt.setVisible(false);
        pt.setText("");
      }
    }
  }

  // update() {
  // }
}
