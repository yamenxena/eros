# Kovach Mereological Engine — Forensic Hardening Audit

## 0. Scope & Objective

This document is a **deep forensic audit** of [kovach.js](file:///d:/YO/Eros/app/methods/kovach.js) against the **real Edifice algorithm** as documented by Ben Kovach at [bendotk.com/writing/edifice](https://bendotk.com/writing/edifice). The goal is to identify every "unknown unknown" — mathematical, structural, and aesthetic gaps — that prevent the Eros engine from achieving parity with the benchmark.

> [!IMPORTANT]
> This audit supersedes the previous multi-method strategic plan. Per the user's directive, **all non-Kovach methods are deprecated**. The Kovach method is the **Single Source of Truth** and the exclusive focus of all development.

---

## 1. The Real Edifice — What Kovach Actually Built

From the official writeup and deep research, Edifice is defined by **7 core feature axes**, each with multiple variants that interact multiplicatively:

| Axis | Variants | Current Eros Coverage |
|:-----|:---------|:---------------------|
| **Cell Size** | Fine → Colossal (continuous range) | ✅ `gridCols` param (10–100) |
| **Cell Aspect** | Square, Wide, Extra Wide, Tall, Extra Tall | ❌ **MISSING** — Always square (`gw === gh`) |
| **Fill Style** | Random Walk, Random, Ns, Distance, Manhattan, Chebyshev, Bismuth, Spiral, Bars | ❌ **MISSING** — Only flat sequential scan |
| **Symmetry** | None, Horizontal, Vertical, Radial | ❌ **MISSING** — No symmetry at all |
| **Displacement** | Twist, Sharp, Squish, Detach, Turn, Smooth, Shift, Wave, Isometrize, Perspective, V | ⚠️ Only **Squish** implemented |
| **Style (Boundary)** | Explosive (bouncy), Modern (sticky) | ❌ **MISSING** — Only hard clamp |
| **Texture** | Lattice, Lattice (Hatched), Sqribble | ❌ **MISSING** — Only one mode |

**Coverage Score: ~15%** — The current implementation captures the mathematical skeleton but misses the majority of Edifice's generative variety.

---

## 2. Gap Analysis — Level by Level

### 2.1 Level 1: THE PACK — Space Partitioning

#### ❌ GAP 1: Fill Style is Missing Entirely

**What Kovach does:** The fill style determines *how* rectangles are placed into the grid. This is the **single most impactful** feature on composition:

| Fill Style | Algorithm | Visual Character |
|:-----------|:----------|:-----------------|
| **Random Walk** (most common) | Pick random start → grow rectangle in a direction → from endpoint, pick adjacent cell → grow new rect → repeat until full | Continuous, flowing compositions with connected structures |
| **Random** | Pick random open cell → grow in random direction → repeat | Scattered, disconnected blocks |
| **Ns** | Pick N (1–8) → fill with N-height/width rects → decrement N → repeat | Graduated density; N=1 → fully gridded |
| **Distance / Manhattan / Chebyshev** | Like Random but next cell = closest to initial start by metric | Radial growth from center — produces radiation patterns |
| **Bismuth** | Fill with spiral patterns | Crystal / bismuth mineral appearance |
| **Spiral** | Single spiral growing inward | Vortex composition |
| **Bars** | Equal-width vertical towers | Architectural columns |

**What Eros does:** Flat sequential scan (`for i = 0; i < cols*rows; i++`). This is neither Random Walk nor any named style — it's just a naive left-to-right, top-to-bottom scan that places rectangles wherever they fit. This produces **zero compositional variety**.

> [!CAUTION]
> **This is the #1 critical gap.** Without fill styles, every Kovach render has the same monotonous compositional structure regardless of seed. The fill style is what gives Edifice its 976-piece variety.

#### ❌ GAP 2: Cell Aspect — Non-Square Rectangles

**What Kovach does:** Cells are not always square. The grid can be squished so cells are wider than tall (or taller than wide), producing varied rectangular shapes.

**What Eros does:** `_allocateTopologicalGrid(cols, rows, maxScale, ...)` always produces `gw === gh` (the same N×N square). The function enforces `x + N <= cols && y + N <= rows` — it only places squares.

**Fix:** The packing should support configurable aspect ratios: `gw = N, gh = round(N * aspectRatio)` where aspectRatio is a parameter ranging from 0.25 (extra tall) to 4.0 (extra wide).

---

### 2.2 Level 2: THE ENCLOSURE — Sovereign Bounding Objects

#### ❌ GAP 3: Symmetry is Missing

**What Kovach does:** After the grid is filled, a symmetry transform is applied:
- **Horizontal**: Top half reflected to bottom
- **Vertical**: Left half reflected to right
- **Radial**: Both — fourfold symmetry

Symmetry affects both grid layout AND color assignment.

**What Eros does:** No symmetry at all. Every render is asymmetric.

#### ❌ GAP 4: Boundary Collision Styles (Modern/Sticky vs Explosive/Bouncy)

**What Kovach does:** The enclosure "style" determines what happens when a net strand hits the boundary:
- **Explosive** (rubber): Net bounces inward — creates filled, dense interiors
- **Modern** (sticky): Net sticks to edges — creates traced/outlined cells with emergent partial fills

**What Eros does:** Hard `Math.min/Math.max` clamp. The vector position is forced inside the box and then continues. This is neither sticky nor bouncy — it's just a wall. There's no behavioral variety.

**Fix:** Implement two collision modes:
1. **Modern (Sticky):** When vector hits boundary, velocity → 0 and position locks to the edge. Subsequent steps "slide" along the edge.
2. **Explosive (Bouncy):** When vector hits boundary, reflect the velocity component normal to the wall. Add an optional friction coefficient to control energy loss.

---

### 2.3 Level 3: THE NET — Physical Forces & Warps

#### ⚠️ GAP 5: Only 1 of 11+ Displacement Functions Implemented

**What Kovach does:** The displacement function is applied to **every single point** in the piece. It warps the entire coordinate space. Edifice has 11+ displacement types:

| Displacement | Mathematical Formula | Visual Effect |
|:------------|:--------------------|:-------------|
| **Twist** | `θ = dist(p, center) * twistFactor; p' = rotate(p, center, θ)` | Rotational vortex from center |
| **Sharp** | `offset = (rowParity == 0) ? +k : -k` | Jagged sawtooth offset per row |
| **Squish** | `scaleX = (rowParity == 0) ? (1+s) : (1-s)` | Trapezoidal alternating bands ✅ **Implemented** |
| **Detach** | Pick a line between cells; shift one side by offset | Tectonic plate separation |
| **Turn** | `p' = rotate(p, center, constantAngle)` | Uniform rotation (lopsided) |
| **Smooth** | Single smooth sine/cosine curve displacement | Gentle bowing/curving |
| **Shift** | `p.x += p.y * shearFactor` | Global parallelogram skew |
| **Wave** | `p.x += A * sin(p.y * freq)` | Sine wave undulation |
| **Isometrize** | Isometric projection transform | Pseudo-3D axonometric view |
| **Perspective** | Two-point perspective projection | 3D depth illusion |
| **V** ("Weird dimensions") | Half convex, half concave perspective split | Surreal spatial fold |

**What Eros does:** Only **Squish** — parity-based row scaling. `const rowParity = Math.floor(py * 0.04) % 2`. This is one of the simplest displacements.

> [!WARNING]
> The displacement function is the second most impactful variety axis. Implementing at least **Twist, Sharp, Wave, Shift, and Turn** would transform the output variety from monotonic to architecturally diverse.

#### ❌ GAP 6: Explosion Positioning Strategy is Missing

**What Kovach does:** Repulsors (explosions) are not placed randomly. Their positions follow a strategy:

| Strategy | Placement Rule |
|:---------|:--------------|
| **Central** | Normally distributed around the horizontal center line |
| **Rect Centers** | At the center of randomly selected nets |
| **Start / End** | In the first/last N nets drawn by the fill algorithm |
| **Random** | Uniformly random across the grid |
| **Grid Centers** | Only at the center points of grid cells |
| **Random (Gridded)** | Corners, edge midpoints, and centers of grid cells |
| **Edges** | Midpoints of grid cell edges |
| **Corners** | Corners of nets (emergent: rounds out corners) |

**What Eros does:** `prng.next() * drawW` / `prng.next() * drawH` — pure uniform random. There is no positional strategy.

**Impact:** "Corners" placement in Edifice creates the distinctive rounded-corner effect. "Central" creates radiating tension. "Rect Centers" creates localized internal texture. These strategies are what make different Edifice pieces look dramatically different.

---

### 2.4 Level 4: THE HATCH — Vector Integration

#### ❌ GAP 7: Missing Texture Modes

**What Kovach does:** Before explosions occur, the net itself has a texture mode:

| Texture | Description |
|:--------|:-----------|
| **Lattice** | All connections drawn (horizontal + vertical). Most common. |
| **Lattice (Hatched)** | Only horizontal connections. Nets are denser. |
| **Sqribble** | Each point on the net is "wiggled" randomly before explosions — scribbly, organic texture. |

**What Eros does:** Only one mode — linear RK4 integration from random starting points. No lattice structure, no hatching directionality, no pre-explosion point wiggling.

**Fix:** Add a `texture` parameter:
1. **Lattice:** Default bidirectional flow
2. **Hatched:** Constrain flow to primarily horizontal (or vertical) direction
3. **Sqribble:** Add random displacement to starting positions before RK4 integration

#### ❌ GAP 8: Missing Interference Control

**What Kovach does:** "Interference" controls how many explosions affect each net:
- **Low:** Net responds only to explosions directly inside it → clean, localized texture
- **High:** Net responds to explosions in a wider proximity → chaotic, cross-pollinated patterns

**What Eros does:** Every repulsor affects every point globally — there is no locality control. This is equivalent to maximum interference always.

**Fix:** Add an `interference` parameter. When low, each enclosure only considers repulsors that fall within its bounding box (or within N cells of it). When high, all repulsors contribute.

#### ❌ GAP 9: Missing Topology Mode (Torus vs Finite)

**What Kovach does:** "Topology" determines what happens when nets extend beyond the canvas:
- **Torus:** Wraps around to the other edge
- **Finite:** Falls off the edge (clipped)

**What Eros does:** Only finite (clamp to bounds). No torus wrapping.

---

### 2.5 Level 5: THE PIGMENT — Analog Render Synthesis

#### ❌ GAP 10: Missing Gradient Palettes

**What Kovach does:** 16 hand-curated palettes, some with weighted probability distribution, some with gradient modes (Grayscale, Salt, Sunflower, Meep Morp, Onus, Blood Orange). Gradient palettes can be applied in multiple ways (implied by "hidden feature").

**What Eros does:** 3 palettes with 4 colors each. No gradient mode. No probability weighting.

#### ❌ GAP 11: Missing Line Width Variation

**What Kovach does:** Line width can vary — some pieces have "relatively thick width that makes rectangles seem filled in," while others have "thinner" strokes producing "ghostlike images."

**What Eros does:** Single constant `strokeWeight` parameter. No per-enclosure or seed-driven variation.

#### ❌ GAP 12: Missing Spread Control

**What Kovach does:** "Spread" controls how much the explosions move around during the explosion simulation. Low spread = fixed, sharp textures. High spread = muted, diffused textures.

**What Eros does:** No spread control. Repulsors are static points.

---

### 2.6 Meta-Level Gaps

#### ❌ GAP 13: The Net Structure Itself is Missing

**The fundamental gap:** Kovach's algorithm is not just "scatter random lines inside a box." The net is a **literal grid of connected points** where:
1. At every intersection, there is a point with mass
2. Points are connected by ropes that stretch but don't break
3. Explosions push these point masses, deforming the grid
4. The deformed grid is then rendered by drawing the connections

**Eros's version** skips this entirely — it just scatters random starting points and integrates them through a flow field. There is no underlying structural net. This is a fundamental architectural difference.

#### ❌ GAP 14: No Physical Simulation of Explosion

**What Kovach does:** The explosion is an iterative simulation:
1. Place net points on a regular grid inside each enclosure
2. Place explosion sources at strategic positions
3. Iteratively apply forces from explosions to net points (over multiple simulation steps)
4. After simulation converges, render the deformed net connections

**What Eros does:** Forces are applied analytically at render time — there is no iterative physical simulation. Each stroke is independently displaced, not part of a structural net that deforms coherently.

---

## 3. The "Unknown Unknowns" — Deep Mathematical Gaps

### 3.1 The Derivative Function is Too Simple

Current: `vx = cos(phase) + sin(y * 0.02), vy = sin(phase) + cos(x * 0.02)`

This produces gentle, uniform curves. The real Edifice texture comes from the **deformed net structure**, not from a flow field. The current derivative creates smooth, flowing lines — beautiful but not structurally Kovach.

### 3.2 The 0.42 Threshold Needs Calibration

The structural failure threshold `prng.next() > 0.42` determines the probability that a valid large rectangle is placed. At 0.42, approximately 58% of valid large placements succeed. This feels arbitrary. Kovach likely tuned this through extensive generation testing.

**Recommendation:** Make this a parameter (`packDensity`, range 0.1–0.9) so the user can control the monolith-vs-shrapnel ratio.

### 3.3 Missing: The "Explosive" Spread Simulation

In Edifice, "spread" describes how explosion sources move during the simulation. This is not the same as the repulsor force — it's about the dynamics of the force sources themselves. Implementing this requires:
1. Repulsors have a velocity/trajectory
2. The simulation runs for N steps
3. At each step, repulsors move according to their spread parameter
4. Net points accumulate displacement over all steps

---

## 4. Proposed Hardening Plan

### Phase 1: Grid & Composition (Highest Impact)

| # | Task | Impact | Effort |
|:--|:-----|:-------|:-------|
| 1.1 | **Implement Fill Styles**: Random Walk, Random, Ns, Bars | 🔴 Critical | High |
| 1.2 | **Add Cell Aspect Ratio** parameter to support non-square rectangles | 🔴 Critical | Medium |
| 1.3 | **Add Symmetry Modes**: None, Horizontal, Vertical, Radial | 🟡 High | Medium |
| 1.4 | **Make failure threshold a parameter** (`packDensity`) | 🟢 Medium | Low |

### Phase 2: Displacement & Forces (Second Highest)

| # | Task | Impact | Effort |
|:--|:-----|:-------|:-------|
| 2.1 | **Implement 5 Core Displacements**: Twist, Sharp, Wave, Shift, Turn | 🔴 Critical | High |
| 2.2 | **Add Explosion Positioning Strategies**: Central, Corners, Grid Centers, Edges | 🟡 High | Medium |
| 2.3 | **Add Interference Control**: local-only vs global repulsors | 🟡 High | Medium |
| 2.4 | **Add Boundary Styles**: Modern (sticky) vs Explosive (bouncy) | 🟡 High | Medium |

### Phase 3: Texture & Render (Polish)

| # | Task | Impact | Effort |
|:--|:-----|:-------|:-------|
| 3.1 | **Add Texture Modes**: Lattice, Hatched, Sqribble | 🟡 High | Medium |
| 3.2 | **Add Topology Mode**: Torus wrapping | 🟢 Medium | Low |
| 3.3 | **Expand Palette System**: 8+ palettes, gradient modes, probability weighting | 🟢 Medium | Medium |
| 3.4 | **Add Line Width Variation**: per-enclosure thickness variation | 🟢 Medium | Low |
| 3.5 | **Add Spread Control**: dynamic explosion movement | 🟢 Medium | Medium |

---

## 5. SSoT Contradictions Found

> [!WARNING]
> The current SSoT (`ssot.md`) contains statements that **contradict** the Kovach-only directive:

1. **§2.3 "Coherent Noise over Randomness":** States "Simplex and Perlin noise functions must be used." But the Kovach method **strictly prohibits** continuous noise. The SSoT must be updated to reflect the mereological philosophy.

2. **§3 "The Dual-Engine Paradigm":** Describes a Phase A (pixel topology) + Phase B (flow agents) architecture. The real Kovach/Edifice approach is a **net deformation simulation**, not a flow field. This section needs revision.

3. **§4.1 "Spatial Hashing" / "Fidenza-style packing":** References Fidenza's proximity-based collision. Kovach uses **absolute topological clamping** (enclosure boundaries), not proximity checks. The SSoT conflates two different paradigms.

4. **§4.3 "Isolated HSL Shifting":** States "Eros rejects opacity stacking." But `ctx.globalCompositeOperation = 'multiply'` with low alpha IS opacity stacking — it's the core of Kovach's texture. The SSoT must reconcile this.

---

## 6. Open Questions

> [!IMPORTANT]
> ### Decisions Required Before Implementation
>
> 1. **Net simulation vs. flow field:** Should we implement the true net deformation simulation (GAP 13/14), or keep the current flow-field approximation with enhanced displacement? The net simulation is more authentic but significantly more complex.
>
> 2. **Fill styles priority:** Which fill styles should be implemented first? Recommend: Random Walk (most common) → Ns (unique grid effects) → Bars (architectural).
>
> 3. **Displacement priority:** Which 5 displacements first? Recommend: Sharp (easy, high impact) → Twist (iconic) → Wave (simple math) → Turn (trivial) → Shift (trivial).
>
> 4. **SSoT update:** Should we rewrite the SSoT to align exclusively with Kovach mereological philosophy, removing all Fidenza/flow-field references?
>
> 5. **Method cleanup:** All 15 non-Kovach methods remain in `app/methods/`. Should we delete them from the filesystem, or just delist them from the registry?

---

## 7. Verification Plan

### Automated Tests
- Render Kovach at seed 42 before and after each change — verify visual regression
- Run each new fill style at 5 different seeds — verify grid fills completely (no gaps)
- Verify each displacement function preserves canvas bounds (no strokes outside viewport)
- Performance benchmark: each render must complete in ≤2000ms at 1024×1024

### Visual Verification
- Generate a 4×4 grid of outputs cycling through fill styles × displacement types
- Compare visual output against reference Edifice images from artblocks.io
- Verify symmetry modes produce exact mirror reflection
