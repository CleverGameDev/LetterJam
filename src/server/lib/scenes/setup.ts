import { ServerGameState } from "../../lib/gameState";
import { E, EType } from "../../../shared/events";
import { playerID } from "../playerUtils";

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

export const setup = (io, socket, gameState) => {
  registerListeners(io, socket, gameState);
  gameState.setupNewGame();
};

export const teardown = (io, socket, gameState) => {
  deregisterListeners(io, socket, gameState);
};
