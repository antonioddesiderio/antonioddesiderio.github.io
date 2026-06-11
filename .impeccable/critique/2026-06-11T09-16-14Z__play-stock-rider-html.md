---
target: play_stock_rider.html
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-11T09-16-14Z
slug: play-stock-rider-html
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good HUD updates, but status screens are clones. |
| 2 | Match System / Real World | 4 | Excellent mapping of market volatility to terrain physics. |
| 3 | User Control and Freedom | 3 | Quick restart ('R') provides a good escape. |
| 4 | Consistency and Standards | 2 | Typographic mismatch: page uses Instrument Sans vs site-wide Recursive. |
| 5 | Error Prevention | 3 | API loader helps prevent interaction during fetch. |
| 6 | Recognition Rather Than Recall | 2 | Sidebar is a "wall of options" with 8+ ungrouped choices. |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts for track selection or file upload. |
| 8 | Aesthetic and Minimalist Design | 2 | Cluttered sidebar; green accents violate the "strictly Red/White" brand rule. |
| 9 | Error Recovery | 3 | Crash screen handles "Margin Call" well. |
| 10 | Help and Documentation | 3 | Control instructions are visible but feel templated. |
| **Total** | | **27/40** | **[Acceptable]** |

#### Anti-Patterns Verdict

**LLM assessment**: **Partial Slop.** The interface is a structural clone of the portfolio's Tetris and Invaders pages, failing the "Precision Research" goal of fine-tuned, purposeful layout. The use of generic stock emojis (📈) and inconsistent green accents (#23BC3F) makes it feel like a "cool" template rather than a bespoke academic interactive.

**Deterministic scan**: 4 warnings found (`overused-font`).
- **File**: `play_stock_rider.html` (Lines 11, 243, 279, 358)
- **Finding**: Instrument Sans is flagged as an overused "AI-slop" font. 
- **False Positive**: In this project, Instrument Sans is a deliberate system choice (documented in `DESIGN.md`), though its mismatch with the global `Recursive` font creates valid dissonance.

**Visual overlays**: Overlay injection succeeded on `http://localhost:8400/play_stock_rider.html`. Findings were confirmed via browser console.

#### Overall Impression
A mechanically brilliant game that leverages stock data for gameplay, but is currently dressed in a "templated" suit. The single biggest opportunity is to **differentiate the layout** from other games and **strictly enforce the brand color palette** to make it feel like a premium part of the academic hub.

#### What's Working
- **Mechanical Hook**: Mapping stock volatility to physical terrain is a stroke of genius for an "interactive hub."
- **Sound Design**: Immersive synth engine hum provides high-quality feedback.

#### Priority Issues

- **[P1] Typographic Dissonance**
  - **Why it matters**: Breaks site-wide identity. Page uses `Instrument Sans` while the rest of the site (and `style.css`) commits to `Recursive`.
  - **Fix**: Align typography with `DESIGN.md` tokens or commit to a global migration.
  - **Suggested command**: `$impeccable typeset`

- **[P1] Sidebar Cognitive Overload**
  - **Why it matters**: 8+ simultaneous choices (GME, NVDA, TSLA, AAPL, BTC, ETH, Upload) violate Miller's Law (<=4 items).
  - **Fix**: Chunk tracks into categories: "Presets," "Live Crypto," and "Custom Data."
  - **Suggested command**: `$impeccable layout`

- **[P2] Brand Color Violation**
  - **Why it matters**: `DESIGN.md` mandates a strict Red/White/Ink hierarchy. The use of green for "To the Moon" and price trends dilutes the academic precision.
  - **Fix**: Use red accents for high intent and monochromatic ink/white for status, or find a "Red-only" way to signal success.
  - **Suggested command**: `$impeccable colorize`

- **[P2] Layout Cloning**
  - **Why it matters**: It feels like a mirror of the Tetris page, which contradicts the "Precision Research" principle.
  - **Fix**: Rework the sidebar/HUD to feel more like a "Trading Terminal" and less like a "Game Sidebar."
  - **Suggested command**: `$impeccable shape`

#### Persona Red Flags

**Jordan (First-Timer)**: Overwhelmed by the "wall of tracks." The sidebar title "Select Track" is clear, but the decision point contains 6 buttons + an upload zone. Jordan will likely hesitate or pick the first option without exploring.

**Riley (Stress Tester)**: Drag-and-drop zone for CSV files is a black box. If an invalid file is dropped, the error handling is generic. Riley will find the edge cases where the price-to-physics mapping breaks.

#### Minor Observations
- Generic emojis (📈) feel low-effort compared to the Three.js visuals elsewhere.
- Background particles hide on mobile, which is good, but the sidebar remains heavy.

#### Questions to Consider
- "What if the primary track selection used a high-contrast 'Terminal' list instead of large buttons?"
- "Does the 'To the Moon' green accent need to be green, or can we signal success with a 'Vibrant Red' peak experience?"
