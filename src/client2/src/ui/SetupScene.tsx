import React from "react";
import NavBar from "./NavBar";
import {
  makeStyles,
  Button,
} from "@material-ui/core";
import { Socket } from "socket.io";
import { E } from "../shared/events";
import * as m from "../shared/models";

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
      <NavBar scene="Setup" />
      <div className={styles.body}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            socket.emit(E.NextScene);
          }}
        >
          Next scene
        </Button>
      </div>
    </div>
  );
}
