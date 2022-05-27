class minigameRollSushi extends Minigame {
    constructor(id = 'RollSushi') {
        super(id);
    }

    preload() {
        super.preload();

        this.load.image('sushiMat', './assets/minigameRollSushi/tempSushiMat.jpg');
        this.load.image('jelly', './assets/minigameRollSushi/tempJ.jpg');
        this.load.image('pb', './assets/minigameRollSushi/tempPB.png');
        this.load.image('arrowUp', './assets/minigameRollSushi/tempArrowUp.png')
        
    }

    create() {
        super.create();

        // this.uiScene = this.scene.get('uiScene');
        this.uiScene.setInstructions('Spread Rice!');

        this.bg = this.add.sprite(gameCenterX, gameCenterY, 'sushiMat').setDisplaySize(game.scale.width, game.scale.height);

        this.nori = this.add.rectangle(gameCenterX, gameCenterY, game.scale.width * .7, game.scale.height * .7, '0x006400');
        this.rice = this.add.rectangle(gameCenterX, gameCenterY * 1.5, this.nori.width - 10, this.nori.height/4, '0xFFFFFF').setInteractive();

        this.arrow = this.add.sprite(gameCenterX, gameCenterY*2, 'arrowUp').setAlpha(0).setScale(.1);
        this.arrow.y -= this.arrow.height;

        //pick up the whole peanut butter and dump it on the sushi
        this.pb = this.add.sprite(0, gameCenterY, 'pb').setInteractive().setAlpha(0);
        this.jelly = this.add.sprite(game.scale.width, gameCenterY, 'jelly').setInteractive().setAlpha(0);
        //this.jelly.x -= this.jelly.width;

        this.riceClicked = 1;
        this.arrowClicked = false;
        this.pbSpread = false;
        this.jellySpread = false;

        this.rice.on('pointerdown', () => {
            if(this.riceClicked < 3){
                this.riceClicked += 1;
                this.rice.y -= this.nori.height/4;
                this.rice.height += this.nori.height/4;
                if(this.riceClicked == 3){
                    console.log("draggable");
                    this.uiScene.setInstructions("Spread PB&J");
                    this.pb.setAlpha(1);
                    this.jelly.setAlpha(1);
                    this.input.setDraggable([this.pb, this.jelly]);
                }
            }
        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.pb.on('pointerup', () => {
            if(this.pb.x <= gameCenterX + this.rice.width/2 &&
                this.pb.x >= gameCenterX - this.rice.width/2 &&
                this.pb.y <= gameCenterY + this.rice.height/2 &&
                this.pb.y >= gameCenterY - this.rice.height/2) {

                    this.pb.destroy();
                    this.pbSpread = true;

                    if(this.jellySpread){
                        this.arrow.setAlpha(.7);
                        this.arrow.setInteractive();
                    }
                }
        });

        this.jelly.on('pointerup', () => {
            if(this.jelly.x <= gameCenterX + this.rice.width/2 &&
                this.jelly.x >= gameCenterX - this.rice.width/2 &&
                this.jelly.y <= gameCenterY + this.rice.height/2 &&
                this.jelly.y >= gameCenterY - this.rice.height/2) {

                    this.jelly.destroy();
                    this.jellySpread = true;

                    if(this.pbSpread){
                        this.arrow.setAlpha(.7);
                        this.arrow.setInteractive();
                    }
                }
        });

        this.arrow.on('pointerup', () => {
            if(!this.arrowClicked){
                this.arrowClicked = true;
                this.nori.setPosition(gameCenterX,gameCenterY);
                this.nori.height -= this.rice.height;
                this.rice.destroy();
            }
        })

    }

    update() {

        // call when the minigame has a finished condition
        //this.finish(true); // true if success, false if failure

        // or simply set isPassed to true or false if the state of the minigame is a success or failure
        if(!this.isPassed && this.pbSpread && this.jellySpread) {
            this.isPassed = true;
        }
    }

    onTimeout() {
        // do timeout operations ex: clear any ui stuff
    }
}