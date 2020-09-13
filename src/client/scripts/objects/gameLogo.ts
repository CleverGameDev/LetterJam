export default class GameLogo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "phaser-logo");
    scene.add.existing(this);
    this.setInteractive();
  }
}
