


const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // width: window.innerWidth * window.devicePixelRatio,
        // height: window.innerHeight * window.devicePixelRatio
    },
    scene: [Menu, Canvas, CanvasUI, Minigame, UI], // adds minigameClasses to the scene list
};


config.scale.width = 1200;
config.scale.height = 900;
let game;

// center Y value of the game
let gameCenterY = config.scale.height / 2;
// center X value of the game
let gameCenterX = config.scale.width  / 2;

// phaser event manager
const eventEmitter = new Phaser.Events.EventEmitter();

let interfaceContainer;

function main() {

    interfaceContainer = document.querySelector('#interface-container');
    PropertiesManager.init();
    ToolbarManager.init();

    game = new Phaser.Game(config);
}

const PropertiesManager = {
    init: () => {
        this.container = document.querySelector('#properties-container');
        this.table = this.container.querySelector('table');
        this.properties = [];

        this.updateInterval = setInterval(() => {
            PropertiesManager.update();
        }, 100);
    },
    clear: () => {
        while (this.table.firstChild) {
            this.table.removeChild(this.table.lastChild);
        }
        this.properties = [];
    },
    add: (key, value) => {
        const elm = document.createElement('tr');
        elm.innerHTML = `<td class="align-left">${key}</td><td class="align-right">${value}</td>`
        this.table.append(elm);
    },
    addInputText: (name, reference, key, options = {}) => {
        const elm = document.createElement('tr');
        const left = document.createElement('td');
        left.classList.toggle('align-left', true);
        left.textContent = name;

        const right = document.createElement('td');
        right.classList.toggle('align-right', true);
        const input = document.createElement('input');
        input.type = 'text';
        input.value = reference[key];

        const callbackOverride = options.callbackOverride;
        const updateOverride = options.updateOverride;

        input.addEventListener('input', (e) => {
            if (callbackOverride) {
                callbackOverride(input.checked);
            } else {
                reference[key] = input.value;
            }
        });
        right.append(input);

        elm.append(left);
        elm.append(right);
        this.table.append(elm);

        this.properties.push({key, reference, input, inputKey: 'value', updateOverride})
    },
    addInputBoolean: (name, reference, key, options = {}) => {
        const elm = document.createElement('tr');
        const left = document.createElement('td');
        left.classList.toggle('align-left', true);
        left.textContent = name;

        const right = document.createElement('td');
        right.classList.toggle('align-right', true);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = reference[key];

        const callbackOverride = options.callbackOverride;
        const updateOverride = options.updateOverride;

        input.addEventListener('change', (e) => {
            if (callbackOverride) {
                callbackOverride(input.checked);
            } else {
                reference[key] = input.checked;
            }
        });
        right.append(input);

        elm.append(left);
        elm.append(right);
        this.table.append(elm);

        this.properties.push({key, reference, input, inputKey: 'checked', updateOverride})
    },
    addInputNumber: (name, reference, key, options = {}) => {
        const elm = document.createElement('tr');
        const left = document.createElement('td');
        left.classList.toggle('align-left', true);
        left.textContent = name;

        const right = document.createElement('td');
        right.classList.toggle('align-right', true);
        const input = document.createElement('input');
        input.type = 'number';
        input.value = reference[key];
        input.min = options.min;
        input.max = options.max;
        input.step = options.step || .1;

        const callbackOverride = options.callbackOverride;
        const updateOverride = options.updateOverride;

        input.addEventListener('change', (e) => {
            if (callbackOverride) {
                callbackOverride(input.value);
            } else {
                reference[key] = input.value;
            }
        });
        right.append(input);

        elm.append(left);
        elm.append(right);
        this.table.append(elm);

        this.properties.push({key, reference, input, inputKey: 'value', updateOverride})
    },
    addInputRange: (name, reference, key, options = {}) => {
        const elm = document.createElement('tr');
        const left = document.createElement('td');
        left.classList.toggle('align-left', true);
        left.textContent = name;

        const right = document.createElement('td');
        right.classList.toggle('align-right', true);
        const input = document.createElement('input');
        input.type = 'range';
        input.value = reference[key];
        input.min = options.min || 0;
        input.max = options.max || 100;
        input.step = options.step || .1;

        const callbackOverride = options.callbackOverride;
        const updateOverride = options.updateOverride;

        input.addEventListener('input', (e) => {
            if (callbackOverride) {
                callbackOverride(input.value);
            } else {
                reference[key] = input.value;
            }
        });
        right.append(input);

        elm.append(left);
        elm.append(right);
        this.table.append(elm);

        this.properties.push({key, reference, input, inputKey: 'value', updateOverride})
    },
    addInputByType: (name, reference, key, options = {}) => {
        const type = typeof reference[key];
        switch (type) {
            case 'number': {
                PropertiesManager.addInputNumber(name, reference, key, options);
                break;
            }
            case 'boolean': {
                PropertiesManager.addInputBoolean(name, reference, key, options);
                break;
            }
            default:
                if (!options.ignoreUnhandled) {
                    PropertiesManager.add(key, reference[key]);
                }
        }
    },
    hide: () => {
        this.container.hidden = true;
    },
    show: () => {
        this.container.hidden = false;
    },
    remove: () => {},
    update: () => {
        for (let i = 0; i < this.properties.length; i++) {
            const property = this.properties[i];
            if (property.updateOverride) {
                property.updateOverride(property);
            } else {
                property.input[property.inputKey] = property.reference[property.key];
            }
        }
    }
}

class Tool {
    constructor(parent, name, options = {}) {
        this.name = name;
        this.parent = parent;
        this.children = options.children || [];

        this.container = document.createElement('div');
        this.container.classList.toggle('tool', true);
        
        this.childrenContainer = document.createElement('div');
        this.childrenContainer.classList.toggle('tool-children', true);
        this.childrenContainer.hidden = true;

        this.button = document.createElement('button');
        this.button.classList.toggle('tool-button', true);
        this.button.textContent = name;

        this.container.append(this.button);
        this.container.append(this.childrenContainer);

        this.callback = options.callback;
        this.isRoot = options.isRoot || false;


        this.button.addEventListener('click', (e) => {
            if (this.callback) {
                this.callback();
                this.button.blur();
            }
        })

        this.button.addEventListener('focus', (e) => {
            this.isFocused = true;
            this.showChildren();
            const box = this.button.getBoundingClientRect();
            if (this.isRoot) {
                this.childrenContainer.style.left = `${box.left}px`;
                this.childrenContainer.style.top = `${box.bottom}px`;
            } else {
                this.childrenContainer.style.left = `${this.container.getBoundingClientRect().right}px`;
                this.childrenContainer.style.top = `${box.top}px`;
            }
        });
        this.button.addEventListener('blur', (e) => {
            const interval = setInterval(() => {
                if (!this.anyChildFocused()) {
                    this.hideChildren();
                    this.isFocused = false;
                    clearInterval(interval);
                }
                
            }, 1000 / 60)
        })
    }

    add(name, options = {}) {
        const tool = new Tool(this, name, options);
        this.childrenContainer.append(tool.container);
        this.children.push(tool);
        return tool;
    }

    setDisabled(bool = true) {
        this.button.disabled = bool;
    }

    hide() {
        this.container.hidden = true;
    }

    show() {
        this.container.hidden = false;
    }

    hideChildren() {
        this.childrenContainer.hidden = true;
    }

    showChildren() {
        this.childrenContainer.hidden = false;
    }

    anyChildFocused() {
        for (const child of this.children) {
            if (child.isFocused) {
                return true;
            }
        }
        return false;
    }
}


const ToolbarManager = {
    init: () => {
        this.options = {}
        this.element = document.querySelector('#toolbar');
    },
    add: (name, options = {}) => {
        options.isRoot = true;
        const tool = new Tool(undefined, name, options);
        this.element.append(tool.container);
        this.options[name] = tool;
        return tool;
    },
    get: (name) => {
        return this.options[name];
    } 
}


class Dialog {

    constructor(title, options = {}) {
        this.title = document.createElement('p');
        this.title.textContent = title;
        this.container = document.createElement('div');
        this.container.classList.toggle('dialog',true);
        this.childrenContainer = document.createElement('div');
        this.error = document.createElement('p');
        this.error.classList.toggle('dialog-error', true);

        this.container.append(this.title)
        this.container.append(this.childrenContainer);
        this.container.append(this.error);

        this.parent = interfaceContainer;
        this.parent.append(this.container);
    }

    close() {
        this.parent.removeChild(this.container);
    }

    setDisabled(bool = true) {
        for (const child of this.childrenContainer.children) {
            child.disabled = bool;
        }
    }

    addText(text) {
        const elm = document.createElement('p');
        elm.textContent = text;
        this.childrenContainer.append(elm);
        return elm;
    }

    addCode(code) {
        const elm = document.createElement('p');
        elm.style.fontFamily = 'monospace';
        elm.style.whiteSpace = 'pre-wrap';
        elm.style.fontSize = '10px';
        elm.textContent = code;
        this.childrenContainer.append(elm);
        return elm;
    }

    addButton(text, callback = () => {}) {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', (e) => {callback(e)});
        this.childrenContainer.append(button);
        return button;
    }

    addInput(type, options = {}) {
        const changeCallback = options.changeCallback;
        const inputCallback = options.inputCallback;
        const input = document.createElement('input');
        input.type = type;
        if (type === 'number' || type === 'range') {
            input.min = options.min || 0;
            input.max = options.max || 100;
            input.step = options.step || .1;
            input.value = options.value || input.min;
        } else if (type === 'checkbox') {
            input.checked = options.checked || false;
        }
        if (inputCallback) {
            input.addEventListener('input', (e) => {inputCallback(e)});
        }
        if (changeCallback) {
            input.addEventListener('change', (e) => {changeCallback(e)});
        }
        this.childrenContainer.append(input);
        return input;
    }

    setError(error) {
        this.error.textContent = error;
        return this.error;
    }

    static CreateDialog(title, options = {}) {
        const dialog = new Dialog(title, options);
        // interfaceContainer.append(dialog);
        return dialog;
    }
}