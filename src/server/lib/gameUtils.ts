import { PlayerType, ServerGameState, Stand } from "../../shared/models";

export const getVisibleLetters = (
  currentPlayerID: string,
  gameState: ServerGameState
): Stand[] => {
  const visibleLetters = [];
  for (const key of Object.keys(gameState.letters)) {
    // If the letters belong to other players
    if (key !== currentPlayerID) {
      let stand: Stand;
      // Is it a human player?
      if (gameState.players.has(key)) {
        stand = {
          player: gameState.players.get(key).Name,
          playerType: PlayerType.Player,
          letter: gameState.letters[key][gameState.visibleIndex[key]],
        };
      } else {
        // It's an NPC deck
        stand = {
          player: key,
          playerType: PlayerType.NPC,
          letter: gameState.letters[key][gameState.visibleIndex[key]],
        };
      }
      visibleLetters.push(stand);
    }
  }
  return visibleLetters;
};
