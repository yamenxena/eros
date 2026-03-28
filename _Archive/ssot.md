# Eros Agent: The Universal Theory (SSoT)

**Persona:** Yamin Zeyna (Architect & Curator)
**System:** Eros Art Engine (Autonomous GenAI Engine)
**Model:** The Centauric System (Human Friction + Dual-Engine Execution)
**Date:** 2026-03-28

This Single Source of Truth (`ssot.md`) defines the absolute, contradiction-free theory of the Eros engine. It explicitly rejects "collage" mechanics (pasting borrowed ideas together) and instead establishes a fiercely original mathematical and agentic architecture capable of producing rare, masterwork-grade generative art.

---

## 1. The Core Philosophy: Rarity & Friction

Eros does not exist to produce generic "pretty" pictures. It exists to find algorithmic miracles.

1.  **The Engine of Rarity:** Rarity in Eros is not achieved by flat randomness. It is achieved by pushing mathematical constraints to their absolute breaking points. Visual miracles occur exactly at the threshold of structural collapse—when a recursive depth approaches zero, or noise amplitude folds geometry onto itself.
2.  **The Centauric Friction:** Fully automated AI art (one-click prompting) is stripped of authenticity. Eros demands *Human Friction*. The UI acts as the physical loom: the user (Yamin Zeyna) must manually drive the transaction hash, calibrate the tension sliders, and curate the palettes. The AI Agent executes; the Human feels the friction.
3.  **Semantic Mapping (Ontology):** Art is not empty math. In the Yamin Zeyna style, input data (a poem, an SRT file, an architectural floorplan) does not just "influence" the image—it literally re-maps the physical constants. A dense, negative paragraph structurally increases gravitational mass and tightens collision bounds within the engine.

---

## 2. The Mathematical Core: The Dual-Engine Paradigm

The defining architecture of the Eros Engine is the **Dual-Engine Paradigm**. It resolves the contradiction between continuous pixel evaluation and discrete vector motion by merging them.

Every Eros masterpiece is executed in two explicit phases:

### Phase A: The Structural Field (Pixel Coordinate Evaluation)
Before any lines are drawn, Eros calculates a continuous, invisible mathematical topology. This is the foundation seen in methods like `muqarnas` and `miniature`.
*   **The Mechanism:** For every coordinate $(px, py)$ on the canvas, an equation evaluates its exact structural address (e.g., recursive rectangular partition, or radial sub-grid fold point).
*   **The Output:** A topological map of tension ($t$), hierarchy ($d$), and gradient limits. It determines the base structural color and boundary thresholds.

### Phase B: Dynamic Agents (Vector Flow Integration)
Instead of standard *Fidenza*-style empty canvasses, dynamic agents (particles, ribbons) are dropped *into* the Phase A Structural Field.
*   **The Mechanism:** The flow field calculus ($\frac{d\mathbf{p}}{dt} = \mathbf{V}(\mathbf{p})$) is guided not just by noise, but by the structural boundaries established in Phase A. 
*   **The Reaction:** A vector traversing a "high-tension" cell from Phase A will accelerate or sharply terminate. The dynamic agents respect or violently react to the recursive hierarchies defined before them.

---

## 3. Resolving the Unknown Unknowns: Systemic Hardening

To ensure Eros is robust enough to calculate tens of thousands of dynamic agents across millions of structural pixels without crashing or producing "Mud", the following strictly codified laws must be enforced in the code:

### 3.1 The O(N²) Collision Trap
**Threat:** A swarm of 10,000 agents checking Pythagorean distance against every other agent per frame requires 100 million calculations. The browser will instantly lock up.
**Resolution (Spatial Hashing):** Eros must mandate **QuadTrees** or discrete **Grid Hashing**. An agent is only allowed to calculate distance against coordinates existing in its immediate neighboring grid cells, reducing O(N²) collision checks to O(N). If a script violates this, the Agent rejects it.

### 3.2 The Sub-Pixel Float Precision Threshold
**Threat:** Deep recursive functions (e.g., dividing a canvas 10 layers deep) eventually push width and height variables into chaotic Float64 rounding errors, creating visual jaggedness.
**Resolution (The Floor Limit):** No structural cell or recursive depth is allowed to evaluate below `0.5px` relative to the physical render resolution. The algorithm must possess a hardcap `if (width < 0.5) return;` at the top of every recursive tree.

### 3.3 Additive Blending Burnout (The "Mud" Problem)
**Threat:** Sweeping vector trails using standard `globalAlpha` or additive blending eventually stack up, blowing out the canvas into pure white or crushing it into dull gray mud.
**Resolution (Isolated HSL Shifting):** Eros fundamentally rejects opacity stacking for major forms. Transparency must be tightly controlled. Tension, depth, and age modify Lightness ($\pm L$) and Saturation ($\pm S$) independently, while Hue ($H$) remains structurally locked to the Yamin Zeyna curated palettes.

---

## 4. Agentic Self-Curation (The Auto-Editor)

Beyond deterministic generation, the Eros Agent utilizes LLM awareness to curate the pipeline.
1.  **Reflection (LLM-as-Judge):** The system has the capacity to snapshot its internal buffer. If extreme rarity parameters accidentally trigger total structural collapse (e.g., producing a completely black image), the vision-equipped LLM detects the failure state and re-rolls the PRNG seed before presenting it to the user.
2.  **Tool Ejection:** If a newly written JavaScript method enters an infinite `while` loop due to flawed collision logic, the engine tracks completion latency. If a frame takes longer than $2000\text{ms}$ to evaluate, the engine forcefully ejects the method and restores the previous safe state.
