import {
  Button,
  Divider,
  Grid,
  makeStyles,
  TextField,
} from "@material-ui/core";
import React from "react";
import { Socket } from "socket.io";
import { E } from "../../shared/events";
import * as m from "../../shared/models";
import NavBar from "./NavBar";

type LobbySceneProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

const useStyles = makeStyles({
  body: {
    display: "flex",
    minWidth: 650,
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    margin: "0.5rem",
    height: "5rem",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    width: "25rem",
  },
  input: {
    marginBottom: "1rem",
    marginTop: "1rem",
  },
  divider: {
    marginTop: "1rem",
    marginBottom: "1rem",
    width: "100%",
  },
  otherPlayers: {},
  playerName: {
    border: "1px solid black",
    borderRadius: "0.5rem",
    fontSize: "1.5rem",
    margin: "0.5rem",
    padding: "0.5rem",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
  },
});

export default function LobbyScene(props: LobbySceneProps) {
  const styles = useStyles();
  const [text, setText] = React.useState("");
  const { socket, gameState } = props;

  const playerIDs = Object.keys(gameState?.players || {}).sort();
  const numPlayers = playerIDs.length;

  const submitPlayerName = () => socket.emit(E.SetPlayerName, text);

  return (
    <div>
      <NavBar socket={socket} gameState={gameState} />
      <div className={styles.body}>
        <img
          className={styles.logo}
          src="https://pawnsperspective.com/wp-content/uploads/2019/11/pic4853794.png"
        />
        You are joining as:
        <div className={styles.playerName}>
          {gameState.players[gameState.playerID].Name}
        </div>
        <div className={styles.inputWrapper}>
          <TextField
            autoFocus
            className={styles.input}
            fullWidth
            label="Player name"
            value={text}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                submitPlayerName();
              }
            }}
            // @ts-ignore
            onInput={(e) => setText(e.target.value)}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={submitPlayerName}
          >
            Update Name
          </Button>
        </div>
        <Divider className={styles.divider} variant="middle" />
        {playerIDs.length > 1 && (
          <div>
            In the lobby:
            <Grid
              className={styles.otherPlayers}
              container
              direction="row"
              justify="center"
              alignItems="center"
            >
              {playerIDs.map((playerID) => {
                if (playerID === gameState.playerID) return;
                return (
                  <div className={styles.playerName}>
                    {gameState.players[playerID].Name}
                  </div>
                );
              })}
            </Grid>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            socket.emit(E.NextScene);
          }}
          disabled={playerIDs.length < 2 || playerIDs.length > 6}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}
