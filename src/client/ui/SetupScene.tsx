import { makeStyles } from "@material-ui/core";
import React from "react";
import { Socket } from "socket.io";
import * as m from "../../shared/models";
import NavBar from "./NavBar";

type SetupSceneProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

const useStyles = makeStyles({
  body: {
    minWidth: 650,
    paddingTop: "20px",
    paddingLeft: "20px",
    paddingRight: "20px",
  },
});

export default function SetupScene(props: SetupSceneProps) {
  const styles = useStyles();
  const { socket, gameState } = props;

  return (
    <div>
      <NavBar socket={socket} gameState={gameState} />
    </div>
  );
}
