import * as lobby from "./lobby";
import * as setup from "./setup";
import * as game from "./game";
import * as end from "./end";

const scenes = {
  LobbyScene: lobby,
  SetupScene: setup,
  GameScene: game,
  EndScene: end,
};

const sceneHandlers = (io, socket, sceneName) => {
  const scene = scenes[sceneName];
  return {
    setup: (gameState) => {
      scene.setup(io, socket, gameState);
    },
    teardown: (gameState) => {
      scene.teardown(io, socket, gameState);
    },
  };
};

export default sceneHandlers;
