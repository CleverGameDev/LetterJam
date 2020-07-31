import PhaserLogo from "../objects/phaserLogo";

const key = 'SetupScene';

export default class SetupScene extends Phaser.Scene {
  constructor() {
    super({ key })
  }

  preload() {
  }

  create() {
    console.log(`${key} create()`);
    this.add.text(0, 0, `${key}`, {
      color: '#000000',
      fontSize: 36
    });

    const logo = new PhaserLogo(this, this.cameras.main.width / 2 - 100, 0);
    logo.on('pointerdown', () => this.scene.start('GameScene'));
  }

  update() {

  }
}
