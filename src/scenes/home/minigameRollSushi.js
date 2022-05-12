class minigameRollSushi extends Minigame {
    constructor(id = 'RollSushi') {
        super(id);
    }

    preload() {
        super.preload();

        this.uiScene = this.scene.get('uiScene');
        this.load.image('sushiMat', './assets/minigameRollSushi/tempSushiMat.jpg');

    }

    create() {
        super.create();

        this.bg = this.add.sprite(gameCenterX, gameCenterY, 'sushiMat').setDisplaySize(game.scale.width, game.scale.height);

        this.nori = this.add.rectangle(gameCenterX, gameCenterY, game.scale.width * .7, game.scale.height * .7, '0x006400');
        this.rice = this.add.rectangle(gameCenterX, gameCenterY * 1.5, this.nori.width - 10, this.nori.height/4, '0xFFFFFF');



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