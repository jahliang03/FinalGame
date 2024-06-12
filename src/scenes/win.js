class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    create() {
        let winText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Congratulations! You Won!\nPress R to Restart', {
            fontSize: '32px',
            fill: '#00FF00'
        }).setOrigin(0.5);

        let rKey = this.input.keyboard.addKey('R');
        rKey.on('down', () => {
            this.scene.start('platformerScene');  // Start the game scene again
        });
    }
}
