import * as _ from "lodash";
import { ServerGameState } from "./gameState";

test("sets up a new game", () => {
  const gs = new ServerGameState();
  gs.tryAddPlayer("player1");
  gs.tryAddPlayer("player2");
  gs.tryAddPlayer("player3");

  gs.setupNewGame();

  expect(Array.from(Object.keys(gs.letters)).length).toBe(6);
  expect(gs.numNPCs).toBe(3);
  expect(gs.flower.green).toBe(2);
});

test("vote() and getPlayerWhoWonVote()", () => {
  const gs = new ServerGameState();
  gs.tryAddPlayer("player1");
  gs.tryAddPlayer("player2");
  gs.tryAddPlayer("player3");

  gs.setupNewGame();

  gs.vote("player1", "player2");
  gs.vote("player2", "player2");
  gs.vote("player3", "player2");

  const votes = gs.getVotes();
  expect(_.keys(votes).length).toBe(1);
  expect(votes["player2"]).toBe(3);

  const winner = gs.getPlayerWhoWonVote();
  expect(winner).toBe("player2");

  // Regression test buggy case where 1 vote > 2 votes
  gs.vote("player2", "player1");
  const votes2 = gs.getVotes();
  expect(_.keys(votes2).length).toBe(2);
  expect(votes2["player1"]).toBe(1);
  expect(votes2["player2"]).toBe(2);

  const winner2 = gs.getPlayerWhoWonVote();
  expect(winner2).toBe("player2");
});
