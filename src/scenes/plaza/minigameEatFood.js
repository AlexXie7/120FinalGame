class minigameEatFood extends Minigame {
    constructor(id = 'EatFood') {
        super(id);
    }

    preload() {
        super.preload();


        this.load.image('head', './assets/minigameEatFood/head.png');
        this.load.image('jaw', './assets/minigameEatFood/jaw.png');
        this.load.image('bowl', './assets/minigameEatFood/bowl.png');
        this.load.image('noodles', './assets/minigameEatFood/noodles.png');
        this.load.image('fork', './assets/minigameEatFood/fork.png');
        this.load.image('chopsticks', './assets/minigameEatFood/chopsticks.png');
    }

    create() {
        super.create();

        // bg
        this.add.rectangle(0,0,game.config.width, game.config.height,0x662329,1).setOrigin(0);
        
        this.scale = 1.5;

        // head stuff
        this.head = this.add.image(gameCenterX, gameCenterY - 300 * this.scale, 'head').setOrigin(.5).setScale(this.scale);
        this.jaw = this.add.image(this.head.x, this.head.y, 'jaw').setOrigin(.5).setScale(this.scale);
        
        // food/bowl stuff
        this.food = this.add.image(gameCenterX, gameCenterY, 'noodles').setOrigin(.5).setScale(this.scale);
        this.bowl = this.add.image(this.food.x, this.food.y, 'bowl').setOrigin(.5).setScale(this.scale);

        // utensils
        this.fork = this.add.image(gameCenterX + 230 * this.scale, gameCenterY + 50 * this.scale, 'fork').setOrigin(.5).setScale(this.scale);
        this.fork.startX = this.fork.x;
        this.fork.startY = this.fork.y;
        this.fork.targetX = this.fork.startX;
        this.fork.targetY = this.fork.startY;
        this.fork.setInteractive({
            draggable: true
        });
        // this.fork.setDraggable = true;
        this.fork.on(Phaser.Input.Events.DRAG, (pointer) => {
            this.fork.targetX = pointer.x
            this.fork.targetY = pointer.y
        })
        this.fork.on(Phaser.Input.Events.DRAG_END, (pointer) => {
            this.fork.targetX = this.fork.startX
            this.fork.targetY = this.fork.startY
        })
    }

    update(time, delta) {

        const pointer = game.input.activePointer;

        const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.head.x, this.head.y + 150 * this.scale);
        //(Math.sin(time * .02) * .5 + 1) * 

        const maxDistance = 100;
        const maxJaw = 60;
        const jawOffset = this.scale * (Math.pow(Math.max(maxDistance - distance, 0) / maxDistance, .5)) * maxJaw;
        const targetJawY = this.head.y + jawOffset

        this.jaw.y += (targetJawY - this.jaw.y) * delta * .006;

        this.fork.x += (this.fork.targetX - this.fork.x) * delta * .01;
        this.fork.y += (this.fork.targetY - this.fork.y) * delta * .01;

        // // call when the minigame has a finished condition
        // this.finish(true); // true if success, false if failure

        // // or simply set isPassed to true or false if the state of the minigame is a success or failure
        // this.isPassed = true;
    }

    onTimeout() {
        // do timeout operations ex: clear any ui stuff
    }


}