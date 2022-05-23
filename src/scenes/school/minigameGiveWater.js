class minigameGiveWater extends Minigame {
    constructor(id) {
        super(id);
    }

    preload() {
        super.preload();

    }

    create() {
        super.create();
        
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