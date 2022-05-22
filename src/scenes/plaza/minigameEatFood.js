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
        this.load.image('noodleClump', './assets/minigameEatFood/noodle-clump.png');
        this.load.image('fork', './assets/minigameEatFood/fork.png');
        this.load.image('chopsticks', './assets/minigameEatFood/chopsticks.png');
    }

    create() {
        super.create();

        // bg
        this.add.rectangle(0,0,game.config.width, game.config.height,0x662329,1).setOrigin(0);
        
        this.scale = 1.5;

        // head stuff
        this.head = this.add.image(gameCenterX, gameCenterY - 200 * this.scale, 'head').setOrigin(.5).setScale(this.scale);
        this.jaw = this.add.image(this.head.x, this.head.y, 'jaw').setOrigin(.5).setScale(this.scale);
        
        // food/bowl stuff
        this.food = this.add.image(gameCenterX, gameCenterY + 100 * this.scale, 'noodles').setOrigin(.5).setScale(this.scale);
        this.bowl = this.add.image(this.food.x, this.food.y, 'bowl').setOrigin(.5).setScale(this.scale);
        // this.foodClump = this.add.image(gameCenterX, gameCenterY, 'noodleClump').setOrigin(.5).setScale(this.scale);
        // this.foodClump.setVisible(false);

        // utensils
        this.fork = this.add.image(gameCenterX + 230 * this.scale, gameCenterY + 50 * this.scale, 'fork').setOrigin(.5).setScale(this.scale);
        this.initDraggable(this.fork);
        
        this.activePoint;
    }

    update(time, delta) {

        // const pointer = game.input.activePointer;
        if (this.activePoint) {
            // distance of active point to mouth
            const distance = Phaser.Math.Distance.Between(this.activePoint.x, this.activePoint.y, this.head.x, this.head.y + 150 * this.scale);
            const maxDistance = 100;
            const maxJaw = 60;
            const jawOffset = this.scale * (Math.pow(Math.max(maxDistance - distance, 0) / maxDistance, .5)) * maxJaw;
            this.jaw.targetY = this.head.y + jawOffset;
        } else {
            this.jaw.targetY = this.head.y;
        }
        
        //(Math.sin(time * .02) * .5 + 1) * 

        this.jaw.y += (this.jaw.targetY - this.jaw.y) * delta * .006;

        this.fork.update(time, delta);
    }

    initDraggable(object) {
        object.startX = object.x;
        object.startY = object.y;
        object.targetX = object.startX;
        object.targetY = object.startY;
        object.setInteractive({
            draggable: true
        });
        object.on(Phaser.Input.Events.DRAG, (pointer) => {
            object.targetX = pointer.x
            object.targetY = pointer.y
            const point = object.getTopCenter();
            this.activePoint = point;
        })
        object.on(Phaser.Input.Events.DRAG_END, (pointer) => {
            object.targetX = object.startX
            object.targetY = object.startY
            this.activePoint = undefined;
        })
        object.update = (time, delta) => {
            object.x += (object.targetX - object.x) * delta * .01;
            object.y += (object.targetY - object.y) * delta * .01;
            const point = object.getTopCenter();
            if (!this.pointOnObject(point.x, point.y, this.bowl) && this.pointOnObject(point.x, point.y, this.food)) {
                if (!object.food) {
                    object.food = this.createFoodClump(point.x, point.y);
                }
            }

            if (object.food) {
                object.food.x = point.x;
                object.food.y = point.y;
            }
            
        }
    }

    createFoodClump(x, y) {
        const clump = this.add.image(x, y, 'noodleClump').setOrigin(.5).setScale(this.scale);
        return clump;
    }

    // minAlpha if set should be ranged between 0 and 255
    // does not account for rotation
    pointOnObject(x, y, object, minAlpha = 127) {
        const tl = object.getTopLeft();
        const relX = (x - tl.x) / object.displayWidth;
        const relY = (y - tl.y) / object.displayHeight;
        const alpha = game.textures.getPixelAlpha(
            relX * object.width,
            relY * object.height,
            object.texture.key, 0
        );
        return alpha >= minAlpha;
    }
}