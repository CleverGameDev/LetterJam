import io from "socket.io-client";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });

    const socket = io();

    socket.on("ready", (data) => {
      const { id, scene, players } = data;
      this.scene.start(scene, { socket, id, players });
    });
  }
}
