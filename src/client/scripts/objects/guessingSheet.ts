export default class GuessingSheet extends Phaser.GameObjects.Container {
  gameState: GuessingSheet;
  container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    super(scene, scene.cameras.main.width * 0.1, scene.cameras.main.height / 2);

    const guessingSheetBackground = scene.add
      .rectangle(
        0,
        0,
        scene.cameras.main.width * 0.8,
        scene.cameras.main.height / 2,
        55
      )
      .setOrigin(0, 0);
    const guessingSheetTitle = scene.add.text(20, 20, "", {
      fontSize: 32,
      fill: "#ffffff",
    });
    const guessingSheetContent = scene.add.text(20, 80, "", {
      font: "32px Courier",
      fill: "#ffffff",
    });

    this.add(guessingSheetBackground);
    this.add(guessingSheetTitle);
    this.add(guessingSheetContent);

    // TODO: render the gamestate into the guessing sheet
    // ensure the state for each guessing sheet is correct for a given player
    const matrix = [
      [1, 2, 3, 4, 5, 6, 7, 8, "9...", "???       "],
      ["H", "?", "L", "L", "*", "", "", "", "----", "hello"],
      ["A", "W", "?", "S", "*", "M", "E", "", "----", "awesome"],
    ];

    guessingSheetTitle.setText("Guessing Sheet");
    guessingSheetContent.setText(
      Phaser.Utils.Array.Matrix.MatrixToString(matrix)
    );

    scene.add.existing(this);
  }

  // TODO: add operations to update the guessing sheet based on: (1) hints (2) player notes for the ??? section

  // TODO: add functionality relating to guessing the final word, too
}
