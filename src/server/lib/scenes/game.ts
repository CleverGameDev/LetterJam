import * as _ from "lodash";

import { ServerGameState } from "../../lib/gameState";
import { PlayStateEnum, PlayStates } from "../../../shared/constants";
import { E, EType } from "../../../shared/events";
import { playerID } from "../playerUtils";
import { syncClientGameState } from "../core";

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.on(E.UpdateClue, (clue: EType[E.UpdateClue]) => {
    gameState.clues[playerID(socket)] = clue;
    syncClientGameState(io, gameState);
  });

  // This voting system is like Medium, you can vote as many times as you'd like
  // We should actually track who voted for whom so we can actually change votes
  socket.on(E.Vote, (data: EType[E.Vote]) => {
    const playerID = gameState.getPlayerIDFromName(data.votedName);
    if (!playerID) {
      // ignore vote if there's no player with that name
      return;
    }

    gameState.vote(data.senderID, playerID);

    syncClientGameState(io, gameState);
  });

  socket.on(E.NextVisibleLetter, () => {
    gameState.visibleLetterIdx[playerID(socket)]++;
    syncClientGameState(io, gameState);
  });

  socket.on(E.PlayerReady, () => {
    gameState.playersReady.add(playerID(socket));
    if (!gameState.areAllPlayersReady()) {
      return;
    }

    gameState.advancePlayState();

    syncClientGameState(io, gameState);
  });
};

const deregisterListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.removeAllListeners(E.GetVisibleLetters);
  socket.removeAllListeners(E.UpdateClue);
  socket.removeAllListeners(E.Vote);
  socket.removeAllListeners(E.NextVisibleLetter);
  socket.removeAllListeners(E.PlayerReady);
};

export const setup = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
): void => {
  gameState.playStateIndex = 0;
  registerListeners(io, socket, gameState);
};

export const teardown = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
): void => {
  deregisterListeners(io, socket, gameState);
};
