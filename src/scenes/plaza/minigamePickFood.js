class minigamePickFood extends Minigame {
    constructor(id = 'PickFood') {
        super(id);
        this.gameTime = 20000;
    }

    preload() {
        super.preload();

        // Wrong foods (Way more)
        this.load.image('boba', './assets/minigamePickFood/tempBoba.jpg');
        this.load.image('dumpling', './assets/minigamePickFood/tempDumpling.jpg');
        this.load.image('ramen', './assets/minigamePickFood/tempRamen.png');
        this.load.image('sushi', './assets/minigamePickFood/tempSushi.png');

        // Right foods (Only Sandwich and water)
        this.load.image('sandwich', './assets/minigamePickFood/tempSandwich.png');
        this.load.image('water', './assets/minigamePickFood/tempWater.png');
    }

    create() {
        super.create();
        
        this.uiScene = this.scene.get('uiScene');
        this.uiScene.setInstructions('Eat American Food!');

        this.background = this.add.rectangle(0, 0, gameCenterX*2, gameCenterY*2, 0xFFFFFF).setOrigin(0);
        this.pointer = game.input.activePointer;

        this.result = false;
        this.clicked = false;

        this.wrongFood = ['boba', 'dumpling', 'ramen', 'sushi'];
        this.rightFood = ['sandwich', 'water'];

        this.foodA = this.wrongFood[Math.floor(Math.random()*this.wrongFood.length)];
        this.foodB = this.rightFood[Math.floor(Math.random()*this.rightFood.length)];

        let leftRight = Math.random();
        if(leftRight < .5){
            this.wrong = this.add.sprite(gameCenterX - 300, gameCenterY, this.foodA);
            this.right = this.add.sprite(gameCenterX + 300, gameCenterY, this.foodB);
        } else {
            this.right = this.add.sprite(gameCenterX - 300, gameCenterY, this.foodB);
            this.wrong = this.add.sprite(gameCenterX + 300, gameCenterY, this.foodA);
        }

        this.right.setInteractive();
        this.wrong.setInteractive(); 

        this.right.on('pointerup', () => {
            // console.log('Picked Right');
            this.uiScene.createSuccess(this.pointer.x, this.pointer.y);
            if(!this.clicked){
                this.clicked = true;
                this.finish(true);
            }   
        });

        this.wrong.on('pointerup', () => {
            this.uiScene.createFailure(this.pointer.x, this.pointer.y);
            if(!this.clicked){
                this.clicked = true;
                this.finish(false);
            }            
        });

        
    }

    update() {

    }
}