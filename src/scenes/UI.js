class UI extends Phaser.Scene {
    constructor() {
        super('uiScene');
    }

    preload() {
        this.load.image('signBad', './assets/sign-bad.png');
        this.load.image('signGood', './assets/sign-good.png');
        this.load.image('plazaDoor', './assets/plaza-door.png');
        this.load.image('finishSuccess', './assets/success.png');
        this.load.image('finishFailure', './assets/failure.png');
    }

    create() {
        console.log('ui created');

        this.plazaDoors = [
            this.add.image(0,0,'plazaDoor').setOrigin(0),
            this.add.image(game.config.width,0,'plazaDoor').setOrigin(1,0).setFlipX(true)
        ];
        for (let i = 0; i < this.plazaDoors.length; i++) {
            const door = this.plazaDoors[i];
            door.closedScaleX = gameCenterX / door.width;
            door.setScale(0, game.config.height / door.height); // open by default

            door.lifeTime = 500;
            door.timer = 0;
            door.isFinished = true;

            door.open = (dur = door.lifeTime) => {
                door.lifeTime = dur;
                door.timer = 0;
                door.startScaleX = door.closedScaleX;
                door.endScaleX = 0;
                door.isFinished = false;
            }

            door.close = (dur = door.lifeTime) => {
                door.lifeTime = dur;
                door.timer = 0;
                door.startScaleX = 0;
                door.endScaleX = door.closedScaleX;
                door.isFinished = false;
            }

            door.update = (time, delta) => {
                if (door.isFinished) {
                    return;
                }
                
                let progress = door.timer / door.lifeTime;
                if (progress >= 1) {
                    door.isFinished = true;
                    if (i === 0) {
                        eventEmitter.emit('doorFinished');
                    }
                    progress = 1;
                }
                
                door.setScale(smoothstep(progress, door.startScaleX, door.endScaleX), door.scaleY);
                
                door.timer += delta;
            }
        }

        // this.add.text(gameCenterX,gameCenterY,'ui scene', {color: 'black'});

        
        this.activeSigns = [];

        const instructionsConfig = {
            fontSize: '64px',
            stroke: '#000',
            strokeThickness: 4
        }
        this.instructions = this.add.text(gameCenterX, 0, 'Instructions', instructionsConfig).setOrigin(.5,0);
        this.instructions.setVisible(false);

        this.finishSuccess = this.add.image(gameCenterX, gameCenterY, 'finishSuccess').setOrigin(.5).setVisible(false);
        this.finishSuccess.show = () => {
            this.finishSuccess.setVisible(true);
        }
        this.finishSuccess.update = (time, delta) => {

        }
        this.finishFailure = this.add.image(gameCenterX, gameCenterY, 'finishFailure').setOrigin(.5).setVisible(false);
        this.finishFailure.show = (dur = 500) => {
            this.finishFailure.setVisible(true);
            this.finishFailure.setScale(10);
            this.finishFailure.lifeTime = dur;
            this.finishFailure.timer = 0;
            this.finishFailure.isFinished = false;
        }
        this.finishFailure.update = (time, delta) => {
            if (this.finishFailure.visible && !this.finishFailure.isFinished) {
                let progress = this.finishFailure.timer / this.finishFailure.lifeTime;
                if (progress > 1) {
                    progress = 1;
                    this.finishFailure.isFinished = true;
                }
                let shakeAmount =  Math.sin(time) * 50 * (1 - progress);
                this.finishFailure.setPosition(gameCenterX + shakeAmount, gameCenterY + shakeAmount);
                this.finishFailure.setScale(1 + (1 - progress * progress) * 9) 
                this.finishFailure.timer += delta;
            }
        }
    }

    update(time, delta) {

        this.finishSuccess.update(time, delta);
        this.finishFailure.update(time, delta);

        for (const door of this.plazaDoors) {
            door.update(time, delta);
        }


        for (let i = 0; i < this.activeSigns.length; i++) {
            const sign = this.activeSigns[i];
            if (sign.isDestroyed) {
                this.activeSigns.splice(i, 1);
                i -= 1;
            } else {
                sign.update(time, delta);
            }
        }
    }

    openDoor(variant, duration) {
        return new Promise((resolve, reject) => {
            for (const door of this.plazaDoors) {
                door.open(duration);
            }
            eventEmitter.addListener('doorFinished', () => {resolve()})
        })
    }

    closeDoor(variant, duration) {
        return new Promise((resolve, reject) => {
            for (const door of this.plazaDoors) {
                door.close(duration);
            }
            eventEmitter.addListener('doorFinished', () => {resolve()})
        })
    }

    setInstructions(text) {
        this.instructions.setText(text);
    }

    minigameStart() {
        this.instructions.setVisible(true);
        // this.openDoor();
    }

    minigameEnd(result) {
        this.instructions.setVisible(false);

        if (result) {
            this.finishSuccess.show();
        } else {
            this.finishFailure.show();
        }

        // this.closeDoor();
    }

    // temporary signs
    clearSigns() {
        for (let i = 0; i < this.activeSigns.length; i++) {
            const sign = this.activeSigns[i];
            sign.destroy();
            sign.isDestroyed = true;
        }
    }

    createText(x, y, text, config = {}) {
        const sign = this.add.text(x, y, text, config).setOrigin(.5);
        this.activeSigns.push(sign);
    }

    createSign(x, y, key) {
        const sign = this.add.image(x, y, key).setOrigin(.5);
        sign.angle = Math.random() * 50 - 25;

        let lifeTime = 1000;
        let timer = 0;

        sign.update = (time, delta) => {
            
            if (sign.isDestroyed) {
                return;
            }

            let progress = timer / lifeTime;

            sign.y = y - progress * 20;
            if (progress > .5) {
                sign.setAlpha((.5 - (progress - .5)) * 2);
            }

            if (progress >= 1) {
                sign.destroy();
                sign.isDestroyed = true;
            }

            timer += delta;
        };

        this.activeSigns.push(sign);
    }

    createSuccess(x, y) {
        this.createSign(x, y, 'signGood');
    }

    createFailure(x, y) {
        this.createSign(x, y, 'signBad');
    }
}


function smoothstep(x, start, end) {
    let flip =false;
    if (start > end) {
        let temp = end;
        end = start;
        start = temp;
        flip = true;
    }

    if (x < 0) return start;
    if (x > 1) return end;

    let y = (1-x) * (x*x) + x * (-(1-x) * (1-x) + 1);
    return (flip ? (1 - y) : y) * (end - start);
}