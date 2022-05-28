class minigameCarStickers extends Minigame {
    constructor(id = 'CarStickers') {
        super(id);
    }

    preload() {
        super.preload();

        // car window

        // sticker sheet

    }

    create() {
        super.create();
        
        this.uiScene.setInstructions('Decorate your car!');
        // this.timerScale = 1;

        // background

        
        // car window


        // score represents style. good stickers increase score. bad stickers decrease score
        this.score = 0;
        this.targetScore = 1000;

        // for each frame or sticker, add button with a thumbnail
        this.stickerButtons = [];
        this.addStickerButton('key', 0, 100);


        // sticker object that is following mouse
        this.activeSticker;

        // stickers that have already been placed. consider not needing to update
        this.stickers = [];


        // bitmap mask for stickers. created from car image hopefully
        this.stickerMask;


        this.input.on('pointerdown', (pointer) => {
            // place sticker
            this.placeSticker(pointer.x, pointer.y, 0, this.activeSticker);
        })
    }

    update(time, delta) {

        if (this.activeSticker) {
            this.activeSticker.update(time, delta);
        }

    }

    placeSticker(x, y, angle, sticker) {

    }

    createSticker(key, frame) {
        const sticker = this.add.sprite(gameCenterX, gameCenterY, key, frame);
        // sticker.setMask(this.stickerMask);
        return sticker;
    }

    // value = how much it adds or subtracts to the score
    addStickerButton(key, frame, value) {

    }

}