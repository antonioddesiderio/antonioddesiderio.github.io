import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const COLORS = {
    U: 0xF27C38, // Orange
    D: 0xE0003C, // Red
    F: 0x0051BA, // Blue
    B: 0x23BC3F, // Green
    L: 0xF9F9F9, // White
    R: 0xFFE206  // Yellow
};

export class RubiksCube {
    constructor(containerId, interactive = false) {
        this.container = document.getElementById(containerId);
        this.interactive = interactive;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cubeGroup = null; // Holds all 27 cubelets
        this.controls = null;
        this.isAnimating = false;

        // Cache textures
        this.stickerTextures = new Map();

        // Cube State
        this.cubelets = []; // Array of meshes
        this.dimension = 3;

        this.init();
    }

    init() {
        if (!this.container) return;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFFFFFF);

        // Camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspect = width / height;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(6, 4, 6);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        // Create Cube
        this.createCube();

        // Interaction
        if (this.interactive) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.autoRotate = false;
        } else {
            // For intro cube, we might want manual rotation or auto-rotation
            // For now, let's just leave it static view
        }

        // Animation Loop
        this.animate();

        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createStickerTexture(colorHex) {
        if (colorHex === null) return null; // Should handle null if needed, but here we can just return a basic black material texture or similar if strictly needed. But mostly we use this for colored faces.

        // Create a key for the cache
        const key = colorHex;
        if (this.stickerTextures.has(key)) {
            return this.stickerTextures.get(key);
        }

        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Black plastic background
        ctx.fillStyle = '#101010';
        ctx.fillRect(0, 0, size, size);

        // Calculate sticker area
        const padding = 35; // Reduced by ~30% from 50
        const cornerRadius = 55; // Slightly reduced to match proportions
        const x = padding;
        const y = padding;
        const w = size - 2 * padding;
        const h = size - 2 * padding;

        // Draw colored sticker
        ctx.fillStyle = '#' + new THREE.Color(colorHex).getHexString();

        // Custom round rect path for compatibility
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + w - cornerRadius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + cornerRadius);
        ctx.lineTo(x + w, y + h - cornerRadius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - cornerRadius, y + h);
        ctx.lineTo(x + cornerRadius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;

        this.stickerTextures.set(key, texture);
        return texture;
    }

    createMaterial(colorValue) {
        // If colorValue is null (inner face), just black plastic
        if (colorValue === null) {
            return new THREE.MeshPhysicalMaterial({
                color: 0x101010,
                roughness: 0.6,
                metalness: 0.1
            });
        }

        // External face with sticker
        return new THREE.MeshPhysicalMaterial({
            map: this.createStickerTexture(colorValue),
            color: 0xffffff, // Tint white so texture shows true colors
            roughness: 0.05,  // Very Glossy
            metalness: 0.1,
            clearcoat: 1.0,   // Max clearcoat
            clearcoatRoughness: 0.05
        });
    }

    createCube() {
        this.cubeGroup = new THREE.Group();
        this.scene.add(this.cubeGroup);

        this.cubelets = [];

        const spacing = 1.02; // Reduced gap slightly for tighter look
        const offset = (this.dimension - 1) / 2;

        // RoundedBoxGeometry( width, height, depth, radius, radiusSegments )
        // Note: parameters might vary by version, checking standard usage:
        // RoundedBoxGeometry( width, height, depth, segments, radius )
        const geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.1);

        for (let x = 0; x < this.dimension; x++) {
            for (let y = 0; y < this.dimension; y++) {
                for (let z = 0; z < this.dimension; z++) {
                    // Create materials for each face based on position
                    // Order: Right, Left, Top, Bottom, Front, Back
                    const materials = [
                        this.createMaterial(x === 2 ? COLORS.R : null),
                        this.createMaterial(x === 0 ? COLORS.L : null),
                        this.createMaterial(y === 2 ? COLORS.U : null),
                        this.createMaterial(y === 0 ? COLORS.D : null),
                        this.createMaterial(z === 2 ? COLORS.F : null),
                        this.createMaterial(z === 0 ? COLORS.B : null),
                    ];

                    const mesh = new THREE.Mesh(geometry, materials);

                    // Position
                    mesh.position.set(
                        (x - offset) * spacing,
                        (y - offset) * spacing,
                        (z - offset) * spacing
                    );

                    // Store logical coordinates for rotation logic
                    mesh.userData = { x, y, z };

                    this.cubeGroup.add(mesh);
                    this.cubelets.push(mesh);
                }
            }
        }
    }

    // Helper to round position/rotation to avoid float errors
    resetCubeletData() {
        const spacing = 1.02;
        const offset = 1;

        this.cubelets.forEach(cube => {
            // Update World Matrix is handled by Three.js, strictly speaking we need to trust visual position
            // But for logical selection we rely on world positions.
            // We need to adhere mesh positions to grid.
            cube.position.x = Math.round(cube.position.x / spacing * 2) * spacing / 2;
            cube.position.y = Math.round(cube.position.y / spacing * 2) * spacing / 2;
            cube.position.z = Math.round(cube.position.z / spacing * 2) * spacing / 2;

            cube.rotation.set(
                Math.round(cube.rotation.x / (Math.PI / 2)) * (Math.PI / 2),
                Math.round(cube.rotation.y / (Math.PI / 2)) * (Math.PI / 2),
                Math.round(cube.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
            );

            cube.updateMatrix();
        });
    }

    // Rotate a face. Axis: 'x', 'y', 'z'. Index: -1, 0, 1 (for left/mid/right etc)
    // Dir: 1 (clockwise), -1 (counter-clockwise)
    rotateFace(axis, index, dir, animate = true, duration = 500) {
        return new Promise(resolve => {
            if (this.isAnimating && animate) return resolve(); // Prevent overlapping animations if needed

            // Select cubelets in the layer
            const spacing = 1.02;
            const epsilon = 0.1;
            const targetPos = index * spacing;

            const activeCubelets = this.cubelets.filter(c => {
                // Get world position
                const worldPos = new THREE.Vector3();
                c.getWorldPosition(worldPos);
                return Math.abs(worldPos[axis] - targetPos) < epsilon;
            });

            // Create a pivot object
            const pivot = new THREE.Object3D();
            pivot.rotation.set(0, 0, 0);
            this.cubeGroup.add(pivot);

            // Attach cubelets to pivot
            activeCubelets.forEach(c => {
                this.cubeGroup.remove(c);
                pivot.add(c);
            });

            const targetRotation = Math.PI / 2 * dir;

            if (!animate) {
                pivot.rotation[axis] += targetRotation;
                pivot.updateMatrixWorld();
                activeCubelets.forEach(c => {
                    pivot.remove(c);
                    c.applyMatrix4(pivot.matrixWorld); // Apply transform
                    this.cubeGroup.add(c);
                });
                this.cubeGroup.remove(pivot);
                this.resetCubeletData();
                resolve();
            } else {
                this.isAnimating = true;
                const startTime = Date.now();

                const animateLoop = () => {
                    const now = Date.now();
                    const t = Math.min((now - startTime) / duration, 1);
                    // Ease out quad
                    const ease = t * (2 - t);

                    pivot.rotation[axis] = targetRotation * ease;

                    if (t < 1) {
                        requestAnimationFrame(animateLoop);
                    } else {
                        // Finish
                        pivot.rotation[axis] = targetRotation;
                        pivot.updateMatrixWorld();

                        activeCubelets.forEach(c => {
                            pivot.remove(c);
                            c.applyMatrix4(pivot.matrixWorld);
                            this.cubeGroup.add(c);
                        });
                        this.cubeGroup.remove(pivot);
                        this.resetCubeletData();
                        this.isAnimating = false;
                        resolve();
                    }
                };
                animateLoop();
            }
        });
    }

    scramble(numMoves = 20) {
        this.movesHistory = []; // Store moves to reverse them later
        const axes = ['x', 'y', 'z'];
        const indices = [-1, 0, 1];
        const dirs = [1, -1];

        for (let i = 0; i < numMoves; i++) {
            const axis = axes[Math.floor(Math.random() * axes.length)];
            const index = indices[Math.floor(Math.random() * indices.length)];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];

            this.rotateFace(axis, index, dir, false); // Instant rotation
            this.movesHistory.push({ axis, index, dir });
        }
    }

    async solve(totalDurationSeconds) {
        const movesToSolve = this.movesHistory.reverse();
        if (movesToSolve.length === 0) return;

        const moveDuration = (totalDurationSeconds * 1000) / movesToSolve.length;

        for (const move of movesToSolve) {
            // Inverse direction to solve
            await this.rotateFace(move.axis, move.index, -move.dir, true, moveDuration);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.interactive && this.controls) {
            this.controls.update();
        } else if (!this.interactive) {
            // Slowly rotate the whole cube for effect
            /* if(this.cubeGroup) {
                this.cubeGroup.rotation.x = Math.sin(Date.now()*0.001)*0.2;
                this.cubeGroup.rotation.y = Date.now()*0.0005;
            } */
        }
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }


}
