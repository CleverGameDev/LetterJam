import { E, EType } from "../../../shared/events";
import { ServerGameState } from "../../lib/gameState";
import { syncClientGameState } from "../core";
import { getPlayerID } from "../playerUtils";

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.on(E.SetPlayerName, (playerName: EType[E.SetPlayerName]) => {
    if (playerName === "") {
      // name must be non-empty
      return;
    }
    // Update game state
    if (gameState.getPlayerNames().indexOf(playerName) > -1) {
      // Don't let players take another player's name
      return;
    }

    gameState.players[getPlayerID(socket)] = { Name: playerName };

    syncClientGameState(io, gameState);
  });
};

const deregisterListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.removeAllListeners(E.SetPlayerName);
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
