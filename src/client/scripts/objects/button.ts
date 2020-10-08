const Styles = {
  Rest: {
    color: "#fff",
    backgroundColor: "#A91919",
    padding: { left: 5, right: 5, top: 5, bottom: 5 },
    fontSize: "16px",
    align: "left",
  },
  Active: {
    color: "#0ff",
  },
  Disabled: {
    color: "#999",
    backgroundColor: "#a34",
  },
  Hover: {
    color: "#ff0",
  },
};

const ORIGIN = 0;
const WIDTH = 190;

export class Button extends Phaser.GameObjects.Container {
  disabled: boolean;
  baseStyle: any;
  text: Phaser.GameObjects.Text;
  //   rectangle: Phaser.GameObjects.Rectangle;
  //   roundedRect: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.setSize(WIDTH, 32);

    // background
    // this.rectangle = new Phaser.GameObjects.Rectangle(
    //   this.scene,
    //   0,
    //   0,
    //   196,
    //   32
    // ).setOrigin(ORIGIN);
    // this.rectangle.setFillStyle(255);
    // this.add(this.rectangle);

    // text
    this.text = new Phaser.GameObjects.Text(
      scene,
      16,
      4,
      text,
      Styles.Rest
    ).setOrigin(ORIGIN);
    this.add(this.text);

    this.text
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.disabled ? null : this.enterButtonHoverState()
      )
      .on("pointerout", () =>
        this.disabled ? null : this.enterButtonRestState()
      )
      .on("pointerdown", () =>
        this.disabled ? null : this.enterButtonActiveState()
      )
      .on("pointerup", () => {
        if (this.disabled) {
          return;
        }

        this.enterButtonHoverState();
        callback();
      });
  }

  setDisabled(b: boolean) {
    this.disabled = b;
    if (this.disabled) {
      this.text.setStyle(Styles.Disabled);
    } else {
      this.text.setStyle(Styles.Rest);
    }
  }

  enterButtonHoverState() {
    this.text.setStyle(Styles.Hover);
  }

  enterButtonRestState() {
    this.text.setStyle(Styles.Rest);
  }

  enterButtonActiveState() {
    this.text.setStyle(Styles.Active);
  }
}
