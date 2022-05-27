class minigameGiveWater extends Minigame {
    constructor(id = 'GiveWater') {
        super(id);
    }

    preload() {
        super.preload();

    }

    create() {
        super.create();

        this.hands = [];
        this.towelBox = this.add.rectangle(gameCenterX*.25, gameCenterY*1.75, 100, 100, 0xFF0000);
        this.waterBox = this.add.rectangle(gameCenterX*1.75,gameCenterY*1.75, 100, 100, 0x0000FF);

        for(let n = 1; n <= 7; n++){
            this.hands.push(this.add.rectangle(game.config.width/8 * (n), gameCenterY/2, 50, 200, 0xFFFFFF).setAngle(-40 + 10*n));
        }

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