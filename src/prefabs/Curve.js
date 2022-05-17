
function lerp(a, b, t = 0) {
    return new Phaser.Math.Vector2(
        a.x + t * (b.x - a.x),
        a.y + t * (b.y - a.y)
    );
}

// use Phaser vector2s or objects of {x,y}
class LinearCurve {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    at(t) {
        return lerp(this.start, this.end, t);
    }
}

class QuadraticCurve {
    constructor(start, control, end) {
        this.start = start;
        this.control = control;
        this.end = end;

        this.curveA = new LinearCurve(this.start, this.control);
        this.curveB = new LinearCurve(this.control, this.end);
    }

    at(t) {
        return lerp(this.curveA.at(t), this.curveB.at(t), t);
    }
}