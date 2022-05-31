class minigameTutorial extends Minigame {
    constructor(id = 'Tutorial') {
        super(id);
    }

    preload() {
        super.preload();

        this.load.image('tutorialBackground', './assets/tutorial/background.jpg');
        this.load.image('window', './assets/tutorial/window.png');
        this.load.image('stamp', './assets/tutorial/stamp.png');
        this.load.spritesheet('paper', './assets/tutorial/paper.png', {frameWidth: 220, frameHeight: 288});
        this.load.image('paperFlat', './assets/tutorial/paper-flat.png');

        this.load.audio('paper', './assets/tutorial/paper.wav');
        this.load.audio('stamp', './assets/tutorial/stamp.wav');
        this.load.audio('paperFlat','./assets/tutorial/paper-flat.wav');
        // this.load.audio('crowd', './assets/tutorial/crowd.wav');
        this.load.audio('plane', './assets/tutorial/plane.wav');

        // cutscene
        this.load.image('airportBackground', './assets/tutorial/airport-background.jpg');
        this.load.image('airportInside', './assets/tutorial/airport-inside.png');
        this.load.image('plane', './assets/tutorial/plane.png');
    }

    create() {
        super.create();

        this.uiScene.setInstructions('Get on board');

        this.state = 'start';

        // background
        // this.add.rectangle(0,0,game.config.width, game.config.height, 0xFFE74F).setOrigin(0);
        this.add.image(0,0,'tutorialBackground').setOrigin(0).setDisplaySize(game.config.width, game.config.height);
        this.add.image(0,0,'window').setOrigin(0).setDisplaySize(game.config.width, game.config.height).setDepth(1);

        this.paper = this.add.image(game.config.width - 140, game.config.height - 240,'paper',0).setOrigin(.5).setDepth(2);
        this.paperFlat = this.add.image(this.paper.x, this.paper.y,'paperFlat').setOrigin(.5).setDepth(0).setAlpha(0);
        this.initDraggable(this.paper);

        this.targetPoint = new Phaser.Math.Vector2(450, 540);

        const path = new Phaser.Curves.Path(this.paper.x, this.paper.y);
        path.lineTo(this.targetPoint);
        this.uiScene.addArrow(path, {attachHand: true});

        this.stamp = this.add.image(gameCenterX, gameCenterY, 'stamp').setOrigin(.5,1).setDepth(0);
        this.initFollow(this.stamp);

        // cutscene stuff
        this.timer = 0;
        this.duration = 0;

        this.background = this.add.image(gameCenterX, gameCenterY, 'airportBackground').setOrigin(.5).setDepth(4).setVisible(false);
        this.background.setScale(game.config.width / this.background.width);
        this.plane = this.add.image(game.config.width, this.background.getBottomRight().y, 'plane').setOrigin(0).setDepth(4).setVisible(false);
        this.plane.dir = new Phaser.Math.Vector2(-this.plane.x, 100-this.plane.y).normalize();
        this.plane.update = (time, delta) => {
            if (!this.plane.isEnabled) {
                return;
            }
            const dir = this.plane.dir;
            this.plane.x += dir.x * delta * .3;
            this.plane.y += dir.y * delta * .3;
        }
        this.foreground = this.add.image(this.background.x, this.background.y, 'airportInside').setOrigin(.5).setDepth(4).setVisible(false);
        this.foreground.setScale(game.config.width / this.foreground.width);

        // overlay
        this.overlay = this.add.rectangle(0,0,game.config.width, game.config.height, 0).setOrigin(0).setDepth(5).setAlpha(0);

        // letterbox for cutscene
        this.letterBoxTop = this.add.rectangle(0,0,game.config.width, this.background.getTopLeft().y, 0)
            .setOrigin(0).setDepth(5).setVisible(false);
        this.letterBoxBottom = this.add.rectangle(0,this.background.getBottomLeft().y,game.config.width, game.config.height, 0)
            .setOrigin(0).setDepth(5).setVisible(false);

        // this.crowdSound = this.sound.add('crowd');

        // keep cutscene things playing on finish
        this.pauseOnFinish = false;
    }

    update(time, delta) {

        switch (this.state) {
            case 'cutscene0': {
                this.timer = 0;
                this.duration = 1000;
                this.state = 'cutscene1';
                this.uiScene.setInstructions('');
                break;
            }
            case 'cutscene1': {
                // fade to black and load cutscene
                let progress = this.timer / this.duration;
                if (progress >= 1) {
                    progress = 1;
                    this.timer = 0;
                    this.duration = 1000;

                    // black background
                    this.add.rectangle(0,0,game.config.width, game.config.height, 0, 1).setOrigin(0).setDepth(3);
                    this.background.setVisible(true);
                    this.plane.setVisible(true);
                    this.plane.isEnabled = true;
                    this.sound.play('plane', {volume: 1});
                    this.foreground.setVisible(true);
                    this.letterBoxBottom.setVisible(true);
                    this.letterBoxTop.setVisible(true);

                    // this.crowdSound.play({loop: true});
                    // this.crowdSound.setVolume(0);

                    this.state = 'cutscene2';
                }
                this.overlay.setAlpha(progress);
                break;
            }
            case 'cutscene2': {
                // unfade to cutscene
                let progress = this.timer / this.duration;
                if (progress >= 1) {
                    progress = 1;
                    this.timer = 0;
                    this.duration = 2000;
                    this.state = 'cutscene3'
                }
                this.plane.update(time, delta);
                this.overlay.setAlpha(1 - progress);
                // this.crowdSound.setVolume(progress * .5);
                break;
            }
            case 'cutscene3': {
                // wait then succeed
                let progress = this.timer / this.duration;
                if (progress >= 1) {
                    progress = 1;
                    this.finish(true);
                    this.state = 'cutscene4';
                    // this.sound.stopAll();
                }
                this.plane.update(time, delta);
                break;
            }
            case 'cutscene4': {
                // continue cutscene animations
                this.plane.update(time, delta);
                break;
            }
            default: {
                this.paper.update(time, delta);
                this.stamp.update(time, delta);
            }
        }
        this.timer += delta;
    }

    // override finish
    finish() {
        super.finish(true);
        eventEmitter.emit('tutorialFinished');
    }

    initFollow(object) {
        object.startX = object.x;
        object.startY = object.y;
        object.targetX = object.startX;
        object.targetY = object.startY;
        object.state = 'idle';
        object.update = (time, delta) => {
            object.x += (object.targetX - object.x) * delta * .02;
            object.y += (object.targetY - object.y) * delta * .02;

            // if (object.state === '') {

            // }
        }
        object.setTargetPosition = async (x, y) => {
            object.targetX = x;
            object.targetY = y;

            await new Promise((resolve, reject) => {
                let interval = setInterval(() => {
                    if (Phaser.Math.Distance.Between(object.x, object.y, object.targetX, object.targetY) < .1) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });

            return object;
        }
    }

    initDraggable(object) {
        object.startX = object.x;
        object.startY = object.y;
        object.targetX = object.startX;
        object.targetY = object.startY;
        object.targetScale = object.scale;
        object.state = 'start';
        object.onTarget = false;
        object.setInteractive({
            draggable: true
        });
        object.on(Phaser.Input.Events.DRAG_START, (pointer) => {
            if (object.state !== 'start') {
                return;
            }
            this.sound.play('paper', {volume: 1});
        });
        object.on(Phaser.Input.Events.DRAG, (pointer) => {
            if (object.state !== 'start') {
                return;
            }
            object.targetX = pointer.x
            object.targetY = pointer.y
            object.clearTint();
        })
        object.on(Phaser.Input.Events.DRAG_END, async (pointer) => {
            if (object.state !== 'start') {
                return;
            }
            if (object.onTarget) {
                object.targetX = this.targetPoint.x;
                object.targetY = this.targetPoint.y;
                // gave paper once
                this.sound.play('paperFlat', {volume: 1});
                object.state = 'give';
                await this.stamp.setTargetPosition(this.paper.targetX + 50, this.paper.targetY - 200);
                // stamp pos
                await this.stamp.setTargetPosition(this.paper.targetX + 50, this.paper.targetY - 40);
                // on stamp pos
                this.sound.play('stamp', {volume: 2});
                this.uiScene.createSuccess(this.stamp.x, this.stamp.y);
                await this.stamp.setTargetPosition(this.paper.targetX + 50, this.paper.targetY - 200);
                object.setFrame(1);
                object.state = 'return';
                object.targetX = gameCenterX;
                object.targetY = gameCenterY;
                object.targetScale = 2;
                new Timer().start(1000, () => {
                    this.state = 'cutscene0';
                });
            } else {
                object.targetX = object.startX
                object.targetY = object.startY
            }
        })
        object.on(Phaser.Input.Events.POINTER_OVER, () => {
            if (object.state !== 'start') {
                return;
            }
            object.setTintFill(0xFFFFFF);
        })
        object.on(Phaser.Input.Events.POINTER_OUT, () => {
            if (object.state !== 'start') {
                return;
            }
            object.clearTint();
        })
        object.update = (time, delta) => {
            object.x += (object.targetX - object.x) * delta * .02;
            object.y += (object.targetY - object.y) * delta * .02;
            object.setScale(object.scale + (object.targetScale - object.scale) * delta * .02);

            this.paperFlat.setPosition(this.paper.x, this.paper.y);

            if (this.paper.state === 'start') {
                const distance = Phaser.Math.Distance.Between(this.paper.x, this.paper.y, this.targetPoint.x, this.targetPoint.y);
                if (distance < 200) {
                    this.paper.setAlpha(0);
                    this.paperFlat.setAlpha(1);
                    this.paper.onTarget = true;
                } else {
                    this.paper.setAlpha(1);
                    this.paperFlat.setAlpha(0);
                    this.paper.onTarget = false;
                }
            } else if (this.paper.state === 'give') {
                this.paper.setAlpha(0);
                this.paperFlat.setAlpha(1);
            } else if (this.paper.state === 'return') {
                this.paper.setAlpha(1);
                this.paperFlat.setAlpha(0);
            }
        }
    }
}