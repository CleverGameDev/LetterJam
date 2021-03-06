import { Scenes } from "../../shared/constants";
import { E, EType } from "../../shared/events";
import { ServerGameState } from "../lib/gameState";
import { getPlayerID } from "./playerUtils";
import sceneHandlers from "./scenes";

export const syncClientGameState = (
  io: SocketIO.Server,
  gameState: ServerGameState
) => {
  // TODO: Don't send no-ops
  // (e.g. if a player votes for same person they've already voted for, this is a no-op; there's no need to send unchanged state to clients)
  // Possible solution: save a reference to previous client/server state and only send if there was a delta
  //
  // TODO: Debounce this so we don't spam the client with updates: https://lodash.com/docs/4.17.15#debounce

  // Send the right client game state to each socket
  Object.values(io.sockets.in(gameState.room).sockets).forEach((s) => {
    const pid = getPlayerID(s);
    if (!pid) {
      console.warn("couldn't find a player for this socket");
      return;
    }

    const cgs = gameState.getClientGameState(pid);
    s.emit(E.SyncGameState, <EType[E.SyncGameState]>cgs);
  });
  if (process.env.NODE_ENV !== "production") {
    console.log(`syncClientGameState ${new Date()} ... ServerGameState is:`);
    console.dir({ gameState }, { depth: null });
  }
};

const loadGame = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.emit(E.ChangeScene, <EType[E.ChangeScene]>{
    sceneKey: gameState.getScene(),
  });
  syncClientGameState(io, gameState);
};

export const setupSocketIO = (
  io: SocketIO.Server,
  gameState: ServerGameState
): void => {
  io.on("connection", (socket: SocketIO.Socket) => {
    // Subscribe the socket to events in the current room
    socket.join(gameState.room);

    // Add general purpose server listeners
    registerListeners(io, socket, gameState);

    // Add current scene listeners
    sceneHandlers(io, socket, Scenes[gameState.sceneIndex]).setup(gameState);

    // Add the player
    gameState.tryAddPlayer(getPlayerID(socket));

    // Load the game
    loadGame(io, socket, gameState);
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
    gameState.tryRemovePlayer(getPlayerID(socket));
    syncClientGameState(io, gameState);
  });

  socket.on(E.NextScene, () => {
    // Remove listeners for current scene
    Object.values(io.sockets.in(gameState.room).sockets).forEach((s) => {
      sceneHandlers(io, s, gameState.getScene()).teardown(gameState);
    });

    // Update game state
    gameState.advanceScene();

    // Add listeners for new scene
    Object.values(io.sockets.in(gameState.room).sockets).forEach((s) => {
      sceneHandlers(io, s, gameState.getScene()).setup(gameState);
    });

    // Emit event
    io.to(gameState.room).emit(E.ChangeScene, <EType[E.ChangeScene]>{
      sceneKey: gameState.getScene(),
    });

    // Sync client state after changing scene
    syncClientGameState(io, gameState);
  });
};
