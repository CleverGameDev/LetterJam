import { PLAY_STATE } from "../scenes/mainScene"


export default class PlayStateText extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene) {
      super(scene, 10, 10, '', { color: 'black', fontSize: '28px' })
      scene.add.existing(this)
      this.setOrigin(0)
    }
  
    public update(state: integer) {
      this.setText(`State: ${state}`);
      switch(state) {
          case PLAY_STATE.PROVIDE_HINT: {
              this.setColor('red');
              break;
          }
          case PLAY_STATE.INTERPRET_HINT: {
              this.setColor('blue');
              break;
          }
          default: {
              this.setColor('black');
          }
      }
    } 
  }
  