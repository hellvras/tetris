// game/game.js
import { Tetris } from './tetris.js';
import { ControlsCanvas } from './controlas/controls.js';

const canvas = document.getElementById('game');
const controlsCanvas = document.getElementById('controlsCanvas');
const ctx = canvas.getContext('2d');
const tetris = new Tetris(canvas, ctx);
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const gameKeys = new Set(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','z','x','c','Escape']);
const keysDown = new Set();

let dasTimer = null;
let arrTimer = null;
let scoreSaved = false;
let controls = null;

const DAS = 150;
const ARR = 50;

function showOverlay(title, buttonText, showScores = true) {
    overlay.querySelector('h1').textContent = title;
    startBtn.textContent = buttonText;
    document.getElementById('highscores').style.display = showScores ? 'block' : 'none';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
}

function hideOverlay() {
    overlay.style.background = 'transparent';
    overlay.style.display = 'none';
}

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

function initMobileControls() {
    if (controlsCanvas) {
        controls = new ControlsCanvas(controlsCanvas, canvas, tetris);
        
        
        // Uppdatera vid resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                if (controls) controls.resize();
            }, 100);
        });
    }
}

startBtn.addEventListener('click', () => {
    startBtn.blur();
    if (tetris.isPaused()) {
        hideOverlay();
        tetris.resume();
    } else {
        scoreSaved = false;
        hideOverlay();
        tetris.start();
        if (controls) controls.show();
    }
});

startBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startBtn.blur();
    scoreSaved = false;
    hideOverlay();
    tetris.start();
    controls.show();
});

window.addEventListener('gameOver', () => {
    if (!scoreSaved) {
        saveHighscore(tetris.getScore());
        scoreSaved = true;
    }
    showOverlay('GAME OVER', 'TRY AGAIN', true);
});

window.addEventListener('blur', () => {
    if (tetris.isPaused() || !tetris.isStarted()) return;
    tetris.pause();
    showOverlay('PAUSED', 'RESUME', true);
});

window.addEventListener('keydown', (e) => {
    if (!gameKeys.has(e.key)) return;
    if (e.key === 'Escape') {
        e.preventDefault();
        if (tetris.isPaused()) {
            hideOverlay();
            tetris.resume();
        } else {
            tetris.pause();
            showOverlay('PAUSED', 'RESUME', true);
        }
        return;
    }
    if (overlay.style.display !== 'none') return;
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

// Initiera allt
window.addEventListener('load', () => {
    renderHighscores(JSON.parse(localStorage.getItem('tetrisScores') || '[]'));
    initMobileControls();
});

// Skicka gameReady event till background
setTimeout(() => {
    const rect = canvas.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent('gameReady', {
        detail: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        }
    }));
}, 100);