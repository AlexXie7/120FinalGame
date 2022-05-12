class minigamePickFood extends Minigame {
    constructor(id = 'PickFood') {
        super(id);
    }

    preload() {
        super.preload();

        // Wrong foods (Way more)
        this.load.image('boba', './assets/miniPickFood/tempBoba.jpg');
        this.load.image('dumpling', './assets/miniPickFood/tempDumpling.jpg');
        this.load.image('ramen', './assets/miniPickFood/tempRamen.png');
        this.load.image('sushi', './assets/miniPickFood/tempSushi.png');

        // Right foods (Only Sandwich and water)
        this.load.image('sandwich', './assets/miniPickFood/tempSandwich.png');
        this.load.image('water', './assets/miniPickFood/tempWater.png');
    }

    create() {
        super.create();

        this.background = this.add.rectangle(0, 0, gameCenterX*2, gameCenterY*2, 0xFFFFFF).setOrigin(0)

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
            this.finish(true);
        });

        this.wrong.on('pointerup', () => {
            this.finish(false);
        });

    }

    update() {

    }
}