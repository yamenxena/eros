# Eros Engine — Unified Rebuild Plan

**Status:** Awaiting user approval
**Origin:** Unification of 4 temporal SSoTs into a single, phased, non-contradictory plan
**Date:** 2026-04-02

---

## 0. Source Documents Unified

This plan is the **deduplicated, coherent synthesis** of:

| # | Document | Key Content |
|:--|:---------|:-----------|
| A | [kovach-mereological-engine-audit.md](file:///d:/YO/Eros/Analysis/kovach-mereological-engine-audit.md) | 14 gaps, 5-level taxonomy, 3-phase hardening, SSoT contradictions, formula reference |
| B | [kovach-forensic-audit.md](file:///d:/YO/Eros/Analysis/kovach-forensic-audit.md) | 7 feature axes, level-by-level gap analysis, open questions |
| C | [topology-heuristics.md](file:///d:/YO/Eros/Analysis/topology-heuristics.md) | Cell complex formalism, 4 surfaces, 7 topological operations, cross-domain heuristics |
| D | [sweet-spot.md](file:///d:/YO/Eros/Analysis/sweet-spot.md) | 5-axis aesthetic metrics, λ_eros, fractal D, β₁ range, auto-tuning |

**Deduplication result:** Documents A and B had 90% overlap — B is fully absorbed by A. C and D are unique extensions. This plan absorbs all 4 into a linear execution sequence.

---

## 1. Current State Assessment

### What Exists
| Component | File | Status |
|:----------|:-----|:-------|
| Core engine | [eros-core.js](file:///d:/YO/Eros/app/eros-core.js) (671 lines) | PRNG, SimplexNoise, HSL, SpatialHash, Complex, MethodRegistry, ErosEngine shell |
| UI controller | [eros.js](file:///d:/YO/Eros/app/eros.js) (1475 lines) | Tab nav, sidebar, palette panel, gallery, animation, zoom/pan, mobile nav |
| HTML | [index.html](file:///d:/YO/Eros/app/index.html) (302 lines) | 4 tabs (2D Canvas, **3D Canvas**, Concept, Gallery), Three.js CDN imports |
| CSS | [styles.css](file:///d:/YO/Eros/app/styles.css) (29KB) | Full UI styling including 3D-specific classes |
| Kovach method | [kovach.js](file:///d:/YO/Eros/app/methods/kovach.js) (340 lines) | N-Descending pack, RK4 integration, Squish displacement only |
| SSoT | [ssot.md](file:///d:/YO/Eros/ssot.md) | **STALE** — contradicts Kovach philosophy (Perlin/Simplex, Fidenza, dual-engine) |
| 15 other methods | `app/methods/*.js` | Must go to `_legacy/` |

### What Must Be Removed
- **3D Canvas tab** — HTML nav button, Three.js `<script>` tags (11 CDN imports), 3D canvas element, 3D toggle, 3D-related JS, 3D CSS
- **Concept tab** — not needed for core art creation (can return later)
- **15 non-Kovach methods** — move to `app/_legacy/`, remove `<script>` tags from HTML
- **SSoT contradictions** — 4 identified statements that conflict with Kovach philosophy

### What Stays
- **2D Canvas** — the art workspace (sidebar + canvas + palette panel)
- **Gallery** — save/load/export compositions
- **Palette panel** — curated + harmony builder + image extraction
- **Animation system** — parameter interpolation + WebM recording
- **Mobile navigation** — bottom nav bar + drawer sheets

---

## 2. Architecture: Navigation & Layout

**After cleanup, the app has 2 views:**

```
┌─────────────────────────────────────────────────────┐
│  🔥 Eros — Mereological Art Engine    [Canvas] [Gallery]  │
├────────┬────────────────────────────────┬───────────┤
│ Sidebar│         CANVAS (2D)           │  Palette  │
│        │                               │  Panel    │
│ Method │     [rendered artwork]         │           │
│ Params │                               │  Curated  │
│        │                               │  Harmony  │
│ Seed   │                               │  Extract  │
│ Export  │                               │           │
│ Animate│                               │           │
├────────┴────────────────────────────────┴───────────┤
│  [W×H] [✓]                      [+] [-] [⊡] [1:1] [⛶]  │
└─────────────────────────────────────────────────────┘
```

---

## 3. The Phased Plan

> [!IMPORTANT]
> **Each phase ends with a GitHub push and a halt.** No phase begins until the previous is verified and pushed.

---

### PHASE 0 — CLEAN SLATE
**Goal:** Strip the codebase to its essential foundation. Remove all dead code. Establish Kovach as the sole method.

#### 0.1 Move Methods to Legacy

Move all 15 non-Kovach methods from `app/methods/` to `app/_legacy/`:

```
ailanthus.js, centaur.js, edifice.js, edifice-v2.js, edifice-v3.js,
escher-hyperbolic.js, escher-periodic.js, flow.js, inversion.js,
lattice.js, manifold.js, miniature.js, muqarnas.js, sculpture.js, xylem.js
```

#### 0.2 Strip 3D from HTML

- Remove `canvas-3d` tab button from `#main-nav`
- Remove `eros-canvas-3d` element
- Remove `mobile-3d-toggle` button
- Remove all 11 Three.js `<script>` CDN tags (lines 266-276)
- Remove all non-Kovach `<script>` tags (lines 280-297), keep only `kovach.js`
- Remove Concept tab button (keep the tab-content for potential future use as hidden)

#### 0.3 Strip 3D from JS (`eros.js`)

- Remove `canvas-3d` case from `switchToTab()`
- Remove `mobile3DToggle` event listener
- Remove `canvas3D` references from `CanvasView._apply()`
- Remove any `activeTabType === '3d'` branches
- Remove `savedMethod.type === '3d'` branch
- Clean up `buildMethodSelector()` to not accept type parameter (only 2D)

#### 0.4 Strip 3D from CSS (`styles.css`)

- Remove 3D-specific styles (mobile-3d-toggle, canvas-3d, etc.)

#### 0.5 Clean Core Engine (`eros-core.js`)

- Keep: PRNG, HSL, SpatialHashGrid, Complex arithmetic, MethodRegistry, ErosEngine shell
- Remove: `SimplexNoise` class (violates mereological autonomy — discrete forces only)
  
> [!WARNING]
> SimplexNoise removal must be verified: check if `kovach.js` references it. If yes, refactor to use PRNG-based discrete noise instead. If no method references it, remove cleanly.

#### 0.6 Rewrite SSoT

Replace `ssot.md` entirely. The new SSoT:
- Removes Perlin/Simplex noise mandate → "Discrete inverse-square forces only"
- Removes Dual-Engine Paradigm → "Net deformation simulation (cloth/spring)"
- Removes Fidenza/Spatial Hashing references → "Topological clamping (enclosure boundaries)"
- Reconciles `multiply` compositing → "Structural accumulation through multiplicative blending, not decorative opacity stacking"
- Establishes 5-level ontological taxonomy as constitutional law
- Establishes topological grammar (7 operations from topology-heuristics.md)

#### 0.7 Verify & Push

- App loads with only Kovach method visible
- Gallery still works (existing saves may reference old methods — handle gracefully)
- No console errors
- `git add . && git commit -m "Phase 0: Clean slate — Kovach SSoT" && git push`

---

### PHASE 1 — FOUNDATIONAL GRID (Level 1: THE PACK)
**Goal:** Implement the missing grid composition features that have the highest impact on visual variety.

#### 1.1 Cell Aspect Ratio (GAP 2)

Add `aspectRatio` parameter to Kovach:
```
Key: aspectRatio
Range: [0.25, 4.0]  (0.25 = extra tall, 4.0 = extra wide, 1.0 = square)
Effect: gw = N, gh = round(N * aspectRatio)
```

Modify `_allocateTopologicalGrid()`: replace `gw === gh` enforcement with `gw = N, gh = round(N / aspectRatio)`, clamped to grid bounds.

#### 1.2 Fill Styles (GAP 1 — CRITICAL)

Implement 4 fill styles (out of 9 in real Edifice):

| Priority | Style | Algorithm |
|:---------|:------|:---------|
| 1 | **Sequential** (current) | Left-to-right, top-to-bottom scan (baseline — keep as default) |
| 2 | **Random Walk** | Start at random cell → grow rect → from endpoint grow adjacent → repeat |
| 3 | **Random** | Pick random open cell → grow random direction → repeat |
| 4 | **Bars** | Equal-width vertical columns |

Add `fillStyle` parameter as select dropdown.

#### 1.3 Pack Density (GAP from §3.2 of forensic audit)

Expose the `0.42` threshold as `packDensity` parameter:
```
Key: packDensity
Range: [0.1, 0.9]
Effect: Higher values = more large rectangles, lower = more fragmentation
```

#### 1.4 Position-Deterministic Color (Audit §4.7)

Replace PRNG-dependent color assignment with position-based seeding:
```javascript
const colorSeed = params.seed ^ (enc.gx * 7919 + enc.gy * 104729);
const colorPRNG = new PRNG(colorSeed);
const colIdx = Math.floor(colorPRNG.next() * palLen);
```

This ensures color stability when other parameters change.

#### 1.5 Symmetry Modes (GAP 3)

Add `symmetry` parameter:
- **None** (default)
- **Horizontal** — top half reflected to bottom
- **Vertical** — left half reflected to right
- **Radial** — fourfold symmetry

Implementation: after grid fill, duplicate/mirror enclosures.

#### 1.6 Verify & Push

- Test each fill style at 5 seeds → verify complete grid coverage (no gaps)
- Test aspect ratio extremes (0.25, 1.0, 4.0) → verify no visual artifacts
- Test symmetry → verify exact mirror reflection
- Color stability: change explosion count → verify colors don't shift
- `git commit -m "Phase 1: Grid foundations — fill styles, aspect, symmetry" && git push`

---

### PHASE 2 — DISPLACEMENT & FORCES (Level 3: THE NET)
**Goal:** Implement the displacement functions and explosion positioning strategies.

#### 2.1 Core Displacements (GAP 5)

Implement 5 displacements (in addition to existing Squish):

| # | Displacement | Formula | Effort |
|:--|:------------|:--------|:-------|
| 1 | **Twist** | `θ' = atan2(dy,dx) + dist×0.0005; p' = rotate(p,center,θ')` | Medium |
| 2 | **Sharp** | `offset = sign(dx) × |dx|^0.95 × 0.08` | Low |
| 3 | **Wave** | `p.x += A × sin(p.y × freq)` | Low |
| 4 | **Shift** | `p.x += sin(y×0.02)×15; p.y += cos(x×0.02)×15` | Low |
| 5 | **Turn** | `p' = rotate(p, center, constantAngle)` | Low |

Add `displacement` parameter as select dropdown (None, Squish, Twist, Sharp, Wave, Shift, Turn).

#### 2.2 Explosion Positioning (GAP 6)

Replace uniform random placement with strategic options:

| Strategy | Placement Rule |
|:---------|:--------------|
| **Random** (current default) | Uniform random |
| **Central** | Normal distribution around horizontal center line |
| **Grid Centers** | Center points of grid cells only |
| **Corners** | Corners of enclosures (creates rounded-corner effect) |
| **Edges** | Midpoints of enclosure edges |

Add `explosionPos` parameter as select dropdown.

#### 2.3 Interference Control (GAP 8)

Add `interference` parameter:
- **Global** (current): every repulsor affects every point
- **Local**: each enclosure only considers repulsors within its bounding box (+ 1 cell margin)

#### 2.4 Boundary Collision Styles (GAP 4)

Add `boundaryStyle` parameter:
- **Clamp** (current): hard Math.min/Math.max
- **Sticky (Modern)**: velocity → 0, position locks to edge, subsequent steps slide along edge
- **Bouncy (Explosive)**: reflect velocity component normal to wall, with optional friction

#### 2.5 Verify & Push

- Test each displacement at 3 seeds → verify canvas bounds preserved
- Test explosion positioning → visually compare against Edifice references
- Test interference Local vs Global → verify Local has cleaner, localized texture
- Test boundary styles → verify Sticky creates outlines, Bouncy creates fills
- Performance: ≤2000ms at 1024×1024
- `git commit -m "Phase 2: Displacement & forces — 6 displacements, positioning, boundaries" && git push`

---

### PHASE 3 — THE NET SIMULATION (Level 3-4: META GAPS 13-14)
**Goal:** Replace the flow-field approximation with a true cloth/spring net simulation — the fundamental architectural gap.

#### 3.1 Net Data Structure

For each enclosure, create a grid of connected nodes:

```javascript
class NetNode {
    constructor(x, y) {
        this.x = x; this.y = y;       // position
        this.vx = 0; this.vy = 0;     // velocity
        this.fx = 0; this.fy = 0;     // accumulated force
    }
}

class ClothNet {
    constructor(enclosure, density) {
        // Create density × density grid of nodes within enclosure bounds
        // Connect adjacent nodes with spring links
        this.nodes = [];   // NetNode[]
        this.links = [];   // {n1, n2, restLength, isHorizontal}[]
    }
}
```

#### 3.2 Spring Physics (Hooke's Law — Audit §4.2)

```javascript
// For each link:
Δ = (currentDist - restDist) / currentDist;
correction = direction × Δ × 0.5 × springK;
node1.position += correction;
node2.position -= correction;
```

#### 3.3 Iterative Explosion Simulation (Audit §4.3)

```javascript
for (let step = 0; step < simSteps; step++) {
    // 1. Accumulate forces from explosions (inverse-square)
    // 2. Integrate velocity: v += F; p += v; v *= damp
    // 3. Enforce spring constraints (Hooke)
    // 4. Enforce anti-tangling (Audit §4.6)
    // 5. Enforce boundary collision (sticky or bouncy)
}
```

#### 3.4 Anti-Tangling Constraint (Audit §4.6)

```javascript
if (link.isHorizontal && link.n1.x > link.n2.x - 0.1) {
    const mid = (link.n1.x + link.n2.x) / 2;
    link.n1.x = mid - 0.05;
    link.n2.x = mid + 0.05;
}
```

#### 3.5 Render from Deformed Net

Instead of RK4 flow integration, render by drawing the deformed net connections:
- **Lattice**: draw all horizontal + vertical connections
- **Hatched**: draw only horizontal connections
- Draw connections as `ctx.beginPath(); ctx.moveTo(); ctx.lineTo(); ctx.stroke();`

#### 3.6 New Parameters Exposed

```
springK:     float [0.1, 1.0]   — spring stiffness
damp:        float [0.5, 0.99]  — velocity damping per step
simSteps:    int   [5, 100]     — simulation iterations
meshDensity: int   [5, 30]      — nodes per enclosure side
forceMin:    float [100, 5000]  — minimum explosion force
forceMax:    float [1000, 20000] — maximum explosion force
```

#### 3.7 Keep RK4 as Optional Mode

The existing RK4 flow-field rendering should be preserved as a `renderMode` option:
- **Net (Cloth)** — new default, true Edifice simulation
- **Flow (RK4)** — legacy mode, kept for artistic variety

#### 3.8 Verify & Push

- Compare output to real Edifice screenshots at bendotk.com
- Verify "torn web" effect at high explosion force + moderate springK
- Verify anti-tangling prevents edge crossings
- Performance: net simulation ≤1500ms, rendering ≤500ms at 1024×1024
- `git commit -m "Phase 3: Cloth net simulation — spring physics, iterative explosion" && git push`

---

### PHASE 4 — TEXTURE & RENDER (Level 4-5: THE HATCH + THE PIGMENT)
**Goal:** Add texture variety, line width control, expanded palettes, and topology modes.

#### 4.1 Texture Modes (GAP 7)

Add `texture` parameter:
- **Lattice** (default) — all connections (H+V)
- **Hatched** — horizontal connections only → denser, more linear
- **Sqribble** — wiggle each node position randomly before simulation → scribbly organic

#### 4.2 Topology/Boundary Modes (GAP 9 + Topology Heuristics §2)

Add `boundaryX` and `boundaryY` parameters:
- **Finite** (default) — hard edge (disk topology, χ=1)
- **Wrap** — torus wrapping (χ=0)
- **Mirror** — reflection at boundary (Klein bottle / RP²)

Implementation uses the `wrapCoordinate()` function from topology-heuristics.md §2.3.

#### 4.3 Line Width Variation (GAP 11)

Add `lineWidth` and `lineWidthVar` parameters:
- `lineWidth`: base stroke weight [0.3, 3.0]
- `lineWidthVar`: per-enclosure variation [0, 1] — 0 = uniform, 1 = max variation

#### 4.4 Expanded Palette System (GAP 10)

Expand from 3 palettes to 10+:
- Port 8 palettes from real Edifice (Grayscale, Salt, Sunflower, Blood Orange, etc.)
- Add gradient mode: instead of flat color per cell, linear gradient within cell
- Add probability weighting: some colors more likely than others

#### 4.5 Spread Control (GAP 12)

Add `spread` parameter:
- Repulsors move during simulation
- Low spread: fixed positions → sharp, focused textures
- High spread: repulsors drift → soft, diffused textures

#### 4.6 Mass-Dependent Line Density (Audit §3.7)

```javascript
const lineCount = Math.floor(15000 / Math.sqrt(mass) * prng.next());
```

Smaller cells → denser hatch. Larger cells → airier. Creates automatic visual hierarchy.

#### 4.7 Verify & Push

- Test all 3 texture modes × 3 topology modes → 9 combinations at seed 42
- Verify torus wrapping creates seamless patterns
- Verify palette gradient mode
- `git commit -m "Phase 4: Texture, topology, palettes — full render pipeline" && git push`

---

### PHASE 5 — SWEET-SPOT METRICS & PROJECTIONS (New from topology/sweet-spot research)
**Goal:** Implement computable aesthetic metrics and projection atlas.

#### 5.1 Fractal Dimension (D) Computation

Implement box-counting algorithm from sweet-spot.md §4.3:
- Compute D from rendered canvas
- Display in render-info bar

#### 5.2 Density (ρ) Computation

Count dark pixels / total pixels. Trivial to implement.

#### 5.3 Compressibility (κ) Computation

```javascript
const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
const κ = 1 - blob.size / (canvas.width * canvas.height * 4);
```

#### 5.4 Sweet-Spot Dashboard

Display the 3 metrics (D, ρ, κ) in the render info bar:
```
composed in 847ms · D=1.42 · ρ=0.38 · κ=0.74
```

Green/yellow/red indicator for each metric's position within sweet zone.

#### 5.5 Projection Atlas (Topology Heuristics §3)

Add `projection` parameter:
- **Identity** (default) — no spatial transformation
- **Isometric** — axonometric pseudo-3D
- **Perspective** — 1-point perspective depth
- **V-Fold** — Escher-like spatial fold

#### 5.6 Parametric Modulation (Topology Heuristics §5.1 — Riley)

Add optional position-dependent parameter variation:
- `densityMod`: modulate line density as sin(x) across canvas
- `phaseMod`: modulate phase angle linearly or radially

#### 5.7 Verify & Push

- Verify D computation matches manual box-counting for reference images
- Verify projection modes produce correct spatial transformations
- `git commit -m "Phase 5: Sweet-spot metrics, projections, modulation" && git push`

---

### PHASE 6 — REMAINING DISPLACEMENTS & POLISH
**Goal:** Complete the displacement catalogue and add remaining fill styles.

#### 6.1 Advanced Displacements

| # | Displacement | Formula |
|:--|:------------|:--------|
| 1 | **Smooth** | Single smooth sine/cosine curve |
| 2 | **Detach** | Topological surgery — cut along cell boundary |
| 3 | **Isometrize** | Isometric projection (link to projection param) |
| 4 | **Perspective** | 2-point perspective (link to projection param) |
| 5 | **V** | Half convex / half concave fold |

#### 6.2 Additional Fill Styles

| # | Style | Algorithm |
|:--|:------|:---------|
| 1 | **Ns** | Fill with N-height rects, decrement N |
| 2 | **Spiral** | Single spiral growing inward |
| 3 | **Bismuth** | Fill with spiral patterns (crystal appearance) |
| 4 | **BSP** | Binary space partition subdivision (from topology-heuristics §5.5) |
| 5 | **Distance** | Next cell = closest to start by Euclidean metric |

#### 6.3 Verify & Push

- Generate 4×4 matrix: fill styles × displacement types → visual diversity test
- `git commit -m "Phase 6: Full displacement catalogue & fill styles" && git push`

---

## 4. Unified Gap Tracker

Every item from all 4 source documents, deduplicated and assigned to a phase:

| ID | Gap | Source | Phase | Priority |
|:---|:----|:-------|:------|:---------|
| GAP-01 | Fill styles missing | A§3.1, B§2.1 | **P1** | 🔴 Critical |
| GAP-02 | Cell always square | A§3.2, B§2.1 | **P1** | 🔴 Critical |
| GAP-03 | No symmetry | A§3.3, B§2.2 | **P1** | 🟡 High |
| GAP-04 | No boundary styles (sticky/bouncy) | A§3.4, B§2.2 | **P2** | 🟡 High |
| GAP-05 | Only 1/11 displacements | A§3.5, B§2.3 | **P2+P6** | 🔴 Critical |
| GAP-06 | No explosion positioning | A§3.6, B§2.3 | **P2** | 🟡 High |
| GAP-07 | No texture modes | A§3.7, B§2.4 | **P4** | 🟡 High |
| GAP-08 | No interference control | A§3.8, B§2.4 | **P2** | 🟡 High |
| GAP-09 | No topology modes (torus) | A§3.9, B§2.4, C§2 | **P4** | 🟢 Medium |
| GAP-10 | Only 3 palettes | A§3.10, B§2.5 | **P4** | 🟢 Medium |
| GAP-11 | No line width variation | A§3.11, B§2.5 | **P4** | 🟢 Medium |
| GAP-12 | No spread control | A§3.12, B§2.5 | **P4** | 🟢 Medium |
| GAP-13 | No net structure (cloth) | A§3.13, B§2.6 | **P3** | 🔴 Fundamental |
| GAP-14 | No iterative physics sim | A§3.14, B§2.6 | **P3** | 🔴 Fundamental |
| SSoT-1 | Simplex/Perlin mandate | A§5.1, B§5.1 | **P0** | 🔴 Critical |
| SSoT-2 | Dual-Engine paradigm stale | A§5.2, B§5.2 | **P0** | 🔴 Critical |
| SSoT-3 | Fidenza/Spatial Hashing refs | A§5.3, B§5.3 | **P0** | 🟡 High |
| SSoT-4 | Opacity stacking contradiction | A§5.4, B§5.4 | **P0** | 🟡 High |
| TOP-1 | Surface identification (torus/Klein/RP²) | C§2 | **P4** | 🟡 High |
| TOP-2 | Projection atlas | C§3 | **P5** | 🟢 Medium |
| TOP-3 | Anti-tangling as planarity enforcer | C§4.3 | **P3** | Already exists → document |
| TOP-4 | Riley parametric modulation | C§5.1 | **P5** | 🟢 Medium |
| TOP-5 | BSP fill style (Mondrian) | C§5.5 | **P6** | 🟢 Medium |
| TOP-6 | Lacanian RP² uncanny mode | C§5.7 | **P4** | 🟢 Low |
| SS-1 | Fractal D computation | D§4.3 | **P5** | 🟢 Medium |
| SS-2 | β₁ approximation | D§4.4 | **P5** | 🟢 Medium |
| SS-3 | Density metric (ρ) | D§6.1 | **P5** | 🟢 Low |
| SS-4 | Compressibility metric (κ) | D§6.1 | **P5** | 🟢 Low |
| SS-5 | Sweet-spot dashboard | D§6.2 | **P5** | 🟢 Medium |
| SS-6 | λ_eros parameter | D§3.2 | **P3** | 🟢 Medium |
| COLOR-1 | Position-deterministic color | A§4.7 | **P1** | 🟡 High |
| PACK-1 | packDensity parameter exposure | A§3.2, B§3.2 | **P1** | 🟢 Medium |
| UI-1 | Remove 3D canvas | User directive | **P0** | 🔴 Critical |
| UI-2 | Remove Concept tab | User directive | **P0** | 🟡 High |
| UI-3 | Remove non-Kovach method scripts | User directive | **P0** | 🔴 Critical |

**Total: 33 items across 7 phases (P0–P6). Zero items overlooked.**

---

## 5. Resolved Decisions

| # | Question | Decision |
|:--|:---------|:---------|
| 1 | Concept tab | **DELETE** entirely from HTML |
| 2 | SimplexNoise | **DELETE** — follow new heuristics, stale code must go |
| 3 | Gallery backward compat | **Brand new** gallery — old saves are irrelevant |
| 4 | Phase 3 cloth simulation | **All brand new** — clean-room implementation. `edifice-v3.js` goes to `_legacy/` |

> [!NOTE]
> Keep: Animation system (defer to later), import/export functionality, gallery UI styling.

---

## 6. Verification Plan

### Per-Phase Automated Checks
| Phase | Test |
|:------|:-----|
| P0 | App loads, no console errors, only Kovach in method list, gallery works |
| P1 | Each fill style fills grid 100% (no gaps). Symmetry is pixel-perfect mirror. |
| P2 | All displacements preserve canvas bounds. No strokes outside viewport. |
| P3 | Torn web effect visible at force=5000, springK=0.5. Anti-tangling prevents Z-order violations. |
| P4 | Torus creates seamless pattern. All texture×topology combos render without error. |
| P5 | D ∈ [1.3, 1.5] for typical seed. Metrics display correctly. |
| P6 | 4×4 matrix (fill×displacement) generates visual variety. |

### Performance Guardrail
Every render must complete in **≤2000ms** at 1024×1024. If net simulation exceeds this, reduce default `simSteps` or `meshDensity`.

### Visual Reference
Compare output against [Edifice prints at bendotk.com](https://bendotk.com/writing/edifice) after each phase.
