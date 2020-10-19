import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import * as m from "./shared/models";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

type GuessingSheetProps = {
  gameState: m.ClientGameState;
};

export default function GuessingSheet(props: GuessingSheetProps) {
  const classes = useStyles();
  const { gameState } = props;

  const rows = gameState.guessingSheet.hints.map(
    (item: string, mIdx: number) => {
      const word: string[] = new Array(10).fill("");
      Array.from(item.substr(0, 10)).forEach((val, idx) => {
        word[idx] = val;
      });

      // put player's notes for this clue in the last position
      word[word.length - 1] = gameState.guessingSheet.notes[mIdx];

      return word;
    }
  );

  return (
    <div>
      <h1>Guessing Sheet</h1>
      <TableContainer component={Paper}>
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <TableCell>{n}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((clue, idx) => (
              <TableRow key={idx}>
                {clue.map((letter) => (
                  <TableCell>{letter}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
