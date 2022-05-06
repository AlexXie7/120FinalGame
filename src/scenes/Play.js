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

        // Map Waypoints
        this.school = {
            x: game.scale.width  * 3 / 4,
            y: game.scale.height * 1 / 4,
            minigames: [],
            sprite: this.add.rectangle(game.scale.width  * 3 / 4, game.scale.height * 1 / 4, 150, 150, 0xffffff)
        };

        this.home = {
            x: gameCenterX,
            y: gameCenterY,
            minigames: [],
            sprite: this.add.rectangle(gameCenterX, gameCenterY, 150, 150, 0xffffff)
        };

        this.restaurant = {
            x: gameCenterX / 2,
            y: gameCenterY * 1.5,
            minigames: [],
            sprite: this.add.rectangle(gameCenterX/2, gameCenterY*1.5, 150, 150, 0xffffff)
        };

        //maybe we should rename town to plaza?
        this.town = {
            x: gameCenterX / 2,
            y: gameCenterY / 2,
            minigames: [],
            sprite: this.add.rectangle(gameCenterX/2, gameCenterY/2, 150, 150, 0xffffff)
        };

        // interactivity for the town sprites
        this.school.sprite.setInteractive();
        this.home.sprite.setInteractive();
        this.restaurant.sprite.setInteractive();
        this.town.sprite.setInteractive();

        // On hover over sprite
        //we can implement effects in here later
        this.school.sprite.on('pointerover', () => {
            console.log('Over the School');
        });
        this.home.sprite.on('pointerover', () => {
            console.log('Over the home');
        });
        this.restaurant.sprite.on('pointerover', () => {
            console.log('Over the restaurant');
        });
        this.town.sprite.on('pointerover', () => {
            console.log('Over the town');
        });

        // On hover off sprite
        //we can make sure to shut off the effects here later
        this.school.sprite.on('pointerout', () => {
            console.log('Off the School');
        });
        this.home.sprite.on('pointerout', () => {
            console.log('Off the home');
        });
        this.restaurant.sprite.on('pointerout', () => {
            console.log('Off the restaurant');
        });
        this.town.sprite.on('pointerout', () => {
            console.log('Off the town');
        });

        // On click release
        // This is how we enter the minigames?
        this.school.sprite.on('pointerup', () => {
            console.log('Clicked the School');
        });
        this.home.sprite.on('pointerup', () => {
            console.log('Clicked the home');
        });
        this.restaurant.sprite.on('pointerup', () => {
            console.log('Clicked the restaurant');
        });
        this.town.sprite.on('pointerup', () => {
            console.log('Clicked the town');
        });


        this.player = this.add.follower(null, gameCenterX, gameCenterY, 'player');

        this.isWalking = false;
        this.location = "home";


        this.walkToSchool();
        console.log(this.school.sprite.x);

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

        this.location = "school";

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

    walkToHome() {
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.home.x, this.home.y);
        this.isWalking = true;


        this.player.path = walkPath;

        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
        });

        this.location = "home";

        setTimeout(() => {
            this.isWalking = false;
        }, 3000);
    }

    walkToRestaurant() {
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.restaurant.x, this.restaurant.y);

        this.isWalking = true;

        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
        });
        
        this.location = "restaurant";

        setTimeout(() => {
            this.isWalking = false;
        }, 3000);
    }

    walkToTown() {
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.town.x, this.town.y);

        this.isWalking = true;


        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3000,
            ease: 'Power0',
            hold: 0,
        });

        this.location = "town";

        setTimeout(() => {
            this.isWalking = false;
        }, 3000);
    }

    launchMinigame(){
        if(this.location == "town"){

        }
        
        if(this.location == "restaurant"){
            
        }
        
        if(this.location == "school"){
            
        }
        
        if(this.location == "home"){
            
        }
    }
    
}