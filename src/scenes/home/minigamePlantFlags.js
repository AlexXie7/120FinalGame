class minigamePlantFlags extends Minigame {
    constructor(id = 'PlantFlags') {
        super(id);
    }

    preload() {
        super.preload();

        this.load.image('house','./assets/minigamePlantFlags/house.png');
        // this.load.image('plantFlagBackground','./assets/minigameTownSpeed/background.png');
        this.mload('image','background','./assets/minigameTownSpeed/background.png');
        this.load.image('plantFlag','./assets/minigamePlantFlags/plant-flag.png');
    }

    create() {
        super.create();
        
        this.uiScene.setInstructions('Drag and plant flags!');
        // this.timerScale = 1;

        // background
        // this.add.rectangle(0,0,game.config.width, game.config.height, 0xEECCFF).setOrigin(0);
        this.add.image(0,0,this.mkey('background')).setOrigin(0).setDisplaySize(game.config.width, game.config.height);

        // grass?
        this.add.rectangle(0,gameCenterY,game.config.width, game.config.height, 0x3C5B13).setOrigin(0);

        // plant area?
        this.add.rectangle(0,gameCenterY + 200,game.config.width, game.config.height, 0x618913).setOrigin(0);

        // score
        this.plantCount = 0;
        this.plantTarget = 5;
        this.plantedText = this.add.text(gameCenterX, gameCenterY + 250, `PLANTED: 0 / ${this.plantTarget}`, {
            fontSize: '64px',
            fontFamily: 'sans-serif',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(.5,0);

        this.houses = [];

        this.houseIndex = 0;
        this.currentHouse;

        for (let i = 0; i < 3; i++) {
            this.createHouse();
        }
        this.nextHouse();


        this.flagSpawn = new Phaser.Math.Vector2(gameCenterX + 400,gameCenterY - 100);

        this.bubbles = [];
        this.possibleReplies = ['God bless!', 'Thank you!', 'Freedom!', 'Beautiful!'];

        // this.createFlag(this.flagSpawn.x, this.flagSpawn.y)
    }

    update(time, delta) {

        for (let i = 0; i < this.houses.length; i++) {
            const house = this.houses[i];

            if (house.flag) {
                house.flag.update(time, delta);
            }

            if (this.isMoving) {
                if (this.currentHouse.x <= gameCenterX) {
                    this.isMoving = false;
                    this.onMovingFinished();
                } else {
                    house.x += this.moveSpeed * delta;
                }
            }

            if (house.getTopRight().x <= -400) {
                this.houses.splice(i, 1);
                i -= 1;
                house.destroy();
                if (house.flag) {
                    house.flag.destroy();
                }

                this.houseIndex -= 1;
                // console.log('house destroyed');
            }

        }

        if (this.activeFlag) {
            this.activeFlag.update(time, delta);
        }

        for (let i = 0; i < this.bubbles.length; i++) {
            const bubble = this.bubbles[i];
            if (bubble.isDestroyed) {
                this.bubbles.splice(i, 1);
                i -= 1;
            } else {
                bubble.update(time, delta);
            }
        }
    }

    onMovingFinished() {
        this.createFlag(this.flagSpawn.x, this.flagSpawn.y - 200);
    }

    onPlant() {
        this.plantCount += 1;
        this.plantedText.setText(`PLANTED: ${this.plantCount} / ${this.plantTarget}`);

        if (this.plantCount >= this.plantTarget) {
            this.finish(true);
            return;
        }
        
        const house = this.currentHouse;
        const text = this.possibleReplies[Math.floor(Math.random() * this.possibleReplies.length)];
        const bubble = new Bubble(this, house.x, house.y, text, {reference: house});
        this.bubbles.push(bubble);

        this.createHouse();
        this.nextHouse();
    }

    nextHouse() {
        this.isMoving = true;
        this.moveSpeed = -1;

        if (!this.currentHouse) {
            this.currentHouse = this.houses[0];
        } else {
            this.houseIndex += 1;
            this.currentHouse = this.houses[this.houseIndex];
        }
    }

    createHouse() {
        let x = 0;
        if (this.houses.length > 0) {
            x = this.houses[this.houses.length - 1].x + 400;
        } else {
            x = game.config.width + 200;
        }
        
        const house = this.add.image(x, gameCenterY, 'house').setOrigin(.5);
        

        this.houses.push(house);
    }

    createFlag(x, y) {
        const flag = this.add.image(x, y, 'plantFlag').setOrigin(.5);
        this.initDraggable(flag);
        this.activeFlag = flag;
        return flag;
    }

    initDraggable(object) {
        object.startX = object.x;
        object.startY = object.y;
        object.targetX = object.startX;
        object.targetY = object.startY;
        object.setInteractive({
            draggable: true
        });

        object.isPlanted = false;
        object.house;
        object.houseOffsetX = 0;

        object.on(Phaser.Input.Events.DRAG, (pointer) => {
            if (object.isPlanted) {
                return;
            }
            // if (this.isMoving) {
            //     return;
            // }
            object.targetX = pointer.x
            object.targetY = pointer.y
            const point = object.getTopCenter();
            this.activePoint = point;
            object.clearTint();
        })
        object.on(Phaser.Input.Events.DRAG_END, (pointer) => {
            if (object.isPlanted) {
                return;
            }
            object.targetX = object.startX
            object.targetY = object.startY
            this.activePoint = undefined;
        })
        object.on(Phaser.Input.Events.POINTER_OVER, () => {
            if (object.isPlanted) {
                return;
            }
            object.setTintFill(0xFFFFFF);
        })
        object.on(Phaser.Input.Events.POINTER_OUT, () => {
            if (object.isPlanted) {
                return;
            }
            object.clearTint();
        })
        object.update = (time, delta) => {
            if (object.isPlanted) {
                object.x = object.house.x - object.houseOffsetX;
                return;
            }

            object.x += (object.targetX - object.x) * delta * .01;
            object.y += (object.targetY - object.y) * delta * .01;

            if (this.isMoving) {
                return;
            }

            const bottom = object.getBottomCenter();
            if (Math.abs(bottom.x - this.currentHouse.x) < this.currentHouse.displayWidth / 2 && bottom.y > this.currentHouse.y + this.currentHouse.displayHeight / 2) {
                this.uiScene.createText(bottom.x, bottom.y, 'Nice!');
                object.isPlanted = true;
                object.house = this.currentHouse;
                this.currentHouse.flag = object;
                object.houseOffsetX = this.currentHouse.x - object.x;
                this.onPlant();
            }
        }
    }

}