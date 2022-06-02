class minigameMoviePopcorn extends Minigame {
    constructor(id = 'MoviePopcorn') {
        super(id);
    }

    preload() {
        super.preload();
        this.load.spritesheet('popcorn', './assets/minigameMoviePopcorn/popcorn.png', {frameWidth: 60, frameHeight: 71});
        this.load.image('bucket', './assets/minigameMoviePopcorn/emptyBucket.png');
        this.load.image('bg', './assets/minigameMoviePopcorn/MovieBackground.png');
    }

    create() {
        super.create();
        this.popcorn = this.add.sprite(gameCenterX, 600, 'popcorn').setScale(5).setOrigin(.5);
        this.bucket = this.add.image(gameCenterX, 635, 'bucket').setScale(5);
        this.bg = this.add.image(0, 0, 'bg').setOrigin(0).setDepth(-2);
        this.popcornCount = 0;
        this.bucketAlpha = 1;

        this.uiScene.setInstructions('Eat Popcorn!');

        this.tween = this.tweens.add({
            targets: this.bucket,
            //ease: 'Sine.easeInOut',
            props: {
                scale: {value: 0, duration: 2500, ease: 'Sine.easeInOut'},
                angle: {from: '0', to: '1440', duration: 3000, ease: 'Sine.easeInOut'},
                // y: {value: this.bucket.y - 50, duration: 2500, ease:'Sine.easeInOut'}
            },
            //loop: 1,
            paused: true,
            onComplete: () => {
                this.finish(true);
            }
        })

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.bg.setScale(
            game.config.width / this.bg.width,
            game.config.height / this.bg.height
        );

        this.popcorn.setInteractive();
        
        this.popcorn.on('pointerdown', () => {
            if(this.popcornCount < 4){
                this.popcornCount+=1;
                this.popcorn.setFrame(this.popcornCount);
                this.bucketAlpha -= .1;
                this.bucket.setAlpha(this.bucketAlpha);
            } else {
                this.bucketAlpha = 1;
                this.bucket.setAlpha(this.bucketAlpha);
                this.bucket.setInteractive();
                this.input.setDraggable([this.bucket]); 
                this.uiScene.setInstructions('Throw Trash!');
            }
        });

        this.bucket.on('pointerup', () => {
            if(this.bucket.y + this.bucket.height <= gameCenterY * 1.5){
                this.input.setDraggable(this.bucket, false);
                this.bucket.setInteractive(false);
                this.tween.play();
            }
        });


    }

    update(time, delta) {

        // call when the minigame has a finished condition
        // this.finish(true); // true if success, false if failure

        // or simply set isPassed to true or false if the state of the minigame is a success or failure
        // this.isPassed = true;
    }

    onTimeout() {
        // do timeout operations ex: clear any ui stuff
    }
}