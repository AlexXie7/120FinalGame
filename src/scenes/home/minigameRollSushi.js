class minigameRollSushi extends Minigame {
    constructor(id = 'RollSushi') {
        super(id);
    }


// copy to create()



    preload() {
        super.preload();

        this.load.image('arrowUp', './assets/minigameRollSushi/tempArrowUp.png');
        
        this.load.image('sushiMat', './assets/minigameRollSushi/SushiMat.png');
        this.load.image('seaweed', './assets/minigameRollSushi/Seaweed.png');
        this.load.spritesheet('rice', './assets/minigameRollSushi/riceSprite.png', {frameWidth: 620, frameHeight: 371});
        this.load.image('pb', './assets/minigameRollSushi/PeanutButter.png');
        this.load.image('jelly', './assets/minigameRollSushi/Jelly.png');
        this.load.image('jellySpread', './assets/minigameRollSushi/jellySpread.png');
        this.load.image('pbSpread', './assets/minigameRollSushi/pbSpread.png');
    }

    create() {
        super.create();

        this.sushiMat = this.add.image(600, 450, 'sushiMat').setOrigin(0.5, 0.5).setScale(1, 1);
        this.nori = this.add.image(600, 450, 'seaweed').setOrigin(0.5, 0.5).setScale(1, 1);
        this.rice = this.add.sprite(600, 475, 'rice').setOrigin(0.5, 0.5).setScale(1, 1).setInteractive();
        this.pb = this.add.image(120, 700, 'pb').setOrigin(0.5, 0.5).setScale(1, 1).setInteractive().setAlpha(0);
        this.jelly = this.add.image(1080, 700, 'jelly').setOrigin(0.5, 0.5).setScale(1, 1).setInteractive().setAlpha(0);
        this.jellySmear = this.add.image(600, 450, 'jellySpread').setOrigin(0.5, 0.5).setScale(1, 1).setAlpha(0);
        this.pbSmear = this.add.image(600, 450, 'pbSpread').setOrigin(0.5, 0.5).setScale(1, 1).setAlpha(0);

        // this.uiScene = this.scene.get('uiScene');
        this.uiScene.setInstructions('Spread Rice!');

        this.arrow = this.add.sprite(gameCenterX, gameCenterY*2, 'arrowUp').setAlpha(0).setScale(.1);
        this.arrow.y -= this.arrow.height;

        //this.jelly.x -= this.jelly.width;

        this.riceClicked = 0;
        this.arrowClicked = false;
        this.pbSpread = false;
        this.jellySpread = false;

        this.rice.on('pointerdown', () => {
            if(this.riceClicked < 2){
                this.riceClicked += 1;
                if(this.riceClicked <= 2) {
                    this.rice.setFrame(this.riceClicked);
                }
                if(this.riceClicked == 2){
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
                    this.pbSmear.setAlpha(.7);

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
                    this.jellySmear.setAlpha(.7);


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