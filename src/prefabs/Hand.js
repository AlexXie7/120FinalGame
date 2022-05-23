

class Hand extends Phaser.GameObjects.Sprite {
    static states = {
        POINTER: {
            frame: 0,
            originX: .15,
            originY: .15
        },
        OPEN: {
            frame: 1,
            originX: .5,
            originY: .5
        },
        CLOSED: {
            frame: 2,
            originX: .5,
            originY: .5
        }
    }
    
    constructor(scene, options = {}) {
        super(scene, options.x || gameCenterX, options.y || gameCenterY, 'handSheet', options.frame || 0);
        scene.add.existing(this);
        if (scene.activeHands) {
            scene.activeHands.push(this);
        }
        this.setDepth(options.depth || 0);
        this.setReference(options.reference);
        this.offsetX = 0;
        this.offsetY = 0;
        this.setState(Hand.states.POINTER);
        if (options.state) {
            this.setState(options.state);
        }
        this.isDestroyed = false;
    }

    update(time, delta) {
        if (this.reference) {
            this.x = this.reference.x + this.offsetX;
            this.y = this.reference.y + this.offsetY;
        }
    }

    // set the reference for the hand to follow
    // must have x: property and y: property
    setReference(reference) {
        if (this.reference === reference) {
            return this;
        }
        if (reference && reference.x !== undefined && reference.y !== undefined) {
            this.reference = reference;
            return this;
        }
        return;
    }

    // set the state of the hand
    // example: setState(Hand.states.OPEN) // Hand.states.CLOSED, Hand.states.POINTER
    // example: setState(0) = setState(Hand.states.POINTER) // 0, 1, 2
    // example: setState("POINTER") = setState(Hand.states.POINTER) // "OPEN", "CLOSED"
    // note: state change actions are only triggered if the new state !== current state
    setState(state, options = {ignoreOrigin: false}) {
        let newState;
        if (typeof state === 'string') {
            newState = Hand.states[state.toUpperCase()];
        } else if (typeof state === 'number') {
            if (!Hand.stateEntries) {
                Hand.stateEntries = Object.entries(Hand.states);
            }
            if (state >= Hand.stateEntries.length) {
                return;
            }
            newState = Object.entries(Hand.states)[state][1];
        } else if (typeof state === 'object') {
            newState = state;
        } else {
            return;
        }
        if (!newState) {
            return;
        }
        if (this.state && newState === this.state) {
            return;
        }
        if (typeof newState === 'object') {
            this.setFrame(newState.frame);
            if (!options.ignoreOrigin) {
                this.setOrigin(newState.originX, newState.originY);
            }
        } else {
            this.setFrame(newState);
        }
        this.state = newState;
        return this;
    }

    destroy() {
        super.destroy();
        this.isDestroyed = true;
    }
}