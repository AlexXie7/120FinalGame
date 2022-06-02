class Timer {
    static timers = [];

    constructor(options = {}) {
        this.lifeTime = options.duration || options.lifeTime || 1000;
        this.once = options.once || false;
        this.timer = 0;
        this.enabled = true;
        this.paused = false;
        this.isActive = false;
        this.isFinished = true;
        this.callbacks = options.callbacks || [];
        this.updateCallbacks = [];
        if (options.callback) {
            this.callbacks.push(callback);
        }
        if (options.updateCallback) {
            this.updateCallbacks.push(updateCallback);
        }
    }

    // updates the timer, from the scene update() function
    update(time, delta) {
        if (this.enabled && !this.paused) {
            if (this.isFinished) {
                return;
            }

            if (this.timer >= this.lifeTime) {
                this.timer = this.lifeTime;
                this.isFinished = true;
                while (this.callbacks.length > 0) {
                    const callback = this.callbacks.pop();
                    callback();
                }
            }

            for (const callback of this.updateCallbacks) {
                callback(time, delta, this);
            }

            this.timer += delta;
        }
    }
    // starts timer from beginning
    start(duration, finishCallback, updateCallback) {
        this.lifeTime = duration || this.lifeTime;
        this.isFinished = false;
        this.isActive = true;
        this.timer = 0;
        if (finishCallback) {
            this.callbacks.push(finishCallback);
        }
        if (updateCallback) {
            this.updateCallbacks.push(updateCallback);
        }
        Timer.timers.push(this);
        return this;
    }
    // stops timer
    stop() {
        this.isFinished = true;
        this.isActive = false;
        this.callbacks = [];
    }

    // get the timer progress between 0 and 1
    getProgress() {
        return this.timer / this.lifeTime;
    }

    // sets the pause state of the timer
    setPaused(bool) {
        this.paused = bool;
    }

    // sets whether the timer is destroyed after finishing
    setOnce(bool) {
        this.once = bool;
    }

    static update(time, delta) {
        for (let i = 0; i <  this.timers.length; i++) {
            const timer = this.timers[i];
            if (timer.isFinished) {
                this.timers.splice(i, 1);
                i -= 1;
            } else {
                timer.update(time, delta);
            }
        }
    }
}