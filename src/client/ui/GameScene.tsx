import { makeStyles } from "@material-ui/core";
import React from "react";
import { Socket } from "socket.io";
import { PlayStateEnum } from "../../shared/constants";
import * as m from "../../shared/models";
import ActiveClues from "../ActiveClues";
import ActionBar from "./ActionBar";
import Flower from "./Flower";
import GuessingSheet from "./GuessingSheet";
import NavBar from "./NavBar";
import Stands from "./Stands";

type GameSceneProps = {
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

// TODO
// function Buttons() {
// buttons: [
//   this._createButton(this, "Next Scene"),
//   this._createButton(this, "Guessing Sheet"),
//   this._createButton(this, "Active Clues"),
//   this._createButton(this, "Give Clue"),
//   this._createButton(this, "Go to next letter"),
//   this._createButton(this, "I am ready")
//
//
// this.buttons
//   .on("button.click", (button, index: number) => {
//     switch (index) {
//       case 0:
//         this.socket.emit(E.NextScene);
//         break;
//       case 1:
//         this._closeAll();
//         toggleOpenClose(this.guessingSheet);
//         break;
//       case 2:
//         this._closeAll();
//         toggleOpenClose(this.activeClues);
//         break;
//       case 3:
//         if (this.gameState.playState === PlayStateEnum.INTERPRET_HINT) {
//           break;
//         }
//         this._closeAll();
//         toggleOpenClose(this.clueDialog);
//         break;
//       case 4:
//         this.socket.emit(E.NextVisibleLetter);
//         break;
//       case 5:
//         this.socket.emit(E.PlayerReady);
//         break;
//       default:
//         break;
//     }
//   })
// }

export default function GameScene(props: GameSceneProps) {
  const styles = useStyles();
  const { socket, gameState } = props;
  return (
    <div>
      <NavBar socket={socket} gameState={gameState} />
      <div className={styles.body}>
        <Flower data={gameState.flower} />
        <Stands gameState={gameState} />
        <ActionBar socket={socket} gameState={gameState} />
        {gameState.playState === PlayStateEnum.DISCUSS && (
          <ActiveClues socket={socket} gameState={gameState} />
        )}
        {gameState.playState === PlayStateEnum.INTERPRET_HINT && (
          <GuessingSheet socket={socket} gameState={gameState} />
        )}
      </div>
    </div>
  );
}
