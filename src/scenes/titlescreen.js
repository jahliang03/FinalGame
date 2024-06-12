class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // Load the title text 
        this.load.image('title', 'assets/title.png'); // Adjust the path to your image file
        // Load the start button image
        this.load.image('startButton', 'assets/clover.png'); // Adjust the path to your image file
        // Load the text 
        this.load.image('titleText', 'assets/text.png');
        this.load.image('instructions', 'assets/instructions.png');
        // Load the credits
        this.load.image('credits', 'assets/credit.png');
    }

    create() {
        // Add a title text button in the center
        this.title = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY - 80, 'title');
        this.title.setScale(0.5);
        // Add a start button in the center
        this.startButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 40, 'startButton').setInteractive();
        this.startButton.setScale(0.25);

        this.titleText = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 150, 'titleText');
        this.titleText.setScale(0.5);

        this.instructions = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 180, 'instructions');
        this.instructions.setScale(0.5);

        this.credits = this.add.image(this.cameras.main.centerX - 240, this.cameras.main.centerY + 320, 'credits');
        this.credits.setScale(0.4);
        // Start the game when the start button is clicked
        this.startButton.on('pointerdown', () => {
            this.scene.start('loadScene');
        });
    }
}
