class minigameSchoolMath extends Minigame {
    constructor(id= 'SchoolMath') {
        super(id);
    }

    preload() {
        super.preload();

        this.load.image('chalkboard', './assets/minigameSchoolMath/chalkboard.png');
        this.load.image('chalk', './assets/minigameSchoolMath/chalk.png');
        this.load.image('chalkParticle', './assets/minigameSchoolMath/chalk-particle.png');
        
        this.load.audio('chalkSlide', './assets/minigameSchoolMath/chalk-slide.wav');
        this.load.audio('chalkTap', './assets/minigameSchoolMath/chalk-tap.wav');
    }

    create() {
        super.create();

        const bg = this.add.image(0, 0, 'chalkboard').setOrigin(0);
        bg.setScale(game.config.width / bg.width, game.config.height / bg.height);

        const equationConfig = {
            fontFamily: 'Cursive',
            fontSize: '100px'
        }
        const answerConfig = {
            fontFamily: 'Cursive',
            fontSize: '400px',
            color: '#000'
        }
        this.equationText = this.add.text(gameCenterX, gameCenterY - 100,'eq', equationConfig).setOrigin(.5,1);
        this.answerText = this.add.text(gameCenterX, gameCenterY - 100,'an', answerConfig).setOrigin(.5,0).setBlendMode(Phaser.BlendModes.MULTIPLY).setAlpha(0);

        this.guessText = this.add.text(gameCenterX, game.config.height, '^^^', {fontSize: '32px'}).setOrigin(.5, 1);

        this.uiScene.setInstructions(`Write an answer`);

        // generate equation
        this.currentAnswer = this.createEquation();

        this.graphics = this.add.graphics();
        this.graphics.lineStyle(6,0xFFFFFF);
        this.lastPoint;
        this.particles = this.add.particles('chalkParticle');
        this.emitter = this.particles.createEmitter({
            speed: {min: 0, max: 100},
            lifespan: 1000,
            scale: {start: 1, end: 0},
            gravityY: 800,
            frequency: 100,
        });
        this.emitter.stop();

        this.chalk = this.add.image(gameCenterX, gameCenterY, 'chalk').setOrigin(.5, 0).setScale(2);
        this.chalk.angle = -45;
        this.chalk.soundTap = this.sound.add('chalkTap', {volume:1.5});
        this.chalk.soundSlide = this.sound.add('chalkSlide', {volume:1, loop:true});

        this.currentStroke;
        this.inkStarted = false;
        this.inkTimer = 0;
        this.ink = [];

        this.isPassed = true;
    }

    update(time, delta) {

        const pointer = game.input.activePointer;

        this.chalk.x = pointer.x;
        this.chalk.y = pointer.y;

        if (pointer.leftButtonDown()) {
            if (!this.lastPoint) {
                this.lastPoint = new Phaser.Math.Vector2(pointer.x,pointer.y);
                this.currentStroke = [
                    [], // x positions
                    [], // y positions
                    []  // relative times
                ]; // creates new stroke
                this.currentStrokeStart = Date.now()
                this.inkStarted = true;
                // this.emitter.start();
                this.chalk.soundTap.play();
                this.chalk.soundSlide.play({volume:0});
            }
            this.emitter.setPosition(pointer.x, pointer.y);
            this.graphics.lineBetween(this.lastPoint.x, this.lastPoint.y, pointer.x, pointer.y);
            const distance = Phaser.Math.Distance.Between(this.lastPoint.x, this.lastPoint.y, pointer.x, pointer.y);
            if (distance > 2) {//this.lastPointer.x !== pointer.x && this.lastPointer.y !== )
                // only record if distance is greater than an amount
                this.currentStroke[0].push(pointer.x);
                this.currentStroke[1].push(pointer.y);
                this.currentStroke[2].push(this.inkTimer);
            }
            this.chalk.soundSlide.setVolume(Math.min(2,(10 / distance) * 2));

            if (distance > 10) {
                this.emitter.start();
            } else {
                this.emitter.stop();
            }

            this.lastPoint.set(pointer.x, pointer.y);
        } else {
            this.lastPoint = undefined;
            if (this.currentStroke) {
                this.chalk.soundSlide.stop();
                this.ink.push(this.currentStroke);
                this.currentStroke = undefined;
                
                // // process current strokes
                // this.requestHandwritingRecognition(this.ink, (data) => {
                //     if (data) {
                //         const answer = data[0];
                //         // for testing
                //         this.guessText.setText(answer);

                //         // check if the answer is right. if its right, cause failure
                //         if (parseInt(answer) === this.currentAnswer) {
                //             this.finish(false);
                //         }
                //     }
                // });
            }
            this.emitter.stop();
        }

        if (this.inkStarted) {
            this.inkTimer += delta;
        }

        if (this.answerText.alpha < .3) {
            this.answerText.setAlpha(this.answerText.alpha + delta * .0004);
        } else {
            this.answerText.setAlpha(.3);
        }

        // if (this.playScene.minigameTimer.getProgress() >)
    }

    // finish function override
    finish() {
        // process current strokes
        this.requestHandwritingRecognition(this.ink, (data) => {
            if (data) {
                const answer = data[0];
                // for testing
                this.guessText.setText(answer);

                // check if the answer is right. if its right, cause failure
                if (parseInt(answer) === this.currentAnswer) {
                    super.finish(false);
                    const comments = ['booring', '🤓🤓', 'imagine knowing the answer', 'what a nerd'];
                    for (let i = 0; i < 3; i++) {
                        const index = Math.floor(Math.random() * comments.length);
                        const bubble = this.uiScene.createBubble(0,0,comments[index], {maxWidth: 300, delay: i * 300, drawTime: 500});
                        comments.splice(index, 1);
                        bubble.setPositionFromStem(game.config.width * (i / 3) + Math.random() * 100 + 80, game.config.height);
                    }
                    
                } else {
                    super.finish(true);
                }
            } else {
                super.finish(true);
            }
        });
    }

    // returns answer
    createEquation() {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        const ops = [
            {func: (x, y) => {return x + y}, toString: () => {return '+'}},
            {func: (x, y) => {return x - y}, toString: () => {return '-'}},
            {func: (x, y) => {return x * y}, toString: () => {return 'x'}},
        ]
        const op = ops[Math.floor(Math.random() * ops.length)];
        
        this.equationText.setText(`${a} ${op} ${b} =`);

        const answer = op.func(a, b);

        this.answerText.setText(`${answer}`);
        
        return answer;
    }

    // takes ink object and returns closest readings
    // can use callback or promise
    // not fully tested
    async requestHandwritingRecognition(ink, callback = (data) => {}, errorCallback = (error) => {}) {
        // using google translate request
        const requestData = {
            "itc":"en-t-i0-handwrit",
            "app_version":0.4,
            "api_level":"537.36",
            "device":"5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
            "input_type":"0",
            "options":"enable_pre_space",
            "requests": [
                {
                    "writing_guide":{
                        "writing_area_width":424.8,
                        "writing_area_height":193.6
                    },
                    "pre_context":"",
                    "max_num_results":10,
                    "max_completions":0,
                    "language":"en",
                    "ink": ink
                }
            ]
        };

        let response;
        try {
            response = await fetch("https://inputtools.google.com/request?itc=en-t-i0-handwrit&app=jsapi", {
                method: "POST",
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(requestData)
            })
        } catch(error) {
            console.log('error fetching google');
            errorCallback(error);
            callback();
            return;
        }
        
        // maybe unnecessary?
        if (!response) {
            console.log('no response');
            errorCallback('no response');
            callback();
            return;
        }
            
        let data = await response.json();

        // probably unnecessary
        if (!data || data[0] !== 'SUCCESS') {
            console.log('failed to get data from response or data is not success')
            errorCallback('failed to get data from response or data is not success');
            callback();
            return;
        }
    
        const guesses = data[1][0][1];
        callback(guesses);
        return guesses;
    }
}