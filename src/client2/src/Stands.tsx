import { Box } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import * as m from "./shared/models";

function getStandName(gameState: m.ClientGameState, stand: m.Stand) {
  // get name for player or NPC
  const player = gameState.players[stand.playerID];
  if (player) {
    return player.Name; // Player
  }

  return stand.playerID; // NPC or wildcard
}

type StandsProps = {
  gameState: m.ClientGameState;
};

export default function Stands(props: StandsProps) {
  const { gameState } = props;
  return (
    <div>
      <h1>Stands</h1>
      <Box display="flex" justifyContent="space-evenly">
        {gameState.visibleLetters.map((stand, idx) => {
          const isPlayer = gameState.players[stand.playerID];
          let readyText = gameState.playersReady[stand.playerID]
            ? "ready!"
            : "not ready";
          if (!isPlayer) {
            readyText = "";
          }
          return (
            <Stand
              visibleLetter={stand.letter}
              playerName={getStandName(gameState, stand)}
              deckPosition={`${stand.currentCardIdx + 1}/${stand.totalCards}`}
              readyText={readyText}
            />
          );
        })}
      </Box>
    </div>
  );
  // No updates to Wildcard stand
}

const useStyles = makeStyles({
  root: {},
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

type StandProps = {
  visibleLetter: string;
  deckPosition: string; // e.g. "1/5"
  playerName: string;
  readyText: string;
};

function Stand(props: StandProps) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {props.visibleLetter}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {props.deckPosition}
        </Typography>
        <Typography variant="body2" component="p">
          {props.playerName}
        </Typography>
        <Typography variant="body2" component="p">
          {props.readyText}
        </Typography>
      </CardContent>
    </Card>
  );
}
