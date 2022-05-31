class UI extends Phaser.Scene {
    constructor() {
        super('uiScene');
    }

    preload() {
        this.load.image('signBad', './assets/sign-bad.png');
        this.load.image('signGood', './assets/sign-good.png');
        this.load.image('plazaDoor', './assets/plaza-door.png');
        this.load.image('finishSuccess', './assets/success.png');
        this.load.image('finishFailure', './assets/failure.png');
        this.load.image('fireworksParticle', './assets/fireworks-particle.png');

        // pointers
        this.load.spritesheet('handSheet', './assets/hand-sheet.png', {
            frameWidth: 200, frameHeight: 200, startFrame: 0, endFrame: 2
        });

        // flag for lives
        this.load.image('flagSmall', './assets/flag-small.png');
        
        // bubbles
        // this.load.image('bubbleCorner', './assets/bubble-corner.png');
        this.load.image('bubbleStem','./assets/bubble-stem.png');

        // load sounds
        this.load.audio('soundSuccess', './assets/right.wav');
        this.load.audio('soundFailure', './assets/wrong.wav');
        this.load.audio('soundMinigameFailure', './assets/failure.wav');
        // win sound, lose sound
        // fireworks sound,
        this.load.audio('soundFireworks', './assets/fireworks.wav');
        // click sound? drag sound?
        // double door sound
        // lose life sound
        // gain life sound?
        // game over sound
    }

    create() {
        console.log('ui created');

        // plaza style doors. might change to be inside a dictionary later
        this.plazaDoors = [
            this.add.image(0,0,'plazaDoor').setOrigin(0),
            this.add.image(game.config.width,0,'plazaDoor').setOrigin(1,0).setFlipX(true)
        ];
        for (let i = 0; i < this.plazaDoors.length; i++) {
            const door = this.plazaDoors[i];
            door.closedScaleX = gameCenterX / door.width;
            door.setScale(0, game.config.height / door.height); // open by default
            door.setDepth(3);

            door.lifeTime = 500;
            door.timer = 0;
            door.isFinished = true;

            door.open = (dur = door.lifeTime) => {
                door.lifeTime = dur;
                door.timer = 0;
                door.startScaleX = door.closedScaleX;
                door.endScaleX = 0;
                door.isFinished = false;
            }

            door.close = (dur = door.lifeTime) => {
                door.lifeTime = dur;
                door.timer = 0;
                door.startScaleX = 0;
                door.endScaleX = door.closedScaleX;
                door.isFinished = false;
            }

            door.update = (time, delta) => {
                if (door.isFinished) {
                    return;
                }
                
                let progress = door.timer / door.lifeTime;
                if (progress >= 1) {
                    door.isFinished = true;
                    if (i === 0) {
                        eventEmitter.emit('doorFinished');
                    }
                    progress = 1;
                }
                
                door.setScale(smoothstep(progress, door.startScaleX, door.endScaleX), door.scaleY);
                
                door.timer += delta;
            }
        }

        
        // active signs that are getting updated (o and x and other stuff possibly);
        this.activeSigns = [];  

        // overlay over the game for effect
        this.overlay = this.add.rectangle(0,0,game.config.width, game.config.height, 0x000000, 1).setOrigin(0);
        const ov = this.overlay;
        ov.setAlpha(0);
        ov.timer = 0;
        ov.duration = 0;
        ov.state = 'none';
        ov.update = (time, delta) => {
            if (ov.state === 'transform') {
                let progress = ov.timer / ov.duration;
                if (progress >= 1) {
                    progress = 1;
                    ov.state = 'none';
                    ov.setAlpha(ov.targetAlpha);
                    return;
                }
                ov.setAlpha(ov.startAlpha + progress * (ov.targetAlpha - ov.startAlpha));

                ov.timer += delta;
            }
        }
        ov.moveAlpha = (alpha, duration = 200) => {
            ov.targetAlpha = alpha;
            ov.startAlpha = ov.alpha;
            ov.duration = duration;
            ov.timer = 0;
            ov.state = 'transform';
        }

        // instructions at the top
        const instructionsConfig = {
            align: 'center',
            fontSize: '64px',
            stroke: '#000',
            strokeThickness: 4,
            maxLines: 1
        }
        this.instructions = this.add.text(gameCenterX, 0, 'Instructions', instructionsConfig).setOrigin(.5);
        const ins = this.instructions;
        ins.setDepth(1);
        ins.setFontSize(64);
        ins.fontSize = 64;
        ins.setVisible(false);
        ins.setWordWrapWidth(game.config.width);
        ins.state = 'idle';
        ins.progress = 0;
        ins.timer = 0;
        ins.update = (time, delta) => {
            if (ins.state === 'transform') {
                // transform to target
                ins.progress = ins.timer / ins.duration;
                if (ins.progress >= 1) {
                    ins.progress = 1;
                    if (ins.finishCallback) {
                        ins.finishCallback();
                    }
                    ins.state = 'idle';
                }
                ins.setPosition(
                    ins.startX + ins.progress * (ins.targetX - ins.startX),
                    ins.startY + ins.progress * (ins.targetY - ins.startY)
                );
                ins.setScale(
                    ins.startScaleX + ins.progress * (ins.targetScaleX - ins.startScaleX),
                    ins.startScaleY + ins.progress * (ins.targetScaleY - ins.startScaleY)
                );
                ins.fontSize = ins.startFontSize + ins.progress * (ins.targetFontSize - ins.startFontSize);
                ins.setFontSize(ins.fontSize);

                ins.timer += delta;
            }
        }
        ins.transform = (options = {}) => {
            ins.finishCallback = options.callback;
            ins.targetX = options.x !== undefined ? options.x : ins.x;
            ins.targetY = options.y !== undefined ? options.y : ins.y;
            ins.targetScaleX = options.scale !== undefined ? options.scale : (options.scaleX !== undefined ? options.scaleX : ins.scaleX);
            ins.targetScaleY = options.scale !== undefined ? options.scale : (options.scaleY !== undefined ? options.scaleY : ins.scaleY);
            ins.targetFontSize = options.fontSize || 64;
            ins.duration = options.duration || 200;
            ins.startX = ins.x;
            ins.startY = ins.y;
            ins.startScaleX = ins.scaleX;
            ins.startScaleY = ins.scaleY;
            ins.startFontSize = ins.fontSize;
            ins.timer = 0;
            ins.state = 'transform';
        }
        

        // this.hand = new Hand(this); // hand test
        this.activeHands = [];
        this.graphics = this.add.graphics();
        this.arrowPaths = [];

        // particles for fireworks
        this.particles = this.add.particles('fireworksParticle');
        this.particles.setDepth(1);
        // possible firework tints
        const possibleTints = [
            0xFF0033,
            0x267DFF,
            0xFFFFFF
        ];
        
        // creates fireworks at random position multiplied by bias (determines whether its on left or right side of screen)
        const createFireworks = (bias) => {
            const emitter = this.particles.createEmitter({
                speed: 300,
                lifespan: 1000,
                scale: {start: 1, end: 0},
                tint: possibleTints[Math.floor(Math.random() * possibleTints.length)],
                gravityY: 500,
                frequency: -1,
                blendMode: Phaser.BlendModes.ADD
            });
            emitter.explode(50, gameCenterX + Math.random() * gameCenterX * bias, gameCenterY + Math.random() * 500 - 250);
            this.sound.play('soundFireworks', {volume: 2});
        }

        // success and failure sings (when minigame ends)
        this.finishSuccess = this.add.image(gameCenterX, gameCenterY, 'finishSuccess').setOrigin(.5).setVisible(false).setDepth(2);
        this.finishSuccess.show = (dur = 500) => {
            this.finishSuccess.setVisible(true);
            this.finishSuccess.setScale(0);
            this.finishSuccess.lifeTime = dur;
            this.finishSuccess.timer = 0;
            this.finishSuccess.isFinished = false;
            this.finishSuccess.fireworksTimer = 0;
            this.finishSuccess.fireworksInterval = dur / 5;
            this.finishSuccess.fireworksBias = 1;
        }
        this.finishSuccess.update = (time, delta) => {
            if (this.finishSuccess.visible && !this.finishSuccess.isFinished) {
                let progress = this.finishSuccess.timer / this.finishSuccess.lifeTime;
                if (progress > 1) {
                    progress = 1;
                    this.finishSuccess.isFinished = true;
                }
                if (this.finishSuccess.fireworksTimer > this.finishSuccess.fireworksInterval) {
                    createFireworks(this.finishSuccess.fireworksBias);
                    this.finishSuccess.fireworksBias *= -1;
                    this.finishSuccess.fireworksTimer -= this.finishSuccess.fireworksInterval;
                }
                this.finishSuccess.fireworksTimer += delta;

                this.finishSuccess.setScale(Math.sqrt(progress));
                this.finishSuccess.timer += delta;
            }
        }
        this.finishFailure = this.add.image(gameCenterX, gameCenterY, 'finishFailure').setOrigin(.5).setVisible(false).setDepth(2);
        this.finishFailure.show = (dur = 500) => {
            this.finishFailure.setVisible(true);
            this.finishFailure.setScale(10);
            this.finishFailure.lifeTime = dur;
            this.finishFailure.timer = 0;
            this.finishFailure.isFinished = false;
            this.sound.play('soundMinigameFailure', {volume: 2});
        }
        this.finishFailure.update = (time, delta) => {
            if (this.finishFailure.visible && !this.finishFailure.isFinished) {
                let progress = this.finishFailure.timer / this.finishFailure.lifeTime;
                if (progress > 1) {
                    progress = 1;
                    this.finishFailure.isFinished = true;
                }
                let shakeAmount =  Math.sin(time) * 50 * (1 - progress);
                this.finishFailure.setPosition(gameCenterX + shakeAmount, gameCenterY + shakeAmount);
                this.finishFailure.setScale(1 + (1 - progress * progress) * 9) 
                this.finishFailure.timer += delta;
            }
        }
        // when door finishes (in this case door close), hide signs and destroy emitters
        eventEmitter.on('doorFinished', () => {
            this.finishSuccess.setVisible(false);
            this.finishFailure.setVisible(false);
            while (this.particles.emitters.length > 0) {
                this.particles.removeEmitter(this.particles.emitters.getAt(0));
            }
        });

        // add visual timer
        this.timerBar = this.add.rectangle(0,game.config.height,game.config.width,40,0x00FF00).setOrigin(0,1).setVisible(false);

        // add lives (flags)
        this.startLives = 4;
        this.lives = 0;
        this.flags = [];
        this.removedFlags = [];
        for (let i = 0; i < this.startLives; i++) {
            this.addLife();
        }
        
        // test bubbles
        // new Bubble(this, gameCenterX + 300, gameCenterY, 'hello everynyan how are you fine thank you', {maxWidth: undefined, stemSide: 'left'});
        // new Bubble(this, gameCenterX - 300, gameCenterY, 'hello everynyan how are you fine thank you', {maxWidth: 200, stemSide: 'right'});
        // new Bubble(this, gameCenterX, gameCenterY + 300, 'hello everynyan how are you fine thank you', {maxWidth: 200, stemSide: 'top'});
        // new Bubble(this, gameCenterX, gameCenterY - 300, 'hello everynyan how are you fine thank you', {maxWidth: 200, stemSide: 'bottom'});
        // this.testBubble = new Bubble(this, gameCenterX + 300, gameCenterY, 'i am a bubble following you', {maxWidth: 300, stemSide: 'left'});
        // let index = 0;
        // setInterval(() => {
        //     const sides = ['left','top','right','bottom'];
        //     this.testBubble.setStem(sides[index]);
        //     index = index + 1 === sides.length ? 0 : index + 1;
        // }, 1000)

        // this.createBubble(0,0,'pick a zone!', {maxWidth: 300, reference: game.input.activePointer});
        
    }

    update(time, delta) {
        // this.testBubble.update(time, delta);
        // const pointer = game.input.activePointer;
        // this.testBubble.setStem(undefined, Math.sin(time * .01) * .5 + .5)
        // this.testBubble.setPositionFromStem(pointer.x, pointer.y);
        // this.testBubble.setAlpha(Math.sin(time * .005) * .5 + .5);

        // update main signs
        this.finishSuccess.update(time, delta);
        this.finishFailure.update(time, delta);
        this.instructions.update(time, delta);
        this.overlay.update(time, delta);

        // update doors (plaza)
        for (const door of this.plazaDoors) {
            door.update(time, delta);
        }

        // update signs (o, x, and other words)
        for (let i = 0; i < this.activeSigns.length; i++) {
            const sign = this.activeSigns[i];
            if (sign.isDestroyed) {
                this.activeSigns.splice(i, 1);
                i -= 1;
            } else {
                sign.update(time, delta);
            }
        }

        // update flags
        for (let i = 0; i < this.removedFlags.length; i++) {
            const flag = this.removedFlags[i];
            if (flag.isDestroyed) {
                this.removedFlags.splice(i, 1);
                i -= 1;
            } else {
                flag.update(time, delta);
            }
        }

        // update hands
        for (let i = 0; i < this.activeHands.length; i++) {
            const hand = this.activeHands[i];
            if (hand.isDestroyed) {
                this.activeHands.splice(i, 1);
                i -= 1;
            } else {
                hand.update(time, delta);
            }
        }

        // update arrows
        this.graphics.clear();
        for (let i = 0; i < this.arrowPaths.length; i++) {
            const path = this.arrowPaths[i];
            if (path.isDestroyed) {
                this.arrowPaths.splice(i, 1);
                i -= 1;
            } else {
                this.drawArrow(path, {outline: true});
                this.drawArrow(path);
                path.update(time, delta);
            }
        }
    }

    openDoor(duration) {
        return new Promise((resolve, reject) => {
            for (const door of this.plazaDoors) {
                door.open(duration);
            }
            eventEmitter.addListener('doorFinished', () => {resolve()})
        })
    }

    closeDoor(duration) {
        return new Promise((resolve, reject) => {
            for (const door of this.plazaDoors) {
                door.close(duration);
            }
            eventEmitter.addListener('doorFinished', () => {resolve()})
        })
    }

    addLife() {
        const gap = 20;
        const flag = this.add.image(
            20 + 75 + this.flags.length * (150 + gap),
            20 + 50,
            'flagSmall'
        ).setOrigin(.5).setDepth(4);
        this.flags.push(flag);
        this.lives += 1;
    }

    removeLife() {
        if (this.flags.length > 0) {
            const flag = this.flags.pop();
            this.removedFlags.push(flag);
            flag.velX = Math.random() * .1;
            flag.velY = Math.random() * .3 - .15;
            flag.isFalling = true;
            flag.update = (time, delta) => {
                if (flag.isDestroyed) {
                    return;
                }
                if (flag.isFalling) {
                    flag.velY += delta * .002;
                    flag.x += flag.velX * delta;
                    flag.y += flag.velY * delta;
                    flag.rotation += flag.velY * .1;
                    if (flag.y > game.config.height + 100) {
                        flag.destroy();
                        flag.isDestroyed = true;
                    }
                }
            }
            
            this.lives -= 1;
        }
    }

    showLives() {
        for (const flag of this.flags) {
            flag.setVisible(true);
        }
    }

    hideLives() {
        for (const flag of this.flags) {
            flag.setVisible(false);
        }
    }

    setLives(amount) {
        const difference = amount - this.lives;
        for (let i = 0; i < Math.abs(difference); i++) {
            if (difference > 0) {
                this.addLife();
            } else {
                this.removeLife();
            }
        }
    }

    getLives() {
        return this.lives;
    }

    setInstructions(text) {
        this.instructions.setText(text);
    }

    createHand(options) {
        const hand = new Hand(this, options);
        return hand;
    }

    clearHands() {
        for (const hand of this.activeHands) {
            hand.destroy();
        }
    }

    // if options defined, overrides some properties
    drawArrow(path, options = {}) {

        if (path.state === 'delay') {
            return;
        }

        const width = options.outline ? path.width + 12 : path.width;
        const step = path.pathStep;
        const color = options.outline ? 0x00000 : path.color;
        const alpha = 1 - path.destroyProgress;
        const triangleHeight = path.triangleHeight;
        if (path.hand) {
            path.hand.setAlpha(alpha);
        }
        this.graphics.lineStyle(width, color, alpha);
        this.graphics.fillStyle(color, alpha);

        const pathLength = path.getLength();

        let prevCurvePartial = 0;
        for (const curve of path.curves) {
            curve.partial = curve.getLength() / pathLength + prevCurvePartial;
            prevCurvePartial = curve.partial;
        }

        let prevCurveLengths = 0;
        let currPathLength = 0;
        let testPoint = new Phaser.Math.Vector2(0,0);
        let testPoint2 = new Phaser.Math.Vector2(0,0);
        
        for (let i = 0; i < path.curves.length; i++) {
            const curve = path.curves[i];
            const curveLength = curve.getLength();
            if (path.progress > curve.partial || path.progress === 1) {
                // draw full curve
                let currLength = 0;
                const points = [];
                while (true) {
                    points.push(curve.getPointAt(currLength / curveLength));
                    currLength += step;
                    if (currLength > curveLength) {
                        points.push(curve.getEndPoint());
                        break;
                    }
                }
                this.graphics.strokePoints(points);
                prevCurveLengths += curveLength;
                currPathLength = prevCurveLengths;
                if (i < path.curves.length - 1) {
                    const end = points[points.length - 1];
                    this.graphics.fillCircle(end.x, end.y, width / 2);
                }
            } else {
                // draw partial curve
                let currLength = 0;
                const points = [];
                points.push(curve.getStartPoint());
                while (true) {
                    let progress = currPathLength / pathLength;
                    
                    // testPoint = path.getPoint((path.progress * pathLength - triangleHeight) / pathLength);

                    if (progress > path.progress) {

                        // prev point should at or before the path head
                        const prevPoint = points[points.length - 1];

                        // testPoint = prevPoint;
                        const scale = (path.progress * pathLength - currPathLength + step);
                        const nextProgress = currLength / curveLength;
                        // next point should be after the path head
                        let nextPoint;
                        if (nextProgress >= 1) {
                            nextPoint = curve.getEndPoint();
                        } else {
                            nextPoint = curve.getPointAt(nextProgress);
                        }
                        // testPoint2 = nextPoint;
                        const difference = nextPoint.clone().subtract(prevPoint);
                        
                        points.push(prevPoint.clone().add(difference.normalize().scale(scale)));
                        
                        break;
                    }
                    points.push(curve.getPointAt(currLength / curveLength))
                    
                    
                    currLength += step;
                    currPathLength += step;

                }
                // this.graphics.lineStyle(width, 0x0000FF);
                this.graphics.strokePoints(points);
                // debug drawing
                // this.graphics.fillStyle(0x00FF00);
                // this.graphics.fillPoint(testPoint.x, testPoint.y, 15);
                // this.graphics.fillStyle(0xFFFF00);
                // this.graphics.fillPoint(testPoint2.x, testPoint2.y, 15);
            }
        }

        
        
        const triangle = new Phaser.Geom.Triangle(
            -20, width / 2 + 20,
            -20, -width / 2 - 20,
            triangleHeight-20, 0
        );
        const head = path.head; //getPoint(path.progress);
        const tangent = path.getTangent(path.progress);
        Phaser.Geom.Triangle.RotateAroundPoint(triangle, new Phaser.Geom.Point(0,0),tangent.angle());
        Phaser.Geom.Triangle.Offset(triangle, head.x, head.y);
        // this.graphics.fillStyle(0xFFFF00, alpha);
        if (options.outline) {
            this.graphics.lineStyle(12, 0x000000, alpha);
            this.graphics.strokeTriangleShape(triangle);
        } else {
            this.graphics.fillTriangleShape(triangle);
        }

        // this.graphics.fillStyle(0x00000);
        // this.graphics.fillPoint(head.x, head.y, 10);
    }

    // path: a Phaser.Curves.Path object. don't modify after
    // options:
    // drawTime - the time it takes for the arrow to draw
    // lifeTime - the time the arrow stays alive before disappearing
    // step - arrow rolution - more is smoother, but heavier
    // color - self explanatory (doesn't change outline color)
    // width - arrow width in pixels I think
    addArrow(path, options = {}) {
        path.triangleHeight = 60;
        path.color = options.color || 0xFF0000;
        path.width = options.width || 40;
        path.pathStep = options.step || 50;
        path.delay = options.delay || 0;
        path.timer = 0;
        path.drawTime = options.drawTime || 1000;
        path.lifeTime = options.lifeTime || 1000;
        path.destroyTime = options.destroyTime || 500;
        path.head = new Phaser.Math.Vector2(path.startPoint.x, path.startPoint.y);
        if (options.attachHand) {
            path.hand = new Hand(this, {reference: path.head});
            path.hand.setAlpha(0);
        }
        path.progress = 0;
        path.isFinished = false;
        path.isDrawn = false;
        if (path.delay > 0) {
            path.state = 'delay';
            new Timer().start(path.delay, () => {path.state = 'draw'});
        } else {
            path.state = 'draw';
        }
        path.destroyProgress = 0;
        path.update = (time, delta) => {
            if (path.isDestroyed) {
                return;
            }
            if (path.state === 'finished') {
                if (path.timer >= path.destroyTime) {
                    path.destroyProgress = 1;
                    path.isDestroyed = true;
                    path.destroy();
                    if (path.hand) {
                        path.hand.destroy();
                    }
                } else {
                    path.destroyProgress = path.timer / path.destroyTime;
                }
            } else if (path.state === 'idle') {
                if (path.timer >= path.lifeTime) {
                    path.timer -= path.lifeTime;
                    path.state = 'finished';
                    path.isFinished = true;
                }
            } else if (path.state === 'draw') {
                path.progress = path.timer / path.drawTime;
                if (path.progress >= 1) {
                    path.timer -= path.drawTime;
                    path.progress = 1;
                    path.isDrawn = true;
                    path.state = 'idle';
                }
                path.head.copy(path.getPoint(path.progress));
            }
            if (path.state !== 'delay') {
                path.timer += delta;
            }
        }

        // possibly implement a way to trim path so it fits triange??!

        this.arrowPaths.push(path);
    }

    // add simple arrow that points to position x, y
    // angle is in degrees
    addPointArrow(x, y, length = 100, angle = 45, options = {}) {
        options.delay = options.delay || 300;
        options.drawTime = options.drawTime || 300;
        options.lifeTime = options.lifeTime || 600;
        options.destroyTime = options.destroyTime || 200;
        const triangleHeight = 60;
        length = Math.max(length, triangleHeight + 10);
        const rad = angle * Math.PI / 180;
        const target = new Phaser.Math.Vector2(x, y);
        const source = new Phaser.Math.Vector2(x + Math.sin(rad) * (length + triangleHeight), y + Math.cos(rad) * (length + triangleHeight));
        const path = new Phaser.Curves.Path(source.x, source.y);
        path.lineTo(source.clone().add(target.subtract(source).normalize().scale(length)));
        options.triangleHeight = triangleHeight;
        this.addArrow(path, options);
    }

    clearArrows() {
        for (const path of this.arrowPaths) {
            path.isDestroyed = true;
            path.destroy();
        }
    }

    async minigameStart(options = {}) {
        const instructionVisibleDuration = 1000;
        this.instructions.setVisible(true);
        // this.overlay.setAlpha(.5);
        // console.log(this.overlay.alpha);
        this.overlay.moveAlpha(.5, 200);
        await new Promise((resolve, reject) => {
            this.instructions.transform({
                x: gameCenterX,
                y: gameCenterY,
                // scale: 1.5,
                fontSize: 80,
                callback: resolve
            });
        });
        await new Promise((resolve, reject) => {
            new Timer().start(instructionVisibleDuration, resolve);
        });
        this.overlay.moveAlpha(0, 200);
        await new Promise((resolve, reject) => {
            this.instructions.transform({
                x: gameCenterX,
                y: 32,
                // scale: 1,
                fontSize: 64,
                callback: resolve
            });
        });
        // console.log(this.overlay.alpha);
        if (!options.hideTimer) {
            this.timerBar.setVisible(true);
        }        

        return;
    }

    minigameEnd(result) {
        this.instructions.setVisible(false);
        this.timerBar.setVisible(false);
        this.clearArrows();
        this.clearHands();

        if (result) {
            this.finishSuccess.show();
            // show comments/dialogue about why u failed or reactions
        } else {
            this.finishFailure.show();
        }
    }

    // percent elapsed; 0 = start; 1 = end
    setTimerProgress(percent) {
        this.timerBar.setScale(1 - percent, 1);
    }

    // temporary signs
    clearSigns() {
        for (let i = 0; i < this.activeSigns.length; i++) {
            const sign = this.activeSigns[i];
            sign.destroy();
            sign.isDestroyed = true;
        }
    }


    createBubble(x, y, text, options = {}) {
        const bubble = new Bubble(this, x, y, text, options);
        this.activeSigns.push(bubble);
        return bubble;
    }

    createText(x, y, text, config = {fontSize: '64px', stroke: '#000', strokeThickness: 4}) {
        const sign = this.add.text(x, y, text, config).setOrigin(.5);
        let lifeTime = 1000;
        let timer = 0;

        sign.update = (time, delta) => {
            
            if (sign.isDestroyed) {
                return;
            }

            let progress = timer / lifeTime;

            sign.y = y - progress * 20;
            if (progress > .5) {
                sign.setAlpha((.5 - (progress - .5)) * 2);
            }

            if (progress >= 1) {
                sign.destroy();
                sign.isDestroyed = true;
            }

            timer += delta;
        };
        this.activeSigns.push(sign);
    }

    createSign(x, y, key) {
        const sign = this.add.image(x, y, key).setOrigin(.5);
        sign.angle = Math.random() * 50 - 25;

        let lifeTime = 1000;
        let timer = 0;

        sign.update = (time, delta) => {
            
            if (sign.isDestroyed) {
                return;
            }

            let progress = timer / lifeTime;

            sign.y = y - progress * 20;
            if (progress > .5) {
                sign.setAlpha((.5 - (progress - .5)) * 2);
            }

            if (progress >= 1) {
                sign.destroy();
                sign.isDestroyed = true;
            }

            timer += delta;
        };

        this.activeSigns.push(sign);
    }

    createSuccess(x, y) {
        this.createSign(x, y, 'signGood');
        this.sound.play('soundSuccess');
    }

    createFailure(x, y) {
        this.createSign(x, y, 'signBad');
        this.sound.play('soundFailure');
    }
}


function smoothstep(x, start, end) {
    let flip =false;
    if (start > end) {
        let temp = end;
        end = start;
        start = temp;
        flip = true;
    }

    if (x < 0) return start;
    if (x > 1) return end;

    let y = (1-x) * (x*x) + x * (-(1-x) * (1-x) + 1);
    return (flip ? (1 - y) : y) * (end - start);
}