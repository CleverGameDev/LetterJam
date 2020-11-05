import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { SceneEnum } from "../shared/constants";
import { E, EType } from "../shared/events";
import { ClientGameState } from "../shared/models";
import EndScene from "./ui/EndScene";
import GameScene from "./ui/GameScene";
import LobbyScene from "./ui/LobbyScene";
import SetupScene from "./ui/SetupScene";

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({});

  // establish socket connection
  useEffect(() => {
    const socket = io();
    // @ts-ignore
    setSocket(socket);
  }, []);

  // subscribe to the socket event
  useEffect(() => {
    if (socket === null) return;

    // @ts-ignore
    socket.on(E.SyncGameState, (data: EType[E.SyncGameState]) => {
      setGameState(data);
    });
  }, [socket]);

  if (Object.keys(gameState).length === 0 || socket === null) {
    return <div>Loading...</div>;
  }

  // Ensure that Typescript knows these are well defined..
  const s = socket as SocketIO.Socket;
  const gs = gameState as ClientGameState;
  switch (gs.scene) {
    case SceneEnum.LobbyScene:
      return <LobbyScene socket={s} gameState={gs} />;
    case SceneEnum.SetupScene:
      return <SetupScene socket={s} gameState={gs} />;
    case SceneEnum.GameScene:
      return <GameScene socket={s} gameState={gs} />;
    case SceneEnum.EndScene:
      return <EndScene socket={s} gameState={gs} />;
  }

  return <div>Error: Unable to game scene.</div>;
}

export default App;
