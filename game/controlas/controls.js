// game/controlas/controls.js
export class ControlsCanvas {
    constructor(controlsCanvas, gameCanvas, tetrisInstance) {
        this.canvas = controlsCanvas;
        this.ctx = controlsCanvas.getContext('2d');
        this.gameCanvas = gameCanvas;
        this.tetris = tetrisInstance;
        this.buttons = [];
        this.isVisible = false;
        
        this.isMobile = this.detectMobile();
        
        if (this.isMobile) {
            this.setupButtons();
            this.isVisible = false;
            this.canvas.style.display = 'none';
            
            setTimeout(() => {
                this.setupCanvasSize();
            }, 200);
            
            window.addEventListener('resize', () => {
                this.setupCanvasSize();
                if (this.isVisible) this.draw();
            });
            
            this.setupEventListeners();
        }
    }
    
    detectMobile() {
        const touch = navigator.maxTouchPoints > 0;
        const width = window.innerWidth;
        document.getElementById('debug').textContent = `touch:${touch} w:${width} ua:${navigator.userAgent.slice(0,50)}`;
        return touch;
    }
     
    
    setupCanvasSize() {
        // Bredden = game canvas bredd, höjd = 140px för gott om plats
        const gameRect = this.gameCanvas.getBoundingClientRect();
        const width = gameRect.width;
        const height = 320;
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        this.updatePositions();
    }
    
    setupButtons() {
        this.buttons = [
            { action: 'moveLeft', x: 0, y: 0, width: 70, height: 70, text: '←' },
            { action: 'moveRight', x: 0, y: 0, width: 70, height: 70, text: '→' },
            { action: 'moveDown', x: 0, y: 0, width: 70, height: 70, text: '↓' },
            { action: 'rotate', x: 0, y: 0, width: 70, height: 70, text: '↻' },
            { action: 'hardDrop', x: 0, y: 0, width: 70, height: 70, text: '↓↓' }
        ];
    }
    
    show() {
        this.isVisible = true;
        this.canvas.style.display = 'block';
        this.draw();
    }

    hide() {
        this.isVisible = false;
        this.canvas.style.display = 'none';
    }

    updatePositions() {
        if (!this.buttons || this.buttons.length === 0) return;
        
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Rad 1 (y = 15): Vänster + Höger
        const row1Y = 40;
        const leftX = (canvasWidth / 2) - 195;
        const rightX = (canvasWidth / 2) + 5;
        
        this.buttons[0].x = leftX;
        this.buttons[0].y = row1Y;
        this.buttons[1].x = rightX;
        this.buttons[1].y = row1Y;
        
        // Rad 2 (y = 75): Ner + Rotera + Hard Drop
        const row2Y = 140;
        const downX = (canvasWidth / 2) - 145;
        const rotateX = (canvasWidth / 2) - 40;
        const hardDropX = (canvasWidth / 2) + 65;
        
        this.buttons[2].x = downX;
        this.buttons[2].y = row2Y;
        this.buttons[3].x = rotateX;
        this.buttons[3].y = row2Y;
        this.buttons[4].x = hardDropX;
        this.buttons[4].y = row2Y + 20; // justera lite för att se bättre
    }
    
    draw() {
        if (!this.isVisible) return;
        if (!this.buttons || this.buttons.length === 0) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.buttons.forEach(btn => {
            this.ctx.save();
            
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 35);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 28px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(btn.text, btn.x + btn.width/2, btn.y + btn.height/2);
            
            this.ctx.restore();
        });
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.tetris.isStarted() || this.tetris.isPaused()) return;
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            for (let touch of e.touches) {
                const x = (touch.clientX - rect.left) * scaleX;
                const y = (touch.clientY - rect.top) * scaleY;
                this.checkButtonPress(x, y);
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.tetris.isStarted() || this.tetris.isPaused()) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            this.checkButtonPress(x, y);
        });
    }
    
    checkButtonPress(x, y) {
        this.buttons.forEach(btn => {
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                this.handleAction(btn.action);
                this.showPressFeedback(btn);
            }
        });
    }
    
    handleAction(action) {
        switch(action) {
            case 'moveLeft': this.tetris.handleInput('ArrowLeft'); break;
            case 'moveRight': this.tetris.handleInput('ArrowRight'); break;
            case 'moveDown': this.tetris.handleInput('ArrowDown'); break;
            case 'rotate': this.tetris.handleInput('ArrowUp'); break;
            case 'hardDrop': this.tetris.handleInput(' '); break;
        }
    }
    
    showPressFeedback(btn) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
        
        setTimeout(() => {
            this.draw();
        }, 100);
    }
    
    resize() {
        if (this.isVisible) {
            this.setupCanvasSize();
            this.draw();
        }
    }
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}