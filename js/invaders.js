// Space Invaders Game Logic

// Website Colors
const COLORS = {
    bg: '#111111',
    ship: '#0051BA',     // Blue
    alien1: '#23BC3F',   // Green
    alien2: '#F27C38',   // Orange
    alien3: '#FFE206',   // Yellow
    bullet: '#E0003C',   // Red
    text: '#F9F9F9'      // White
};

class Ship {
    constructor(canvasWidth, canvasHeight) {
        this.width = 40;
        this.height = 20;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - 40;
        this.speed = 5;
        this.dx = 0;
        this.canvasWidth = canvasWidth;
    }

    draw(ctx) {
        ctx.fillStyle = COLORS.ship;
        // Simple shape (base and gun)
        ctx.fillRect(this.x, this.y + 10, this.width, this.height - 10);
        ctx.fillRect(this.x + this.width / 2 - 4, this.y, 8, 10);
    }

    update() {
        this.x += this.dx;
        // Wall collisions
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
    }
}

class Alien {
    constructor(x, y, row) {
        this.width = 30;
        this.height = 20;
        this.x = x;
        this.y = y;
        
        // Determine color based on row
        if (row === 0 || row === 1) this.color = COLORS.alien1;
        else if (row === 2 || row === 3) this.color = COLORS.alien2;
        else this.color = COLORS.alien3;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // Simple alien shape
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // "Eyes"
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(this.x + 6, this.y + 4, 4, 4);
        ctx.fillRect(this.x + 20, this.y + 4, 4, 4);
    }
}

class Bullet {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.color = color;
        this.active = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

class SpaceInvaders {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.ship = new Ship(this.width, this.height);
        this.bullets = [];
        this.aliens = [];
        this.alienBullets = [];
        
        this.alienDx = 1.5;
        this.alienDy = 0;
        this.alienStepDown = 30;
        
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        
        this.lastShotTime = 0;
        this.shootDelay = 400; // ms between shots

        this.initAliens();
        this.setupInputs();

        // UI elements
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreEl = document.getElementById('final-score');
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    initAliens() {
        this.aliens = [];
        const rows = 5;
        const cols = 10;
        const padding = 15;
        const startX = 30;
        const startY = 40;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (30 + padding);
                const y = startY + row * (20 + padding);
                this.aliens.push(new Alien(x, y, row));
            }
        }
    }

    setupInputs() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.ship.dx = -this.ship.speed;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                this.ship.dx = this.ship.speed;
            } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
                this.shoot();
                // Prevent scrolling when playing with spacebar/arrows
                if(e.key === ' ' || e.key === 'ArrowUp') e.preventDefault(); 
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
                this.ship.dx = 0;
            }
        });
    }

    shoot() {
        if (this.isGameOver) return;
        const now = performance.now();
        if (now - this.lastShotTime > this.shootDelay) {
            // Player shoots up (positive speed relative to moving up -> negative y change handled in Bullet)
            this.bullets.push(new Bullet(this.ship.x + this.ship.width / 2 - 2, this.ship.y, 7, COLORS.bullet));
            this.lastShotTime = now;
        }
    }

    alienShoot() {
        if (this.isGameOver || this.aliens.length === 0) return;
        // Randomly choose an alien to shoot
        if (Math.random() < 0.02) {
            const shooter = this.aliens[Math.floor(Math.random() * this.aliens.length)];
            // Alien shoots down (negative speed relative to moving up -> positive y change)
            this.alienBullets.push(new Bullet(shooter.x + shooter.width / 2 - 2, shooter.y + shooter.height, -5, COLORS.alien3));
        }
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    update() {
        if (this.isGameOver) return;

        this.ship.update();

        // Update player bullets
        this.bullets.forEach(b => b.update());
        // Remove off-screen bullets
        this.bullets = this.bullets.filter(b => b.y + b.height > 0);

        // Update alien bullets
        this.alienBullets.forEach(b => b.update());
        this.alienBullets = this.alienBullets.filter(b => b.y < this.height);

        // Alien movement logic
        let hitWall = false;
        for (let alien of this.aliens) {
            if (alien.x + alien.width + this.alienDx > this.width || alien.x + this.alienDx < 0) {
                hitWall = true;
                break;
            }
        }

        if (hitWall) {
            this.alienDx *= -1; // Reverse direction
            this.aliens.forEach(alien => {
                alien.y += this.alienStepDown;
            });
            // Speed up slightly
            this.alienDx += (this.alienDx > 0 ? 0.2 : -0.2);
        } else {
            this.aliens.forEach(alien => {
                alien.x += this.alienDx;
            });
        }

        this.alienShoot();

        // Collisions: Player bullets vs Aliens
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;
            for (let i = 0; i < this.aliens.length; i++) {
                const alien = this.aliens[i];
                if (this.checkCollision(bullet, alien)) {
                    bullet.active = false;
                    this.aliens.splice(i, 1);
                    this.score += 10;
                    break; // Bullet can only hit one alien
                }
            }
        });
        this.bullets = this.bullets.filter(b => b.active);

        // Collisions: Alien bullets vs Player
        for (let bullet of this.alienBullets) {
            if (this.checkCollision(bullet, this.ship)) {
                this.lives--;
                this.alienBullets = [];
                this.bullets = [];
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
                // Reset ship position
                this.ship = new Ship(this.width, this.height);
                return;
            }
        }

        // Collisions: Aliens reaching the player or bottom
        for (let alien of this.aliens) {
            if (alien.y + alien.height >= this.ship.y) {
                this.gameOver();
                return;
            }
        }

        // Level Clear (all aliens destroyed)
        if (this.aliens.length === 0) {
            this.score += 100; // Bonus
            this.alienDx = (this.alienDx > 0 ? 1 : -1) * (Math.abs(this.alienDx) + 0.5); // Reset speed + bit faster
            this.initAliens();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Ship
        this.ship.draw(this.ctx);

        // Draw Aliens
        this.aliens.forEach(alien => alien.draw(this.ctx));

        // Draw Bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.alienBullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw Score & Lives
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '20px "Space Mono", monospace';
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 30);
        this.ctx.fillText(`LIVES: ${this.lives}`, this.width - 120, 30);
    }

    gameLoop(timestamp) {
        // Limit to approx 60fps
        const deltaTime = timestamp - this.lastTime;
        if (deltaTime >= 16) {
            this.update();
            this.draw();
            this.lastTime = timestamp;
        }
        
        if (!this.isGameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.finalScoreEl.innerText = this.score;
        this.gameOverScreen.style.display = 'flex';
    }

    restart() {
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;
        this.ship = new Ship(this.width, this.height);
        this.bullets = [];
        this.alienBullets = [];
        this.alienDx = 1.5;
        this.initAliens();
        this.gameOverScreen.style.display = 'none';
        
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when the script loads (play_invaders.html includes it as a module)
document.addEventListener('DOMContentLoaded', () => {
    new SpaceInvaders('invadersCanvas');
});
