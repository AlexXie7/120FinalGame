class minigameRollSushi extends Minigame {
    constructor(id = 'RollSushi') {
        super(id);
    }

    preload() {
        super.preload();

        this.uiScene = this.scene.get('uiScene');
        this.load.image('sushiMat', './assets/minigameRollSushi/tempSushiMat.jpg');
        this.load.image('jelly', './assets/minigameRollSushi/tempJ.jpg');
        this.load.image('pb', './assets/minigameRollSushi/tempPB.png');
        this.load.image('arrowUp', './assets/minigameRollSushi/tempArrowUp.png')
        

    }

    create() {
        super.create();

        this.bg = this.add.sprite(gameCenterX, gameCenterY, 'sushiMat').setDisplaySize(game.scale.width, game.scale.height);

        this.nori = this.add.rectangle(gameCenterX, gameCenterY, game.scale.width * .7, game.scale.height * .7, '0x006400');
        this.rice = this.add.rectangle(gameCenterX, gameCenterY * 1.5, this.nori.width - 10, this.nori.height/4, '0xFFFFFF').setInteractive();

        //pick up the whole peanut butter and dump it on the sushi
        this.pb = this.add.sprite(0, gameCenterY, 'pb');
        this.jelly = this.add.sprite(game.scale.width, gameCenterY, 'jelly');
        //this.jelly.x -= this.jelly.width;

        this.riceClicked = 1;
        this.pbSpread = false;
        this.jellySpread = false;

        this.rice.on('pointerup', () => {
            if(this.riceClicked < 4){
                this.riceClicked += 1;
                this.rice.y -= this.nori.height/4;
                this.rice.height += this.nori.height/4;
                if(this.riceClicked == 4){
                    this.pb.setDraggable();
                    this.jelly.setDraggable();
                }
            }
        });



    }

    update() {

        // call when the minigame has a finished condition
        //this.finish(true); // true if success, false if failure

        // or simply set isPassed to true or false if the state of the minigame is a success or failure
        //this.isPassed = true;
    }

    onTimeout() {
        // do timeout operations ex: clear any ui stuff
    }
}