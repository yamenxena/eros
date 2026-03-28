# Edifice (Eros SSoT) — The "Procedural Layout + 2D Cloth Inner Mesh" Paradigm

**Status:** Eros Engine SSoT 
**Reference Token:** \`3aac7bf80dcb170f564aa672899b00d2\` & \`204000834\`

---

## 1. The Composition Layout Phase
The grid is **not** a generic uniform checkerboard. It is deeply structured via **Procedural Distribution**:

### Rule 1: Abstract Composition Guides
An abstract macro-shape (e.g., a "Trunk", "Cross", or "Clusters") governs how the underlying rectangular grid is subdivided.
- **Inside the Main Shape:** We generate dense vertical columns filled with varying lengths—from extremely long vertical strips (which hold the structure together) down to small rectangular chunks.
- **Outside the Main Shape (Flanks):** The remaining clusters are divided into highly concentrated horizontal strips.

### Rule 2: Strict Orthogonal Margins
Regardless of the composition phase, every cell maintains its rigid rectilinear form. Cells never warp into trapezoids or fluid waves globally. Cell boundaries are mathematically invisible, defined entirely by an empty padding **margin** that creates the universal crisp white grid effect.

---

## 2. The Physics Engine Phase (2D Cloth Inner Mesh)
Inside each structurally rigid cell resides a true physical 2D simulation. It is a mesh—a unified rectangular net, like an elastic cloth.

### Rule 3: The 2D Elastic Net
The mesh inside the cell consists of 2D nodes linked horizontally and vertically by spring physics. It is not just 1D plot lines.

### Rule 4: Scale-Dependent Tearing Immunity
Explosion forces (the "tears") do not affect the grid uniformly:
- **Long Meshes (Stable):** Long vertical/horizontal strips are utterly immune to tearing. Their length absorbs the tension, leaving perfect, pristine grids.
- **Medium Meshes (Affected):** These experience mild deformation.
- **Short Meshes (Varying & Violently Torn):** The tiniest cell chunks take the brunt of the kinetic forces.

### Rule 5: Inner Tearing & Voids
When a short chunk is torn by an explosion, the explosion acts within the bounds of the cloth mesh. The nodes are pushed violently outward from the center of the blast.
- This rips open a stark, empty **void** in the center of the mesh.
- The elastic threads stretch to the breaking point, creating sharp, jagged angles crossing the void.
- **The Enclosure Limit:** Even when totally blown apart, the displaced nodes pile up completely and cleanly against the rigid inner walls of the cell. They do not leak into the white margins separating cells.

---

## 3. High-Fidelity Implementation Architecture

1.  **Grid Layout Engine:** Generate main abstract zones (Trunks vs Flanks). Loop down uniformly spaced columns and slice them based on probability weighted by zone (long vs. short).
2.  **Margin Engine:** Apply global boundary shrink (gap creation) to all output rects.
3.  **Simulation Engine:** 
    - Build full 2x2 up to 20x20 interconnected node meshes per cell.
    - Measure rect `H / W` or `Area` to derive a multiplier. If length is extreme, `explosionMultiplier = 0`.
    - Apply repulsive forces to nodes, tearing the inner fabric apart. Clamp strictly to bounds.
4.  **Render Engine:** Run `<canvas>` path drawing linking the entire 2D network (or specific hatches) to reveal the violent underlying tension.

[AUTH: Eros | edifice-ssot | 4.0.0 | 2026-03-28]
