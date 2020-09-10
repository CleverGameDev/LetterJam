import { vote } from "../lib/discuss";

const COLOR_PRIMARY = 0x1565c0;
const COLOR_HOVER = 0xfffff;
const COLOR_SECONDARY = 0x003c8f;

export class GuessingTable {
  scene: any;
  title: string;
  numColumns: number;
  headerRow: { text: string }[];
  gridTable;
  print;

  constructor(scene, title, numColumns, headerRow) {
    this.scene = scene;
    this.title = title;
    this.numColumns = numColumns;
    this.headerRow = headerRow;
  }

  create(): void {
    const numColumns = this.numColumns;

    const gridTable = this.scene.rexUI.add
      .gridTable({
        x: 650,
        y: 500,
        width: 1200,
        height: 300,

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

          mask: {
            padding: 2,
          },

          reuseCellContainer: true,
        },

        header: this.scene.rexUI.add
          .sizer({
            orientation: 0,
          })
          .add(
            this.scene.rexUI.add.label({
              width: 1170,
              height: 30,

              orientation: 0,
              background: this.scene.rexUI.add.roundRectangle(
                0,
                0,
                20,
                20,
                0,
                COLOR_SECONDARY
              ),
              text: this.scene.add.text(0, 0, this.title),
            })
          )
          .add(
            this.scene.rexUI.add
              .label({
                width: 30,
                height: 30,

                orientation: 0,
                background: this.scene.rexUI.add.roundRectangle(
                  0,
                  0,
                  20,
                  20,
                  0,
                  COLOR_SECONDARY
                ),
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
                this.getElement("background").setStrokeStyle(
                  1,
                  COLOR_SECONDARY
                );
              })
          ),

        space: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,

          table: 10,
          header: 10,
          footer: 10,
        },

        createCellContainerCallback: function (cell, cellContainer) {
          const scene = cell.scene,
            width = cell.width,
            height = cell.height,
            item = cell.item,
            index = cell.index;
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
                icon: 10,
                left: 15,
                top: 0,
              },
            });
          }

          // Set properties from item value
          cellContainer.setMinSize(width, height); // Size might changed in this demo
          cellContainer
            .getElement("background")
            .setStrokeStyle(2, COLOR_SECONDARY)
            .setDepth(0);
          return cellContainer;
        },
      })
      .layout()
      .setDepth(1);

    this.print = this.scene.add.text(0, 0, "");

    this.gridTable = gridTable;
    this.close();
  }

  setContentItems(rows: { text: string }[]): void {
    const allItems = [...this.headerRow, ...rows];
    this.gridTable.setItems(allItems);
    this.gridTable.layout().setDepth(1);
  }

  open(): void {
    this.gridTable.setActive(true).setVisible(true);
  }

  close(): void {
    this.gridTable.setActive(false).setVisible(false);
  }
}

export class ActiveCluesTable {
  scene: any;
  socket: SocketIO.Socket;
  playerID: string;
  title: string;
  numColumns: number;
  headerRow: { text: string }[];
  gridTable;
  print;

  constructor(scene, socket, playerID, title, numColumns, headerRow) {
    this.scene = scene;
    this.socket = socket;
    this.playerID = playerID;
    this.title = title;
    this.numColumns = numColumns;
    this.headerRow = headerRow;
  }

  create(): void {
    const numColumns = this.numColumns;

    const gridTable = this.scene.rexUI.add
      .gridTable({
        x: 650,
        y: 500,
        width: 1200,
        height: 300,

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

          mask: {
            padding: 2,
          },

          reuseCellContainer: true,
        },

        header: this.scene.rexUI.add
          .sizer({
            orientation: 0,
          })
          .add(
            this.scene.rexUI.add.label({
              width: 1170,
              height: 30,

              orientation: 0,
              background: this.scene.rexUI.add.roundRectangle(
                0,
                0,
                20,
                20,
                0,
                COLOR_SECONDARY
              ),
              text: this.scene.add.text(0, 0, this.title),
            })
          )
          .add(
            this.scene.rexUI.add
              .label({
                width: 30,
                height: 30,

                orientation: 0,
                background: this.scene.rexUI.add.roundRectangle(
                  0,
                  0,
                  20,
                  20,
                  0,
                  COLOR_SECONDARY
                ),
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
                this.getElement("background").setStrokeStyle(
                  1,
                  COLOR_SECONDARY
                );
              })
          ),

        space: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,

          table: 10,
          header: 10,
          footer: 10,
        },

        createCellContainerCallback: function (cell, cellContainer) {
          const scene = cell.scene,
            width = cell.width,
            height = cell.height,
            item = cell.item,
            index = cell.index;
          if (
            cellContainer === null ||
            cellContainer.getElement("text").text !== item.text
          ) {
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
                icon: 10,
                left: 15,
                top: 0,
              },
            });
          }

          // Set properties from item value
          cellContainer.setMinSize(width, height); // Size might changed in this demo
          cellContainer
            .getElement("background")
            .setStrokeStyle(2, COLOR_SECONDARY)
            .setDepth(0);
          return cellContainer;
        },
      })
      .layout();

    gridTable
      .on(
        "cell.over",
        function (cellContainer, cellIndex, pointer) {
          if (
            cellIndex > this.numColumns &&
            cellIndex % this.numColumns === this.numColumns - 1
          ) {
            cellContainer
              .getElement("background")
              .setFillStyle(2, COLOR_SECONDARY);
          }
        },
        this
      )
      .on(
        "cell.out",
        function (cellContainer, cellIndex, pointer) {
          if (
            cellIndex > this.numColumns &&
            cellIndex % this.numColumns === this.numColumns - 1
          ) {
            cellContainer.getElement("background").setFillStyle(2, COLOR_HOVER);
          }
        },
        this
      )
      .on(
        "cell.click",
        function (cellContainer, cellIndex, pointer) {
          if (
            cellIndex > this.numColumns &&
            cellIndex % this.numColumns === this.numColumns - 1
          ) {
            vote(
              this.socket,
              this.playerID,
              this.gridTable.items[cellIndex - this.numColumns + 1].text
            );
            cellContainer.getElement("background").setFillStyle(2, COLOR_HOVER);
          }
        },
        this
      )
      .on(
        "cell.1tap",
        function (cellContainer, cellIndex, pointer) {
          if (
            cellIndex > this.numColumns &&
            cellIndex % this.numColumns === this.numColumns - 1
          ) {
            vote(
              this.socket,
              this.playerID,
              this.gridTable.items[cellIndex - this.numColumns + 1].text
            );
            cellContainer.getElement("background").setFillStyle(2, COLOR_HOVER);
          }
        },
        this
      );

    this.gridTable = gridTable;
    this.close();
  }

  setContentItems(rows: { text: string }[]): void {
    const allItems = [...this.headerRow, ...rows];
    this.gridTable.setItems(allItems);
  }

  open(): void {
    this.gridTable.setActive(true).setVisible(true);
  }

  close(): void {
    this.gridTable.setActive(false).setVisible(false);
  }
}
