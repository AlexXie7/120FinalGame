class minigameTownSpeed extends Minigame {
    constructor(id = 'TownSpeed') {
        super(id);
    }

    preload() {
        super.preload();

        this.load.image('speedSign', './assets/minigameTownSpeed/speed-sign.png');
        this.load.spritesheet('roadSheet', './assets/minigameTownSpeed/road-sheet.png',{
            frameWidth: 256, frameHeight: 256,
            startFrame: 0, endFrame: 3
        });

        this.load.image('gasPedal', './assets/minigameTownSpeed/gas-pedal.png');
        this.load.image('speedometer', './assets/minigameTownSpeed/speedometer-ranged.png');
        this.load.image('speedometerHand', './assets/minigameTownSpeed/speedometer-hand.png');
        this.load.image('townSpeedBackground', './assets/minigameTownSpeed/background.png');
    }

    create() {
        super.create();
        this.uiScene = this.scene.get('uiScene');

        // bg
        // this.add.rectangle(0,0,game.config.width, game.config.height, 0x66BABB).setOrigin(0);
        const bg = this.add.image(0,0,'townSpeedBackground').setOrigin(0)
        bg.setScale(game.config.width / bg.width, game.config.height / bg.height);

        this.road = this.add.sprite(gameCenterX, gameCenterY, 'roadSheet', 0);
        this.road.setScale(game.config.height / this.road.height);

        this.road.texture.setFilter(Phaser.Textures.FilterMode.NEAREST); // works? doesnt work?

        this.anims.create({
            key: 'roadAnimation',
            frames: this.anims.generateFrameNumbers('roadSheet', { start: 0, end: 3, first: 0}),
            frameRate: 15,
            repeat: -1
        });

        this.road.anims.play('roadAnimation');

        // path for sign to move on
        this.signCurve = new QuadraticCurve(
            {x: gameCenterX + this.road.displayWidth / 2, y: gameCenterY - this.road.displayHeight * .1},
            {x: gameCenterX - this.road.displayWidth * .2, y: gameCenterY - this.road.displayHeight * .2},
            {x: this.road.x - this.road.displayWidth * .8, y: game.config.height}
        )
        const startPosition = this.signCurve.at(0);
        this.sign = this.add.image(startPosition.x, startPosition.y, 'speedSign').setOrigin(.5,1).setScale(.1 * this.road.scale);
        this.signCurveProgress = 0;

        this.gasPedal = this.add.image(20, game.config.height - 400, 'gasPedal').setScale(1.5).setOrigin(0);
        this.justDown = false;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        this.targetRotation = 0;
        const arrowPath = new Phaser.Curves.Path(this.gasPedal.getTopRight().x-40, this.gasPedal.getTopRight().y+40);
        arrowPath.quadraticBezierTo(this.gasPedal.getCenter().add({x:40,y:40}), this.gasPedal.getBottomLeft().add({x:80,y:-80}));
        this.uiScene.addArrow(arrowPath, {
            delay: 500, drawTime: 1000, lifeTime: 250, attachHand: true
        })

        this.speedometer = this.add.image(game.config.width - 200, game.config.height - 230, 'speedometer').setOrigin(.5).setScale(1.5);
        this.speedometerHand = this.add.image(this.speedometer.x, this.speedometer.y, 'speedometerHand').setOrigin(.5,.75).setScale(this.speedometer.scale);

        this.speedText = this.add.text(this.speedometer.x, this.speedometer.y - 140 * this.speedometer.scaleY, 'speed', {
            color: '#FFF',
            fontSize: '32px'
        }).setOrigin(.5,1);
        this.speed = 50;

        this.uiScene.setInstructions('Drag down pedal to accelerate');
    }

    update(time, delta) {
        const pointer = game.input.activePointer;
        // increase speed
        const alpha = game.textures.getPixelAlpha(
            (pointer.x - this.gasPedal.x) / this.gasPedal.scaleX + (this.gasPedal.width * this.gasPedal.originX), 
            (pointer.y - this.gasPedal.y) / this.gasPedal.scaleY + (this.gasPedal.height * this.gasPedal.originY), 
            'gasPedal', 0
        );
        const overPedal = (alpha > 127);

        if (pointer.isDown) {
            if (!this.justDown && overPedal) {
                this.lastPointerX = pointer.x;
                this.lastPointerY = pointer.y;
                this.justDown = true;
            }
            if (this.justDown) {
                const differenceX = pointer.x - this.lastPointerX;
                const differenceY = pointer.y - this.lastPointerY;
                let rotation = Phaser.Math.Angle.BetweenY(
                    differenceX - this.gasPedal.x, 
                    differenceY - this.gasPedal.y, 
                    0, 1
                );
                rotation = Math.max(0, Math.min(Math.PI / 6, rotation));
                // this.gasPedal.rotation = rotation;
                this.targetRotation = rotation;
                const power = this.gasPedal.rotation * 6 / Math.PI;
                this.speed += delta * power * .05;
            }
        } else {
            this.justDown = false;
            this.targetRotation = 0;
        }
        this.gasPedal.rotation -= (this.gasPedal.rotation - this.targetRotation) * delta * .01;

        this.speed -= delta * .003;

        this.road.anims.timeScale = this.speed / 65;
        this.speedText.setText(this.speed.toFixed());

        // set speedometer
        this.speedometerHand.angle = -120 + 240 * (this.speed / 160);

        // move sign
        if (this.signCurveProgress < 1) {
            this.signCurveProgress += this.speed * .0001;
            const newPosition = this.signCurve.at(this.signCurveProgress);
            this.sign.setPosition(newPosition.x, newPosition.y);
            this.sign.setScale((.1 + this.signCurveProgress * this.signCurveProgress * .4) * this.road.scale);
        } else if (this.signCurveProgress > 1) {
            this.sign.destroy();
            this.signCurveProgress = 0;
        }

        // win condition
        if (this.speed > 80 && this.speed < 105) {
            this.isPassed = true;
        } else {
            this.isPassed = false;
        }
        
    }

    onTimeout() {
        // do timeout operations ex: clear any ui stuff
    }
}