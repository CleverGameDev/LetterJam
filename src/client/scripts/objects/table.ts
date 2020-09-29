import {
  COLOR_HOVER,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
} from "../../../shared/constants";
import GameScene from "../scenes/gameScene";

export type TableOptions = {
  title: string;
  numColumns: number;
  headerRow: { text: string }[];
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  footer?: () => Phaser.GameObjects.GameObject;
};

export type TableEventHandlers = {
  cellOver?: (cellContainer, cellIndex, pointer) => void;
  cellOut?: (cellContainer, cellIndex, pointer) => void;
  cellClick?: (cellContainer, cellIndex, pointer) => void;
  cell1Tap?: (cellContainer, cellIndex, pointer) => void;
};

export class Table {
  scene: GameScene;
  gridTable; // RexUI.gridTable
  overrideValues: { text: string; keep?: boolean }[];

  // options
  title: string;
  numColumns: number;
  headerRow: { text: string }[];
  width: number;
  height: number;
  x: number;
  y: number;
  footer: () => Phaser.GameObjects.GameObject;

  // event handlers
  cellOver?: (cellContainer, cellIndex, pointer) => void;
  cellOut?: (cellContainer, cellIndex, pointer) => void;
  cellClick?: (cellContainer, cellIndex, pointer) => void;
  cell1Tap?: (cellContainer, cellIndex, pointer) => void;

  constructor(scene, options: TableOptions, eventHandlers: TableEventHandlers) {
    this.scene = scene;
    this.title = options.title;
    this.numColumns = options.numColumns;
    this.headerRow = options.headerRow;
    this.width = options.width || 1200;
    this.height = options.height || 300;
    this.x = options.x || 650;
    this.y = options.y || 500;
    this.footer = options.footer || null;
    this.cellOver = eventHandlers.cellOver;
    this.cellOut = eventHandlers.cellOut;
    this.cellClick = eventHandlers.cellClick;
    this.cell1Tap = eventHandlers.cell1Tap;
    this.overrideValues = [];
  }

  create(): void {
    const secondaryBackground = () => {
      return this.scene.rexUI.add.roundRectangle(
        0,
        0,
        20,
        20,
        0,
        COLOR_SECONDARY
      );
    };

    const titleLabel = () => {
      return this.scene.rexUI.add.label({
        width: this.width - 30,
        height: 30,
        orientation: 0,
        background: secondaryBackground(),
        text: this.scene.add.text(0, 0, this.title),
      });
    };

    const exitButton = () => {
      return this.scene.rexUI.add
        .label({
          width: 30,
          height: 30,
          orientation: 0,
          background: secondaryBackground(),
          text: this.scene.add.text(0, 0, "X"),
          align: "center",
        })
        .setInteractive()
        .on(
          "pointerdown",
          function () {
            this.close();
          },
          this
        )
        .on("pointerover", function () {
          this.getElement("background").setStrokeStyle(1, COLOR_HOVER);
        })
        .on("pointerout", function () {
          this.getElement("background").setStrokeStyle(1, COLOR_SECONDARY);
        });
    };

    const header = () => {
      return this.scene.rexUI.add
        .sizer({ orientation: 0 })
        .add(titleLabel())
        .add(exitButton());
    };

    const gridTable = this.scene.rexUI.add
      .gridTable({
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,

        background: this.scene.rexUI.add.roundRectangle(
          0,
          0,
          20,
          10,
          10,
          COLOR_PRIMARY
        ),

        table: {
          cellWidth: undefined,
          cellHeight: 30,
          columns: this.numColumns,
          mask: { padding: 2 },
          reuseCellContainer: true,
        },

        header: header(),
        footer: this.footer && this.footer(),

        space: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,

          table: 10,
          header: 10,
          footer: 10,
        },

        scroller: false,

        createCellContainerCallback: function (cell, cellContainer) {
          const scene = cell.scene,
            width = cell.width,
            height = cell.height,
            item = cell.item;
          if (cellContainer === null) {
            cellContainer = scene.rexUI.add.label({
              width: width,
              height: height,
              align: "left",

              orientation: 0,
              background: scene.rexUI.add
                .roundRectangle(0, 0, 20, 20, 0)
                .setStrokeStyle(2, COLOR_SECONDARY),
              text: scene.add.text(0, 0, item.text),

              space: {
                left: 15,
                top: 0,
              },
            });
          } else if (
            cellContainer.getElement("text").text !== item.text &&
            !item.keep
          ) {
            cellContainer.setText(item.text);
          }

          cellContainer.setMinSize(width, height);
          return cellContainer;
        },
      })
      .layout()
      .setDepth(1);

    this.cellOver && gridTable.on("cell.over", this.cellOver, this);
    this.cellOut && gridTable.on("cell.out", this.cellOut, this);
    this.cellClick && gridTable.on("cell.click", this.cellClick, this);
    (this.cell1Tap || this.cellClick) &&
      gridTable.on("cell.1tap", this.cell1Tap || this.cellClick, this);

    this.gridTable = gridTable;
    this.close();
  }

  setContentItems(rows: { text: string }[]): void {
    const allItems = [...this.headerRow, ...rows];
    if (this.gridTable.items.length > this.overrideValues.length) {
      const sizeDiff = this.gridTable.items.length - this.overrideValues.length;
      this.overrideValues.push(...new Array(sizeDiff).fill(""));
    }
    for (let i = 0; i < this.overrideValues.length; i++) {
      if (this.overrideValues[i]) {
        allItems[i] = this.overrideValues[i];
      }
    }
    this.gridTable.setItems(allItems);
    this.gridTable.layout().setDepth(1);
  }

  open(): void {
    this.gridTable.setActive(true).setVisible(true);
  }

  close(): void {
    this.gridTable.setActive(false).setVisible(false);
  }

  isActive(): boolean {
    return this.gridTable.active;
  }
}
