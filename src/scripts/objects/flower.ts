export default class Flower extends Phaser.GameObjects.Text {
    playerNum: integer
    redTokens: integer
    greenTokens: integer
    // greenTokensLocked are unlocked when all the red tokens are used up
    greenTokensLocked: integer

    playersTakenTurns: integer[]

    constructor(scene: Phaser.Scene, playerNum: integer) {
        super(scene, 0, 100, '', { color: 'black', fontSize: '28px' })
        scene.add.existing(this)
        this.setOrigin(0.5, 0)

        // TODO: find a better place to put this flower
        this.setPosition(scene.cameras.main.width / 2, 0);
        this.playerNum = playerNum;

        switch (this.playerNum) {
            case 2:
            case 3: 
                this.redTokens = 6;
                this.greenTokens = 2;
                this.greenTokensLocked = 3;
                break;
            case 4:
                this.redTokens = 4
                this.greenTokens = 6
                this.greenTokensLocked = 1
                break;
            case 5: 
                this.redTokens = 5;
                this.greenTokens = 5;
                this.greenTokensLocked = 1;
                break;
            case 6:
                this.redTokens = 6;
                this.greenTokens = 4;
                this.greenTokensLocked = 1;
                break;
            default: 
                // TODO: throw some kind of error for invalid player number
        }
    }

    public update() {
        // TODO: different colors would be nice
        this.setText(
            `Red tokens: ${this.redTokens}\nGreen tokens: ${this.greenTokens}\nLocked green tokens: ${this.greenTokensLocked}`
        )
    }

    // Perform the logic to take turns
    // Returns true if successful, false otherwise
    public takeToken(playerID: integer) {
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
