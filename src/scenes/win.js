class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }
    preload(){
        this.load.image('winMessage', 'assets/winMessage.png');
        this.load.image('restartMessage', 'assets/rKey.png');
    }
    create() {
        this.message = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY +20, 'winMessage');
        this.message.setScale(0.7);


        this.restart = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 70, 'restartMessage');
        this.restart.setScale(0.5);
        let rKey = this.input.keyboard.addKey('R');
        rKey.on('down', () => {
            this.scene.start('platformerScene');  // Start the game scene again
        });
    }
}
