import * as _ from "lodash";
import { Table } from "../objects/table";

export default class GuessingSheet extends Phaser.GameObjects.Container {
  gameState: GuessingSheet;
  container: Phaser.GameObjects.Container;
  guessingSheetTitle: Phaser.GameObjects.Text;
  guessingSheetContent: Phaser.GameObjects.Text;
  matrix: string[][];
  table: Table;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.table = new Table(
      scene,
      {
        title: "Guessing Sheet",
        numColumns: 10,
        headerRow: [
          { text: "1" },
          { text: "2" },
          { text: "3" },
          { text: "4" },
          { text: "5" },
          { text: "6" },
          { text: "7" },
          { text: "8" },
          { text: "9..." },
          { text: "???" },
        ],
      },
      {}
    );
    this.table.create();
  }

  setClueWords = (guessingSheet: string[]): void => {
    const contentItems = _.flattenDeep(
      guessingSheet.map((item) => {
        const word = new Array(10).fill("");
        Array.from(item.substr(0, 10)).forEach((val, idx) => {
          word[idx] = { text: val };
        });

        return word;
      })
    );
    if (this.table) {
      this.table.setContentItems(contentItems);
    }
  };

  isActive = (): boolean => {
    return this.table.isActive();
  };

  open = (): void => {
    this.table.open();
  };

  close = (): void => {
    this.table.close();
  };

  // TODO: add operations to update the guessing sheet based on: player notes for the ??? section

  // TODO: add functionality relating to guessing the final word, too
}
