
// cool dialogue bubble for some flair
class Bubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, options = {}) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.text = scene.add.text(0,0, text, {
            fontFamily: options.fontFamily || 'Arial, Helvetica, sans-serif',
            fontSize: options.fontSize ? `${options.fontSize}px` : '40px',
            // fixedWidth: options.maxWidth,
            color: options.color || '#000',
            // wordWrapWidth: options.maxWidth,
            align: options.align || 'left'
        }).setOrigin(.5);
        this.text.setText(this.text.advancedWordWrap(text, this.text.context, options.maxWidth || 500));
        this.verticalRectangle = scene.add.rectangle(0,0, 1,1,0xFFFFFF).setOrigin(.5);
        this.horizontalRectangle = scene.add.rectangle(0,0, 1,1,0xFFFFFF).setOrigin(.5);
        this.corners = [
            scene.add.image(0,0,'bubbleCorner').setOrigin(1).setAngle(0),
            scene.add.image(0,0,'bubbleCorner').setOrigin(1).setAngle(90),
            scene.add.image(0,0,'bubbleCorner').setOrigin(1).setAngle(180),
            scene.add.image(0,0,'bubbleCorner').setOrigin(1).setAngle(270),
        ];
        // this.setSize(this.text.width, this.text.height);
        
        this.stem = scene.add.image(0,0,'bubbleStem').setOrigin(0);
        this.side = 'bottom';
        this.slide = 0;
        this.setStem(options.stemSide || this.side, options.stemSlide || this.slide);

        this.add(this.verticalRectangle);
        this.add(this.horizontalRectangle);
        this.add(this.stem);
        for (const corner of this.corners) {
            corner.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            this.add(corner);
        }
        this.add(this.text);

        this.setVisible(false);

        this.followReference = options.followReference || false;
        if (options.followReference === undefined && Boolean(options.reference)) {
            this.followReference = true;
        }
        this.setReference(options.reference);
        this.offsetX = 0;
        this.offsetY = 0;

        this.drawPath = new Phaser.Curves.Path(0,0);
        this.drawPath.cubicBezierTo(1,1,.2,1.82,.02,.86);
        this.delayTime = options.delay || 0;
        this.drawTime = options.drawTime || 200;
        this.lifeTime = options.lifeTime || 1000;
        this.destroyTime = options.destroyTime || 200;
        this.timer = 0;
        this.state = 'delay';
        
        // this.testPoint = scene.add.rectangle(0,0,5,5,0x00FF00);
    }

    update(time, delta) {
        if (this.isDestroyed) {
            return;
        }

        if (this.reference && this.followReference) {
            this.setPositionFromStem(this.reference.x + this.offsetX, this.reference.y + this.offsetY);
        }

        if (this.state === 'delay') {
            if (this.delayTime <= 0) {
                this.state = 'draw';
            } else {
                let progress = this.timer / this.delayTime;
                if (progress >= 1) {
                    progress = 1;
                    this.state = 'draw';
                    this.timer = 0;
                }
            }
        }
        if (this.state === 'draw') {
            this.setVisible(true);
            let progress = this.timer / this.drawTime;
            if (progress >= 1) {
                progress = 1;
                this.state = 'idle';
                this.timer = 0;
            }
            let pathProgress = this.drawPath.getPoint(progress).y;
            this.setSize(this.text.width * pathProgress, this.text.height * pathProgress);
            this.stem.setScale(progress);
            this.setStem(undefined, .5 * (1-progress) + this.slide * progress, false);
            this.setAngle((1-pathProgress) * -90)
            // this.stem.setVisible(false);
        } else if (this.state === 'idle') {
            if (this.lifeTime > 0) {
                let progress = this.timer / this.lifeTime;
                if (progress >= 1) {
                    progress = 1;
                    this.state = 'destroy';
                    this.timer = 0;
                }
            }
            this.stem.setVisible(true);
        } else if (this.state === 'destroy') {
            let progress = this.timer / this.lifeTime;
            if (progress >= 1) {
                progress = 1;
                this.state = 'none';
                this.timer = 0;
                this.setAlpha(0);
                this.destroy();
            } else {
                this.setAlpha(1 - progress);
            }
        }

        if (this.state !== 'none') {
            this.timer += delta;
        }
    }

    // set the reference for the hand to follow
    // must have x: property and y: property
    setReference(reference) {
        if (this.reference === reference) {
            return this;
        }
        if (reference && reference.x !== undefined && reference.y !== undefined) {
            this.reference = reference;
            return this;
        }
        return;
    }

    // position the stem
    // side : string - left, right, top, or bottom
    // slide : 0 to 1 - the stem's relative position on a side
    setStem(side = this.side, slide = this.slide, saveUpdate = true) {
        switch (side) {
            case "left": {
                this.stem.setAngle(90);
                this.stem.setPosition(-this.text.displayWidth / 2 - 32, -this.text.displayHeight / 2 + slide * (this.text.displayHeight - 64));
                break;
            }
            case "right": {
                this.stem.setAngle(-90);
                this.stem.setPosition(this.text.displayWidth / 2 + 32, this.text.displayHeight / 2 - slide * (this.text.displayHeight - 64));
                break;
            }
            case "top": {
                this.stem.setAngle(180);
                this.stem.setPosition(this.text.displayWidth / 2 - slide * (this.text.displayWidth - 64), -this.text.displayHeight / 2 - 32);
                break;
            }
            case "bottom": 
            default: {
                this.stem.setAngle(0);
                this.stem.setPosition(-this.text.displayWidth / 2 + slide * (this.text.displayWidth - 64), this.text.displayHeight / 2 + 32);
            }
        }
        this.stem.flipX = slide > .5;
        if (saveUpdate) {
            this.side = side;
            this.slide = slide;
        }
    }

    setSize(w, h) {
        this.verticalRectangle.setScale(w, h + 64);
        this.horizontalRectangle.setScale(w + 64, h);
        this.corners[0].setPosition(-w / 2, -h / 2);
        this.corners[1].setPosition(w / 2, -h / 2);
        this.corners[2].setPosition(w / 2, h / 2);
        this.corners[3].setPosition(-w / 2, h / 2);
        this.text.setDisplaySize(w, h);
    }

    setPositionFromStem(x, y) {
        const point = this.stem.getBottomCenter().rotate(this.rotation);//angle * Math.PI / 180);
        this.setPosition(x - point.x, y - point.y);
        // this.setAngle(angle)
    }

    destroy() {
        this.verticalRectangle.destroy();
        this.horizontalRectangle.destroy();
        this.text.destroy();
        for (const corner of this.corners) {
            corner.destroy();
        }
        this.stem.destroy();
        super.destroy();
        this.isDestroyed = true;
    }
}