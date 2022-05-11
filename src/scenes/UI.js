class UI extends Phaser.Scene {
    constructor() {
        super('uiScene');
    }

    preload() {
        this.load.image('signBad', './assets/sign-bad.png');
        this.load.image('signGood', './assets/sign-good.png');
    }

    create() {
        this.add.text(gameCenterX,gameCenterY,'ui scene', {color: 'black'});

        console.log('ui created');
        this.activeSigns = [];
    }

    update(time, delta) {


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

    clearSigns() {
        for (let i = 0; i < this.activeSigns.length; i++) {
            const sign = this.activeSigns[i];
            sign.destroy();
            sign.isDestroyed = true;
        }
    }

    createSign(x, y, key) {
        const sign = this.add.image(x, y, key).setOrigin(.5);

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