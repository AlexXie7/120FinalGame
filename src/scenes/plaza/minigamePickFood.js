class minigamePickFood extends Minigame {
    constructor(id = 'PickFood') {
        super(id);
        this.gameTime = 12000;
    }

    preload() {
        super.preload();

        // Wrong foods (Way more)
        this.load.image('boba', './assets/minigamePickFood/boba.png');
        this.load.image('dumpling', './assets/minigamePickFood/dumpling.png');
        this.load.image('ramen', './assets/minigamePickFood/ramen.png');
        this.load.image('sushi', './assets/minigamePickFood/sushi.png');

        // Right foods (Only Sandwich and water)
        this.load.image('sandwich', './assets/minigamePickFood/sandwich.png');
        this.load.image('water', './assets/minigameGiveWater/bottle.png');

        // Menu assets
        this.load.image('menuHeader', './assets/minigamePickFood/menuHeader.png');
        this.load.spritesheet('menuText', './assets/minigamePickFood/menuText.png', {frameWidth: 328, frameHeight: 226});
    }

    create() {
        super.create();
    
        const cam = this.cameras.main;

        cam.setBounds(0,0,1200,2700);
        cam.setViewport(0,0,1200,900);

        this.panY = 450;
        
        this.uiScene = this.scene.get('uiScene');
        this.uiScene.setInstructions('Eat American Food!');

        this.background = this.add.rectangle(0, 0, 1200, 2700, 0xe3b87c).setOrigin(0);
        this.add.rectangle (0,0,40,2700,0xfdeac1).setOrigin(0);
        this.add.rectangle (1160,0,40,2700,0xfdeac1).setOrigin(0);
        this.pointer = game.input.activePointer;

        this.result = false;
        this.clicked = false;

        this.wrongFood = ['boba', 'dumpling', 'ramen', 'sushi'];
        this.rightFood = ['sandwich', 'water'];

        this.right = [];
        this.wrong = [];

        this.numClicked = 0;

        this.add.sprite(600, 140, 'menuHeader');


        for (let n = 0; n < 3; n++){
            this.foodA = this.wrongFood[Math.floor(Math.random()*this.wrongFood.length)];
            this.foodB = this.rightFood[Math.floor(Math.random()*this.rightFood.length)];
            let leftRight = Math.random();
            let randText1 = Math.floor(Math.random()*4);
            let randText2 = Math.floor(Math.random()*4);
            if(leftRight < .5){
                this.wrong.push(this.add.sprite(350, 350 + 900 * n, this.foodA).setScale(3).setInteractive());
                this.right.push(this.add.sprite(900, 350 + 900 * n, this.foodB).setScale(3).setInteractive());
            } else {
                this.right.push(this.add.sprite(350, 350 + 900 * n, this.foodB).setScale(3).setInteractive());
                this.wrong.push(this.add.sprite(900, 350 + 900 * n, this.foodA).setScale(3).setInteractive());
            }

            console.log(randText1);
            console.log(randText2);
            this.add.sprite(350, 600 + 900*n, 'menuText', randText1);
            this.add.sprite(900, 600 + 900*n, 'menuText', randText2);
        }




        for(const a of this.right){
            a.on('pointerup', () => {
                // console.log('Picked Right');
                this.uiScene.createSuccess(this.pointer.x, this.pointer.y);
                if(!this.clicked){
                    this.clicked = true;
                    this.numClicked += 1;
                    if(this.numClicked <= 2){
                        cam.pan(600, this.panY + 900*this.numClicked), 'Quad.easeInOut';
                        new Timer().start(1000, () => {
                            this.clicked = false;
                        });
                    } else {
                        this.finish(true);
                    }
                }   
            });
        }

        for(const b of this.wrong){
            b.on('pointerup', () => {
                this.uiScene.createFailure(this.pointer.x, this.pointer.y);
                // if(!this.clicked){
                //     this.clicked = true;
                //     // this.finish(false);
                // }            
            });
        }


        
    }

    update() {

    }
}