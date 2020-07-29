import PhaserLogo from '../objects/phaserLogo'
import PlayStateText from '../objects/playStateText'

export enum PLAY_STATE {
  DISCUSS = 0,
  PROVIDE_HINT,
  INTERPRET_HINT,
}

const TOTAL_STATE_NUM = 3

export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text
  playStateText: Phaser.GameObjects.Text
  playState: PLAY_STATE

  constructor() {
    super({ key: 'MainScene' })
  }

  preload () {
    this.load.image('phaser-logo', 'assets/img/phaser-logo.png')
  }

  create() {
    new PhaserLogo(this, this.cameras.main.width / 2, 0)
    this.playStateText = new PlayStateText(this)
    this.playState = PLAY_STATE.DISCUSS

    // display the Phaser.VERSION
    this.add
      .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
        color: '#000000',
        fontSize: 24
      })
      .setOrigin(1, 0)
    this.input.on('pointerdown',this.iteratePlayState, this);
  }

  iteratePlayState(pointer) {
    this.playState = (this.playState + 1) % TOTAL_STATE_NUM
  }

  update() {
    this.playStateText.update(this.playState)
  }
}
