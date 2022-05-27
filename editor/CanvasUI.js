

class CanvasUI extends Phaser.Scene {
    constructor() {
        super('canvasUIScene');
    }

    preload() {

    }

    create() {

        this.graphics = this.add.graphics();


        // rotation tool
        this.rotationTool = this.add.circle(0,0,10,0x00FFFF,0);
        this.rotationTool.setVisible(false);
        this.rotationTool.setInteractive({
            draggable: true
        })
        this.rotationTool.on(Phaser.Input.Events.DRAG_START, (pointer) => {
            this.rotationTool.isDragging = true;
        });
        this.rotationTool.on(Phaser.Input.Events.DRAG, (pointer) => {
            const object = this.drawingObject;
            const dif = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(object.originPoint);
            let rotation; 
            if (dif.x >= 0) {
                rotation = Math.atan(dif.y / dif.x) + Math.PI / 2;
            } else {
                rotation = Math.atan(dif.y / dif.x) - Math.PI / 2;
            }
            object.setRotation(rotation);
            // dif.normalize().scale((object.displayHeight / 2 + 40));
            // this.rotationTool.setPosition(object.originPoint.x + dif.x, object.originPoint.y + dif.y);
        });
        this.rotationTool.on(Phaser.Input.Events.DRAG_END, (pointer) => {
            this.rotationTool.isDragging = false;
        });


        // origin tool
        this.originTool = this.add.circle(0,0,10,0xFF00FF,0);
        this.originTool.dragStart = new Phaser.Math.Vector2(0,0);
        this.originTool.setVisible(false);
        this.originTool.setInteractive({
            draggable: true
        })
        this.originTool.on(Phaser.Input.Events.DRAG_START, (pointer) => {
            this.originTool.isDragging = true;
        });
        this.originTool.on(Phaser.Input.Events.DRAG, (pointer) => {
            const object = this.drawingObject;
            if (object) {

                const originalOrigin = new Phaser.Math.Vector2(object.displayOriginX, object.displayOriginY);
                const dif = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(object.getTopLeft());
                dif.rotate(-object.rotation);

                const originDif = dif.clone().subtract(originalOrigin);

                object.setDisplayOrigin(dif.x, dif.y);

                const p1 = object.getTopLeft();
                const p2 = object.getTopRight();
                const p3 = object.getBottomRight();
                const p4 = object.getBottomLeft();
                const hDif = p2.clone().subtract(p1);
                const vDif = p4.clone().subtract(p1);
                const hDir = hDif.clone().normalize();
                const vDir = vDif.clone().normalize();

                const newPos = new Phaser.Math.Vector2(object.x, object.y)
                    .add(hDir.scale(originDif.x)).add(vDir.scale(originDif.y));
                    object.setPosition(newPos.x, newPos.y);
            }
        });
        this.originTool.on(Phaser.Input.Events.DRAG_END, (pointer) => {
            this.originTool.isDragging = false;
            
        });

    }

    update(time, delta) {
        this.graphics.clear();
        
    }

    deselect() {
        this.rotationTool.setVisible(false);
        this.originTool.setVisible(false);
    }

    drawSelection(object) {
        this.drawingObject = object;

        this.graphics.lineStyle(2, 0xFFFF00);

        const p1 = object.getTopLeft();
        const p2 = object.getTopRight();
        const p3 = object.getBottomRight();
        const p4 = object.getBottomLeft();
        this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        this.graphics.lineBetween(p2.x, p2.y, p3.x, p3.y);
        this.graphics.lineBetween(p3.x, p3.y, p4.x, p4.y);
        this.graphics.lineBetween(p4.x, p4.y, p1.x, p1.y);
        
        this.graphics.lineStyle(2, 0xFF00FF);

        if (!object.originPoint) {
            object.originPoint = new Phaser.Math.Vector2(0,0);
        }
        const hDif = p2.clone().subtract(p1);
        const vDif = p4.clone().subtract(p1);
        object.originPoint.copy(p1).add(hDif.scale(object.originX)).add(vDif.scale(object.originY));

        this.graphics.lineBetween(object.originPoint.x - 10, object.originPoint.y, object.originPoint.x + 10, object.originPoint.y);
        this.graphics.lineBetween(object.originPoint.x, object.originPoint.y - 10, object.originPoint.x, object.originPoint.y + 10);


        // rotation tool
        this.graphics.lineBetween(object.originPoint.x, object.originPoint.y, this.rotationTool.x, this.rotationTool.y);
        this.rotationTool.setVisible(true);
        // if (!this.rotationTool.isDragging) {
        const rotationLine = new Phaser.Math.Vector2(0,-(object.displayHeight / 2 + 40))
            .rotate(object.angle * Math.PI / 180)
            .add(object.originPoint);

        this.rotationTool.setPosition(rotationLine.x, rotationLine.y);
        this.graphics.fillStyle(0x00FFFF);
        this.graphics.fillCircle(this.rotationTool.x, this.rotationTool.y, 10);
        // }

        // origin tool
        this.originTool.setVisible(true);
        if (!this.originTool.isDragging) {
            this.originTool.setPosition(object.originPoint.x, object.originPoint.y);
        }
        this.graphics.strokeCircle(object.originPoint.x, object.originPoint.y, 10);
        
    }
}
