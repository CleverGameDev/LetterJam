import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import React from "react";
import { Socket } from "socket.io";
import * as m from "../shared/models";
import NavBar from "./NavBar";

type EndSceneProps = {
  socket: Socket;
  gameState: m.ClientGameState;
};

export default function EndScene(props: EndSceneProps) {
  const { gameState, socket } = props;

  const playerIDs = Object.keys(gameState?.players || {}).sort();
  return (
    <div>
      <NavBar gameState={gameState} socket={socket} />
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">Player</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Guess</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Actual</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {playerIDs.map((p) => {
              return (
                <TableRow>
                  <TableCell>{gameState.players[p].Name}</TableCell>
                  <TableCell>
                    {gameState.endGame.guessVsActual[p].guess}
                  </TableCell>
                  <TableCell>
                    {gameState.endGame.guessVsActual[p].actual}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
