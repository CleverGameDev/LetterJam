import { makeStyles } from "@material-ui/core/styles";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import LocalFloristIcon from "@material-ui/icons/LocalFlorist";
import React from "react";
import NavBar from "./NavBar";
import * as m from "./shared/models";

type GameSceneProps = {
  gameState: m.ClientGameState;
};

function GuessingSheet() {}

function ActiveClues() {}

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

function Stands() {}

type FlowerProps = {
  data: m.Flower;
};

function iconStyles() {
  return {
    redFlower: {
      color: "red",
    },
    greenFlower: {
      color: "green",
    },
    greenLockedFlower: {
      color: "gray",
    },
  };
}

function Flower(props: FlowerProps) {
  const classes = makeStyles(iconStyles)();
  const { red, green, greenLocked } = props.data;
  const out = [];
  for (let i = 0; i < red; i++) {
    out.push(<FiberManualRecordIcon className={classes.redFlower} />);
  }
  for (let i = 0; i < green; i++) {
    out.push(<FiberManualRecordIcon className={classes.greenFlower} />);
  }
  for (let i = 0; i < greenLocked; i++) {
    out.push(<FiberManualRecordIcon className={classes.greenLockedFlower} />);
  }

  return (
    <div>
      <LocalFloristIcon />
      {out}
    </div>
  );
}

export default function GameScene(props: GameSceneProps) {
  const { gameState } = props;
  console.log({ gameState });
  return (
    <div>
      <NavBar />
      <Flower data={gameState.flower} />
      Game Scene
    </div>
  );
}
