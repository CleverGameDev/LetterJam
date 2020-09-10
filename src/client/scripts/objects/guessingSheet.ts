import * as _ from "lodash";

export default class GuessingSheet extends Phaser.GameObjects.Container {
  gameState: GuessingSheet;
  container: Phaser.GameObjects.Container;
  guessingSheetTitle: Phaser.GameObjects.Text;
  guessingSheetContent: Phaser.GameObjects.Text;
  matrix: string[][];
  table;

  constructor(scene: Phaser.Scene, table: any) {
    super(scene, scene.cameras.main.width * 0.1, scene.cameras.main.height / 2);
    this.table = table;
  }

  setClueWords(guessingSheet: string[]): void {
    const contentItems = _.flattenDeep(
      guessingSheet.map((item) => {
        const word = new Array(10).fill("");
        Array.from(item.substr(0, 10)).forEach((val, idx) => {
          word[idx] = { text: val };
        });

        return word;
      })
    );

    this.table.setContentItems(contentItems);
  }

  // TODO: add operations to update the guessing sheet based on: player notes for the ??? section

  // TODO: add functionality relating to guessing the final word, too
}
