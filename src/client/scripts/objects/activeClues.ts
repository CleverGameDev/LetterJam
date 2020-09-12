import * as _ from "lodash";
import * as models from "../../../shared/models";
import GameScene from "../scenes/gameScene";
import { WildcardPlayerID } from "../../../shared/constants";

const headers = [
  "Player       ",
  "Word Length  ",
  "Players used ",
  "NPCs used    ",
  "Bonuses used ",
  "Wildcard used",
  "Votes",
];

export default class ActiveClues extends Phaser.GameObjects.Container {
  container: Phaser.GameObjects.Container;
  content;
  table;
  scene: GameScene;
  prevClues;

  constructor(scene: GameScene, table: any) {
    super(scene, 0, 0);

    this.scene = scene;
    this.table = table;

    scene.add.existing(this);
  }

  getPlayerType = (gameState: models.ClientGameState, playerID: string) => {
    if (gameState.players[playerID]) {
      return models.PlayerType.Player;
    } else if (playerID == WildcardPlayerID) {
      return models.PlayerType.Wildcard;
    } else {
      return models.PlayerType.NPC;
    }
  };

  clueToArray = (playerID: string, clue: models.ClueV2): { text: string }[] => {
    const wordLength = clue.word.length;
    const counts = _.countBy(
      _.uniqBy(clue.assignedStands, (s) => s.playerID),
      (s: models.Stand) => this.getPlayerType(this.scene.gameState, s.playerID)
    );

    const playerName = this.scene.gameState.players[playerID].Name;
    const out = [
      { text: playerName },
      { text: `${wordLength}` },
      { text: `${counts[models.PlayerType.Player] || 0}` },
      { text: `${counts[models.PlayerType.NPC] || 0}` },
      { text: `${counts[models.PlayerType.Bonus] || 0}` },
      { text: `${counts[models.PlayerType.Wildcard] ? "Y" : "N"}` },
      { text: `${this.scene.gameState.votes[playerID] || 0}` },
      { text: "Vote" },
    ];

    return out;
  };

  update(): void {
    // if (!_.isEqual(this.prevClues, this.scene.gameState.clues)) {
    if (this.scene.gameState.clues) {
      this.prevClues = this.scene.gameState.clues;
      const contentItems = [];
      for (const player of Object.keys(this.scene.gameState.clues)) {
        contentItems.push(
          ...this.clueToArray(player, this.scene.gameState.clues[player])
        );
      }
      this.table.setContentItems(contentItems);
    }
  }
}
