import { Konst } from './konst.js';
import { Path } from './path.js';

const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');

const konst = new Konst(canvas, ctx);
konst.start();

// window.addEventListener('gameReady', (e) => {
//     const { x, y, width, height } = e.detail;
//     konst.setOrigin(x, y, width, height);
// });

window.addEventListener('gameReady', (e) => {
    const rect = document.getElementById('game').getBoundingClientRect();
    konst.setOrigin(rect.left, rect.top, rect.width, rect.height);
});

let activePath = null;

window.addEventListener('resize', () => {
    konst.resize();
});

window.addEventListener('click', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    activePath = new Path(x, y);
    konst.objects().push(activePath);
});

// window.addEventListener('mousedown', (e) => {
//     const x = e.clientX;
//     const y = e.clientY;
//     activePath = new Path(x, y);
//     konst.objects().push(activePath);
// });

// window.addEventListener('mouseup', (e) => {
//         console.log('mouseup');
//     if (activePath) {
//         activePath.stop();
//         activePath = null;
//     }
// });