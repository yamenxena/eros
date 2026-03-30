# Edifice Heuristics — Deep Audit & v3 Development Roadmap

> *Living reference document for the Eros generative engine.*
> *Governs the Edifice method family: v1, v2 (Kovach), and the forthcoming v3.*

---

## Part I — Mereological & Ontological Taxonomy

### 1.1 Philosophical Foundation

The Edifice method rejects top-down canvas composition. It is grounded in **Mereological Tectonics** (Koehler) and **Object-Oriented Ontology** (Garcia, DeLanda). The canvas is never treated as a "whole" that is subdivided. Instead, the final image is the *terminal accumulation* of autonomous **Ultimate Parts** interacting through strictly local, extrinsic relations.

Key principles:
- **Part-to-Part, never Part-to-Whole.** Each grid cell (Enclosure) is a sovereign entity. It does not ask the canvas for instructions.
- **Space is not void.** Every pixel of bounding geometry is an active computational entity exerting forces (attraction, repulsion, friction) onto traversing ink vectors.
- **Extrinsic relations only.** Parts connect, collide, and react without losing their individual mathematical identities (DeLanda's Assemblage Theory).

### 1.2 The Ontological Hierarchy (Edifice v2)

The method operates across five strict ontological levels. Each level depends exclusively on the level below it. No level references the "global canvas" directly.

```
Level 0 — THE SEED (PRNG State)
│   The deterministic origin. All entropy flows from a single integer seed.
│   Every downstream decision is a pure function of this seed.
│
├── Level 1 — THE PACK (Space Partitioning)
│   │   Int8Array matrix. Stochastic rectangle packing.
│   │   Output: Array of Enclosures {gx, gy, gw, gh}
│   │
│   ├── Level 2 — THE NET (Force Field)
│   │   │   Inverse-square repulsor pool. Global explosion positions.
│   │   │   Output: Array of Explosions {x, y, force}
│   │   │
│   │   ├── Level 3 — THE CLOTH (Mesh Generation)
│   │   │   │   Per-enclosure vertex grid. Spring links between nodes.
│   │   │   │   Output: {nodes[], links[]} per enclosure
│   │   │   │
│   │   │   ├── Level 4 — THE LIMITS (Physics Simulation)
│   │   │   │   │   Velocity integration. Spring constraint solving.
│   │   │   │   │   Boundary enforcement (Sticky / Bounce).
│   │   │   │   │
│   │   │   │   └── Level 5 — THE HATCH (Rendering)
│   │   │   │           Displacement warping. Sketch noise. Final stroke.
│   │   │   │           Output: Canvas pixel data
```

### 1.3 What v2 Has vs. What the Taxonomy Demands

| Taxonomy Requirement | v2 Status | Gap |
|:---|:---|:---|
| N-Descending stochastic packing | ✅ Implemented (3 algorithms) | — |
| Inverse-square repulsor fields | ✅ Implemented | Force magnitude range is hardcoded (800–4500) |
| Affine displacement matrices | ✅ Implemented (Twist/Sharp/Shift) | Missing: "Squish" (parity-based trapezoidal shear) |
| Cloth spring-link topology | ✅ Implemented | Spring constant `springK` is hardcoded (0.5) |
| Anti-tangling constraint | ✅ Implemented | — |
| Boundary styles (Modern/Explosive) | ✅ Implemented | Bounce energy hardcoded (−0.5) |
| RK4 integration for hatching | ❌ **Missing** | v2 uses simple `lineTo` segments, not RK4 curves |
| Topological density analysis (TDA/Betti) | ❌ **Missing** | No awareness of local ink density collapse |
| Localized phase-driven flow field per enclosure | ❌ **Missing** | Each enclosure has no `phase` property |
| Mass-dependent line density | ❌ **Missing** | All enclosures render identical mesh density regardless of area |
| Color stability across parameter changes | ❌ **Broken** | Color is tied to PRNG consumption order, not to enclosure identity |
| Controllable spring elasticity | ❌ **Missing** | `springK` and `damp` are not exposed as parameters |
| Controllable force magnitude | ❌ **Missing** | Explosion force range is internal |

---

## Part II — Formula Derivations

### 2.1 Inverse-Square Repulsion

The core force model governing mesh deformation:

```
F⃗(node, explosion) = explosion.force / (|r⃗|² + ε)  ×  r̂

Where:
  r⃗ = node.position − explosion.position
  |r⃗|² = dx² + dy²
  ε = 1  (softening constant, prevents division by zero)
  r̂ = r⃗ / |r⃗|  (unit direction vector)
```

**In code (v2, line 386–396):**
```javascript
const dx = node.x - exp.x;
const dy = node.y - exp.y;
const distSq = dx * dx + dy * dy + 1;        // ε = 1

if (distSq < exp.force * 60) {                // influence radius cutoff
    const force = exp.force / distSq;          // F = m / r²
    const dist = Math.sqrt(distSq);            // |r⃗|
    fx += (dx / dist) * force;                 // F⃗_x = r̂_x × F
    fy += (dy / dist) * force;                 // F⃗_y = r̂_y × F
}
```

**Behavior:** As a node approaches the explosion center, `distSq → ε`, so `force → exp.force / ε`. The force is bounded by `ε` but still extremely large at close range, producing the violent "blast crater" displacement.

**Cutoff radius:** `distSq < exp.force × 60`. For a force of 4500, this means the explosion influences nodes within `√(270000) ≈ 520px` radius.

### 2.2 Hooke's Law Spring Constraint (Cloth Links)

Each link stores a `dist` (rest length). The spring correction is:

```
Δ = (|current_dist| − rest_dist) / |current_dist|

correction⃗ = direction⃗ × Δ × 0.5 × springK

node1.position += correction⃗
node2.position −= correction⃗
```

**In code (v2, line 404–414):**
```javascript
const dx = link.n2.x - link.n1.x;
const dy = link.n2.y - link.n1.y;
const dist = Math.sqrt(dx * dx + dy * dy) || 1;
const diff = (dist - link.dist) / dist;        // normalized overshoot

const ox = dx * diff * 0.5 * springK;          // half-correction per node
const oy = dy * diff * 0.5 * springK;

link.n1.x += ox;  link.n1.y += oy;             // push node1 toward node2
link.n2.x -= ox;  link.n2.y -= oy;             // push node2 toward node1
```

**Why the "torn web" effect works:** When `springK = 0.5`, the spring only corrects 25% of the overshoot per step (`0.5 × 0.5 = 0.25`). If the explosive force displaces a node by 200px in one step, the spring pulls it back only ~50px. Over 25 simulation steps, the explosive force and spring correction reach an equilibrium where nodes near the blast are pushed far apart while nodes far from the blast barely move. The *links* connecting these disparate nodes still render as straight lines, creating the visual "tear".

### 2.3 Velocity Integration & Damping

```
node.velocity += accumulated_force    (from all explosions)
node.position += node.velocity
node.velocity *= damp                 (damp = 0.85)
```

`damp = 0.85` means each step loses 15% of velocity. Over 25 steps: `0.85²⁵ ≈ 0.017`, so initial velocity decays to ~1.7% by the end. This prevents oscillation and produces a single "blast + settle" motion.

### 2.4 Affine Displacement Matrices

**Twist** — Polar coordinate rotation proportional to distance:
```
dist = √(dx² + dy²)
θ' = atan2(dy, dx) + dist × 0.0005
x' = cx + cos(θ') × dist
y' = cy + sin(θ') × dist
```
Creates a spiral distortion centered on (cx, cy). Points farther from center rotate more.

**Sharp** — Power-law scaling with sign preservation:
```
x' = x + sign(dx) × |dx|^0.95 × 0.08
y' = y + sign(dy) × |dy|^0.95 × 0.08
```
The exponent 0.95 (< 1.0) compresses large distances, creating a brutalist "folding" along 45° fault lines.

**Shift** — Sinusoidal cross-axis perturbation:
```
x' = x + sin(y × 0.02) × 15
y' = y + cos(x × 0.02) × 15
```
Creates a wave-like warping pattern with period ≈ 314px and amplitude ±15px.

**Missing from v2 — Squish** (described in taxonomy):
```
rowParity = floor(py × 0.04) % 2
squishScale = (rowParity === 0) ? 1.4 : 0.6

x' = cx + dx × squishScale + torsionX
y' = cy + dy + torsionY
```
Creates alternating horizontal compression/expansion bands, producing a trapezoidal architectural rhythm.

### 2.5 Anti-Tangling Constraint

Prevents horizontal links from crossing (node1.x > node2.x) and vertical links from inverting (node1.y > node2.y):

```javascript
if (link.isHorizontal && link.n1.x > link.n2.x - 0.1) {
    let mid = (link.n1.x + link.n2.x) / 2;
    link.n1.x = mid - 0.05;
    link.n2.x = mid + 0.05;
}
```

This preserves the topological ordering of the mesh even under extreme deformation. Without it, links would visually cross each other, destroying the "fabric" illusion.

---

## Part III — The Color Stability Problem

### 3.1 Current Behavior (v2 — Broken)

In v2, each enclosure's color is assigned by consuming a PRNG value:

```javascript
const colIdx = Math.floor(prng.next() * palLen);  // line 146
const col = palette[colIdx];
```

This means the color of enclosure #N depends on the PRNG state *at the moment enclosure #N is processed*. But the PRNG state at that moment is affected by:
- The number of explosions generated (each consumes PRNG calls)
- The mesh subdivision density (each node consumes PRNG calls for Sqribble jitter)
- The sketch warp intensity (each link consumes PRNG calls)

**Result:** Changing `expCount`, `meshSubdivs`, or `sketchWarp` shifts the PRNG sequence consumed before color assignment, causing every enclosure to change color unpredictably.

### 3.2 The Fix for v3 — Deterministic Color from Enclosure Identity

Color must be a **pure function of the enclosure's grid position**, independent of PRNG consumption order.

**Strategy:** Use a secondary PRNG seeded from the enclosure's own coordinates:

```javascript
// Inside the enclosure processing loop:
const colorSeed = params.seed ^ (enc.gx * 7919 + enc.gy * 104729);
const colorPRNG = new PRNG(colorSeed);
const colIdx = Math.floor(colorPRNG.next() * palLen);
const col = palette[colIdx];
```

This way:
- Each enclosure's color is determined solely by its (gx, gy) position and the master seed
- Changing explosion count, mesh density, physics, or warp has **zero effect** on color assignment
- Colors remain stable across all parameter tweaks except seed and palette changes

### 3.3 Where Color Should Be Controlled

| Parameter | Should Affect Color? | Reason |
|:---|:---|:---|
| Seed | ✅ Yes | Different seed = different composition = different colors |
| Palette selection | ✅ Yes | Direct color source |
| Grid Cols | ✅ Yes | Changes number/position of enclosures |
| Fill Style | ✅ Yes | Changes enclosure shapes/positions |
| Explosion Amount | ❌ No | Physics force, not visual identity |
| Mesh Subdivision | ❌ No | Internal texture density |
| Displacement Type | ❌ No | Post-render coordinate warp |
| Sketch Warp | ❌ No | Post-render jitter |
| Canvas Grain | ❌ No | Post-render noise layer |
| Line Weight / Alpha | ❌ No | Render styling |

---

## Part IV — The Torn Web Effect: Complete Mechanics

### 4.1 How Stretched Lines Create "Torn Space"

The torn web is the hallmark visual of Edifice. It is not achieved by deleting or breaking links. It emerges from the tension between two competing systems:

1. **Inverse-square explosions** push nodes apart with force proportional to `1/r²`
2. **Spring links** pull nodes back together with force proportional to `(dist − rest) × springK`

Nodes near the blast center receive enormous force (potentially thousands of pixels of displacement). Nodes far from the blast receive negligible force. The spring links connecting "blasted" nodes to "calm" nodes stretch dramatically.

When rendered, these stretched links appear as long, taut lines crossing empty space — the visual signature of a "tear".

### 4.2 Missing from v2 — What v3 Must Add

**4.2.1 — Controllable Spring Elasticity (`springK` parameter)**
Currently hardcoded at 0.5. At low values (0.1), the mesh becomes extremely loose and tears dramatically under minimal force. At high values (0.9), the mesh acts as a rigid body and resists tearing.

**4.2.2 — Controllable Damping (`damp` parameter)**
Currently hardcoded at 0.85. Lower values (0.5) create rapid energy dissipation — sharp, localized tears. Higher values (0.95) allow force to propagate further through the mesh, creating sweeping, wave-like deformations.

**4.2.3 — Controllable Simulation Steps**
Currently hardcoded at 25. More steps = more time for the system to reach equilibrium. Fewer steps = frozen mid-explosion chaos.

**4.2.4 — Force Magnitude Range**
Currently hardcoded (800–4500). Must be parameterized so the user can control from gentle perturbation (100) to catastrophic demolition (10000+).

**4.2.5 — Squish Displacement**
The taxonomy describes a "Squish" affine transform (parity-based horizontal scaling) that v2 does not implement. This creates alternating bands of compression/expansion.

**4.2.6 — RK4 Hatching Kernel**
The taxonomy mandates Fourth-Order Runge-Kutta integration for smooth, curved crosshatching within enclosures. v2 currently draws straight `lineTo` segments between spring nodes. An optional RK4 mode would drive localized flow-field hatching within each enclosure, creating the dense, plotter-emulation texture described in the taxonomy.

**4.2.7 — Phase per Enclosure**
Each enclosure should carry a unique `phase` value (derived from its position, not from PRNG consumption) that drives its internal flow-field direction when RK4 hatching is active.

**4.2.8 — Mass-Dependent Line Density**
Small enclosures should render proportionally more hatching lines than large ones. Formula from taxonomy:
```
lineCount = floor((15000 / √(mass)) × random)
where mass = enclosure.gw × enclosure.gh
```

**4.2.9 — Topological Density Awareness (TDA)**
A spatial density tracker that prevents "ink black holes" — areas where too many lines accumulate into an unreadable black mass. When local density exceeds a threshold, further strokes in that area are suppressed or redirected.

---

## Part V — Edifice v3 Development Specification

### 5.1 New Parameters (v3 additions)

| Key | Type | Label | Default | Range | Category |
|:---|:---|:---|:---|:---|:---|
| `springK` | range | Spring Rigidity | 0.50 | 0.05 – 1.0 | Physics |
| `damp` | range | Velocity Damping | 0.85 | 0.40 – 0.99 | Physics |
| `simSteps` | range | Sim Iterations | 25 | 5 – 100 | Physics |
| `forceMin` | range | Min Blast Force | 800 | 100 – 5000 | Physics |
| `forceMax` | range | Max Blast Force | 4500 | 1000 – 15000 | Physics |
| `bounceEnergy` | range | Bounce Energy | 0.50 | 0.1 – 1.0 | Physics |
| `hatchMode` | select | Hatch Mode | 'Spring Mesh' | Spring Mesh / RK4 Flow / Hybrid | Render |
| `hatchDensity` | range | Hatch Density | 1.0 | 0.1 – 5.0 | Render |
| `massDensity` | checkbox | Mass-Dependent Density | false | — | Render |
| `densityClamp` | range | Max Ink Density | 0 (off) | 0 – 100 | Render |

### 5.2 Color Stability Fix

Replace line 146 of v2:
```javascript
// OLD (PRNG-order dependent):
const colIdx = Math.floor(prng.next() * palLen);

// NEW (position-deterministic):
const colorSeed = params.seed ^ (enc.gx * 7919 + enc.gy * 104729);
const colorPRNG = new PRNG(colorSeed);
const colIdx = Math.floor(colorPRNG.next() * palLen);
```

### 5.3 Squish Displacement (New)

Add to `_displacePoint`:
```javascript
} else if (type === 'Squish') {
    const rowParity = Math.floor(py * 0.04) % 2;
    const squishScale = (rowParity === 0) ? 1.4 : 0.6;
    x = cx + dx * squishScale;
    // y unchanged — only horizontal shear
}
```

### 5.4 RK4 Hatching Mode (New)

When `hatchMode === 'RK4 Flow'`, instead of rendering spring links, the engine:
1. Assigns each enclosure a `phase` value derived from its position
2. Seeds a localized flow field: `derivative(lx, ly) = { cos(phase) + sin(ly×0.02), sin(phase) + cos(lx×0.02) }`
3. For each line, integrates the path using RK4:
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

### 5.5 Mass-Dependent Density

When `massDensity` is enabled:
```javascript
const mass = enc.gw * enc.gh;
const densityMultiplier = 1.0 / Math.sqrt(mass);
// Apply to mesh subdivision or line count
```
Small enclosures get exponentially denser hatching, creating the visual weight disparity described in the taxonomy.

### 5.6 Topological Density Clamping

When `densityClamp > 0`, the renderer tracks accumulated stroke density per spatial cell:
```javascript
const densityGrid = new Float32Array(gridW * gridH);
// Before each stroke:
const cellIdx = Math.floor(p.x / cellSize) + Math.floor(p.y / cellSize) * gridW;
if (densityGrid[cellIdx] > params.densityClamp) continue; // skip stroke
densityGrid[cellIdx] += params.lineAlpha;
```
This prevents local ink saturation without hard line-count limits, preserving mereological autonomy.

---

## Part VI — Aesthetic Identity: What Makes Edifice Unique

### 6.1 The Three Tensions

Edifice's aesthetic identity rests on the simultaneous tension between three opposing forces:

1. **Order vs. Chaos** — Rigid grid packing vs. explosive blast deformation
2. **Connectivity vs. Rupture** — Indestructible spring links vs. violent spatial displacement
3. **Density vs. Void** — Dense crosshatching vs. torn negative space

No other method in the Eros engine occupies this aesthetic territory. Fidenza is fluid and organic. Naon is maximalist and plastic. Edifice is **mechanical, brutal, and architectural**.

### 6.2 Visual Signatures to Preserve in v3

- **Grid outlines visible as architectural scaffolding** — the container is always legible
- **Crosshatch density varies by enclosure size** — small cells are dark and dense; large cells are light and airy
- **Torn spaces contain taut, stretched lines** — never empty void, always structural remnants
- **Color is stable and container-bound** — each enclosure "owns" its color permanently
- **Grain texture is a paper/plotter emulation** — never a digital effect

### 6.3 What v3 Adds to the Aesthetic

- **Controllable violence** — springK and damp let the user dial from "gentle architectural distortion" to "catastrophic structural failure"
- **Curved hatching** — RK4 mode adds flowing, organic crosshatch paths within the rigid grid, creating the contrast between soft interior texture and hard exterior boundary
- **Squish deformation** — adds an entirely new class of brutalist rhythm (alternating compression bands)
- **Ink density intelligence** — prevents the "black rectangles" that occur when many explosions overlap in small enclosures

---

## Part VII — Implementation Checklist for v3

- [ ] Create `edifice-v3.js` as a new file (do not modify v2)
- [ ] Register under `Eros Heuristics` category
- [ ] Copy v2 architecture as foundation
- [ ] **Fix color stability** — position-deterministic color assignment
- [ ] **Expose springK** as Physics parameter (0.05 – 1.0)
- [ ] **Expose damp** as Physics parameter (0.40 – 0.99)
- [ ] **Expose simSteps** as Physics parameter (5 – 100)
- [ ] **Expose forceMin/forceMax** as Physics parameters
- [ ] **Expose bounceEnergy** as Physics parameter
- [ ] **Add Squish** to displacement options
- [ ] **Add RK4 Flow hatch mode** alongside existing Spring Mesh
- [ ] **Add mass-dependent density** toggle
- [ ] **Add density clamping** for TDA-inspired ink regulation
- [ ] **Add enclosure phase** (position-derived, not PRNG-dependent)
- [ ] Test with seed 834, grid 22, all displacement types
- [ ] Verify color stability when changing explosion count
- [ ] Verify no black-hole collapse at max explosions + min springK
