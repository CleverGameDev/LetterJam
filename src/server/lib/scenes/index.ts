import { SceneEnum } from "../../../shared/constants";
import { ServerGameState } from "../../lib/gameState";
import * as end from "./end";
import * as game from "./game";
import * as lobby from "./lobby";
import * as setup from "./setup";

const scenes = {
  [SceneEnum.LobbyScene]: lobby,
  [SceneEnum.SetupScene]: setup,
  [SceneEnum.GameScene]: game,
  [SceneEnum.EndScene]: end,
};

const sceneHandlers = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  sceneName: SceneEnum
): {
  setup: (gameState: ServerGameState) => void;
  teardown: (gameState: ServerGameState) => void;
} => {
  const scene = scenes[sceneName];
  return {
    setup: (gameState: ServerGameState) => {
      scene.setup(io, socket, gameState);
    },
    teardown: (gameState: ServerGameState) => {
      scene.teardown(io, socket, gameState);
    },
  };
};

export default sceneHandlers;
