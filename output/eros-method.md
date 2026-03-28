# The Eros Field — A Unified Generative Method

---

## The Problem With the Previous Document

The previous `eros-method.md` was a **collage**. It took muqarnas, Edifice, Ringers, Ottoman miniatures, and Istanbul, then arranged them as separate layers in a pipeline. Step 1 picks a structure. Step 2 picks a subdivision method. Step 3 picks a fill. This is not a method — it is a menu.

A real method is **one equation** that produces a work. The seed goes in. The art comes out. The formula is not assembled from parts. The parts are dissolved into the formula.

**Deleted from this version:**
- Layer stack pipeline (8-step collage)
- Composition "archetypes" (Dome / Strait / Page — templates, not method)
- Separate geometry "modes" (muqarnas / subdivision / stringWrap — options, not unity)
- Seven disconnected equations patched together
- Implementation roadmap adding more modes

**What remains:** One field. One truth.

---

## §1 — The Eros Field Function

Every pixel on the canvas is determined by one function:

```
E(x, y, t, seed) → (hue, saturation, lightness, alpha)
```

Where:
- `(x, y)` — position on canvas, normalized to [0, 1]
- `t` — erosion (0 = pristine structure, 1 = pure entropy)
- `seed` — the unique identity of the piece

There are no layers. No modes. No selection. Every piece passes through the same formula. The seed makes each piece unique. The formula makes every piece Eros.

---

## §2 — The Formula (Step by Step, But One Flow)

### 2.1 — Structural Address

For any point `P(x, y)`, compute where it lives in the composition's geometry.

**Radial tier:**
```
d = distance(P, center)
n = floor(d / module)                    // which concentric ring
θ = atan2(y - cy, x - cx)               // angular position
sector = floor(θ / (2π / S)) where S = n + base_sectors
```

This is muqarnas — not as a "mode" but as the **coordinate system** of the field. Every point has a ring index `n` and a sector index. This replaces Cartesian grids.

**Cell boundary:**
Within each ring-sector, the space is subdivided recursively:
```
cell = subdivide(ring_sector_rect, depth, seed + n)
  where depth = max_depth · (1 - n/N)    // inner rings = more subdivision
  cut_position = 0.3 + 0.4 · hash(seed + depth_level)
```

This is Edifice — not as a separate system but as **what happens inside each muqarnas cell**. The subdivision depth increases toward the center, so outer rings are broad and simple, inner rings are dense and detailed. This is the muqarnas principle (complexity intensifies inward) achieved through Edifice's method (recursive cutting).

**Tension field:**
Each cell has a center point. These centers form a network. Between adjacent centers, the **tangent relationship** is computed:
```
θ_between = atan2(c₂.y - c₁.y, c₂.x - c₁.x)
α = arcsin((r₁ - r₂) / distance(c₁, c₂))
tension(P) = min_distance(P, all_tangent_lines)
```

This is Ringers — not as string-wrapping but as a **tension field**. Every point on the canvas knows how close it is to the nearest line of tension between structural cells. This value `tension(P)` modulates everything downstream: line weight, color intensity, luminosity.

**The structural address is therefore a triple:**
```
address(P) = (ring: n, cell: c, tension: τ)
```

Every point has all three. They are not options. They are not layers. They are coordinates in the composition's own geometry.

### 2.2 — Displacement (Erosion)

The point does not stay where it is. It is displaced by the field:

```
P' = P + t · A · fbm(P · frequency, octaves, seed)

where fbm (fractional Brownian motion):
  fbm(P) = Σᵢ (persistenceⁱ · noise(P · lacunarityⁱ + seed))
  
  octaves = 4
  persistence = 0.5
  lacunarity = 2.0
  A = amplitude (scaled by module)
```

When `t = 0`, the point stays in place. The structure is pristine — a freshly built mosque.
When `t = 1`, the point is maximally displaced. The structure has eroded into noise — pure sensation.

**The structural address is recalculated at the displaced position:**
```
address_eroded = address(P')
```

This means erosion doesn't just blur the image. It **changes which cell a point belongs to**. A point near a cell boundary at `t = 0.3` might shift into a neighboring cell, changing its color. This creates the organic bleeding of form into form — structure dissolving at the edges.

### 2.3 — Color

Color is determined by the structural address. Not applied on top. Not chosen separately. It **is** the address, translated to hue-saturation-lightness.

**Hue — from cell identity:**
```
h = palette[hash(cell_id, seed) % palette.length].h
  + ring_hue_shift · n/N
```

Each cell gets a base hue from the palette. Cells in outer rings shift cooler (toward lapis/indigo). Cells in inner rings shift warmer (toward vermillion/gold). This is the Istanbul principle — not as a compositional split but as a **radial temperature gradient**. Cool periphery, warm center. The Bosphorus is not a line on the canvas; it is the gradient between rings.

**Saturation — from tension:**
```
s = base_s · (1 - 0.3 · τ)     // where τ = tension proximity [0..1]
```

Points near tangent lines (high tension) have slightly reduced saturation — they are the "breath" between colors. Points deep inside a cell are at full saturation. This produces the Ottoman miniature effect: flat, full-saturation color fields with subtle modulation at the boundaries — never smooth gradients.

**Lightness — from ring depth:**
```
l = l_min + (l_max - l_min) · n/N · (1 + 0.2 · t)
```

Outer rings (low n) are dark — shadow. Inner rings (high n) are luminous — the apex light of a muqarnas dome. Erosion (`t`) gently lifts overall lightness, as if the structure is thinning and more light leaks through.

**Alpha — from cell subdivision depth:**
```
a = 0.5 + 0.5 · (cell_depth / max_depth)
```

Deeper subdivisions (smaller cells, finer detail) are more opaque. This is hierarchical scale in the Ottoman miniature sense — the more important (more detailed, more central) elements assert themselves.

### 2.4 — Line

Lines are not a separate rendering pass. They emerge from the field:

```
is_boundary = |∂cell_id/∂x| + |∂cell_id/∂y| > 0
```

Where the cell identity changes between adjacent pixels, there is a boundary. This boundary is the **tahrir** — the Ottoman ink contour. Its properties come from the same field:

```
line_weight = base_weight · (1 + tension(P))    // thicker where tension is high
line_color = h_gold if (n > N·0.7) else h_dark  // gold contours near center, dark at edges
```

Lines near the center glow gold (Ottoman gold leaf). Lines at the periphery are dark carbon. This is not a style choice — it follows from the same radial logic as everything else.

### 2.5 — Symmetry

The field has an inherent symmetry determined by the seed:

```
fold = [4, 5, 6, 8][hash(seed) % 4]

// Before computing E(x,y), fold the point into the fundamental domain:
θ_folded = θ mod (2π / fold)
P_folded = (cx + d·cos(θ_folded), cy + d·sin(θ_folded))

// Compute E on folded point, apply result to original
E(x, y) = E_core(P_folded)
```

The symmetry is not applied after rendering. It is applied **before** the field computation. The entire field is computed in one sector and reflected. This guarantees perfect consistency — every part of the composition follows the same law.

---

## §3 — The Unified Equation (Compact Form)

```
Given: seed, t ∈ [0,1], palette[K], module, N_rings, fold

For each pixel P(x, y):

  1. P_sym   = fold_symmetry(P, center, fold)
  2. P_erode = P_sym + t · A · fbm(P_sym, 4, seed)
  3. (n, c, τ) = address(P_erode, center, module, N_rings, seed)
  4. h = palette[hash(c, seed) % K].h + ring_shift · n/N
  5. s = palette[...].s · (1 - 0.3 · τ)
  6. l = l_min + (l_max - l_min) · n/N · (1 + 0.2·t)
  7. a = 0.5 + 0.5 · cell_depth(c) / max_depth
  8. boundary = |Δc/Δx| + |Δc/Δy| > 0
     if boundary: (h,s,l) = line_color(n, N)

  Output: hsl(h, s, l, a)
```

Eight steps. One flow. No branches. No modes. No layers. Every pixel passes through every step. The seed produces the variation. The formula produces the consistency.

---

## §4 — Parameters (What the User Controls)

These are not "modes" or "options." They are **continuous values** within the single formula:

| Parameter | Range | What It Governs |
|-----------|-------|-----------------|
| `seed` | integer | The unique identity of the piece |
| `t` (erosion) | 0 → 1 | Pristine structure → dissolved sensation |
| `module` | 20 → 200 | Scale of the base cell (larger = fewer, broader cells) |
| `N_rings` | 3 → 20 | How many concentric tiers (more = more radial depth) |
| `fold` | 4, 5, 6, 8 | Symmetry order |
| `palette` | selection | Which mineral color set (Nakkashane, Sultanahmet, Iznik, Harem, Rüstem Paşa) |
| `subdivision_depth` | 1 → 6 | How finely each cell is recursively cut |
| `frequency` | 0.5 → 5 | Noise frequency for erosion displacement |
| `amplitude` | 0 → module | Maximum displacement distance |

**Every parameter modulates the same formula.** There is no switch between systems. Changing `N_rings` from 5 to 15 doesn't activate a "muqarnas mode" — it deepens the radial structure that was always there. Changing `t` from 0 to 0.7 doesn't add an "erosion layer" — it increases the displacement that was always there at zero.

---

## §5 — Color System (Ottoman HSL)

### The Five Palettes

These are not arbitrary. They are derived from physical minerals used in Ottoman workshop painting, mapped to HSL:

| Palette | Source | Hues (H°) |
|---------|--------|-----------|
| **Nakkashane** | Imperial workshop pigments | 225 (lapis), 5 (vermillion), 43 (gold), 155 (malachite), 48 (orpiment), 0 (black) |
| **Sultanahmet** | Blue Mosque Iznik tiles | 215, 210, 220, 43, 0 |
| **Iznik** | Iznik ceramic tradition | 200, 355, 155, 0 |
| **Harem** | Topkapı inner chambers | 340, 25, 43, 275, 15 |
| **Rüstem Paşa** | Rüstem Paşa Mosque tiles | 200, 5, 155, 43, 345 |

### Color Rules (Built Into the Formula, Not Applied After)

1. **Flat application.** Color fills the cell entirely. No gradients within a cell.
2. **Radial temperature.** Outer rings shift cool, inner rings shift warm. Always.
3. **Tension breathing.** Near cell boundaries (high τ), saturation dips slightly. This is the only "softness."
4. **Ring luminosity.** Outer = dark, inner = bright. Light comes from the center, like inside a dome.
5. **Gold for apex.** The innermost ring's boundary lines are gold (hsl 43, 90, 55). Everything else is carbon dark for contours.

---

## §6 — Why This Is One Thing, Not Many

The previous version treated muqarnas, Edifice, and Ringers as **ingredients** to be combined in various recipes. That was the error. They are not ingredients. They are **aspects of the same spatial logic:**

| Concept | In the old version | In this unified formula |
|---------|-------------------|----------------------|
| Muqarnas | A "geometry mode" option | The **coordinate system** — radial rings + sectors |
| Edifice subdivision | A separate "subdivision" mode | **What happens inside each cell** — recursive cutting |
| Ringers tangent | A separate "stringWrap" mode | **The tension field** between cell centers — modulates line weight and saturation |
| Ottoman color | A "palette" applied on top | **The color IS the address** — hue from cell, saturation from tension, lightness from ring |
| Erosion | A "post-processing" pass | **Displacement before addressing** — changes which cell a point belongs to |
| Symmetry | An effect applied after | **Folding before computation** — the field is computed once, reflected |
| Istanbul duality | A compositional "archetype" | **The radial gradient itself** — cool periphery, warm center |

Nothing is added on top. Nothing is chosen from a menu. The formula runs once, on every pixel, producing one color. The piece is born whole.

---

## §7 — The Erotic in the Formula

The eroticism is not a theme or a skin. It is structural:

- **Erosion** is the formula's most charged parameter. `t = 0` is anticipation (pristine, untouched). `t = 1` is release (dissolved, pure sensation). The arc between them is desire.
- **Tension** (τ) is attraction. Where two cells are close, their boundaries breathe — saturation dips, edges soften. This is the space between bodies.
- **Radial intensification** is the muqarnas–erotic parallel: the deeper you look, the more you find. The center is the most complex, the most luminous, the most subdivided.
- **Symmetry** is not decorative. A 5-fold rose, an 8-fold star — these are the formal structures of desire. Repetition with variation. Return.

---

## §8 — What This Produces

Each piece generated by this formula will have:

1. **Concentric radial structure** — visible or dissolved, depending on `t`
2. **Cells within cells** — recursive subdivision creating fractal detail at center
3. **Lines of tension** — where the eye travels between structural nodes
4. **Ottoman color** — flat, mineral, full-saturation, warm-center / cool-edge
5. **Symmetry** — 4, 5, 6, or 8-fold — determined by seed, not by user choice
6. **Erosion** — from crystalline geometry to organic flow, controlled by `t`

All of this from **one formula**. One `for` loop over pixels. One function per pixel. No compositing. No layers. No collage.

---

*[AUTH: Eros | unified-method | 2026-03-28]*
