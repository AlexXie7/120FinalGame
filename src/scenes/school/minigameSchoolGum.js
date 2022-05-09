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

        this.graphics = this.add.graphics();
        this.startX = gameCenterX;
        this.startY = game.config.height - 50;
    }

    update(time, delta) {
        const pointer = game.input.activePointer;

        this.graphics.clear();
        this.graphics.beginPath();

        const maxIter = 20;
        const mod = ((time) % 1000) / 1000;
        const differenceX = pointer.x - this.startX;
        const differenceY = pointer.y - this.startY;
        const distance = Phaser.Math.Distance.Between(0,0,differenceX,differenceY);

        this.graphics.lineStyle(4, 0xFF0000, 1);
        this.graphics.beginPath();
        for (let i = mod * 2; i < maxIter; i += 2) {
            const tNow = i / maxIter;
            const tNext = (i + 1) / maxIter;
            this.graphics.lineBetween(
                this.startX + differenceX * tNow,
                this.startY + differenceY * tNow - this.arc(tNow) * distance * .5,
                this.startX + differenceX * tNext,
                this.startY + differenceY * tNext - this.arc(tNext) * distance * .5,
            )
        }
        this.graphics.closePath();

        this.graphics.strokePath();
    }

    arc(x) {
        return (.25 - (x - .5) * (x - .5)) * 2;
    }
}