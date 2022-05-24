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
        this.mouthPoint = new Phaser.Math.Vector2(this.head.x, this.head.y + 140 * this.scale);
        
        // food/bowl stuff
        this.food = this.add.image(gameCenterX, gameCenterY + 100 * this.scale, 'noodles').setOrigin(.5).setScale(this.scale);
        this.bowl = this.add.image(this.food.x, this.food.y, 'bowl').setOrigin(.5).setScale(this.scale);
        // this.foodClump = this.add.image(gameCenterX, gameCenterY, 'noodleClump').setOrigin(.5).setScale(this.scale);
        // this.foodClump.setVisible(false);

        // utensils
        this.fork = this.add.image(gameCenterX + 230 * this.scale, gameCenterY + 50 * this.scale, 'fork').setOrigin(.5).setScale(this.scale);
        this.initDraggable(this.fork);
        this.fork.isCorrect = true;
        this.chopsticks = this.add.image(gameCenterX - 230 * this.scale, gameCenterY + 50 * this.scale, 'chopsticks').setOrigin(.5).setScale(this.scale);
        this.initDraggable(this.chopsticks);
        this.chopsticks.isCorrect = false;

        this.uiScene.addPointArrow(this.fork.getCenter().x, this.fork.getCenter().y, 100, 220);
        this.uiScene.addPointArrow(this.chopsticks.getCenter().x, this.chopsticks.getCenter().y, 100, 220);
        
        this.activePoint;
        this.eatTimer = 0;

        this.uiScene.setInstructions('Eat food with utensils');

        this.score = 0;
    }

    update(time, delta) {

        // const pointer = game.input.activePointer;
        let overrideEat = false;
        let jawOffset = 0;
        const maxJaw = 60;
        if (this.activePoint) {
            // distance of active point to mouth
            const distance = Phaser.Math.Distance.Between(this.activePoint.x, this.activePoint.y, this.mouthPoint.x, this.mouthPoint.y);
            const maxDistance = 100;
            jawOffset = this.scale * (Math.pow(Math.max(maxDistance - distance, 0) / maxDistance, .5)) * maxJaw;
        } else {
            jawOffset = 0;
        }

        if (this.eatTimer > 0) {
            const eatOffset = (Math.sin(time * .02)) * maxJaw * this.scale;
            jawOffset = Math.max(jawOffset, eatOffset);
            this.eatTimer -= delta;
        }
        this.jaw.targetY = this.head.y + jawOffset;
        

        this.jaw.y += (this.jaw.targetY - this.jaw.y) * delta * .01;

        this.fork.update(time, delta);
        this.chopsticks.update(time, delta);
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
            object.clearTint();
        })
        object.on(Phaser.Input.Events.DRAG_END, (pointer) => {
            object.targetX = object.startX
            object.targetY = object.startY
            this.activePoint = undefined;
        })
        object.on(Phaser.Input.Events.POINTER_OVER, () => {
            object.setTintFill(0xFFFFFF);
        })
        object.on(Phaser.Input.Events.POINTER_OUT, () => {
            object.clearTint();
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
                // const distance = Phaser.Math.Distance.Between(object.food.x, object.food.y, this.mouthPoint.x, this.mouthPoint.y);
                const distanceX = Math.abs(object.food.x - this.mouthPoint.x);
                const distanceY = Math.abs(object.food.y - this.mouthPoint.y);
                if (distanceX < 40 * this.scale && distanceY < 15 * this.scale) {
                    object.food.consume();
                    this.eatTimer = 2000;
                    object.food = undefined;

                    if (object.isCorrect) {
                        this.score += 1;
                        if (this.score >= 3) {
                            this.finish(true); // consider finish early?
                        }
                    } else {
                        // consider not subtracting score
                        // this.score -= 1;
                        this.uiScene.createFailure(this.mouthPoint.x, this.mouthPoint.y);
                    }
                }
            }
            
        }
    }

    createFoodClump(x, y) {
        const clump = this.add.image(x, y, 'noodleClump').setOrigin(.5).setScale(this.scale);
        clump.isFree = false;
        // to add: array of clumps to update in create, destroying, etc
        clump.update = (time, delta) => {
            // clump will fall when utensil returned
            // clump has trailing food (like noodle) probably drawn with graphics and chain physics?
        }
        clump.consume = () => {
            clump.destroy();
            clump.isDestroyed = true;
        }
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