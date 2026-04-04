// drawBlock.js
export function drawBlock(ctx, px, py, blockSize, color) {
    const gap = 1;
    const radius = 5;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(px + gap, py + gap, blockSize - gap * 2, blockSize - gap * 2, radius);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.fillRect(px + gap, py + gap, blockSize - gap * 2, 3);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.11)';
    ctx.fillRect(px + gap, py + blockSize - gap - 3, blockSize - gap * 2, 3);
    ctx.fillRect(px + blockSize - gap - 3, py + gap, 3, blockSize - gap * 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    const inner = blockSize * 0.25;
    ctx.fillRect(px + inner, py + inner, blockSize - inner * 2, blockSize - inner * 2);
}