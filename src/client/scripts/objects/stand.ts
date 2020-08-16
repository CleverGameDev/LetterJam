export class Stand extends Phaser.GameObjects.GameObject {
  playerID: string;
  deck: string[];

  constructor(scene: Phaser.Scene, playerID: string, deck: string[]) {
    super(scene, "stand");
    this.playerID = playerID;
    this.deck = deck;
  }

  // Override this
  public next(): void {
    throw new Error("The next function needs to be overwritten");
  }
}

export class StandView extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, currentLetter: string) {
    super(scene, 0, 0, currentLetter, { color: "black", fontSize: "14px" });
    scene.add.existing(this);
  }

  public setLetter(newLetter: string): void {
    this.setText(newLetter);
  }
}

export class NPCStand extends Stand {
  standView: StandView;
  hasGreenToken: boolean;
  cardsLeft: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, playerID: string, deck: string[]) {
    super(scene, playerID, deck);
    this.standView = new StandView(scene, this.deck.shift());
    this.hasGreenToken = true;
    this.cardsLeft = new Phaser.GameObjects.Text(
      scene,
      0,
      0,
      this.deck.length.toString(),
      { color: "black", fontSize: "14px" }
    );

    scene.add.existing(this);
  }

  public next() {
    if (this.deck.length > 0) {
      this.standView.setLetter(this.deck.shift());
      this.cardsLeft.setText(this.deck.length.toString());
    } else {
      // The deck is empty! Grab from the discard pile!
      // TODO: grab from the discard pile
    }

    // The green token is now revealed!
    if (this.hasGreenToken && this.deck.length == 0) {
      // TODO: add a green token to the flower
      this.hasGreenToken = false;
    }
  }
}

export class PlayerStand extends Stand {
  currentCardIndex: integer;
  standView: StandView;
  currentCardIndexText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, playerID: string, deck: string[]) {
    super(scene, playerID, deck);
    this.currentCardIndex = 0;
    this.standView = new StandView(scene, this.deck[this.currentCardIndex]);
    this.currentCardIndexText = new Phaser.GameObjects.Text(
      scene,
      0,
      0,
      "Card Number: 1",
      { color: "black", fontSize: "14px" }
    );
  }

  public next(): void {
    this.currentCardIndex++;
    if (this.currentCardIndex < this.deck.length) {
      this.standView.setLetter(this.deck[this.currentCardIndex]);
      this.currentCardIndexText.setText(
        `Card Index: ${this.currentCardIndex.toString()}`
      );
    } else {
      // Time to get a bonus card!
      // TODO: draw from the deck for a bonus card
      this.currentCardIndexText.setText("Bonus Card");
    }
  }
}

export class SelfStand extends Stand {
  currentCardIndex: integer;
  currentCardIndexText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, playerID: string, deck: string[]) {
    super(scene, playerID, deck);
    this.currentCardIndex = 0;
    this.currentCardIndexText = new Phaser.GameObjects.Text(
      scene,
      0,
      0,
      "Card Number: 1",
      { color: "black", fontSize: "14px" }
    );
  }

  public next(): void {
    this.currentCardIndex++;
    if (this.currentCardIndex < this.deck.length) {
      this.currentCardIndexText.setText(
        `Card Index: ${this.currentCardIndex.toString()}`
      );
    } else {
      // Time to get a bonus card!
      // TODO: draw from the deck for a bonus card
      this.currentCardIndexText.setText("Bonus Card");
    }
  }
}
