class minigameTutorial extends Minigame {
    constructor(id = 'Tutorial') {
        super(id);
    }

    preload() {
        super.preload();

    }

    create() {
        super.create();

        this.uiScene.setInstructions('Get on board');

        // background
        this.add.rectangle(0,0,game.config.width, game.config.height, 0xFFE74F).setOrigin(0);

        // temp finish button for testing
        this.finishButton = this.add.text(gameCenterX, gameCenterY, 'click to \nfinish tutorial\n(for testing)', {
            backgroundColor: '#CCF',
            color: '#000',
            fontSize: '100px',
            align: 'center'
        }).setOrigin(.5).setInteractive();
        this.finishButton.on(Phaser.Input.Events.POINTER_UP, () => {
            this.finish();
        }); 
    }

    update(time, delta) {

        // call when the minigame has a finished condition
        // this.finish(true); // true if success, false if failure

        // // or simply set isPassed to true or false if the state of the minigame is a success or failure
        // this.isPassed = true;
    }

    // override finish
    finish() {
        super.finish(true);
        eventEmitter.emit('tutorialFinished');
    }
}