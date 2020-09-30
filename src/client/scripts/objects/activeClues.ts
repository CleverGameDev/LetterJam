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

  _getWinningPlayer(): string {
    const { votes, players } = this.scene.gameState;

    const sortedPlayers = _.sortBy(Object.keys(votes), (key) => votes[key]);

    const [first, second] = [sortedPlayers[0], sortedPlayers[1]];

    // if 0 votes, no one has won yet
    if (votes[first] == 0) {
      return null;
    }

    // if it's a tie, no one won
    if (votes[first] == votes[second]) {
      return null;
    }

    return players[first].Name;
  }

  update(): void {
    // if (!_.isEqual(this.prevClues, this.scene.gameState.clues)) {
    if (this.scene.gameState.clues) {
      const { clues, myVote, players } = this.scene.gameState;
      this.prevClues = clues;
      const winningPlayer = this._getWinningPlayer();
      const contentItems = [];
      for (const player of Object.keys(clues)) {
        const clueArray = this.clueToArray(player, clues[player]);
        if (clueArray[0].text === winningPlayer) {
          clueArray[6].text += "*";
        }
        if (players[myVote] && clueArray[0].text === players[myVote].Name) {
          clueArray[7].text += " ✓";
        }
        contentItems.push(...clueArray);
      }
      this.table.setContentItems(contentItems);
    }
  }

  isOpen = (): boolean => {
    return this.table.isActive();
  };

  open = (): void => {
    this.table.open();
  };

  close = (): void => {
    this.table.close();
  };
}
