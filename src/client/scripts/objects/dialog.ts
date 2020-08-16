export default class Dialog {
  scene: any;
  placeholderTxt: string;
  title: string;
  cancelFn: () => void;
  submitFn: (content) => void;
  dialog;

  constructor(scene, placeholderTxt, title, cancelFn, submitFn) {
    this.scene = scene;
    this.placeholderTxt = placeholderTxt;
    this.title = title;
    this.cancelFn = cancelFn;
    this.submitFn = submitFn;
  }

  preload() {
    let url;
    url =
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js";
    this.scene.load.plugin("rexbbcodetextplugin", url, true);

    url =
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js";
    this.scene.load.plugin("rextexteditplugin", url, true);

    url =
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js";
    this.scene.load.scenePlugin({
      key: "rexuiplugin",
      url: url,
      sceneKey: "rexUI",
    });
  }

  create() {
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

        content: this.scene.add
          .rexBBCodeText(400, 300, this.placeholderTxt, {
            color: "white",
            fontSize: "24px",
            fixedWidth: 200,
            backgroundColor: "#333333",
          })
          .setOrigin(0.5)
          .setInteractive()
          .on("pointerdown", function () {
            this.scene.plugins.get("rextexteditplugin").edit(this);
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
            this.submitFn(dialog.getElement("content").text);
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

  open() {
    this.dialog.setActive(true).setVisible(true);
  }

  close() {
    this.dialog.setActive(false).setVisible(false);
  }
}