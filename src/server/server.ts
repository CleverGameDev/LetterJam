import express from "express";
import expressSession from "express-session";
import expressSocketIOSession from "express-socket.io-session";
import * as sqlite3 from "sqlite3";
import sqliteStoreFactory from "express-session-sqlite";

import http from "http";
import path from "path";
import socketIO from "socket.io";
import * as _ from "lodash";

import { setupNewGame } from "./lib/setup";
import { getVisibleLetters } from "./lib/gameUtils";
import { MaxPlayers, Scenes } from "../shared/constants";
import {
  ServerGameState,
  getPlayerIDs,
  getPlayerNames,
} from "../shared/models";

////////////////////
// Server
////////////////////

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const io = socketIO(server);

// Sessions
// - https://www.npmjs.com/package/express-socket.io-session#usage
// - https://www.npmjs.com/package/express-session-sqlite#usage
const SqliteStore = sqliteStoreFactory(expressSession);

const session = expressSession({
  store: new SqliteStore({
    driver: sqlite3.Database,

    // for in-memory database
    // path: ':memory:'
    path: "/tmp/letterjam-sessions-sqlite.db",

    // Session TTL in milliseconds
    ttl: 24 * 60 * 60 * 1000, // 1 day
  }),

  secret: "letterjam-session-secret",

  // We can tune the below depending on what session store we choose in prod.
  // Useful reading: https://stackoverflow.com/a/40396102
  //
  // Saves the session so it doesn't expire
  resave: true,
  // Persists the session even if we don't modify it on first visit
  saveUninitialized: true,
});

// Use session in server and socket io
app.use(session);
io.use(
  expressSocketIOSession(session, {
    autoSave: true,
  })
);

// Routes
app.use("/", express.static(path.join(__dirname, "../../dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

////////////////////
// Game state
////////////////////

// TODO: Support dynamic room name (e.g from URL path or query string)
const roomName = "someRoom";

// Players
let clues = {};
let votes = {};
const gameState: ServerGameState = {
  sceneIndex: 0,
  players: new Map(),
  numNPCs: 0,

  letters: {},
  visibleIndex: {},
  deck: [],
};

const resetState = () => {
  clues = {};
  votes = {};
};

// TODO: rename sessionID
const playerID = (socket: socketIO.Socket) => socket.handshake.session.id;

////////////////////////////////////////
// SocketIO event handling
////////////////////////////////////////
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
    resetState();

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

    io.to(roomName).emit("changeScene", {
      scene: Scenes[gameState.sceneIndex],
    });
  });

  /////////////////
  // Discuss step
  /////////////////
  socket.on("updateClue", (clue) => {
    clues[clue.playerID] = {
      ...clue,
    };
    io.to(roomName).emit("clues", clues);
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
    votes[data.votedID] ? votes[data.votedID]++ : (votes[data.votedID] = 1);
    const maxVotePlayerID = _.maxBy(Object.keys(votes), (key) => votes[key]);
    io.to(roomName).emit("winningVote", {
      playerID: maxVotePlayerID,
      votes: votes[maxVotePlayerID],
    });
  });

  ////////////////
  // Game loop
  ////////////////
  socket.on("getVisibleLetters", () => {
    const visibleLetters = getVisibleLetters(playerID(socket), gameState);
    socket.emit("visibleLetters", visibleLetters);
  });

  // Move from Preload scene to lobbyScene
  socket.emit("ready", {
    id: playerID(socket),
    scene: Scenes[gameState.sceneIndex],
    players: getPlayerNames(gameState),
  });
});

//
// Start server
//

server.listen(port, () => {
  console.log("Express is listening on http://localhost:" + port);
});
