import * as _ from "lodash";
import { ServerGameState } from "./gameState";

test("sets up a new game", () => {
  // Setup game
  const gs = new ServerGameState();
  gs.tryAddPlayer("player1");
  gs.tryAddPlayer("player2");
  gs.tryAddPlayer("player3");
  gs.setupNewGame();

  // Verify minimal game state
  expect(Array.from(Object.keys(gs.letters)).length).toBe(6);
  expect(gs.numNPCs).toBe(3);
  expect(gs.flower.green).toBe(2);
});

test("vote() and getPlayerWhoWonVote()", () => {
  // Setup game
  const gs = new ServerGameState();
  gs.tryAddPlayer("player1");
  gs.tryAddPlayer("player2");
  gs.tryAddPlayer("player3");
  gs.setupNewGame();

  // Vote!
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

test("takeClueToken()", () => {
  // Setup 2-player game
  const gs = new ServerGameState();
  gs.tryAddPlayer("player1");
  gs.tryAddPlayer("player2");
  gs.setupNewGame();

  expect(gs.flower).toStrictEqual({
    red: 6,
    green: 2,
    greenLocked: 3,
  });

  // Player1 first takes 3 red tokens
  gs.takeClueToken("player1");
  expect(gs.flower.red).toBe(5);
  gs.takeClueToken("player1");
  expect(gs.flower.red).toBe(4);
  gs.takeClueToken("player1");
  expect(gs.flower.red).toBe(3);

  // Player1 then takes 2 green tokens
  gs.takeClueToken("player1");
  expect(gs.flower.green).toBe(1);
  gs.takeClueToken("player1");
  expect(gs.flower.green).toBe(0);

  // At this point, Player1 not allowed to take more tokens
  const result = gs.takeClueToken("player1");
  expect(gs.flower.green).toBe(0);
  expect(result).toBe(false);

  gs.takeClueToken("player2");
  expect(gs.flower.red).toBe(2);
  gs.takeClueToken("player2");
  expect(gs.flower.red).toBe(1);

  // Taking the last red token should unlock more green tokens
  gs.takeClueToken("player2");
  expect(gs.flower.red).toBe(0);
  expect(gs.flower.greenLocked).toBe(0);
  expect(gs.flower.green).toBe(3);

  gs.takeClueToken("player1");
  expect(gs.flower.green).toBe(2);
  gs.takeClueToken("player2");
  expect(gs.flower.green).toBe(1);
  gs.takeClueToken("player1");
  expect(gs.flower.green).toBe(0);

  // There are no tokens left!
  const result2 = gs.takeClueToken("player1");
  expect(result2).toBe(false); // not allowed!
  expect(gs.flower).toStrictEqual({
    green: 0,
    greenLocked: 0,
    red: 0,
  });
});
