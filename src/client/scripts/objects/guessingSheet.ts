import * as _ from "lodash";
import { COLOR_HOVER, COLOR_SECONDARY } from "../../../shared/constants";
import { Table } from "../objects/table";

export default class GuessingSheet extends Phaser.GameObjects.Container {
  table: Table;

  constructor(scene) {
    super(scene, 0, 0);

    const numColumns = 10;
    const cellOver = function (cellContainer, cellIndex, pointer) {
      if (cellIndex > numColumns && cellIndex % numColumns === numColumns - 1) {
        cellContainer.getElement("background").setFillStyle(2, COLOR_SECONDARY);
      }
    };
    const cellOut = function (cellContainer, cellIndex, pointer) {
      if (cellIndex > numColumns && cellIndex % numColumns === numColumns - 1) {
        cellContainer.getElement("background").setFillStyle(2, COLOR_HOVER);
      }
    };
    const cellClick = function (cellContainer, cellIndex, pointer) {
      if (cellIndex > numColumns && cellIndex % numColumns === numColumns - 1) {
        const edit = this.scene.rexUI.edit(cellContainer.getElement("text"));
        edit.open({}, (textObject) => {
          this.overrideValues[cellIndex] = {
            text: textObject.text,
            keep: true,
          };
        });
      }
    };
    this.table = new Table(
      scene,
      {
        title: "Guessing Sheet",
        numColumns,
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
        height: 550,
        y: 400,
        footer: () =>
          scene.rexUI.add
            .BBCodeText(400, 300, " ", {
              color: "white",
              fontSize: "24px",
              fixedWidth: 200,
              backgroundColor: "#333333",
            })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", function () {
              this.scene.rexUI.edit(this);
            }),
      },
      {
        cellOver,
        cellOut,
        cellClick,
      }
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

  isOpen = (): boolean => {
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
