class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        this.load.image('map', './assets/TempMap.png');
        this.load.image('player', './assets/TempPlayer.png');
    }

    create() {
        this.map = this.add.sprite(gameCenterX, gameCenterY,'map').setDisplaySize(game.scale.width, game.scale.height);
        this.player = this.add.follower(null, gameCenterX, gameCenterY, 'player');

        // Map Waypoints
        let school = {
            x: game.scale.width  * 3 / 4,
            y: game.scale.height * 1 / 4,
            minigames: []
        };

        let home = {
            x: gameCenterX,
            y: gameCenterY,
            minigames: []
        };

        let restaurant = {
            x: gameCenterX / 2,
            y: gameCenterY * 1.5,
            minigames: []
        };

        //maybe we should rename town to plaza?
        let town = {
            x: gameCenterX / 2,
            y: gameCenterY / 2,
            minigames: []
        };


        this.schoolPath = this.add.path(this.player.x, this.player.y);
        this.schoolPath.lineTo(school.x, school.y);
        this.player.path = this.schoolPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
            //repeat: -1,
            //yoyo: true,
            rotateToPath: false
        });
    }

    update() {

    }
    
}