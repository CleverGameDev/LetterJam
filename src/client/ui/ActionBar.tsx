import { Button, makeStyles, TextField } from "@material-ui/core";
import React from "react";
import { Socket } from "socket.io";
import { giveClue } from "../lib/discuss";
import { PlayStateEnum } from "../shared/constants";
import { E } from "../shared/events";
import * as m from "../shared/models";

const useStyles = makeStyles({
  inputWrapper: {
    display: "flex",
    paddingBottom: "1rem",
  },
  inputItem: {
    paddingRight: "1rem",
  },
});

type ActionBarProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

export default function ActionBar(props: ActionBarProps) {
  const styles = useStyles();
  const { socket, gameState } = props;
  const [text, setText] = React.useState("");

  const submitClue = () => {
    giveClue(socket, text, gameState);
  };

  const submitNextLetter = () => {
    socket.emit(E.NextVisibleLetter);
  };

  const submitReady = () => {
    socket.emit(E.PlayerReady);
  };

  return (
    <div>
      <h1>Actions</h1>
      <div className={styles.inputWrapper}>
        {gameState.playState === PlayStateEnum.DISCUSS && (
          <>
            <div className={styles.inputItem}>
              <TextField
                autoFocus
                label="Clue"
                value={text}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    submitClue();
                  }
                }}
                // @ts-ignore
                onInput={(e) => setText(e.target.value)}
              />
            </div>

            <div className={styles.inputItem}>
              <Button variant="contained" color="primary" onClick={submitClue}>
                Give Clue
              </Button>
            </div>
            <div className={styles.inputItem}>
              <Button
                variant="contained"
                color="secondary"
                disabled={Array.from(Object.keys(gameState.votes)).length === 0}
                onClick={submitReady}
              >
                I'm Ready
              </Button>
            </div>
          </>
        )}

        {gameState.playState === PlayStateEnum.INTERPRET_HINT && (
          <>
            <div className={styles.inputItem}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  submitNextLetter();
                  submitReady();
                }}
                disabled={gameState.playersReady[gameState.playerID]}
              >
                I know my letter
              </Button>
            </div>

            <div className={styles.inputItem}>
              <Button
                variant="contained"
                color="secondary"
                onClick={submitReady}
                disabled={gameState.playersReady[gameState.playerID]}
              >
                Not sure yet
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
