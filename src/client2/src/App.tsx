import React, { useEffect, useState } from "react";
import io from "socket.io-client";
// TODO: For the moment, I've directly copied the files under shared/, since create-react-app has a (reasonable) restriction on importing anything outside of src/
import { SceneEnum } from "./shared/constants";
import { E, EType } from "./shared/events";
import { ClientGameState } from "./shared/models";
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

  if (gameState === {} || socket === null) {
    return <div>Loading...</div>;
  }

  const gs = gameState as ClientGameState;
  switch (gs.scene) {
    case SceneEnum.LobbyScene:
      // @ts-ignore
      return <LobbyScene socket={socket} gameState={gs} />;
    case SceneEnum.SetupScene:
      // @ts-ignore
      return <SetupScene socket={socket} gameState={gs} />;
    case SceneEnum.GameScene:
      // TODO: socket is always defined at this point
      // @ts-ignore
      return <GameScene socket={socket} gameState={gs} />;
    case SceneEnum.EndScene:
      return <EndScene socket={socket} gameState={gs} />;
  }

  return <div>Error: Unable to game scene.</div>;
}

export default App;
