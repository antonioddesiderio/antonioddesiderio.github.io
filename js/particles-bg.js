export class ParticleNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numParticles = 150; // Reduced to 150
        this.mouse = { x: null, y: null };
        this.attractionRadius = 125; // Decreased by ~30% (was 180)

        // Colors for depth levels (same as manga pastels + grey)
        this.depthColors = [
            'rgba(255, 100, 100, 0.8)', // Level 1 (Closest) - Red
            'rgba(100, 255, 180, 0.8)', // Level 2 - Green
            'rgba(100, 180, 255, 0.8)', // Level 3 - Blue
            'rgba(255, 220, 100, 0.8)', // Level 4 - Yellow
            'rgba(150, 150, 150, 0.6)'  // Level 5 (Farthest) - Grey
        ];

        this.resize();
        this.init();

        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    init() {
        this.particles = [];
        const containerWidth = 1200;
        const margin = Math.max(0, (this.width - containerWidth) / 2);
        const bottomMargin = 80; // Reduced to ~footer height
        const useMargins = margin > 20;

        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(new Particle(this.width, this.height, useMargins, margin, containerWidth, bottomMargin));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update and draw all particles first
        this.particles.forEach(p => {
            p.update(this.mouse);
            p.draw(this.ctx);
            p.visited = false; // Reset visited state for BFS
        });

        // BFS for cascading connections
        if (this.mouse.x != null) {
            let currentLevelNodes = [this.mouse];
            let visitedSet = new Set();

            const maxLevels = 5;
            const connectionRadius = 105; // Reduced by 30% (was 150)

            for (let level = 0; level < maxLevels; level++) {
                let nextLevelNodes = [];
                const color = this.depthColors[Math.min(level, this.depthColors.length - 1)];

                currentLevelNodes.forEach(source => {
                    this.particles.forEach(p => {
                        if (p.visited) return;

                        const dx = source.x - p.x;
                        const dy = source.y - p.y;
                        const distSq = dx * dx + dy * dy;

                        const radius = (source === this.mouse) ? this.attractionRadius : connectionRadius;

                        if (distSq < radius * radius) {
                            this.ctx.beginPath();
                            this.ctx.strokeStyle = color;
                            this.ctx.lineWidth = 1;
                            this.ctx.moveTo(source.x, source.y);
                            this.ctx.lineTo(p.x, p.y);
                            this.ctx.stroke();

                            p.visited = true;
                            nextLevelNodes.push(p);
                        }
                    });
                });

                if (nextLevelNodes.length === 0) break;
                currentLevelNodes = nextLevelNodes;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(w, h, useMargins, marginWidth, centerWidth, bottomMargin) {
        this.w = w;
        this.h = h;

        // Boundaries
        this.useMargins = useMargins;
        this.marginWidth = marginWidth;
        this.centerStart = marginWidth;
        this.centerEnd = marginWidth + centerWidth;
        this.contentHeight = h - bottomMargin; // The y-limit of the content box

        // Spawn Logic (Rejection Sampling)
        // Keep trying random positions until we find one OUTSIDE the central content box
        // Content Box = x: [margin, centerEnd], y: [0, contentHeight]
        let valid = false;
        if (!useMargins) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
        } else {
            // Spawn in allowed areas: Left Margin, Right Margin, OR Bottom Strip
            // Forbidden area: Center Column AND Y < contentHeight

            while (!valid) {
                // Pick a random spot
                this.x = Math.random() * w;
                this.y = Math.random() * h;

                // Check if inside forbidden box
                const inCenterColumn = (this.x > this.centerStart && this.x < this.centerEnd);
                const inTopArea = (this.y < this.contentHeight);

                if (inCenterColumn && inTopArea) {
                    valid = false;
                } else {
                    valid = true;
                }
            }
        }

        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.size = Math.random() * 3 + 1;
        this.baseColor = 'rgba(80, 80, 80, 0.4)';
        this.visited = false;
    }

    update(mouse) {
        // Save previous position to determine which wall was hit
        const prevX = this.x;
        const prevY = this.y;

        // Apply Velocity
        this.x += this.vx;
        this.y += this.vy;

        // Outer Screen Boundaries
        if (this.x < 0 || this.x > this.w) this.vx *= -1;
        if (this.y < 0 || this.y > this.h) this.vy *= -1;

        // Inner Forbidden Box Collision
        if (this.useMargins) {
            // Box Definition: x in [centerStart, centerEnd] AND y < contentHeight
            const inCenterColumn = (this.x > this.centerStart && this.x < this.centerEnd);
            const inTopArea = (this.y < this.contentHeight);

            if (inCenterColumn && inTopArea) {
                // Collision detected! Push back and reflect velocity based on entry angle
                const wasInTopArea = (prevY < this.contentHeight);

                if (!wasInTopArea) {
                    // Crossed from Bottom up (entered forbidden zone from below)
                    this.y = this.contentHeight;
                    this.vy *= -1; // Bounce down
                } else {
                    // Crossed from Side
                    // Move back to nearest edge
                    if (Math.abs(this.x - this.centerStart) < Math.abs(this.x - this.centerEnd)) {
                        // Closer to left
                        this.x = this.centerStart;
                        this.vx *= -1;
                    } else {
                        // Closer to right
                        this.x = this.centerEnd;
                        this.vx *= -1;
                    }
                }
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.baseColor;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
