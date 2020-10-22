import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { Star } from "@material-ui/icons";
import React from "react";
import { Socket } from "socket.io";
import { E } from "../shared/events";
import * as m from "../shared/models";
import NavBar from "./NavBar";

type LobbySceneProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

const useStyles = makeStyles({
  body: {
    display: "flex",
    justifyContent: "space-between",
    minWidth: 650,
    padding: "1.5rem",
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
  listWrapper: {
    minWidth: 200,
    borderLeft: "1px solid black",
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
            Set Name
          </Button>
        </div>
        <div className={styles.listWrapper}>
          <List
            component="nav"
            dense
            subheader={
              <ListSubheader component="div">
                Players ({numPlayers})
              </ListSubheader>
            }
          >
            {playerIDs.map((playerID) => {
              if (playerID === gameState.playerID) {
                return (
                  <ListItem>
                    <ListItemIcon>
                      <Star />
                    </ListItemIcon>
                    <ListItemText primary={gameState.players[playerID].Name} />
                  </ListItem>
                );
              } else {
                return (
                  <ListItem>
                    <ListItemText
                      inset
                      primary={gameState.players[playerID].Name}
                    />
                  </ListItem>
                );
              }
            })}
          </List>
        </div>
      </div>
      <div className={styles.footer}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            socket.emit(E.NextScene);
          }}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}
