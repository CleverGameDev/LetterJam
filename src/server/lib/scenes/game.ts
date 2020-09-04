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
  socket.on(E.UpdateClue, (fullClue: EType[E.UpdateClue]) => {
    // Update game state
    gameState.clueWords[fullClue.playerID] = fullClue.word;
    delete fullClue.word;
    gameState.clues[fullClue.playerID] = {
      ...fullClue,
    };

    syncClientGameState(io, gameState);
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
    // TODO: put this in ClientGameState logic
    // const maxVotePlayerID = _.maxBy(
    //   Object.keys(gameState.votes),
    //   (key) => gameState.votes[key]
    // );

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
    gameState.playStateIndex++;
    gameState.playStateIndex %= PlayStates.length;
    gameState.resetPlayersReady();

    // TODO: Track who is ready and show it

    if (PlayStates[gameState.playStateIndex] === PlayStateEnum.PROVIDE_HINT) {
      // No action needed
    }
    if (
      PlayStates[gameState.playStateIndex] === PlayStateEnum.CHECK_END_CONDITION
    ) {
      gameState.resetVotesAndClues();
    }

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
