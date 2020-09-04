import { E, EType } from "../../../shared/events";
import { ClientGameState } from "../../../shared/models";

export function handleChangeScene(
  socket: SocketIO.Socket,
  gameState: ClientGameState,
  currentScene: Phaser.Scene
) {
  socket.on(E.ChangeScene, (data: EType[E.ChangeScene]) => {
    if (data.scene == currentScene.scene.key) {
      return;
    }
    currentScene.scene.stop(currentScene.scene.key);
    currentScene.scene.start(data.scene, {
      socket: socket,
      gameState: gameState,
    });
  });
}
