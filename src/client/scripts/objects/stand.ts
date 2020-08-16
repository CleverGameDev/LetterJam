export class Stand extends Phaser.GameObjects.GameObject {
  playerID: string;
  deck: string[];
  currentCardIndex: integer;

  constructor(scene: Phaser.Scene, playerID: string, deck: string[]) {
    super(scene, "stand");
    this.playerID = playerID;
    this.deck = deck;
    this.currentCardIndex = 0;
  }

  // Override this
  public update(playerID: string) {
    throw new Error("The update function needs to be overwritten");
  }

  // Override this
  public next() {
    throw new Error("The next function needs to be overwritten");
  }
}
