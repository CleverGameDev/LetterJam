import "phaser";
import GameScene from "./scenes/gameScene";
import PreloadScene from "./scenes/preloadScene";
import LobbyScene from "./scenes/lobbyScene";
import EndScene from "./scenes/endScene";
import SetupScene from "./scenes/setupScene";

import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#ffffff",
  dom: {
    createContainer: true,
  },
  scale: {
    parent: "phaser-game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, LobbyScene, SetupScene, GameScene, EndScene],
  plugins: {
    scene: [
      {
        key: "rexUI",
        plugin: RexUIPlugin,
        mapping: "rexUI",
      },
    ],
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 400 },
    },
  },
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
