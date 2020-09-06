import { Flower as FlowerModel } from "../../../shared/models";

export default class Flower extends Phaser.GameObjects.Text {
  flower: FlowerModel;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 100, "", { color: "black", fontSize: "28px" });
    scene.add.existing(this);
    this.setOrigin(0.5, 0);
    this.setPosition(scene.cameras.main.width / 2, 0);
    this.flower = {
      red: 0,
      green: 0,
      greenLocked: 0,
    };
  }

  public setFlowerData(flower: FlowerModel) {
    this.flower = flower;
  }

  public update(): void {
    this.setText(`Red tokens: ${this.flower.red}
Green tokens: ${this.flower.green}
Locked green tokens: ${this.flower.greenLocked}`);
  }
}
