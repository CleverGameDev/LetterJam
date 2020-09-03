import { ServerGameState } from "../../lib/gameState";

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  return;
};

const deregisterListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  return;
};

export const setup = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
): void => {
  registerListeners(io, socket, gameState);
};

export const teardown = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
): void => {
  deregisterListeners(io, socket, gameState);
};
