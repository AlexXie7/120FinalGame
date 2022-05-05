

// minigame superclass
class Minigame extends Phaser.Scene {
    constructor(id = 'Name') {
        super('minigame' + id);
        this.id = id;
        console.log('constructing minigame' + id);
    }

    create() {
        this.playScene = this.scene.get('playScene'); // reference to the play scene
        this.isCompleted = false; // set when the minigame is finished
        this.isPassed = false; // set when the minigame is passed, else it means it is a failure
        
        // test minigame code
        this.add.rectangle(20, 20, game.config.width - 40, game.config.height - 40, '#FCF');
        this.add.text(40, 40, 'minigame' + this.id);

        console.log('created');
    }

    // called by play.js or minigame manager when the timelimit is up
    onTimeout() {
        this.isCompleted = true;
        return this.isPassed;
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

    }
}