import PhaserLogo from "../objects/phaserLogo";

export default class EndScene extends Phaser.Scene {
  channel;
  id: number;
  players: string[];

  constructor() {
    super({ key: 'EndScene' })
  }

  init({ channel, id, players }) {
    this.channel = channel
    this.id = id
    this.players = players;
  }

  preload() {
  }

  create() {
    this.add.text(0, 0, `END SCENE`, {
      color: '#000000',
      fontSize: 36
    });
    const logo = new PhaserLogo(this, this.cameras.main.width / 2 - 100, 0);
    logo.on('pointerdown', () => this.channel.emit("nextScene"));
    this.channel.on('update', data => {
      this.scene.start(data.scene, { channel: this.channel, id: this.id, players: this.players })
    });
  }

  update() {

  }
}