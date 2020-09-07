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
  // TODO: This creates a race condition if you have multiple browser windows open as server starts
  const id = playerID(socket);
  const room = socket.handshake.query.room;
  console.log({ room });
  if (!gameState.players[id]) {
    // Update game state
    gameState.players[id] = {
      Name: DefaultPlayerName,
    };
  }

  io.to(socket.id).emit(E.ChangeScene, <EType[E.ChangeScene]>{
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
    sceneHandlers(io, socket, gameState.getScene()).teardown(gameState);

    // Update game state
    gameState.advanceScene();

    // Add listeners for new scene
    sceneHandlers(io, socket, gameState.getScene()).setup(gameState);

    // Emit event
    io.to(gameState.room).emit(E.ChangeScene, <EType[E.ChangeScene]>{
      sceneKey: gameState.getScene(),
    });

    // Sync client state after changing scene
    syncClientGameState(io, gameState);
  });
};
