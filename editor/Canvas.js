

class Canvas extends Phaser.Scene {
    constructor() {
        super('canvasScene');
    }

    preload() {

    }

    create() {
        this.add.text(40,40,'canvasScene');

        this.loadedKeys = {};

        this.objects = [];

        const exportTool = ToolbarManager.add('Export');

        exportTool.add('compile to string', {callback: () => {
            const dialog = Dialog.CreateDialog('export string');
            dialog.addButton('x close', () => {dialog.close()});

            let code = '\n';

            // add preloads
            code += '// copy to preload()\n\n';
            for (const [key, value] of Object.entries(this.loadedKeys)) {
                switch(value.loadType) {
                    case 'spritesheet': {
                        code += `this.load.${value.loadType}('${key}', '${value.url.pathname}', {frameWidth: ${value.config.frameWidth}, frameHeight: ${value.config.frameHeight}});\n`;
                        break;
                    }
                    default:
                        code += `this.load.${value.loadType}('${key}', '${value.url.pathname}');\n`;
                }
                
            }

            code += '\n\n';

            // add creates
            const usedNames = {};
            code += '// copy to create()\n\n';
            for (const object of this.objects) {
                const key = object.texture.key;
                const data = this.loadedKeys[key];
                let name = object.name && object.name !== '' ? object.name : key;
                if (usedNames[name]) {
                    usedNames[name] += 1;
                    name += (usedNames[name] - 1).toString();
                } else {
                    usedNames[name] = 1;
                }
                code += `this.${name} = this.add.${data.createType}(${object.x}, ${object.y}, '${key}')`;
                code += `.setOrigin(${object.originX}, ${object.originY})`;
                code += `.setScale(${object.scaleX}, ${object.scaleY})`;
                if (object.angle) {
                    code += `.setAngle(${object.angle})`;
                }
                code += ';\n';
            }

            dialog.addCode(code);
        }});

        const sceneTool = ToolbarManager.add('Scene');

        {
            const add = sceneTool.add('add');
            add.add('image', {callback: () => {
                this.createImageDialog();
            }})

            add.add('sprite', {callback: () => {
                this.createSpriteDialog();
            }})
            

            const duplicate = sceneTool.add('duplicate', {callback: () => {
                const dialog = Dialog.CreateDialog('select key to duplicate');
                dialog.addButton('x close', () => {dialog.close()});
                const keys = Object.keys(this.loadedKeys);
                if (!keys || keys.length === 0) {
                    dialog.addText('no keys added yet. use Scene > add instead');
                }
                for (const key of keys) {
                    dialog.addButton(key, () => {
                        // this.addSprite(key);
                        this.addFromType(key, this.loadedKeys[key].type);
                    })
                }
            }});
        }

        this.load.on('filecomplete', (key, type) => {
            let createType = '';
            switch (type) {
                case 'spritesheet':
                    createType = 'sprite';
                    break;
                default:
                    createType = type;
            }
            this.loadedKeys[key] = {loadType: type, createType, type: createType,path: undefined, url: undefined};
            this.events.emit(key + 'loaded')
        });

        this.interactiveObjectsOver = 0;

        this.input.on('pointerdown', () => {
            if (this.interactiveObjectsOver === 0) {
                this.deselect();
            }
        })

        this.canvasUI = this.scene.get('canvasUIScene');

        this.selectedObject;
    }

    addSprite(key) {
        console.log('adding ' + key + ' as sprite');
        const sprite = this.add.sprite(gameCenterX, gameCenterY, key);
        sprite.name = key;
        this.objects.push(sprite);
        // sprite.setOrigin(.5);
        this.initInteractive(sprite);
        this.select(sprite);
        return sprite;
    }

    addImage(key) {
        console.log('adding ' + key + ' as image');
        const image = this.add.image(gameCenterX, gameCenterY, key);
        image.name = key;
        this.objects.push(image);
        this.initInteractive(image);
        this.select(image);
        return image;
    }

    addFromType(key, type) {
        if (!type) {
            type = this.loadedKeys[key]?.type;
        }
        switch (type) {
            case 'image': {
                this.addImage(key);
                break;
            }
            case 'sprite': {
                this.addSprite(key);
                break;
            }
            default: {
                console.log('unhandled type');
            }
        }
    }

    initInteractive(object) {
        object.setInteractive({
            draggable: true
        });
        let dragOffset = new Phaser.Math.Vector2(0,0);
        object.on(Phaser.Input.Events.DRAG_START, (pointer) => {
            this.select(object);
            dragOffset.x = pointer.x - object.x;
            dragOffset.y = pointer.y - object.y;
            // this.selectedObject = object;
        });
        object.on(Phaser.Input.Events.DRAG, (pointer) => {
            object.x = pointer.x - dragOffset.x;
            object.y = pointer.y - dragOffset.y;
        });
        object.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.interactiveObjectsOver += 1;
        })
        object.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.interactiveObjectsOver -= 1;
        })
        object.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
            // object.x = pointer.x
            // object.y = pointer.y
        });
    }

    select(object) {
        if (this.selectedObject === object) {
            return;
        }
        this.selectedObject = object;
        PropertiesManager.clear();

        // manually add properties
        PropertiesManager.addInputText('name', object, 'name');
        PropertiesManager.addInputNumber('x', object, 'x');
        PropertiesManager.addInputNumber('y', object, 'y');
        PropertiesManager.addInputNumber('scaleX', object, 'scaleX');
        PropertiesManager.addInputNumber('scaleY', object, 'scaleY');
        PropertiesManager.addInputRange('originX', object, 'originX', {
            callbackOverride: (value) => {
                object.setOrigin(value, object.originY);
            },
            min: 0, max: 1, step: .01
        });
        PropertiesManager.addInputRange('originY', object, 'originY', {
            callbackOverride: (value) => {
                object.setOrigin(object.originX, value);
            },
            min: 0, max: 1, step: .01
        });
        PropertiesManager.addInputNumber('angle', object, 'angle');

    }


    async checkIfPathExists(path) {
        console.log('checking path',path);
        return new Promise((resolve, reject) => {
            fetch(window.location.origin + '/' + path)
                .then(async response => {
                    const isJson = response.headers.get('content-type')?.includes('application/json');
                    const data = isJson ? await response.json() : null;

                    // check for error response
                    if (!response.ok) {
                        // get error message from body or default to response status
                        const error = (data && data.message) || response.status;
                        return Promise.reject(error);
                    }

                    resolve();
                })
                .catch(error => {
                    console.log('path doesnt seem to exist', error);
                    // dialog.setError('error - path doesnt seem to exist - ' + error);
                    // dialog.setDisabled(false);

                    reject(error);
                });
        })
    }

    createImageDialog() {
        const dialog = Dialog.CreateDialog('add image');
        dialog.addButton('x cancel', () => {dialog.close()});
        // dialog.addText('enter name');
        // const nameInput = dialog.addInput('text');
        dialog.addText('enter key');
        const keyInput = dialog.addInput('text');
        dialog.addText('enter path or url (if not already loaded)');
        const pathInput = dialog.addInput('text');
        dialog.addButton('add', () => {
            try {
                dialog.setDisabled();

                // if (!nameInput.value) {
                //     throw 'no name specified. please specify name';
                // }

                if (keyInput.value) {
                    const key = keyInput.value;
                    if (this.loadedKeys[key]) {
                        this.addFromType(key, this.loadedKeys[key].type);
                        dialog.close();
                    } else {
                        if (!pathInput.value) {
                            throw 'this key is not loaded yet. please specify a path'
                        }
                        const path = pathInput.value;
                        this.checkIfPathExists(path)
                            .then(() => {
                                console.log('good path')
                                this.events.once(key + 'loaded', () => {
                                    this.loadedKeys[key].path = path;
                                    this.loadedKeys[key].url = new URL(window.location.origin + '/' + path);
                                    const image = this.addImage(key);
                                    image.name = key;
                                    dialog.close();
                                })
                                this.load.image(key, path);
                                this.load.start();
                            })
                            .catch(error => {
                                dialog.setError('error - path doesnt seem to exist - ' + error);
                                dialog.setDisabled(false);
                            });
                    }
                } else {
                    throw 'no key specified. please specify a key'
                }
            } catch(error) {
                console.log('error adding sprite',error);
                dialog.setDisabled(false);
                dialog.setError('error - ' + error);
            }
            
        });
        return dialog;
    }

    createSpriteDialog() {
        const dialog = Dialog.CreateDialog('add sprite');
        dialog.addButton('x cancel', () => {dialog.close()});
        // dialog.addText('enter name');
        // const nameInput = dialog.addInput('text');
        dialog.addText('enter key');
        const keyInput = dialog.addInput('text');
        dialog.addText('enter path or url (if not already loaded)');
        const pathInput = dialog.addInput('text');
        dialog.addText('frame width');
        const frameWidth = dialog.addInput('number', {step: 1, max:2000});
        dialog.addText('frame height');
        const frameHeight = dialog.addInput('number', {step: 1, max:2000});
        // dialog.addText('start frame');
        // const startFrame = dialog.addInput('number', {step: 1, max:2000});
        // dialog.addText('end frame');
        // const endFrame = dialog.addInput('number', {step: 1}, max:2000);
        dialog.addButton('add', () => {
            try {
                dialog.setDisabled();
                // if (!nameInput.value) {
                //     throw 'no name specified. please specify name';
                // }

                if (keyInput.value) {
                    const key = keyInput.value;
                    if (this.loadedKeys[key]) {
                        this.addSprite(key);
                        dialog.close();
                    } else {
                        if (!pathInput.value) {
                            throw 'this key is not loaded yet. please specify a path'
                        }
                        const path = pathInput.value;
                        this.checkIfPathExists(path)
                            .then(() => {
                                this.events.once(key + 'loaded', () => {
                                    this.loadedKeys[key].path = path;
                                    this.loadedKeys[key].url = new URL(window.location.origin + '/' + path);
                                    this.loadedKeys[key].config = {
                                        frameWidth: parseInt(frameWidth.value),
                                        frameHeight: parseInt(frameHeight.value)
                                    };
                                    const sprite = this.addSprite(key);
                                    sprite.name = key;
                                    dialog.close();
                                })
                                this.load.spritesheet(key, path, {
                                    frameWidth: parseInt(frameWidth.value),
                                    frameHeight: parseInt(frameHeight.value)
                                });
                                this.load.start();
                            })
                            .catch(error => {
                                dialog.setError('error - path doesnt seem to exist - ' + error);
                                dialog.setDisabled(false);
                            });
                    }
                } else {
                    throw 'no key specified. please specify a key'
                }
            } catch(error) {
                console.log('error adding sprite',error);
                dialog.setDisabled(false);
                dialog.setError('error - ' + error);
            }
        });
        return dialog;
    }

    deselect() {
        this.selectedObject = undefined;
        PropertiesManager.clear();

        this.canvasUI.deselect();
    }

    update(time, delta) {
        
        
        if (this.selectedObject) {
            this.canvasUI.drawSelection(this.selectedObject);
        }
    }
}