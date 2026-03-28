# Eros Reference Analysis — Edifice & Ringers

**Two Art Blocks pieces define the Eros direction. Everything else is noise.**

---

## §1 — Edifice #834 (Ben Kovach)

[OpenSea](https://opensea.io/item/ethereum/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/204000834) · Art Blocks Curated · Series 5 · 976 editions

### Philosophy

> "Massive, deteriorating structures built on strange terrain."

Edifice is about **construction and erosion** — buildings that are conceptualized, built, and weathered by algorithmic forces. The tension is between the rational (the grid, the rectangle, the structure) and the organic (noise, displacement, entropy). This is architecture as ruin.

**For Eros:** This maps directly to the architect-philosopher. Structure (geometry, grids, tessellations) meets erosion (noise fields, vector displacement, particle forces). The erotic reading: desire builds something, entropy wears it away, and what remains is beautiful because it is imperfect.

### Algorithm (Reconstructed from Kovach's Blog + Research)

#### Step 1: Rectangular Subdivision

The canvas starts as one rectangle. It is recursively cut:

```
function subdivide(rect, depth) {
  if (depth == 0 || tooSmall(rect)) return [rect];
  // Choose cut axis — weighted toward maintaining square aspect ratio
  const cutVertical = (rect.w / rect.h > 1) ? probability(0.7) : probability(0.3);
  // Choose cut position with slight randomness
  const t = 0.3 + random() * 0.4;  // never exactly center
  if (cutVertical) {
    return [...subdivide(left(rect, t), depth-1),
            ...subdivide(right(rect, t), depth-1)];
  } else {
    return [...subdivide(top(rect, t), depth-1),
            ...subdivide(bottom(rect, t), depth-1)];
  }
}
```

**Equation:** Each rectangle `R(x, y, w, h)` splits into two children. The cut position `t ∈ [0.3, 0.7]` — never centered, always slightly off, producing the organic-architectural feel.

#### Step 2: Fill Styles (Grid Pattern Assignment)

How rectangles are selected to "build" the structure:

| Fill Style | Algorithm | Character |
|-----------|-----------|-----------|
| **Random Walk** | Start random cell → grow by adjacent cells | Organic growth, like moss |
| **Distance** | Fill outward from center by Euclidean distance | Radial, symmetrical |
| **Manhattan** | Fill by Manhattan distance (`|dx| + |dy|`) | Grid-aligned, architectural |
| **Chebyshev** | Fill by Chebyshev distance (`max(|dx|, |dy|)`) | Diamond/square growth |
| **Bismuth** | Spiral growth patterns | Crystal-like |

**For Eros:** We already have Voronoi and Delaunay. We need **recursive subdivision + fill-style selection** as a new geometry mode.

#### Step 3: Net Structures + Texturization

Each filled rectangle becomes a "net" — an inner pattern:

| Texture | How |
|---------|-----|
| **Lattice** | Grid of connected lines within the rectangle |
| **Lattice (Hatched)** | Cross-hatched parallel lines |
| **Sqribble** | Scribbled lines (random walk inside rectangle) |

Each net is then subjected to **displacement by a vector field**:

```
// For each point in the net:
displaced_x = x + vectorField.x(x, y) * displaceStrength;
displaced_y = y + vectorField.y(x, y) * displaceStrength;

// Vector field is Perlin/Simplex noise:
vectorField.x(x, y) = noise2D(x * freq, y * freq) * amplitude;
vectorField.y(x, y) = noise2D(x * freq + 1000, y * freq + 1000) * amplitude;
```

**This is the erosion.** The clean geometry is distorted by noise — the structure decays.

#### Step 4: Explosions (Physical Simulation)

Random "explosion" points are placed on the grid. Nets near these explosions respond to forces:

```
// For each net point, for each explosion:
F = explosionForce / distance²;  // inverse square
point.x += F * normalize(dx);
point.y += F * normalize(dy);
```

Explosion positions: Central, Rect Centers, Random, Grid Centers.

#### Step 5: Convex Hull Line Drawing

For high-quality, tactile line rendering (linocut aesthetic):

```
for each pair of adjacent path points (p1, p2):
  dots1 = generateDisc(p1, radius, n=10);  // random dots in disc
  dots2 = generateDisc(p2, radius, n=10);
  hull = convexHull(dots1 ∪ dots2);        // compute hull
  fillPolygon(hull);                       // filled shape
```

This produces thick, irregular, organic lines — never clean vector paths.

#### Step 6: Symmetry

After all geometry is computed:
- Horizontal mirror
- Vertical mirror
- Radial (rotational) symmetry
- Random (each quadrant can differ)

#### Step 7: Color Palette (Kovach's Method)

> "I paint physically, photograph it, then sample colors from the painting."

Colors from a single physical source are inherently harmonious because they share lighting, medium, and pigment interaction. This produces palettes that feel warm and real, not digital.

**For Eros:** This validates our image-extraction palette feature. The user drops a painting/photograph → extracts harmonious colors → applies to composition. This IS Kovach's method.

---

## §2 — Ringers #109 (Dmitri Cherniak)

[OpenSea](https://opensea.io/item/ethereum/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13000109) · Art Blocks Curated · Series 2 · 1000 editions

### Philosophy

> "There are an almost infinite number of ways to wrap a string around a set of pegs."

Ringers is about **constraint and emergence** — a simple rule (wrap a string around pegs, don't cross) produces infinite variety. Inspired by Swiss designer Armin Hoffman's graphic principles: economy of means, maximal variety from minimal rules.

**For Eros:** This is the golden ratio principle — beauty from constraint. A single rule, iterated, produces complexity indistinguishable from intention. The erotic reading: tension is created by the string pulling between pegs, the tautness, the way the line wraps and embraces each form.

### Algorithm (Reconstructed from DIY Ringers + Research)

#### Step 1: Peg Grid

Place circular pegs on a grid:

```
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x = margin + col * spacing + jitter * random();
    const y = margin + row * spacing + jitter * random();
    const r = baseRadius + random() * radiusVariation;
    pegs.push({ x, y, r });
  }
}
```

Variations: peg count (4–20+), uniform vs varied radii, grid vs random placement, jitter.

#### Step 2: External Tangent Lines Between Circles

The core geometry. For two circles `C₁(x₁, y₁, r₁)` and `C₂(x₂, y₂, r₂)`:

**External tangent** (string wraps same side of both pegs):

```
dx = x₂ - x₁
dy = y₂ - y₁
d = √(dx² + dy²)

// Angle of center-to-center line
θ = atan2(dy, dx)

// Tangent angle offset
α = asin((r₁ - r₂) / d)    // for external tangent
// or
α = asin((r₁ + r₂) / d)    // for internal (cross) tangent

// Tangent touch points:
touchPoint1 = (x₁ + r₁ · cos(θ + π/2 + α), y₁ + r₁ · sin(θ + π/2 + α))
touchPoint2 = (x₂ + r₂ · cos(θ + π/2 + α), y₂ + r₂ · sin(θ + π/2 + α))
```

**Key equations:**
```
External tangent:  α = arcsin((r₁ − r₂) / d)
Internal tangent:  α = arcsin((r₁ + r₂) / d)
Touch point:       P = (center.x + r·cos(θ ± π/2 + α),
                        center.y + r·sin(θ ± π/2 + α))
```

#### Step 3: String Wrapping (Path Construction)

The algorithm builds a continuous path:

```
1. Start at a peg (random or first)
2. Choose wrapping direction (CW or CCW)
3. Find next peg to wrap:
   - Compute tangent lines to all candidate pegs
   - Filter: tangent must not intersect any existing path segment
   - Select: nearest valid candidate (or random weighted by distance)
4. Draw arc on current peg (from current angle to tangent departure angle)
5. Draw straight line (tangent) to next peg
6. Arc arrives on next peg at tangent arrival angle
7. Repeat from step 2 until all pegs visited or max iterations
```

**Non-intersection constraint:** After each line segment, check that it doesn't cross any previous segment. This is computationally expensive but critical — it's what makes the result beautiful and not chaotic.

```
function segmentsIntersect(a1, a2, b1, b2) {
  // Standard line-line intersection test
  const d1 = cross(b2-b1, a1-b1);
  const d2 = cross(b2-b1, a2-b1);
  const d3 = cross(a2-a1, b1-a1);
  const d4 = cross(a2-a1, b2-a1);
  return (d1*d2 < 0) && (d3*d4 < 0);
}
```

#### Step 4: Arc Rendering

On each peg, the string wraps around as an arc:

```
ctx.arc(peg.x, peg.y, peg.r, startAngle, endAngle, counterclockwise);
```

The beauty is in the arc → tangent → arc → tangent rhythm — it creates organic, flowing forms from purely geometric computation.

#### Step 5: Color

Ringers is primarily monochrome (black string on white). Color is rare and subtle:
- Some editions have colored pegs
- Some have colored string (gradient along path)
- Background color varies (cream, grey, black)
- Rare: multicolored string sections

**For Eros:** Color restraint is powerful. Not everything needs 12 colors. Some compositions should be near-monochrome with one accent. This is a lesson in palette discipline.

---

## §3 — Equations Summary for Eros Implementation

### From Edifice

| Equation | What It Does |
|----------|-------------|
| `subdivide(R, depth)` with `t ∈ [0.3, 0.7]` | Recursive rectangle splitting |
| `fill(grid, style, startPoint)` | Fill pattern: walk, distance, manhattan, chebyshev, spiral |
| `displace(point, noiseField)` — `p' = p + noise(p) · strength` | Erosion / weathering |
| `explosion(points, center, force)` — `F = k/d²` | Physical disruption |
| `convexHull(disc₁ ∪ disc₂)` | Organic line rendering |
| `symmetry(structure, mode)` | Mirror/radial duplication |

### From Ringers

| Equation | What It Does |
|----------|-------------|
| `tangentAngle = arcsin((r₁ − r₂) / d)` | External tangent between circles |
| `touch = center + r · (cos(θ±π/2+α), sin(θ±π/2+α))` | Where string meets peg |
| `cross(b-a, c-a) < 0 ↔ > 0` | Line segment intersection test |
| `arc(cx, cy, r, θ_start, θ_end)` | String wrapping around peg |
| Non-crossing constraint | Path must never self-intersect |

---

## §4 — What This Means for Eros Engine

### New Geometry Modes to Add

1. **Rectangular Subdivision** (from Edifice)
   - Recursive split with weighted cut positions
   - Fill styles: walk, distance, manhattan, chebyshev, spiral
   - Noise-based displacement (erosion)

2. **String Wrap / Ringers** (from Cherniak)
   - Peg grid + tangent line computation
   - Non-intersection constraint
   - Arc + tangent path building

### Enrichments to Existing Layers

| Layer | Enrichment |
|-------|------------|
| **Base Field** | Add vector field displacement (Edifice erosion method) |
| **Geometry** | Add `subdivision` and `stringWrap` types |
| **Post** | Add convex hull line rendering mode (Edifice quality) |
| **Attractor** | Add symmetry modes (horizontal, vertical, radial) |

### Color Philosophy Update

1. **Image extraction is validated** — Kovach's master technique
2. **Add monochrome mode** — Ringers teaches restraint
3. **Physical painting → digital sampling** is the gold standard for palette creation

### Concept/Theme

| Edifice | Ringers | Eros Synthesis |
|---------|---------|----------------|
| Construction + erosion | Constraint + emergence | Desire builds, entropy erodes, beauty remains |
| Architecture as ruin | String as embrace | Structure and intimacy |
| Grid → noise → decay | Grid → tangent → wrap | Order → chaos → beauty |
| Physical → organic lines | Geometric → flowing paths | Mathematical → sensual |
| Maximal variation | Minimal rules | Economy of means, maximal variety |

---

*[AUTH: Eros | reference-analysis | 2026-03-28]*
