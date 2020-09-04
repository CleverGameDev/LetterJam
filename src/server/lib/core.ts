import { Scenes, DefaultPlayerName } from "../../shared/constants";
import { ServerGameState } from "../lib/gameState";
import { E, EType } from "../../shared/events";
import { playerID } from "./playerUtils";
import sceneHandlers from "./scenes";

export const syncClientGameState = (
  io: SocketIO.Server,
  gameState: ServerGameState
) => {
  // TODO: Debounce this so we don't spam the client with updates

  // Send the right client game state to each socket
  Object.keys(io.sockets.in(gameState.room).sockets).forEach((sid) => {
    const pid = playerID(io.sockets.sockets[sid]);
    if (!pid) {
      console.warn("couldn't find a player for this socket ID");
      return;
    }

    const cgs = gameState.getClientGameState(pid);
    io.to(sid).emit(E.SyncGameState, <EType[E.SyncGameState]>cgs);
  });
};

const handlePlayerJoined = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  // TODO: This creates a race condition if you have multiple browser windows open as server starts
  const id = playerID(socket);
  if (!gameState.players[id]) {
    // Update game state
    gameState.players[id] = {
      Name: DefaultPlayerName,
    };

    syncClientGameState(io, gameState);
  }
};

const loadActiveScene = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  // Add current scene listeners
  sceneHandlers(io, socket, Scenes[gameState.sceneIndex]).setup(gameState);

  // A newly connected user starts at the PreloadScene, which listens for
  const cgs = gameState.getClientGameState(playerID(socket));
  io.to(socket.id).emit(E.ServerReady, <EType[E.ServerReady]>cgs);
};

export const setupSocketIO = (
  io: SocketIO.Server,
  gameState: ServerGameState
): void => {
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
    // syncClientGameState(io, gameState);
  });

  socket.on(E.NextScene, () => {
    const prevSceneHandler = sceneHandlers(io, socket, gameState.getScene());

    // Remove previous listeners
    prevSceneHandler.teardown(gameState);

    // Update game state
    gameState.sceneIndex++;
    gameState.sceneIndex %= Scenes.length;
    gameState.resetVotesAndClues();

    // Add new listeners
    const nextSceneHandler = sceneHandlers(io, socket, gameState.getScene());
    nextSceneHandler.setup(gameState);

    // Emit event
    io.to(gameState.room).emit(E.ChangeScene, <EType[E.ChangeScene]>{
      scene: gameState.getScene(),
    });
    syncClientGameState(io, gameState);
  });
};
