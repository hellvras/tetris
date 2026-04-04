export class Board {
    #board;
    #rows;
    #cols;

    constructor(rows, cols) {
        this.#rows = rows;
        this.#cols = cols;
        this.#board = Array.from({ length: rows }, () => Array(cols).fill(0));
    }

    get grid() {
        return this.#board;
    }

    get rows() { return this.#rows; }
    get cols() { return this.#cols; }

    lock(piece) {
        piece.lock(this.#board);
    }

    clear() {
        this.#board = Array.from({ length: this.#rows }, () => Array(this.#cols).fill(0));
    }

    getFullLines() {
        return this.#board.reduce((acc, row, i) => {
            if (row.every(cell => cell !== 0)) acc.push(i);
            return acc;
        }, []);
    }

    removeLines(lines) {
        this.#board = this.#board.filter((_, i) => !lines.includes(i));
        while (this.#board.length < this.#rows) {
            this.#board.unshift(Array(this.#cols).fill(0));
        }
    }

    // isGameOver() {
    //     return this.#board[0].some(cell => cell);
    // }

}