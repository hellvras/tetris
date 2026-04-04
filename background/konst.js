import { Path } from './path.js';

export class Konst {
    #canvas; #ctx; #buffer; #bufferCtx; #width; #height; #objects;
    
    constructor(canvas, ctx) {
        this.#canvas = canvas;
        this.#ctx = ctx;
        this.#buffer = document.createElement('canvas');
        this.#bufferCtx = this.#buffer.getContext('2d');
        this.#width = canvas.width;
        this.#height = canvas.height;
        this.#objects = [];
    }

    setOrigin(originX, originY, width, height) {
        const spacing = 50;
        // vänster kant
        for (let y = originY; y <= originY + height; y += spacing)
            this.#objects.push(new Path(originX, y));
        // höger kant
        for (let y = originY; y <= originY + height; y += spacing)
            this.#objects.push(new Path(originX + width, y));
        // topp
        for (let x = originX; x <= originX + width; x += spacing)
            this.#objects.push(new Path(x, originY));
        // botten
        for (let x = originX; x <= originX + width; x += spacing)
            this.#objects.push(new Path(x, originY + height));
    }

    objects() {
        return this.#objects;
    }

    start() {
        this.resize();
        this.#bufferCtx.clearRect(0, 0, this.#width, this.#height);
    this.#objects = [];
        this.animate();
    }

    animate() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        for (let obj of this.#objects) {
            obj.update();
            obj.draw(this.#bufferCtx);  // rita till buffert
        }
        // ta bort inaktiva objekt om för många
        if (this.#objects.length > 500) {
            this.#objects = this.#objects.filter(obj => obj.isActive());
        }
        this.#ctx.drawImage(this.#buffer, 0, 0);  // kopiera buffert till canvas
        requestAnimationFrame(() => this.animate());
    }

resize() {
    // spara bufferten
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = this.#buffer.width;
    tempCanvas.height = this.#buffer.height;
    tempCtx.drawImage(this.#buffer, 0, 0);

    // ny storlek
    this.#width = window.innerWidth;
    this.#height = window.innerHeight - 4;
    this.#canvas.width = this.#width;
    this.#canvas.height = this.#height;
    this.#buffer.width = this.#width;
    this.#buffer.height = this.#height;

    // rita tillbaka
    this.#bufferCtx.drawImage(tempCanvas, 0, 0);
}
}