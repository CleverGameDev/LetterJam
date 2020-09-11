import * as _ from "lodash";
import * as models from "../../../shared/models";
import GameScene from "../scenes/gameScene";
import { WildcardPlayerID } from "../../../shared/constants";

const headers = [
  "Player       ",
  "Word Length  ",
  "Players used ",
  "NPCs used    ",
  "Bonuses used ",
  "Wildcard used",
  "Votes",
];

export default class ActiveClues extends Phaser.GameObjects.Container {
  container: Phaser.GameObjects.Container;
  content;
  scene: GameScene;

  constructor(scene: GameScene) {
    super(scene, 0, 0);

    this.scene = scene;

    const background = scene.add
      .rectangle(
        0,
        0,
        scene.cameras.main.width,
        scene.cameras.main.height / 2,
        10
      )
      .setOrigin(0, 0);
    const title = scene.add.text(20, 20, "Active Clues", {
      fontSize: 32,
      fill: "#ffffff",
    });
    this.content = scene.add.text(20, 80, "", {
      font: "16px Courier",
      fill: "#ffffff",
    });

    this.add(background);
    this.add(title);
    this.add(this.content);

    scene.add.existing(this);
  }

  getPlayerType = (gameState: models.ClientGameState, playerID: string) => {
    if (gameState.players[playerID]) {
      return models.PlayerType.Player;
    } else if (playerID == WildcardPlayerID) {
      return models.PlayerType.Wildcard;
    } else {
      return models.PlayerType.NPC;
    }
  };

  clueToArray = (playerID: string, clue: models.ClueV2): string[] => {
    const wordLength = clue.word.length;
    const counts = _.countBy(
      _.uniqBy(clue.assignedStands, (s) => s.playerID),
      (s: models.Stand) => this.getPlayerType(this.scene.gameState, s.playerID)
    );

    const playerName = this.scene.gameState.players[playerID].Name;
    const out = [
      playerName,
      `${wordLength}`,
      `${counts[models.PlayerType.Player] || 0}`,
      `${counts[models.PlayerType.NPC] || 0}`,
      `${counts[models.PlayerType.Bonus] || 0}`,
      `${counts[models.PlayerType.Wildcard] ? "Y" : "N"}`,
      `${this.scene.gameState.votes[playerID] || 0}`,
    ];

    for (let i = 0; i < out.length; i++) {
      out[i] = out[i].toString().padEnd(headers[i].length);
    }

    return out;
  };

  update(): void {
    let text = "No clues yet";
    if (this.scene.gameState.clues) {
      const matrix = [headers];
      for (const player of Object.keys(this.scene.gameState.clues)) {
        matrix.push(
          this.clueToArray(player, this.scene.gameState.clues[player])
        );
      }

      text = Phaser.Utils.Array.Matrix.MatrixToString(matrix);
    }

    this.content.setText(text);
  }
}
