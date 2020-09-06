import { Clue } from "../../../shared/models";
import GameScene from "../scenes/gameScene";

const headers = [
  "Player       ",
  "Word Length  ",
  "Players used ",
  "NPCs used    ",
  "Bonuses used ",
  "Wildcard used",
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

  clueToArray = (clue: Clue): string[] => {
    const playerName = this.scene.gameState.players[clue.playerID].Name;
    const out = [
      playerName,
      `${clue.wordLength}`,
      `${clue.numPlayers}`,
      `${clue.numNPCs}`,
      `${clue.numBonus}`,
      clue.useWildcard ? "Y" : "N",
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
        matrix.push(this.clueToArray(this.scene.gameState.clues[player]));
      }

      text = Phaser.Utils.Array.Matrix.MatrixToString(matrix);
    }

    this.content.setText(text);
  }
}
