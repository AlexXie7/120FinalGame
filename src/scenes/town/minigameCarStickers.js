class minigameCarStickers extends Minigame {
    constructor(id = 'CarStickers') {
        super(id);
    }

    preload() {
        super.preload();

        // car window
        this.load.image('car', './assets/minigameCarStickers/car.png');

        // sticker sheet
        this.load.spritesheet('stickerSheet', './assets/minigameCarStickers/sticker-sheet.png', {frameWidth: 64, frameHeight: 64});

        // mouse sheet for instructions
        this.load.spritesheet('mouseSheet', './assets/mouse-sheet.png', {frameWidth: 64, frameHeight: 64});
    }

    create() {
        super.create();
        
        this.uiScene.setInstructions('Decorate your car!');
        this.timerScale = 1.2;

        // background
        this.add.rectangle(0,0,game.config.width, game.config.height, 0x00F7B1).setOrigin(0);


        // car window
        this.car = this.add.image(gameCenterX, gameCenterY, 'car').setOrigin(.5)
        this.car.setScale(game.config.height / this.car.height);

        // extra instructions
        const insConfig = {
            fontSize: '30px',
            stroke: '#000',
            strokeThickness: 4,
        }

        const mouseLeft = this.add.sprite(0,40,'mouseSheet',0).setOrigin(0).setDepth(1).setScale(2);
        this.add.text(mouseLeft.getBottomLeft().x, mouseLeft.getBottomLeft().y, 'Place sticker', insConfig).setOrigin(0).setDepth(1);
        const mouseRight = this.add.sprite(game.config.width,40,'mouseSheet',1).setOrigin(1,0).setDepth(1).setScale(2);
        this.add.text(mouseRight.getBottomRight().x, mouseRight.getBottomRight().y, 'Skip sticker', insConfig).setOrigin(1,0).setDepth(1);


        // score represents style. good stickers increase score. bad stickers decrease score
        this.score = 0;
        this.targetScore = 1000;
        this.scoreText = this.add.text(game.config.width, game.config.height - 100, `${this.score} / ${this.targetScore}`, {
            fontSize: '64px',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'sans-serif'
        }).setOrigin(1).setDepth(1)

        // array of sticker data, index = the frame number
        this.stickerValues = [
            200,200,150,100,200,200,200,200,
            50,150,50,100,150,50,50,50,
            150,150,50,200,-100,-200,-500,-1000,
        ];

        // sticker object that is following mouse
        this.activeSticker = this.createSticker('stickerSheet', Math.floor(Math.random() * this.stickerValues.length));

        this.input.on('pointerdown', (pointer) => {
            
            if (pointer.button === 0) {
                // left click

                // place sticker
                this.placeSticker(this.activeSticker);
                this.activeSticker = this.createSticker('stickerSheet', Math.floor(Math.random() * this.stickerValues.length));
            } else {
                // right click

                // skip sticker
                this.uiScene.createText(pointer.x, pointer.y, 'skipped!');
                this.activeSticker.destroy();
                this.activeSticker = this.createSticker('stickerSheet', Math.floor(Math.random() * this.stickerValues.length));
            }
        })
    }

    update(time, delta) {

        if (this.activeSticker) {
            this.activeSticker.update(time, delta);
        }

    }

    placeSticker(sticker) {
        sticker.isFinished = true;
        this.uiScene.createText(sticker.x, sticker.y, `${sticker.value}`, {
            fontSize: '40px',
            fontFamily: 'sans-serif',
            stroke: sticker.value > 0 ? '#000' : '#fff',
            strokeThickness: 4,
            color: sticker.value > 0 ? '#0f0' : '#f00'
        });

        this.score += sticker.value;
        this.scoreText.setText(`${this.score} / ${this.targetScore}`);

        if (this.score > this.targetScore) {
            this.scoreText.setColor('#0f0');
        } else if (this.score > 0) {
            this.scoreText.setColor('#fff');
        } else {
            this.scoreText.setColor('#f00');
        }

        if (this.score >= this.targetScore) {
            this.isPassed = true;
            // consider finishing immediately
        } else {
            this.isPassed = false;
        }

        this.activeSticker = undefined;
    }

    createSticker(key, frame) {
        const sticker = this.add.sprite(gameCenterX, gameCenterY, key, frame);
        sticker.setMask(new Phaser.Display.Masks.BitmapMask(this, this.car));
        sticker.setScale(2);
        sticker.setAngle(Math.random() * 10);
        sticker.value = this.stickerValues[frame];
        sticker.update = (time, delta) => {
            if (sticker.isFinished) {
                return;
            }

            const pointer = game.input.activePointer;
            sticker.setPosition(pointer.x, pointer.y);
        }
        return sticker;
    }
}