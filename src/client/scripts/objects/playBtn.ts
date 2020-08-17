export default class PlayBtn extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "play-btn");
    scene.add.existing(this);
    this.setInteractive();
  }
}
