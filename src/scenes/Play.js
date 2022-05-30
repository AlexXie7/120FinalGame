class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        this.load.image('map', './assets/Map.jpg');
        this.load.image('school', './assets/School.png');
        this.load.image('town', './assets/Town.png');
        this.load.image('plaza', './assets/Plaza.png');
        this.load.image('home', './assets/Home.png');
        // this.load.image('player', './assets/TempPlayer.png');

        this.load.spritesheet('player', './assets/Player.png', {frameWidth: 400, frameHeight: 800, startFrame: 0, endFrame: 3});
        // this.load.audio('bgm', './assets/bgm.wav');
        this.load.audio('bgmOriginal', './assets/bgm-original.mp3');
        this.load.audio('bgmAsian', './assets/bgm-asian.mp3');

    }

    create() {
        // disable right click menu
        game.canvas.addEventListener('contextmenu', (e) => {e.preventDefault()});

        // launch ui scene and move it to top
        this.scene.launch('uiScene');
        this.scene.bringToTop('uiScene');

        // create minigame timer
        this.minigameTimer = new Timer();

        // once ui scene loads
        this.uiScene = this.scene.get('uiScene');
        
        // skip tutorial
        if (DEBUG_SKIP_TUTORIAL) {
            this.createWorld();
            return;
        }

        // bool of whether the game is started. set after tutorial is finished / world is created
        this.isStarted = false;


        this.uiScene.sys.events.once(Phaser.Scenes.Events.CREATE, () => {

            // launch tutorial
            this.launchMinigame('Tutorial', -1);
        })

        // once tutorial finishes
        eventEmitter.once('tutorialFinished', () => {

            // and door closes
            eventEmitter.once('doorFinished',() => {

                // create world
                this.createWorld();
            })
        })
        
    }

    // creates the map with zones
    createWorld() {

        // game mode
        this.mode = 'auto'; // use 'free' to pick

        this.map = this.add.sprite(gameCenterX, gameCenterY,'map');//.setDisplaySize(game.config.width, game.config.height);
        this.map.setScale(Math.max(game.config.width / this.map.width, game.config.height / this.map.height));
        // console.log(this.map.scale)

        //road waypoints 
        this.centerRoad  = this.add.rectangle(gameCenterX*1.03, gameCenterY*1.1, 5, 5, 0x000000);
        this.centerLeft  = this.add.rectangle(gameCenterX*.88, gameCenterY*.93, 5, 5, 0x000000);
        this.centerRight = this.add.rectangle(gameCenterX*1.17, gameCenterY*.93, 5, 5, 0x000000);
        this.bottomMid   = this.add.rectangle(gameCenterX*1.05, gameCenterY*1.7, 5, 5, 0x0);
        this.townRoad    = this.add.rectangle(gameCenterX*1.8, gameCenterY*.94, 5, 5, 0x000000);
        this.plazaRoad   = this.add.rectangle(gameCenterX*.73, gameCenterY*.93, 5, 5, 0x0);
        this.homeRoad    = this.add.rectangle(gameCenterX*.5, gameCenterY*1.7, 5, 5, 0x0);
        this.schoolRoad  = this.add.rectangle(gameCenterX*1.63, gameCenterY*1.7, 5, 5, 0x0);
        
        // Map Zones
        this.zones = {
            'school': new Zone(this, gameCenterX * 1.63, gameCenterY * 1.7, 'school', {
                minigames: Array.from(minigameNames['school']),
                sprite: this.add.sprite(gameCenterX * 1.55, gameCenterY*1.3, 'school').setScale(this.map.scale*.7),
                rotation: 0,
                scale: this.map.scale*.9,
                playing: false,
                pathToCenter: [this.schoolRoad, this.bottomMid, this.centerRoad]
            }),
            'home': new Zone(this, gameCenterX * .5, gameCenterY * 1.7, 'home', {
                minigames: Array.from(minigameNames['home']),
                sprite: this.add.sprite(gameCenterX * .4, gameCenterY * 1.33, 'home').setScale(this.map.scale*1.2),rotation: 0,
                scale: this.map.scale*.85,
                playing: false,
                pathToCenter: [this.homeRoad, this.bottomMid, this.centerRoad]
            }),
            'plaza': new Zone(this, gameCenterX * .73, gameCenterY * .93, 'plaza', {
                minigames: Array.from(minigameNames['plaza']),
                sprite: this.add.sprite(gameCenterX * .5, gameCenterY * .65, 'plaza'),
                rotation: 0,
                scale: this.map.scale*.85,
                playing: false,
                pathToCenter: [this.plazaRoad, this.centerLeft, this.centerRoad]
            }),
            'town': new Zone(this, gameCenterX * 1.8, gameCenterY * .94, 'town', {
                minigames: Array.from(minigameNames['town']),
                sprite: this.add.sprite(gameCenterX * 1.2, gameCenterY * .7, 'town').setScale(this.map.scale*.8).setOrigin(.2,.5),
                rotation: 0,
                scale: this.map.scale*.8,
                playing: false,
                pathToCenter: [this.townRoad, this.centerRight,this.centerRoad]
            })
        }

        for(const zone of Object.values(this.zones)){
            
            // only make interactive if mode is free
            if (this.mode === 'free') {
                zone.sprite.setInteractive();
            }

            zone.clickCallback = () => {
                if(this.location === zone.name){

                    //disable interactivity
                    for(const dZone of Object.values(this.zones)){
                        dZone.sprite.disableInteractive();
                    }
                    const minigameName = zone.getRandomMinigame();
                    this.launchMinigame(minigameName);
                }
                
                if(this.location == 'school' && zone.name == 'home'){

                    let walkPath = this.add.path(this.player.x, this.player.y);
                    walkPath.lineTo(this.homeRoad.x, this.homeRoad.y);

                    this.player.play('walk');
                    this.isWalking = true;
                    this.player.path = walkPath;

                    this.player.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 1000,
                        ease: 'Quad.easeInOut',
                        hold: 0,
                    });
            
                    new Timer().start(1000, () => {
                        this.isWalking = false;
                        this.location = zone.name;
                        this.player.stop(null, true);
                    });

                } else if (this.location == 'home' && zone.name == 'school'){

                    let walkPath = this.add.path(this.player.x, this.player.y);
                    walkPath.lineTo(this.schoolRoad.x, this.schoolRoad.y);

                    this.player.flipX = true;
                    this.player.play('walk');
                    this.isWalking = true;
                    this.player.path = walkPath;

                    this.player.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 1000,
                        ease: 'Quad.easeInOut',
                        hold: 0,
                    });
            
                    new Timer().start(1000, () => {
                        this.isWalking = false;
                        this.location = zone.name;
                        this.player.stop(null, true);
                    });

                } else if(!this.isWalking && this.location !== zone.name){
                    this.walkTo(zone);
                }
            }
        }

        this.mapCreated = true;

        this.playerScale = this.map.scale*.2;
        this.player = this.add.follower(null, gameCenterX, gameCenterY, 'player').setScale(this.playerScale).setOrigin(.5, 1);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', {start:0, end:1, first:0}),
            frameRate: 5,
            repeat: -1
        })

        this.isWalking = false;
        this.location = undefined;


        // play bgm
        // makes sure that the original and asian ver play at the same time
        this.bgmAsian = this.sound.add('bgmAsian', {volume: .5});
        this.bgmOriginal = this.sound.add('bgmOriginal', {loop: true,volume: .5})
            .on(Phaser.Sound.Events.LOOPED, () => this.bgmAsian.play());
        this.bgmOriginal.play();
        this.bgmAsian.play();
        
        
        this.minigameTimeLimit = 10000;

        
        new Timer().start(1000, () => {
            if (this.mode === 'auto') {
                // set started to true
                this.isStarted = true;

                this.walkToRandomZone((zone) => {
                    console.log('first mingame start')
                    const minigameName = zone.getRandomMinigame();
                    this.launchMinigame(minigameName, this.minigameTimeLimit);
                });
            }
        })
    }

    update(time, delta) {
        // updates all timers created by the Timer class
        Timer.update(time, delta);

        // update the timer on the UI
        if (this.minigameTimer.isActive) {
            this.uiScene.setTimerProgress(this.minigameTimer.getProgress());
        }
        
    }

    walkToRandomZone(callback = () => {}) {

        // add logic to choose zone based on minigame availability
        // so that each zone is finished at the same time

        const zones = Object.values(this.zones);
        const zone = zones[Math.floor(Math.random() * zones.length)];
        this.walkTo(zone, callback);
    }

    walkTo(zone, callback = () => {}){
        let walkPath = this.add.path(this.player.x, this.player.y);

        console.log(zone.pathToCenter);

        let flippedPath = [...zone.pathToCenter];
        console.log(flippedPath);
        flippedPath.reverse();

        if (this.location == 'school' || this.location == 'town'){
            this.player.flipX = true;
        } else {
            this.player.flipX = false;
        }

        // console.log(this.location)

        if(this.location){
            console.log(this.location, this.zones)
            for(const w of this.zones[this.location].pathToCenter){
                console.log(w);
                walkPath.lineTo(w.x, w.y);
            }
        }

        if (zone != 'school' && zone != 'town'){
            this.player.flipX = true;
        } else {
            this.player.flipX = false;
        }

        for(const w of flippedPath){
            walkPath.lineTo(w.x, w.y);
        }

        console.log(walkPath);
        // walkPath.lineTo(zone.x, zone.y); 
        this.player.play('walk');
        this.isWalking = true;

        const walkDuration = 1000;

        this.player.path = walkPath;
        this.player.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: walkDuration,
            ease: 'Quad.easeInOut',
            hold: 0,
            //flipX: true,
            //repeat: -1,
            //yoyo: true,
            //rotateToPath: false
        });


        new Timer().start(walkDuration, () => {
            this.isWalking = false;
            this.location = zone.name;
            this.player.stop(null, true);
            callback(zone);
        });


    }

    // called by current minigame when it is finished before the time limit, or when the time limit reached
    // ALWAYS CALLED
    async minigameFinished(scene, result) {
        // clearTimeout(this.minigameTimeout);
        this.minigameTimer.stop();
        console.log('finished - closing minigame - minigame result:', result);

        // pause minigame if minigame permits it
        if (scene.pauseOnFinish) {
            this.scene.pause(scene);
        }

        this.uiScene.overlay.moveAlpha(.5);
        this.uiScene.minigameEnd(result);
        
        // wait a little before closing door
        await new Promise((resolve, reject) => {
            new Timer().start(1000, resolve);
        });

        // wait for door close
        await this.uiScene.closeDoor(300);
        this.uiScene.overlay.setAlpha(0);

        // stop the minigame scene
        this.scene.stop(scene);

        // open doors to map
        this.uiScene.openDoor(300);
        this.uiScene.showLives();
        if (!result) {
            this.uiScene.removeLife();
        }
        
        // isStarted is set after tutorial finishes
        if (this.mapCreated && this.isStarted) {

            if (this.mode === 'free') {
                // reenable interactivity
                for(const zone of Object.values(this.zones)){
                    zone.sprite.setInteractive();
                }
            } else if (this.mode === 'auto') {
                // automatically go to next minigame
                this.walkToRandomZone((zone) => {
                    console.log('minigame end start new min')

                    const minigameName = zone.getRandomMinigame();
                    this.launchMinigame(minigameName, this.minigameTimeLimit);
                });
            }
        }
    }

    async launchMinigame(minigameName, minigameTimeLimit = 10000) {
        if (!minigameName) {
            console.log('error launching minigame - minigameName is undefined');
            return;
        }
        
        console.log('launching minigame',minigameName);
        const sceneName = 'minigame' + minigameName;

        // wait for door to close
        this.uiScene.hideLives();
        await this.uiScene.closeDoor(300);

        // get the minigame scene and check for the create event
        const currentMinigame = this.scene.get(sceneName);
        

        await new Promise((resolve, reject) => {

            currentMinigame.sys.events.once(Phaser.Scenes.Events.CREATE, () => {
                this.scene.pause(sceneName);
                resolve();
            })

            // launch minigame
            this.scene.launch(sceneName);
            this.scene.bringToTop(sceneName);
            this.scene.bringToTop('uiScene'); // move UI scene to the top

        })
        

        // wait for door to open
        await this.uiScene.openDoor(300);

        // then start minigame and timers
        await this.uiScene.minigameStart();
        this.scene.resume(sceneName);

        // scale timer by minigame timer scale
        minigameTimeLimit *= currentMinigame.timerScale;

        if (minigameTimeLimit > 0) {
            this.minigameTimer.start(minigameTimeLimit, () => {
                const result = currentMinigame.timeout();
                console.log('Minigame ran out of time');
            });
        }
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