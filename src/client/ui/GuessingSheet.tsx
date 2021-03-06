import { Typography } from "@material-ui/core";
import {
  blue,
  deepPurple,
  green,
  indigo,
  lightGreen,
  orange,
  red,
  yellow,
} from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { Socket } from "socket.io";
import { E } from "../../shared/events";
import * as m from "../../shared/models";
import GuessingSheetNote from "./GuessingSheetNote";

const intensity = 300;
const useStyles = makeStyles({
  table: {
    minWidth: 650,
    width: 800,
  },
  redBg: {
    backgroundColor: red[intensity],
  },
  orangeBg: {
    backgroundColor: orange[intensity],
  },
  yellowBg: {
    backgroundColor: yellow[intensity],
  },
  lightGreenBg: {
    backgroundColor: lightGreen[intensity], // '#aed581'
  },
  greenBg: {
    backgroundColor: green[intensity],
  },
  blueBg: {
    backgroundColor: blue[intensity], //'#64b5f6';
  },
  indigoBg: {
    backgroundColor: indigo[intensity],
  },
  violetBg: {
    backgroundColor: deepPurple[intensity], //'#9575cd'
  },
  grayBg: {
    backgroundColor: "#e0e0e0",
  },
});

type GuessingSheetProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

export default function GuessingSheet(props: GuessingSheetProps) {
  const classes = useStyles();
  const { socket, gameState } = props;
  const colToColor = [
    classes.redBg,
    classes.orangeBg,
    classes.yellowBg,
    classes.lightGreenBg,
    classes.greenBg,
    classes.blueBg,
    classes.indigoBg,
    classes.violetBg,
    classes.grayBg,
  ];

  const rows = gameState.guessingSheet.hints.map((item: string) => {
    const word: string[] = new Array(9).fill("");
    Array.from(item.substr(0, 9)).forEach((val, idx) => {
      word[idx] = val;
    });

    return word;
  });

  return (
    <div>
      <h1>Guessing Sheet</h1>
      <TableContainer component={Paper} className={classes.table}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <TableCell width={1} className={colToColor[n - 1]}>
                  <Typography variant="h6">{n}</Typography>
                </TableCell>
              ))}
              <TableCell width={1} className={colToColor[8]}>
                <Typography variant="h6">9...</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">???</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((clue, clueIdx) => (
              <TableRow key={clueIdx}>
                {clue.map((letter, n) => (
                  <TableCell className={colToColor[n]}>
                    {letter.toUpperCase()}
                  </TableCell>
                ))}
                <TableCell>
                  <GuessingSheetNote
                    initialText={gameState.guessingSheet.notes[clueIdx]}
                    onClose={(note) => {
                      // TODO: add back <EType[E.UpdateClueNote]> if possible
                      socket.emit(E.UpdateClueNote, {
                        clueIdx,
                        note,
                      });
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
