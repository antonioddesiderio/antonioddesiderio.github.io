---
name: Antonio Desiderio Portfolio
description: A clean, premium academic portfolio with high-precision interactions.
colors:
  primary: "#E0003C"
  neutral-bg: "#ffffff"
  text-primary: "#111111"
  text-secondary: "#555555"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.9rem"
    fontWeight: 400
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "20px"
spacing:
  container: "1200px"
  nav: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1.5rem"
  card:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
---

# Design System: Antonio Desiderio Portfolio

## 1. Overview

**Creative North Star: "Precision Research"**

A high-contrast, typographically-driven system that balances academic rigor with modern interactive delight. The design leverages a "strong hierarchy" with "distinct accents" (Vibrant Red) against a "clean and premium" white-space-heavy canvas. It avoids the clutter of generic templates, favoring "fine-tuned precision" in its transitions and layout.

**Key Characteristics:**
- **Swiss-Inspired Hierarchy:** Large, bold headlines paired with structured mono-spaced labels.
- **Vibrant Accents:** #E0003C is used sparingly as a high-intent signal for interaction.
- **Motion-as-Utility:** Animations (AOS, Three.js) are used to clarify structure and guide the eye, not just for decoration.

## 2. Colors

A minimal palette that relies on extreme contrast between deep ink and pure white, punctuated by a single high-energy red.

### Primary
- **Vibrant Red** (#E0003C): Used for primary calls to action, active states, and focus signals. Represents energy and technical precision.

### Neutral
- **Pure White** (#ffffff): The base for all surfaces. Provides the "premium research" breathing room.
- **Deep Ink** (#111111): Used for primary text to ensure maximum readability and a crisp, modern feel.
- **Muted Slate** (#555555): Used for secondary text, metadata, and placeholder states.

### Named Rules
**The Rarity Rule.** The Vibrant Red accent is used on ≤5% of any given screen. Its rarity makes it a powerful signal for the most important interactions.

## 3. Typography

**Display Font:** Inter (Sans-serif)
**Body Font:** Inter (Sans-serif)
**Label/Mono Font:** Space Mono (Monospace)

**Character:** A pairing of a high-performance geometric sans-serif for clarity and a technical monospace for data and metadata, reflecting the "academic/research" personality.

### Hierarchy
- **Display** (600, clamp(2.5rem, 5vw, 4rem), 1.1): Used for section headers and hero greetings.
- **Headline** (500, 1.5rem, 1.2): Used for card titles and sub-headings.
- **Body** (400, 1rem, 1.6): Main text content. Max line length 75ch.
- **Label** (400, 0.9rem, 0.05em, mono): Used for metadata, dates, and navigation links.

## 4. Elevation

The system is primarily flat, using subtle tonal layering and borders rather than heavy shadows to convey depth. Shadows are reserved for interaction responses.

### Shadow Vocabulary
- **Ambient Glow** (0 10px 30px rgba(0, 0, 0, 0.1)): Used for the profile picture and floating elements to give a subtle lift.
- **Interaction Hover** (0 5px 15px rgba(0, 0, 0, 0.08)): Subtle lift on cards when hovered.

### Named Rules
**The Respond-to-Touch Rule.** Surfaces are flat at rest. Elevation (shadows and transforms) appears only as a response to user state (hover, active).

## 5. Components

### Buttons
- **Shape:** Full pill (20px radius) for filter buttons; subtle rounding (4px) for CV download.
- **Primary:** Vibrant Red background with white text.
- **Hover:** Slight scale (1.05) or background shift to emphasize interactivity.

### Cards
- **Corner Style:** Subtle (8px radius).
- **Background:** White with a light border (#eee).
- **Behavior:** Expandable for student/project details.

### Navigation
- **Style:** Fixed top bar with high-contrast text and a mobile-ready hamburger menu.

## 6. Do's and Don'ts

### Do:
- **Do** use `Space Mono` for all dates, tags, and small metadata.
- **Do** use `Vibrant Red` only for the primary action on a page.
- **Do** maintain 1.6 line-height for all body prose to ensure readability.

### Don't:
- **Don't** use blocky Notion-style cards with heavy 2px borders.
- **Don't** use generic WordPress-style gradients in section backgrounds.
- **Don't** use any secondary accent colors; the system is strictly Red/Black/White.
