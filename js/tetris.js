/**
 * Tetris Engine for Antonio's Site
 * A premium, colorful, and smooth Tetris implementation.
 */

export class Tetris {
    constructor(canvasId, nextCanvasId, scoreId, levelId, linesId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById(nextCanvasId);
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.scoreElement = document.getElementById(scoreId);
        this.levelElement = document.getElementById(levelId);
        this.linesElement = document.getElementById(linesId);

        this.grid = [];
        this.rows = 20;
        this.cols = 10;
        this.blockSize = 30;
        
        this.colors = {
            'I': '#00f0f0', // Cyan
            'J': '#0000f0', // Blue
            'L': '#f0a000', // Orange
            'O': '#f0f000', // Yellow
            'S': '#00f000', // Green
            'T': '#a000f0', // Purple
            'Z': '#f00000'  // Red
        };

        this.pieces = {
            'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
            'J': [[1,0,0], [1,1,1], [0,0,0]],
            'L': [[0,0,1], [1,1,1], [0,0,0]],
            'O': [[1,1], [1,1]],
            'S': [[0,1,1], [1,1,0], [0,0,0]],
            'T': [[0,1,0], [1,1,1], [0,0,0]],
            'Z': [[1,1,0], [0,1,1], [0,0,0]]
        };

        this.reset();
        this.bindEvents();
    }

    reset() {
        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.paused = false;
        this.gameOver = false;
        
        this.currentPiece = this.getRandomPiece();
        this.nextPiece = this.getRandomPiece();
        this.pos = { x: 3, y: 0 };
        
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.updateStats();
    }

    getRandomPiece() {
        const types = Object.keys(this.pieces);
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            type,
            matrix: this.pieces[type],
            color: this.colors[type]
        };
    }

    rotate(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    }

    collide(matrix, pos) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const newX = pos.x + x;
                    const newY = pos.y + y;
                    if (newX < 0 || newX >= this.cols || newY >= this.rows || (newY >= 0 && this.grid[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    merge() {
        this.currentPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const gridY = this.pos.y + y;
                    if (gridY >= 0) {
                        this.grid[gridY][this.pos.x + x] = this.currentPiece.color;
                    }
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [0, 100, 300, 500, 800][linesCleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateStats();
        }
    }

    drop() {
        this.pos.y++;
        if (this.collide(this.currentPiece.matrix, this.pos)) {
            this.pos.y--;
            this.merge();
            this.clearLines();
            this.spawn();
        }
        this.dropCounter = 0;
    }

    spawn() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        this.pos = { x: Math.floor(this.cols / 2) - Math.floor(this.currentPiece.matrix[0].length / 2), y: 0 };
        
        if (this.collide(this.currentPiece.matrix, this.pos)) {
            this.gameOver = true;
        }
        this.drawNext();
    }

    move(dir) {
        this.pos.x += dir;
        if (this.collide(this.currentPiece.matrix, this.pos)) {
            this.pos.x -= dir;
        }
    }

    playerRotate() {
        const oldMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = this.rotate(this.currentPiece.matrix);
        if (this.collide(this.currentPiece.matrix, this.pos)) {
            this.currentPiece.matrix = oldMatrix;
        }
    }

    hardDrop() {
        while (!this.collide(this.currentPiece.matrix, this.pos)) {
            this.pos.y++;
        }
        this.pos.y--;
        this.merge();
        this.clearLines();
        this.spawn();
        this.dropCounter = 0;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowLeft') this.move(-1);
            if (e.key === 'ArrowRight') this.move(1);
            if (e.key === 'ArrowDown') this.drop();
            if (e.key === 'ArrowUp') this.playerRotate();
            if (e.key === ' ') this.hardDrop();
            if (e.key === 'p' || e.key === 'P') this.paused = !this.paused;
        });
    }

    updateStats() {
        if (this.scoreElement) this.scoreElement.innerText = this.score;
        if (this.levelElement) this.levelElement.innerText = this.level;
        if (this.linesElement) this.linesElement.innerText = this.lines;
    }

    drawBlock(ctx, x, y, color, blockSize, isGhost = false) {
        ctx.fillStyle = color;
        if (isGhost) ctx.globalAlpha = 0.2;
        
        // Draw the block with a slight border/glow
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // Premium border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);
        
        ctx.globalAlpha = 1.0;
    }

    draw() {
        // Clear main canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines (subtle)
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }

        // Draw grid blocks
        this.grid.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color !== 0) {
                    this.drawBlock(this.ctx, x, y, color, this.blockSize);
                }
            });
        });

        // Draw ghost piece
        let ghostPos = { ...this.pos };
        while (!this.collide(this.currentPiece.matrix, ghostPos)) {
            ghostPos.y++;
        }
        ghostPos.y--;
        this.currentPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(this.ctx, ghostPos.x + x, ghostPos.y + y, this.currentPiece.color, this.blockSize, true);
                }
            });
        });

        // Draw current piece
        if (this.currentPiece) {
            this.currentPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlock(this.ctx, this.pos.x + x, this.pos.y + y, this.currentPiece.color, this.blockSize);
                    }
                });
            });
        }

        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Space Mono';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Space Mono';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '16px Inter';
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }

    drawNext() {
        this.nextCtx.fillStyle = '#111';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const blockSize = 25;
        const matrix = this.nextPiece.matrix;
        const offsetX = (this.nextCanvas.width - matrix[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - matrix.length * blockSize) / 2;

        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                    this.nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    this.nextCtx.strokeRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + 1, blockSize - 2, blockSize - 2);
                }
            });
        });
    }

    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (!this.paused && !this.gameOver) {
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
            }
        }

        this.draw();
        requestAnimationFrame((t) => this.update(t));
    }

    start() {
        this.update();
        this.drawNext();
    }
}
