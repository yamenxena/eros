# Inversion

**Document:** `method.md`
**Type:** Theoretical Synthesis / Algorithmic Art Research
**Integration:** Aligns deep historical art techniques with the *Edifice* physics-based paradigm.

---

## 1. The Core Dichtomy: Structure vs. Chaos
The prevailing engine architecture of **Eros** (specifically finalized in Edifice v4) operates on a fundamental mechanical dichotomy: **The Rigid Container** vs **The Chaotic Interior**. This dichotomy is the through-line unifying eight historically distinct artistic styles.

### The Container (Mondrian, Siliakus, Muqarnas)
- **Piet Mondrian:** Sets the foundation. Space is divided via strict, mathematically pure orthogonality. There is no depth, only hierarchical 2D planes interacting via primary colors and heavy borders.
- **Ingrid Siliakus (Paper Architecture):** Adds the concept of the *Void* and the *Slice*. Her geometry relies on single-sheet topological integrity. A cut (a void) creates structure. In Eros, Siliakus governs the "invisible margin"—the empty space between cells that mathematically defines the composition without drawing a literal line.
- **Muqarnas:** Provides the logic for *Subdivision and Fractal Density*. Just as a Muqarnas vault recursively subdivides a square into an infinite honeycomb array to transition to a dome, our engine subdivides a "Trunk" or "Cross" composition down into incredibly dense, localized clusters while leaving other areas macro-stable.

### The Chaotic Interior (Ebru, Kandinsky, Ebru)
- **Ebru (Turkish Marbling):** Ebru is pure fluid dynamics—viscous drag, surface tension, and advection. When a stylus drags through paint, the pattern is permanently sheared but remains unbroken. In Eros, Ebru represents the physics engine. It is the underlying logic of the 2D mesh, where points can be infinitely stretched but the topological fabric connecting them never snaps.
- **Wassily Kandinsky:** Provides the energetic trigger. Kandinsky’s synesthetic explosions—sharp triangles and furious kinetic vectors—represent the "Blast Centers" in our physics model. They are the unseen forces that aggressively push the Ebru fluid (the 2D cloth mesh) against its Mondrian constraints.

---

## 2. Hybridization: The Klimt / Miniature Paradigm
How does a generative algorithm achieve high ornamental value without becoming visual noise? We look to **Gustav Klimt** and **Turkish Miniature**.

### Hieratic Scale & Composition (Miniature)
In Turkish Miniatures, scale is not defined by optical perspective (depth), but by *importance* (hieratic scale). Our layout engine uses this via **Composition Maps**.
- A "Cross" or "Trunk" is highly prioritized. It receives the most structural length and remains perfectly pristine (immune to tearing).
- The peripheral clusters are deemed "low hierarchy" and are subjected to violent horizontal subdivision and explosive physics forces. 

### The Hybrid Contrast (Klimt)
Klimt’s genius lies in trapping massive amounts of hyper-geometric detail (squares, circles, gold tessellations) inside fluid, organic, human silhouettes. 
- **The Eros Inversion:** The Eros engine *inverts* Klimt. Instead of geometry inside a fluid border, we place fluid physics (2D cloth tearing) inside strict geometric rectangles (Mondrian boxes). The tension of the artwork comes from the violent organic force desperately trying to break out of the rigid orthogonal boundaries.

---

## 3. Iteration, Fractals, & Rarity (Escher)

### M.C. Escher & Infinite Recursion
Escher's mathematics (hyperbolic geometry, tessellations) deal with limits and iteration. As shapes approach the bounding edge, they subdivide infinitely.
- In Eros, **Iteration** is defined by the depth of the column-slicing algorithm. Areas outside the main composition (the Flanks) iterate aggressively, dividing into hundreds of micro-chunks.
- The **Fractal** nature emerges from the 2D mesh *inside* those micro-chunks. A 10x10 cell containing a fully simulated 2D torn mesh demonstrates fractal complexity: zooming in reveals structurally similar jagged threads as the macro-composition.

### The Algorithm of Rarity
In generative art, **Rarity** isn't just a randomly assigned trait; it is the emergence of extreme probability states defined by the synthesis.
- **Common Outcomes:** A standard "Cross" composition where medium cells experience moderate tearing and voids.
- **High Rarity (The "Siliakus State"):** The PRNG forces perfect structural immunity across 95% of the canvas. The result is pure, pristine architectural plotting with only one or two deeply torn voids.
- **High Rarity (The "Kandinsky State"):** A catastrophic explosion pool overlapping a highly subdivided "Cluster" map, resulting in almost complete annihilation of the internal threads, leaving nothing but sharp angular shards trapped against the white margins.

---

## 4. Synthesis: The Edifice Method
To understand `edifice.js`, one must read it through this unified lens:
1. **The Grid** is Mondrian layout logic governed by Miniature hieratic scale (Trunks vs Clusters).
2. **The Margins** are Siliakus paper cuts.
3. **The Physics Simulation** is Kandinsky explosive vectors acting upon Ebru viscous fluid viscosity.
4. **The Final Render** is an Escher-like tension of infinite detail trapped in finite space, inverted from the Klimt paradigm.
