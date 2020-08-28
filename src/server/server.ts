import express from "express";
import expressSession from "express-session";
import expressSocketIOSession from "express-socket.io-session";
import * as sqlite3 from "sqlite3";
import sqliteStoreFactory from "express-session-sqlite";

import http from "http";
import path from "path";
import socketIO from "socket.io";
import * as _ from "lodash";

import { startGame } from "./lib/game";

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;

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

const io = socketIO(server);
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

// Initialize game + socketIO handling
startGame(io);

//
// Start server
//

server.listen(port, () => {
  console.log("Express is listening on http://localhost:" + port);
});
