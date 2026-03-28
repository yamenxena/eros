# Eros Agent: The Universal Theory (SSoT)

**Persona:** Yamin Zeyna (Architect & Curator)
**System:** Eros Art Engine (Autonomous GenAI Engine)
**Model:** The Centauric System (Human Friction + Dual-Engine Execution)
**Date:** 2026-03-28

This Single Source of Truth (`ssot.md`) defines the absolute, contradiction-free theory of the Eros engine. It establishes a fiercely original mathematical and agentic architecture capable of producing rare, masterwork-grade generative art, seamlessly merging structural topology with dynamic vector flow. It serves as the ultimate constitution for the engine, absorbing heuristics from Fidenza, algorithmic literature, and the core Eros codebase.

---

## 1. The Core Philosophy: Rarity & Friction

Eros does not exist to produce generic "pretty" pictures. It exists to find algorithmic miracles.

1. **The Engine of Rarity:** Rarity in Eros is not achieved by flat randomness. It is achieved by pushing mathematical constraints to their absolute breaking points. Visual miracles occur exactly at the threshold of structural collapse—when recursive depth approaches zero, or noise amplitude folds geometry onto itself.
2. **The Centauric Friction:** Fully automated AI art ("one-click prompting") is stripped of authenticity. Eros demands *Human Friction*. The UI acts as the physical loom: the user (Yamin Zeyna) must manually drive the transaction hash, calibrate the tension sliders, and curate the palettes. The AI Agent executes; the Human feels the friction.
3. **Semantic Mapping (Ontology):** Art is not empty math. Input data (a poem, an SRT file, an architectural floorplan) re-maps physical constants. A dense, negative paragraph structurally increases gravitational mass and tightens collision bounds within the engine.

---

## 2. The Algorithmic Foundations

Eros relies on fundamental mathematical aesthetics to construct its pieces:

1. **Resolution Independence:** Pieces must be resolution-agnostic, scaling mathematically via vector-based or coordinate-based rendering (HTML5 `<canvas>`) to remain perfectly crisp at any dimension while locking the aspect ratio.
2. **Deterministic PRNG:** Every layer of randomness must be seeded by a hash (Pseudo-Random Number Generation). Supplying the exact same seed must construct the *exact same visual arrangement* every single time down to the sub-pixel, enabling perfect iteration.
3. **Coherent Noise over Randomness:** `Math.random()` static is banned for organic structures. Simplex and Perlin noise functions must be used to generate coherent flow fields, textures, and fluid distortions.
4. **Probability Shaping (Algorithmic Curation):** Variable curves and probability distributions must be sculpted so that even extreme edge-case hashes result in beautiful, mathematically sound compositions rather than chaotic noise.

---

## 3. The Mathematical Core: The Dual-Engine Paradigm

The defining architecture of the Eros Engine is the **Dual-Engine Paradigm**. It resolves the contradiction between continuous pixel evaluation and discrete vector motion by unifying them.

Every Eros masterpiece is executed in two explicit phases:

### Phase A: The Structural Field (Pixel Coordinate Topology)
Before vectors flow, Eros calculates a continuous, invisible mathematical topology (as seen in methods like `muqarnas` and `miniature`).
*   **The Mechanism:** For every coordinate $(px, py)$ on the canvas, an equation evaluates its exact structural address (e.g., recursive rectangular partition, or radial sub-grid fold point).
*   **The Output:** A topological map of tension ($t$), hierarchy ($d$), and gradient limits. It determines the base structural color and physical boundary thresholds.

### Phase B: Dynamic Agents (Vector Flow Integration)
Dynamic agents (particles, curves, ribbons) are dropped *into* the Phase A Structural Field.
*   **The Mechanism:** A flow field guides the vectors ($\frac{d\mathbf{p}}{dt} = \mathbf{V}(\mathbf{p})$). A noise-driven angle ($\theta$) directs motion, but the structural boundaries from Phase A dictate behavioral reactions.
*   **The Reaction:** A vector traversing a "high-tension" cell from Phase A will accelerate, curve sharply, or terminate. Dynamic agents respect or violently react to the recursive hierarchies defined before them.

---

## 4. Solving the "Unknown Unknowns": Systemic Hardening & Physics

To ensure Eros is robust enough to calculate tens of thousands of dynamic agents across millions of structural pixels without crashing or producing "Mud", strict laws must be enforced:

### 4.1 The Packing Problem & Collision Detection
**Threat:** A swarm of 10,000 agents checking distance against every other agent per frame requires 100 million calculations (an O(N²) trap), and blindly overlapping lines create muddy chaos.
**Resolution (Spatial Hashing):** Eros mandates **Grid Hashing (SpatialHashGrid)**. The canvas is divided into discrete cells. An agent checking for collisions or proximity to draw non-overlapping, packed curves (Fidenza-style) only calculates Pythagorean distance against agents in immediate neighboring grid cells, reducing collision checks to O(1).
**Visual Result:** Lines instantly terminate when getting too close to neighbors, creating striking negative space and resolving the "packing" aesthetic.

### 4.2 The Sub-Pixel Float Precision Threshold
**Threat:** Deep recursive functions (e.g., dividing a canvas 10 layers deep) eventually push width and height variables into chaotic Float64 rounding errors, creating visual jaggedness.
**Resolution (The Floor Limit):** No structural cell or recursive depth is allowed to evaluate below `0.5px` (or designated base tolerance) relative to the rendering resolution. The algorithm must possess a hardcap `if (width < 0.5) return;` at the top of every recursive tree.

### 4.3 Additive Blending Burnout (The "Mud" Problem)
**Threat:** Sweeping vector trails using standard `globalAlpha` or additive blending stack up, blowing out the canvas into pure white or crushing it into dull gray mud.
**Resolution (Isolated HSL Shifting):** Eros fundamentally rejects opacity stacking for major forms. Tension, depth, and age modify Lightness ($\pm L$) and Saturation ($\pm S$) independently, while Hue ($H$) remains structurally locked to the curated Yamin Zeyna palettes.

### 4.4 Shape Tapering & Advanced Geometry
When rendering vectors, primitive lines (`lineTo`) are insufficient. Algorithms must calculate polygons that taper dynamically at their start and end points using Bezier curves to simulate physical brush strokes, creating organic variable thickness across the stroke's lifespan.

---

## 5. Agentic Self-Curation (The Auto-Editor)

Beyond deterministic generation, the Eros Agent utilizes LLM-driven systemic awareness to orchestrate its own ecosystem:

1. **Reflection (LLM-as-Judge):** The system snapshots its internal buffer. If extreme rarity parameters accidentally trigger total structural collapse (e.g., producing a completely black image), the vision-equipped LLM detects the failure state and re-rolls the PRNG seed before presenting it to the user.
2. **Tool Ejection & Performance Guardrails:** If a newly injected JavaScript method enters an infinite `while` loop or unoptimized recursion, the engine tracks completion latency. If a frame evaluation exceeds the $2000\text{ms}$ threshold, the engine forcefully ejects the method and restores the previous safe state.
3. **Dynamic Code Execution:** The LLM can dynamically write and evaluate *new JavaScript models* directly into the `MethodRegistry` at runtime, bypassing static hardcoded limitations.
