import * as _ from "lodash";

import { ServerGameState } from "../../lib/gameState";
import { E, EType } from "../../../shared/events";
import { playerID } from "../playerUtils";

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  socket.on(E.GetVisibleLetters, () => {
    // Get game state
    const visibleLetters = gameState.getVisibleLetters(playerID(socket));

    // Emit event
    socket.emit(E.VisibleLetters, <EType[E.VisibleLetters]>visibleLetters);
  });

  socket.on(E.UpdateClue, (clue: EType[E.UpdateClue]) => {
    // Update game state
    gameState.clues[clue.playerID] = {
      ...clue,
    };

    // Emit event
    io.to(gameState.room).emit(E.Clues, <EType[E.Clues]>gameState.clues);
  });

  // This voting system is like Medium, you can vote as many times as you'd like
  // We should actually track who voted for whom so we can actually change votes
  socket.on(E.Vote, (data: EType[E.Vote]) => {
    // Update game state
    if (gameState.getPlayerNames().indexOf(data.votedID) < 0) {
      // ignore vote if there's no player with that name
      return;
    }

    gameState.votes[data.votedID]
      ? gameState.votes[data.votedID]++
      : (gameState.votes[data.votedID] = 1);
    const maxVotePlayerID = _.maxBy(
      Object.keys(gameState.votes),
      (key) => gameState.votes[key]
    );

    // Emit event
    io.to(gameState.room).emit(E.WinningVote, <EType[E.WinningVote]>{
      playerID: maxVotePlayerID,
      votes: gameState.votes[maxVotePlayerID],
    });
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
};

export const setup = (io, socket, gameState) => {
  registerListeners(io, socket, gameState);
};

export const teardown = (io, socket, gameState) => {
  deregisterListeners(io, socket, gameState);
};
