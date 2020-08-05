import geckos from '@geckos.io/client'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
    
    const channel:any = geckos({ port: parseInt((window.location.port || "3000"), 10)})

    channel.onConnect(error => {
      if (error) {
      	console.error(error.message);
      	return;
      }

      channel.on('ready', data => {
      	const { id, scene, players } = data;
        this.scene.start(scene, { channel, id, players })
      })
    })
  }

  preload() {
    this.load.image('phaser-logo', 'assets/img/phaser-logo.png')
  }
}
