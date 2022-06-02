class minigameGiveWater extends Minigame {
    constructor(id = 'GiveWater') {
        super(id);
    }

    preload() {
        super.preload();
        this.load.image('bg', './assets/minigameGiveWater/fieldBackground.png');
        this.load.image('water', './assets/minigameGiveWater/bottle.png');
        this.load.image('towel', './assets/minigameGiveWater/towel.png');
        this.load.image('waterbox', './assets/minigameGiveWater/waterbox.png');
        this.load.image('towelbox', './assets/minigameGiveWater/towelbox.png');
        this.load.image('blueHand', './assets/minigameGiveWater/blueHand.png');
        this.load.image('redHand', './assets/minigameGiveWater/redHand.png');
    }

    create() {
        super.create();
        
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.hands = [];
        this.tween = [];
        this.towelBox = this.add.sprite(gameCenterX*.25, gameCenterY*1.75, 'towelbox');
        this.waterBox = this.add.sprite(gameCenterX*1.75,gameCenterY*1.75, 'waterbox');

        this.bg = this.add.image(0, 0, 'bg').setOrigin(0).setDepth(-2);
        this.bg.setScale(
            game.config.width / this.bg.width,
            game.config.height / this.bg.height
        );

        this.handsCleared = 0;
        

        var handType = '';

        for(let n = 1; n <= 7; n++){
            var randHand = Math.random();

            if (randHand < .5){
                handType = 'redHand';
            } else {
                handType = 'blueHand';
            }

            this.hands.push(this.add.sprite(game.config.width/8 * (n), 100, handType).setAngle(-40 + 10*n).setInteractive());

            this.tween.push(this.tweens.add({
                targets: this.hands[n-1],
                // x: (this.hands[n-1].x - this.hands[n-1].width ) * Math.cos(-40 + 10*n),
                y: (-this.hands[n-1].height), 
                paused: true,
                duration: 1000,
            }));
        }

        this.towel = this.add.sprite(this.towelBox.x, this.towelBox.y, 'towel').setScale(2);
        this.water = this.add.sprite(this.waterBox.x, this.waterBox.y, 'water').setScale(4);

        this.towel.setInteractive();
        this.water.setInteractive();

        this.input.setDraggable([this.towel, this.water]);

        this.towel.on('pointerup', () => {

            for(var i in this.hands){
                console.log(this.hands[i]);
                if(this.checkCollision(this.hands[i], this.towel) && this.hands[i].texture.key == 'redHand'){
                    console.log(this.tween[i]);
                    this.tween[i].play();
                    this.handsCleared += 1;
                }
            }

            this.towel.x = this.towelBox.x;
            this.towel.y = this.towelBox.y;
        });
        
        this.water.on('pointerup', () => {
            for(var i in this.hands){
                console.log(this.hands[i]);
                if(this.checkCollision(this.hands[i], this.water) && this.hands[i].texture.key == 'blueHand'){
                    console.log(this.tween[i]);
                    this.tween[i].play();
                    this.handsCleared += 1;
                }
            }

            this.water.x = this.waterBox.x;
            this.water.y = this.waterBox.y;
        });

    }

    update() {
        // call when the minigame has a finished condition
        if (this.handsCleared >= 7){
            this.finish(true); 
        }


        // or simply set isPassed to true or false if the state of the minigame is a success or failure
        //this.isPassed = true;
    }

    onTimeout() {
        // do timeout operations ex: clear any ui stuff
    }

    checkCollision(sprite1, sprite2) {
        // simple AABB checking

        if (sprite1.x < sprite2.x + sprite2.width && 
            sprite1.x + sprite1.width > sprite2.x && 
            sprite1.y < sprite2.y + sprite2.height &&
            sprite1.height + sprite1.y > sprite2. y) {
                console.log('true collision');
                return true;
        } else {
            console.log('false collision');
            return false;
        }
    }
}