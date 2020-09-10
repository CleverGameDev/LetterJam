const COLOR_PRIMARY = 0x1565c0;
const COLOR_HOVER = 0xffffff;
const COLOR_SECONDARY = 0x003c8f;

export default class Table {
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
    const createLabel = function (scene, text) {
      return scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
        text: scene.add.text(0, 0, text, {
          fontSize: "24px",
        }),
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
        },
      });
    };

    const numColumns = this.numColumns;

    const gridTable = this.scene.rexUI.add
      .gridTable({
        x: 600,
        y: 500,
        width: 1100,
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

        header: this.scene.rexUI.add.label({
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
          text: this.scene.add.text(0, 0, this.title),
        }),

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
    gridTable
      // .on('cell.over', function (cellContainer, cellIndex, pointer) {
      //   cellContainer.getElement('background')
      //     .setStrokeStyle(2, COLOR_LIGHT)
      //     .setDepth(1);
      // }, this)
      // .on('cell.out', function (cellContainer, cellIndex, pointer) {
      //   cellContainer.getElement('background')
      //     .setStrokeStyle(2, COLOR_DARK)
      //     .setDepth(0);
      // }, this)
      .on(
        "cell.click",
        function (cellContainer, cellIndex, pointer) {
          this.print.text +=
            "click " + cellIndex + ": " + cellContainer.text + "\n";

          const nextCellIndex = cellIndex + 1;
          const nextItem = gridTable.items[nextCellIndex];
          if (!nextItem) {
            return;
          }
          nextItem.color = 0xffffff - nextItem.color;
          gridTable.updateVisibleCell(nextCellIndex);
        },
        this
      )
      .on(
        "cell.1tap",
        function (cellContainer, cellIndex, pointer) {
          this.print.text +=
            "1 tap (" + cellIndex + ": " + cellContainer.text + ")\n";
        },
        this
      );

    this.gridTable = gridTable;

    this.setContentItems([]);
  }

  addRow(row: { text: string }[]): void {
    for (const item of row) {
      Phaser.Utils.Array.Add(this.gridTable.items, item);
    }
    this.gridTable.refresh();
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
