import { Checkbox } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
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
};

const clueToRow = (
  playerID: string,
  clue: m.ClueV2,
  gameState: m.ClientGameState
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
    // TODO: Vote button
  };

  return out;
};

const _getWinningPlayer = (gameState: m.ClientGameState): string | null => {
  const { votes, players } = gameState;

  const sortedPlayers = _.sortBy(Object.keys(votes), (key) => votes[key]);

  const [first, second] = [sortedPlayers[0], sortedPlayers[1]];

  // if 0 votes, no one has won yet
  if (votes[first] === 0) {
    return null;
  }

  // if it's a tie, no one won
  if (votes[first] === votes[second]) {
    return null;
  }

  return players[first].Name;
};

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

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

  const { clues, myVote, players } = props.gameState;
  const winningPlayer = _getWinningPlayer(props.gameState);
  const rows = [];
  for (const player of Object.keys(clues)) {
    const row = clueToRow(player, clues[player], props.gameState);
    // if (clueArray[0].text === winningPlayer) {
    //   clueArray[6].text += "*";
    // }
    // if (players[myVote] && clueArray[0].text === players[myVote].Name) {
    //   clueArray[7].text += " ✓";
    // }
    rows.push(row);
  }

  return (
    <div>
      <h1>Active Clues</h1>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Word Length</TableCell>
              <TableCell align="right">Players used</TableCell>
              <TableCell align="right">NPCs used</TableCell>
              <TableCell align="right">Bonuses used</TableCell>
              <TableCell align="right">Wildcard used</TableCell>
              <TableCell align="right">Votes</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.player_name}>
                <TableCell>{row.player_name}</TableCell>
                <TableCell align="right">{row.word_length}</TableCell>
                <TableCell align="right">{row.players_used}</TableCell>
                <TableCell align="right">{row.npcs_used}</TableCell>
                <TableCell align="right">{row.bonuses_used}</TableCell>
                <TableCell align="right">
                  {row.wildcard_used ? "Y" : "N"}
                </TableCell>
                <TableCell align="right">{row.votes}</TableCell>
                <TableCell align="right">
                  <Checkbox
                    checked={
                      gameState.players[gameState.myVote].Name ===
                      row.player_name
                    }
                    onClick={() => {
                      vote(socket, gameState.playerID, row.player_name);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
