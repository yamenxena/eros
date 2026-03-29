# Eros Digital Art: Aesthetic Heuristics
**Target Aesthetic:** Ben Kovach - *Edifice* (https://opensea.io/collection/edifice-by-ben-kovach)
**Date:** 2026-03-29
**Context:** This document serves as the foundational aesthetic ground-truth for the Eros Engine's general digital art generation. It strips away all architectural "Muqarnas" concepts and focuses purely on achieving the structural, high-tension, plotter-like abstract geometry of Kovach's masterwork.

---

## 1. The Core Philosophy: "Violent Order"
The *Edifice* aesthetic relies fundamentally on the juxtaposition of **strict, unyielding mathematical boundaries** against **violent, chaotic internal disruption**. It creates the illusion of architectural blueprints or structural nets that have been subjected to catastrophic physics, yet remained locked within their original designated zones.

It is NOT a random noise field. It is NOT a standard 3D mesh. It is a highly controlled 2D packing algorithm enclosing high-density spring-physics simulations.

---

## 2. The Four Pillars of the Edifice Aesthetic

To reach the level of Kovach, the Eros Engine (`edifice.js`) must perfectly execute four distinct computational layers:

### Pillar I: The Pack (Binary Space Partitioning)
Naive grids (like standard columns and rows) look cheap. The visual interest in Edifice comes from extreme scale variance in the structural layout.
* **The Heuristic:** The canvas must be partitioned using a recursive splitting algorithm (like a KD-Tree or BSP). A massive rectangular void may sit directly next to a dense stack of twenty tiny slivers.
* **The Execution:** Start with one giant canvas bounding box. Recursively pick a box, randomly choose an axis (X or Y), and split it. Stop splitting based on a density probability. This generates perfectly interlocking, puzzle-like rectangular zones.

### Pillar II: The Enclosure (Sticky Boundaries)
The outer edge of every generated rectangle must be absolute and indestructible.
* **The Heuristic:** The chaotic physics simulation *must never bleed* across the margins of its assigned rectangle. The margins provide the "architectural" aspect of the art.
* **The Execution:** When a physics node hits the mathematical boundary of its assigned bounding box, its velocity hits 0. It locks into the edge. This creates razor-sharp, perfectly straight lines on the outside of a box, while the inside is torn to shreds.

### Pillar III: The Net (Scale-Dependent Spring Physics)
Inside each rectangle lives a high-density 2D grid/cloth (e.g., nodes spaced every 4 pixels).
* **The Heuristic:** The physics mesh must react to ripping forces differently depending on the aspect ratio of the rectangle it lives in.
* **The Execution:** Long, massive columns possess extreme structural tension and resist tearing—they just warp slightly. Tiny, short slivers lack structural integrity and are completely ripped apart by the explosions, leaving only tangled strings at the edges.

### Pillar IV: The Hatch (Blueprint Overlap)
The render must not look like standard vector graphics; it must look like layered ink or structural analysis.
* **The Heuristic:** Instead of drawing flat polygons, the engine draws only the connecting threads of the mesh. 
* **The Execution:** Drawing thousands of overlapping semi-transparent lines creates regions of intense color saturation where the nets bunch together, and negative space where the voids expand. The contrast between bright, empty tears and hyper-dense, dark tangles produces the target aesthetic.

---

## 3. Algorithm Improvement Roadmap for `edifice.js`
The current `edifice.js` status quo is a good foundation, but must be improved:
1. **Drop simple columns (`_buildCompositionGrid`)** in favor of a true recursive BSP splitting algorithm to create complex, interlocking block variance.
2. **Refine the Tearing Physics**: Ensure the "explosions" create distinct, circular empty voids within the nets.
3. **Enhance Rendering**: Use `hsla()` heavily over thin `lineWidth` to mimic precise plotter ink or blueprint analysis overlays.

*End of Document. All structural code in Eros must answer to these four pillars.*
