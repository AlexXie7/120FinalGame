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
        // this.load.image('player', './assets/TempPlayer.png');

        this.load.spritesheet('player', '/assets/Player.png', {frameWidth: 400, frameHeight: 800, startFrame: 0, endFrame: 3});
        this.load.audio('bgm', './assets/bgm.wav');

    }

    create() {
        this.map = this.add.sprite(gameCenterX, gameCenterY,'map').setDisplaySize(game.scale.width, game.scale.height);
       
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
            'school' : {
                x: gameCenterX * 1.63,
                y: gameCenterY*1.7,
                minigames: minigameNames['school'],//['SchoolGum'],
                sprite: this.add.sprite(gameCenterX * 1.63, gameCenterY*1.18, 'school').setScale(this.map.scale*.9),
                rotation: 0,
                baseScale: this.map.scale*.9,
                playing: false,
                pathToCenter: [this.schoolRoad, this.bottomMid, this.centerRoad]
                } ,
            'home' : {
                x: gameCenterX * .5,
                y: gameCenterY * 1.7,
                minigames: minigameNames['home'],
                sprite: this.add.sprite(gameCenterX * .5, gameCenterY * 1.33, 'home').setScale(this.map.scale*.85),
                rotation: 0,
                baseScale: this.map.scale*.85,
                playing: false,
                pathToCenter: [this.homeRoad, this.bottomMid, this.centerRoad]
                } ,
            'plaza' : {
                x: gameCenterX * .73,
                y: gameCenterY * .93,
                minigames: minigameNames['plaza'],// ['PickFood'],
                sprite: this.add.sprite(gameCenterX * .73, gameCenterY * .5, 'plaza').setScale(this.map.scale*.85),
                rotation: 0,
                baseScale: this.map.scale*.85,
                playing: false,
                pathToCenter: [this.plazaRoad, this.centerLeft, this.centerRoad]
                } ,
            'town' : {
                x: gameCenterX*1.8,
                y: gameCenterY*.94,
                minigames: minigameNames['town'],
                sprite: this.add.sprite(gameCenterX * 1.5, gameCenterY * .6, 'town').setScale(this.map.scale*.8).setOrigin(.2,.5),
                rotation: 0,
                baseScale: this.map.scale*.8,
                playing: false,
                pathToCenter: [this.townRoad, this.centerRight,this.centerRoad]
            }
        }

        for(const zone in this.zones){
            console.log(this.zones[zone].sprite);
            this.zones[zone].spriteY = this.zones[zone].sprite.y;
            // console.log(this.zones[zone].spriteY);
            // tweens
            this.zones[zone].tween = this.tweens.add({
                targets: this.zones[zone].sprite,
                //ease: 'Sine.easeInOut',
                props: {
                    scale: {value: this.zones[zone].baseScale*1.3, duration: 2500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1},
                    angle: {from: '355', to: '365', duration: 3000, ease: 'Sine.easeInOut',clockwise: false, yoyo: true, repeat: -1},
                    y: {value: this.zones[zone].spriteY - 50, duration:1500, ease:'Sine.easeInOut', yoyo:true, repeat: -1}
                },
                //loop: 1,
                paused: true,
            })

            // interactivity for the town sprites
            this.zones[zone].sprite.setInteractive();

            // On hover over sprite
            this.zones[zone].sprite.on('pointerover', () => {
                console.log('Over the ' + zone);
                this.zones[zone].tween.play();

            });

            // On hover off sprite
            this.zones[zone].sprite.on('pointerout', () => {
                console.log('Off the ' + zone);
                this.zones[zone].tween.pause();
                this.zones[zone].sprite.setScale(this.zones[zone].baseScale);
                this.zones[zone].sprite.setAngle(0);
                this.zones[zone].sprite.y = this.zones[zone].spriteY;
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

        this.playerScale = this.map.scale*.2;
        this.player = this.add.follower(null, gameCenterX, gameCenterY, 'player').setScale(this.playerScale).setOrigin(.5, 1);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', {start:0, end:1, first:0}),
            frameRate: 5,
            repeat: -1
        })

        this.isWalking = false;
        this.location = null;

        // this.walkTo('school');
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

        console.log(this.zones[zone].pathToCenter);

        let flippedPath = [...this.zones[zone].pathToCenter];
        console.log(flippedPath);
        flippedPath.reverse();

        if (this.location == 'school' || this.location == 'town'){
            this.player.flipX = true;
        } else {
            this.player.flipX = false;
        }

        if(this.location!=null){
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
        // walkPath.lineTo(this.zones[zone].x, this.zones[zone].y); 
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
            //flipX: true,
            //repeat: -1,
            //yoyo: true,
            //rotateToPath: false
        });


        setTimeout(() => {
            this.isWalking = false;
            this.location = zone;
            this.player.stop(null, true);
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
        this.uiScene.showLives();
        if (!result) {
            this.uiScene.removeLife();
        }
        
        // reenable interactivity
        for(const zone in this.zones){
            this.zones[zone].sprite.setInteractive();     
            console.log(zone);       
        }
    }

    async launchMinigame(minigameTimeLimit = 10000){
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
        this.uiScene.hideLives();
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