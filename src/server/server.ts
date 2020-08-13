/* eslint-disable */
const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");
/* eslint-enable */

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;

const io = socketIO(server);

const players = [];
const playerId = 0;

// Web logic
app.use("/", express.static(path.join(__dirname, "../../dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.get("/port", (req, res) => {
  // 443 in prod, 3000 in localhost
  if (process.env.IS_HEROKU) {
    res.send({
      internal_port: port,
      port: 443,
    });
    return;
  }
  res.send({ port });
});

const scenes = ["LobbyScene", "SetupScene", "GameScene", "EndScene"];

let sceneIndex = 0;
const roomName = "someRoom";

let clues = {};
let votes = {};

const resetState = () => {
  clues = {};
  votes = {};
};

io.on("connection", (client) => {
  client.join(roomName);
  players.push(client.id);

  client.on("disconnect", () => {
    players.splice(players.indexOf(client.id), 1);
    io.to(roomName).emit("playerLeft", {
      playerId: client.playerId,
    });
  });

  client.on("nextScene", () => {
    sceneIndex++;
    sceneIndex %= scenes.length;
    resetState();

    io.to(roomName).emit("update", {
      scene: scenes[sceneIndex],
    });
  });

  /////////////////
  // Discuss step
  /////////////////
  client.emit("clues", clues);

  client.on("updateClue", (clue) => {
    clues[clue.playerID] = {
      ...clue,
      playerID: undefined,
    };
  });

  // This voting system is like Medium, you can vote as many times as you'd like
  // We should actually track who voted for whom so we can actually change votes
  client.on("vote", (data) => {
    votes[data.votedID] ? votes[data.votedID]++ : (votes[data.votedID] = 1);
  });

  io.emit("ready", {
    id: playerId,
    scene: scenes[sceneIndex],
    players,
  });

  io.to(roomName).emit("playerJoined", {
    playerId,
  });
});

server.listen(port, () => {
  console.log("Express is listening on http://localhost:" + port);
});
