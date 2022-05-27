class minigameTownGym extends Minigame {
    constructor(id = 'TownGym') {
        super(id);
    }

    preload() {
        super.preload();

        // weight

        this.load.image('arm1','./assets/minigameTownGym/arm1.png');
        this.load.image('arm2','./assets/minigameTownGym/arm2.png');
    }

    create() {
        super.create();
        
        this.scale = 2;
        const shoulderPosition = new Phaser.Math.Vector2(0, gameCenterY * 1.2);
        this.arm2 = this.add.image(0,0, 'arm2').setOrigin(.1,.5).setScale(this.scale);
        this.arm1 = this.add.image(shoulderPosition.x, shoulderPosition.y, 'arm1').setOrigin(0,.5).setScale(this.scale);
        this.arm2.setPosition(this.arm1.getRightCenter().x - 20 * this.scale, this.arm1.getRightCenter().y + 10 * this.scale);

    }

    update(time, delta) {
        this.arm2.setAngle((Math.sin(time * .01) * .5 + .5) * -90)
    }

}