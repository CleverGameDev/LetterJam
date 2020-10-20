import { Box } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {
  ArrowUpward as ArrowUpwardIcon,
  Done as DoneIcon,
  Filter1,
  Filter2,
  Filter3,
  Filter4,
  Filter5,
  Filter6,
  Filter7,
  Filter8,
  Filter9,
  Filter9Plus,
  FilterNone,
} from "@material-ui/icons";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ComputerIcon from "@material-ui/icons/Computer";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import React from "react";
import * as m from "./shared/models";
import "./Stands.css";

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
    <div className="stands">
      <Box display="flex" justifyContent="space-evenly">
        {gameState.visibleLetters.map((stand, idx) => {
          const isHumanPlayer = !!gameState.players[stand.playerID];
          return (
            <Stand
              visibleLetter={stand.letter.toUpperCase()}
              playerName={getStandName(gameState, stand)}
              playerType={isHumanPlayer ? "human" : "npc"}
              cardsBelow={stand.totalCards - (stand.currentCardIdx + 1)}
              isReady={gameState.playersReady[stand.playerID] || false}
            />
          );
        })}
      </Box>
    </div>
  );
  // No updates to Wildcard stand
}

const useStyles = makeStyles({
  root: {
    padding: "30px",
    margin: "10px 0",
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    // marginBottom: 12,
  },
});

type StandProps = {
  visibleLetter: string;
  playerName: string;
  playerType: string;
  isReady: boolean;
  cardsBelow: number;
};

function Stand(props: StandProps) {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-evenly"
      alignItems="center"
    >
      <Typography variant="h5">
        {props.playerName}
        {props.playerType === "human" && <PermIdentityIcon />}
        {props.playerType === "npc" && <ComputerIcon />}
      </Typography>
      <div className="readystate">
        {props.playerType === "human" && props.isReady && (
          <Box display="flex" flexDirection="row" alignItems="center">
            <CheckCircleIcon />
            Ready
          </Box>
        )}
        {props.playerType === "human" && !props.isReady && (
          <Box display="flex" flexDirection="row" alignItems="center">
            <div className="thinking">
              <HourglassEmptyIcon />
            </div>
            Thinking...
          </Box>
        )}
      </div>

      <Card className={classes.root}>
        <CardContent>
          <Typography variant="h2" component="h2">
            {props.visibleLetter}
          </Typography>
        </CardContent>
      </Card>
      {props.playerType === "human" && (
        <PlayerStandStatus currentCardIdx={2} totalCards={5} />
      )}
      {props.playerType === "npc" && (
        <>
          {props.cardsBelow === 0 && <FilterNone />}
          {props.cardsBelow === 1 && <Filter1 />}
          {props.cardsBelow === 2 && <Filter2 />}
          {props.cardsBelow === 3 && <Filter3 />}
          {props.cardsBelow === 4 && <Filter4 />}
          {props.cardsBelow === 5 && <Filter5 />}
          {props.cardsBelow === 6 && <Filter6 />}
          {props.cardsBelow === 7 && <Filter7 />}
          {props.cardsBelow === 8 && <Filter8 />}
          {props.cardsBelow === 9 && <Filter9 />}
          {props.cardsBelow > 9 && <Filter9Plus />}
        </>
      )}
    </Box>
  );
}

type PlayerStandStatusProps = {
  currentCardIdx: number;
  totalCards: number;
};

function PlayerStandStatus(props: PlayerStandStatusProps) {
  const out = [];
  for (let i = 0; i < props.totalCards; i++) {
    if (i < props.currentCardIdx) {
      out.push(
        <div className="standstatus standstatus--done">
          <DoneIcon />
        </div>
      );
    } else if (i == props.currentCardIdx) {
      out.push(
        <div className="standstatus standstatus--current">
          <ArrowUpwardIcon />
        </div>
      );
    } else {
      out.push(<div className="standstatus standstatus--future">?</div>);
    }
  }

  return <Box display="flex">{out}</Box>;
}
