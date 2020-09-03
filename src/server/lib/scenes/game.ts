import * as _ from "lodash";

import { ServerGameState } from "../../lib/gameState";
import { PlayStateEnum, PlayStates } from "../../../shared/constants";
import { E, EType } from "../../../shared/events";
import { playerID } from "../playerUtils";

const getLetterOrdering = (gameState) => {
  const maxVotePlayerName = _.maxBy(
    Object.keys(gameState.votes),
    (key) => gameState.votes[key]
  );

  const playerID = gameState.getPlayerIDFromName(maxVotePlayerName);
  const visibleLetters = gameState.getVisibleLetters(playerID);
  const normalizedWord = (gameState.clueWords[playerID] || "").toLowerCase();
  const letterOrdering = [];

  const getLetterToPlayerID = (visibleLetters) => {
    const letterToPlayerIDs = {};
    for (const stand of visibleLetters) {
      letterToPlayerIDs[stand.letter] =
        letterToPlayerIDs[stand.letter] || stand.player;
    }
    return letterToPlayerIDs;
  };

  const letterToPlayerIDs = getLetterToPlayerID(visibleLetters);

  for (const c of normalizedWord) {
    if (letterToPlayerIDs[c]) {
      letterOrdering.push(letterToPlayerIDs[c]);
    } else {
      letterOrdering.push("*");
    }
  }
  return letterOrdering;
};

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

  socket.on(E.UpdateClue, (fullClue: EType[E.UpdateClue]) => {
    // Update game state
    gameState.clueWords[fullClue.playerID] = fullClue.word;
    delete fullClue.word;
    gameState.clues[fullClue.playerID] = {
      ...fullClue,
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

  socket.on(E.NextVisibleLetter, () => {
    gameState.visibleLetterIdx[playerID(socket)]++;
    // Do we need to refresh client state or anything like that?
  });

  socket.on(E.PlayerReady, () => {
    gameState.playersReady.add(playerID(socket));
    if (!gameState.areAllPlayersReady()) {
      return;
    }
    gameState.playStateIndex++;
    gameState.playStateIndex %= PlayStates.length;
    gameState.resetPlayersReady();
    io.to(gameState.room).emit(E.ChangePlayState, <EType[E.ChangePlayState]>{
      playState: PlayStates[gameState.playStateIndex],
    });
    if (PlayStates[gameState.playStateIndex] === PlayStateEnum.PROVIDE_HINT) {
      const letterOrdering = getLetterOrdering(gameState);
      io.to(gameState.room).emit(E.LetterOrdering, letterOrdering);
    }
    if (
      PlayStates[gameState.playStateIndex] === PlayStateEnum.CHECK_END_CONDITION
    ) {
      gameState.resetVotesAndClues();
    }
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
  gameState.playStateIndex = 0;
  registerListeners(io, socket, gameState);
};

export const teardown = (io, socket, gameState) => {
  deregisterListeners(io, socket, gameState);
};
