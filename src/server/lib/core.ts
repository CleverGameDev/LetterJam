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

const handlePlayerJoined = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  gameState.tryAddPlayer(getPlayerID(socket));

  socket.emit(E.ChangeScene, <EType[E.ChangeScene]>{
    sceneKey: gameState.getScene(),
  });
  syncClientGameState(io, gameState);
};

const loadActiveScene = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  // Add current scene listeners
  sceneHandlers(io, socket, Scenes[gameState.sceneIndex]).setup(gameState);
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
