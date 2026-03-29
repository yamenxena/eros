# Muqarnas Generative Heuristics — Equation Extraction
## Source: `_Archive/Mukarnas.md`
## Purpose: Actionable mathematical equations for the Eros Engine

---

## Universal Principle: Recursive Subdivision

All artists in this lineage share one foundational heuristic:

> **Do not draw the final complex shape. Define a bounding volume, give
> the algorithm a rule-set (the *Kanon*), and let it subdivide the
> geometry iteratively.**

The complexity budget is always:  
```
C(n) = k^n   where k = branching factor, n = iterations
```
At `k=4, n=8` → 65 536 tiles from a single bounding box.

---

## 1. Michael Hansmeyer — Selective Subdivision

### Core Algorithm: Modified Catmull-Clark

Hansmeyer's engine is a **deterministic** subdivision surface algorithm.
No randomness. No conditionals. Pure iterative geometric rules.

#### Face Point (centre of each polygon face):

```
F = (1/k) * Σ V_i       (k = number of vertices in face)
```

#### Edge Point (smooth midpoint influenced by adjacent faces):

```
E = (V₁ + V₂ + F₁ + F₂) / 4
```

Where `V₁, V₂` are the edge endpoints, `F₁, F₂` are face points of the
two faces sharing that edge.

#### Vertex Point (repositioned original vertex):

```
V' = (Q + 2R + (n-3)V) / n
```

Where:
- `V`  = original vertex position
- `n`  = valence (number of edges meeting at vertex)
- `Q`  = average of all adjacent face points
- `R`  = average of midpoints of all edges connected to vertex

#### Hansmeyer's Mutation

The key insight is that Hansmeyer **modifies the weighting constants**
in these formulas. Instead of the canonical `1/4, 1/4, 1/4, 1/4`
weights for edge points, he introduces controlled asymmetries:

```
E_mutated = w₁·V₁ + w₂·V₂ + w₃·F₁ + w₄·F₂
            where w₁+w₂+w₃+w₄ = 1.0
            and w_i ≠ 0.25 (non-canonical)
```

This produces **non-smooth, highly articulated** geometries instead of
organic blobs. The muqarnas effect emerges from **selective** subdivision:
not every face subdivides uniformly. The geometry and topology of each
tile dictate whether it splits further.

#### Selective Subdivision Rule:

```
subdivide(face_i) = TRUE   if area(face_i) > threshold(tier)
                  = FALSE  otherwise
```

This creates tiers of resolution: coarse at the vault crown, microscopic
at the pendentive transitions.

### Implementation for Eros (2D Canvas):

```javascript
// Recursive quad subdivision with asymmetric weighting
function subdivideQuad(quad, depth, maxDepth, weights) {
    if (depth >= maxDepth) return [quad];
    
    const center = weightedCenter(quad.vertices, weights);
    const edgeMids = quad.edges.map(e => weightedMidpoint(e, weights));
    
    // Generate 4 child quads
    return edgeMids.flatMap((mid, i) => {
        const child = buildChildQuad(quad.vertices[i], mid, center, edgeMids[(i+3)%4]);
        // SELECTIVE: only subdivide if area exceeds tier threshold
        if (area(child) > thresholdForDepth(depth)) {
            return subdivideQuad(child, depth + 1, maxDepth, weights);
        }
        return [child];
    });
}
```

---

## 2. Mamoun Sakkal — Muqarnas Block Taxonomy

### Core Algorithm: Modular Tile Families from Base Angle

Sakkal reduced the infinite complexity of muqarnas to a finite set of
**block families**, each generated from a single parameter: the **base
angle** θ.

#### Block Family Generator:

```
Block(θ) = {
    pyramid:  height = h, base = polygon(θ, n_sides)
    prism:    height = h, base = rectangle(θ)
    triangle: height = h, base = isoceles(θ)
}
```

The canonical Islamic base angles are:
- **45°** family (octagonal symmetry, most common)
- **60°** family (hexagonal symmetry)
- **90°** family (square grid, simplest)

#### Tier Projection (2D Plan → 3D Vault):

The classical muqarnas algorithm works by **vertical projection**:

```
z(x, y) = H - tier(x, y) * Δh
```

Where:
- `H`      = total vault height
- `tier()` = which horizontal layer the point belongs to (integer)
- `Δh`     = vertical step between tiers

#### Star Pattern Rule:

At each tier, the 2D plan is a **star polygon**:

```
star(n, m) = connect every m-th vertex of a regular n-gon
```

Common muqarnas stars: `star(8,3)`, `star(12,5)`, `star(16,7)`

The angle of each ray:
```
α = (2π · m) / n
```

#### Inter-Tier Transition (The "Fold"):

Between tiers, the geometry rotates by a fixed angular offset:

```
θ_tier(k) = θ_tier(k-1) + π/n
```

This creates the visual spiral/cascade effect of classical muqarnas.

### Implementation for Eros (2D Canvas):

```javascript
// Generate concentric star tiers
function generateMuqarnasPlan(cx, cy, tiers, n, m, baseRadius) {
    const plans = [];
    for (let t = 0; t < tiers; t++) {
        const r = baseRadius * (1 - t / tiers);
        const rotation = t * (Math.PI / n); // Inter-tier angular offset
        const vertices = [];
        for (let i = 0; i < n; i++) {
            const isOuter = (i % 2 === 0);
            const radius = isOuter ? r : r * Math.cos(Math.PI * m / n);
            const angle = (2 * Math.PI * i / n) + rotation;
            vertices.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle)
            });
        }
        plans.push({ tier: t, vertices, radius: r });
    }
    return plans;
}
```

---

## 3. Refik Anadol — Neural Fluid Data Sculptures

### Core Algorithm: Stable Fluids (Jos Stam, 1999)

Anadol's aesthetic is built on **Navier-Stokes fluid simulation**
applied to high-dimensional data point clouds.

#### Navier-Stokes (Incompressible, 2D):

```
∂u/∂t = -(u·∇)u - (1/ρ)∇p + ν∇²u + F

∇·u = 0   (incompressibility constraint)
```

Where:
- `u`  = velocity field (2D vector at each grid point)
- `p`  = pressure scalar field
- `ρ`  = fluid density
- `ν`  = kinematic viscosity (controls smoothness)
- `F`  = external forces (data-driven in Anadol's case)

#### Stable Fluids Pipeline (per frame):

```
1. ADD FORCES:       u ← u + Δt · F(data)
2. ADVECT:           u ← advect(u, u, Δt)
3. DIFFUSE:          u ← solve(I - ν·Δt·∇², u)
4. PROJECT:          u ← u - ∇(∇⁻²(∇·u))
```

Step 4 (Helmholtz-Hodge Decomposition) enforces mass conservation,
preventing the fluid from compressing.

#### Advection (Semi-Lagrangian):

```
u_new(x) = u_old(x - Δt · u_old(x))
```

This traces each grid point backwards through the velocity field and
samples the previous state. It is unconditionally stable (hence the
name).

#### Data-Driven Force Field:

Anadol's unique contribution is replacing the external force `F` with
**neural network embeddings**:

```
F(x, y, t) = NN(latent_vector(t)) mapped to 2D force field

// The neural network outputs are projected spatially:
F_x(i,j) = embedding[i * cols + j] * force_scale
F_y(i,j) = embedding[(i * cols + j) + offset] * force_scale
```

### Implementation for Eros (2D Canvas):

```javascript
// Simplified Stable Fluids for 2D Canvas
class FluidGrid {
    constructor(N) {
        this.N = N;
        this.u = new Float32Array((N+2)*(N+2));  // x-velocity
        this.v = new Float32Array((N+2)*(N+2));  // y-velocity
        this.d = new Float32Array((N+2)*(N+2));  // density
    }
    
    addForce(x, y, fx, fy, amount) {
        const idx = (y * (this.N+2)) + x;
        this.u[idx] += fx;
        this.v[idx] += fy;
        this.d[idx] += amount;
    }
    
    step(dt, viscosity) {
        this.diffuse(this.u, viscosity, dt);
        this.diffuse(this.v, viscosity, dt);
        this.project();
        this.advect(this.u, this.u, this.v, dt);
        this.advect(this.v, this.u, this.v, dt);
        this.project();
        this.diffuse(this.d, viscosity, dt);
        this.advect(this.d, this.u, this.v, dt);
    }
}
```

---

## 4. Marc Fornes / THEVERYMANY — Agent-Based Structural Crawlers

### Core Algorithm: Stigmergic Agent-Based Modeling (ABM)

Agents crawl over a surface, leaving structural trails that become the
final geometry. This is borrowed from ant colony optimization (ACO).

#### Agent Movement Rule:

```
position(t+1) = position(t) + velocity · direction(t)

direction(t) = normalize(
    w₁ · stress_gradient(position)     // Follow structural stress
  + w₂ · curvature_normal(position)    // Stay on surface
  + w₃ · neighbor_avoidance(agents)    // Don't collide
  + w₄ · pheromone_gradient(trails)    // Follow existing trails
)
```

#### Stress-Flow Alignment:

The vector field that guides agents is derived from **principal stress
directions** of the surface under load:

```
σ = eigenvalues of stress tensor T at point (x,y)
principal_dir = eigenvector corresponding to max(|σ₁|, |σ₂|)
```

Agents preferentially move along **lines of maximum stress**, creating
structural ribs that optimally resist deformation.

#### Trail Deposition:

```
trail(x, y) += deposit_rate * (1 - coverage(x, y))
```

Agents deposit less material where coverage is already high (negative
feedback), preventing redundant structural members.

#### Aperture Eating:

```
eat(face_i) = TRUE   if stress(face_i) < survival_threshold
            = FALSE  otherwise
```

The algorithm removes material from low-stress regions, creating the
characteristic perforated patterns.

### Implementation for Eros (2D Canvas):

```javascript
// Agent-based structural crawler
class CrawlingAgent {
    constructor(x, y, surface) {
        this.x = x;
        this.y = y;
        this.surface = surface;
        this.alive = true;
        this.trail = [];
    }
    
    step(stressField, agents, trailMap) {
        // Compute direction from weighted field sampling
        const stressDir = stressField.gradient(this.x, this.y);
        const avoidance = this.computeAvoidance(agents);
        const pheromone = trailMap.gradient(this.x, this.y);
        
        const dx = 0.6 * stressDir.x + 0.2 * avoidance.x + 0.2 * pheromone.x;
        const dy = 0.6 * stressDir.y + 0.2 * avoidance.y + 0.2 * pheromone.y;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        
        this.x += (dx / len) * this.speed;
        this.y += (dy / len) * this.speed;
        
        // Deposit trail
        this.trail.push({ x: this.x, y: this.y });
        trailMap.deposit(this.x, this.y, 1.0);
    }
}
```

---

## 5. Neri Oxman — Variable-Density Material Ecology

### Core Algorithm: Perlin Noise → Functional Grading

Oxman's key insight: use **coherent noise fields** to spatially vary
material properties continuously, mimicking biological tissues.

#### Perlin Noise (2D):

```
noise(x, y) = Σ (amplitude_i * perlin(x * freq_i, y * freq_i))
              for i = 0..octaves-1

amplitude_i = persistence^i
frequency_i = lacunarity^i * base_frequency
```

Standard parameters:
- `persistence` = 0.5 (amplitude decay per octave)
- `lacunarity`  = 2.0 (frequency doubling per octave)
- `octaves`     = 6–8

#### Material Property Mapping:

```
density(x, y)    = remap(noise(x, y), [-1,1], [ρ_min, ρ_max])
stiffness(x, y)  = remap(noise(x+offset, y+offset), [-1,1], [E_min, E_max])
porosity(x, y)   = 1.0 - density(x, y)
```

#### Voxel-Based Functional Grading:

The design space is discretized into a 3D voxel grid. Each voxel
receives a material property tuple `(density, stiffness, color)` from
the noise field.

```
for each voxel V(i, j, k):
    V.density = fbm_noise(i * scale, j * scale, k * scale)
    V.material = selectMaterial(V.density)
    V.geometry = lattice(V.density)  // Dense → solid, Sparse → porous
```

#### Structural Load Response (Wolff's Law for Bone):

Oxman often cites Wolff's Law: bone adapts its density to the loads it
carries. Computationally:

```
density_new(x,y) = density_old(x,y) + η * (stress(x,y) - equilibrium)
```

Where `η` is a remodeling rate. High stress → denser material. Low
stress → material is removed (porosity increases).

### Implementation for Eros (2D Canvas):

```javascript
// Variable-density Perlin grading
function functionalGrade(ctx, W, H, noise, octaves, persistence) {
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;
    
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            let val = 0, amp = 1.0, freq = 0.005;
            for (let o = 0; o < octaves; o++) {
                val += amp * noise.simplex2(x * freq, y * freq);
                amp *= persistence;
                freq *= 2.0;
            }
            // Map noise to density (0 = porous void, 1 = solid)
            const density = (val + 1) * 0.5;
            const idx = (y * W + x) * 4;
            
            // Functional grading: dense = opaque bone, sparse = transparent void
            data[idx]     = Math.floor(density * 200);  // R
            data[idx + 1] = Math.floor(density * 180);  // G
            data[idx + 2] = Math.floor(density * 160);  // B
            data[idx + 3] = Math.floor(density * 255);  // A (porosity)
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
```

---

## 6. ZHA Code (Shajay Bhooshan) — Triply Periodic Minimal Surfaces

### Core Algorithm: Implicit Surface Evaluation

ZHA Code generates lightweight structural lattices using **Triply
Periodic Minimal Surfaces (TPMS)**: surfaces with zero mean curvature
that repeat in all three spatial dimensions.

#### Gyroid Surface (most common TPMS):

```
f(x, y, z) = sin(x)·cos(y) + sin(y)·cos(z) + sin(z)·cos(x)
```

The surface `S` is the level set `f(x,y,z) = 0`.

#### Schwarz Primitive (P-surface):

```
f(x, y, z) = cos(x) + cos(y) + cos(z)
```

#### Schwarz Diamond (D-surface):

```
f(x, y, z) = sin(x)·sin(y)·sin(z) 
           + sin(x)·cos(y)·cos(z)
           + cos(x)·sin(y)·cos(z)
           + cos(x)·cos(y)·sin(z)
```

#### Level-Set Thickening:

To create solid walls from the zero-surface, evaluate a thickness band:

```
shell(x,y,z) = |f(x,y,z)| < t/2
```

Where `t` controls wall thickness. Varying `t` spatially creates
functionally graded lattices (dense at load points, porous elsewhere).

#### Form-Finding via Mean Curvature Flow:

ZHA Code uses **mean curvature flow** to relax surfaces into minimal
configurations:

```
∂S/∂t = H · n̂
```

Where:
- `H` = mean curvature (κ₁ + κ₂) / 2
- `n̂` = surface normal

This PDE drives the surface toward zero mean curvature (minimal area for
given boundary constraints).

### Implementation for Eros (2D Canvas — Cross-Section Rendering):

```javascript
// Render 2D cross-section of TPMS (Gyroid)
function renderGyroidSection(ctx, W, H, scale, zSlice, thickness) {
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;
    
    for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
            const x = (px / W) * scale * Math.PI * 2;
            const y = (py / H) * scale * Math.PI * 2;
            const z = zSlice * Math.PI * 2;
            
            // Gyroid implicit function
            const f = Math.sin(x) * Math.cos(y)
                    + Math.sin(y) * Math.cos(z)
                    + Math.sin(z) * Math.cos(x);
            
            const idx = (py * W + px) * 4;
            
            if (Math.abs(f) < thickness) {
                // On the surface shell
                const intensity = 1.0 - (Math.abs(f) / thickness);
                data[idx]     = Math.floor(40 + intensity * 180);
                data[idx + 1] = Math.floor(60 + intensity * 140);
                data[idx + 2] = Math.floor(80 + intensity * 120);
                data[idx + 3] = 255;
            } else {
                // Void
                data[idx + 3] = 0;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
```

---

## Synthesis Table: Artist → Equation → Eros Method Potential

| Artist | Core Equation | Eros Application |
|--------|--------------|-----------------|
| **Hansmeyer** | `V' = (Q + 2R + (n-3)V) / n` (modified weights) | Recursive quad subdivision with asymmetric weighting → new Muqarnas method |
| **Sakkal** | `star(n, m)` + `θ_tier(k) = θ_tier(k-1) + π/n` | Concentric rotating star polygons → tiered vault plan renderer |
| **Anadol** | `∂u/∂t = -(u·∇)u - ∇p/ρ + ν∇²u + F` (Stable Fluids) | Data-driven fluid field painting → new "Flow" or "Murmuration" method |
| **Fornes** | `dir = w₁·stress + w₂·curvature + w₃·avoidance + w₄·pheromone` | Agent swarm leaving structural trails → new "Colony" method |
| **Oxman** | `noise(x,y) → density(x,y) → porosity(x,y)` (Wolff's Law) | Perlin-graded material density → variable-opacity organic tissue |
| **ZHA Code** | `f = sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0` (Gyroid) | TPMS cross-section rendering → new "Lattice" or "Gyroid" method |

---

## Priority for Eros Engine Integration

1. **Hansmeyer + Sakkal** → Direct Muqarnas method (highest relevance to archive)
2. **Anadol** → Fluid data sculpture method (most visually dramatic)
3. **Fornes** → Agent-based crawling (extends existing Centaur Field logic)
4. **Oxman** → Variable-density grading (extends existing noise infrastructure)
5. **ZHA Code** → TPMS lattice rendering (unique mathematical aesthetic)
