# Edifice Heuristics — Unified SSoT

> **Authority:** This document is the **Single Source of Truth** for the Eros generative engine.
> It supersedes and absorbs all prior analysis documents.
> **Date:** 2026-04-02 (Restructured)
> **Benchmark:** `edifice-v3.js` (v6.0.0 — created 03:41 AM, the final method evolution)

---

## 0. Source Documents Absorbed

| # | Document | Status | Absorbed Into |
|:--|:---------|:-------|:-------------|
| A | [kovach-mereological-engine-audit.md](file:///d:/YO/Eros/Analysis/kovach-mereological-engine-audit.md) | 14 gaps, 5-level taxonomy, SSoT contradictions | §I, §III, §IV |
| B | [kovach-forensic-audit.md](file:///d:/YO/Eros/Analysis/kovach-forensic-audit.md) | 7 feature axes, level-by-level gaps | Fully absorbed by A — 90% overlap |
| C | [topology-heuristics.md](file:///d:/YO/Eros/Analysis/topology-heuristics.md) | Cell complex, 4 surfaces, 7 topological ops, cross-domain | §V, §VI |
| D | [sweet-spot.md](file:///d:/YO/Eros/Analysis/sweet-spot.md) | 5-axis metrics, λ_eros, fractal D, β₁ range | §VII |
| E | [implementation-plan_0.md](file:///d:/YO/Eros/Analysis/implementation-plan_0.md) | Unified 7-phase rebuild plan | §IX (rebased) |
| F | [edifice-v3.js](file:///d:/YO/Eros/app/_legacy/edifice-v3.js) | 690 lines — actual working code | §III gap closure, §VIII code reference |

> [!IMPORTANT]
> **The Critical Discovery:** Documents A–E were written auditing `kovach.js` (v1.1, created 01:25 AM).
> `edifice-v3.js` (v6.0.0, created 03:41 AM) was built **later** and already implements **10 of 14 gaps**.
> This restructured plan rebases all phases against what v3 actually has vs. what remains missing.

---

## I. Philosophical Foundation

### 1.1 Mereological Autonomy

The Eros engine structurally rejects the concept of a master "canvas" (a reductionist whole). Form emerges through the tension between **strictly discrete architectural spatial matrices** and **autonomous fractional vectors** crashing into absolute theoretical boundaries.

**Key Principles:**
- **Part-to-Part, never Part-to-Whole.** Each grid cell (Enclosure) is a sovereign entity.
- **Space is not void.** Every pixel of bounding geometry exerts forces onto traversing ink vectors.
- **Extrinsic relations only.** Parts connect, collide, and react without losing individual mathematical identities (DeLanda's Assemblage Theory).
- **No continuous noise.** Perlin/Simplex are banned from structural computation. Beauty comes from discrete collisions.

### 1.2 The Kovach Benchmark

All development is measured against [Edifice](https://bendotk.com/writing/edifice) by Ben Kovach. The engine uses 7 core feature axes that interact multiplicatively to produce 976-piece variety.

### 1.3 Comparative Paradigms

| Attribute | Tyler Hobbs (Fidenza) | Manolo Gamboa Naon | Ben Kovach (Edifice) |
|:----------|:---------------------|:-------------------|:--------------------|
| **Mereological State** | Continuous / Proximity-based | Over-lapped / Plastic | Discrete / Part-to-Part Autonomous |
| **Spatial Partitioning** | None (global continuous field) | Recursive subdivision | N-Descending Stochastic Matrix Grid |
| **Primary Vector Force** | Perlin / Simplex noise gradients | Chaotic attractors | Affine matrices & inverse-square torsion |
| **Constraint Logic** | Radial collision detection O(N²) | Additive density saturation | Absolute topological clamping (Math.min/max) |
| **Render Emulation** | Painterly / analog brushwork | Digital plastic / high-chroma | Eroded blueprint / mechanical plotter |

---

## II. The 5-Level Ontological Taxonomy

Every Eros render must pass through all five levels. No level may be skipped.

```
Level 0 — THE SEED (PRNG State)
│   Deterministic origin. All entropy flows from a single integer seed.
│
├── Level 1 — THE PACK (Space Partitioning)
│   │   Int8Array matrix. N-Descending stochastic rectangle packing.
│   │   Output: Array of Enclosures {gx, gy, gw, gh}
│   │   Fill Styles: Random Walk / Random Box / Ns / Bars / Spiral / Bismuth / BSP
│   │
│   ├── Level 2 — THE ENCLOSURE (Sovereign Bounding Objects)
│   │   │   Each: sovereign entity with independent mass, phase, color.
│   │   │   Boundary enforcement: Sticky (Modern) or Bouncy (Explosive).
│   │   │   Symmetry modes: None / Horizontal / Vertical / Radial.
│   │   │
│   │   ├── Level 3 — THE NET (Physical Forces & Warps)
│   │   │   │   Inverse-square repulsors: F = m / (ε + r²)
│   │   │   │   Global affine displacement: Twist / Sharp / Squish / Shift / Wave / Turn / Detach
│   │   │   │   Explosion positioning strategies: Random / Central / Corners / Edges
│   │   │   │   Interference radius control (local vs. global)
│   │   │   │
│   │   │   ├── Level 4 — THE HATCH (Vector Integration / Trajectories)
│   │   │   │   │   Spring-link cloth simulation (primary) OR RK4 flow field (secondary)
│   │   │   │   │   Texture modes: Lattice / Hatched / Sqribble
│   │   │   │   │   TDA density clamping (β₁ > threshold → suppress)
│   │   │   │   │   Anti-tangling constraint (topological planarity enforcer)
│   │   │   │   │
│   │   │   │   └── Level 5 — THE PIGMENT (Analog Render Synthesis)
│   │   │   │           ctx.globalCompositeOperation = 'multiply'
│   │   │   │           Position-deterministic color assignment
│   │   │   │           Mass-dependent line density
│   │   │   │           Per-enclosure phase (deterministic)
│   │   │   │           Canvas grain (plotter emulation)
```

---

## III. Gap Analysis — Rebased Against edifice-v3.js

### 3.1 The 7 Feature Axes (Rebased)

| Axis | Real Edifice Variants | kovach.js (v1.1) | edifice-v3.js (v6.0) | Remaining Gap |
|:-----|:---------------------|:-----------------|:--------------------|:-------------|
| **Cell Size** | Fine → Colossal | ✅ `gridCols` | ✅ `gridCols` (4–50) | None |
| **Cell Aspect** | Square to Extra Wide/Tall | ❌ Always square | ❌ **Still square** | **Must add** |
| **Fill Style** | 9 algorithms | ❌ Flat scan | ✅ Random Walk, Random Box, Ns | Add: Bars, Spiral, Bismuth, BSP, Distance |
| **Symmetry** | None/H/V/Radial | ❌ None | ❌ **Still missing** | **Must add** |
| **Displacement** | 11+ types | ⚠️ Squish only | ✅ Twist, Sharp, Shift, Squish, Wave, Turn, Smooth, Detach | Add: Isometrize, Perspective, V |
| **Style (Boundary)** | Explosive/Modern | ❌ Hard clamp | ✅ Modern (Sticky) + Explosive (Bounce) | None |
| **Texture** | Lattice/Hatched/Sqribble | ❌ One mode | ✅ Lattice, Hatched, Sqribble | None |

### 3.2 The 14 Gaps — Closure Status

| Gap | Description | kovach.js | edifice-v3.js | Status |
|:----|:-----------|:----------|:-------------|:-------|
| **GAP 1** | Fill styles | ❌ | ✅ 3 of 9 | **PARTIAL** — 6 styles remain |
| **GAP 2** | Cell aspect ratio | ❌ | ❌ | **OPEN** |
| **GAP 3** | Symmetry modes | ❌ | ❌ | **OPEN** |
| **GAP 4** | Boundary collision styles | ❌ | ✅ | **CLOSED** |
| **GAP 5** | Displacements (11+) | 1/11 | 8/11 | **PARTIAL** — 3 remain (Isometrize, Perspective, V) |
| **GAP 6** | Explosion positioning | ❌ | ✅ Random/Central/Corners/Edges | **CLOSED** |
| **GAP 7** | Texture modes | ❌ | ✅ Lattice/Hatched/Sqribble | **CLOSED** |
| **GAP 8** | Interference control | ❌ | ✅ Radius-based filtering | **CLOSED** |
| **GAP 9** | Topology (torus wrapping) | ❌ | ❌ | **OPEN** |
| **GAP 10** | Gradient palettes (16) | 3 palettes | 4 palettes | **PARTIAL** — need 12+ |
| **GAP 11** | Line width variation | ❌ | ✅ Per-enclosure PRNG thickness | **CLOSED** |
| **GAP 12** | Spread control | ❌ | ✅ Sinusoidal repulsor drift | **CLOSED** |
| **GAP 13** | Cloth/spring net structure | ❌ | ✅ `_buildClothMesh()` | **CLOSED** |
| **GAP 14** | Iterative physics simulation | ❌ | ✅ `_simulateClothPhysics()` | **CLOSED** |

### 3.3 Closure Summary

```
CLOSED (v3 already implements):  9 / 14  (GAP 4, 6, 7, 8, 11, 12, 13, 14, + Color Stability)
PARTIAL (v3 started, needs more): 3 / 14  (GAP 1, 5, 10)
OPEN (v3 does not address):       2 / 14  (GAP 2, 3, 9)
```

> [!TIP]
> **edifice-v3.js closes the two FUNDAMENTAL gaps (13, 14)** — cloth simulation and iterative physics. This means Phase 3 of the old plan is **already done**. The rebuild should start from v3, not v1.

### 3.4 v3 Features NOT in Any Audit (New from v3 Code)

These features were implemented in v3 but were not anticipated by the audit documents:

| Feature | v3 Implementation | Significance |
|:--------|:-----------------|:-------------|
| **Position-deterministic color** | `colorSeed = seed ^ (gx×7919 + gy×104729)` | Solves COLOR-1 gap completely |
| **Enclosure phase** | `encPhase = ((gx×31 + gy×97 + seed) % 628) / 100.0` | Position-derived, deterministic |
| **Mass-dependent density** | `effectiveSubdivs = subdivs × (1/√mass) × 3.0` | Smaller cells → denser hatching |
| **TDA density clamping** | `Float32Array` density grid, skip if `>= densityClamp` | Prevents ink black holes |
| **RK4 flow hatch** | Full `_rk4Step()` + `_renderRK4Hatch()` | Secondary render mode alongside cloth |
| **Hybrid render mode** | Spring Mesh + RK4 Flow combined | Dual-texture overlay |
| **Controllable physics** | `springK`, `damp`, `simSteps`, `bounceEnergy` all parameterized | Full user control |
| **Canvas grain** | `_addGrain()` — per-pixel PRNG noise on image data | Plotter/paper emulation |
| **Grid outline control** | Color, thickness, transparency options | Scaffolding visibility |
| **Interference radius** | 50–1500px, distance-based filtering | Local vs. global force control |

---

## IV. Formula Reference

### 4.1 Inverse-Square Repulsion

```
F⃗(node, explosion) = explosion.force / (|r⃗|² + ε)  ×  r̂

Where:
  r⃗ = node.position − explosion.position
  |r⃗|² = dx² + dy²
  ε = 1  (softening constant, prevents division by zero)
  r̂ = r⃗ / |r⃗| (unit direction vector)
  Cutoff: distSq < exp.force × 60 (influence radius)
```

### 4.2 Hooke's Law Spring Constraint

```
Δ = (|current_dist| − rest_dist) / |current_dist|
correction⃗ = direction⃗ × Δ × 0.5 × springK

node1.position += correction⃗
node2.position −= correction⃗
```

**Why the "torn web" works:** When `springK = 0.5`, the spring corrects only 25% of overshoot per step. Over 25 steps, the explosive force and spring correction reach equilibrium where nodes near the blast are pushed apart while far nodes barely move. The connecting links become the visual "tear."

### 4.3 Velocity Integration & Damping

```
node.velocity += accumulated_force
node.position += node.velocity
node.velocity *= damp              // damp = 0.85 → 0.85²⁵ ≈ 0.017
```

Single "blast + settle" motion. No oscillation.

### 4.4 Affine Displacement Formulas

| Type | Formula | Visual Effect |
|:-----|:--------|:-------------|
| **Twist** | `θ' = atan2(dy,dx) + dist×0.0005; p' = (cx+cos(θ')×dist, cy+sin(θ')×dist)` | Spiral vortex from center |
| **Sharp** | `x' = x + sign(dx)×|dx|^0.95×0.08` | Brutalist fold on 45° fault lines |
| **Squish** | `rowParity = floor(py×0.04)%2; scaleX = parity ? 1.4 : 0.6` | Alternating compression/expansion |
| **Shift** | `x' = x + sin(y×0.02)×15; y' = y + cos(x×0.02)×15` | Cross-axis sinusoidal warp |
| **Wave** | `x' = x + A×sin(y×freq)` | Sine wave undulation |
| **Turn** | `p' = rotate(p, center, θ_const)` | Uniform lopsided rotation |
| **Smooth** | `x' = x + A×sin(y×f); y' = y + B×cos(x×f)` | Gentle bowing/curving |
| **Detach** | Cut along cell boundary; shift one side | Tectonic plate separation |
| **Isometrize** | `(x·cos(30°)−y·cos(30°), x·sin(30°)+y·sin(30°))` | Axonometric pseudo-3D |
| **Perspective** | Two-point projective transform | Vanishing-point depth |
| **V** | Half convex + half concave perspective | Escher-like spatial fold |

### 4.5 Anti-Tangling Constraint

Preserves topological mesh planarity under extreme deformation:

```javascript
if (link.isHorizontal && link.n1.x > link.n2.x - 0.1) {
    let mid = (link.n1.x + link.n2.x) / 2;
    link.n1.x = mid - 0.05; link.n2.x = mid + 0.05;
}
if (link.isVertical && link.n1.y > link.n2.y - 0.1) {
    let mid = (link.n1.y + link.n2.y) / 2;
    link.n1.y = mid - 0.05; link.n2.y = mid + 0.05;
}
```

### 4.6 RK4 Hatching Kernel

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

### 4.7 Position-Deterministic Color

```javascript
const colorSeed = params.seed ^ (enc.gx * 7919 + enc.gy * 104729);
const colorPRNG = new PRNG(colorSeed);
const colIdx = Math.floor(colorPRNG.next() * palLen);
```

Color is a **pure function of (seed, gx, gy)** — immune to physics/render PRNG shifts.

---

## V. Topological Grammar

### 5.1 The Grid as Topological Object

The Edifice grid is a **finite 2-cell complex** (CW complex):

```
For an M×N grid:
  V = (M+1)(N+1)     vertices
  E = M(N+1) + N(M+1) edges
  F = M × N          faces

Euler characteristic:
  χ = V − E + F = 1  → topologically a DISK (genus 0, one boundary component)
```

### 5.2 The Four Canonical Surfaces

```
SURFACE        LEFT/RIGHT      TOP/BOTTOM       χ    ORIENTABLE?
────────────   ─────────────   ──────────────   ──   ──────────
Disk           none            none              1    Yes
Cylinder       wrap            none              0    Yes (with boundary)
Torus          wrap            wrap              0    Yes
Klein Bottle   wrap            mirror (flip)     0    No
Projective RP² mirror          mirror            1    No
```

Implementation as boundary condition:

```javascript
function wrapCoordinate(pos, min, max, mode) {
    const range = max - min;
    switch (mode) {
        case 'finite':  return Math.max(min, Math.min(max, pos));
        case 'wrap':    return min + ((pos - min) % range + range) % range;
        case 'mirror':
            const cycles = Math.floor((pos - min) / range);
            const local = (pos - min) % range;
            return (cycles % 2 === 0) ? min + local : max - local;
    }
}
```

### 5.3 Three Classes of Deformation

```
CLASS A — HOMEOMORPHISMS (topology-preserving)
  Twist, Squish, Sharp, Shift, Wave, Turn, Smooth
  ↳ Grid is stretched but never torn. χ, β₀, β₁ all preserved.

CLASS B — PROJECTIONS (information-reducing)
  Isometrize, Perspective, V
  ↳ 3D surface → 2D image. Many-to-one mapping. Apparent depth.

CLASS C — SURGERY (topology-changing)
  Detach
  ↳ Cuts the surface. Changes β₀. Creates "tectonic plate" effect.
```

### 5.4 The Seven Topological Operations

| # | Operation | Symbol | Effect | Invariants Changed |
|:--|:----------|:-------|:-------|:------------------|
| 1 | **Partition** | P(style) | Subdivide void into cells | V, E, F increase; χ preserved |
| 2 | **Identify** | I(axis, mode) | Glue boundary edges | χ changes; genus may change |
| 3 | **Deform** | D(field) | Move vertices continuously | None — homeomorphism |
| 4 | **Project** | Π(type, params) | Map to rendering plane | Metric changes; topology preserved |
| 5 | **Cut** | C(path) | Sever edges along path | β₀ increases |
| 6 | **Modulate** | M(param, f(x,y)) | Vary parameter spatially | None — parametric |
| 7 | **Render** | R(texture, palette) | Draw with pigment | None — final presentation |

### 5.5 Forbidden Compositions

| Composition | Why Forbidden |
|:-----------|:-------------|
| `I(torus) → C(cut) → re-wrap` | Cutting a torus yields a cylinder, not a torus |
| `Π(perspective) → Π(isometric)` | Double projection: compose underlying matrices instead |
| `D(Explosion)` with springK=0 | No spring → vertices fly off → numerical explosion |
| `M(param, noise)` | Continuous noise violates mereological autonomy |

---

## VI. Cross-Domain Heuristics

### 6.1 Bridget Riley — Parametric Field Variation

Position-dependent parameter gradients without breaking part-to-part autonomy:

```javascript
function getEnclosureParams(enc, globalParams) {
    const nx = enc.gx / gridCols;
    const ny = enc.gy / gridRows;
    return {
        lineDensity: globalParams.baseDensity * (1 + 0.5 * Math.sin(nx * Math.PI * 2)),
        phase: globalParams.basePhase + ny * Math.PI * 0.5,
        springK: globalParams.baseSpringK * (0.5 + nx * 0.5),
    };
}
```

### 6.2 Turkish Miniature — Topological Priority Constraint

Constraint checking order for new deformations:
1. **β₀ preserved?** (grid still connected?) — HARD CONSTRAINT
2. **Planarity preserved?** (edges cross?) — HARD CONSTRAINT via anti-tangling
3. **Adjacency preserved?** (neighbors still neighbors?) — SOFT CONSTRAINT
4. **Metric similarity?** — NO CONSTRAINT (let it distort)

### 6.3 Guo Xi — The Projection Atlas

Multiple projections coexist on a single canvas as a manifold with charts:

```javascript
const charts = [
    { region: (enc) => enc.gy < gridRows/3, projection: 'isometric', angle: 30 },
    { region: (enc) => enc.gy < 2*gridRows/3, projection: 'identity' },
    { region: (enc) => true, projection: 'perspective', strength: 0.5 }
];
```

### 6.4 Mondrian — BSP Fill Style

```javascript
function bspSubdivide(x, y, w, h, depth, maxDepth, prng) {
    if (depth >= maxDepth || w < minSize || h < minSize) {
        return [{ gx: x, gy: y, gw: w, gh: h }];
    }
    const splitH = prng.next() > (w / (w + h));
    const ratio = 0.3 + prng.next() * 0.4;
    // ... recursive subdivision
}
```

### 6.5 Lacan — The Borromean Structure

```
REAL     = Grid topology (χ, β₀, adjacency) — the unknowable structure
SYMBOLIC = Displacement/projection rules — the language
IMAGINARY = The rendered visual — the "mirror" image
SINTHOME = The PALETTE — the fourth ring that holds it together
```

**Practical implication:** Palette stability (§4.7) is structurally critical. If the Sinthome drifts, the whole structure unravels.

---

## VII. The Sweet-Spot Metrics

### 7.1 The Five-Axis Sweet Spot

| Axis | What | Measure | Optimal Range |
|:-----|:-----|:--------|:-------------|
| **Fractal D** | Scale complexity | Box-counting dimension | [1.3, 1.5] |
| **β₁/β₀** | Topological loop ratio | Euler characteristic on downsampled grid | [0.02N, 0.15N] |
| **κ** | Compressibility | 1 − (PNG_size / raw_bitmap) | [0.65, 0.85] |
| **ρ** | Ink density | Dark pixels / total pixels | [0.25, 0.55] |
| **H_s** | Scale entropy | Shannon entropy of cell sizes | [0.5, 0.85] × H_max |

### 7.2 λ_eros — The Edge of Chaos

```
λ_eros ∝ (explosionCount × forceMax) / (springK × simSteps × gridCols²)

λ_eros ≈ 0:  Springs dominate → grid barely deforms → boring
λ_eros → ∞:  Explosions overwhelm → mesh shatters → noise
λ_eros ≈ 1:  SWEET SPOT — torn web effect emerges
```

**This is the single most important parameter.** It should be exposed (or at least computed and displayed).

### 7.3 The Composite Score

```javascript
function membership(value, low_bad, low_good, high_good, high_bad) {
    if (value <= low_bad || value >= high_bad) return 0;
    if (value >= low_good && value <= high_good) return 1;
    if (value < low_good) return (value - low_bad) / (low_good - low_bad);
    return (high_bad - value) / (high_bad - high_good);
}

// Composite = PRODUCT of 5 membership values (failure on any axis kills score)
```

### 7.4 Convergent Theories

| Framework | Sweet Spot | Source |
|:----------|:----------|:-------|
| **Birkhoff** | M = O/C ratio | 1933 |
| **Berlyne** | Peak of inverted-U curve | 1971 |
| **Taylor** | D ∈ [1.3, 1.5] fractal fluency | 2000–2021 |
| **Schmidhuber** | Maximum compression progress | 1997–2009 |
| **Alexander** | 15 properties of living structure | 2002–2004 |

---

## VIII. The v3 Code Reference

### 8.1 Complete Parameter Set (from edifice-v3.js)

```
LEVEL 0 — SEED
  seed:          int [1, 999999]        default: 834
  canvasMargin:  range [0, 20]%         default: 6

LEVEL 1 — PACK
  gridCols:      range [4, 50]          default: 22
  fillAlgo:      select [Random Walk, Random Box, Ns]  default: Random Walk

LEVEL 2 — ENCLOSURE
  boundStyle:    select [Modern (Sticky), Explosive (Bounce)]  default: Modern
  expCount:      range [0, 100]         default: 0
  expPos:        select [Random, Corners, Edges, Central]      default: Random
  interference:  range [50, 1500]       default: 450
  forceMin:      range [100, 5000]      default: 800
  forceMax:      range [1000, 15000]    default: 4500
  displacement:  select [None, Twist, Sharp, Shift, Squish]    default: None

LEVEL 3 — CLOTH PHYSICS
  springK:       range [0.05, 1.0]      default: 0.50
  damp:          range [0.40, 0.99]     default: 0.85
  simSteps:      range [5, 100]         default: 25
  bounceEnergy:  range [0.1, 1.0]       default: 0.50

LEVEL 4-5 — HATCH & PIGMENT
  hatchMode:     select [Spring Mesh, RK4 Flow, Hybrid]       default: Spring Mesh
  texture:       select [Lattice, Hatched, Sqribble]           default: Hatched
  outlineColor:  select [Black, Transparent, White, Palette]   default: Black
  gridOutline:   range [0.0, 15.0]      default: 1.5
  meshSubdivs:   range [1.0, 30.0]      default: 6.0
  lineWeight:    range [0.1, 3.0]       default: 0.60
  lineAlpha:     range [0.05, 1.0]      default: 0.85
  hatchDensity:  range [0.1, 5.0]       default: 1.0
  massDensity:   select [Off, On]       default: Off
  densityClamp:  range [0, 100]         default: 0
  sketchWarp:    range [0.0, 5.0]       default: 0.0
  grainIntensity: range [0, 50]         default: 10
```

### 8.2 Architecture Summary (690 lines)

| Method | Purpose | Lines |
|:-------|:--------|:------|
| `render()` | Main loop — orchestrates all 5 levels | 119–269 |
| `_buildCompositionGrid()` | L1 Pack — Int8Array fill algorithm | 274–345 |
| `_generateExplosions()` | L2 Net — explosion placement strategies | 350–384 |
| `_buildClothMesh()` | L3 Cloth — nodes + spring links per enclosure | 389–444 |
| `_simulateClothPhysics()` | L4 Physics — iterative force/spring/boundary | 450–523 |
| `_displacePoint()` | L3 Displacement — affine coordinate warp | 528–559 |
| `_renderMesh()` | L4 Render — draw deformed links + TDA clamp | 564–600 |
| `_rk4Step()` | L4 RK4 — fourth-order Runge-Kutta step | 606–622 |
| `_renderRK4Hatch()` | L4 Render — flow-field crosshatching | 624–675 |
| `_addGrain()` | L5 Post — per-pixel plotter noise | 680–689 |

---

## IX. The Rebased Phased Plan

> [!IMPORTANT]
> **Starting point: edifice-v3.js, not kovach.js.**
> The old plan's Phase 3 (cloth simulation) is **already done** in v3.
> Phase 0 cleanup is **already done** (methods moved, 3D stripped, SSoT rewritten).
> The rebuild starts from v3 as the active method.

### PHASE 1 — ACTIVATE v3 & GRID ENHANCEMENTS
**Goal:** Install edifice-v3 as the active method. Add missing grid features.

| # | Task | Gap | Priority | Effort |
|:--|:-----|:----|:---------|:-------|
| 1.1 | **Promote edifice-v3.js** → `app/methods/edifice.js` (rename, register as sole method) | — | 🔴 Critical | Low |
| 1.2 | **Cell aspect ratio** — `aspectRatio` param [0.25, 4.0]; modify `_buildCompositionGrid` | GAP-2 | 🔴 Critical | Medium |
| 1.3 | **Symmetry modes** — None / Horizontal / Vertical / Radial; applied post-packing | GAP-3 | 🟡 High | Medium |
| 1.4 | **Pack density** — expose `packDensity` param [0.1, 0.9]; replace hardcoded 0.42 | PACK-1 | 🟢 Medium | Low |
| 1.5 | **Wire to palette panel** — connect method palettes to existing palette system | — | 🟡 High | Medium |
| 1.6 | **Wire to animation system** — ensure all params are interpolatable | — | 🟢 Medium | Low |
| 1.7 | **Verify & push** | — | — | — |

### PHASE 2 — DISPLACEMENT & FORCES EXPANSION
**Goal:** Complete the displacement catalogue and add remaining force features.

| # | Task | Gap | Priority | Effort |
|:--|:-----|:----|:---------|:-------|
| 2.1 | **Add Wave displacement** — `x += A×sin(y×freq)` | GAP-5 | 🟡 High | Low |
| 2.2 | **Add Turn displacement** — `p' = rotate(p, center, θ)` | GAP-5 | 🟡 High | Low |
| 2.3 | **Add Smooth displacement** — gentle sine/cosine bowing | GAP-5 | 🟢 Medium | Low |
| 2.4 | **Add Detach displacement** — topological surgery (cut along cell boundary) | GAP-5 | 🟢 Medium | Medium |
| 2.5 | **Add Spread control** — repulsors move during simulation | GAP-12 | 🟢 Medium | Medium |
| 2.6 | **Line width variation** — per-enclosure thickness variation | GAP-11 | 🟢 Medium | Low |
| 2.7 | **Verify & push** | — | — | — |

### PHASE 3 — TOPOLOGY & RENDER POLISH
**Goal:** Add surface identification, projection, and palette expansion.

| # | Task | Gap | Priority | Effort |
|:--|:-----|:----|:---------|:-------|
| 3.1 | **Topology modes** — `boundaryX`/`boundaryY` params: finite/wrap/mirror | GAP-9, TOP-1 | 🟡 High | Medium |
| 3.2 | **Projection atlas** — Identity / Isometric / Perspective / V-Fold | TOP-2 | 🟢 Medium | Medium |
| 3.3 | **Isometrize displacement** — link to projection param | GAP-5 | 🟢 Medium | Low |
| 3.4 | **Perspective displacement** — link to projection param | GAP-5 | 🟢 Medium | Low |
| 3.5 | **V-fold displacement** — half convex / half concave | GAP-5 | 🟢 Medium | Medium |
| 3.6 | **Expand palette system** — 12+ palettes, gradient mode, probability weighting | GAP-10 | 🟢 Medium | Medium |
| 3.7 | **Verify & push** | — | — | — |

### PHASE 4 — FILL STYLES & COMPOSITIONAL VARIETY
**Goal:** Complete the fill style catalogue for maximum compositional diversity.

| # | Task | Gap | Priority | Effort |
|:--|:-----|:----|:---------|:-------|
| 4.1 | **Add Bars fill style** — equal-width vertical columns | GAP-1 | 🟢 Medium | Low |
| 4.2 | **Add Spiral fill style** — single spiral growing inward | GAP-1 | 🟢 Medium | Medium |
| 4.3 | **Add Bismuth fill style** — crystal spiral patterns | GAP-1 | 🟢 Medium | Medium |
| 4.4 | **Add BSP fill style** — Mondrian binary space partition | GAP-1, TOP-5 | 🟢 Medium | Medium |
| 4.5 | **Add Distance fill style** — radial growth from center | GAP-1 | 🟢 Medium | Medium |
| 4.6 | **Riley parametric modulation** — position-dependent parameter gradients | TOP-4 | 🟢 Medium | Medium |
| 4.7 | **Verify & push** | — | — | — |

### PHASE 5 — SWEET-SPOT METRICS & QUALITY GATES
**Goal:** Implement computable aesthetic metrics and quality feedback.

| # | Task | Gap | Priority | Effort |
|:--|:-----|:----|:---------|:-------|
| 5.1 | **Density (ρ)** — count dark pixels / total | SS-3 | 🟢 Low | Trivial |
| 5.2 | **Compressibility (κ)** — PNG size ratio | SS-4 | 🟢 Low | Low |
| 5.3 | **Fractal D** — box-counting algorithm | SS-1 | 🟢 Medium | Medium |
| 5.4 | **β₁ approximation** — Euler characteristic on downsampled grid | SS-2 | 🟢 Medium | Medium |
| 5.5 | **Scale entropy (H_s)** — Shannon entropy of cell size distribution | SS-5 | 🟢 Low | Low |
| 5.6 | **Sweet-spot dashboard** — render info bar with green/yellow/red indicators | SS-5 | 🟢 Medium | Medium |
| 5.7 | **λ_eros computation** — display edge-of-chaos parameter | SS-6 | 🟢 Low | Low |
| 5.8 | **Verify & push** | — | — | — |

### PHASE 6 — FUTURE ARCHITECTURE (Deferred)
**Goal:** Multi-canvas compositing and node-based workflow.

| # | Task | Priority | Effort |
|:--|:-----|:---------|:-------|
| 6.1 | **Multi-canvas compositing** — OffscreenCanvas + blend modes | 🟢 Medium | High |
| 6.2 | **LiteGraph.js node graph** — generator/transform/blend/output nodes | 🟢 Low | Very High |
| 6.3 | **Canvas-in-canvas recursion** — structural composition, not layering | 🟢 Low | Very High |

---

## X. Unified Gap Tracker (33 Items — Rebased)

| ID | Gap | Source | Phase | Priority | v3 Status |
|:---|:----|:-------|:------|:---------|:----------|
| GAP-01 | Fill styles (9 total) | A, B | **P1+P4** | 🔴 Critical | 3/9 done |
| GAP-02 | Cell aspect ratio | A, B | **P1** | 🔴 Critical | ❌ Open |
| GAP-03 | Symmetry modes | A, B | **P1** | 🟡 High | ❌ Open |
| GAP-04 | Boundary styles | A, B | — | ✅ | ✅ Closed |
| GAP-05 | Displacements (11 total) | A, B | **P2+P3** | 🔴 Critical | 8/11 done |
| GAP-06 | Explosion positioning | A, B | — | ✅ | ✅ Closed |
| GAP-07 | Texture modes | A, B | — | ✅ | ✅ Closed |
| GAP-08 | Interference control | A, B | — | ✅ | ✅ Closed |
| GAP-09 | Topology (torus/Klein/RP²) | A, B, C | **P3** | 🟡 High | ❌ Open |
| GAP-10 | Palettes (16 total) | A, B | **P3** | 🟢 Medium | 4/16 done |
| GAP-11 | Line width variation | A, B | **P2** | 🟢 Medium | ✅ Closed |
| GAP-12 | Spread control | A, B | **P2** | 🟢 Medium | ✅ Closed |
| GAP-13 | Cloth/spring net | A, B | — | ✅ | ✅ Closed |
| GAP-14 | Iterative physics sim | A, B | — | ✅ | ✅ Closed |
| SSoT-1 | Simplex/Perlin removed | A | — | ✅ | ✅ Closed (Phase 0) |
| SSoT-2 | Dual-Engine rewritten | A | — | ✅ | ✅ Closed (Phase 0) |
| SSoT-3 | Fidenza refs removed | A | — | ✅ | ✅ Closed (Phase 0) |
| SSoT-4 | Opacity reconciled | A | — | ✅ | ✅ Closed (Phase 0) |
| COLOR-1 | Position-deterministic color | A | — | ✅ | ✅ Closed in v3 |
| PACK-1 | packDensity parameter | A, B | **P1** | 🟢 Medium | ❌ Open |
| TOP-1 | Surface identification | C | **P3** | 🟡 High | ❌ Open |
| TOP-2 | Projection atlas | C | **P3** | 🟢 Medium | ❌ Open |
| TOP-3 | Anti-tangling documented | C | — | ✅ | ✅ Exists in v3 |
| TOP-4 | Riley parametric modulation | C | **P4** | 🟢 Medium | ❌ Open |
| TOP-5 | BSP fill style (Mondrian) | C | **P4** | 🟢 Medium | ❌ Open |
| TOP-6 | Lacanian RP² uncanny | C | **P3** | 🟢 Low | ❌ Open |
| SS-1 | Fractal D computation | D | **P5** | 🟢 Medium | ❌ Open |
| SS-2 | β₁ approximation | D | **P5** | 🟢 Medium | ❌ Open |
| SS-3 | Density metric (ρ) | D | **P5** | 🟢 Low | ❌ Open |
| SS-4 | Compressibility (κ) | D | **P5** | 🟢 Low | ❌ Open |
| SS-5 | Sweet-spot dashboard | D | **P5** | 🟢 Medium | ❌ Open |
| SS-6 | λ_eros parameter | D | **P5** | 🟢 Low | ❌ Open |
| UI-1 | Remove 3D canvas | User | — | ✅ | ✅ Closed (Phase 0) |
| UI-2 | Remove Concept tab | User | — | ✅ | ✅ Closed (Phase 0) |
| UI-3 | Remove non-Kovach scripts | User | — | ✅ | ✅ Closed (Phase 0) |

### Summary

```
CLOSED:       19 / 35  (Phase 0 + v3 code + Phase 2)
REMAINING:    16 / 35  (Phases 3–5)
DEFERRED:      3       (Phase 6 — future architecture)
```

---

## XI. Aesthetic Identity — The Three Tensions

Edifice's visual identity rests on simultaneous tension between three opposing forces:

1. **Order vs. Chaos** — Rigid grid packing vs. explosive blast deformation
2. **Connectivity vs. Rupture** — Indestructible spring links vs. violent spatial displacement
3. **Density vs. Void** — Dense crosshatching vs. torn negative space

### Visual Signatures to Preserve

- Grid outlines visible as architectural scaffolding — the container is always legible
- Crosshatch density varies by enclosure size — small cells are dark, large cells are airy
- Torn spaces contain taut, stretched lines — never empty void, always structural remnants
- Color is stable and container-bound — each enclosure owns its color permanently
- Grain texture is paper/plotter emulation — never a digital effect

---

## XII. Verification Protocol

### Per-Phase Gates

| Phase | Gate |
|:------|:-----|
| P1 | v3 renders correctly as active method. Fill styles fill grid 100%. Symmetry is pixel-perfect. |
| P2 | All displacements preserve canvas bounds. Spread creates visible diffusion difference. |
| P3 | Torus creates seamless patterns. Projections produce correct spatial transformations. |
| P4 | 4×4 matrix (fill × displacement) generates visual variety. Riley modulation visible. |
| P5 | D ∈ [1.3, 1.5] for typical seed. Metrics display correctly in info bar. |

### Performance Guardrail

Every render must complete in **≤ 2000ms** at 1024×1024. If net simulation exceeds this, reduce `simSteps` or `meshSubdivs`.

### Halt-and-Verify Protocol

> [!CAUTION]
> **Each phase ends with a GitHub push and a HALT.** No phase begins until the previous is verified and pushed. This is non-negotiable.

---

## XIII. What Eros Is Not

- **Not p5.js** — zero-abstraction vanilla JS + Canvas 2D
- **Not a flow field engine** — flow fields are secondary mode, cloth simulation is primary
- **Not 3D** — pure 2D mereological canvas; depth is an illusion from projection operations
- **Not continuous noise** — Perlin/Simplex banned from structural computation
- **Not opacity stacking** — `multiply` compositing is structural accumulation, not decorative opacity

---

## Appendix A — References

| Source | Contribution |
|:-------|:------------|
| Ben Kovach, [Edifice](https://bendotk.com/writing/edifice) | Benchmark — all operations extend from this |
| Daniel Koehler, *The Mereological City* | Philosophical foundation — part-to-part topology |
| Classification Theorem of Closed Surfaces | Four canonical surfaces from edge identification |
| Bridget Riley | Parametric field variation creating phantom curvature |
| Guo Xi, *Linquan Gaozhi* | Three Distances as manifold atlas |
| Matrakçı Nasuh | Topological accuracy over metric accuracy |
| Mondrian / Skrodzki et al. | BSP tree formalization of grid composition |
| Jacques Lacan, Seminars RSI | Borromean structure and cross-cap uncanny |
| M.C. Escher, Metamorphosis I–III | Homotopy as fill-style transition |
| G.D. Birkhoff, *Aesthetic Measure* (1933) | M = O/C formula |
| D.E. Berlyne, *Aesthetics and Psychobiology* (1971) | Inverted-U curve |
| C. Langton (1990) | λ parameter, phase transitions |
| R.P. Taylor et al. (1999–2021) | D ∈ [1.3, 1.5] fractal fluency |
| J. Schmidhuber (1997–2009) | Kolmogorov complexity and beauty |
| C. Alexander, *The Nature of Order* (2002–04) | 15 properties of living structure |
