export default class GuessingSheet extends Phaser.GameObjects.Container {
  gameState: GuessingSheet;
  container: Phaser.GameObjects.Container;
  guessingSheetTitle: Phaser.GameObjects.Text;
  guessingSheetContent: Phaser.GameObjects.Text;
  matrix: string[][];

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
    this.guessingSheetTitle = scene.add.text(20, 20, "", {
      fontSize: 32,
      fill: "#ffffff",
    });
    this.guessingSheetContent = scene.add.text(20, 80, "", {
      font: "32px Courier",
      fill: "#ffffff",
    });

    this.add(guessingSheetBackground);
    this.add(this.guessingSheetTitle);
    this.add(this.guessingSheetContent);

    this.matrix = [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9...", "???       "],
    ];

    this.guessingSheetTitle.setText("Guessing Sheet");
    this.guessingSheetContent.setText(
      Phaser.Utils.Array.Matrix.MatrixToString(this.matrix)
    );

    scene.add.existing(this);
  }

  setClueWords(guessingSheet: string[]): void {
    this.matrix = Array.from(
      guessingSheet.map((item) => {
        // convert to an array, and force to length of 10
        const word = new Array(10).fill("");
        Array.from(item.substr(0, 10)).forEach((val, idx) => {
          word[idx] = val;
        });

        return word;
      })
    );

    // add header row
    this.matrix.unshift(["1", "2", "3", "4", "5", "6", "7", "8", "9", "???"]);

    this.guessingSheetContent.setText(
      Phaser.Utils.Array.Matrix.MatrixToString(this.matrix)
    );
  }

  // TODO: add operations to update the guessing sheet based on: player notes for the ??? section

  // TODO: add functionality relating to guessing the final word, too
}
