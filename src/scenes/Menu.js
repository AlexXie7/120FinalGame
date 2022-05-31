class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    preload() {
        this.load.image('menuBackground', './assets/menu/background.jpg');
        this.load.image('menuBoxBack', './assets/menu/box-back.png');
        this.load.image('menuBoxMiddle', './assets/menu/box-middle.png');
        this.load.image('menuBoxFront', './assets/menu/box-front.png');
        this.load.spritesheet('playButton', './assets/menu/play-button.png', {frameWidth: 300, frameHeight: 100});
        this.load.spritesheet('creditButton', './assets/menu/credit-button.png', {frameWidth: 300, frameHeight: 100});
    }

    create() {
        // skip menu is enabled
        if (DEBUG_SKIP_MENU) {
            this.scene.start('playScene');
            return;
        }

        this.background = this.add.image(gameCenterX, gameCenterY, 'menuBackground')
            .setOrigin(.5)
            .setDisplaySize(game.config.width, game.config.height);
        this.boxes = [
            this.add.image(gameCenterX, gameCenterY, 'menuBoxBack').setOrigin(.5),//.setDisplaySize(game.config.width, game.config.height),
            this.add.image(gameCenterX, gameCenterY, 'menuBoxMiddle').setOrigin(.5),//.setDisplaySize(game.config.width, game.config.height),
            this.add.image(gameCenterX, gameCenterY, 'menuBoxFront').setOrigin(.5)//.setDisplaySize(game.config.width, game.config.height),
        ];

        const textConfig = {
            fontFamily: 'sans-serif',
            fontSize: '100px', 
            backgroundColor: '#FFF', 
            color: '#000'
        }

        // buttons
        this.playButton = this.add.sprite(gameCenterX, gameCenterY, 'playButton', 0).setOrigin(.5);
        this.initButton(this.playButton, () => {
            this.state = 'fading';
            this.playButton.disable();
            this.creditButton.disable();
        });
        this.creditButton = this.add.sprite(gameCenterX, gameCenterY + this.playButton.displayHeight + 20, 'creditButton', 0).setOrigin(.5);
        this.initButton(this.creditButton, () => {
            // open credits
        });
        
        this.timer = 0;

        this.state = 'none';

        // object to fade out before starting, buttons and logos
        this.toFade = [this.playButton, this.creditButton];
    }

    update(time, delta) {
        if (this.state === 'fading') {
            if (this.toFade.length > 0) {
                for (let i = 0; i < this.toFade.length; i++) {
                    const object = this.toFade[i];
                    if (object.alpha <= 0) {
                        object.setAlpha(0);
                        // object.destroy();
                        this.toFade.splice(i, 1);
                        i -= 1;
                    } else {
                        object.setAlpha(object.alpha - delta * .001);
                    }
                }
            } else {
                this.state = 'starting';
            }
        } else if (this.state === 'starting') {

            if (this.boxes.length > 0) {
                const box = this.boxes[this.boxes.length - 1];
                if (box.alpha > 0) {
                    box.setAlpha(box.alpha - delta * .002);
                } else {
                    box.destroy();
                    this.boxes.pop();
                }
            } else {
                this.state = 'waiting'
            }
        } else if (this.state === 'waiting') {

            if (this.timer >= 1000) {

                // start tutorial or play scene idk
                this.scene.start('playScene');
            }

            this.timer += delta;
        }
    }

    initButton(object, callback = () => {}) {
        const overlay = this.add.sprite(object.x, object.y, object.texture.key, 0)
            .setScale(object.scaleX, object.scaleY)
            .setOrigin(object.originX, object.originY)
            .setDepth(object.depth)
            .setAlpha(0);
        overlay.setBlendMode(Phaser.BlendModes.ADD);
        object.overlay = overlay;
        const highlightAlpha = .5;
        object.setInteractive()
        object.on(Phaser.Input.Events.POINTER_OVER, () => {
            overlay.setAlpha(highlightAlpha);
        })
        object.on(Phaser.Input.Events.POINTER_OUT, () => {
            overlay.setAlpha(0);
            object.setFrame(0);
        })
        object.on(Phaser.Input.Events.POINTER_UP, () => {
            object.setFrame(0);
            overlay.setAlpha(highlightAlpha);
            callback();
        });
        object.on(Phaser.Input.Events.POINTER_DOWN, () => {
            object.setFrame(1);
            overlay.setAlpha(0);
        });

        object.disable = () => {
            object.disableInteractive();
            object.setAlpha(.5);
            overlay.setAlpha(0);
        }
    }
}