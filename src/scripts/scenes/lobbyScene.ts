import PhaserLogo from "../objects/phaserLogo";

export default class LobbyScene extends Phaser.Scene {
  players: string[];

  constructor() {
    super({ key: 'LobbyScene' })
    this.players = [
      'p1',
      'p2',
    ];
  }

  preload() {
  }

  create() {
    const logo = new PhaserLogo(this, this.cameras.main.width / 2, 0);
    logo.on('pointerdown', () => this.scene.start('SetupScene'));

    this.add.text(0, 0, `LOBBY SCENE`, {
      color: '#000000',
      fontSize: 36
    });

    this.players.forEach((p, idx) => {
      this.add.text(this.cameras.main.width - 15, 100 * idx, `player = ${p}`, {
        color: '#000000',
        fontSize: 36
      }).setOrigin(1, 0);
    });
  }

  update() {

  }
}
