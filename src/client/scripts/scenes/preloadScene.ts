import io from "socket.io-client";
import { E, EType } from "../../../shared/events";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" }); // Client-side only Scene

    const socket = io();

    socket.on(E.ServerReady, (data: EType[E.ServerReady]) => {
      this.scene.stop("PreloadScene");
      this.scene.start(data.scene, { socket, gameState: data });
    });
  }
}
