import * as _ from "lodash";
import { COLOR_HOVER, COLOR_SECONDARY } from "../../../shared/constants";
import { E, EType } from "../../../shared/events";
import * as m from "../../../shared/models";
import { Table } from "../objects/table";
import GameScene from "../scenes/gameScene";

export default class GuessingSheet extends Phaser.GameObjects.Container {
  // Data
  guessingSheet: m.GuessingSheet;

  // UI Components
  table: Table;
  footer: any; // rexCodeBB

  constructor(scene: GameScene) {
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
      const row = Math.floor(cellIndex / numColumns);
      if (cellIndex > numColumns && cellIndex % numColumns === numColumns - 1) {
        const edit = this.scene.rexUI.edit(cellContainer.getElement("text"));
        edit.open({}, (textObject) => {
          this.overrideValues[cellIndex] = {
            text: textObject.text,
            keep: true,
          };

          // Save "clue note" to backend
          scene.socket.emit(E.UpdateClueNote, <EType[E.UpdateClueNote]>{
            clueIdx: row - 1, // 0th clue is in the 1st table row.
            note: textObject.text,
          });
        });
      }
    };
    // Table
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
        y: 380,
        // Table footer is where "final word" guess goes
        footer: () => {
          const footer = scene.rexUI.add
            .BBCodeText(400, 300, " ", {
              color: "white",
              fontSize: "24px",
              fixedWidth: 200,
              backgroundColor: "#333333",
            })
            .setOrigin(0.5)
            .setInteractive();
          footer.on("pointerdown", function () {
            const edit = this.scene.rexUI.edit(this);
            edit.open({}, (textObject) => {
              // Save "final word" to backend
              scene.socket.emit(E.UpdateFinalWord, <EType[E.UpdateFinalWord]>{
                word: footer.text.trim(),
              });
            });
          });
          this.footer = footer; // save a reference so we can update its text
          return footer;
        },
      },
      {
        cellOver,
        cellOut,
        cellClick,
      }
    );
    this.table.create();
  }

  setGameState = (guessingSheet: m.GuessingSheet): void => {
    // Ignore no-ops
    if (guessingSheet == this.guessingSheet) {
      return;
    }
    this.guessingSheet = guessingSheet;

    this.refresh();
  };

  refresh() {
    // Table
    const contentItems = _.flattenDeep(
      this.guessingSheet.hints.map((item, mIdx) => {
        const word = new Array(10).fill("");
        Array.from(item.substr(0, 10)).forEach((val, idx) => {
          word[idx] = { text: val };
        });

        // put player's notes for this clue in the last position
        word[word.length - 1] = { text: this.guessingSheet.notes[mIdx] };

        return word;
      })
    );
    this.table.setContentItems(contentItems);

    // Footer
    this.footer.text = this.guessingSheet.finalWord || " ";
  }

  isOpen = (): boolean => {
    return this.table.isActive();
  };

  open = (): void => {
    this.table.open();
    this.refresh();
  };

  close = (): void => {
    this.table.close();
  };
}
