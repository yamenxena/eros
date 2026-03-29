---
description: Create and register a new generative method in Eros
---

# Workflow: Implementing a New Eros Method

Whenever a new generative art method is devised for the Eros engine, it must strictly follow this ingestion pipeline to maintain the Single Source of Truth (SSoT) and ensure UI/UX stability across all engine tabs (Canvas, Concept, Gallery, Animation).

## Prerequisites
1. You have an approved `[analysis-name].md` detailing the mathematical/geometric growth equations and an implicit color palette for the new method.
2. You must translate this analysis into an `implementation_plan.md` (following the Eros architecture) and obtain user approval BEFORE writing code.

## 1. Method Scaffolding (`app/methods/[method-name].js`)
Create the core method file using the `MethodRegistry.register()` standard.

**Critical Requirements for the Method Object:**
- `id`: Unique lowercase system handle (e.g., `'ailanthus'`).
- `name`: Human-readable UI name (e.g., `'Ailanthus Bark (2D)'`).
- `version`: String denoting current method version (e.g., `'1.0.0'`).
- `type`: Must be `'2d'` or `'3d'`.
- `description`: 1-2 sentence summary.
- `palettes`: **MUST** be an array of at least 1 SSoT palette object `{ name, mood, colors: [{h, s, l}, ...] }`. (Derived from your analysis document).
- `params`: Array of SSoT Parameter Definition Objects. (Do NOT name this property `parameters`). Must contain a `{key: 'seed', type: 'number', label: 'Seed', category: 'Method'}` if the method uses stochastic generation.
- `narrative(p)`: Function returning a string explaining the method conceptually (used in Concept tab).
- `equation(p)`: Function returning the core mathematical theorem string (used in Concept tab).
- `init(params, canvas, ctx) / render(params, canvas, ctx) / etc`: The core logic loops.

## 2. Wiring to UI & Core Engine (`app/index.html`)
The new method will NOT automatically appear in the drop-down list unless it is injected into the HTML.
- Load the script exactly where the other methods are tracked, BEFORE `eros.js`.
```html
<script src="methods/sculpture.js"></script>
<script src="methods/[method-name].js"></script>
<script src="eros.js"></script>
```

## 3. Strict PRNG Compliance
If your method utilizes random numbers, you **must** use the Eros native `PRNG` class configured by the parameter `seed`.
- ❌ Do NOT use `Math.random()` for critical layout decisions unless strictly decorative/noisy.
- ❌ Do NOT use `new Prando()` or include external PRNG scripts. 
- ✔️ `const prng = new PRNG(params.seed);`

## 4. Palette & Animation Wiring
Follow the rules outlined in `/palette-wiring`:
1. Your render method must actively read and map to the active UI palette `window.ErosState.palette` OR accept `colors` passed correctly from `ErosEngine`.
2. Do not hardcode internal colors that cannot be overridden by the Gallery/Palette UI.
3. If applicable, expose `growthTimeline` or animatable values that the AnimController can hook into.

## 5. Verification Checklist
- [ ] Does the method show up under its correct filter (`2D Canvas` vs `3D Canvas`)?
- [ ] Can you select the method without console errors triggering related to missing `params` or `palettes`?
- [ ] Does clicking the **Concept** tab show the `narrative` and `equation` fields populated?
- [ ] Does clicking **Save to Gallery** render the thumbnail properly?
- [ ] Does selecting a new color theme from the right-hand **Method Palettes** or **Harmony Builder** instantly recolor the canvas?
