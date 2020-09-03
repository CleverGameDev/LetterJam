import io from "socket.io-client";
import { E, EType } from "../../../shared/events";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });

    const socket = io();

    socket.on(E.ServerReady, (data: EType[E.ServerReady]) => {
      const { id, scene, players } = data;
      this.scene.start(scene, { socket, id, players });
    });
  }
}
