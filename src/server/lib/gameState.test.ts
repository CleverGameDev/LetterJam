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
