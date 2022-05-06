const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth * window.devicePixelRatio,
        height: window.innerHeight * window.devicePixelRatio
    },
    scene: [Play, Minigame, minigamePickFood],
};

const game = new Phaser.Game(config);

//reserve WASD
let keyW, keyA, keyS, keyD;

const scaleRatio = window.devicePixelRatio / 3;

// Center Y value of the game
let gameCenterY = config.scale.height / 2;
// Center X value of the game
let gameCenterX = config.scale.width  / 2;