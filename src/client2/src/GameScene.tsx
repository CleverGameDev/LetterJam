import React from "react";
import { Socket } from "socket.io";
import ActiveClues from "./ActiveClues";
import Flower from "./Flower";
import NavBar from "./NavBar";
import * as m from "./shared/models";
import Stands from "./Stands";

type GameSceneProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

function GuessingSheet() {}

function Buttons() {
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
}

function GiveClueModal() {}

export default function GameScene(props: GameSceneProps) {
  const { socket, gameState } = props;
  console.log({ gameState });
  return (
    <div>
      <NavBar scene={"Game"} />
      <Flower data={gameState.flower} />
      <Stands gameState={gameState} />
      <ActiveClues socket={socket} gameState={gameState} />
    </div>
  );
}
