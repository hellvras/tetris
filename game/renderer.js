import { drawBlock } from './drawblock.js';

export class Renderer {
    #ctx;
    #blockSize;
    #boardOffset;
    #panelWidth;
    #cols;
    #rows;

    constructor(ctx, blockSize, boardOffset, panelWidth, cols, rows) {
        this.#ctx = ctx;
        this.#blockSize = blockSize;
        this.#boardOffset = boardOffset;
        this.#panelWidth = panelWidth;
        this.#cols = cols;
        this.#rows = rows;
    }

    clear(canvas) {
        this.#ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawHold(piece) {
        if (!piece) return;
        const bs = this.#blockSize * 0.6;
        const { minX, width } = piece.bounds();
        const offsetX = (this.#panelWidth - width * bs) / 2 - minX * bs;
        piece.drawPanel(this.#ctx, bs, offsetX, 40);
    }

    drawQueue(queue) {
        const bs = this.#blockSize * 0.6;
        const panelX = this.#boardOffset + this.#cols * this.#blockSize;
        queue.forEach((piece, i) => {
            const { minX, width } = piece.bounds();
            const offsetX = panelX + (this.#panelWidth - width * bs) / 2 - minX * bs;
            piece.drawPanel(this.#ctx, bs, offsetX, 40 + i * (bs * 4));
        });
    }

    drawStats(score, level, lines) {
        this.#ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.#ctx.font = '12px monospace';
        this.#ctx.textAlign = 'center';
        const cx = this.#panelWidth / 2;
        const bottom = this.#rows * this.#blockSize;
        this.#ctx.fillText('SCORE', cx, bottom - 80);
        this.#ctx.fillText(score, cx, bottom - 60);
        this.#ctx.fillText('LEVEL', cx, bottom - 40);
        this.#ctx.fillText(level, cx, bottom - 20);
        this.#ctx.textAlign = 'left';
    }

    drawBoard() {
        
        this.#ctx.textAlign = 'left'; // återställ
        
        this.#ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.#ctx.fillRect(0, 0, this.#panelWidth, this.#rows * this.#blockSize);
        
        this.#ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.#ctx.fillRect(this.#boardOffset, 0, this.#cols * this.#blockSize, this.#rows * this.#blockSize);
        
        this.#ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x < this.#cols; x++) {
            for (let y = 0; y < this.#rows; y++) {
                this.#ctx.strokeRect(
                    this.#boardOffset + x * this.#blockSize,
                    y * this.#blockSize,
                    this.#blockSize,
                    this.#blockSize
                );
            }
        }
        
        this.#ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.#ctx.fillRect(
            this.#boardOffset + this.#cols * this.#blockSize,
            0,
            this.#panelWidth,
            this.#rows * this.#blockSize
        );
        
        // HOLD rubrik centrerad
        this.#ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.#ctx.font = '14px monospace';
        this.#ctx.textAlign = 'center';
        this.#ctx.fillText('HOLD', this.#panelWidth / 2, 20);
        this.#ctx.fillText('NEXT', this.#boardOffset + this.#cols * this.#blockSize + this.#panelWidth / 2, 20);
    }

    drawLockedBlocks(board) {
        for (let y = 0; y < this.#rows; y++) {
            for (let x = 0; x < this.#cols; x++) {
                if (board[y][x]) {
                    const px = this.#boardOffset + x * this.#blockSize;
                    const py = y * this.#blockSize;
                    drawBlock(this.#ctx, px, py, this.#blockSize, board[y][x]);
                }
            }
        }
    }

    drawPiece(piece) {
        piece.draw(this.#ctx, this.#blockSize, this.#boardOffset);
    }

    drawGhost(piece, ghostY) {
        piece.drawGhost(this.#ctx, this.#blockSize, this.#boardOffset, ghostY);
    }

    drawClearingLines(lines, progress, boardOffset, cols, blockSize) {
        lines.forEach(y => {
            for (let x = 0; x < cols; x++) {
                const px = boardOffset + x * blockSize;
                const py = y * blockSize;
                this.#ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - progress * 0.8})`;
                this.#ctx.fillRect(px + 1, py + 1, blockSize - 2, blockSize - 2);
            }
        });
    }
}