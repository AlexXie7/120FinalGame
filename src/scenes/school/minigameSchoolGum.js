class minigameSchoolGum extends Minigame {
    constructor(id = 'SchoolGum') {
        super(id);
    }

    preload() {
        super.preload();

        const asset = './assets/minigameSchoolGum/';
        this.load.image('classroom', asset + 'classroom.png');
        this.load.image('trashCan', asset + 'trash-can.png');
        this.load.image('whiteBoard', asset + 'white-board.png');
        this.load.image('desk', asset + 'desk.png');
        this.load.image('gum', asset + 'gum.png');
    }

    create() {
        super.create();

        // get ui scene
        this.uiScene = this.scene.get('uiScene');
        this.uiScene.setInstructions('Get rid of your gum');

        // this.add.rectangle(0,0,game.config.width, game.config.height, 0xFFFFFF).setOrigin(0);
        const bg = this.add.image(0,0,'classroom').setOrigin(0).setDepth(-2);
        bg.setScale(
            game.config.width / bg.width,
            game.config.height / bg.height
        );

        // create objects
        this.objects = [
            this.add.image(gameCenterX - 200, gameCenterY + 200,'trashCan').setOrigin(.5).setName('trashCan'),
            this.add.image(gameCenterX + 200, gameCenterY + 200,'desk').setOrigin(.5).setName('desk'),
            this.add.image(gameCenterX - 200, gameCenterY - 150,'whiteBoard').setOrigin(.5).setName('whiteBoard')
        ];
        // setup objects
        for (const object of this.objects) {
            object.defaultX = object.x;
            object.defaultY = object.y;
            object.shakeAmount = 0;
            // object.setName(object.texture.key);
        }

        this.graphics = this.add.graphics();
        this.startX = gameCenterX;
        this.startY = game.config.height - 50;
        this.activeGum = [];

        // create starter gum
        this.gum = this.add.image(this.startX, this.startY, 'gum').setOrigin(.5);
        this.gum.setTint(this.randomTint(), this.randomTint(), this.randomTint(), this.randomTint());

        // gum score
        this.scoreText = this.add.text(gameCenterX + 100, gameCenterY - 300, '0 / 10', {
            // fontFamily: '',
            fontStyle: 'bold',
            fontSize: '100px',
            stroke: '#FFF',
            strokeThickness: 2,
            color: '#F00',
        }).setOrigin(0).setDepth(-1);
        this.score = 0;

        // set minigame result
        // this.isPassed = true // set to true by default
        this.lastGumX = 0;
        this.lastGumY = 0;
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isFinished) {
            return;
        }

        const pointer = game.input.activePointer;

        // draw gum throwing arc
        this.graphics.clear();
        this.graphics.beginPath();

        const maxIter = 20;
        const mod = ((time) % 1000) / 1000;
        const differenceX = pointer.x - this.startX;
        const differenceY = pointer.y - this.startY;
        const distance = Phaser.Math.Distance.Between(0,0,differenceX,differenceY);

        // line style must be defined after every clear
        
        this.graphics.beginPath();
        for (let i = mod * 2; i < maxIter; i += 2) {
            const tNow = i / maxIter;
            const tNext = (i + 1) / maxIter;
            this.graphics.lineStyle(9, 0x000000, 1);
            this.graphics.lineBetween(
                this.startX + differenceX * tNow,
                this.startY + differenceY * tNow - this.arc(tNow) * distance * .5,
                this.startX + differenceX * tNext,
                this.startY + differenceY * tNext - this.arc(tNext) * distance * .5,
            )
            this.graphics.lineStyle(5, 0xFFFFFF, 1);
            this.graphics.lineBetween(
                this.startX + differenceX * tNow,
                this.startY + differenceY * tNow - this.arc(tNow) * distance * .5,
                this.startX + differenceX * tNext,
                this.startY + differenceY * tNext - this.arc(tNext) * distance * .5,
            )
        }
        this.graphics.closePath();
        this.graphics.strokePath();

        // shoot gum on mouse press
        if (pointer.leftButtonDown() && !this.isFiring) {
            this.shootGum(this.startX, this.startY, pointer.x, pointer.y, distance * .5);
            this.isFiring = true;
        }

        if (pointer.leftButtonReleased()) {
            this.isFiring = false;
        }

        // update flying gums
        for (let i = 0; i < this.activeGum.length; i++) {
            const gum = this.activeGum[i];
            if (gum.isFinished) {
                this.activeGum.splice(i, 1);
                i -= 1;
            } else {
                gum.update(time, delta);
            }
        }

        // update objects sort of
        for (const object of this.objects) {
            // shake objects by shake amount
            object.shakeAmount -= (object.shakeAmount) * .02 * delta;
            object.y = object.defaultY + Math.sin(time * .2) * object.shakeAmount;
        }
    }

    // called when the minigame runs out of time
    onTimeout() {
        // this.uiScene.clearSigns();
    }

    // checks if a world x y position is touching an object based on its texture
    checkCollision(x, y, object) {
        if (!object) return;
        const key = object.texture.key;
        const alpha = game.textures.getPixelAlpha(x - object.x + object.width * object.originX, y - object.y + object.height * object.originY, key, 0);
        if (alpha > 127) {
            return object;
        }
        return;
    }

    // shoots gum from the player pov to the world to hit an object
    shootGum(startX, startY, endX, endY, arcMod, lifeTime = 800) {
        console.log('shooting gum - play gum shoot sound');
        const gum = this.gum;
        let timer = 0;
        let progress = 0;
        let state = 'fly';
        const differenceX = endX - startX;
        const differenceY = endY - startY;

        // gum update function
        gum.update = (time, delta) => {
            if (gum.isFinished) {
                return;
            }
 
            if (state === 'fly') {
                if (progress >= 1) {
                    gum.x = endX;
                    gum.y = endY;
                    
                    progress = 1;
    
                    // check for a hit
                    let result;
                    for (const object of this.objects) {
                        result = this.checkCollision(gum.x, gum.y, object);
                        if (result) break;
                    }
    
                    if (result) {
                        result.shakeAmount = 10;
                        if (result.name === 'trashCan') {
                            // console.log('bad! dont go for trash can');
                            this.uiScene.createFailure(gum.x, gum.y);
                            this.isPassed = false;
                            this.score -= 1;
                            this.scoreText.setText(`${this.score} / 10`);
                        } else {
                            if (Phaser.Math.Distance.Between(gum.x, gum.y, this.lastGumX, this.lastGumY) < 10) {
                                state = 'fall';
                                timer = 0;
                                lifeTime = 500;
                                gum.velY = Math.random() * -.5;
                                gum.velX = Math.random() * .5 - .25;
                                return;
                            } else {
                                this.score += 1;
                                this.scoreText.setText(`${this.score} / 10`);
                                this.lastGumX = gum.x;
                                this.lastGumY = gum.y;
                            }
                        }
                        if (this.score >= 10) {
                            this.scoreText.setFill('#0F0');
                            this.isPassed = true;
                        } else {
                            this.scoreText.setFill('#F00');
                            this.isPassed = false;
                        }
                        gum.isFinished = true;

                        
                    } else {
                        state = 'shrink';
                        timer = 0;
                        lifeTime = 500;
                    }
                }
    
                // set gum position during flight
                gum.x = startX + progress * differenceX;
                gum.y = startY + progress * differenceY - this.arc(progress) * arcMod;
                gum.scale = (1 - progress * .5);
            } else if (state === 'shrink') {
                if (progress > 1) {
                    gum.isFinished = true;
                    gum.destroy();
                } else {
                    gum.setScale(.5 - progress * .5);
                }
            } else if (state === 'fall') {
                if (gum.y > game.config.height) {
                    gum.isFinished = true;
                    gum.destroy();
                } else {
                    gum.velY += delta * .001;
                    gum.x += gum.velX * delta;
                    gum.y += gum.velY * delta;
                }
            }

            timer += delta;
            progress = timer / lifeTime;
        }
        this.activeGum.push(gum);

        // creates new gum after previous gum was fired
        this.gum = this.add.image(startX, startY, 'gum').setOrigin(.5);

        // sets gum properties
        this.gum.rotation = Math.random() * Math.PI * 2;
        if (Math.random() < .5) {
            this.gum.setTint(this.randomTint(), this.randomTint(), this.randomTint(), this.randomTint());
        } else {
            this.gum.setTint(this.randomTint());
        }
        
        return gum;
    }

    // returns a random tint from possible tints
    randomTint() {
        if (!this.possibleTints) {
            this.possibleTints = [
                0xFF6D6D,
                0xFFFBBA,
                0x83DABA,
                0xCFD2D6,
                0x2A5423,
                0x6DE858,
                0xE231CE
            ];
        }
        const index = Math.min(this.possibleTints.length - 1, Math.floor(Math.random() * this.possibleTints.length));
        return this.possibleTints[index];
    }

    // simple arc function for the shooting arc
    arc(x) {
        return (.25 - (x - .5) * (x - .5)) * 2;
    }
}