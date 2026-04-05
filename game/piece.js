import { PIECES } from './pieces.js';
import { drawBlock } from './drawblock.js';

const SRS_KICKS = {
    // J, L, S, T, Z - från tillstånd -> lista med kicks
    normal: {
        '0->1': [{x:0,y:0},{x:-1,y:0},{x:-1,y:1},{x:0,y:-2},{x:-1,y:-2}],
        '1->0': [{x:0,y:0},{x:1,y:0},{x:1,y:-1},{x:0,y:2},{x:1,y:2}],
        '1->2': [{x:0,y:0},{x:1,y:0},{x:1,y:-1},{x:0,y:2},{x:1,y:2}],
        '2->1': [{x:0,y:0},{x:-1,y:0},{x:-1,y:1},{x:0,y:-2},{x:-1,y:-2}],
        '2->3': [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:-2},{x:1,y:-2}],
        '3->2': [{x:0,y:0},{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}],
        '3->0': [{x:0,y:0},{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}],
        '0->3': [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:-2},{x:1,y:-2}],
    },
    I: {
        '0->1': [{x:0,y:0},{x:-2,y:0},{x:1,y:0},{x:-2,y:-1},{x:1,y:2}],
        '1->0': [{x:0,y:0},{x:2,y:0},{x:-1,y:0},{x:2,y:1},{x:-1,y:-2}],
        '1->2': [{x:0,y:0},{x:-1,y:0},{x:2,y:0},{x:-1,y:2},{x:2,y:-1}],
        '2->1': [{x:0,y:0},{x:1,y:0},{x:-2,y:0},{x:1,y:-2},{x:-2,y:1}],
        '2->3': [{x:0,y:0},{x:2,y:0},{x:-1,y:0},{x:2,y:1},{x:-1,y:-2}],
        '3->2': [{x:0,y:0},{x:-2,y:0},{x:1,y:0},{x:-2,y:-1},{x:1,y:2}],
        '3->0': [{x:0,y:0},{x:1,y:0},{x:-2,y:0},{x:1,y:-2},{x:-2,y:1}],
        '0->3': [{x:0,y:0},{x:-1,y:0},{x:2,y:0},{x:-1,y:2},{x:2,y:-1}],
    }
};

export class Piece {
    #shape; #color; #x; #y;
    #rotation = 0; // 0, 1, 2, 3
    #type;
    
    constructor(type, x, y) {
        const { shape, color } = PIECES[type];
        this.#shape = shape;
        this.#color = color;
        this.#type = type;
        this.#rotation = 0;
        this.#x = x;
        this.#y = y;
    }
    
    getX() { return this.#x; }
    getY() { return this.#y; }
    getShape() { return this.#shape; }

    canMove(dx, dy, board, rows, cols) {
        return this.#shape.every((row, rowIndex) =>
            row.every((cell, colIndex) => {
                if (!cell) return true;
                const nx = this.#x + colIndex + dx;
                const ny = this.#y + rowIndex + dy;
                return nx >= 0 && nx < cols && ny < rows && !board[ny]?.[nx];
            })
        );
    }

    moveDown(board, rows, cols) {
        if (!this.canMove(0, 1, board, rows, cols)) return false;
        this.#y++;
        return true;
    }

    moveLeft(board, rows, cols) {
        if (!this.canMove(-1, 0, board, rows, cols)) return false;
        this.#x--;
        return true;
    }

    moveRight(board, rows, cols) {
        if (!this.canMove(1, 0, board, rows, cols)) return false;
        this.#x++;
        return true;
    }

    hardDrop(board, rows, cols) {
        while (this.canMove(0, 1, board, rows, cols)) this.#y++;
    }

    rotate(dir = 1, board, rows, cols) {
        const prevShape = this.#shape;
        const prevX = this.#x;
        const prevY = this.#y;
        const prevRotation = this.#rotation;
        const size = this.#shape.length;

        const nextRotation = ((this.#rotation + (dir === 1 ? 1 : 3)) % 4);
        const key = `${this.#rotation}->${nextRotation}`;
        const kickTable = this.#type === 'I' ? SRS_KICKS.I : SRS_KICKS.normal;
        const kicks = kickTable[key];

        const rotated = Array.from({ length: size }, () => Array(size).fill(0));
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (dir === 1) rotated[x][size - 1 - y] = this.#shape[y][x];
                else rotated[size - 1 - x][y] = this.#shape[y][x];
            }
        }
        this.#shape = rotated;

        for (const { x, y } of kicks) {
            this.#x = prevX + x;
            this.#y = prevY + y;
            if (this.canMove(0, 0, board, rows, cols)) {
                this.#rotation = nextRotation;
                return;
            }
        }

        // ingen kick funkar – återställ
        this.#shape = prevShape;
        this.#x = prevX;
        this.#y = prevY;
        this.#rotation = prevRotation;
    }

    reset() {
        this.#x = 0;
        this.#y = 0;
        this.#rotation = 0;
        return this;
    }

    lock(board) {
        this.#shape.forEach((row, rowIndex) =>
            row.forEach((cell, colIndex) => {
                if (cell) board[this.#y + rowIndex][this.#x + colIndex] = this.#color;
            })
        );
    }

    getGhost(board, rows, cols) {
        let ghostY = this.#y;
        while (true) {
            const blocked = this.#shape.some((row, rowIndex) =>
                row.some((cell, colIndex) => {
                    if (!cell) return false;
                    const ny = ghostY + 1 + rowIndex;
                    const nx = this.#x + colIndex;
                    return ny >= rows || board[ny]?.[nx];
                })
            );
            if (blocked) break;
            ghostY++;
        }
        return ghostY;
    }

    isAboveBoard() {
        return this.#shape.some((row, rowIndex) =>
            row.some((cell, colIndex) => cell && this.#y + rowIndex < 0)
        );
    }

    bounds() {
        let minX = Infinity, maxX = -Infinity;
        this.#shape.forEach((row, rowIndex) =>
            row.forEach((cell, colIndex) => {
                if (cell) {
                    minX = Math.min(minX, colIndex);
                    maxX = Math.max(maxX, colIndex);
                }
            })
        );
        return { minX, maxX, width: maxX - minX + 1 };
    }

    draw(ctx, blockSize, boardOffset = 0) {
        this.#shape.forEach((row, rowIndex) =>
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const px = (this.#x + colIndex) * blockSize + boardOffset;
                    const py = (this.#y + rowIndex) * blockSize;
                    drawBlock(ctx, px, py, blockSize, this.#color);
                }
            })
        );
    }

    drawGhost(ctx, blockSize, boardOffset, ghostY) {
        this.#shape.forEach((row, rowIndex) =>
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const px = (this.#x + colIndex) * blockSize + boardOffset;
                    const py = (ghostY + rowIndex) * blockSize;
                    ctx.strokeStyle = this.#color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(px + 2, py + 2, blockSize - 4, blockSize - 4, 3);
                    ctx.stroke();
                }
            })
        );
    }

    drawPanel(ctx, blockSize, offsetX, offsetY) {
        this.#shape.forEach((row, rowIndex) =>
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const px = offsetX + colIndex * blockSize;
                    const py = offsetY + rowIndex * blockSize;
                    drawBlock(ctx, px, py, blockSize, this.#color);
                }
            })
        );
    }
}