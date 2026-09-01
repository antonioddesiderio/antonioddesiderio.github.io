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
// CURATED HISTORICAL STOCK PRESETS (real closes)
// ----------------------------------------------------
const STOCK_PRESETS = {
    gme: {
        ticker: "GME",
        name: "GameStop Meme Squeeze",
        trend: "+1,657%",
        direction: "up",
        // unadjusted daily closes, Nov 2020-Mar 2021 squeeze; first=10.8 last=189.8 peak=347.5
        prices: [
            10.8, 11.6, 10.9, 11.4, 11.9, 11.5, 11.1, 11.8, 11.1, 11.0,
            12.1, 11.6, 11.6, 12.5, 12.7, 13.9, 13.7, 14.8, 16.1, 16.6,
            15.8, 16.6, 16.1, 16.9, 16.4, 16.9, 13.7, 14.1, 13.3, 12.7,
            13.8, 13.8, 14.8, 15.6, 15.5, 19.5, 20.6, 20.1, 21.0, 19.4,
            19.3, 18.8, 17.2, 17.4, 18.4, 18.1, 17.7, 19.9, 20.0, 31.4,
            39.9, 35.5, 39.4, 39.1, 43.0, 65.0, 76.8, 148.0, 347.5, 193.6,
            325.0, 225.0, 90.0, 92.4, 53.5, 63.8, 60.0, 50.3, 51.2, 51.1,
            52.4, 49.5, 45.9, 40.7, 40.6, 46.0, 45.0, 91.7, 108.7, 101.7,
            120.4, 118.2, 124.2, 132.4, 137.7, 194.5, 246.9, 265.0, 260.0, 264.5,
            220.1, 208.2, 209.8, 201.8, 200.3, 194.5, 181.8, 120.3, 183.8, 181.0,
            181.3, 194.5, 189.8
        ]
    },
    nvda: {
        ticker: "NVDA",
        name: "Nvidia AI Surge",
        trend: "+520%",
        direction: "up",
        // every daily close Jan 2023-May 2024, pre 10:1 split; n=336 first=143.1 last=887.8 peak=950.0
        prices: [
            143.1, 147.5, 142.6, 148.6, 156.3, 159.1, 160.0, 165.1, 169.0, 177.0,
            173.8, 167.6, 178.4, 191.9, 192.6, 193.2, 198.0, 203.6, 191.6, 195.4,
            209.4, 217.1, 211.0, 210.9, 221.7, 222.1, 223.4, 212.6, 217.9, 229.7,
            227.6, 220.0, 213.9, 206.6, 207.5, 236.6, 232.9, 235.0, 232.2, 227.0,
            233.1, 238.9, 235.5, 232.9, 241.8, 234.4, 229.6, 229.7, 240.6, 242.3,
            255.4, 257.2, 259.0, 262.0, 264.7, 271.9, 267.8, 265.3, 264.1, 269.8,
            273.8, 277.8, 279.6, 274.5, 268.8, 270.4, 275.8, 271.7, 265.0, 264.6,
            267.6, 270.0, 276.7, 279.3, 271.0, 271.2, 270.4, 262.4, 269.6, 272.3,
            277.5, 289.1, 282.1, 278.0, 275.6, 286.8, 291.5, 285.7, 288.9, 285.8,
            283.4, 289.5, 292.1, 301.8, 316.8, 312.6, 311.8, 306.9, 305.4, 379.8,
            389.5, 401.1, 378.3, 397.7, 393.3, 391.7, 386.5, 374.8, 385.1, 387.7,
            394.8, 410.2, 430.0, 426.5, 426.9, 438.1, 430.5, 430.2, 422.1, 406.3,
            418.8, 411.2, 408.2, 423.0, 424.1, 423.2, 421.0, 425.0, 421.8, 424.0,
            439.0, 459.8, 454.7, 464.6, 474.9, 470.8, 455.2, 443.1, 446.1, 456.8,
            454.5, 459.0, 467.5, 467.3, 465.1, 442.7, 445.1, 446.8, 454.2, 446.6,
            425.5, 423.9, 408.5, 437.5, 439.4, 434.9, 433.4, 433.0, 469.7, 456.7,
            471.2, 471.6, 460.2, 468.4, 487.8, 492.6, 493.5, 485.1, 485.5, 470.6,
            462.4, 455.7, 451.8, 448.7, 454.9, 455.8, 439.0, 439.7, 435.2, 422.4,
            410.2, 416.1, 422.2, 419.1, 424.7, 430.9, 435.0, 447.8, 435.2, 440.4,
            446.9, 457.6, 452.7, 458.0, 468.1, 469.5, 454.6, 461.0, 439.4, 422.0,
            421.0, 413.9, 429.8, 436.6, 417.8, 403.3, 405.0, 411.6, 407.8, 423.2,
            435.1, 450.0, 457.5, 459.5, 465.7, 469.5, 483.4, 486.2, 496.6, 488.9,
            494.8, 493.0, 504.1, 499.4, 487.2, 477.8, 482.4, 478.2, 481.4, 467.7,
            467.6, 455.1, 465.7, 455.0, 466.0, 475.1, 466.3, 476.6, 480.9, 483.5,
            488.9, 500.8, 496.0, 481.1, 489.9, 488.3, 492.8, 494.2, 495.2, 495.2,
            481.7, 475.7, 480.0, 491.0, 522.5, 531.4, 543.5, 548.2, 547.1, 563.8,
            560.5, 571.1, 594.9, 596.5, 598.7, 613.6, 616.2, 610.3, 624.7, 627.7,
            615.3, 630.3, 661.6, 693.3, 682.2, 701.0, 696.4, 721.3, 722.5, 721.3,
            739.0, 726.6, 726.1, 694.5, 674.7, 785.4, 788.2, 790.9, 787.0, 776.6,
            791.1, 822.8, 852.4, 859.6, 887.0, 926.7, 875.3, 857.7, 919.1, 908.9,
            879.4, 878.4, 884.5, 894.0, 903.7, 914.3, 942.9, 950.0, 925.6, 902.5,
            903.6, 903.6, 894.5, 889.6, 859.0, 880.1, 871.3, 853.5, 870.4, 906.2,
            881.9, 860.0, 874.2, 840.3, 846.7, 762.0, 795.2, 824.2, 796.8, 826.3,
            877.3, 877.6, 864.0, 830.4, 858.2, 887.8
        ]
    },
    tsla: {
        ticker: "TSLA",
        name: "Tesla Cyber Slope",
        trend: "+262%",
        direction: "up",
        // every daily close May 2020-May 2021; n=251 first=162.7 last=589.7 peak=883.1
        prices: [
            162.7, 161.6, 163.1, 165.5, 163.4, 163.8, 164.0, 161.2, 167.0, 179.6,
            176.3, 176.6, 172.9, 177.1, 190.0, 188.1, 205.0, 194.6, 187.1, 198.2,
            196.4, 198.4, 200.8, 200.2, 198.9, 200.4, 192.2, 197.2, 191.9, 201.9,
            216.0, 223.9, 241.7, 274.3, 278.0, 273.2, 278.9, 308.9, 299.4, 303.4,
            309.2, 300.1, 300.2, 328.6, 313.7, 318.5, 302.6, 283.4, 307.9, 295.3,
            299.8, 297.5, 286.2, 297.0, 297.4, 297.0, 297.9, 290.5, 283.7, 274.9,
            311.0, 324.2, 330.1, 367.1, 377.4, 375.7, 400.4, 410.0, 402.8, 404.7,
            430.6, 447.8, 442.7, 498.3, 475.0, 447.4, 407.0, 418.3, 330.2, 366.3,
            371.3, 372.7, 419.6, 449.8, 441.8, 423.4, 442.1, 449.4, 424.2, 380.4,
            387.8, 407.3, 421.2, 419.1, 429.0, 448.2, 415.1, 425.7, 414.0, 425.3,
            425.9, 434.0, 442.3, 446.6, 461.3, 448.9, 439.7, 430.8, 421.9, 422.6,
            425.8, 420.6, 420.3, 424.7, 406.0, 410.8, 388.0, 400.5, 423.9, 421.0,
            438.1, 430.0, 421.3, 410.4, 417.1, 411.8, 408.5, 408.1, 441.6, 486.6,
            499.3, 489.6, 521.8, 555.4, 574.0, 585.8, 567.6, 584.8, 568.8, 593.4,
            599.0, 641.8, 649.9, 604.5, 627.1, 610.0, 639.8, 633.2, 622.8, 655.9,
            695.0, 649.9, 640.3, 646.0, 661.8, 663.7, 666.0, 694.8, 705.7, 729.8,
            735.1, 756.0, 816.0, 880.0, 811.2, 849.4, 854.4, 845.0, 826.2, 844.5,
            850.5, 845.0, 846.6, 880.8, 883.1, 864.2, 835.4, 793.5, 839.8, 872.8,
            854.7, 850.0, 852.2, 863.4, 849.5, 804.8, 811.7, 816.1, 796.2, 798.2,
            787.4, 781.3, 714.5, 698.8, 742.0, 682.2, 675.5, 718.4, 686.4, 653.2,
            621.4, 598.0, 563.0, 673.6, 668.1, 699.6, 693.7, 707.9, 676.9, 701.8,
            653.2, 654.9, 670.0, 662.2, 630.3, 640.4, 618.7, 611.3, 635.6, 667.9,
            661.8, 691.0, 691.6, 671.0, 683.8, 677.0, 702.0, 762.3, 732.2, 738.8,
            739.8, 714.6, 719.0, 744.1, 719.7, 729.4, 738.2, 704.7, 694.4, 677.0,
            709.4, 684.9, 673.6, 670.9, 663.5, 672.4, 629.0, 617.2, 589.9, 571.7,
            589.7
        ]
    },
    aapl: {
        ticker: "AAPL",
        name: "Apple Safe Ridge",
        trend: "+47%",
        direction: "up",
        // weekly closes Sep 2024-Sep 2026; first=220.8 last=324.8 peak=333.7
        prices: [
            220.8, 222.5, 228.2, 227.8, 226.8, 227.6, 235.0, 231.4, 222.9, 227.0,
            225.0, 229.9, 237.3, 242.8, 248.1, 254.5, 255.6, 243.4, 236.9, 230.0,
            222.8, 236.0, 227.6, 244.6, 245.6, 241.8, 213.5, 218.3, 217.9, 188.4,
            198.1, 197.0, 209.3, 205.4, 198.5, 211.3, 195.3, 200.9, 203.9, 196.4,
            201.0, 201.1, 213.6, 211.2, 211.2, 213.9, 202.4, 229.4, 231.6, 227.8,
            232.1, 239.7, 234.1, 245.5, 255.5, 258.0, 245.3, 252.3, 262.8, 270.4,
            268.5, 272.4, 271.5, 278.9, 278.8, 278.3, 273.7, 273.4, 271.0, 259.4,
            255.5, 248.0, 259.5, 278.1, 255.8, 264.6, 264.2, 257.5, 248.0, 248.8,
            255.9, 260.5, 270.2, 271.1, 280.1, 293.3, 300.2, 308.8, 312.1, 307.3,
            291.1, 298.0, 283.8, 308.6, 315.3, 333.7, 333.0, 308.9, 313.3, 305.9,
            309.4, 319.7, 316.9, 324.8
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
            collisionFilter: { group: -1, category: 0x0002, mask: 0x0001 }
        });

        // Front wheel
        this.bike.frontBody = Matter.Bodies.circle(tx + this.WHEEL_SPACING / 2, wheelY, this.WHEEL_RADIUS, {
            mass: 1.2,
            friction: 0.9,
            frictionAir: 0.001,
            restitution: 0.02,
            label: 'wheel',
            collisionFilter: { group: -1, category: 0x0002, mask: 0x0001 }
        });

        // Helmet sits ABOVE the frame (was below, so it clipped the track and died instantly)
        const guardY = frameY - this.FRAME_HEIGHT / 2 - 14;
        this.bike.guardBody = Matter.Bodies.circle(tx, guardY, 10, {
            mass: 0.1,
            friction: 0.3,
            restitution: 0,
            label: 'guard',
            collisionFilter: { group: -1, mask: 0 }
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
        const guardNeck = Matter.Constraint.create({ bodyA: this.bike.frameBody, pointA: { x: 0, y: -16 }, bodyB: this.bike.guardBody, length: 0, stiffness: 1, damping: 0.1 });

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
        this.finishWidth = 720;
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
        this.lastSafeX = 140;
        this.dangerFrames = 0;
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

            // BUY nodes sit just above the rider so rolling over them collects them
            if (i > 2 && i < this.prices.length - 2 && i % 3 === 0) {
                const cX = startX + this.pxPerPoint / 2;
                this.coins.push({
                    x: cX,
                    y: scaleY(priceCurrent) - 46,
                    active: true,
                    val: Math.round(priceCurrent / 2)
                });
            }
        }

        // Cap slope on the chart only (max ~38deg), then add a flat finish after the last point
        const maxDyDx = 0.78;
        for (let i = 1; i < this.trackPoints.length; i++) {
            const dx = this.trackPoints[i].x - this.trackPoints[i - 1].x;
            if (dx <= 0) continue;
            const maxDy = maxDyDx * dx;
            const dy = this.trackPoints[i].y - this.trackPoints[i - 1].y;
            if (Math.abs(dy) > maxDy) {
                this.trackPoints[i].y = this.trackPoints[i - 1].y + Math.sign(dy) * maxDy;
            }
        }

        const lastPt = this.trackPoints[this.trackPoints.length - 1];
        const finishPrice = this.prices[this.prices.length - 1];
        for (let offset = 15; offset <= this.finishWidth; offset += 15) {
            this.trackPoints.push({ x: lastPt.x + offset, y: lastPt.y, price: finishPrice });
        }
        for (const coin of this.coins) {
            coin.y = this.getTerrainHeight(coin.x) - 46;
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
            const thickness = 42;
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
        const startX = isFullReset ? 140 : Math.max(80, this.lastSafeX || 140);
        const startY = this.getTerrainHeight(startX);

        // Compute start positions for all bodies
        const lift = 10;
        const frameStartY = startY - this.WHEEL_RADIUS - this.FRAME_ABOVE - lift;
        const wheelStartY = startY - this.WHEEL_RADIUS - lift;
        const guardStartY = frameStartY - this.FRAME_HEIGHT / 2 - 14;

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
        
        this.spawnTimer = 1.6; // Invulnerability after spawn / checkpoint
        this.dangerFrames = 0;
        this.particles = [];

        if (isFullReset) {
            this.coins.forEach(c => c.active = true);
            this.score = 0;
            this.lives = 5;
            this.lastSafeX = 140;
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
            livesEl.innerText = Array(Math.max(0, this.lives)).fill("📈").join(" ") || "—";
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
            this.unclipBody(rear);
            this.unclipBody(front);

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

        const upright = Math.abs(Math.atan2(Math.sin(frame.angle), Math.cos(frame.angle))) < 0.45;
        if (this.rearOnGround && this.frontOnGround && upright && this.spawnTimer <= 0) {
            this.lastSafeX = Math.max(80, frame.position.x - 40);
        }

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
    unclipBody(body) {
        const groundY = this.getTerrainHeight(body.position.x);
        const bottom = body.position.y + this.WHEEL_RADIUS;
        if (bottom > groundY + 10) {
            Matter.Body.setPosition(body, { x: body.position.x, y: groundY - this.WHEEL_RADIUS - 0.5 });
            if (body.velocity.y > 0) {
                Matter.Body.setVelocity(body, { x: body.velocity.x, y: 0 });
            }
        }
    }

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
        if (this.spawnTimer > 0) {
            this.dangerFrames = 0;
            return;
        }

        const chassis = this.bike.chassis;
        const frame = this.bike.frameBody;
        const uprightAngle = Math.abs(Math.atan2(Math.sin(frame.angle), Math.cos(frame.angle)));
        const headX = this.bike.guardBody.position.x;
        const headY = this.bike.guardBody.position.y;
        const headOnGround = headY >= this.getTerrainHeight(headX) - 2;
        const avgWheelsY = (this.bike.rear.y + this.bike.front.y) / 2;
        const inverted = chassis.y > avgWheelsY + 28;
        const toppled = uprightAngle > 2.05 && (this.rearOnGround || this.frontOnGround || headOnGround || inverted);

        this.dangerFrames = toppled ? this.dangerFrames + 1 : 0;
        if (this.dangerFrames > 10) {
            this.triggerGameOver();
            return;
        }

        const finishX = this.trackPoints[this.trackPoints.length - 1].x - this.finishWidth;
        if (chassis.x >= finishX) {
            this.triggerWin();
            return;
        }

        const buried = chassis.y > this.getTerrainHeight(chassis.x) + 48;
        if (buried) {
            this.triggerGameOver();
            return;
        }

        for (let coin of this.coins) {
            if (!coin.active) continue;
            const hit = (px, py) => Math.hypot(px - coin.x, py - coin.y) < 44;
            if (
                hit(chassis.x, chassis.y) ||
                hit(this.bike.rear.x, this.bike.rear.y) ||
                hit(this.bike.front.x, this.bike.front.y) ||
                hit(this.bike.guardBody.position.x, this.bike.guardBody.position.y)
            ) {
                this.collectCoin(coin);
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

        const finishX = this.trackPoints[this.trackPoints.length - 1].x - this.finishWidth;
        const finishY = this.getTerrainHeight(finishX);
        this.ctx.fillStyle = '#E0003C';
        this.ctx.font = 'bold 12px "Space Mono", monospace';
        this.ctx.fillText("HODL FINISH LINE", finishX + 18, finishY - 72);

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

        const finishX = this.trackPoints[this.trackPoints.length - 1].x - this.finishWidth;
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
