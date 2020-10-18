import { makeStyles } from "@material-ui/core/styles";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import LocalFloristIcon from "@material-ui/icons/LocalFlorist";
import React from "react";
import * as m from "./shared/models";

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

export default function Flower(props: FlowerProps) {
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
