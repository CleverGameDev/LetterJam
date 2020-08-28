import socketIO, { Socket, Server } from "socket.io";
import * as _ from "lodash";

import { setupNewGame } from "../lib/setup";
import { getVisibleLetters } from "../lib/gameUtils";
import { MaxPlayers, Scenes } from "../../shared/constants";
import {
  ServerGameState,
  getPlayerIDs,
  getPlayerNames,
  resetVotesAndClues,
} from "../../shared/models";
import { E, EType } from "../../shared/events";

const roomName = "someRoom";

export const startGame = (io: SocketIO.Server) => {
  const gameState: ServerGameState = {
    sceneIndex: 0,
    players: new Map(),
    numNPCs: 0,

    letters: {},
    visibleIndex: {},
    deck: [],

    clues: {},
    votes: {},
  };

  setupSocketIO(io, gameState);
};

const playerID = (socket: socketIO.Socket) => socket.handshake.session.id;

const setupSocketIO = (io: SocketIO.Server, gameState: ServerGameState) => {
  io.on("connection", (socket) => {
    // "Login" on first connection
    // TODO: This creates a race condition if you have multiple browser windows open as server starts
    if (!gameState.players.has(playerID(socket))) {
      // Add to players
      gameState.players.set(playerID(socket), {
        Name: "Default Player Name",
      });

      io.to(roomName).emit("playerJoined", {
        playerID: playerID(socket),
        playerName: gameState.players.get(playerID(socket)).Name,
      });
    }

    socket.join(roomName);

    socket.on("disconnect", () => {
      // TODO: change to 'offline' or something?
      // Have a specific action to explicitly disconnect once you've joined 1x and are in game
      io.to(roomName).emit("playerLeft", {
        playerId: playerID(socket),
        playerName: gameState.players.get(playerID(socket))?.Name,
      });
      // gameState.players.delete(playerID(client));
    });

    socket.on("nextScene", () => {
      gameState.sceneIndex++;
      gameState.sceneIndex %= Scenes.length;
      resetVotesAndClues(gameState);

      if (Scenes[gameState.sceneIndex] === "SetupScene") {
        const numNPCs = MaxPlayers - getPlayerIDs(gameState).length;
        const { playerHands, npcHands, deck } = setupNewGame(
          getPlayerIDs(gameState)
        );
        const visibleIndex = {};
        for (const key of getPlayerIDs(gameState)) {
          visibleIndex[key] = 0;
        }
        for (let i = 0; i < numNPCs; i++) {
          visibleIndex[`N${i + 1}`] = 0;
        }

        // Update gameState
        gameState.numNPCs = numNPCs;
        gameState.deck = deck;
        gameState.letters = {
          ...playerHands,
          ...npcHands,
        };
        gameState.visibleIndex = visibleIndex;
      }

      // Emit ChangeScene event
      const data: EType[E.ChangeScene] = {
        scene: Scenes[gameState.sceneIndex],
      };
      io.to(roomName).emit(E.ChangeScene, data);
    });

    /////////////////
    // Discuss step
    /////////////////
    socket.on(E.UpdateClue, (clue: EType[E.UpdateClue]) => {
      gameState.clues[clue.playerID] = {
        ...clue,
      };

      const data: EType[E.Clues] = gameState.clues;
      io.to(roomName).emit(E.Clues, data);
    });

    socket.on("setPlayerName", (playerName) => {
      // Don't let players take another player's name
      if (getPlayerNames(gameState).indexOf(playerName) > -1) {
        return;
      }

      // update server game state
      const oldName = gameState.players.get(playerID(socket)).Name;
      gameState.players.set(playerID(socket), { Name: playerName });

      // broadcast event
      io.to(roomName).emit("playerRenamed", {
        playerId: playerID(socket),
        oldPlayerName: oldName,
        newPlayerName: playerName,
      });
    });

    // This voting system is like Medium, you can vote as many times as you'd like
    // We should actually track who voted for whom so we can actually change votes
    socket.on("vote", (data) => {
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

      const winningVote: EType[E.WinningVote] = {
        playerID: maxVotePlayerID,
        votes: gameState.votes[maxVotePlayerID],
      };
      io.to(roomName).emit(E.WinningVote, winningVote);
    });

    ////////////////
    // Game loop
    ////////////////
    socket.on(E.GetVisibleLetters, () => {
      const visibleLetters = getVisibleLetters(playerID(socket), gameState);
      socket.emit(E.VisibleLetters, visibleLetters);
    });

    // Move from Preload scene to lobbyScene
    socket.emit("ready", {
      id: playerID(socket),
      scene: Scenes[gameState.sceneIndex],
      players: getPlayerNames(gameState),
    });
  });
};
