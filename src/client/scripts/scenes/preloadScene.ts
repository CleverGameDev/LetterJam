import io from "socket.io-client";
import { E, EType } from "../../../shared/events";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" }); // Client-side only Scene
  }

  create() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    const socket = io({ query: `room=${room}` });

    // Sync changes to gamestate to the registry, a datastore which is shared
    // across all scenes.
    // This socket handler also persists across scenes.
    socket.on(E.SyncGameState, (data: EType[E.SyncGameState]) => {
      this.registry.set("gameState", data);
    });

    // Allow changing scene
    socket.on(E.ChangeScene, (data: EType[E.ChangeScene]) => {
      // Stop all existing scenes
      Object.keys(this.scene.manager.scenes).forEach((k) => {
        this.scene.manager.scenes[k].scene.stop();
      });
      // Start desired scene
      this.scene.start(data.sceneKey, { socket });
    });
  }
}
