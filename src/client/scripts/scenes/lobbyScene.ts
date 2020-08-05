import PhaserLogo from "../objects/phaserLogo";

export default class LobbyScene extends Phaser.Scene {
  players: string[];
  channel;
  id: number;
  playerTexts;

  constructor() {
    super({ key: 'LobbyScene' })
    this.playerTexts = [];
  }

  init({ channel, id, players }) {
    this.channel = channel
    this.id = id
    this.players = players;
  }

  preload() {
  }

  clearPlayerTexts = () => {
    for(const text of this.playerTexts) {
      text.destroy();
    }
    this.playerTexts = [];
  }

  drawPlayerTexts = () => {
    this.players.forEach((p, idx) => {
      const text = this.add.text(this.cameras.main.width - 15, 100 * idx, `player = ${p}`, {
        color: '#000000',
        fontSize: 36
      }).setOrigin(1, 0);
      this.playerTexts.push(text);
    });
  }

  create() {
    const logo = new PhaserLogo(this, this.cameras.main.width / 2, 0);
    logo.on('pointerdown', () =>
      this.channel.emit("nextScene")
    );

    this.add.text(0, 0, `LOBBY SCENE`, {
      color: '#000000',
      fontSize: 36
    });

    this.drawPlayerTexts();

    this.channel.on('update', data => {
      this.scene.start(data.scene, { channel: this.channel, id: this.id, players: this.players })
    });

    this.channel.on('playerLeft', data => {
      this.players.splice(this.players.indexOf(data.playerId), 1);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });

    this.channel.on('playerJoined', data => {
      this.players.push(data.playerId);
      this.clearPlayerTexts();
      this.drawPlayerTexts();
    });
  }
}
