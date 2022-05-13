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
        
        // Map Zones
        this.zones = {
            'school' : {
                x: gameCenterX * 1.5,
                y: gameCenterY / 2,
                minigames: minigameNames['school'],//['SchoolGum'],
                sprite: this.add.rectangle(game.scale.width  * 3 / 4, game.scale.height * 1 / 4, 150, 150, 0xffffff)
                } ,
            'home' : {
                x: gameCenterX * 1.5,
                y: gameCenterY * 1.5,
                minigames: minigameNames['home'],
                sprite: this.add.rectangle(gameCenterX*1.5, gameCenterY*1.5, 150, 150, 0xffffff)
                } ,
            'plaza' : {
                x: gameCenterX / 2,
                y: gameCenterY * 1.5,
                minigames: minigameNames['plaza'],// ['PickFood'],
                sprite: this.add.rectangle(gameCenterX/2, gameCenterY*1.5, 150, 150, 0xffffff)
                } ,
            'town' : {
                x: gameCenterX / 2,
                y: gameCenterY / 2,
                minigames: minigameNames['town'],
                sprite: this.add.rectangle(gameCenterX/2, gameCenterY/2, 150, 150, 0xffffff)
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
    }

    update() {

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

    // called by current minigame when it is finished before the time limit
    minigameFinished(scene, result) {
        clearTimeout(this.minigameTimeout);
        console.log('finished - closing minigame - minigame result:', result);
        this.scene.stop(scene);

        this.scene.get('uiScene').minigameEnd();
        
        //reenable interactivity
        for(const zone in this.zones){
            this.zones[zone].sprite.setInteractive();     
            console.log(zone);       
        }
    }

    launchMinigame(){
        //something something this.zones[this.location].minigames
        // temp minigame testing
        console.log('launching minigame');
        
        //picks a random minigame from the minigame list
        let minigameName = this.zones[this.location].minigames[Math.floor(Math.random()*this.zones[this.location].minigames.length)];
        
        // console.log(this.location);
        // console.log(this.zones[this.location]);
        // console.log(minigameName);

        const sceneName = 'minigame' + minigameName;

        // console.log(sceneName);

        this.scene.launch(sceneName);
        this.scene.bringToTop(sceneName);
        this.scene.bringToTop('uiScene'); // move UI scene to the top

        this.scene.get('uiScene').minigameStart();

        const currentMinigame = this.scene.get(sceneName);
        this.minigameTimeout = setTimeout(() => {
            const result = currentMinigame.timeout();
            console.log('time up');
            // this.scene.stop(currentMinigame);
            this.minigameFinished(currentMinigame, result);
        }, 5000);
    }
    
}