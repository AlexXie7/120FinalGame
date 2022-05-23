class minigameChangeChannel extends Minigame {
    constructor(id = 'ChangeChannel') {
        super(id);
    }

    preload() {
        super.preload();

        this.load.image('tv', './assets/minigameChangeChannel/tv.png');
        
        // load possible channels
        this.load.spritesheet('channelFootball', './assets/minigameChangeChannel/channel-football.png', {frameWidth: 200, frameHeight: 140})

        this.load.glsl('noise', './assets/minigameChangeChannel/noise.frag');

        this.load.image('remoteBase', './assets/minigameChangeChannel/remote.png');
        this.load.spritesheet('remotePower', './assets/minigameChangeChannel/remote-power.png', {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet('remoteChannelLeft', './assets/minigameChangeChannel/remote-channel-left.png', {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet('remoteChannelRight', './assets/minigameChangeChannel/remote-channel-right.png', {frameWidth: 128, frameHeight: 128});
    }

    create() {
        super.create();

        // background
        this.add.rectangle(0,0,game.config.width, game.config.height,0x210900).setOrigin(0);

        this.idealWidth = 850;
        this.idealHeight = 650;
        this.idealTop = gameCenterY - this.idealHeight / 2;
        this.idealBottom = gameCenterY + this.idealHeight / 2;
        this.idealLeft = gameCenterX - this.idealWidth / 2;
        this.idealRight = gameCenterX + this.idealWidth / 2;
        
        
        // tv default background

        // channel contents
        this.channels = []
        this.addChannel('channelFootball', true, 4, 100);
        // add undefined channels
        for (let i = 0; i < 5; i++) {
            this.channels.push(undefined);
        }
        this.shuffle(this.channels);
        this.channels.unshift(undefined);
        this.frameTimer = 0;
        this.currentFrame = 0;

        // noise overlay for when changing channel
        this.noise = this.add.shader('noise', gameCenterX, gameCenterY, this.idealWidth, this.idealHeight).setOrigin(.5);
        this.noise.setVisible(true);

        // channel text
        this.channelText = this.add.text(this.idealLeft + 80, this.idealTop + 50, 'CH 0', {
            backgroundColor: '#00F',
            color: '#FF0',
            fontSize: '64px'
        }).setOrigin(0);
        this.channelText.timer = 1000;
        this.channelText.show = () => {
            this.channelText.timer = 2000;
            // this.channelText.setVisible(true);
        }
        this.channelText.hide = () => {
            this.channelText.timer = 0;
            // this.channelText.setVisible(false);
        }

        // screen effects
        this.graphics = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
        this.graphicsTimer = 0;
        this.graphicsInterval = 100;

        // overall overlay for when tv is off
        this.overlay = this.add.rectangle(gameCenterX, gameCenterY, this.idealWidth, this.idealHeight, 0x181A1E).setOrigin(.5).setVisible(false);

        // tv frame
        this.add.image(gameCenterX, gameCenterY, 'tv').setOrigin(.5);

        // remote
        this.remote = this.add.image(this.idealRight, game.config.height, 'remoteBase').setOrigin(.5,1).setScale(1.5);
        this.powerButton = this.add.image(this.remote.getTopLeft().x, this.remote.getTopLeft().y, 'remotePower').setOrigin(0).setScale(this.remote.scale);
        this.powerButton.defaultTint = 0xFF5E5E;
        this.powerButton.pressedTint = 0xFF5E5E;
        this.powerButton.hoveredTint = 0xFF9B9B;
        this.powerButton.onPressed = () => {
            if (this.tvOn) {
                this.tvOn = false;
                this.overlay.setVisible(true);
            } else {
                this.tvOn = true;
                this.overlay.setVisible(false);
                this.channelText.show();
            }
        }
        this.channelLeftButton = this.add.image(this.remote.getBottomLeft().x, this.remote.getBottomLeft().y, 'remoteChannelLeft').setOrigin(0,1).setScale(this.remote.scale);
        this.channelLeftButton.defaultTint = 0x009B45;
        this.channelLeftButton.pressedTint = 0x009B45;
        this.channelLeftButton.hoveredTint = 0x00FF6E;
        this.channelLeftButton.onPressed = () => {
            if (!this.tvOn) { return; }
            this.channel -= 1;
            if (this.channel <= 0) {
                this.channel = this.channels.length - 1;
            }
            this.switchChannel(this.channel);
        }
        this.channelRightButton = this.add.image(this.remote.getBottomRight().x, this.remote.getBottomRight().y, 'remoteChannelRight').setOrigin(1).setScale(this.remote.scale);
        this.channelRightButton.defaultTint = 0x009B45;
        this.channelRightButton.pressedTint = 0x009B45;
        this.channelRightButton.hoveredTint = 0x00FF6E;
        this.channelRightButton.onPressed = () => {
            if (!this.tvOn) { return; }
            this.channel += 1;
            if (this.channel >= this.channels.length) {
                this.channel = 0;
            }
            this.switchChannel(this.channel);
        }
        this.isPointerDown = false;

        this.tvOn = true;
        this.channel = 0;

        this.uiScene.setInstructions('Find a good channel');

        for (const button of [this.channelLeftButton, this.channelRightButton]) {
            const path = new Phaser.Curves.Path(button.getCenter().x - 150, button.getCenter().y - 150);
            path.lineTo(button.getCenter().x - 50, button.getCenter().y - 50);
            this.uiScene.addArrow(path, {delay: 500, drawTime: 500, lifeTime: 500})
        }
    }

    update(time, delta) {

        if (this.tvOn) {
            if (this.graphicsTimer > this.graphicsInterval) {
                this.graphics.clear();
                this.graphics.fillStyle(0xFFFFFF, Math.random() * .25);
                const top = this.idealTop + Math.random() * this.idealHeight;
                const height = Math.random() * (this.idealBottom - top);
                this.graphics.fillRect(this.idealLeft, top, this.idealWidth, height);
                this.graphicsTimer -= this.graphicsInterval;
                this.graphicsInterval = Math.random() * 100;
            }
            this.graphicsTimer += delta;
        } else {
            this.graphics.clear();
        }

        // channel text control
        if (this.channelText.timer <= 0) {
            this.channelText.setVisible(false);
        } else {
            this.channelText.setVisible(true);
            this.channelText.timer -= delta;
        }

        // channel animation control
        if (this.channelData) {
            const cd = this.channelData;
            if (cd.frameCount > 1) {
                
                if (this.frameTimer >= cd.frameInterval) {
                    this.currentFrame += 1;
                    if (this.currentFrame >= cd.frameCount) {
                        this.currentFrame = 0;
                    }

                    cd.sprite.setFrame(this.currentFrame);
                    this.frameTimer -= cd.frameInterval;
                }

                this.frameTimer += delta;
            }
        } else {
            this.frameTimer = 0;
            this.currentFrame = 0;
        }


        const pointer = game.input.activePointer;

        for (const button of [this.powerButton, this.channelLeftButton, this.channelRightButton]) {

            button.isHovered = this.pointOnObject(pointer.x, pointer.y, button);
            
            if (pointer.leftButtonDown()) {
                if (button.isHovered && !this.isPointerDown) {
                    button.isPressed = true;
                    this.isPointerDown = true;
                    // once
                    // console.log(button.texture.key,'pressed')
                    button.onPressed();
                }
            } else {
                button.isPressed = false;
                this.isPointerDown = false;
            }

            // consider not using this
            if (!button.isHovered) {
                button.isPressed = false;
            }

            if (button.isPressed) {
                button.setFrame(1);
                button.setTint(button.pressedTint);
            } else if (button.isHovered) {
                button.setFrame(0);
                button.setTint(button.hoveredTint);
            } else {
                button.setFrame(0);
                button.setTint(button.defaultTint);
            }
            
        }

        
    }

    // finish override
    finish() {
        if (this.tvOn && this.channelData && this.channelData.isGoodChannel) {
            super.finish(true);
        } else {
            super.finish(false);
        }
    }


    switchChannel(channel) {
        if (!this.tvOn) { return; }
        this.channelText.setText(`CH ${channel}`);
        this.channelText.show();

        if (this.channelData) {
            this.channelData.sprite.setVisible(false);
        }

        this.channelData = this.channels[channel];
        if (!this.channelData) {
            this.noise.setVisible(true);
        } else {
            this.channelData.sprite.setVisible(true);

            this.noise.setVisible(false);
        }
    }

    addChannel(key, isGoodChannel, frameCount = 1, frameInterval = 100) {
        const sprite = this.add.sprite(gameCenterX, gameCenterY, key).setOrigin(.5);
        sprite.setScale(this.idealWidth / sprite.width, this.idealHeight / sprite.height);
        this.channels.push({
            sprite,
            frameCount,
            frameInterval,
            isGoodChannel
        });
    }

    // https://javascript.info/task/shuffle
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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