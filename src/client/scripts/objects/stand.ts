export class Stand extends Phaser.GameObjects.GameObject {
  playerID: string;
  deckLength: integer;

  constructor(scene: Phaser.Scene, playerID: string, deckLength: integer) {
    super(scene, "stand");
    this.playerID = playerID;
    this.deckLength = deckLength;
  }

  // Override this
  public next(nextCard: string): void {
    throw new Error("The next function needs to be overwritten");
  }
}

export class StandView extends Phaser.GameObjects.Text {
  constructor(
    scene: Phaser.Scene,
    currentLetter: string,
    x: integer,
    y: integer
  ) {
    super(scene, x, y, currentLetter, { color: "black", fontSize: "20px" });
    scene.add.existing(this);
  }

  public setLetter(newLetter: string): void {
    this.setText(`Letter is: ${newLetter}`);
  }
}

export class NPCStand extends Stand {
  standView: StandView;
  hasGreenToken: boolean;
  cardsLeft: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    playerID: string,
    deckLength: integer,
    firstLetter: string,
    x: integer,
    y: integer
  ) {
    super(scene, playerID, deckLength);
    this.standView = new StandView(scene, firstLetter, x, y);
    this.hasGreenToken = true;
    scene.add.text(x, y - 15, `NPC ${playerID}`, {
      color: "black",
      fontSize: "20px",
    });
    this.cardsLeft = new Phaser.GameObjects.Text(
      scene,
      x,
      y + 15,
      `Cards Left: ${this.deckLength.toString()}`,
      { color: "black", fontSize: "20px" }
    );
    scene.add.existing(this.cardsLeft);
  }

  public next(nextCard: string): void {
    if (this.deckLength > 0) {
      this.standView.setLetter(nextCard);
      this.deckLength--;
      this.cardsLeft.setText(`Cards Left: ${this.deckLength.toString()}`);
    } else {
      // The deck is empty! Grab from the discard pile!
      // TODO: grab from the discard pile
    }

    // The green token is now revealed!
    if (this.hasGreenToken && this.deckLength == 0) {
      // TODO: add a green token to the flower
      this.hasGreenToken = false;
    }
  }
}

export class PlayerStand extends Stand {
  currentCardIndex: integer;
  standView: StandView;
  currentCardIndexText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    playerID: string,
    deckLength: integer,
    firstLetter: string,
    x: integer,
    y: integer
  ) {
    super(scene, playerID, deckLength);
    this.currentCardIndex = 0;
    this.standView = new StandView(scene, firstLetter, x, y);
    scene.add.text(x, y - 15, `Player ${playerID}`, {
      color: "black",
      fontSize: "20px",
    });
    this.currentCardIndexText = new Phaser.GameObjects.Text(
      scene,
      x,
      y + 15,
      "Card Number: 1",
      { color: "black", fontSize: "20px" }
    );
    scene.add.existing(this.currentCardIndexText);
  }

  public next(nextCard: string): void {
    this.currentCardIndex++;
    if (this.currentCardIndex < this.deckLength) {
      this.standView.setLetter(nextCard);
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

  constructor(scene: Phaser.Scene, playerID: string, deckLength: integer) {
    super(scene, playerID, deckLength);
    this.currentCardIndex = 0;
    this.currentCardIndexText = new Phaser.GameObjects.Text(
      scene,
      0,
      scene.cameras.main.height * 0.85,
      "Your Card Number: 1",
      { color: "black", fontSize: "20px" }
    );
    scene.add.existing(this.currentCardIndexText);
  }

  public next(): void {
    this.currentCardIndex++;
    if (this.currentCardIndex < this.deckLength) {
      this.currentCardIndexText.setText(
        `Your Card Index: ${this.currentCardIndex.toString()}`
      );
    } else {
      // Time to get a bonus card!
      // TODO: draw from the deck for a bonus card
      this.currentCardIndexText.setText("Bonus Card");
    }
  }
}
