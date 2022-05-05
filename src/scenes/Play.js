class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        
        this.load.image('map', './assets/TempMap.png');
        this.load.image('player', './assets/TempPlayer.png');
    }

    create() {

    }

    update() {

    }
    
}