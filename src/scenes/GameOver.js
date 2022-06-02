
class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    preload() {
        this.load.image('gameOverBackground', './assets/gameOver/background.png');
        this.load.image('gameOverPlayer', './assets/gameOver/player.png');
        this.load.image('spotlightOn', './assets/gameOver/spotlight-1.png');
        this.load.image('spotlightOff', './assets/gameOver/spotlight-0.png');
        this.load.image('imposterText', './assets/gameOver/imposter.png');
        this.load.image('gameOverHand', './assets/gameOver/hand.png');
        this.load.image('gameOverText', './assets/gameOver/game-over.png');

        this.load.audio('spotlightSound', './assets/gameOver/spotlight.wav');

        this.load.spritesheet('menuButton', './assets/gameOver/menu-button.png', {frameWidth: 300, frameHeight: 100});
    }

    create() {
        this.add.text(30,30,'game over scene');

        this.add.image(gameCenterX, gameCenterY, 'gameOverBackground')
            .setOrigin(.5).setDisplaySize(game.config.width, game.config.height);
        this.player = this.add.image(-400, game.config.height, 'gameOverPlayer').setOrigin(.5,1);
        this.hand = this.add.image(game.config.width + 300, game.config.height, 'gameOverHand').setOrigin(.5,1);
        this.imposterText = this.add.image(gameCenterX, gameCenterY, 'imposterText').setAngle(-15).setVisible(false);
        this.imposterText.update = (time, delta) => {
            const flashAlpha = Math.ceil(Math.sin(time * .01) * .5);
            this.imposterText.setAlpha(flashAlpha);
        }
        
        this.spotlightOff = this.add.image(gameCenterX, gameCenterY, 'spotlightOff')
            .setOrigin(.5).setDisplaySize(game.config.width, game.config.height).setVisible(false);
        this.spotlightOn = this.add.image(gameCenterX, gameCenterY, 'spotlightOn')
            .setOrigin(.5).setDisplaySize(game.config.width, game.config.height).setVisible(false);

        this.gameOver = this.add.image(gameCenterX, gameCenterY, 'gameOverText').setOrigin(.5).setVisible(false);
    
        this.menuButton = this.add.image(gameCenterX, gameCenterY, 'menuButton').setOrigin(.5)
        this.initButton(this.menuButton, () => {
            this.scene.stop('gameOverScene');
            this.scene.start('menuScene');
        })
        this.menuButton.disable();
        this.menuButton.setVisible(false);

        this.overlay = this.add.rectangle(0,0,game.config.width, game.config.height, 0,1).setOrigin(0).setAlpha(0);
        
        this.initFollow(this.player);
        this.initFollow(this.hand);

        this.startSequence();
    
        this.state = 'point';
    }

    update(time, delta) {
        if (this.state === 'point') {
            this.hand.update(time, delta);
            this.player.update(time, delta);
            this.imposterText.update(time, delta);
        }
        if (this.state === 'fadeOut') {

        }
        

        Timer.update(time, delta);
    }

    initFollow(object) {
        object.targetX = object.x;
        object.targetY = object.y;
        object.easePower = .003;
        object.update = (time, delta) => {
            object.x += (object.targetX - object.x) * delta * object.easePower;
            object.y += (object.targetY - object.y) * delta * object.easePower;
        }
        object.setTargetPosition = (x, y) => {
            object.targetX = x;
            object.targetY = y || object.targetY;
        }
    }

    async startSequence() {
        await new Promise(resolve => new Timer().start(500, resolve));
        this.player.setTargetPosition(gameCenterX - 50);
        this.hand.setTargetPosition(gameCenterX + 200);

        await new Promise(resolve => new Timer().start(500, resolve));
        this.imposterText.setVisible(true);

        await new Promise(resolve => new Timer().start(1000, resolve));
        this.state = 'fadeOut';

        await new Promise(resolve => new Timer().start(500, resolve, (time, delta, timer) => {
            const progress = timer.getProgress();
            this.overlay.setAlpha(progress);
        }));

        this.spotlightOff.setVisible(true);

        await new Promise(resolve => new Timer().start(500, resolve, (time, delta, timer) => {
            const progress = timer.getProgress();
            this.overlay.setAlpha(1 - progress);
        }));
        this.overlay.setAlpha(0);

        await new Promise(resolve => new Timer().start(500, resolve));
        this.spotlightOn.setVisible(true);
        this.sound.play('spotlightSound', {volume: 1});

        let startY = this.gameOver.y;
        let targetY = gameCenterY - 310;

        this.gameOver.setVisible(true).setAlpha(0);
        await new Promise(resolve => new Timer().start(500, resolve, (time, delta, timer) => {
            const progress = timer.getProgress();
            this.gameOver.setAlpha(progress);
            this.gameOver.y = startY + (targetY - startY) * progress;
        }));
        this.gameOver.setAlpha(1);
        this.gameOver.y = targetY;

        this.menuButton.setVisible(true);
        this.menuButton.enable();
        
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