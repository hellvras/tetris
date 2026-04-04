import { PIECES } from './pieces.js';
import { Piece } from './piece.js';
import { Board } from './board.js';
import { Renderer } from './renderer.js';

export class Tetris {
    #canvas;
    #blockSize = 30;
    #cols = 10;
    #rows = 20;
    #panelWidth = 120;
    #boardOffset;

    #board;
    #renderer;
    #currentPiece;
    #lastDrop = 0;
    #dropInterval = 500;

    #holdPiece = null;
    #holdUsed = false;
    #queue = [];
    #queueSize = 3;

    #clearingLines = [];
    #clearTimer = null;
    #clearDuration = 300;

    #lockDelay = 300;
    #lockTimer = null;
    #lockMoves = 0;
    #maxLockMoves = 15;

    #score = 0;
    #level = 1;
    #lines = 0;
    #gameOver = false;
    #inputQueue = [];

    constructor(canvas, ctx) {
        this.#canvas = canvas;
        this.#boardOffset = this.#panelWidth;
        this.#board = new Board(this.#rows, this.#cols);
        this.#renderer = new Renderer(ctx, this.#blockSize, this.#boardOffset, this.#panelWidth, this.#cols, this.#rows);
    }

    getCanvas() { return this.#canvas; }
    getScore()  { return this.#score; }

    start() {
        this.#gameOver  = false;
        this.#score     = 0;
        this.#level     = 1;
        this.#lines     = 0;
        this.#dropInterval = 500;
        this.#lastDrop  = 0;
        this.#lockTimer = null;
        this.#lockMoves = 0;
        this.#clearingLines = [];
        this.#clearTimer = null;
        this.#canvas.width  = this.#panelWidth + this.#cols * this.#blockSize + this.#panelWidth;
        this.#canvas.height = this.#rows * this.#blockSize;
        this.#board = new Board(this.#rows, this.#cols);
        this.#fillQueue();
        this.#currentPiece = this.#queue.shift();
        this.animate();
    }

    animate(timestamp = 0) {
        if (this.#gameOver) return;
        this.#processInput();

        if (this.#clearingLines.length > 0) {
            const progress = (timestamp - this.#clearTimer) / this.#clearDuration;
            if (progress >= 1) {
                this.#board.removeLines(this.#clearingLines);
                this.#clearingLines = [];
                this.#clearTimer = null;
            }
        }

        if (timestamp - this.#lastDrop > this.#dropInterval) {
            const steps = Math.floor((timestamp - this.#lastDrop) / this.#dropInterval);
            for (let i = 0; i < steps; i++) {
                if (!this.#currentPiece.moveDown(this.#board.grid, this.#rows, this.#cols)) {
                    if (!this.#lockTimer) {
                        this.#lockTimer = timestamp;
                    } else if (timestamp - this.#lockTimer > this.#lockDelay) {
                        this.#lockAndSpawn();
                    }
                    break;
                } else {
                    this.#lockTimer = null;
                }
            }
            this.#lastDrop = timestamp;
        }

        this.#draw();
        requestAnimationFrame((ts) => this.animate(ts));
    }

    #addScore(clearedLines) {
        const points = [0, 100, 300, 500, 800];
        this.#score += points[clearedLines] * this.#level;
        this.#lines += clearedLines;
        this.#level = Math.floor(this.#lines / 10) + 1;
        this.#dropInterval = 500 * Math.pow(0.85, this.#level - 1);
    }

    #lockAndSpawn() {
        if (this.#currentPiece.isAboveBoard()) {
            this.#gameOver = true;
            window.dispatchEvent(new CustomEvent('gameOver'));
            return;
        }
        this.#board.lock(this.#currentPiece);
        this.#clearingLines = this.#board.getFullLines();
        if (this.#clearingLines.length > 0) {
            this.#addScore(this.#clearingLines.length);
            this.#clearTimer = performance.now();
        }
        this.#currentPiece = this.#spawnPiece();
        this.#lockTimer = null;
        this.#lockMoves = 0;
    }

    #fillQueue() {
        while (this.#queue.length < this.#queueSize + 1) {
            const types = Object.keys(PIECES);
            const type = types[Math.floor(Math.random() * types.length)];
            // const type = types[0];
            this.#queue.push(new Piece(type, Math.floor(this.#cols / 2) - 1, -2));
        }
    }

    #spawnPiece() {
        this.#fillQueue();
        const piece = this.#queue.shift();
        this.#holdUsed = false;
        if (!piece.canMove(0, 0, this.#board.grid, this.#rows, this.#cols)) {
            this.#gameOver = true;
            window.dispatchEvent(new CustomEvent('gameOver'));
            return null;
        }
        return piece;
    }

    #draw() {
        this.#renderer.clear(this.#canvas);
        this.#renderer.drawBoard();
        this.#renderer.drawHold(this.#holdPiece);
        this.#renderer.drawQueue(this.#queue);
        this.#renderer.drawLockedBlocks(this.#board.grid);
        this.#renderer.drawStats(this.#score, this.#level, this.#lines);

        if (this.#clearingLines.length > 0) {
            const progress = (performance.now() - this.#clearTimer) / this.#clearDuration;
            this.#renderer.drawClearingLines(this.#clearingLines, progress, this.#boardOffset, this.#cols, this.#blockSize);
        }

        if (!this.#currentPiece) return;
        const ghostY = this.#currentPiece.getGhost(this.#board.grid, this.#rows, this.#cols);
        this.#renderer.drawGhost(this.#currentPiece, ghostY);
        this.#renderer.drawPiece(this.#currentPiece);
    }

    handleInput(key) {
        this.#inputQueue.push(key);
    }

    #processInput() {
        while (this.#inputQueue.length > 0) {
            const key = this.#inputQueue.shift();
            this.#handleKey(key);
        }
    }

    #handleKey(key) {
        const b = this.#board.grid;
        const r = this.#rows;
        const c = this.#cols;
        const p = this.#currentPiece;

        switch (key) {
            case 'ArrowLeft':
                if (p.moveLeft(b, r, c) && this.#lockMoves < this.#maxLockMoves) {
                    this.#lockTimer = null;
                    this.#lockMoves++;
                }
                break;
            case 'ArrowRight':
                if (p.moveRight(b, r, c) && this.#lockMoves < this.#maxLockMoves) {
                    this.#lockTimer = null;
                    this.#lockMoves++;
                }
                break;
            case 'ArrowDown':  p.moveDown(b, r, c); break;
            case ' ':
                p.hardDrop(b, r, c);
                this.#lockAndSpawn();
                break;
            case 'ArrowUp':
            case 'x':
                p.rotate(1, b, r, c);
                this.#lockTimer = null;
                break;
            case 'z':
                p.rotate(-1, b, r, c);
                this.#lockTimer = null;
                break;
            case 'c':
                if (this.#holdUsed) break;
                if (this.#holdPiece) {
                    const temp = this.#holdPiece;
                    this.#holdPiece = p.reset();
                    this.#currentPiece = temp;
                } else {
                    this.#holdPiece = p.reset();
                    this.#currentPiece = this.#spawnPiece();
                }
                this.#holdUsed = true;
                break;
        }
    }
}