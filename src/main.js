const minigameClasses = [];

// holds minigame names, without minigame in the title
// ex: SchoolGum
const minigameNames = {}

// process minigame scripts from the document to somewhat automate
for (const zoneName of ['home','school','town','plaza']) {

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
    const minigameScripts = document.querySelectorAll(`[src^="./src/scenes/${zoneName}"]`);
    minigameNames[zoneName] = [];

    for (const script of minigameScripts) {
        const split = script.getAttribute('src').split('/');
        const fileName = split[split.length-1];

        // remove .js from fileName for className
        const className = fileName.slice(0, fileName.length - 3);

        // since there is no way of getting es6 classes by string, you can eval it instead to get it
        // only used in loading stage, so performance is not so important
        // probably not very safe, but there is not much to damage
        const minigameClass = eval(className);
        minigameClasses.push(minigameClass);

        // add minigame name to minigame names
        minigameNames[zoneName].push(className.slice(8));
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // width: window.innerWidth * window.devicePixelRatio,
        // height: window.innerHeight * window.devicePixelRatio
    },
    scene: [Menu, Play, Minigame, minigameTutorial, UI].concat(minigameClasses), // adds minigameClasses to the scene list
};


config.scale.width = 1200;
config.scale.height = 900;
const game = new Phaser.Game(config);

// reserve WASD
let keyW, keyA, keyS, keyD;

const scaleRatio = window.devicePixelRatio / 3;

// center Y value of the game
let gameCenterY = config.scale.height / 2;
// center X value of the game
let gameCenterX = config.scale.width  / 2;

// phaser event manager
const eventEmitter = new Phaser.Events.EventEmitter();


// if true, skip to tutorial with no menu
const DEBUG_SKIP_MENU = true;
// if true, skip to play scene with no tutorial
const DEBUG_SKIP_TUTORIAL = true;