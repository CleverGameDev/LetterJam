import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import EndScene from "./EndScene";
import GameScene from "./GameScene";
import LobbyScene from "./LobbyScene";
import SetupScene from "./SetupScene";
import { SceneEnum } from "./shared/constants";
// TODO: For the moment, I've directly copied the files under shared/, since create-react-app has a (reasonable) restriction on importing anything outside of src/
import { E, EType } from "./shared/events";
import { ClientGameState } from "./shared/models";

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({});

  // establish socket connection
  useEffect(() => {
    // TODO: this needs to point to the correct server in prod, as well
    const socket = io("http://localhost:3000");
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

  if (gameState === {}) {
    return <div>Loading...</div>;
  }

  const gs = gameState as ClientGameState;
  switch (gs.scene) {
    case SceneEnum.LobbyScene:
      return <LobbyScene />;
    case SceneEnum.SetupScene:
      return <SetupScene />;
    case SceneEnum.GameScene:
      return <GameScene gameState={gs} />;
    case SceneEnum.EndScene:
      return <EndScene />;
  }

  return <div>Error: Unable to game scene.</div>;
}

export default App;
