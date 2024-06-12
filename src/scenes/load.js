class load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        // load assets
    }

    create() {
        // setup and start the game
        this.scene.start("mainScene");
    }
}
