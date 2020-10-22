import React from "react";
import { Socket } from "socket.io";
import * as m from "../shared/models";
import NavBar from "./NavBar";

type EndSceneProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

export default function EndScene(props: EndSceneProps) {
  const { gameState, socket } = props;
  return (
    <div>
      <NavBar gameState={gameState} socket={socket} />;
    </div>
  );
}
