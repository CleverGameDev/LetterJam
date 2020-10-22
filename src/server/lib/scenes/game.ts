import { E, EType } from "../../../shared/events";
import { ServerGameState } from "../../lib/gameState";
import { syncClientGameState } from "../core";
import { getPlayerID } from "../playerUtils";

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.on(E.UpdateClue, (clue: EType[E.UpdateClue]) => {
    gameState.clues[getPlayerID(socket)] = clue;
    syncClientGameState(io, gameState);
  });

  socket.on(E.Vote, (data: EType[E.Vote]) => {
    // TODO: pass the ID from the front-end instead of the name
    const playerID = gameState.getPlayerIDFromName(data.votedName);
    if (!playerID) {
      // ignore vote if there's no player with that name
      return;
    }
    // TODO: disallow voting if there's not a clue yet from that player

    gameState.vote(data.senderID, playerID);

    syncClientGameState(io, gameState);
  });

  socket.on(E.NextVisibleLetter, () => {
    gameState.visibleLetterIdx[getPlayerID(socket)]++;
    syncClientGameState(io, gameState);
  });

  socket.on(E.PlayerReady, () => {
    gameState.setPlayerToReady(getPlayerID(socket));
    syncClientGameState(io, gameState);
  });

  socket.on(E.UpdateClueNote, (data: EType[E.UpdateClueNote]) => {
    gameState.updateClueNote(getPlayerID(socket), data.clueIdx, data.note);
    syncClientGameState(io, gameState);
  });

  socket.on(E.UpdateFinalWord, (data: EType[E.UpdateFinalWord]) => {
    gameState.updateFinalWord(getPlayerID(socket), data.word);
    syncClientGameState(io, gameState);
  });
};

const deregisterListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.removeAllListeners(E.UpdateClue);
  socket.removeAllListeners(E.Vote);
  socket.removeAllListeners(E.NextVisibleLetter);
  socket.removeAllListeners(E.PlayerReady);
  socket.removeAllListeners(E.UpdateClueNote);
  socket.removeAllListeners(E.UpdateFinalWord);
};

export const setup = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
): void => {
  // gameState.playStateIndex = 0;
  registerListeners(io, socket, gameState);
};

export const teardown = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
): void => {
  deregisterListeners(io, socket, gameState);
};
