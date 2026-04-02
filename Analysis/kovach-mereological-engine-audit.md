# Kovach Mereological Engine — Definitive Audit & Hardening Plan

**Status:** Canonical Engineering Reference
**Scope:** Single Source of Truth for all Eros engine development
**Supersedes:** `kovach-forensic-audit.md`, `art-heuristics-v2.md`, `edifice-heuristics.md`, strategic implementation plan
**Date:** 2026-04-02

---

## 0. Executive Summary

This document consolidates all prior research into a single authoritative engineering reference for the Eros generative engine. The engine has been deliberately narrowed to a **pure 2D mereological canvas** with the Kovach method as the exclusive generative algorithm. All non-Kovach methods are deprecated to `_legacy/`.

### Verdict: Current Coverage ≈ 15% of Real Edifice

The forensic audit against Ben Kovach's official [Edifice documentation](https://bendotk.com/writing/edifice) reveals that `kovach.js` captures only the mathematical skeleton — missing **7 of 7 core feature axes** that give the real Edifice its 976-piece variety.

### Strategic Decisions (Confirmed)

| Decision | Resolution |
|:---------|:-----------|
| **Rendering core** | Vanilla JS + HTML5 Canvas 2D (optimal, no change) |
| **3D capabilities** | Removed — pure 2D only |
| **Non-Kovach methods** | Move to `_legacy/` directory |
| **p5.js / Processing** | Categorically rejected — incompatible with zero-abstraction philosophy |
| **Node composition** | LiteGraph.js (Phase 3 — deferred) |
| **Pack density threshold** | Expose as parameter (`packDensity`, range 0.1–0.9) |
| **Perlin/Simplex noise** | Prohibited — mereological autonomy demands discrete forces only |

---

## PART I — PHILOSOPHICAL FOUNDATION

### 1.1 Mereological Autonomy

The Eros engine structurally rejects the concept of a master "canvas" (a reductionist whole). Space exists only as the terminal accumulation of microscopic, local coordinate interactions (Tristan Garcia / Daniel Koehler). Form emerges brutally through the tension between **strictly discrete architectural spatial matrices** and **autonomous fractional vectors** crashing into absolute theoretical boundaries.

**Key Principles:**
- **Part-to-Part, never Part-to-Whole.** Each grid cell (Enclosure) is a sovereign entity. It does not ask the canvas for instructions.
- **Space is not void.** Every pixel of bounding geometry is an active computational entity exerting forces onto traversing ink vectors.
- **Extrinsic relations only.** Parts connect, collide, and react without losing individual mathematical identities (DeLanda's Assemblage Theory).

### 1.2 Comparative Paradigms: Why Kovach, Not Fidenza

| Attribute | Tyler Hobbs (Fidenza) | Manolo Gamboa Naon | Ben Kovach (Edifice) |
|:----------|:---------------------|:-------------------|:--------------------|
| **Mereological State** | Continuous / Proximity-based | Over-lapped / Plastic | Discrete / Part-to-Part Autonomous |
| **Spatial Partitioning** | None (global continuous field) | Recursive subdivision | N-Descending Stochastic Matrix Grid |
| **Primary Vector Force** | Perlin / Simplex noise gradients | Chaotic attractors | Affine matrices & inverse-square torsion |
| **Constraint Logic** | Radial collision detection O(N²) | Additive density saturation | Absolute topological clamping (Math.min/max) |
| **Render Emulation** | Painterly / analog brushwork | Digital plastic / high-chroma | Eroded blueprint / mechanical plotter |

**Conclusion:** Continuous noise must be abandoned. Spatial arrays must dictate bounds. Rigid mathematical physics must rule the canvas.

---

## PART II — THE 5-LEVEL ONTOLOGICAL TAXONOMY

Every generative output in Eros must resolve to these five cascading layers. This is the universal, mandatory template:

```
Level 0 — THE SEED (PRNG State)
│   Deterministic origin. All entropy flows from a single integer seed.
│
├── Level 1 — THE PACK (Space Partitioning)
│   │   Int8Array matrix. N-Descending stochastic rectangle packing.
│   │   Output: Array of Enclosures {gx, gy, gw, gh, phase, colIdx}
│   │
│   ├── Level 2 — THE ENCLOSURE (Sovereign Bounding Objects)
│   │   │   Each enclosure: sovereign entity with independent mass, phase, friction.
│   │   │   Boundary enforcement: Sticky (Modern) or Bouncy (Explosive).
│   │   │   Symmetry modes: None / Horizontal / Vertical / Radial.
│   │   │
│   │   ├── Level 3 — THE NET (Physical Forces & Warps)
│   │   │   │   Inverse-square repulsors: F = m / (ε + r²)
│   │   │   │   Global affine displacement: Twist / Sharp / Squish / Wave / Shift / Turn
│   │   │   │   Explosion positioning strategies.
│   │   │   │
│   │   │   ├── Level 4 — THE HATCH (Vector Integration / Trajectories)
│   │   │   │   │   Spring-link cloth simulation OR RK4 flow field.
│   │   │   │   │   Texture modes: Lattice / Hatched / Sqribble.
│   │   │   │   │   TDA Betti-number trap detection (β₁ > 3 → break).
│   │   │   │   │
│   │   │   │   └── Level 5 — THE PIGMENT (Analog Render Synthesis)
│   │   │   │           ctx.globalCompositeOperation = 'multiply'
│   │   │   │           Taxonomy-driven palette. Gradient modes.
│   │   │   │           Mass-dependent line density. Per-enclosure phase.
```

---

## PART III — FORENSIC GAP ANALYSIS (14 Gaps)

### 3.1 The Real Edifice — 7 Feature Axes

From the official writeup, Edifice is defined by **7 core feature axes** that interact multiplicatively:

| Axis | Real Edifice Variants | Current Eros Coverage |
|:-----|:---------------------|:---------------------|
| **Cell Size** | Fine → Colossal (continuous) | ✅ `gridCols` param (10–100) |
| **Cell Aspect** | Square, Wide, Extra Wide, Tall, Extra Tall | ❌ **MISSING** — always square |
| **Fill Style** | Random Walk, Random, Ns, Distance, Manhattan, Chebyshev, Bismuth, Spiral, Bars | ❌ **MISSING** — flat sequential scan |
| **Symmetry** | None, Horizontal, Vertical, Radial | ❌ **MISSING** — no symmetry |
| **Displacement** | Twist, Sharp, Squish, Detach, Turn, Smooth, Shift, Wave, Isometrize, Perspective, V | ⚠️ Only **Squish** |
| **Style (Boundary)** | Explosive (bouncy), Modern (sticky) | ❌ **MISSING** — hard clamp only |
| **Texture** | Lattice, Lattice (Hatched), Sqribble | ❌ **MISSING** — one mode |

---

### GAP 1: Fill Style is Missing Entirely (L1 — CRITICAL)

**What Kovach does:** The fill style determines *how* rectangles are placed into the grid. This is the **single most impactful** feature on composition:

| Fill Style | Algorithm | Visual Character |
|:-----------|:----------|:-----------------|
| **Random Walk** | Pick random start → grow rect in direction → from endpoint grow new → repeat | Continuous, flowing, connected structures |
| **Random** | Pick random open cell → grow random direction → repeat | Scattered, disconnected blocks |
| **Ns** | Fill with N-height/width rects, decrement N until 1 | Graduated density |
| **Distance / Manhattan / Chebyshev** | Next cell = closest to initial start by metric | Radial radiation patterns |
| **Bismuth** | Fill with spiral patterns | Crystal mineral appearance |
| **Spiral** | Single spiral growing inward | Vortex composition |
| **Bars** | Equal-width vertical towers | Architectural columns |

**What Eros does:** Flat sequential scan (`for i = 0; i < cols*rows; i++`). Neither Random Walk nor any named style. Zero compositional variety.

---

### GAP 2: Cell Aspect Ratio (L1 — CRITICAL)

**What Kovach does:** Cells are not always square. Configurable aspect ratio produces varied rectangular shapes.

**What Eros does:** `gw === gh` always. Fix: `gw = N, gh = round(N * aspectRatio)` where aspectRatio ∈ [0.25, 4.0].

---

### GAP 3: Symmetry Modes (L2 — HIGH)

**What Kovach does:** After grid fill, symmetry transform applied:
- **Horizontal**: Top half reflected to bottom
- **Vertical**: Left half reflected to right
- **Radial**: Fourfold symmetry

**What Eros does:** No symmetry at all.

---

### GAP 4: Boundary Collision Styles (L2 — HIGH)

**What Kovach does:**
- **Explosive** (rubber): Net bounces inward — dense, filled interiors
- **Modern** (sticky): Net sticks to edges — traced/outlined cells with emergent partial fills

**What Eros does:** Hard `Math.min/Math.max` clamp only. No behavioral variety.

---

### GAP 5: Only 1 of 11+ Displacement Functions (L3 — CRITICAL)

| Displacement | Formula | Visual Effect |
|:------------|:--------|:-------------|
| **Twist** | `θ = dist(p, center) * twistFactor; p' = rotate(p, center, θ)` | Spiral vortex |
| **Sharp** | `offset = sign(dx) × |dx|^0.95 × 0.08` | Sawtooth fold on 45° fault lines |
| **Squish** | `scaleX = (rowParity == 0) ? 1.4 : 0.6` | Trapezoidal alternating bands ✅ |
| **Detach** | Pick line between cells; shift one side by offset | Tectonic plate separation |
| **Turn** | `p' = rotate(p, center, constantAngle)` | Uniform lopsided rotation |
| **Smooth** | Single smooth sine/cosine curve | Gentle bowing |
| **Shift** | `p.x += sin(y × 0.02) × 15` | Sinusoidal wave-like warping |
| **Wave** | `p.x += A * sin(p.y * freq)` | Sine wave undulation |
| **Isometrize** | Isometric projection transform | Pseudo-3D axonometric view |
| **Perspective** | Two-point perspective projection | 3D depth illusion |
| **V** | Half convex, half concave perspective split | Surreal spatial fold |

---

### GAP 6: Explosion Positioning Strategy (L3 — HIGH)

| Strategy | Placement Rule | Visual Effect |
|:---------|:--------------|:-------------|
| **Central** | Normally distributed around center line | Radiating tension |
| **Rect Centers** | At center of randomly selected nets | Localized internal texture |
| **Start / End** | In first/last N nets drawn by fill algorithm | Focal emphasis |
| **Random** | Uniformly random | Even distribution |
| **Grid Centers** | Center points of grid cells only | Structured blast patterns |
| **Edges** | Midpoints of grid cell edges | Edge-emphasis texture |
| **Corners** | Corners of nets | Rounded-corner effect (emergent) |

**What Eros does:** Pure uniform random. No positional intelligence.

---

### GAP 7: Missing Texture Modes (L4 — HIGH)

| Texture | Description |
|:--------|:-----------|
| **Lattice** | All connections drawn (horizontal + vertical). Most common. |
| **Hatched** | Only horizontal connections. Denser nets. |
| **Sqribble** | Each point wiggled randomly before explosions — scribbly, organic. |

---

### GAP 8: Missing Interference Control (L4 — HIGH)

- **Low interference:** Net responds only to explosions inside it → clean, localized
- **High interference:** Net responds to explosions in wider proximity → chaotic

**What Eros does:** Every repulsor affects every point globally = always maximum interference.

---

### GAP 9: Missing Topology Mode (L4 — MEDIUM)

- **Torus:** Wraps around to other edge
- **Finite:** Falls off (clipped)

---

### GAP 10: Missing Gradient Palettes (L5 — MEDIUM)

16 hand-curated palettes in real Edifice. Eros has 3 palettes with 4 colors. No gradient mode. No probability weighting.

---

### GAP 11: Missing Line Width Variation (L5 — MEDIUM)

Thick = "rectangles seem filled in." Thin = "ghostlike images." Eros has single constant `strokeWeight`.

---

### GAP 12: Missing Spread Control (L5 — MEDIUM)

"Spread" = how much explosion sources **move during simulation**. Low = fixed, sharp. High = diffused. Eros has static repulsors.

---

### GAP 13: The Net Structure Itself is Missing (META — FUNDAMENTAL)

**The real Edifice:** A **literal grid of connected points** (nodes + ropes/springs) where:
1. At every intersection: a point with mass
2. Points connected by springs that stretch but don't break
3. Explosions push point masses, deforming the grid
4. Deformed grid rendered by drawing connections → "torn web" effect

**Eros:** Scatters random starting points and integrates through a flow field. No underlying structural net. No cloth simulation.

---

### GAP 14: No Physical Simulation of Explosion (META — FUNDAMENTAL)

**Real Edifice:** Iterative simulation:
1. Place net points on regular grid inside each enclosure
2. Place explosion sources at strategic positions
3. Iteratively apply forces over N simulation steps
4. After convergence, render deformed connections

**Eros:** Forces applied analytically at render time — no iterative simulation. Each stroke independently displaced.

---

## PART IV — FORMULA REFERENCE

### 4.1 Inverse-Square Repulsion

```
F⃗(node, explosion) = explosion.force / (|r⃗|² + ε) × r̂

Where:
  r⃗ = node.position − explosion.position
  ε = 1 (softening constant)
  r̂ = r⃗ / |r⃗| (unit direction vector)
```

**In code:**
```javascript
const dx = node.x - exp.x;
const dy = node.y - exp.y;
const distSq = dx * dx + dy * dy + 1;   // ε = 1

if (distSq < exp.force * 60) {           // influence radius cutoff
    const force = exp.force / distSq;
    const dist = Math.sqrt(distSq);
    fx += (dx / dist) * force;
    fy += (dy / dist) * force;
}
```

### 4.2 Hooke's Law Spring Constraint (Cloth Links)

```
Δ = (|current_dist| − rest_dist) / |current_dist|
correction⃗ = direction⃗ × Δ × 0.5 × springK

node1.position += correction⃗
node2.position −= correction⃗
```

**Why the "torn web" works:** When `springK = 0.5`, the spring corrects only 25% of overshoot per step. Over 25 steps, explosive force and spring correction reach equilibrium where nodes near a blast are pushed apart while far nodes barely move. The links connecting disparate nodes render as taut lines crossing empty space — the "tear."

### 4.3 Velocity Integration & Damping

```
node.velocity += accumulated_force
node.position += node.velocity
node.velocity *= damp              // damp = 0.85
```

`0.85²⁵ ≈ 0.017` — initial velocity decays to ~1.7% by end. Prevents oscillation. Single "blast + settle" motion.

### 4.4 RK4 Hatching Kernel

```javascript
function rk4Step(x, y, phase, stepSize) {
    const f = (lx, ly) => ({
        vx: Math.cos(phase) + Math.sin(ly * 0.02),
        vy: Math.sin(phase) + Math.cos(lx * 0.02)
    });
    const k1 = f(x, y);
    const k2 = f(x + 0.5*stepSize*k1.vx, y + 0.5*stepSize*k1.vy);
    const k3 = f(x + 0.5*stepSize*k2.vx, y + 0.5*stepSize*k2.vy);
    const k4 = f(x + stepSize*k3.vx, y + stepSize*k3.vy);
    return {
        nx: x + (stepSize/6) * (k1.vx + 2*k2.vx + 2*k3.vx + k4.vx),
        ny: y + (stepSize/6) * (k1.vy + 2*k2.vy + 2*k3.vy + k4.vy)
    };
}
```

### 4.5 Affine Displacement Formulas

| Type | Formula |
|:-----|:--------|
| **Twist** | `θ' = atan2(dy, dx) + dist × 0.0005; x' = cx + cos(θ')×dist; y' = cy + sin(θ')×dist` |
| **Sharp** | `x' = x + sign(dx) × |dx|^0.95 × 0.08` |
| **Squish** | `rowParity = floor(py × 0.04) % 2; x' = cx + dx × (parity ? 1.4 : 0.6)` |
| **Shift** | `x' = x + sin(y × 0.02) × 15; y' = y + cos(x × 0.02) × 15` |
| **Wave** | `x' = x + A × sin(y × freq)` |

### 4.6 Anti-Tangling Constraint

```javascript
if (link.isHorizontal && link.n1.x > link.n2.x - 0.1) {
    let mid = (link.n1.x + link.n2.x) / 2;
    link.n1.x = mid - 0.05;
    link.n2.x = mid + 0.05;
}
```

Preserves topological mesh ordering under extreme deformation.

### 4.7 Color Stability Fix

**Problem:** Color tied to PRNG consumption order. Changing explosion count, mesh density, or warp shifts colors unpredictably.

**Fix:** Secondary PRNG seeded from enclosure coordinates:
```javascript
const colorSeed = params.seed ^ (enc.gx * 7919 + enc.gy * 104729);
const colorPRNG = new PRNG(colorSeed);
const colIdx = Math.floor(colorPRNG.next() * palLen);
```

---

## PART V — SSoT CONTRADICTIONS

The current `ssot.md` contains statements that **contradict** the Kovach-only mereological directive:

| # | SSoT Statement | Contradiction | Required Fix |
|:--|:--------------|:-------------|:-------------|
| 1 | §2.3: "Simplex and Perlin noise must be used" | Kovach **strictly prohibits** continuous noise | Remove; replace with "Discrete inverse-square forces only" |
| 2 | §3: "Dual-Engine Paradigm" (pixel topology + flow agents) | Real Edifice is **net deformation simulation**, not flow field | Rewrite to describe cloth/spring simulation |
| 3 | §4.1: "Spatial Hashing / Fidenza-style packing" | Kovach uses **topological clamping**, not proximity checks | Remove Fidenza references |
| 4 | §4.3: "Eros rejects opacity stacking" | `multiply` compositing with low alpha **IS** opacity stacking | Reconcile — it's structural accumulation, not decorative |

---

## PART VI — TOOL & STACK EVALUATION

### 6.1 Current Stack Assessment

| Component | Current Tech | Verdict |
|:----------|:------------|:--------|
| **Rendering** | Vanilla JS + HTML5 Canvas 2D | ✅ **Optimal.** Zero abstraction tax. 85k+ strokes with multiply blending. |
| **UI** | Vanilla JS DOM (`eros.js`, 1475 lines) | ⚠️ Functional but fragile for node-based UI |
| **Math** | Inline PRNG, Simplex, RK4, Complex algebra | ✅ No-allocation hot paths. GC-safe. |
| **State** | Global `state` + `MethodRegistry` | ⚠️ Flat. No composition graph. |
| **Bundling** | Raw `<script>` tags | ⚠️ Limits modularity. No ES modules. |

### 6.2 Tool Candidates (Resolved)

| Tool | Verdict | Reason |
|:-----|:--------|:-------|
| **Vanilla JS + Canvas 2D** | ✅ **KEEP** | Already optimal. Direct pixel/vector control. |
| **p5.js** | ❌ **REJECTED** | Abstraction tax kills performance. Loses `multiply` compositing, `Int8Array` grids, inline RK4. |
| **Processing** | ❌ **REJECTED** | Not web-native. Breaks `vercel.json` deployment. |
| **LiteGraph.js** | ⭐ **Phase 3** | Vanilla JS, powers ComfyUI, ~200KB, custom nodes with OffscreenCanvas. |
| **Rete.js** | ⚠️ Backup | Over-engineered for Eros's needs. |
| **React Flow / Svelvet** | ❌ **Wrong stack** | Would require framework rewrite. |

---

## PART VII — THE 3-PHASE HARDENING PLAN

### Phase 1: Grid & Composition (Highest Impact)

| # | Task | Impact | Effort |
|:--|:-----|:-------|:-------|
| 1.1 | **Implement Fill Styles:** Random Walk, Random, Ns, Bars | 🔴 Critical | High |
| 1.2 | **Add Cell Aspect Ratio** (non-square rectangles) | 🔴 Critical | Medium |
| 1.3 | **Add Symmetry Modes:** None / Horizontal / Vertical / Radial | 🟡 High | Medium |
| 1.4 | **Expose `packDensity` parameter** (replaces hardcoded 0.42 threshold) | 🟢 Medium | Low |
| 1.5 | **Color stability fix** (position-deterministic assignment) | 🟡 High | Low |

### Phase 2: Displacement, Forces & Net (Second Highest)

| # | Task | Impact | Effort |
|:--|:-----|:-------|:-------|
| 2.1 | **Implement 5 core displacements:** Sharp, Twist, Wave, Shift, Turn | 🔴 Critical | High |
| 2.2 | **Implement cloth/spring net simulation** (GAP 13/14) | 🔴 Critical | Very High |
| 2.3 | **Add explosion positioning strategies:** Central, Corners, Grid Centers, Edges | 🟡 High | Medium |
| 2.4 | **Add interference control:** local-only vs global repulsors | 🟡 High | Medium |
| 2.5 | **Add boundary styles:** Modern (sticky) vs Explosive (bouncy) | 🟡 High | Medium |
| 2.6 | **Expose physics params:** springK, damp, simSteps, forceMin/Max, bounceEnergy | 🟡 High | Medium |

### Phase 3: Texture, Render & Polish

| # | Task | Impact | Effort |
|:--|:-----|:-------|:-------|
| 3.1 | **Add texture modes:** Lattice, Hatched, Sqribble | 🟡 High | Medium |
| 3.2 | **Add RK4 hatching mode** alongside spring mesh rendering | 🟡 High | Medium |
| 3.3 | **Add topology mode:** Torus wrapping | 🟢 Medium | Low |
| 3.4 | **Expand palette system:** 8+ palettes, gradient modes, weighted distribution | 🟢 Medium | Medium |
| 3.5 | **Add line width variation:** per-enclosure thickness | 🟢 Medium | Low |
| 3.6 | **Add spread control:** dynamic explosion movement over simulation steps | 🟢 Medium | Medium |
| 3.7 | **Add mass-dependent line density:** `lineCount = floor(15000/√mass × random)` | 🟢 Medium | Low |
| 3.8 | **Add TDA density clamping:** spatial grid prevents ink black holes | 🟢 Medium | Medium |

---

## PART VIII — FUTURE ARCHITECTURE (Post-Hardening)

### Phase A: Multi-Canvas Compositing (OffscreenCanvas)

- Render multiple method instances to separate canvases
- Add `CompositorPanel` — drag/layer outputs
- Blend modes: multiply, screen, overlay, difference
- Per-layer opacity, offset, scale
- **No new dependencies.** Native `OffscreenCanvas` + `drawImage()`.

### Phase B: Node Graph (LiteGraph.js)

- Replace flat method selector with node-based composition
- Generator Nodes (Kovach with different params)
- Transform Nodes (affine, warp, crop, mask)
- Blend Nodes (multiply, screen, overlay)
- Output Node (final composition → export)
- Palette as shared Color Node

### Phase C: Canvas-in-Canvas Recursion (Holy Grail)

- Kovach generates structural skeleton → exported as binary mask
- Second Kovach instance uses that mask as L2 boundary constraints
- Flow field reads the first instance's tension map to modulate L3 forces
- **Structural composition**, not just image layering

---

## PART IX — AESTHETIC IDENTITY

### 9.1 The Three Tensions

Edifice's aesthetic identity rests on simultaneous tension between three opposing forces:

1. **Order vs. Chaos** — Rigid grid packing vs. explosive blast deformation
2. **Connectivity vs. Rupture** — Indestructible spring links vs. violent spatial displacement
3. **Density vs. Void** — Dense crosshatching vs. torn negative space

### 9.2 Visual Signatures to Preserve

- Grid outlines visible as architectural scaffolding — the container is always legible
- Crosshatch density varies by enclosure size — small cells are dark; large cells are airy
- Torn spaces contain taut, stretched lines — never empty void, always structural remnants
- Color is stable and container-bound — each enclosure owns its color permanently
- Grain texture is paper/plotter emulation — never a digital effect

### 9.3 What the Hardening Adds

- **Compositional variety** — Fill styles transform monotonous sequential scans into flowing, radial, spiral, or architectural compositions
- **Controllable violence** — springK, damp, forceMin/Max let the user dial from "gentle distortion" to "catastrophic structural failure"
- **Spatial intelligence** — Explosion positioning strategies create intentional focal points instead of random noise
- **True cloth physics** — The torn web effect is the hallmark of Edifice, impossible without cloth simulation
- **Curved hatching** — RK4 mode adds flowing organic paths within rigid grid

---

## PART X — VERIFICATION PLAN

### Automated Tests
- Render Kovach at seed 42 before/after each change — verify visual regression
- Run each new fill style at 5 different seeds — verify grid fills completely (no gaps)
- Verify each displacement preserves canvas bounds (no strokes outside viewport)
- Performance: each render ≤ 2000ms at 1024×1024
- Verify color stability when changing explosion count (colors must not shift)

### Visual Verification
- Generate 4×4 grid of outputs: fill styles × displacement types
- Compare against reference Edifice images from artblocks.io
- Verify symmetry modes produce exact mirror reflection
- Verify no black-hole collapse at max explosions + min springK

---

## APPENDIX A — METHOD CLEANUP

All 15 non-Kovach methods to be moved to `app/_legacy/`:

```
ailanthus.js, centaur.js, edifice.js, edifice-v2.js, edifice-v3.js,
escher-hyperbolic.js, escher-periodic.js, flow.js, inversion.js,
lattice.js, manifold.js, miniature.js, muqarnas.js, sculpture.js, xylem.js
```

**Action:** `mkdir app/_legacy/ && move` — do **not** delete. These serve as reference implementations.

---

## APPENDIX B — REFERENCES

| Source | Content |
|:-------|:--------|
| [bendotk.com/writing/edifice](https://bendotk.com/writing/edifice) | Official Edifice writeup — fill styles, displacements, net mechanics |
| [art-heuristics-v2.md](file:///d:/YO/Eros/Analysis/art-heuristics-v2.md) | 5-level ontological taxonomy, philosophical doctrine |
| [edifice-heuristics.md](file:///d:/YO/Eros/Analysis/edifice-heuristics.md) | Formula derivations, Edifice v2 gaps, v3 spec |
| [ontological-and-mereological-taxonomy.md](file:///d:/YO/Eros/Analysis/ontological-and-mereological-taxonomy-of-generative-architecture.md) | Deep philosophical framework, comparative analysis |
| [ssot.md](file:///d:/YO/Eros/ssot.md) | Engine constitution (requires updates per Part V) |
| [kovach.js](file:///d:/YO/Eros/app/methods/kovach.js) | Current implementation (benchmark) |
