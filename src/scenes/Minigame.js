

// minigame superclass
class Minigame extends Phaser.Scene {
    constructor(id = 'Name') {
        super('minigame' + id);
        this.id = id;
        console.log('constructing minigame' + id);
    }

    preload(){
        
    }

    create() {
        this.playScene = this.scene.get('playScene'); // reference to the play scene
        this.uiScene = this.scene.get('uiScene');
        this.isFinished = false; // set when the minigame is finished
        this.isPassed = false; // set when the minigame is passed, else it means it is a failure
        this.finishCalled = false;
        
        // test minigame code
        // this.add.rectangle(20, 20, game.config.width - 40, game.config.height - 40, '#FCF');
        this.add.text(40, 40, 'minigame' + this.id);

        console.log('created');
    }

    // overloaded by minigame subclasses; called by timeout function
    onTimeout() {

    }

    // called by play.js or minigame manager when the timelimit is up
    timeout() {
        this.isFinished = true;
        this.onTimeout();
        return this.isPassed;
    }

    // called by any subclass minigame when the minigame is completed before time limit
    finish(result) {
        if (this.finishCalled) {
            return;
        }
        this.finishCalled = true;
        this.isFinished = true;
        this.isPassed = result;
        this.playScene.minigameFinished(this, result);
    }
}

// example subclass (in its own folder)

class MinigameName extends Minigame {
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
        this.finish(true); // true if success, false if failure

        // or simply set isPassed to true or false if the state of the minigame is a success or failure
        this.isPassed = true;
    }

    onTimeout() {
        // do timeout operations ex: clear any ui stuff
    }
}