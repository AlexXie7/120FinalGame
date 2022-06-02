class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    preload() {
        this.load.image('title','./assets/menu/title.png');
        this.load.image('logo','./assets/menu/logo.png');
        this.load.image('menuBackground', './assets/menu/background.jpg');
        this.load.image('menuBoxBack', './assets/menu/box-back.png');
        this.load.image('menuBoxMiddle', './assets/menu/box-middle.png');
        this.load.image('menuBoxFront', './assets/menu/box-front.png');
        this.load.spritesheet('playButton', './assets/menu/play-button.png', {frameWidth: 300, frameHeight: 100});
        this.load.spritesheet('creditButton', './assets/menu/credit-button.png', {frameWidth: 300, frameHeight: 100});
        this.load.spritesheet('exitButton', './assets/menu/exit-button.png', {frameWidth: 64, frameHeight: 64});

        this.load.image('credits', './assets/menu/credits.png');

        this.load.audio('buttonHover', './assets/menu/button-hover.wav');
        this.load.audio('buttonDown', './assets/menu/button-down.wav');
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

        this.title = this.add.image(gameCenterX, gameCenterY - 200, 'title').setOrigin(.5).setScale(1.2);
        this.logo = this.add.image(gameCenterX + 350, gameCenterY + 100, 'logo').setOrigin(.5).setScale(2);
        this.logo.spinSpeed = 0;
        this.logo.update = (time, delta) => {
            this.logo.spinSpeed += (1 - this.logo.spinSpeed) * delta * .001;
            this.logo.setAngle(this.logo.angle + this.logo.spinSpeed * delta * .01);
        }
        this.logo.setInteractive();
        this.logo.on(Phaser.Input.Events.POINTER_UP, () => {
            this.logo.spinSpeed += 10;
        });

        this.credits = this.add.image(gameCenterX, gameCenterY, 'credits').setOrigin(.5).setVisible(false).setDepth(1);
        this.exitButton = this.add.sprite(this.credits.getTopRight().x, this.credits.getTopRight().y, 'exitButton').setOrigin(.5).setDepth(1).setVisible(false);

        // buttons
        this.playButton = this.add.sprite(gameCenterX, this.title.y + 400, 'playButton', 0).setOrigin(.5);
        this.initButton(this.playButton, () => {
            this.state = 'fading';
            this.playButton.disable();
            this.creditButton.disable();
        });
        this.creditButton = this.add.sprite(gameCenterX, this.playButton.y + this.playButton.displayHeight + 20, 'creditButton', 0).setOrigin(.5);
        this.initButton(this.creditButton, () => {
            // open credits
            this.playButton.disable();
            this.creditButton.disable();
            this.exitButton.enable();
            this.exitButton.setVisible(true);
            this.credits.setVisible(true);
        });

        this.initButton(this.exitButton, () => {
            this.exitButton.disable();
            this.exitButton.setVisible(false);
            this.credits.setVisible(false);
            this.playButton.enable();
            this.creditButton.enable();
        });
        
        this.timer = 0;

        this.state = 'none';

        // object to fade out before starting, buttons and logos
        this.toFade = [this.playButton, this.creditButton, this.title, this.logo];
    }

    update(time, delta) {
        this.logo.update(time, delta);

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
            this.sound.play('buttonHover', {volume: .4});
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
            this.sound.play('buttonDown', {volume: .4});
            object.setFrame(1);
            overlay.setAlpha(0);
        });

        object.disable = () => {
            object.disableInteractive();
            object.setAlpha(.5);
            overlay.setAlpha(0);
        }
        object.enable = () => {
            object.setInteractive();
            object.setAlpha(1);
            overlay.setAlpha(0);
        }
    }
}