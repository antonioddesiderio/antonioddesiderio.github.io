// Stock Rider - Motocross Game on Stock Charts
// Adapted to Antonio Desiderio's Portfolio Aesthetics (Black, White, Vibrant Red #E0003C)

// Web Audio Synth for Engine Hum and Sound Effects
class GameAudio {
    constructor() {
        this.ctx = null;
        this.osc = null;
        this.gain = null;
        this.filter = null;
        this.active = false;
        this.targetPitch = 60;
        this.currentPitch = 60;
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            // Engine Oscillator
            this.osc = this.ctx.createOscillator();
            this.osc.type = 'sawtooth';
            this.osc.frequency.setValueAtTime(60, this.ctx.currentTime);
            
            // Lowpass filter to make it sound like a motor hum
            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.setValueAtTime(150, this.ctx.currentTime);
            this.filter.Q.setValueAtTime(4, this.ctx.currentTime);
            
            // Volume
            this.gain = this.ctx.createGain();
            this.gain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Start silent
            
            // Connections
            this.osc.connect(this.filter);
            this.filter.connect(this.gain);
            this.gain.connect(this.ctx.destination);
            
            this.osc.start();
            this.active = true;
        } catch (e) {
            console.warn("Web Audio API not supported or blocked: ", e);
        }
    }

    startEngine() {
        if (!this.active) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (this.gain) {
            this.gain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.1);
        }
    }

    stopEngine() {
        if (this.gain) {
            this.gain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.1);
        }
    }

    updateEngine(throttle) {
        if (!this.active || !this.osc) return;
        
        // Target frequency goes from 60Hz (idle) to 220Hz (max throttle)
        this.targetPitch = 60 + throttle * 160;
        this.currentPitch += (this.targetPitch - this.currentPitch) * 0.15;
        this.osc.frequency.setValueAtTime(this.currentPitch, this.ctx.currentTime);
        
        // Open the filter slightly with higher pitch
        if (this.filter) {
            this.filter.frequency.setValueAtTime(this.currentPitch * 2.5, this.ctx.currentTime);
        }
    }

    playCoin() {
        if (!this.ctx) return;
        try {
            // Quick sine wave sweep for the "BUY" trigger
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
            
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.15);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    playCrash() {
        if (!this.ctx) return;
        try {
            this.stopEngine();
            // Deep low frequency sweep for the crash
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.5);
            
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.6);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.6);
        } catch (e) {}
    }
}

// ----------------------------------------------------
// CURATED HISTORICAL STOCK PRESETS
// ----------------------------------------------------
const STOCK_PRESETS = {
    gme: {
        ticker: "GME",
        name: "GameStop Meme Squeeze",
        trend: "+2,400%",
        direction: "up",
        prices: [
            15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 17, 19, 21, 20, 25, 30, 35, 
            40, 38, 48, 65, 80, 110, 150, 250, 483, 420, 350, 280, 180, 110, 90, 120, 190, 270, 220, 160, 
            130, 100, 90, 85, 95, 120, 150, 135, 110, 90, 80, 110, 140, 190, 170, 130, 95, 80, 70, 85, 
            100, 130, 170, 210, 180, 140, 110, 90, 80, 75, 90, 110, 130, 160, 145, 120, 100, 85, 75, 70, 
            75, 80, 90, 110, 120, 105, 90, 80, 75, 80, 90, 100, 110, 100, 90, 85, 80, 85, 90, 100
        ]
    },
    nvda: {
        ticker: "NVDA",
        name: "Nvidia AI Surge",
        trend: "+850%",
        direction: "up",
        prices: [
            12, 12, 12, 12, 12, 12, 12, 12, 13, 14, 16, 15, 18, 20, 19, 22, 25, 23, 28, 32, 
            30, 35, 41, 38, 45, 52, 48, 56, 64, 60, 68, 76, 72, 82, 92, 88, 100, 112, 106, 120, 
            135, 128, 145, 162, 154, 175, 195, 186, 210, 230, 218, 245, 272, 260, 290, 320, 305, 340, 
            380, 360, 410, 450, 430, 490, 540, 515, 580, 640, 610, 680, 750, 715, 800, 870, 835, 920, 
            1000, 960, 1060, 1180, 1120, 1250, 1380, 1320, 1450, 1600, 1540, 1700, 1880, 1800, 1950, 2100
        ]
    },
    tsla: {
        ticker: "TSLA",
        name: "Tesla Cyber Slope",
        trend: "+340%",
        direction: "up",
        prices: [
            80, 80, 80, 80, 80, 80, 80, 80, 85, 95, 115, 140, 130, 110, 90, 70, 65, 80, 105, 135, 
            160, 185, 170, 140, 110, 85, 95, 120, 155, 200, 250, 290, 260, 210, 160, 120, 95, 115, 145, 190, 
            245, 300, 350, 320, 270, 210, 160, 125, 150, 190, 240, 290, 330, 295, 245, 190, 140, 165, 205, 255, 
            305, 340, 305, 250, 195, 150, 180, 225, 275, 315, 335, 295, 240, 180, 145, 175, 220, 260, 280, 240
        ]
    },
    aapl: {
        ticker: "AAPL",
        name: "Apple Safe Ridge",
        trend: "+48%",
        direction: "up",
        prices: [
            100, 100, 100, 100, 100, 100, 100, 100, 102, 104, 103, 106, 108, 107, 110, 112, 111, 114, 116, 115, 
            118, 120, 119, 122, 124, 123, 126, 128, 127, 130, 132, 131, 134, 136, 135, 138, 140, 139, 142, 144, 
            143, 146, 148, 147, 150, 152, 151, 154, 156, 155, 158, 160, 159, 162, 164, 163, 166, 168, 167, 170
        ]
    }
};

// ----------------------------------------------------
// MAIN GAME CLASS
// ----------------------------------------------------
class StockRider {
    constructor() {
        this.canvas = document.getElementById('stockRiderCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Audio Synth
        this.audio = new GameAudio();

        // Dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Game State variables
        this.prices = [];
        this.originalPrices = [];
        this.ticker = "GME";
        this.trackName = "GameStop Meme Squeeze";
        this.trendText = "+420%";
        this.trendDirection = "up";

        this.trackPoints = []; // [{x, y, rawPrice}]
        this.coins = [];       // [{x, y, active}]
        
        // ---- Physics dimensions (stonkrider.com exact values: Bl, Vl, Hl, Ul, Wl) ----
        this.WHEEL_RADIUS  = 14;   // Bl
        this.FRAME_WIDTH   = 42;   // Vl
        this.FRAME_HEIGHT  = 12;   // Hl
        this.WHEEL_SPACING = 70;   // Ul – full wheel-to-wheel distance
        this.FRAME_ABOVE   = 20;   // Wl – frame centre sits this far above wheel centre
        this.wheelRadius   = this.WHEEL_RADIUS; // alias used by rendering code

        // Fixed-step accumulator – stonkrider locks physics at 60 Hz, no sub-stepping
        this.FIXED_STEP = 1000 / 60; // ms per tick (≈16.67 ms)
        this.accumulator = 0;

        // Force constants from stonkrider bundle (Gl, ql, Kl, Yl)
        this.Gl = 0.7;   // angular-velocity threshold before drive force applies
        this.ql = 0.013; // drive force magnitude per tick
        this.Kl = 14;    // forward speed at which drive force → 0
        this.Yl = 0.007; // lean couple force magnitude per arm

        // Matter.js engine – default gravity y=1, same as stonkrider
        this.matterEngine = Matter.Engine.create();
        this.matterEngine.gravity.y = 1;
        this.matterWorld = this.matterEngine.world;

        // Visual-state snapshots (kept so HUD / rendering needs no changes)
        this.bike = {
            chassis: { x: 0, y: 0, vx: 0, vy: 0, angle: 0 },
            rear:    { x: 0, y: 0, vx: 0, vy: 0, onGround: false, angle: 0 },
            front:   { x: 0, y: 0, vx: 0, vy: 0, onGround: false, angle: 0 }
        };

        // ---- Matter.js bodies (stonkrider Xl function) ----
        const tx = 140, ty = 500;
        const frameY = ty - this.WHEEL_RADIUS - this.FRAME_ABOVE; // frame centre y
        const wheelY = ty - this.WHEEL_RADIUS;                     // wheel centre y

        // Frame – mask:0 means it never physically collides with anything;
        // constraints hold it in place above the wheels.
        this.bike.frameBody = Matter.Bodies.rectangle(tx, frameY, this.FRAME_WIDTH, this.FRAME_HEIGHT, {
            mass: 4,
            friction: 0.5,
            frictionAir: 0.005,
            restitution: 0.05,
            label: 'frame',
            collisionFilter: { group: -1, mask: 0 }
        });

        // Rear wheel – group -1 means it ignores other group-(-1) bodies
        // (frame, guard) but still rolls on terrain (group 0).
        this.bike.rearBody = Matter.Bodies.circle(tx - this.WHEEL_SPACING / 2, wheelY, this.WHEEL_RADIUS, {
            mass: 1.2,
            friction: 0.9,
            frictionAir: 0.001,
            restitution: 0.02,
            label: 'wheel',
            collisionFilter: { group: -1 }
        });

        // Front wheel
        this.bike.frontBody = Matter.Bodies.circle(tx + this.WHEEL_SPACING / 2, wheelY, this.WHEEL_RADIUS, {
            mass: 1.2,
            friction: 0.9,
            frictionAir: 0.001,
            restitution: 0.02,
            label: 'wheel',
            collisionFilter: { group: -1 }
        });

        // Guard / rider mass – bobbing body above frame (stonkrider guard body)
        const guardY = frameY + this.FRAME_HEIGHT / 2 + 10;
        this.bike.guardBody = Matter.Bodies.circle(tx, guardY, 10, {
            mass: 0.1,
            friction: 0.3,
            restitution: 0,
            label: 'guard',
            collisionFilter: { group: -1 }
        });

        // ---- Constraints – stonkrider exact setup ----
        const sd  = { stiffness: 0.6, damping: 0.25 }; // suspension defaults
        const lUp = Math.sqrt(980);  // upper spring natural length ≈ 31.3 px
        const lLo = Math.sqrt(340);  // lower spring natural length ≈ 18.4 px
        const cX  = this.FRAME_WIDTH / 2; // front-side attachment x on frame (= 21)
        const Jl  = 8;                    // lower attachment y on frame

        // Four suspension springs: upper + lower for each wheel
        const rearUpper  = Matter.Constraint.create({ bodyA: this.bike.frameBody, pointA: { x: -cX, y: -8 }, bodyB: this.bike.rearBody,  length: lUp, ...sd });
        const rearLower  = Matter.Constraint.create({ bodyA: this.bike.frameBody, pointA: { x: -cX, y: Jl  }, bodyB: this.bike.rearBody,  length: lLo, ...sd });
        const frontUpper = Matter.Constraint.create({ bodyA: this.bike.frameBody, pointA: { x:  cX, y: -8 }, bodyB: this.bike.frontBody, length: lUp, ...sd });
        const frontLower = Matter.Constraint.create({ bodyA: this.bike.frameBody, pointA: { x:  cX, y: Jl  }, bodyB: this.bike.frontBody, length: lLo, ...sd });

        // Axle link – keeps wheels at the correct spacing
        const axleLink  = Matter.Constraint.create({ bodyA: this.bike.rearBody, bodyB: this.bike.frontBody, length: this.WHEEL_SPACING, ...sd });

        // Guard neck – length:0, stiffness:1 = nearly rigid
        const guardNeck = Matter.Constraint.create({ bodyA: this.bike.frameBody, pointA: { x: 0, y: 16 }, bodyB: this.bike.guardBody, length: 0, stiffness: 1, damping: 0.1 });

        this.bikeConstraints = [rearUpper, rearLower, frontUpper, frontLower, axleLink, guardNeck];

        Matter.Composite.add(this.matterWorld, [
            this.bike.frameBody,
            this.bike.rearBody,
            this.bike.frontBody,
            this.bike.guardBody,
            ...this.bikeConstraints
        ]);

        this.terrainBodies = [];

        // Persist ground state between ticks (stonkrider: R and ue are loop-scoped vars
        // that carry over from the previous Engine.update step)
        this.rearOnGround  = false;
        this.frontOnGround = false;

        // Track constraints
        this.runwayWidth = 400;
        this.finishWidth = 450;
        this.pxPerPoint = 28;
        this.baseHeight = 520;       // Y coordinate for lowest price
        this.heightRange = 360;      // Amplitude of vertical scaling

        // Camera
        this.camX = 0;
        this.camY = 0;

        // Game Flow Flags
        this.isGameOver = false;
        this.isWin = false;
        this.isStarted = false;
        this.score = 0;
        this.crashes = 0;
        this.startTime = 0;
        this.finalTime = 0;

        // Particles
        this.particles = [];

        // Key states
        this.keys = {
            up: false,    // throttle
            down: false,  // brake/reverse
            left: false,  // lean back CCW
            right: false  // lean forward CW
        };

        // Initialize UI components and loops
        this.initUI();
        this.setupKeyboard();
        this.loadPresetTrack('gme');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());

        // Kick off loops
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // Adapt to window sizes
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initUI() {
        // Preset selectors
        const selectors = document.querySelectorAll('.stock-option-btn');
        selectors.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                selectors.forEach(b => b.classList.remove('active'));
                target.classList.add('active');

                const type = target.getAttribute('data-type');
                const id = target.getAttribute('data-id');

                if (type === 'preset') {
                    this.loadPresetTrack(id);
                } else if (type === 'live') {
                    this.loadLiveCrypto(id);
                }
            });
        });

        // Overlay buttons
        document.getElementById('start-btn').addEventListener('click', () => {
            document.getElementById('intro-screen').style.display = 'none';
            this.isStarted = true;
            this.audio.startEngine();
            this.resetGame();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('game-over-screen').style.display = 'none';
            this.isGameOver = false;
            this.audio.startEngine();
            this.resetGame();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            document.getElementById('game-win-screen').style.display = 'none';
            this.isWin = false;
            this.audio.startEngine();
            this.resetGame();
        });

        // Uploader drop zone
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');

        uploadZone.addEventListener('click', () => fileInput.click());
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleUploadedFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleUploadedFile(e.target.files[0]);
            }
        });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (!this.isStarted) return;
            
            const key = e.key.toLowerCase();
            if (key === 'arrowup' || key === 'w') {
                this.keys.up = true;
                e.preventDefault();
            } else if (key === 'arrowdown' || key === 's') {
                this.keys.down = true;
                e.preventDefault();
            } else if (key === 'arrowleft' || key === 'a') {
                this.keys.left = true;
                e.preventDefault();
            } else if (key === 'arrowright' || key === 'd') {
                this.keys.right = true;
                e.preventDefault();
            } else if (key === 'r') {
                // Quick reset
                this.isGameOver = false;
                this.isWin = false;
                document.getElementById('game-over-screen').style.display = 'none';
                document.getElementById('game-win-screen').style.display = 'none';
                this.audio.startEngine();
                this.resetGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowup' || key === 'w') {
                this.keys.up = false;
            } else if (key === 'arrowdown' || key === 's') {
                this.keys.down = false;
            } else if (key === 'arrowleft' || key === 'a') {
                this.keys.left = false;
            } else if (key === 'arrowright' || key === 'd') {
                this.keys.right = false;
            }
        });
    }

    // ----------------------------------------------------
    // TRACK GENERATION AND DATA PROCESSING
    // ----------------------------------------------------
    loadPresetTrack(id) {
        const preset = STOCK_PRESETS[id];
        if (!preset) return;
        this.ticker = preset.ticker;
        this.trackName = preset.name;
        this.trendText = preset.trend;
        this.trendDirection = preset.direction;
        this.originalPrices = [...preset.prices];
        this.generateTrack();
    }

    async loadLiveCrypto(symbol) {
        const loader = document.getElementById('api-loader');
        loader.style.display = 'flex';
        
        try {
            // Fetch daily candlestick prices for the last 150 days from Binance
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=130`);
            if (!response.ok) throw new Error("Binance API call failed");
            
            const klines = await response.json();
            const closePrices = klines.map(candle => parseFloat(candle[4])); // Candle Close Price is index 4
            
            // Calculate trend percent
            const first = closePrices[0];
            const last = closePrices[closePrices.length - 1];
            const changePercent = ((last - first) / first) * 100;
            const sign = changePercent >= 0 ? "+" : "";
            
            this.ticker = symbol.replace("USDT", "");
            this.trackName = `${this.ticker} Live Market Chart`;
            this.trendText = `${sign}${changePercent.toFixed(1)}%`;
            this.trendDirection = changePercent >= 0 ? "up" : "down";
            this.originalPrices = closePrices;
            
            this.generateTrack();
        } catch (error) {
            console.error("Failed to load live data, falling back to cached preset: ", error);
            // Fallback to GME or BTC cached preset
            this.loadPresetTrack('gme');
            alert("Could not reach Binance API (CORS issue or offline). Falling back to GME preset.");
        } finally {
            loader.style.display = 'none';
        }
    }

    handleUploadedFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            let parsedPrices = [];

            try {
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(text);
                    if (Array.isArray(data)) {
                        // Array of numbers or objects
                        parsedPrices = data.map(item => typeof item === 'number' ? item : (item.close || item.price || item.value));
                    } else if (data.prices && Array.isArray(data.prices)) {
                        parsedPrices = data.prices;
                    }
                } else {
                    // CSV/TXT parsing
                    const lines = text.split('\n');
                    let priceColIndex = -1;
                    
                    // Parse headers if any
                    const headers = lines[0].toLowerCase().split(/[;,]/);
                    const colKeywords = ['close', 'price', 'value', 'adj close', 'rate'];
                    
                    for (let keyword of colKeywords) {
                        priceColIndex = headers.findIndex(h => h.trim().includes(keyword));
                        if (priceColIndex !== -1) break;
                    }

                    // Fallback to first column with numeric data if keyword not found
                    if (priceColIndex === -1) {
                        priceColIndex = 0; // default to column 0
                    }

                    for (let idx = 1; idx < lines.length; idx++) {
                        const cols = lines[idx].split(/[;,]/);
                        if (cols.length > priceColIndex) {
                            const val = parseFloat(cols[priceColIndex].replace(/[^\d.-]/g, ''));
                            if (!isNaN(val)) {
                                parsedPrices.push(val);
                            }
                        }
                    }
                }

                // Smooth out empty or null items
                parsedPrices = parsedPrices.filter(p => p !== null && !isNaN(p) && p > 0);

                if (parsedPrices.length < 15) {
                    throw new Error("Track needs at least 15 valid prices");
                }

                // Limit length to prevent extreme rendering lag
                if (parsedPrices.length > 250) {
                    parsedPrices = parsedPrices.slice(parsedPrices.length - 250);
                }

                this.ticker = "UPLOAD";
                this.trackName = file.name.substring(0, 18);
                
                // Calculate pseudo-trend
                const first = parsedPrices[0];
                const last = parsedPrices[parsedPrices.length - 1];
                const change = ((last - first) / first) * 100;
                this.trendText = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
                this.trendDirection = change >= 0 ? "up" : "down";
                this.originalPrices = parsedPrices;

                // Trigger UI feedback
                const successAlert = document.getElementById('upload-success');
                successAlert.style.display = 'block';
                successAlert.innerText = `Loaded "${file.name}" (${parsedPrices.length} candles)`;
                setTimeout(() => { successAlert.style.display = 'none'; }, 4000);

                // Selectors cleanup
                const selectors = document.querySelectorAll('.stock-option-btn');
                selectors.forEach(b => b.classList.remove('active'));

                this.generateTrack();
                this.resetGame();
            } catch (err) {
                console.error(err);
                alert("Error parsing file. Ensure it is a valid CSV or JSON array containing close prices.");
            }
        };
        reader.readAsText(file);
    }

    generateTrack() {
        // Smooth the prices array with a simple moving average window of 3 to filter out noise,
        // which makes it playable while keeping major patterns.
        const windowSize = 3;
        this.prices = [];
        for (let i = 0; i < this.originalPrices.length; i++) {
            let sum = 0;
            let count = 0;
            for (let w = -Math.floor(windowSize / 2); w <= Math.floor(windowSize / 2); w++) {
                const idx = i + w;
                if (idx >= 0 && idx < this.originalPrices.length) {
                    sum += this.originalPrices[idx];
                    count++;
                }
            }
            this.prices.push(sum / count);
        }

        // Get min/max for Y scaling
        const minVal = Math.min(...this.prices);
        const maxVal = Math.max(...this.prices);
        const valDiff = maxVal - minVal === 0 ? 1 : maxVal - minVal;

        this.trackPoints = [];
        this.coins = [];

        // Scale functions
        const scaleY = (val) => {
            // Canvas Y runs downwards: maximum price should be highest (smallest Y), minimum price lowest (biggest Y).
            const normalized = (val - minVal) / valDiff;
            return this.baseHeight - normalized * this.heightRange;
        };

        // Build flat runway
        const startY = scaleY(this.prices[0]);
        for (let x = 0; x < this.runwayWidth; x += 15) {
            this.trackPoints.push({ x: x, y: startY, price: this.prices[0] });
        }

        // Build stock chart price track
        for (let i = 0; i < this.prices.length; i++) {
            const startX = this.runwayWidth + i * this.pxPerPoint;
            // Cosine interpolate intermediate points to make it super smooth for the physics wheels
            const priceCurrent = this.prices[i];
            const priceNext = (i + 1 < this.prices.length) ? this.prices[i + 1] : priceCurrent;
            const yCurrent = scaleY(priceCurrent);
            const yNext = scaleY(priceNext);

            const segments = 4; // number of interpolated points per price candle
            for (let s = 0; s < segments; s++) {
                const t = s / segments;
                // Cosine interpolation
                const t2 = (1 - Math.cos(t * Math.PI)) / 2;
                const interpX = startX + t * this.pxPerPoint;
                const interpY = yCurrent * (1 - t2) + yNext * t2;
                const interpPrice = priceCurrent * (1 - t) + priceNext * t;

                this.trackPoints.push({ x: interpX, y: interpY, price: interpPrice });
            }

            // Scatter coins (BUY nodes) to collect along the path
            // Placed at every 3rd stock point, 50-70px above the track
            if (i > 2 && i < this.prices.length - 2 && i % 3 === 0) {
                // Ensure coin height is safe
                const cY = scaleY(priceCurrent) - 65 - Math.sin(i) * 20;
                this.coins.push({
                    x: startX + this.pxPerPoint / 2,
                    y: cY,
                    active: true,
                    val: Math.round(priceCurrent / 2) // score corresponds to price
                });
            }
        }

        // Build flat finish runway
        const endX = this.runwayWidth + (this.prices.length - 1) * this.pxPerPoint;
        const endY = scaleY(this.prices[this.prices.length - 1]);
        for (let offset = 0; offset <= this.finishWidth; offset += 15) {
            this.trackPoints.push({ x: endX + offset, y: endY, price: this.prices[this.prices.length - 1] });
        }

        // Update HUD labels
        document.getElementById('hud-ticker').firstElementChild.innerText = this.ticker;
        const trendEl = document.getElementById('hud-trend');
        trendEl.innerText = this.trendText;
        if (this.trendDirection === "up") {
            trendEl.className = "hud-price-trend trend-up";
        } else {
            trendEl.className = "hud-price-trend trend-down";
        }

        // Build Matter.js static segment bodies for the track
        if (this.terrainBodies && this.terrainBodies.length > 0) {
            Matter.Composite.remove(this.matterWorld, this.terrainBodies);
        }
        this.terrainBodies = [];

        for (let i = 0; i < this.trackPoints.length - 1; i++) {
            const pt1 = this.trackPoints[i];
            const pt2 = this.trackPoints[i + 1];
            const dx = pt2.x - pt1.x;
            const dy = pt2.y - pt1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Stonkrider exact terrain creation
            // Offset downward by half the thickness (15) so the TOP edge aligns with the track line
            const thickness = 30;
            const offsetX = -Math.sin(angle) * (thickness / 2);
            const offsetY = Math.cos(angle) * (thickness / 2);

            const segmentBody = Matter.Bodies.rectangle(
                pt1.x + dx * 0.5 + offsetX,
                pt1.y + dy * 0.5 + offsetY,
                len + 4, // slight overlap
                thickness,
                {
                    isStatic: true,
                    angle: angle,
                    friction: 0.8,
                    restitution: 0,
                    chamfer: { radius: 6 }, // CRITICAL: prevents wheels from snagging on segment seams!
                    label: 'terrain',
                    collisionFilter: { category: 0x0001 } // category 1: terrain collides with wheels
                }
            );
            this.terrainBodies.push(segmentBody);
        }
        Matter.Composite.add(this.matterWorld, this.terrainBodies);

        this.resetGame();
    }

    // Return interpolated height at coordinate X
    getTerrainHeight(x) {
        if (x <= 0) return this.trackPoints[0].y;
        if (x >= this.trackPoints[this.trackPoints.length - 1].x) {
            return this.trackPoints[this.trackPoints.length - 1].y;
        }

        // Binary search to find segment
        let low = 0;
        let high = this.trackPoints.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const pt = this.trackPoints[mid];
            
            if (mid < this.trackPoints.length - 1 && x >= pt.x && x <= this.trackPoints[mid + 1].x) {
                // Interpolate
                const nextPt = this.trackPoints[mid + 1];
                const t = (x - pt.x) / (nextPt.x - pt.x);
                return pt.y + t * (nextPt.y - pt.y);
            }

            if (x < pt.x) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        return this.baseHeight;
    }

    // Get stock price at coordinate X (used for HUD display)
    getStockPriceAt(x) {
        const offset = x - this.runwayWidth;
        if (offset < 0) return this.prices[0];
        const idx = Math.floor(offset / this.pxPerPoint);
        if (idx >= this.prices.length) return this.prices[this.prices.length - 1];
        
        const t = (offset % this.pxPerPoint) / this.pxPerPoint;
        return this.prices[idx] * (1 - t) + (this.prices[idx+1] || this.prices[idx]) * t;
    }

    // ----------------------------------------------------
    // PHYSICS SOLVER
    // ----------------------------------------------------
    resetGame(isFullReset = true) {
        // Position rider at start of runway
        const startX = 140;
        const startY = this.getTerrainHeight(startX);

        // Compute start positions for all bodies
        const frameStartY = startY - this.WHEEL_RADIUS - this.FRAME_ABOVE;
        const wheelStartY = startY - this.WHEEL_RADIUS;
        const guardStartY = frameStartY + this.FRAME_HEIGHT / 2 + 10;

        // Clear accumulator and ground state so no phantom forces carry over between resets
        this.accumulator   = 0;
        this.rearOnGround  = false;
        this.frontOnGround = false;

        // Reposition Matter.js bodies (stonkrider au function)
        if (this.bike.rearBody) {
            Matter.Body.setPosition(this.bike.rearBody, { x: startX - this.WHEEL_SPACING / 2, y: wheelStartY });
            Matter.Body.setVelocity(this.bike.rearBody, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(this.bike.rearBody, 0);
        }

        if (this.bike.frontBody) {
            Matter.Body.setPosition(this.bike.frontBody, { x: startX + this.WHEEL_SPACING / 2, y: wheelStartY });
            Matter.Body.setVelocity(this.bike.frontBody, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(this.bike.frontBody, 0);
        }

        if (this.bike.frameBody) {
            Matter.Body.setPosition(this.bike.frameBody, { x: startX, y: frameStartY });
            Matter.Body.setVelocity(this.bike.frameBody, { x: 0, y: 0 });
            Matter.Body.setAngle(this.bike.frameBody, 0);
            Matter.Body.setAngularVelocity(this.bike.frameBody, 0);
        }

        if (this.bike.guardBody) {
            Matter.Body.setPosition(this.bike.guardBody, { x: startX, y: guardStartY });
            Matter.Body.setVelocity(this.bike.guardBody, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(this.bike.guardBody, 0);
        }

        // Keep visual snapshots in sync
        this.bike.chassis.x = startX;
        this.bike.chassis.y = frameStartY;
        this.bike.chassis.vx = 0;
        this.bike.chassis.vy = 0;
        this.bike.chassis.angle = 0;

        this.bike.rear.x = startX - this.WHEEL_SPACING / 2;
        this.bike.rear.y = wheelStartY;
        this.bike.rear.vx = 0;
        this.bike.rear.vy = 0;
        this.bike.rear.onGround = true;
        this.bike.rear.angle = 0;

        this.bike.front.x = startX + this.WHEEL_SPACING / 2;
        this.bike.front.y = wheelStartY;
        this.bike.front.vx = 0;
        this.bike.front.vy = 0;
        this.bike.front.onGround = true;
        this.bike.front.angle = 0;

        this.camX = 0;
        this.camY = 0;
        
        this.spawnTimer = 0.8; // Invulnerability frames to prevent spawn crashes
        this.particles = [];

        if (isFullReset) {
            this.coins.forEach(c => c.active = true);
            this.score = 0;
            this.lives = 3;
            this.startTime = performance.now();
        }

        this.isGameOver = false;
        this.isWin = false;

        this.keys = { up: false, down: false, left: false, right: false };

        // HUD Reset
        document.getElementById('hud-price').innerText = `$${this.prices[0].toFixed(2)}`;
        document.getElementById('hud-score').innerText = `$${this.score}`;
        document.getElementById('hud-speed').innerText = `0 mph`;
        
        const livesEl = document.getElementById('hud-lives');
        if (livesEl) {
            livesEl.innerText = "📈 📈 📈";
            livesEl.style.color = "#23BC3F";
        }
    }

    // Ground detection using Matter.Query.region() – exactly as stonkrider Zl/Ql functions.
    // This is FAR more accurate than y-position math, especially on slopes.
    isWheelOnGround(wheelBody) {
        const bounds = {
            min: { x: wheelBody.bounds.min.x - 2, y: wheelBody.bounds.min.y - 2 },
            max: { x: wheelBody.bounds.max.x + 2, y: wheelBody.bounds.max.y + 2 }
        };
        return Matter.Query.region(this.terrainBodies, bounds).length > 0;
    }

    updatePhysics(dt) {
        // Fixed-step accumulator – exact stonkrider rt() pattern
        this.accumulator += dt * 1000;
        this.accumulator = Math.min(this.accumulator, 4 * this.FIXED_STEP);

        while (this.accumulator >= this.FIXED_STEP) {
            const frame = this.bike.frameBody;
            const rear  = this.bike.rearBody;
            const front = this.bike.frontBody;

            // Stonkrider rt() order:
            // 1. Apply forces using PREVIOUS tick's ground state (R, ue)
            // 2. Engine.update()
            // 3. Re-query ground state for NEXT tick
            const anyOnGround  = this.rearOnGround || this.frontOnGround; // R (prev tick)
            const bothOnGround = this.rearOnGround && this.frontOnGround; // ue (prev tick)

            // --- Throttle: stonkrider $l(w, b, x, R) ---
            // Angular-velocity ramp always uses a LIVE rear-wheel query (Zl inside $l)
            // but the forward-drive FORCE only fires when anyOnGround was true last tick (r=R).
            if (this.keys.up) {
                const rearLive = this.isWheelOnGround(rear); // Zl – live query
                if (rearLive) {
                    const av = rear.angularVelocity;
                    if (av < this.Gl) {
                        Matter.Body.setAngularVelocity(rear, av + 0.03);
                    }
                    if (anyOnGround) { // !r guard in $l – force only when prev-tick anyOnGround
                        const speedFactor = Math.max(0, 1 - frame.velocity.x / this.Kl);
                        if (speedFactor > 0) {
                            const force = this.ql * speedFactor;
                            let fx = force, fy = 0;
                            for (let i = 0; i < this.trackPoints.length - 1; i++) {
                                if (this.trackPoints[i + 1].x >= rear.position.x) {
                                    const tdx = this.trackPoints[i + 1].x - this.trackPoints[i].x;
                                    const tdy = this.trackPoints[i + 1].y - this.trackPoints[i].y;
                                    const tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
                                    fx = (tdx / tlen) * force;
                                    fy = (tdy / tlen) * force;
                                    break;
                                }
                            }
                            Matter.Body.applyForce(rear, rear.position, { x: fx, y: fy });
                        }
                    }
                }
            }

            // --- Brake ---
            if (this.keys.down) {
                Matter.Body.setAngularVelocity(rear,  rear.angularVelocity  * 0.9);
                Matter.Body.setAngularVelocity(front, front.angularVelocity * 0.9);
            }

            // --- Lean: stonkrider eu(w, 1) / eu(w, -1) ---
            const leanDir = this.keys.left ? 1 : (this.keys.right ? -1 : 0);
            if (leanDir !== 0) {
                const cos  = Math.cos(frame.angle);
                const sin  = Math.sin(frame.angle);
                const arm  = this.FRAME_WIDTH / 2; // 21 px = Vl/2
                const fMag = this.Yl * leanDir;
                const o    = -sin * fMag; // stonkrider: o = -i*Yl*t
                const s    =  cos * fMag; // stonkrider: s =  r*Yl*t
                const fPt  = { x: frame.position.x + cos * arm, y: frame.position.y + sin * arm };
                const rPt  = { x: frame.position.x - cos * arm, y: frame.position.y - sin * arm };
                Matter.Body.applyForce(frame, fPt, { x: -o, y: -s });
                Matter.Body.applyForce(frame, rPt, { x:  o, y:  s });
            }

            // --- Angular stabilisation: stonkrider rt() inner block ---
            const trackAngle = this.getTrackAngleAt(frame.position.x);
            const av = frame.angularVelocity;
            if (bothOnGround) {
                const corr = (trackAngle - frame.angle) * 0.18 - av * 0.1;
                Matter.Body.setAngularVelocity(frame, av + corr);
            } else if (anyOnGround) {
                Matter.Body.setAngularVelocity(frame, av * 0.98);
            } else {
                Matter.Body.setAngularVelocity(frame, av * 0.96);
            }
            const curAV = frame.angularVelocity;
            if (Math.abs(curAV) > 0.08) {
                Matter.Body.setAngularVelocity(frame, Math.sign(curAV) * 0.08);
            }

            // --- Engine step ---
            Matter.Engine.update(this.matterEngine, this.FIXED_STEP);

            // --- Re-query ground state (stored for NEXT tick, exactly as stonkrider) ---
            this.rearOnGround  = this.isWheelOnGround(rear);
            this.frontOnGround = this.isWheelOnGround(front);

            this.accumulator -= this.FIXED_STEP;
        }

        // Sync visual snapshot objects from physics bodies
        const rear  = this.bike.rearBody;
        const front = this.bike.frontBody;
        const frame = this.bike.frameBody;

        this.bike.rear.x        = rear.position.x;
        this.bike.rear.y        = rear.position.y;
        this.bike.rear.vx       = rear.velocity.x;
        this.bike.rear.vy       = rear.velocity.y;
        this.bike.rear.angle    = rear.angle;
        this.bike.rear.onGround = this.rearOnGround;

        this.bike.front.x        = front.position.x;
        this.bike.front.y        = front.position.y;
        this.bike.front.vx       = front.velocity.x;
        this.bike.front.vy       = front.velocity.y;
        this.bike.front.angle    = front.angle;
        this.bike.front.onGround = this.frontOnGround;

        this.bike.chassis.x     = frame.position.x;
        this.bike.chassis.y     = frame.position.y;
        this.bike.chassis.vx    = frame.velocity.x;
        this.bike.chassis.vy    = frame.velocity.y;
        this.bike.chassis.angle = frame.angle;

        // Left boundary guard
        if (rear.position.x < 15) {
            Matter.Body.setPosition(rear,  { x: 15, y: rear.position.y });
            Matter.Body.setVelocity(rear,  { x: 0,  y: rear.velocity.y });
        }
        if (front.position.x < 15) {
            Matter.Body.setPosition(front, { x: 15, y: front.position.y });
            Matter.Body.setVelocity(front, { x: 0,  y: front.velocity.y });
        }
    }

    // Return terrain slope angle (radians) at world-space X – stonkrider rt() inner loop
    getTrackAngleAt(x) {
        for (let i = 0; i < this.trackPoints.length - 1; i++) {
            if (this.trackPoints[i + 1].x >= x) {
                const dx = this.trackPoints[i + 1].x - this.trackPoints[i].x;
                const dy = this.trackPoints[i + 1].y - this.trackPoints[i].y;
                return Math.atan2(dy, dx);
            }
        }
        return 0;
    }

    checkGameStates() {
        if (this.isGameOver || this.isWin) return;
        if (this.spawnTimer > 0) return; // Invulnerability active

        const chassis = this.bike.chassis;

        // 1. Crash Condition: Rider's head/helmet hits the ground
        const headX = this.bike.guardBody.position.x;
        const headY = this.bike.guardBody.position.y;
        const headGroundHeight = this.getTerrainHeight(headX);

        if (headY >= headGroundHeight - 4) {
            this.triggerGameOver();
            return;
        }

        // Extra protection: If both wheels are off the ground, but chassis is lower than wheels (severe tilt/flip)
        const avgWheelsY = (this.bike.rear.y + this.bike.front.y) / 2;
        if (chassis.y > avgWheelsY + 16) {
            this.triggerGameOver();
            return;
        }

        // 2. Win Condition: Reached the end of the stock chart finish line
        const endX = this.runwayWidth + (this.prices.length - 1) * this.pxPerPoint;
        if (chassis.x >= endX + 100) {
            this.triggerWin();
            return;
        }

        // 3. Coin collection checks
        for (let coin of this.coins) {
            if (coin.active) {
                // Distance to chassis (rider) or wheels
                const dChassis = Math.hypot(chassis.x - coin.x, chassis.y - coin.y);
                if (dChassis < 26) {
                    this.collectCoin(coin);
                }
            }
        }
    }

    collectCoin(coin) {
        coin.active = false;
        this.score += coin.val;
        this.audio.playCoin();
        
        // Spawn green particles for score (BUY coin is green, not red!)
        this.spawnExplosion(coin.x, coin.y, '#23BC3F', 12, 3);
        
        // Update score HUD
        document.getElementById('hud-score').innerText = `$${this.score}`;
    }

    triggerGameOver() {
        this.crashes++;
        this.audio.playCrash();

        // Spawn massive explosion particles
        this.spawnExplosion(this.bike.chassis.x, this.bike.chassis.y, '#E0003C', 35, 6);
        this.spawnExplosion(this.bike.chassis.x, this.bike.chassis.y, '#ffffff', 15, 4);

        if (this.lives > 1) {
            // Respawn (lose 1 life)
            this.lives--;
            this.resetGame(false);
        } else {
            // Out of lives (Margin Call)
            this.lives = 0;
            this.isGameOver = true;
            this.audio.stopEngine();
            document.getElementById('final-score').innerText = `$${this.score}`;
            document.getElementById('game-over-screen').style.display = 'flex';
        }
    }

    triggerWin() {
        this.isWin = true;
        this.finalTime = Math.round((performance.now() - this.startTime) / 1000);
        this.audio.stopEngine();

        // Spawn celebration confetti
        this.spawnExplosion(this.bike.chassis.x, this.bike.chassis.y, '#E0003C', 30, 5);
        this.spawnExplosion(this.bike.chassis.x, this.bike.chassis.y, '#ffffff', 30, 5);

        document.getElementById('win-score').innerText = `$${this.score}`;
        document.getElementById('win-time').innerText = `${this.finalTime}s`;
        document.getElementById('game-win-screen').style.display = 'flex';
    }

    // ----------------------------------------------------
    // PARTICLE EFFECTS
    // ----------------------------------------------------
    spawnExplosion(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const mag = (0.3 + Math.random() * 0.7) * speed;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * mag,
                vy: Math.sin(angle) * mag - (Math.random() * 1.5), // fly slightly upward
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                color: color,
                size: 2 + Math.random() * 4
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.life -= p.decay * dt * 60;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Dirt/Smoke emissions from rear wheel when throttling on ground
        if (this.bike.rear.onGround && this.keys.up && Math.random() < 0.25) {
            this.particles.push({
                x: this.bike.rear.x,
                y: this.bike.rear.y + this.wheelRadius - 2,
                vx: -this.bike.rear.vx * 0.1 - (Math.random() * 2),
                vy: -Math.random() * 1.5,
                life: 0.8,
                decay: 0.05,
                color: 'rgba(255, 255, 255, 0.15)',
                size: 1.5 + Math.random() * 3
            });
        }
    }

    // ----------------------------------------------------
    // CANVAS RENDER LOOPS
    // ----------------------------------------------------
    drawGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        this.ctx.lineWidth = 1;

        // Grid parallax scroll
        const gridSpacing = 80;
        const offsetX = -(this.camX * 0.4) % gridSpacing;
        const offsetY = -(this.camY * 0.4) % gridSpacing;

        // Draw vertical lines
        for (let x = offsetX; x < this.width; x += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = offsetY; y < this.height; y += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawDecorations() {
        this.ctx.save();
        this.ctx.translate(-this.camX, -this.camY);

        // 1. Candlestick Bars / Volume Profile at bottom of screen
        const startVisibleIdx = Math.max(0, Math.floor((this.camX - this.runwayWidth) / this.pxPerPoint));
        const endVisibleIdx = Math.min(this.prices.length, Math.ceil((this.camX + this.width - this.runwayWidth) / this.pxPerPoint));
        
        for (let i = startVisibleIdx; i < endVisibleIdx; i++) {
            const x = this.runwayWidth + i * this.pxPerPoint;
            
            // Draw pseudo volume bars at the very bottom
            // Height proportional to price changes
            const price = this.prices[i];
            const prevPrice = this.prices[i - 1] || price;
            const diff = price - prevPrice;
            const volHeight = Math.min(80, 20 + Math.abs(diff) * 1.5);
            
            this.ctx.fillStyle = diff >= 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(224, 0, 60, 0.05)';
            this.ctx.fillRect(x - 5, this.height + this.camY - volHeight, 10, volHeight);

            // Floating horizontal price labels at key points (peaks)
            if (i > 0 && i < this.prices.length - 1) {
                if (price > this.prices[i-1] && price > this.prices[i+1] && i % 8 === 0) {
                    this.ctx.fillStyle = '#666';
                    this.ctx.font = '9px "Space Mono", Courier, monospace';
                    this.ctx.fillText(`$${price.toFixed(1)}`, x - 15, this.getTerrainHeight(x) - 40);
                    
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                    this.ctx.setLineDash([2, 4]);
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 40, this.getTerrainHeight(x) - 35);
                    this.ctx.lineTo(x + 40, this.getTerrainHeight(x) - 35);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);
                }
            }
        }

        // Draw Finish Line Text
        const finishX = this.runwayWidth + (this.prices.length - 1) * this.pxPerPoint;
        const finishY = this.getTerrainHeight(finishX);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(finishX, finishY - 400, 150, 400);

        this.ctx.fillStyle = '#E0003C';
        this.ctx.font = 'bold 12px "Space Mono", monospace';
        this.ctx.fillText("HODL FINISH LINE", finishX + 15, finishY - 120);

        this.ctx.restore();
    }

    drawTrack() {
        this.ctx.save();
        this.ctx.translate(-this.camX, -this.camY);

        // Draw the glowing filled area underneath the stock path
        this.ctx.beginPath();
        this.ctx.moveTo(this.trackPoints[0].x, this.height + this.camY + 200);
        for (let pt of this.trackPoints) {
            this.ctx.lineTo(pt.x, pt.y);
        }
        this.ctx.lineTo(this.trackPoints[this.trackPoints.length - 1].x, this.height + this.camY + 200);
        this.ctx.closePath();

        const grad = this.ctx.createLinearGradient(0, this.baseHeight - this.heightRange, 0, this.height + this.camY + 100);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.035)');
        grad.addColorStop(1, 'rgba(11, 11, 14, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fill();

        // Draw segments with glowing lines
        // Segments are green if price increases, red if decreases
        for (let i = 0; i < this.trackPoints.length - 1; i++) {
            const pt1 = this.trackPoints[i];
            const pt2 = this.trackPoints[i + 1];

            // Color code segments based on raw price delta
            const isUp = pt2.price >= pt1.price;
            this.ctx.strokeStyle = isUp ? '#ffffff' : '#E0003C';
            
            // Add slight glowing shadows to stock charts
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = this.ctx.strokeStyle;
            
            this.ctx.lineWidth = 3.5;
            this.ctx.beginPath();
            this.ctx.moveTo(pt1.x, pt1.y);
            this.ctx.lineTo(pt2.x, pt2.y);
            this.ctx.stroke();
        }

        // Clean shadow blur
        this.ctx.shadowBlur = 0;

        // Draw checkered finish flag
        const finishX = this.runwayWidth + (this.prices.length - 1) * this.pxPerPoint;
        const finishY = this.getTerrainHeight(finishX);
        this.drawCheckeredFlag(finishX, finishY);

        this.ctx.restore();
    }

    drawCheckeredFlag(x, y) {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y - 60);
        this.ctx.stroke();

        // Checkered board
        const rows = 4;
        const cols = 5;
        const size = 6;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.ctx.fillStyle = (r + c) % 2 === 0 ? '#fff' : '#000';
                this.ctx.fillRect(x + c * size, y - 60 + r * size, size, size);
            }
        }
    }

    drawCoins() {
        this.ctx.save();
        this.ctx.translate(-this.camX, -this.camY);

        this.ctx.shadowBlur = 10;
        
        for (let coin of this.coins) {
            if (!coin.active) continue;

            // Soft floating oscillation
            const offset = Math.sin(performance.now() * 0.007 + coin.x) * 4;
            
            this.ctx.fillStyle = 'rgba(224, 0, 60, 0.9)';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.shadowColor = '#ffffff';
            this.ctx.lineWidth = 2;

            // Draw buy icon (Green triangle pointing UP inside circle)
            this.ctx.beginPath();
            this.ctx.arc(coin.x, coin.y + offset, 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Draw Up Arrow (BUY)
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.moveTo(coin.x, coin.y + offset - 5);
            this.ctx.lineTo(coin.x - 5, coin.y + offset + 2);
            this.ctx.lineTo(coin.x + 5, coin.y + offset + 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Label "BUY"
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.font = 'bold 7px "Space Mono", monospace';
            this.ctx.fillText("BUY", coin.x - 6, coin.y + offset + 14);
        }

        this.ctx.restore();
    }

    drawRider() {
        if (this.isGameOver) return; // Don't draw live bike if dead

        this.ctx.save();
        this.ctx.translate(-this.camX, -this.camY);

        const pc = this.bike.chassis;
        const pr = this.bike.rear;
        const pf = this.bike.front;

        // Draw suspensions (spring lines)
        this.ctx.strokeStyle = '#2d2d30';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(pc.x, pc.y);
        this.ctx.lineTo(pr.x, pr.y);
        this.ctx.moveTo(pc.x, pc.y);
        this.ctx.lineTo(pf.x, pf.y);
        this.ctx.stroke();

        // Draw chassis main frame link (glowing neon red)
        this.ctx.save();
        this.ctx.strokeStyle = '#E0003C';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#E0003C';
        this.ctx.lineWidth = 5.0;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(pr.x, pr.y);
        this.ctx.lineTo(pc.x, pc.y);
        this.ctx.lineTo(pf.x, pf.y);
        this.ctx.stroke();
        this.ctx.restore();

        // Draw engine box block
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#111114';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(pc.x, pc.y + 3, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw wheels (glowing neon white)
        const drawWheel = (w) => {
            this.ctx.save();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.fillStyle = '#111114';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#ffffff';
            this.ctx.lineWidth = 2.8;
            this.ctx.beginPath();
            this.ctx.arc(w.x, w.y, this.wheelRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();

            // Inner hub (no shadow)
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(w.x, w.y, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            // Spokes (no shadow)
            this.ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = w.angle + (i * Math.PI / 2);
                this.ctx.moveTo(w.x, w.y);
                this.ctx.lineTo(w.x + this.wheelRadius * Math.cos(angle), w.y + this.wheelRadius * Math.sin(angle));
            }
            this.ctx.stroke();
        };

        drawWheel(pr);
        drawWheel(pf);

        // --- Simplified Rider Posture with Neon Glow ---
        const bDx = pf.x - pr.x;
        const bDy = pf.y - pr.y;
        const bikeAngle = Math.atan2(bDy, bDx);

        // Seat position
        const seatX = pc.x - Math.cos(bikeAngle) * 5;
        const seatY = pc.y - Math.sin(bikeAngle) * 5;

        // Head/guard position from physical Matter.js body
        const headX = this.bike.guardBody.position.x;
        const headY = this.bike.guardBody.position.y;

        // Draw Rider Body Parts with glowing white lines
        this.ctx.save();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        // Torso / Spine
        this.ctx.beginPath();
        this.ctx.moveTo(seatX, seatY);
        this.ctx.lineTo(headX, headY);
        this.ctx.stroke();

        // Handlebars grip
        const hbx = pc.x + Math.cos(bikeAngle) * 10 - Math.sin(bikeAngle) * 8;
        const hby = pc.y + Math.sin(bikeAngle) * 10 - Math.cos(bikeAngle) * 8;

        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(pf.x, pf.y);
        this.ctx.lineTo(hbx, hby);
        this.ctx.stroke();

        // Arm line directly from shoulder to handlebars
        const shoulderX = headX + (seatX - headX) * 0.25;
        const shoulderY = headY + (seatY - headY) * 0.25;
        this.ctx.beginPath();
        this.ctx.moveTo(shoulderX, shoulderY);
        this.ctx.lineTo(hbx, hby);
        this.ctx.stroke();

        // Leg line directly from hips to foot-peg
        this.ctx.beginPath();
        this.ctx.moveTo(seatX, seatY);
        this.ctx.lineTo(pc.x, pc.y + 6);
        this.ctx.stroke();
        this.ctx.restore();

        // Helmet/Head (glowing red)
        this.ctx.save();
        this.ctx.fillStyle = '#E0003C'; // Red helmet
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#E0003C';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();

        this.ctx.restore();
    }

    drawParticles() {
        this.ctx.save();
        this.ctx.translate(-this.camX, -this.camY);

        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    updateHUD() {
        if (!this.isStarted) return;

        // Price updates
        const currentPrice = this.getStockPriceAt(this.bike.chassis.x);
        document.getElementById('hud-price').innerText = `$${currentPrice.toFixed(2)}`;

        // Progress bar percentage
        const startX = 140;
        const endX = this.runwayWidth + (this.prices.length - 1) * this.pxPerPoint;
        const totalDist = endX - startX;
        const currentDist = Math.max(0, Math.min(totalDist, this.bike.chassis.x - startX));
        const progressPercent = (currentDist / totalDist) * 100;

        document.getElementById('hud-progress-bar').style.width = `${progressPercent}%`;
        document.getElementById('hud-progress-rider').style.left = `${progressPercent}%`;

        // Speedometer (estimated in mph based on X velocity)
        const speedMph = Math.round(Math.abs(this.bike.chassis.vx) / 8);
        document.getElementById('hud-speed').innerText = `${speedMph} mph`;

        // Lives HUD update
        const livesEl = document.getElementById('hud-lives');
        if (livesEl) {
            if (this.lives > 0) {
                livesEl.innerText = "📈 ".repeat(this.lives).trim();
                livesEl.style.color = this.lives === 1 ? "#E0003C" : "#23BC3F";
            } else {
                livesEl.innerText = "Liquidated";
                livesEl.style.color = "#E0003C";
            }
        }
        
        // Engine sound updates
        const throttleInput = this.keys.up ? 1.0 : (this.keys.down ? 0.2 : 0.0);
        this.audio.updateEngine(throttleInput);
    }

    updateCamera() {
        // Targets
        const targetCamX = this.bike.chassis.x - this.width * 0.28;
        const targetCamY = this.bike.chassis.y - this.height * 0.62;

        // Interpolation
        this.camX += (targetCamX - this.camX) * 0.12;
        this.camY += (targetCamY - this.camY) * 0.12;

        // Prevent camera from scrolling past starting runway left edge
        if (this.camX < 0) this.camX = 0;
    }

    // ----------------------------------------------------
    // GAME LOOPS
    // ----------------------------------------------------
    gameLoop(timestamp) {
        const dt = Math.min(0.03, (timestamp - this.lastTime) / 1000); // capped delta
        this.lastTime = timestamp;

        if (this.isStarted) {
            if (!this.isGameOver && !this.isWin) {
                if (this.spawnTimer > 0) {
                    this.spawnTimer -= dt;
                }
                this.updatePhysics(dt);
                this.checkGameStates();
            }
            this.updateParticles(dt);
            this.updateCamera();
            this.updateHUD();
        }

        // Draw Canvas Frame
        this.ctx.fillStyle = '#0b0b0e'; // dark trading terminal background
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawGrid();
        this.drawDecorations();
        this.drawTrack();
        this.drawCoins();
        this.drawRider();
        this.drawParticles();

        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Instantiate when DOM is fully set up
document.addEventListener('DOMContentLoaded', () => {
    window.stockRider = new StockRider();
});
