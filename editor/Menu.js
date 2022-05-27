

class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    preload() {

    }


    create() {
        
        this.add.text(20,20,'canvas');

        // const buttonConfig = {
        //     fontSize: '80px',
        //     backgroundColor: '#00f',
        //     color: '#ff0'
        // }
        // this.newButton = this.add.text(gameCenterX, gameCenterY, 'new minigame', buttonConfig).setOrigin(.5);
        // this.initButton(this.newButton, () => {
        //     this.scene.launch('canvasScene');
        //     const canvasScene = this.scene.get('canvasScene');
        //     canvasScene.sys.events.once(Phaser.Scenes.Events.CREATE, () => {
        //         console.log('canvas created');
        //     })
        // })
        this.scene.launch('canvasUIScene');

        ToolbarManager.add('New Minigame', {callback: () => {
            this.scene.launch('canvasScene');
            const canvasScene = this.scene.get('canvasScene');
            canvasScene.sys.events.once(Phaser.Scenes.Events.CREATE, () => {
                console.log('canvas created');

                this.scene.bringToTop('canvasUIScene');

            })
            ToolbarManager.get('New Minigame').setDisabled();
        }});

    }


    update() {

    }

    initButton(object, callback = () => {}) {
        object.setInteractive()
        object.on(Phaser.Input.Events.PIONTER_OVER, () => {

        })
        object.on(Phaser.Input.Events.PIONTER_OUT, () => {
            
        })
        object.on(Phaser.Input.Events.POINTER_UP, () => {
            callback();
        });
    }

}

