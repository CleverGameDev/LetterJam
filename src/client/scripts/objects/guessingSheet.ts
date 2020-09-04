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

    // TODO: render the gamestate into the guessing sheet
    // ensure the state for each guessing sheet is correct for a given player
    this.matrix = [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9...", "???       "],
    ];

    this.guessingSheetTitle.setText("Guessing Sheet");
    this.guessingSheetContent.setText(
      Phaser.Utils.Array.Matrix.MatrixToString(this.matrix)
    );

    scene.add.existing(this);
  }

  addClueWord(clueWord: string[]): void {
    // const letters = [];
    // for (const playerName of letterordering) {
    //   if (playerName === "*") {
    //     letters.push("*");
    //     continue;
    //   }
    //   let found = false;
    //   for (const stand of this.gameState.visibleLetters) {
    //     if (stand.player === playerName) {
    //       letters.push(stand.letter);
    //       found = true;
    //       break;
    //     }
    //   }
    //   if (!found) {
    //     letters.push("?");
    //   }
    // }

    if (clueWord.length > 10) {
      this.matrix.push(clueWord.slice(0, 10));
    } else if (clueWord.length < 10) {
      const row = [...clueWord];
      while (row.length < 10) {
        row.push("");
      }
      this.matrix.push(row);
    } else {
      this.matrix.push(clueWord);
    }
    this.guessingSheetContent.setText(
      Phaser.Utils.Array.Matrix.MatrixToString(this.matrix)
    );
  }

  // TODO: add operations to update the guessing sheet based on: player notes for the ??? section

  // TODO: add functionality relating to guessing the final word, too
}
