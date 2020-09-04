export default class Flower extends Phaser.GameObjects.Text {
  playerNum: integer;
  redTokens: integer;
  greenTokens: integer;
  // greenTokensLocked are unlocked when all the red tokens are used up
  greenTokensLocked: integer;

  playersTakenTurns: integer[];

  constructor(scene: Phaser.Scene, playerNum: integer) {
    super(scene, 0, 100, "", { color: "black", fontSize: "28px" });
    scene.add.existing(this);
    this.setOrigin(0.5, 0);

    // TODO: find a better place to put this flower
    this.setPosition(scene.cameras.main.width / 2, 0);
    this.playerNum = playerNum;
  }

  public update(): void {
    // TODO: different colors would be nice
    this.setText(
      `Red tokens: ${this.redTokens}\nGreen tokens: ${this.greenTokens}\nLocked green tokens: ${this.greenTokensLocked}`
    );
  }

  // Perform the logic to take turns
  // Returns true if successful, false otherwise
  public takeToken(playerID: integer): boolean {
    // Perform logic to take turns

    // If this is the first time a player has offered a clue, take a red token
    if (!this.playersTakenTurns.includes(playerID)) {
      this.playersTakenTurns.push(playerID);
      this.redTokens--;
    } else if (this.greenTokens > 0) {
      this.greenTokens--;
    } else {
      // With no more tokens available, the game is over?
      return false;
    }
    this.unlockGreenTokens();
    return true;
  }

  // Unlocks the green tokens if all the red tokens have been taken
  private unlockGreenTokens() {
    if (this.redTokens == 0) {
      this.greenTokens += this.greenTokensLocked;
      this.greenTokensLocked = 0;
    }
  }
}
