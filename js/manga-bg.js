export class MangaBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.avoidSelector = '#know-more .container h2, #know-more .container .intro-text';

        // Colors from original
        this.colors = [
            'rgba(255, 127, 127, 0.6)',
            'rgba(127, 255, 191, 0.6)',
            'rgba(127, 191, 255, 0.6)',
            'rgba(255, 223, 127, 0.6)'
        ];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        if (!this.canvas.parentElement) return;
        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    reset() {
        if (this.ctx && this.width && this.height) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }

    // --- Drawing Helpers (Refined for less "sbilenca" look) ---
    sketchLine(x1, y1, x2, y2, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5; // Slightly finer
        this.ctx.lineCap = 'round';

        // Reduced passes and variance for cleaner look
        const passes = 2;
        for (let i = 0; i < passes; i++) {
            this.ctx.beginPath();
            // Much smaller random offset (was 2, now 0.5)
            const startX = x1 + this.random(-0.5, 0.5);
            const startY = y1 + this.random(-0.5, 0.5);
            const endX = x2 + this.random(-0.5, 0.5);
            const endY = y2 + this.random(-0.5, 0.5);

            this.ctx.moveTo(startX, startY);
            // Smaller curve deviation (was 5, now 1.5)
            const midX = (startX + endX) / 2 + this.random(-1.5, 1.5);
            const midY = (startY + endY) / 2 + this.random(-1.5, 1.5);
            this.ctx.quadraticCurveTo(midX, midY, endX, endY);
            this.ctx.stroke();
        }
    }

    sketchEllipse(x, y, radiusX, radiusY, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5;
        const step = 0.5;

        // Single pass for cleaner look, or maybe 2 very tight ones
        for (let p = 0; p < 2; p++) {
            this.ctx.beginPath();
            for (let theta = 0; theta < Math.PI * 2; theta += step) {
                // Reduced offset (was 2, now 0.5)
                const rX = radiusX + this.random(-0.5, 0.5);
                const rY = radiusY + this.random(-0.5, 0.5);
                const px = x + rX * Math.cos(theta);
                const py = y + rY * Math.sin(theta);
                if (theta === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    // --- Sketches (Refined Selection) ---

    drawFaceSketch(x, y, size, color) {
        // Simple Oval
        this.sketchEllipse(x, y, size * 0.7, size, color);

        // Cross guidelines
        this.sketchLine(x, y - size, x, y + size, color); // Vertical
        this.sketchLine(x - size * 0.7, y, x + size * 0.7, y, color); // Horizontal eye line
    }

    drawStar(x, y, size, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            this.ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size + x,
                -Math.sin((18 + i * 72) * Math.PI / 180) * size + y);
            this.ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size / 2) + x,
                -Math.sin((54 + i * 72) * Math.PI / 180) * (size / 2) + y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawCube3D(x, y, size, color) {
        const s = size * 0.6;
        const o = s * 0.4; // Slightly clearer offset
        // Front Box
        this.sketchLine(x - s, y - s, x + s, y - s, color); // Top
        this.sketchLine(x + s, y - s, x + s, y + s, color); // Right
        this.sketchLine(x + s, y + s, x - s, y + s, color); // Bottom
        this.sketchLine(x - s, y + s, x - s, y - s, color); // Left
        // Back Box (Offset)
        this.sketchLine(x - s + o, y - s - o, x + s + o, y - s - o, color); // Top
        this.sketchLine(x + s + o, y - s - o, x + s + o, y + s - o, color); // Right
        this.sketchLine(x + s + o, y + s - o, x - s + o, y + s - o, color); // Bottom
        this.sketchLine(x - s + o, y + s - o, x - s + o, y - s - o, color); // Left
        // Connecting Lines
        this.sketchLine(x - s, y - s, x - s + o, y - s - o, color); // TL
        this.sketchLine(x + s, y - s, x + s + o, y - s - o, color); // TR
        this.sketchLine(x + s, y + s, x + s + o, y + s - o, color); // BR
        this.sketchLine(x - s, y + s, x - s + o, y + s - o, color); // BL
    }

    drawHappyFace(x, y, size, color) {
        // Just the features (No circle)
        // Eyes (Arc style)
        this.ctx.beginPath(); this.ctx.strokeStyle = color; this.ctx.lineWidth = 1.5;
        this.ctx.arc(x - size / 3, y - size / 4, size / 5, Math.PI, 0); // Left Eye
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(x + size / 3, y - size / 4, size / 5, Math.PI, 0); // Right Eye
        this.ctx.stroke();

        // Smile (Simple Arc)
        this.ctx.beginPath();
        this.ctx.arc(x, y + size * 0.1, size * 0.35, 0.2, Math.PI - 0.2);
        this.ctx.stroke();

        // Cheek marks (optional cuteness)
        this.sketchLine(x - size * 0.6, y + size * 0.2, x - size * 0.4, y + size * 0.3, color);
        this.sketchLine(x + size * 0.4, y + size * 0.3, x + size * 0.6, y + size * 0.2, color);
    }

    drawBasketball(x, y, size, color) {
        this.sketchEllipse(x, y, size, size, color);
        // Curved lines for perspective
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        // Vertical curve
        this.ctx.moveTo(x, y - size);
        this.ctx.quadraticCurveTo(x + size * 0.3, y, x, y + size);
        this.ctx.moveTo(x, y - size);
        this.ctx.quadraticCurveTo(x - size * 0.3, y, x, y + size);
        // Horizontal curve
        this.ctx.moveTo(x - size, y);
        this.ctx.quadraticCurveTo(x, y + size * 0.3, x + size, y);
        // Side curves
        this.ctx.moveTo(x - size * 0.6, y - size * 0.6);
        this.ctx.quadraticCurveTo(x - size * 0.2, y, x - size * 0.6, y + size * 0.6);
        this.ctx.moveTo(x + size * 0.6, y - size * 0.6);
        this.ctx.quadraticCurveTo(x + size * 0.2, y, x + size * 0.6, y + size * 0.6);

        this.ctx.stroke();
    }

    drawCar(x, y, size, color) {
        const w = size * 1.5; const h = size * 0.6;
        // Body
        this.sketchLine(x - w / 2, y, x + w / 2, y, color);
        this.sketchLine(x - w / 2, y, x - w / 2, y - h / 2, color);
        this.sketchLine(x + w / 2, y, x + w / 2, y - h / 2, color);
        // Roof
        this.sketchLine(x - w / 4, y - h, x + w / 4, y - h, color);
        this.sketchLine(x - w / 4, y - h, x - w / 2, y - h / 2, color);
        this.sketchLine(x + w / 4, y - h, x + w / 2, y - h / 2, color);
        // Wheels
        this.sketchEllipse(x - w / 3, y + size * 0.1, size / 4, size / 4, color);
        this.sketchEllipse(x + w / 3, y + size * 0.1, size / 4, size / 4, color);
    }

    drawNote(x, y, size, color) {
        // Cleaner Note
        this.sketchLine(x + size / 3, y - size, x + size / 3, y + size / 2, color); // Stem
        this.sketchEllipse(x, y + size / 2, size / 3, size / 4, color); // Head
        this.sketchLine(x + size / 3, y - size, x + size / 3 + size / 2, y - size + size / 4, color); // Flag
    }

    drawHeart(x, y, size, color) {
        // Better heart using curves instead of circle
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        const topY = y - size / 2;
        this.ctx.moveTo(x, y + size * 0.5);
        this.ctx.bezierCurveTo(x + size, y - size / 2, x + size / 2, y - size, x, topY);
        this.ctx.bezierCurveTo(x - size / 2, y - size, x - size, y - size / 2, x, y + size * 0.5);
        this.ctx.stroke();
    }

    drawAtom(x, y, size, color) {
        // Nucleus
        this.sketchEllipse(x, y, size / 5, size / 5, color);
        // Orbits (Rotated ellipses)
        this.ctx.save();
        this.ctx.translate(x, y);

        // Orbit 1
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        this.ctx.ellipse(0, 0, size, size / 3, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Orbit 2 (Rotated 60)
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size, size / 3, Math.PI / 3, 0, Math.PI * 2);
        this.ctx.stroke();

        // Orbit 3 (Rotated -60)
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size, size / 3, -Math.PI / 3, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawMonkey(x, y, size, color) {
        // Head Main
        this.sketchEllipse(x, y - size * 0.3, size * 0.7, size * 0.6, color);
        // Ears (Big)
        this.sketchEllipse(x - size * 0.7, y - size * 0.3, size / 4, size / 4, color);
        this.sketchEllipse(x + size * 0.7, y - size * 0.3, size / 4, size / 4, color);

        // Face/Muzzle (Lower part)
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        this.ctx.ellipse(x, y, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Eyes
        this.ctx.beginPath(); this.ctx.arc(x - size * 0.2, y - size * 0.4, 2, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(x + size * 0.2, y - size * 0.4, 2, 0, Math.PI * 2); this.ctx.fill();

        // Smile
        this.ctx.beginPath(); this.ctx.arc(x, y - size * 0.1, size * 0.2, 0.2, Math.PI - 0.2); this.ctx.stroke();
    }

    drawSpiral(x, y, size, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        const maxR = size;
        for (let i = 0; i < 40; i++) {
            const angle = i * 0.4;
            const r = (i / 40) * maxR;
            this.ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        }
        this.ctx.stroke();
    }

    drawLightbulb(x, y, size, color) {
        // Bulb
        this.sketchEllipse(x, y - size * 0.2, size * 0.6, size * 0.6, color);
        // Base
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        const bx = x - size * 0.25; const by = y + size * 0.3;
        this.ctx.moveTo(bx, by);
        this.ctx.lineTo(bx + size * 0.5, by);
        this.ctx.lineTo(bx + size * 0.4, by + size * 0.3);
        this.ctx.lineTo(bx + size * 0.1, by + size * 0.3);
        this.ctx.closePath();
        this.ctx.stroke();
        // Filament
        this.sketchLine(x - size * 0.15, y, x, y - size * 0.2, color);
        this.sketchLine(x + size * 0.15, y, x, y - size * 0.2, color);
    }

    drawLightning(x, y, size, color) {
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        this.ctx.moveTo(x + size * 0.2, y - size);
        this.ctx.lineTo(x - size * 0.3, y);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x - size * 0.2, y + size);
        this.ctx.stroke();
    }

    drawSynchWaves(x, y, size, color) {
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        for (let j = 0; j < 3; j++) {
            const yOffset = y - size / 2 + j * (size / 2);
            this.ctx.moveTo(x - size, yOffset);
            for (let i = 0; i <= 20; i++) {
                const dx = (i / 20) * (size * 2) - size;
                const dy = Math.sin(i * 0.5 + j) * (size * 0.2);
                this.ctx.lineTo(x + dx, yOffset + dy);
            }
        }
        this.ctx.stroke();
    }

    drawGPSTrace(x, y, size, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.setLineDash([5, 5]); // Dashed line
        let cx = x; let cy = y;
        this.ctx.moveTo(cx, cy);

        // Smoother path using bezier curves
        for (let i = 0; i < 4; i++) {
            const nextX = cx + this.random(-size, size);
            const nextY = cy + this.random(-size, size);
            const cp1x = (cx + nextX) / 2 + this.random(-size / 2, size / 2);
            const cp1y = (cy + nextY) / 2 + this.random(-size / 2, size / 2);

            this.ctx.quadraticCurveTo(cp1x, cp1y, nextX, nextY);
            cx = nextX;
            cy = nextY;
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset

        // Start/End points
        this.sketchEllipse(x, y, 3, 3, color);
        this.sketchEllipse(cx, cy, 3, 3, color);
    }

    drawScatterplot(x, y, size, color) {
        // Draw 5 random points clustered around a diagonal (y = x)
        const pts = [];
        for (let i = 0; i < 5; i++) {
            const px = this.random(-size, size);
            // Correlated y with some noise
            const py = px * 0.8 + this.random(-size * 0.3, size * 0.3);
            pts.push({ x: px, y: py });
            this.sketchEllipse(x + px, y - py, 2, 2, color); // y is inverted in canvas
        }

        // Fitted Line (Roughly)
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        // Start point (bottom-leftish)
        const sx = -size; const sy = sx * 0.8;
        // End point (top-rightish)
        const ex = size; const ey = ex * 0.8;

        this.sketchLine(x + sx, y - sy, x + ex, y - ey, color);
    }

    drawDNA(x, y, size, color) {
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        // Two crossing waves
        for (let i = 0; i <= 20; i++) {
            const dy = (i / 20) * (size * 2) - size; // Vertical DNA
            const dx1 = Math.sin(i * 0.5) * (size * 0.4);
            const dx2 = Math.sin(i * 0.5 + Math.PI) * (size * 0.4);

            // Draw rungs every few steps
            if (i % 4 === 0) {
                this.ctx.moveTo(x + dx1, y + dy);
                this.ctx.lineTo(x + dx2, y + dy);
            }
        }
        this.ctx.stroke();

        // Better strands
        this.ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
            const dy = (i / 20) * (size * 2) - size;
            const dx = Math.sin(i * 0.5) * (size * 0.4);
            if (i === 0) this.ctx.moveTo(x + dx, y + dy);
            else this.ctx.lineTo(x + dx, y + dy);
        }
        this.ctx.stroke();
        this.ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
            const dy = (i / 20) * (size * 2) - size;
            const dx = Math.sin(i * 0.5 + Math.PI) * (size * 0.4);
            if (i === 0) this.ctx.moveTo(x + dx, y + dy);
            else this.ctx.lineTo(x + dx, y + dy);
        }
        this.ctx.stroke();
    }

    drawPlanet(x, y, size, color) {
        // Planet Body
        this.sketchEllipse(x, y, size * 0.5, size * 0.5, color);
        // Ring
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        this.ctx.ellipse(x, y, size * 0.9, size * 0.2, -0.4, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawRobot(x, y, size, color) {
        // Head Box
        this.drawCube3D(x, y, size * 0.5, color);
        // Eyes
        this.sketchEllipse(x - size * 0.2, y - size * 0.1, size * 0.1, size * 0.1, color);
        this.sketchEllipse(x + size * 0.2, y - size * 0.1, size * 0.1, size * 0.1, color);
        // Antenna
        this.sketchLine(x, y - size * 0.5, x, y - size * 0.8, color);
        this.sketchEllipse(x, y - size * 0.8, size * 0.05, size * 0.05, color);
    }

    drawGear(x, y, size, color) {
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        const outerR = size * 0.6;
        const innerR = size * 0.5;
        const teeth = 8;
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (Math.PI * 2 * i) / (teeth * 2);
            const r = (i % 2 === 0) ? outerR : innerR;
            this.ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        // Inner hole
        this.sketchEllipse(x, y, size * 0.2, size * 0.2, color);
    }

    drawHistogram(x, y, size, color) {
        // Bars
        const barW = size * 0.3;
        const base = y + size * 0.5;
        this.sketchLine(x - size, base, x + size, base, color); // Axis

        // Bar 1
        let h = size * 0.6;
        this.sketchLine(x - size * 0.5, base, x - size * 0.5, base - h, color);
        this.sketchLine(x - size * 0.5 + barW, base, x - size * 0.5 + barW, base - h, color);
        this.sketchLine(x - size * 0.5, base - h, x - size * 0.5 + barW, base - h, color);

        // Bar 2
        h = size * 0.8;
        this.sketchLine(x, base, x, base - h, color);
        this.sketchLine(x + barW, base, x + barW, base - h, color);
        this.sketchLine(x, base - h, x + barW, base - h, color);
    }

    drawWiFi(x, y, size, color) {
        // Arcs
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        // Dot
        this.ctx.arc(x, y + size * 0.5, size * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        // Arcs
        for (let i = 1; i <= 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(x, y + size * 0.5, size * 0.3 * i, Math.PI * 1.25, Math.PI * 1.75);
            this.ctx.stroke();
        }
    }

    drawColoredPolygon(x, y, size, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color.replace('0.6', '0.2'); // Lighter fill
        const sides = Math.floor(this.random(3, 6)); // Triangle to Pentagon
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawDiagram(x, y, size, color) {
        // Nodes
        this.sketchEllipse(x - size / 2, y, size / 4, size / 4, color);
        this.sketchEllipse(x + size / 2, y, size / 4, size / 4, color);
        this.sketchEllipse(x, y - size / 2, size / 4, size / 4, color);
        // Links
        this.sketchLine(x - size / 2, y, x + size / 2, y, color);
        this.sketchLine(x - size / 2, y, x, y - size / 2, color);
        this.sketchLine(x + size / 2, y, x, y - size / 2, color);
    }

    drawGaussian(x, y, size, color) {
        this.ctx.beginPath(); this.ctx.strokeStyle = color;
        const sigma = size / 2;
        const mu = x;
        // Draw bell curve
        for (let i = -size; i <= size; i += 2) {
            const px = x + i;
            const py = y + size / 2 - (Math.exp(-0.5 * Math.pow(i / (size / 2.5), 2)) * size);
            if (i === -size) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.stroke();
        // Axis
        this.sketchLine(x - size, y + size / 2, x + size, y + size / 2, color);
    }

    // --- Collision ---
    checkCollision(x, y, size) {
        // Simple robust check directly against DOM (no caching issues)
        const elements = document.querySelectorAll(this.avoidSelector);
        const canvasRect = this.canvas.getBoundingClientRect();
        const margin = 20;

        // Let's rewrite loop correctly
        for (let i = 0; i < elements.length; i++) {
            const rect = elements[i].getBoundingClientRect();
            // Relative coords
            const params = {
                left: rect.left - canvasRect.left - margin,
                top: rect.top - canvasRect.top - margin,
                right: rect.right - canvasRect.left + margin,
                bottom: rect.bottom - canvasRect.top + margin
            };
            if (x - size < params.right && x + size > params.left &&
                y - size < params.bottom && y + size > params.top) return true;
        }
        return false;
    }

    animate() {
        let valid = false;
        let attempts = 0;
        let x, y, size, color;

        // Try 20 times then skip
        while (!valid && attempts < 20) {
            x = this.random(0, this.width);
            y = this.random(0, this.height);
            size = this.random(30, 80);
            if (!this.checkCollision(x, y, size)) valid = true;
            attempts++;
        }

        if (valid) {
            color = this.colors[Math.floor(this.random(0, this.colors.length))];

            // Equal Probability Distribution (25 types)
            const type = Math.floor(this.random(0, 25));
            switch (type) {
                case 0: this.drawFaceSketch(x, y, size, color); break;
                case 1: this.drawStar(x, y, size, color); break;
                case 2: this.drawCube3D(x, y, size, color); break;
                case 3: this.drawHappyFace(x, y, size, color); break;
                case 4: this.drawBasketball(x, y, size, color); break;
                case 5: this.drawCar(x, y, size, color); break;
                case 6: this.drawNote(x, y, size, color); break;
                case 7: this.drawHeart(x, y, size, color); break;
                case 8: this.drawAtom(x, y, size, color); break;
                case 9: this.drawMonkey(x, y, size, color); break;
                case 10: this.drawSpiral(x, y, size, color); break;
                case 11: this.drawLightbulb(x, y, size, color); break;
                case 12: this.drawLightning(x, y, size, color); break;
                case 13: this.drawSynchWaves(x, y, size, color); break;
                case 14: this.drawGPSTrace(x, y, size, color); break;
                case 15: this.drawColoredPolygon(x, y, size, color); break;
                case 16: this.drawDiagram(x, y, size, color); break;
                case 17: this.drawGaussian(x, y, size, color); break;
                case 18: this.drawScatterplot(x, y, size, color); break;
                case 19: this.drawDNA(x, y, size, color); break;
                case 20: this.drawPlanet(x, y, size, color); break;
                case 21: this.drawRobot(x, y, size, color); break;
                case 22: this.drawGear(x, y, size, color); break;
                case 23: this.drawHistogram(x, y, size, color); break;
                case 24: this.drawWiFi(x, y, size, color); break;
            }
        }

        setTimeout(() => {
            requestAnimationFrame(() => this.animate());
        }, 50);
    }
}
