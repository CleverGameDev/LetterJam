import Button from "@material-ui/core/Button";
import lightGreen from "@material-ui/core/colors/lightGreen";
import Paper from "@material-ui/core/Paper";
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import * as _ from "lodash";
import React from "react";
import { Socket } from "socket.io";
import { WildcardPlayerID } from "./shared/constants";
import { E, EType } from "./shared/events";
import * as m from "./shared/models";

const getPlayerType = (gameState: m.ClientGameState, playerID: string) => {
  if (gameState.players[playerID]) {
    return m.PlayerType.Player;
  } else if (playerID === WildcardPlayerID) {
    return m.PlayerType.Wildcard;
  } else {
    return m.PlayerType.NPC;
  }
};

type ClueRow = {
  player_name: string;
  word_length: number;
  players_used: number;
  npcs_used: number;
  bonuses_used: number;
  wildcard_used: boolean;
  votes: number;
  isMyVote: boolean;
  isWinningPlayer: boolean;
};

const clueToRow = (
  playerID: string,
  clue: m.ClueV2,
  gameState: m.ClientGameState,
  myVote: string, // playerID
  winningPlayer: string //playerID
): ClueRow => {
  const wordLength = clue.word.length;
  const counts = _.countBy(
    _.uniqBy(clue.assignedStands, (s) => s.playerID),
    (s: m.Stand) => getPlayerType(gameState, s.playerID)
  );

  const playerName = gameState.players[playerID].Name;
  const out = {
    player_name: playerName,
    word_length: wordLength,
    players_used: counts[m.PlayerType.Player] || 0,
    npcs_used: counts[m.PlayerType.NPC] || 0,
    bonuses_used: counts[m.PlayerType.Bonus] || 0,
    wildcard_used: counts[m.PlayerType.Wildcard] > 0,
    votes: gameState.votes[playerID] || 0,
    isMyVote: myVote === playerID,
    isWinningPlayer: winningPlayer === playerID,
  };

  return out;
};

// TODO: this logic also lives or server. Unify / standardize.
const _getWinningPlayerID = (gameState: m.ClientGameState): string => {
  const { votes } = gameState;

  const sortedPlayers = _.sortBy(Object.keys(votes), (key) => votes[key]);

  const [first, second] = [sortedPlayers[0], sortedPlayers[1]];

  // if 0 votes, no one has won yet
  if (votes[first] === 0) {
    return "";
  }

  // if it's a tie, no one won
  if (votes[first] === votes[second]) {
    return "";
  }

  return first;
};

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  winningVote: {
    backgroundColor: lightGreen[300], // '#aed581'
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
  giveClue: {
    marginBottom: "1rem",
  },
});

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  })
)(TableCell);

// Send vote to server. PlayerID can be accessed from clue
export const vote = (
  socket: SocketIO.Socket,
  senderID: string,
  votedName: string
): void => {
  const v: EType[E.Vote] = {
    senderID,
    votedName,
  };
  socket.emit(E.Vote, v);
};

type ActiveCluesProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

export default function ActiveClues(props: ActiveCluesProps) {
  const classes = useStyles();
  const { socket, gameState } = props;

  const { clues, myVote } = props.gameState;
  const winningPlayer = _getWinningPlayerID(props.gameState);
  const rows = [];
  for (const player of Object.keys(clues)) {
    const row = clueToRow(
      player,
      clues[player],
      props.gameState,
      myVote,
      winningPlayer
    );

    rows.push(row);
  }

  return (
    <div>
      <h1>Clues</h1>
      {rows.length === 0 && <div>No clues yet. Give a clue!</div>}
      {rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Player</StyledTableCell>
                <StyledTableCell align="right">Word Length</StyledTableCell>
                <StyledTableCell align="right">Players used</StyledTableCell>
                <StyledTableCell align="right">NPCs used</StyledTableCell>
                <StyledTableCell align="right">Bonuses used</StyledTableCell>
                <StyledTableCell align="right">Wildcard used</StyledTableCell>
                <StyledTableCell align="right">Votes</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.player_name}
                  className={
                    row.isWinningPlayer ? classes.winningVote : undefined
                  }
                >
                  <StyledTableCell>{row.player_name}</StyledTableCell>
                  <StyledTableCell align="right">
                    {row.word_length}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.players_used}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.npcs_used}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.bonuses_used}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.wildcard_used ? "Y" : "N"}
                  </StyledTableCell>
                  <StyledTableCell align="right">{row.votes}</StyledTableCell>
                  <StyledTableCell align="right">
                    <Button
                      onClick={() => {
                        // TODO: Vote by playerID
                        vote(socket, gameState.playerID, row.player_name);
                      }}
                      variant="contained"
                      color="primary"
                      disabled={row.isMyVote}
                    >
                      Vote
                    </Button>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
