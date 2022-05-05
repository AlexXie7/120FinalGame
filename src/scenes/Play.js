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
            y: game.scale.height * 1 / 4
        }

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
            repeat: -1,
            yoyo: true,
            rotateToPath: false
        });


        // temp minigame testing
        console.log('launching minigame');
        let minigameName = 'Name';
        const sceneName = 'minigame' + minigameName;
        this.scene.launch(sceneName);
        this.scene.bringToTop(sceneName);
        const currentMinigame = this.scene.get(sceneName);
        this.minigameTimeout = setTimeout(() => {
            const result = currentMinigame.timeout();
            console.log('time up - closing minigame - minigame result:', result);
            this.scene.stop(currentMinigame);
        }, 5000);
    }

    // called by current minigame when it is finished before the time limit
    minigameFinished(result) {
        clearTimeout(this.minigameTimeout);
        console.log('finished - closing minigame - minigame result:', result);
    }

    update() {

    }
    
}