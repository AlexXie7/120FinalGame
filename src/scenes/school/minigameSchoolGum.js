class minigameSchoolGum extends Minigame {
    constructor(id = 'SchoolGum') {
        super(id);
    }

    preload() {
        super.preload();

        const asset = './assets/minigameSchoolGum/';
        this.load.image('trashCan', asset + 'trash-can.png');
        this.load.image('whiteBoard', asset + 'white-board.png');
        this.load.image('desk', asset + 'desk.png');
    }

    create() {
        super.create();

        this.add.rectangle(0,0,game.config.width, game.config.height, 0xFFFFFF).setOrigin(0);

        this.add.image(gameCenterX - 200, gameCenterY + 200,'trashCan').setOrigin(.5);
        this.add.image(gameCenterX + 200, gameCenterY + 200,'desk').setOrigin(.5);
        this.add.image(gameCenterX - 200, gameCenterY - 150,'whiteBoard').setOrigin(.5);
    }

    update() {
        const pointer = game.input.activePointer;
    }
}