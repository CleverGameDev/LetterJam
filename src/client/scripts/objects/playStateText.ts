import { PlayStateEnum } from "../../../shared/constants";

export default class PlayStateText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 100, "", { color: "black", fontSize: "28px" });
    scene.add.existing(this);
    this.setOrigin(0);
  }

  public update(state: string): void {
    this.setText(`State: ${state}`);
    switch (state) {
      case PlayStateEnum.DISCUSS: {
        this.setColor("green");
        break;
      }
      case PlayStateEnum.PROVIDE_HINT: {
        this.setColor("red");
        break;
      }
      case PlayStateEnum.INTERPRET_HINT: {
        this.setColor("blue");
        break;
      }
      case PlayStateEnum.CHECK_END_CONDITION: {
        this.setColor("orange");
        break;
      }
      default: {
        this.setColor("black");
      }
    }
  }
}
