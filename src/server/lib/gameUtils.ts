import { PlayerType, ServerGameState } from "../../shared/models";

export const getVisibleLetters = (
  id: string,
  gameState: ServerGameState,
  playerNames
) => {
  const visibleLetters = [];
  for (const key of Object.keys(gameState.letters)) {
    if (key !== id) {
      const playerName = playerNames[key];
      let stand;
      if (playerName) {
        stand = {
          player: playerName,
          playerType: PlayerType.Player,
          letter: gameState.letters[key][gameState.visibleIndex[key]],
        };
      } else {
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
