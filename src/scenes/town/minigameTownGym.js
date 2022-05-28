class minigameTownGym extends Minigame {
    constructor(id = 'TownGym') {
        super(id);
    }

    preload() {
        super.preload();

        // weight

        this.load.image('arm1','./assets/minigameTownGym/arm1.png');
        this.load.image('arm2','./assets/minigameTownGym/arm2-weight.png');
    }

    create() {
        super.create();
        
        this.uiScene.setInstructions('Lift! Click fast!');
        this.timerScale = 1.5;

        this.add.rectangle(0,0,game.config.width, game.config.height, 0x005858).setOrigin(0);

        this.scale = 2;
        const shoulderPosition = new Phaser.Math.Vector2(0, gameCenterY * 1.2);
        this.arm2 = this.add.image(0,0, 'arm2').setOrigin(.1,.5).setScale(this.scale);
        this.arm1 = this.add.image(shoulderPosition.x, shoulderPosition.y, 'arm1').setOrigin(0,.5).setScale(this.scale);
        this.arm2.setPosition(this.arm1.getRightCenter().x - 20 * this.scale, this.arm1.getRightCenter().y + 10 * this.scale);

        // this.clicked = false;

        this.power = 0;
        this.angle = 0;
        this.helper = 0;

        this.reps = 0;
        this.repped = false;
        this.repText = this.add.text(gameCenterX, gameCenterY + 200, '0 / 3',{fontSize: '64px', stroke: '#000', strokeThickness: 6}).setOrigin(.5);

        this.input.on('pointerdown', (pointer) => {
            this.helper = 1;
            this.power = Math.min(1, this.power + .08);

            if (this.power >= .8) {
                if (!this.repped) {
                    this.reps += 1;
                    this.repText.setText(`${this.reps} / 3`);
                    this.uiScene.createText(this.arm2.x, this.arm2.y, `${this.reps} - Good job!`);
                    this.repped = true;
                    if (this.reps >= 3) {
                        this.finish(true);
                    }
                } else {
                    this.uiScene.createText(this.arm2.x, this.arm2.y, 'Release first!');
                }
                
            }
        })
    }

    update(time, delta) {
        // this.arm2.setAngle((Math.sin(time * .01) * .5 + .5) * -90);
        // console.log(this.power);
        this.angle += (this.power - this.angle) * delta * .01;
        
        this.arm2.setAngle(this.angle * -90);

        if (this.helper > 0) {
            this.helper -= delta * .0005;
        } else {
            this.helper = 0;
        }

        if (this.power > 0) {
            this.power -= (1 - this.helper) * delta * .005;
        } else {
            this.power = 0;
        }
        
        if (this.power < .2) {
            if (this.repped) {
                this.uiScene.createText(this.arm2.x, this.arm2.y, 'Ready!');
                this.repped = false;
            }
        }
    }

}