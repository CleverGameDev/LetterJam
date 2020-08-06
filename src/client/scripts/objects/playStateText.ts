import { PLAY_STATE } from "../scenes/gameScene";

export default class PlayStateText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 100, "", { color: "black", fontSize: "28px" });
    scene.add.existing(this);
    this.setOrigin(0);
  }

  public update(state: string) {
    this.setText(`State: ${state}`);
    switch (state) {
      case PLAY_STATE.DISCUSS: {
        this.setColor("green");
        break;
      }
      case PLAY_STATE.PROVIDE_HINT: {
        this.setColor("red");
        break;
      }
      case PLAY_STATE.INTERPRET_HINT: {
        this.setColor("blue");
        break;
      }
      case PLAY_STATE.CHECK_END_CONDITION: {
        this.setColor("orange");
        break;
      }
      default: {
        this.setColor("black");
      }
    }
  }
}
