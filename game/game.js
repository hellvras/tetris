import { Tetris } from './tetris.js';

const canvas  = document.getElementById('game');
const ctx     = canvas.getContext('2d');
const tetris  = new Tetris(canvas, ctx);
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const gameKeys = new Set(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','z','x','c']);

const keysDown = new Set();
let dasTimer = null;
let arrTimer = null;
let scoreSaved = false;

const DAS = 150;
const ARR = 50;

startBtn.addEventListener('click', () => {
    startBtn.blur();
    scoreSaved = false;
    overlay.style.display = 'none';
    tetris.start();
});

startBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startBtn.blur();
    scoreSaved = false;
    overlay.style.display = 'none';
    tetris.start();
});

window.addEventListener('gameOver', () => {
    if (!scoreSaved) {
        saveHighscore(tetris.getScore());
        scoreSaved = true;
    }
    overlay.querySelector('h1').textContent = 'GAME OVER';
    startBtn.textContent = 'TRY AGAIN';
    overlay.style.display = 'flex';
});

function startMoving(key) {
    tetris.handleInput(key);
    clearTimeout(dasTimer);
    clearInterval(arrTimer);
    dasTimer = setTimeout(() => {
        arrTimer = setInterval(() => tetris.handleInput(key), ARR);
    }, DAS);
}

function stopMoving() {
    clearTimeout(dasTimer);
    clearInterval(arrTimer);
}

window.addEventListener('keydown', (e) => {
    if (!gameKeys.has(e.key)) return;
    e.preventDefault();
    if (keysDown.has(e.key)) return;
    keysDown.add(e.key);
    if (['ArrowLeft','ArrowRight','ArrowDown'].includes(e.key)) {
        startMoving(e.key);
    } else {
        tetris.handleInput(e.key);
    }
});

window.addEventListener('keyup', (e) => {
    keysDown.delete(e.key);
    stopMoving();
    if (keysDown.has('ArrowLeft')) startMoving('ArrowLeft');
    else if (keysDown.has('ArrowRight')) startMoving('ArrowRight');
});

function saveHighscore(score) {
    const scores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
    scores.push({ score, date: new Date().toLocaleDateString('sv-SE') });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(5);
    localStorage.setItem('tetrisScores', JSON.stringify(scores));
    renderHighscores(scores);
}

function renderHighscores(scores) {
    const list = document.getElementById('highscoreList');
    list.innerHTML = scores.map(s => `<li>${s.date} — ${s.score}</li>`).join('');
}

window.dispatchEvent(new CustomEvent('gameReady', {
    detail: {
        x: canvas.getBoundingClientRect().left,
        y: canvas.getBoundingClientRect().top,
        width: canvas.getBoundingClientRect().width,
        height: canvas.getBoundingClientRect().height
    }
}));

renderHighscores(JSON.parse(localStorage.getItem('tetrisScores') || '[]'));
