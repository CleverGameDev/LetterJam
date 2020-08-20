import express from "express";
import http from "http";
import path from "path";
import socketIO from "socket.io";

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const io = socketIO(server);

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
const playerNames = {};
const playerNameSet = new Set();

let clues = {};
let votes = {};

const resetState = () => {
  clues = {};
  votes = {};
};

io.on("connection", (client) => {
  client.join(roomName);

  client.on("disconnect", () => {
    io.to(roomName).emit("playerLeft", {
      playerId: client.id,
      playerName: playerNames[client.id],
    });
    playerNameSet.delete(playerNames[client.id]);
    delete playerNames[client.id];
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
  client.on("updateClue", (clue) => {
    clues[clue.playerID] = {
      ...clue,
    };
    client.emit("clues", clues);
  });

  client.on("setPlayerName", (playerName) => {
    // Don't let players take another player's name
    if (playerNameSet.has(playerName)) {
      return;
    }
    if (playerNames[client.id]) {
      const oldName = playerNames[client.id];
      playerNameSet.delete(oldName);
      playerNames[client.id] = playerName;
      playerNameSet.add(playerName);
      io.to(roomName).emit("playerRenamed", {
        playerId: client.id,
        oldPlayerName: oldName,
        newPlayerName: playerName,
      });
    } else {
      playerNames[client.id] = playerName;
      playerNameSet.add(playerName);
      io.to(roomName).emit("playerJoined", {
        playerId: client.id,
        playerName,
      });
    }
  });

  // This voting system is like Medium, you can vote as many times as you'd like
  // We should actually track who voted for whom so we can actually change votes
  client.on("vote", (data) => {
    votes[data.votedID] ? votes[data.votedID]++ : (votes[data.votedID] = 1);
  });

  io.emit("ready", {
    id: client.id,
    scene: scenes[sceneIndex],
    players: Array.from(playerNameSet),
  });
});

server.listen(port, () => {
  console.log("Express is listening on http://localhost:" + port);
});
