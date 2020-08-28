import express from "express";
import expressSession from "express-session";
import expressSocketIOSession from "express-socket.io-session";
import * as sqlite3 from "sqlite3";
import sqliteStoreFactory from "express-session-sqlite";

import http from "http";
import path from "path";
import socketIO from "socket.io";

import { initGameState } from "./lib/setup";
import { setupSocketIO } from "./lib/core";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Enable sessions for express server
const SqliteStore = sqliteStoreFactory(expressSession);
const session = expressSession({
  store: new SqliteStore({
    driver: sqlite3.Database,
    path: "/tmp/letterjam-sessions-sqlite.db",
    ttl: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  }),
  secret: "letterjam-session-secret",
  // Saves the session so it doesn't expire
  resave: true,
  // Persists the session even if we don't modify it on first visit
  saveUninitialized: true,
});
app.use(session);

// Routes
app.use("/", express.static(path.join(__dirname, "../../dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

// Setup socketIO, including shared session with express server
const io = socketIO(server);
io.use(
  expressSocketIOSession(session, {
    autoSave: true,
  })
);

// Initialize game state and socketIO handling
setupSocketIO(io, initGameState());

// Start server
server.listen(port, () => {
  console.log("Express is listening on http://localhost:" + port);
});
