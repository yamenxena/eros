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

### Mandatory Field Table

> **CRITICAL:** `MethodRegistry.register()` runs a runtime schema validator. Any method missing fields below will be REJECTED with errors in the browser console — it will NOT appear in the UI at all.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Unique lowercase handle (e.g. `'escher-periodic'`) |
| `name` | string | ✅ | Human-readable UI name |
| `version` | number/string | ✅ | Current method version (e.g. `1`) |
| `type` | `'2d'` or `'3d'` | ✅ | Determines canvas routing |
| `description` | string | ✅ | 1-2 sentence summary |
| `palettes` | array | ✅ | ≥1 entry, each: `{ name, mood, colors: [{h,s,l}...] }` |
| `params` | array | ✅ | Each entry MUST have `key`, `label`, `default` |
| `narrative(p)` | function | ✅ | Returns concept narrative string |
| `equation(p)` | function | ✅ | Returns field equation string |
| `render(...)` | function | ✅ | 2D: `(canvas, ctx, W, H, params, palette)` / 3D: `(renderer, scene, camera, controls, W, H, params, palette)` |

### Param Entry Requirements

Every entry in `params[]` MUST have:

| Field | Required | Notes |
|-------|----------|-------|
| `key` | ✅ | Unique string identifier |
| `label` | ✅ | Human-readable label shown in sidebar |
| `type` | ✅ | `'number'`, `'range'`, or `'select'` |
| `default` | ✅ | Default value (including for `select` types!) |
| `min`, `max` | for range/number | Slider/input bounds |
| `options` | for select | Array of valid values |
| `scale` | optional | Multiplier applied to raw slider value |
| `precision` | optional | Decimal places for display |
| `format` | optional | Custom display formatter function |
| `category` | optional | Groups params in sidebar sections |

### Palette Entry Requirements

Every entry in `palettes[]` MUST have:
- `name` (string) — palette display name
- `mood` (string) — short mood descriptor
- `colors` (array) — `{h, s, l}` objects. **Never hex strings.**

### Pre-Registration Gate

After writing your method file, open the browser console. If you see:
```
MethodRegistry: REJECTED 'your-method-id' — N schema violations:
  • params[2] (myParam) missing label (string)
  • missing narrative(p) (function)
```
...you MUST fix all listed violations before the method will appear in the UI.

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
- ✔️ `const prng = ErosEngine.seedPRNG(params.seed);`

## 4. Palette & Animation Wiring
Follow the rules outlined in `/palette-wiring`:
1. Your render method must actively read and map to the active UI palette passed as the `palette` argument.
2. Do not hardcode internal colors that cannot be overridden by the Gallery/Palette UI.
3. All adjustable parameters should be `type: 'range'` for full animation support.

## 5. Push to GitHub
Per eros.md §3.7 (Continuous Versioning), after a method is complete and verified, immediately commit and push to GitHub.

## 6. Verification Checklist
- [ ] Does `MethodRegistry.register()` accept the method without console errors?
- [ ] Does the method show up under its correct filter (`2D Canvas` vs `3D Canvas`)?
- [ ] Can you select the method without console errors related to missing `params` or `palettes`?
- [ ] Are all parameter labels rendered correctly in the sidebar (no "undefined")?
- [ ] Does clicking the **Concept** tab show the `narrative` and `equation` fields populated?
- [ ] Does clicking **Save to Gallery** render the thumbnail properly?
- [ ] Does selecting a new color theme from the right-hand **Method Palettes** or **Harmony Builder** instantly recolor the canvas?
- [ ] Has the code been committed and pushed to GitHub?
