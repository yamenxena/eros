# Deep Think: Art Analysis — Edifice (Art Blocks #204, Ben Kovach)

Corrected and audited against [Ben Kovach's primary source](https://bendotk.com/writing/edifice).
Reference token: Edifice #834 (OpenSea `0xa7d8…/204000834`).

---

## 1. Algorithm Architecture

Edifice is a **purely 2D, flat** generative system. There is no 3D, no shadows, no perspective lighting. The entire process operates on an orthographic plane.

The pipeline proceeds in strict order:

```
Cell Grid → Fill Style → Net Construction → Explosions → Style (boundary) → Displacement → Symmetry → Texture Render
```

## 2. Cell Grid (Foundation)

- Every Edifice begins with a **rectangular cell grid** defined by two parameters:
  - **Cell Size**: area of each cell (Fine = smallest, Colossal = largest).
  - **Cell Aspect**: shape of each cell (Square, Tall, Extra Tall, Wide, Extra Wide).
- The grid is the invisible skeleton. It is NEVER rendered directly—it defines the coordinate space into which rectangles are packed.
- The cream/off-white background acts as visible "grout" between cells.

## 3. Fill Style (Rectangle Packing)

Fill Style determines how variable-size rectangles are packed into the cell grid. This is the PRIMARY compositional driver.

| Fill Style | Algorithm |
|---|---|
| **Random Walk** | Picks a random starting cell. Grows a rectangle outward until blocked by grid edges or filled cells. Then picks a neighboring cell from the shape's endpoint, chooses a new direction, grows a new rectangle. Repeats until grid is full. Most common style. |
| **Random** | Picks a random open cell on the grid and a direction, grows until blocked. Picks a new random open cell each time. |
| **Ns** | Picks N ∈ [1,8]. Fills rectangles of height/width = N. When stuck, decrements N until N=1 (fills remaining cells individually). N=1 produces a fully filled grid. |
| **Distance** | Grows from a start point outward, choosing the closest unfilled cell by Euclidean distance. |
| **Manhattan** | Same as Distance but using Manhattan distance. |
| **Chebyshev** | Same as Distance but using Chebyshev distance. |
| **Bismuth** | Fills the grid with spiral patterns. |
| **Spiral** | Fills the grid in a single inward-growing spiral. (Rare) |
| **Bars** | Builds equal-width columns/towers next to each other. (Rarest) |

> **Critical**: There is NO pre-defined "cross structure" or "trunk/flank" topology. Any cross-like appearance is an emergent artifact of the fill algorithm + explosion positioning.

## 4. Net Construction (Mass-Spring Lattice)

Each packed rectangle becomes a **net** — a mass-spring lattice:

- At every point where "ropes" cross, there is a **physical node with mass** that responds to forces.
- Connections between nodes **CANNOT break** but **CAN stretch infinitely**.
- The net lives entirely inside its rectangular container.
- Density depends on the Texture setting (Hatched nets are ~2× denser).

### Spring-Mass Physics Equations

```
F_spring = -k × (|d| - rest_length) × d̂     (k ≈ 0.5)
F_explosion = Σ force_i × (node - expl_i) / |node - expl_i|²
v(t+1) = v(t) × damping                      (damping ≈ 0.82)
x(t+1) = x(t) + v(t)
```

## 5. Explosions

Explosions are **invisible repulsive point forces** placed within the grid. They push net nodes outward, creating the signature distorted/compressed texture.

### Explosion Count
Determines how many explosion points exist.

### Explosion Position (8 strategies)

| Position | Algorithm |
|---|---|
| **Random** | Uniformly distributed across the canvas. |
| **Central** | Normally distributed around the horizontal center line. |
| **Rect Centers** | Near the center of randomly selected nets. |
| **Corners** | At the corners of nets. Emergent effect: rounding corners. |
| **Edges** | At the midpoints of net edges. |
| **Grid Centers** | At the center of grid cells. |
| **Random (Gridded)** | At corners, edge-midpoints, and centers of grid cells. |
| **Start / End** | Positioned in the first/last N nets drawn by the fill style. |

### Spread
Controls how much explosions drift during simulation. Low spread = fixed points, sharp textures. High spread = muted, diffuse textures.

### Interference
- **Low**: each net responds ONLY to explosions directly inside it.
- **High**: nets respond to explosions in wider proximity, producing more chaotic patterns.

## 6. Style (Boundary Behavior)

Style determines what happens when a net node hits its rectangular container edge.

| Style | Behavior | Visual Effect |
|---|---|---|
| **Explosive** | Container is rubbery. Net bounces BACK INWARD when it touches the edge. | Organic, puffed, bulging shapes. |
| **Modern** | Container edges are STICKY. Net pieces stay stuck where they land. | Traced/partially traced cells. Emergent outlined behavior. |

> These are the ONLY deformation mechanisms. There is NO gravity field in Edifice.

## 7. Texture (Rendering Mode)

Texture determines which net connections are drawn.

| Texture | Rendering Rule |
|---|---|
| **Lattice** | ALL connections (horizontal + vertical) are drawn. Most pieces use this. |
| **Lattice (Hatched)** | ONLY horizontal connections are drawn. Nets are initialized denser. Produces characteristic horizontal stripe appearance. |
| **Sqribble** | Each node is randomly perturbed before explosions, creating a scribbly texture. |

> **#834 observation**: The horizontal-line-dominant appearance strongly suggests **Hatched** texture.

## 8. Displacement (Post-Build Warp)

After the grid is built and nets are simulated, a **displacement function** is applied to EVERY point to warp the entire composition. This is how non-orthogonal shapes appear.

| Displacement | Effect |
|---|---|
| **None** | No warp. |
| **Twist** | Rotates points around the center by a variable amount based on distance. |
| **Sharp** | Skews odd rows/columns one direction, even rows/columns the other → jagged edges. |
| **Detach** | Picks a line between grid cells, separates segments, shifts them apart. |
| **Turn** | Rotates everything by a constant amount → lopsided appearance. |
| **Smooth** | Applies a single smooth curving displacement. |
| **Squish** | Compresses even rows into triangles, expands odd rows into trapezoids. |
| **Shift** | Skews the whole space uniformly. |
| **Wave** | Sine wave displacement with parameters from cell width/height. |
| **Isometrize** | Isometric transformation of 2D space. (Rare) |
| **Perspective** | Two-point perspective transform → illusion of 3D. Sets Dimensions=3. |
| **V** | Half convex / half concave perspective tricks. |

## 9. Symmetry

Applied to both grid layout and colors.

| Symmetry | Effect |
|---|---|
| **Random** | No symmetry applied. |
| **Horizontal** | Top half reflected onto bottom. |
| **Vertical** | Left half reflected onto right. |
| **Radial** | Both reflections → fourfold symmetry. |

## 10. Topology

Determines what happens when nets (or portions) exceed the canvas boundary.

| Topology | Effect |
|---|---|
| **Finite** | They fall off / are clipped at the edge. |
| **Torus** | They wrap around to the opposite edge. |

## 11. Color Palette

- **16 palettes**: Noct, Porcelain, Grayscale, Salt, Sunflower, Meep Morp, Lark, Xenoglossy, 66, Good News, Bad News, Onus, Blood Orange, Ska, Kid Robot, Couch.
- Colors are sampled from photographs of physical canvases painted by the artist.
- Some palettes use **weighted bucket sampling** (probabilistic, not uniform random).
- Some are **gradient palettes** (Grayscale, Salt, Sunflower, Meep Morp, Onus, Blood Orange) that can be applied in multiple ways.
- Good News / Bad News are complementary black-and-white newspaper palettes (Bad News is inverted).
- Lark (dark, moody) and Porcelain (bright, near-blank) complement each other.

## 12. Additional Features

- **Line Width**: Thick lines make untouched rectangles appear filled. Thin lines produce ghostlike images.
- **Borders**: Some pieces include border elements.
- **Film Grain**: Uniform fine noise pass to break vector flatness → analogue/paper quality.

## 13. Edifice #834 — Specific Analysis

Looking at the reference image:
- **Fill Style**: Random Walk (large variable rectangles packed densely, with clear directional growth patterns)
- **Texture**: Lattice (Hatched) — overwhelmingly horizontal lines, denser nets
- **Style**: Likely Modern or Explosive (some cells show traced boundaries)
- **Cell Aspect**: Tall or Extra Tall (cells are taller than wide)
- **Interference**: Low to Medium (some cross-contamination between adjacent cells)
- **Displacement**: None or minimal (orthogonal grid structure is preserved)
- **Symmetry**: Random (no visible symmetry)
- **Palette**: Blue-dominant gradient (likely a custom gradient palette applied by distance)
- **Explosion Position**: Random or Central (deformation concentrated toward middle, periphery more intact)
