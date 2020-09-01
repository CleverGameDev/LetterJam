import { ServerGameState } from "../../lib/gameState";
import { E, EType } from "../../../shared/events";
import { playerID } from "../playerUtils";

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.on(E.SetPlayerName, (playerName: EType[E.SetPlayerName]) => {
    // Update game state
    if (gameState.getPlayerNames().indexOf(playerName) > -1) {
      // Don't let players take another player's name
      return;
    }

    const oldName = gameState.players.get(playerID(socket)).Name;
    gameState.players.set(playerID(socket), { Name: playerName });

    // Emit event
    io.to(gameState.room).emit(E.PlayerRenamed, <EType[E.PlayerRenamed]>{
      playerID: playerID(socket),
      oldPlayerName: oldName,
      newPlayerName: playerName,
    });
  });
};

const deregisterListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.removeAllListeners(E.SetPlayerName);
};

export const setup = (io, socket, gameState) => {
  registerListeners(io, socket, gameState);
};

export const teardown = (io, socket, gameState) => {
  deregisterListeners(io, socket, gameState);
};
