
// class that stores zone information
class Zone {
    constructor(scene, x, y, name, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.name = name;
        this.minigames = options.minigames || [];
        this.sprite = options.sprite;
        this.rotation = options.rotation || 0;
        this.scale = options.scale || 1;
        this.isPlaying = options.isPlaying || false;
        this.pathToCenter = options.pathToCenter || [];

        // set in play scene
        // called by zone when the zone is clicked
        this.clickCallback = () => {};

        this.spriteY = this.sprite.y;
        // console.log(this.spriteY);
        // tweens
        this.tween = scene.tweens.add({
            targets: this.sprite,
            //ease: 'Sine.easeInOut',
            props: {
                scale: {value: this.scale*1.3, duration: 2500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1},
                angle: {from: '355', to: '365', duration: 3000, ease: 'Sine.easeInOut',clockwise: false, yoyo: true, repeat: -1},
                y: {value: this.spriteY - 50, duration:1500, ease:'Sine.easeInOut', yoyo:true, repeat: -1}
            },
            //loop: 1,
            paused: true,
        })

        // interactivity for the town sprites
        this.sprite.setInteractive();

        // On hover over sprite
        this.sprite.on('pointerover', () => {
            console.log('Over the ' + this.name);
            this.tween.play();

        });

        // On hover off sprite
        this.sprite.on('pointerout', () => {
            console.log('Off the ' + this.name);
            this.tween.pause();
            this.sprite.setScale(this.scale);
            this.sprite.setAngle(0);
            this.sprite.y = this.spriteY;
        });
        
        // On click release
        // This is how we enter the minigames? 
        this.sprite.on('pointerup', () => {
            console.log('Clicked the ' + this.name);
            this.clickCallback(this)
        });
    }

    // returns random minigame name from this.minigames
    // removes the minigame from the list
    getRandomMinigame(removeMinigame = true) {
        // reset minigame array if empty
        if (this.minigames.length === 0) {
            this.minigames = Array.from(minigameNames[this.name]);
        }

        const index = Math.floor(Math.random() * this.minigames.length);
        const minigameName = this.minigames[index];
        if (removeMinigame) {
            this.minigames.splice(index, 1);
        }
        return minigameName;
    }
}