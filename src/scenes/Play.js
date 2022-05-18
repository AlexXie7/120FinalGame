class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        this.load.image('map', './assets/Map.png');
        this.load.image('school', './assets/School.png');
        this.load.image('town', './assets/Town.png');
        this.load.image('plaza', './assets/Plaza.png');
        this.load.image('home', './assets/Home.png');
        this.load.image('player', './assets/TempPlayer.png');
        this.load.audio('bgm', './assets/bgm.wav');

        this.load.image('temp', './assets/Plaza-modified.png')
    }

    create() {
        this.map = this.add.sprite(gameCenterX, gameCenterY,'map').setDisplaySize(game.scale.width, game.scale.height);
        
        // Map Zones
        this.zones = {
            'school' : {
                x: gameCenterX * 1.63,
                y: gameCenterY * 1.18,
                minigames: minigameNames['school'],//['SchoolGum'],
                sprite: this.add.sprite(gameCenterX * 1.63, gameCenterY*1.18, 'school').setScale(.9)
                } ,
            'home' : {
                x: gameCenterX * 1.5,
                y: gameCenterY * 1.5,
                minigames: minigameNames['home'],
                sprite: this.add.sprite(gameCenterX * .5, gameCenterY * 1.33, 'home').setScale(.85)
                } ,
            'plaza' : {
                x: gameCenterX / 2,
                y: gameCenterY * 1.5,
                minigames: minigameNames['plaza'],// ['PickFood'],
                sprite: this.add.sprite(gameCenterX * .73, gameCenterY * .5, 'plaza').setScale(.85)
                } ,
            'town' : {
                x: gameCenterX / 2,
                y: gameCenterY / 2,
                minigames: minigameNames['town'],
                sprite: this.add.sprite(gameCenterX * 1.57, gameCenterY * .64, 'town').setScale(.8)
                }
        }

        for(const zone in this.zones){
            console.log(zone);
            // interactivity for the town sprites
            this.zones[zone].sprite.setInteractive();

            // On hover over sprite
            this.zones[zone].sprite.on('pointerover', () => {
                console.log('Over the ' + zone);
            });

            // On hover off sprite
            this.zones[zone].sprite.on('pointerout', () => {
                console.log('Off the ' + zone);
            });
            // On click release
            // This is how we enter the minigames? 
            this.zones[zone].sprite.on('pointerup', () => {
                console.log('Clicked the ' + zone);

                if(this.location == zone){

                    //disable interactivity
                    for(const dZone in this.zones){
                        this.zones[dZone].sprite.disableInteractive();
                    }

                    this.launchMinigame();
                }

                if(!this.isWalking && this.location != zone){
                    this.walkTo(zone);
                }
            });
        }

        this.player = this.add.follower(null, gameCenterX, gameCenterY, 'player');

        this.isWalking = false;
        this.location = "home";

        this.walkTo('school');
        //this.walkToSchool();
        //console.log(this.school.sprite.x);

        // launch ui scene and move it to top
        this.scene.launch('uiScene');
        this.scene.bringToTop('uiScene');

        this.minigameTimer = new Timer();

        this.uiScene = this.scene.get('uiScene');

        this.sound.play('bgm', {loop:true, volume:.5});
    }

    update(time, delta) {
        // updates all timers created by the Timer class
        Timer.update(time, delta);

        // update the timer on the UI
        if (this.minigameTimer.isActive) {
            this.uiScene.setTimerProgress(this.minigameTimer.getProgress());
        }
        
    }

    walkTo(zone){
        let walkPath = this.add.path(this.player.x, this.player.y);
        walkPath.lineTo(this.zones[zone].x, this.zones[zone].y); 
        
        this.isWalking = true;

        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 1000,
            ease: 'Power0',
            hold: 0,
            //repeat: -1,
            //yoyo: true,
            //rotateToPath: false
        });


        setTimeout(() => {
            this.isWalking = false;
            this.location = zone;
        }, 1000);


    }

    // called by current minigame when it is finished before the time limit, or when the time limit reached
    // ALWAYS CALLED
    async minigameFinished(scene, result) {
        // clearTimeout(this.minigameTimeout);
        this.minigameTimer.stop();
        console.log('finished - closing minigame - minigame result:', result);

        this.uiScene.minigameEnd(result);
        
        // wait a little before closing door
        await new Promise((resolve, reject) => {
            new Timer().start(1000, resolve);
        });

        // wait for door close
        await this.uiScene.closeDoor(300);

        // stop the minigame scene
        this.scene.stop(scene);

        // open doors to map
        this.uiScene.openDoor(300);
        
        // reenable interactivity
        for(const zone in this.zones){
            this.zones[zone].sprite.setInteractive();     
            console.log(zone);       
        }
    }

    async launchMinigame(minigameTimeLimit = 15000){
        //something something this.zones[this.location].minigames
        // temp minigame testing
        console.log('launching minigame');
        
        //picks a random minigame from the minigame list
        let minigameName = this.zones[this.location].minigames[Math.floor(Math.random()*this.zones[this.location].minigames.length)];
        
        // console.log(this.location);
        // console.log(this.zones[this.location]);
        // console.log(minigameName);

        const sceneName = 'minigame' + minigameName;

        // wait for door to close
        await this.uiScene.closeDoor(300);
        
        // launch minigame
        this.scene.launch(sceneName);
        this.scene.bringToTop(sceneName);
        this.scene.bringToTop('uiScene'); // move UI scene to the top

        // wait for door to open
        await this.uiScene.openDoor(300);

        // then start minigame and timers
        this.uiScene.minigameStart();

        const currentMinigame = this.scene.get(sceneName);

        this.minigameTimer.start(minigameTimeLimit, () => {
            const result = currentMinigame.timeout();
            console.log('Minigame ran out of time');
            this.minigameFinished(currentMinigame, result);
        });
    }

    // checks if a world x y position is touching an object based on its texture
    checkCollision(x, y, object) {
        if (!object) return;
        const key = object.texture.key;
        const alpha = game.textures.getPixelAlpha(x - object.x + object.width * object.originX, y - object.y + object.height * object.originY, key, 0);
        if (alpha > 127) {
            return object;
        }
        return;
    }
    
    
}