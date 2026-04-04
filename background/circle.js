export class Circle {
    #x; #y; #radius; #color;

    constructor(x, y, radius) {
        this.#x = x;
        this.#y = y;
        this.#radius = radius;
        this.#color = 'blue';
    }

    update() {
        // Update circle properties
        this.#x += (Math.random() - 0.5) * 2; // Random movement
        this.#y += (Math.random() - 0.5) * 2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.#x, this.#y, this.#radius, 0, Math.PI * 2);
        ctx.fillStyle = this.#color;
        ctx.fill();
    }
}
