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
        
        // Physics constants
        this.gravity = 500;            // px/s^2
        this.enginePower = 700;       // Rear wheel push force
        this.maxForwardSpeed = 380;   // Limit forward velocity
        this.brakePower = 8.0;        // Brake deceleration rate
        this.leanTorque = 450;        // Rotational force
        this.airDrag = 0.08;          // Air resistance coefficient
        
        // Wheel Base dimensions
        this.wheelRadius = 11;
        this.massChassis = 1.2;
        this.massWheel = 0.4;

        // Suspension Springs
        // chassis-rear, chassis-front, rear-front
        this.springs = [
            { id: 'rear_susp', restLength: 29, k: 1400, c: 45, pA: 'chassis', pB: 'rear' },
            { id: 'front_susp', restLength: 29, k: 1400, c: 45, pA: 'chassis', pB: 'front' },
            { id: 'wheelbase', restLength: 53, k: 2500, c: 55, pA: 'rear', pB: 'front' }
        ];

        // Mass points definition
        this.bike = {
            chassis: { x: 0, y: 0, vx: 0, vy: 0, m: this.massChassis },
            rear:    { x: 0, y: 0, vx: 0, vy: 0, m: this.massWheel, onGround: false, angle: 0 },
            front:   { x: 0, y: 0, vx: 0, vy: 0, m: this.massWheel, onGround: false, angle: 0 }
        };

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

        // Chassis sits slightly higher
        this.bike.chassis.x = startX;
        this.bike.chassis.y = startY - 26;
        this.bike.chassis.vx = 0;
        this.bike.chassis.vy = 0;

        // Rear Wheel (initialize exactly on ground to prevent snap)
        this.bike.rear.x = startX - 25;
        this.bike.rear.y = startY - this.wheelRadius;
        this.bike.rear.vx = 0;
        this.bike.rear.vy = 0;
        this.bike.rear.onGround = true;
        this.bike.rear.angle = 0;

        // Front Wheel (initialize exactly on ground to prevent snap)
        this.bike.front.x = startX + 25;
        this.bike.front.y = startY - this.wheelRadius;
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

    updatePhysics(dt) {
        // Solve using sub-stepping to ensure spring stability
        const subSteps = 6;
        const subDt = dt / subSteps;

        for (let step = 0; step < subSteps; step++) {
            // 1. Apply Gravity to all points
            for (let name of ['chassis', 'rear', 'front']) {
                const pt = this.bike[name];
                pt.vy += this.gravity * subDt;
            }

            // 2. Air resistance / general damping
            for (let name of ['chassis', 'rear', 'front']) {
                const pt = this.bike[name];
                pt.vx *= (1 - this.airDrag * subDt);
                pt.vy *= (1 - this.airDrag * subDt);
            }

            // 3. User Lean Input (Torque)
            // Normal perpendicular vector to wheelbase link
            const dx = this.bike.front.x - this.bike.rear.x;
            const dy = this.bike.front.y - this.bike.rear.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                const nx = -dy / len;
                const ny = dx / len; // CCW perpendicular vector (pointing up)

                let rotateForce = 0;
                if (this.keys.left) rotateForce += this.leanTorque;   // Lean back
                if (this.keys.right) rotateForce -= this.leanTorque;  // Lean forward

                if (rotateForce !== 0) {
                    // CCW: front wheel goes UP (-N), rear wheel goes DOWN (+N)
                    this.bike.front.vx -= nx * rotateForce * subDt;
                    this.bike.front.vy -= ny * rotateForce * subDt;
                    this.bike.rear.vx += nx * rotateForce * subDt;
                    this.bike.rear.vy += ny * rotateForce * subDt;
                }
            }

            // 4. Update coordinates by velocity
            for (let name of ['chassis', 'rear', 'front']) {
                const pt = this.bike[name];
                pt.x += pt.vx * subDt;
                pt.y += pt.vy * subDt;
            }

            // 5. Solve Spring Constraints (Hooke's law + damping)
            for (let spring of this.springs) {
                const ptA = this.bike[spring.pA];
                const ptB = this.bike[spring.pB];

                const sDx = ptB.x - ptA.x;
                const sDy = ptB.y - ptA.y;
                const dist = Math.sqrt(sDx * sDx + sDy * sDy);
                if (dist > 0) {
                    const ux = sDx / dist;
                    const uy = sDy / dist;

                    // Stretch/compression
                    const stretch = dist - spring.restLength;
                    const fSpring = spring.k * stretch;

                    // Relative velocity damping
                    const rvx = ptB.vx - ptA.vx;
                    const rvy = ptB.vy - ptA.vy;
                    const rval = rvx * ux + rvy * uy;
                    const fDamp = spring.c * rval;

                    const force = fSpring + fDamp;

                    // Distribute forces to points
                    ptA.vx += (force * ux * subDt) / ptA.m;
                    ptA.vy += (force * uy * subDt) / ptA.m;
                    ptB.vx -= (force * ux * subDt) / ptB.m;
                    ptB.vy -= (force * uy * subDt) / ptB.m;
                }
            }

            // 6. Resolve Wheel Collisions with Ground
            for (let name of ['rear', 'front']) {
                const wheel = this.bike[name];
                const groundY = this.getTerrainHeight(wheel.x);

                if (wheel.y >= groundY - this.wheelRadius) {
                    wheel.y = groundY - this.wheelRadius;
                    wheel.onGround = true;

                    // Calculate ground normal and tangent
                    const sampleDist = 2;
                    const hLeft = this.getTerrainHeight(wheel.x - sampleDist);
                    const hRight = this.getTerrainHeight(wheel.x + sampleDist);
                    const slope = (hRight - hLeft) / (sampleDist * 2);
                    const angle = Math.atan(slope);

                    const tx = Math.cos(angle);
                    const ty = Math.sin(angle); // Ground tangent (points right/forward)
                    const nx = ty;
                    const ny = -tx;             // Ground normal (points up/out)

                    // Project velocity components
                    let vN = wheel.vx * nx + wheel.vy * ny;
                    let vT = wheel.vx * tx + wheel.vy * ty;

                    // If moving into ground, reflect normal component
                    if (vN > 0) {
                        vN = -vN * 0.12; // light recoil bounce
                    }

                    // Apply engine throttle to rear wheel
                    if (name === 'rear') {
                        if (this.keys.up) {
                            // Accelerate forward
                            vT += this.enginePower * subDt;
                            if (vT > this.maxForwardSpeed) vT = this.maxForwardSpeed;
                            
                            // Wheel spinning visual rotation
                            wheel.angle += 0.45;

                            // Reaction tilt: apply clockwise rotation force to chassis to tip bike back slightly
                            this.bike.chassis.vx -= tx * 140 * subDt;
                            this.bike.chassis.vy -= ty * 140 * subDt;
                        } else if (this.keys.down) {
                            // Brake or Reverse
                            if (vT > 5) {
                                vT *= Math.max(0, 1 - this.brakePower * subDt); // braking deceleration
                            } else {
                                vT -= 200 * subDt; // slow reverse
                                if (vT < -120) vT = -120;
                            }
                            wheel.angle -= 0.15;
                        } else {
                            // Friction/Rolling resistance when coasting
                            vT *= Math.max(0, 1 - 0.5 * subDt);
                            wheel.angle += vT * subDt / this.wheelRadius;
                        }
                    } else {
                        // Front wheel rolling resistance
                        vT *= Math.max(0, 1 - 0.2 * subDt);
                        wheel.angle += vT * subDt / this.wheelRadius;
                    }

                    // Reconstruct velocity
                    wheel.vx = vN * nx + vT * tx;
                    wheel.vy = vN * ny + vT * ty;
                } else {
                    wheel.onGround = false;
                    // In-air wheel spin deceleration
                    wheel.angle += (name === 'rear' && this.keys.up ? 0.3 : 0.0) - (wheel.vx * subDt / 100);
                }
            }

            // 7. Bounds lock (cannot go left of screen start)
            for (let name of ['chassis', 'rear', 'front']) {
                const pt = this.bike[name];
                if (pt.x < 15) {
                    pt.x = 15;
                    pt.vx = 0;
                }
            }
        }
    }

    checkGameStates() {
        if (this.isGameOver || this.isWin) return;
        if (this.spawnTimer > 0) return; // Invulnerability active

        const chassis = this.bike.chassis;
        const groundHeight = this.getTerrainHeight(chassis.x);

        // 1. Crash Condition: Chassis hits the ground (e.g. rider head-plant or chassis bottom out)
        if (chassis.y >= groundHeight - 8) {
            this.triggerGameOver();
            return;
        }

        // Extra protection: If both wheels are off the ground, but chassis is lower than wheels (severe tilt/flip)
        const avgWheelsY = (this.bike.rear.y + this.bike.front.y) / 2;
        if (chassis.y > avgWheelsY + 12) {
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
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.moveTo(pc.x, pc.y);
        this.ctx.lineTo(pr.x, pr.y);
        this.ctx.moveTo(pc.x, pc.y);
        this.ctx.lineTo(pf.x, pf.y);
        this.ctx.stroke();

        // Draw chassis main frame link
        this.ctx.strokeStyle = '#E0003C'; // Vibrant Red frame
        this.ctx.lineWidth = 4.5;
        this.ctx.beginPath();
        this.ctx.moveTo(pr.x, pr.y);
        this.ctx.lineTo(pc.x, pc.y);
        this.ctx.lineTo(pf.x, pf.y);
        this.ctx.stroke();

        // Draw engine box block
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#111';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(pc.x, pc.y + 3, 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw wheels
        const drawWheel = (w) => {
            // Tyre
            this.ctx.strokeStyle = '#fff';
            this.ctx.fillStyle = '#111';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.arc(w.x, w.y, this.wheelRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Rim / Hub
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(w.x, w.y, 4, 0, Math.PI * 2);
            this.ctx.stroke();

            // Spokes
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

        // Draw Rider Figure
        // Calculate angle of bike
        const bDx = pf.x - pr.x;
        const bDy = pf.y - pr.y;
        const bikeAngle = Math.atan2(bDy, bDx);

        // Seat position sits slightly behind center
        const seatX = pc.x - Math.cos(bikeAngle) * 6;
        const seatY = pc.y - Math.sin(bikeAngle) * 6;

        // Head position
        const headX = seatX - Math.sin(bikeAngle) * 18 - Math.cos(bikeAngle) * 2;
        const headY = seatY + Math.cos(bikeAngle) * 18 - Math.sin(bikeAngle) * 2;

        // Draw Spine/Torso
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(seatX, seatY);
        this.ctx.lineTo(headX, headY);
        this.ctx.stroke();

        // Draw Head (Helmet)
        this.ctx.fillStyle = '#E0003C'; // Red helmet
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY - 4, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Helmet Visor
        this.ctx.fillStyle = '#111';
        this.ctx.beginPath();
        this.ctx.arc(headX + Math.cos(bikeAngle + 0.3) * 3, headY - 4 + Math.sin(bikeAngle + 0.3) * 3, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Handlebars position
        const hbx = pc.x + Math.cos(bikeAngle) * 12 - Math.sin(bikeAngle) * 10;
        const hby = pc.y + Math.sin(bikeAngle) * 12 - Math.cos(bikeAngle) * 10;

        // Draw Handlebars fork
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(pf.x, pf.y);
        this.ctx.lineTo(hbx, hby);
        // Handle grip
        this.ctx.moveTo(hbx - Math.sin(bikeAngle) * 4, hby + Math.cos(bikeAngle) * 4);
        this.ctx.lineTo(hbx + Math.sin(bikeAngle) * 4, hby - Math.cos(bikeAngle) * 4);
        this.ctx.stroke();

        // Arms from head (shoulders) to handlebars
        const shoulderX = headX + (seatX - headX) * 0.25;
        const shoulderY = headY + (seatY - headY) * 0.25;
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(shoulderX, shoulderY);
        this.ctx.lineTo(hbx, hby);
        this.ctx.stroke();

        // Legs from seat (hips) to engine/foot-pegs
        this.ctx.beginPath();
        this.ctx.moveTo(seatX, seatY);
        this.ctx.lineTo(pc.x, pc.y + 8);
        this.ctx.stroke();

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
