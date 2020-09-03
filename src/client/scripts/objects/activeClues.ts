import { Clue } from "../../../shared/models";

export default class ActiveClues extends Phaser.GameObjects.Container {
  container: Phaser.GameObjects.Container;
  content;
  scene;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.scene = scene;

    const background = scene.add
      .rectangle(
        0,
        0,
        scene.cameras.main.width,
        scene.cameras.main.height / 2,
        55
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

  clueToArray = (clue: Clue): any[] => {
    return [
      clue.playerID,
      clue.wordLength,
      clue.numPlayers,
      clue.numNPCs,
      clue.numBonus,
      clue.useWildcard ? "Y" : "N",
    ];
  };

  update(): void {
    const matrix = [
      [
        "Player",
        "Word Length",
        "Players used",
        "NPCs used",
        "Bonuses used",
        "Wildcard used",
      ],
    ];
    if (this.scene.clues) {
      for (const key of Object.keys(this.scene.clues)) {
        matrix.push(this.clueToArray(this.scene.clues[key]));
      }
    } else {
      matrix.push(["No clues yet", "", "", "", "", ""]);
    }

    this.content.setText(Phaser.Utils.Array.Matrix.MatrixToString(matrix));
  }
}
