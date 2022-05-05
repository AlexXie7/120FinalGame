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

        this.isWalking = false;

        // Map Waypoints
        this.school = {
            x: game.scale.width  * 3 / 4,
            y: game.scale.height * 1 / 4,
            minigames: []
        };

        this.home = {
            x: gameCenterX,
            y: gameCenterY,
            minigames: []
        };

        this.restaurant = {
            x: gameCenterX / 2,
            y: gameCenterY * 1.5,
            minigames: []
        };

        //maybe we should rename town to plaza?
        this.town = {
            x: gameCenterX / 2,
            y: gameCenterY / 2,
            minigames: []
        };

        this.walkToSchool();

    }

    update() {

    }

    walkToSchool() {
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.school.x, this.school.y);

        this.isWalking = true;

        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
            //repeat: -1,
            //yoyo: true,
            //rotateToPath: false
        });

        setTimeout(() => {
            this.isWalking = false;
        }, 3000);


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
    minigameFinished(scene, result) {
        clearTimeout(this.minigameTimeout);
        console.log('finished - closing minigame - minigame result:', result);
        this.scene.stop(scene);
    }

    update() {

    }

    walkToHome() {
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.home.x, this.home.y);
        this.isWalking = true;
        setTimeout(() => {
            this.isWalking = false;
        }, 3000);

        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
        });
    }

    walkToRestaurant() {
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.restaurant.x, this.restaurant.y);

        this.isWalking = true;
        setTimeout(() => {
            this.isWalking = false;
        }, 3000);

        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
        });
    }

    walkToTown() {
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.town.x, this.town.y);

        this.isWalking = true;
        setTimeout(() => {
            this.isWalking = false;
        }, 3000);

        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
        });
    }
    
}