import * as _ from "lodash";
import {
  COLOR_HOVER,
  COLOR_SECONDARY,
  WildcardPlayerID,
} from "../../../shared/constants";
import * as models from "../../../shared/models";
import { vote } from "../lib/discuss";
import GameScene from "../scenes/gameScene";
import { Table } from "./table";

export default class ActiveClues extends Phaser.GameObjects.Container {
  container: Phaser.GameObjects.Container;
  table: Table;
  scene: GameScene;
  prevClues: { [playerID: string]: models.ClueV2 };

  constructor(scene: GameScene) {
    super(scene, 0, 0);

    this.scene = scene;
    const numColumns = 8;
    const cellOver = function (cellContainer, cellIndex, pointer) {
      if (cellIndex > numColumns && cellIndex % numColumns === numColumns - 1) {
        cellContainer.getElement("background").setFillStyle(2, COLOR_SECONDARY);
      }
    };
    const cellOut = function (cellContainer, cellIndex, pointer) {
      if (cellIndex > numColumns && cellIndex % numColumns === numColumns - 1) {
        cellContainer.getElement("background").setFillStyle(2, COLOR_HOVER);
      }
    };
    const cellClick = function (cellContainer, cellIndex, pointer) {
      if (cellIndex > numColumns && cellIndex % numColumns === numColumns - 1) {
        vote(
          scene.socket,
          scene.gameState.playerID,
          this.gridTable.items[cellIndex - numColumns + 1].text
        );
        cellContainer.getElement("background").setFillStyle(2, COLOR_HOVER);
      }
    };
    this.table = new Table(
      scene,
      {
        title: "Active Clues",
        numColumns,
        headerRow: [
          { text: "Player" },
          { text: "Word Length" },
          { text: "Players used" },
          { text: "NPCs used" },
          { text: "Bonuses used" },
          { text: "Wildcard used" },
          { text: "Votes" },
          { text: "" },
        ],
      },
      {
        cellOver,
        cellOut,
        cellClick,
      }
    );
    this.table.create();

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

  isActive = (): boolean => {
    return this.table.isActive();
  };

  open = (): void => {
    this.table.open();
  };

  close = (): void => {
    this.table.close();
  };
}
