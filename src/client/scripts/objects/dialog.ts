export default class Dialog {
  scene: any;
  placeholderTxt: string;
  title: string;
  cancelFn: () => void;
  submitFn: (content) => void;
  dialog;

  constructor(
    scene,
    placeholderTxt: string,
    title: string,
    cancelFn: () => void,
    submitFn: (content) => void
  ) {
    this.scene = scene;
    this.placeholderTxt = placeholderTxt;
    this.title = title;
    this.cancelFn = cancelFn;
    this.submitFn = submitFn;
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

    const dialog = this.scene.rexUI.add
      .dialog({
        x: this.scene.cameras.main.width / 2,
        y: this.scene.cameras.main.height / 2,
        width: 500,

        background: this.scene.rexUI.add.roundRectangle(
          0,
          0,
          100,
          100,
          20,
          0x1565c0
        ),

        title: this.scene.rexUI.add.label({
          background: this.scene.rexUI.add.roundRectangle(
            0,
            0,
            100,
            40,
            20,
            0x003c8f
          ),
          text: this.scene.add.text(0, 0, this.title, {
            fontSize: "24px",
          }),
          space: {
            left: 15,
            right: 15,
            top: 10,
            bottom: 10,
          },
        }),

        content: this.scene.rexUI.add
          .BBCodeText(400, 300, this.placeholderTxt, {
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

        actions: [
          createLabel(this.scene, "Cancel"),
          createLabel(this.scene, "Submit"),
        ],

        space: {
          title: 25,
          content: 25,
          action: 15,

          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        },

        align: {
          content: "left",
          actions: "right",
        },
      })
      .layout()
      .popUp(1000);

    dialog
      .on(
        "button.click",
        function (button, groupName, index) {
          if (button.text === "Cancel" && this.cancelFn) {
            this.cancelFn();
          } else if (button.text === "Submit" && this.submitFn) {
            const text: string = dialog.getElement("content").text;
            this.submitFn(text.trim());
          }
          dialog.setActive(false).setVisible(false);
        },
        this
      )
      .on("button.over", function (button, groupName, index) {
        button.getElement("background").setStrokeStyle(1, 0xffffff);
      })
      .on("button.out", function (button, groupName, index) {
        button.getElement("background").setStrokeStyle();
      });
    dialog.setActive(false).setVisible(false);

    this.dialog = dialog;
  }

  open(): void {
    this.dialog.setActive(true).setVisible(true);
  }

  close(): void {
    this.dialog.setActive(false).setVisible(false);
  }
}
