import * as _ from "lodash";

import { Scenes } from "../../shared/constants";
import { ServerGameState } from "../lib/gameState";
import { E, EType } from "../../shared/events";

const playerID = (socket: SocketIO.Socket) => socket.handshake.session.id;

const handlePlayerJoined = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  // TODO: This creates a race condition if you have multiple browser windows open as server starts
  if (!gameState.players.has(playerID(socket))) {
    // Update game state
    gameState.players.set(playerID(socket), {
      Name: "Default Player Name",
    });

    // Emit event
    io.to(gameState.room).emit(E.PlayerJoined, <EType[E.PlayerJoined]>{
      playerID: playerID(socket),
      playerName: gameState.players.get(playerID(socket)).Name,
    });
  }
};

const loadActiveScene = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  // A newly connected user starts at the PreloadScene, which listens for
  // an E.Ready event. When that event is fired, it will load the active scene.
  socket.emit(E.Ready, <EType[E.Ready]>{
    id: playerID(socket),
    scene: Scenes[gameState.sceneIndex],
    players: gameState.getPlayerNames(),
  });
};

export const setupSocketIO = (
  io: SocketIO.Server,
  gameState: ServerGameState
) => {
  io.on("connection", (socket: SocketIO.Socket) => {
    socket.join(gameState.room);
    handlePlayerJoined(io, socket, gameState);
    registerListeners(io, socket, gameState);
    loadActiveScene(io, socket, gameState);
  });
};

const registerListeners = (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  gameState: ServerGameState
) => {
  //
  // Global
  //
  socket.on("disconnect", () => {
    // Update game state
    // TODO: https://trello.com/c/8JwHD7nB/107-letterjam-given-persistent-ids-figure-out-how-a-player-leaves-lobby

    // Emit event
    io.to(gameState.room).emit(E.PlayerLeft, <EType[E.PlayerLeft]>{
      playerID: playerID(socket),
      playerName: gameState.players.get(playerID(socket))?.Name,
    });
  });

  socket.on(E.NextScene, () => {
    // Update game state
    gameState.sceneIndex++;
    gameState.sceneIndex %= Scenes.length;
    gameState.resetVotesAndClues();

    if (Scenes[gameState.sceneIndex] === "SetupScene") {
      gameState.setupNewGame();
    }

    // Emit event
    io.to(gameState.room).emit(E.ChangeScene, <EType[E.ChangeScene]>{
      scene: Scenes[gameState.sceneIndex],
    });
  });

  //
  // LobbyScene
  //
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

  //
  // GameScene
  //
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
