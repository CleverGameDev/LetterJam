import PhaserLogo from "../objects/phaserLogo";

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' })
  }

  preload() {
  }

  create() {
    console.log("EndScene create()");
    this.add.text(0, 0, `END SCENE`, {
      color: '#000000',
      fontSize: 36
    });
    const logo = new PhaserLogo(this, this.cameras.main.width / 2 - 100, 0);
    logo.on('pointerdown', () => this.scene.start('LobbyScene'));
  }

  update() {

  }
}
