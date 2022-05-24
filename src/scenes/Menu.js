class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    preload() {
        this.load.image('menuBackground', './assets/menu/background.jpg');
        this.load.image('menuBoxBack', './assets/menu/box-back.png');
        this.load.image('menuBoxMiddle', './assets/menu/box-middle.png');
        this.load.image('menuBoxFront', './assets/menu/box-front.png');
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

        // replace with image later probably instead of text
        this.startButton = this.add.text(gameCenterX, gameCenterY, 'start', textConfig).setOrigin(.5);
        this.initButton(this.startButton, () => {
            this.state = 'starting';
        });
        this.helpButton = this.add.text(gameCenterX, gameCenterY + this.startButton.displayHeight + 20, 'help', textConfig).setOrigin(.5);
        this.initButton(this.helpButton);
        
        this.timer = 0;

        this.state = 'none';
    }

    update(time, delta) {
        if (this.state === 'starting') {

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
        object.setInteractive()
        object.on(Phaser.Input.Events.PIONTER_OVER, () => {

        })
        object.on(Phaser.Input.Events.PIONTER_OUT, () => {
            
        })
        object.on(Phaser.Input.Events.POINTER_UP, () => {
            callback();
        });
    }
}