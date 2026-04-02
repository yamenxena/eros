# Eros Engine: Single Source of Truth (SSoT)

**Persona:** Yamin Zeyna (Architect & Curator)
**System:** Eros Art Engine — Mereological Canvas
**Model:** The Kovach Method (Single Source of Truth)
**Date:** 2026-04-02 (v2 — Mereological Hardening)

This document defines the absolute, contradiction-free theory of the Eros engine. It replaces all prior versions and serves as the constitutional foundation for the engine.

---

## 1. The Core Philosophy: Mereological Autonomy

Eros is a **mereological canvas** — art emerges from part-to-part collisions, not top-down canvas reductionism. The whole is never painted. The whole *appears* when autonomous parts interact under physical laws.

1. **Brutalist Algorithmic Emergence:** Beauty is not designed. It is computed. Visual quality occurs at the edge of chaos — where structural forces and destructive explosions reach dynamic equilibrium.
2. **Human Friction (The Centauric Model):** Fully automated AI art is stripped of authenticity. Eros demands *Human Friction*. The UI is the physical loom: the user calibrates tension sliders, curates palettes, and selects strategies. The engine executes; the human feels the friction.
3. **The Kovach Benchmark:** All development is measured against the [Edifice algorithm](https://bendotk.com/writing/edifice) by Ben Kovach. Kovach is the only method that perfectly implements the 5-level ontological taxonomy. Every feature must pass through this benchmark.

---

## 2. The 5-Level Ontological Taxonomy

Every Eros render must pass through all five levels. No level may be skipped.

| Level | Name | What It Does | Mandatory Constraint |
|:------|:-----|:-------------|:-------------------|
| **1** | **THE PACK** | Space partitioning → grid of bounding rectangles | N-Descending packing. No overlaps. Complete coverage. |
| **2** | **THE ENCLOSURE** | Sovereign bounding objects — each cell is autonomous | Hard topological clamping. No stroke escapes its cell. |
| **3** | **THE NET** | Physical forces — explosions, springs, displacement | Iterative simulation. Inverse-square repulsion. Spring constraints (Hooke). |
| **4** | **THE HATCH** | Vector rendering — drawing the deformed structure | RK4 integration or cloth-net connection rendering. |
| **5** | **THE PIGMENT** | Color, texture, line weight — analog render synthesis | Position-deterministic color. Multiplicative blending. |

---

## 3. The Mathematical Core: Net Deformation Simulation

The defining architecture of the Eros engine is the **Net Deformation Simulation**. It replaces the prior "Dual-Engine Paradigm."

### How It Works

1. **Grid Construction** (Level 1): A rectangular grid of cells is packed into the canvas using N-Descending allocation.
2. **Net Placement** (Level 2-3): Inside each cell, a fine grid of connected nodes (the "net") is placed. Adjacent nodes are connected by spring links.
3. **Explosion Simulation** (Level 3): Repulsor points are placed at strategic positions. Over multiple simulation steps, forces are applied to net nodes:
   - **Repulsion:** Inverse-square force from each explosion source
   - **Springs:** Hooke's law restoring force along each link
   - **Damping:** Velocity reduction per step
   - **Boundary:** Enclosure clamping (sticky or bouncy)
4. **Rendering** (Level 4): The deformed net connections are drawn. The visual texture emerges from the deformed topology, not from a flow field.
5. **Pigmentation** (Level 5): Colors are assigned position-deterministically. Multiplicative blending creates depth.

### The Flow-Field Exception

The RK4 flow-field rendering mode is preserved as a **secondary mode** for artistic variety. It is not the primary render path. When used, vectors are still topologically clamped to their enclosure boundaries.

---

## 4. Algorithmic Foundations

1. **Resolution Independence:** Vector-based coordinate rendering via HTML5 `<canvas>`. Aspect ratio locked. Scaleable to any resolution.
2. **Deterministic PRNG:** Mulberry32 seeded by user-provided hash. Same seed → same output, always, down to the sub-pixel.
3. **Discrete Forces Only:** Eros rejects continuous noise (Perlin, Simplex) for structural computation. All forces are discrete inverse-square repulsions from point sources. Noise is used **only** for minor texture perturbation (Sqribble mode), never for structural decisions.
4. **Probability Shaping:** Variable distributions are sculpted so that even extreme seeds produce structurally valid compositions.

---

## 5. Systemic Hardening & Physics

### 5.1 Topological Clamping (Not Spatial Hashing)

**Resolution:** Every stroke is clamped to its enclosure boundary via absolute coordinate checking (`Math.min/Math.max` or sticky/bouncy reflection). This is not proximity-based collision (Fidenza). It is topological law — a stroke cannot exist outside its cell.

### 5.2 The Sub-Pixel Floor Limit

**Resolution:** No structural cell evaluates below `0.5px` relative to rendering resolution. Hard cap: `if (width < 0.5) return;` at the top of every recursive tree.

### 5.3 Multiplicative Blending (Not Opacity Stacking)

**Resolution:** `ctx.globalCompositeOperation = 'multiply'` with controlled alpha IS the Kovach texture model. This creates structural accumulation — the darkening pattern encodes the density of the deformed net. This is NOT decorative opacity stacking. The distinction: multiplicative blending respects Lightness mathematically; opacity stacking creates muddy gray.

### 5.4 Anti-Tangling Constraint

**Resolution:** During net simulation, if any horizontal link's left node crosses its right node (or vertical link's top crosses bottom), the nodes are forcefully separated. This prevents visual Z-order violations and maintains planarity.

### 5.5 Performance Guardrail

Every render must complete in ≤2000ms at 1024×1024. If net simulation exceeds this, reduce `simSteps` or `meshDensity`.

---

## 6. The Sweet-Spot Metrics

Aesthetic quality is measurable across 5 computable axes:

| Axis | What | Optimal Range |
|:-----|:-----|:-------------|
| **Fractal D** | Box-counting dimension of rendered ink | [1.3, 1.5] |
| **β₁/β₀** | Topological loop ratio | [0.02N, 0.15N] |
| **κ** | PNG compressibility | [0.65, 0.85] |
| **ρ** | Ink density (dark pixels / total) | [0.25, 0.55] |
| **H_s** | Scale entropy of cell sizes | [0.5, 0.85] × H_max |

The composite sweet-spot score is the **product** of individual membership functions. A failure on any axis kills the entire score.

### λ_eros — The Edge of Chaos Parameter

```
λ_eros ∝ (explosionCount × forceMax) / (springK × simSteps × gridCols²)

λ_eros ≈ 0:  Springs dominate → grid barely deforms → boring
λ_eros → ∞:  Explosions overwhelm → mesh shatters → noise
λ_eros ≈ 1:  SWEET SPOT — torn web effect emerges
```

---

## 7. The Topological Grammar

Seven operations constitute the engine's generative grammar (see `topology-heuristics.md`):

1. **Partition** — Subdivide the disk D² into cells (N-Descending packing)
2. **Identify** — Glue boundary edges to create torus/Klein/RP² topology
3. **Deform** — Apply displacement functions (Twist, Sharp, Wave, etc.)
4. **Project** — Map to viewing plane (Identity, Isometric, Perspective, V-Fold)
5. **Cut** — Topological surgery (Detach displacement)
6. **Modulate** — Position-dependent parameter variation (Riley-style gradients)
7. **Render** — Draw the result at Level 4-5

---

## 8. What Eros Is Not

- **Not p5.js:** Eros uses zero-abstraction vanilla JS + Canvas 2D. The `draw()` loop abstraction is incompatible with the net simulation model.
- **Not a flow field engine:** Flow fields (Fidenza-style) are a secondary mode, not the core architecture.
- **Not 3D:** Eros is a pure 2D mereological canvas. Three-dimensionality is an illusion created by projection operations (isometric, perspective), not by actual 3D rendering.
- **Not continuous noise:** Perlin/Simplex are banned from structural computation. Beauty comes from discrete collisions, not smooth gradients.
