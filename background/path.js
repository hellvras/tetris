export class Path {
    #point;
    #newPoint;
    #angle;
    #stepLength;
    #color;
    #active = true;

    constructor(x, y) {
        this.#point = { x, y };
        const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
        this.#angle = angles[Math.floor(Math.random() * 4)];
        this.#stepLength = Math.random() * 20;

        const h = 270 + (Math.random() - 0.5) * 40;  // 250-290, lila toner
        const s = 30 + Math.random() * 40;            // 30-70%
        const l = 10 + Math.random() * 30;            // 10-40%, lagom mörkt
        this.#color = `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    isActive() {
        return this.#active;
    }

    stop() {
        this.#active = false;
    }

    update() {
        if (!this.#active) return;
        this.addPoint();
    }
    addPoint() {
        const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
        this.#angle = angles[Math.floor(Math.random() * 4)];
        const last = this.#point;

        this.#stepLength = Math.random() * 20;
        this.#newPoint = {
            x: last.x + Math.cos(this.#angle) * this.#stepLength,
            y: last.y + Math.sin(this.#angle) * this.#stepLength
        };
    }

    draw(ctx) {
        if (this.#newPoint) {
            ctx.beginPath();
            ctx.moveTo(this.#point.x, this.#point.y);
            ctx.lineTo(this.#newPoint.x, this.#newPoint.y);
        }
        ctx.strokeStyle = this.#color;
        ctx.lineWidth = 2;
        ctx.stroke();
        this.#point = this.#newPoint;
    }
}