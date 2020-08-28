import socketIO, { Socket } from "socket.io";
import * as _ from "lodash";

import { setupNewGame, initGameState } from "../lib/setup";
import { getVisibleLetters } from "../lib/gameUtils";
import { Scenes } from "../../shared/constants";
import {
  ServerGameState,
  getPlayerNames,
  resetVotesAndClues,
} from "../../shared/models";
import { E, EType } from "../../shared/events";

const playerID = (socket: socketIO.Socket) => socket.handshake.session.id;

const handlePlayerJoined = (
  io: SocketIO.Server,
  socket: Socket,
  gameState: ServerGameState
) => {
  // "Login" on first connection
  // TODO: This creates a race condition if you have multiple browser windows open as server starts
  if (!gameState.players.has(playerID(socket))) {
    // Add to players
    gameState.players.set(playerID(socket), {
      Name: "Default Player Name",
    });

    io.to(gameState.room).emit(E.PlayerJoined, <EType[E.PlayerJoined]>{
      playerID: playerID(socket),
      playerName: gameState.players.get(playerID(socket)).Name,
    });
  }
};

const loadActiveScene = (
  io: SocketIO.Server,
  socket: Socket,
  gameState: ServerGameState
) => {
  // A newly connected user starts at the PreloadScene, which listens for
  // an E.Ready event. When that event is fired, it will load the active scene.
  socket.emit(E.Ready, <EType[E.Ready]>{
    id: playerID(socket),
    scene: Scenes[gameState.sceneIndex],
    players: getPlayerNames(gameState),
  });
};

export const setupSocketIO = (
  io: SocketIO.Server,
  gameState: ServerGameState
) => {
  io.on("connection", (socket: Socket) => {
    socket.join(gameState.room);
    handlePlayerJoined(io, socket, gameState);
    registerListeners(io, socket, gameState);
    loadActiveScene(io, socket, gameState);
  });
};

const registerListeners = (
  io: SocketIO.Server,
  socket: Socket,
  gameState: ServerGameState
) => {
  //
  // Global
  //
  socket.on("disconnect", () => {
    // TODO: change to 'offline' or something?
    // Have a specific action to explicitly disconnect once you've joined 1x and are in game
    io.to(gameState.room).emit(E.PlayerLeft, <EType[E.PlayerLeft]>{
      playerID: playerID(socket),
      playerName: gameState.players.get(playerID(socket))?.Name,
    });
    // gameState.players.delete(playerID(client));
  });

  socket.on(E.NextScene, () => {
    gameState.sceneIndex++;
    gameState.sceneIndex %= Scenes.length;
    resetVotesAndClues(gameState);

    if (Scenes[gameState.sceneIndex] === "SetupScene") {
      setupNewGame(gameState);
    }

    // Emit ChangeScene event
    const data: EType[E.ChangeScene] = {
      scene: Scenes[gameState.sceneIndex],
    };
    io.to(gameState.room).emit(E.ChangeScene, data);
  });

  //
  // LobbyScene
  //
  socket.on(E.SetPlayerName, (playerName: EType[E.SetPlayerName]) => {
    // Don't let players take another player's name
    if (getPlayerNames(gameState).indexOf(playerName) > -1) {
      return;
    }

    // update server game state
    const oldName = gameState.players.get(playerID(socket)).Name;
    gameState.players.set(playerID(socket), { Name: playerName });

    // broadcast event
    io.to(gameState.room).emit(E.PlayerRenamed, <EType[E.PlayerRenamed]>{
      playerID: playerID(socket),
      oldPlayerName: oldName,
      newPlayerName: playerName,
    });
  });

  //
  // GameScene
  //
  socket.on(E.GetVisibleLetters, () => {
    const visibleLetters = getVisibleLetters(playerID(socket), gameState);
    socket.emit(E.VisibleLetters, visibleLetters);
  });

  socket.on(E.UpdateClue, (clue: EType[E.UpdateClue]) => {
    gameState.clues[clue.playerID] = {
      ...clue,
    };

    const data: EType[E.Clues] = gameState.clues;
    io.to(gameState.room).emit(E.Clues, data);
  });

  // This voting system is like Medium, you can vote as many times as you'd like
  // We should actually track who voted for whom so we can actually change votes
  socket.on(E.Vote, (data: EType[E.Vote]) => {
    const names = getPlayerNames(gameState);
    if (names.indexOf(data.votedID) < 0) {
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

    io.to(gameState.room).emit(E.WinningVote, <EType[E.WinningVote]>{
      playerID: maxVotePlayerID,
      votes: gameState.votes[maxVotePlayerID],
    });
  });
};
