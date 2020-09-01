import { Scenes } from "../../shared/constants";
import { ServerGameState } from "../lib/gameState";
import { E, EType } from "../../shared/events";
import { playerID } from "./playerUtils";
import sceneHandlers from "./scenes";

const handlePlayerJoined = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  // TODO: This creates a race condition if you have multiple browser windows open as server starts
  if (!gameState.players.has(playerID(socket))) {
    // Update game state
    gameState.players.set(playerID(socket), {
      Name: "Default Player Name",
    });

    // Emit event
    io.to(gameState.room).emit(E.PlayerJoined, <EType[E.PlayerJoined]>{
      playerID: playerID(socket),
      playerName: gameState.players.get(playerID(socket)).Name,
    });
  }
};

const loadActiveScene = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  // A newly connected user starts at the PreloadScene, which listens for
  // an E.Ready event. When that event is fired, it will load the active scene.
  socket.emit(E.Ready, <EType[E.Ready]>{
    id: playerID(socket),
    scene: Scenes[gameState.sceneIndex],
    players: gameState.getPlayerNames(),
  });

  // Add current scene listeners
  sceneHandlers(io, socket, Scenes[gameState.sceneIndex]).setup(gameState);
};

export const setupSocketIO = (
  io: SocketIO.Server,
  gameState: ServerGameState
) => {
  io.on("connection", (socket: SocketIO.Socket) => {
    socket.join(gameState.room);
    handlePlayerJoined(io, socket, gameState);
    registerListeners(io, socket, gameState);
    loadActiveScene(io, socket, gameState);
  });
};

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  //
  // Global
  //
  socket.on("disconnect", () => {
    // Update game state
    // TODO: https://trello.com/c/8JwHD7nB/107-letterjam-given-persistent-ids-figure-out-how-a-player-leaves-lobby

    // Emit event
    io.to(gameState.room).emit(E.PlayerLeft, <EType[E.PlayerLeft]>{
      playerID: playerID(socket),
      playerName: gameState.players.get(playerID(socket))?.Name,
    });
  });

  socket.on(E.NextScene, () => {
    const prevSceneHandler = sceneHandlers(
      io,
      socket,
      Scenes[gameState.sceneIndex]
    );

    // Remove previous listeners
    prevSceneHandler.teardown(gameState);

    // Update game state
    gameState.sceneIndex++;
    gameState.sceneIndex %= Scenes.length;
    gameState.resetVotesAndClues();

    // Add new listeners
    const nextSceneHandler = sceneHandlers(
      io,
      socket,
      Scenes[gameState.sceneIndex]
    );
    nextSceneHandler.setup(gameState);

    // Emit event
    io.to(gameState.room).emit(E.ChangeScene, <EType[E.ChangeScene]>{
      scene: Scenes[gameState.sceneIndex],
    });
  });

  //
  // GameScene
  //
};
