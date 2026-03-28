---
description: palette wiring rule — every method must be connected to the palette panel and animation system
---

# Method Contract: Palette + Animation Wiring

## Mandate

**Every method registered in `MethodRegistry` MUST:**
1. Define a `palettes[]` array with ≥ 1 entry
2. Accept `palette` as the 6th argument to `render()` and use it exclusively for colour
3. Be automatically animatable — no extra wiring needed beyond following the `render()` interface

---

## Required Method Structure

```js
const MyMethod = {
  id: 'my-method',
  name: 'My Method Name',
  description: 'One-line description.',
  version: 1,

  // REQUIRED — at least one palette
  palettes: [
    {
      name: 'Palette Name',
      mood: 'Short mood label',
      colors: [
        { h: 0,  s: 80, l: 50 },  // HSL — Hue 0–360, Sat 0–100, Lit 0–100
        { h: 60, s: 70, l: 45 },
        // 4–8 colors recommended
      ],
    },
  ],

  // REQUIRED — render uses palette argument, never internal hardcoded colors
  render(canvas, ctx, W, H, params, palette) {
    // Use palette[i].h / palette[i].s / palette[i].l
    // Never hardcode colors inside render()
    // Alpha must always be 255 (fully opaque) — no partial transparency
  },

  // REQUIRED — all animatable params must be type: 'range'
  params: [
    { key: 'seed',    type: 'number', min: 1,   max: 99999, default: 42 },
    { key: 'erosion', type: 'range',  min: 0,   max: 100,   default: 0,
      scale: 0.01, precision: 2 },
    // Add all other knobs as 'range' for full animation support
  ],

  narrative(p) { return `...`; },
  equation(p)  { return `...`; },
};

MethodRegistry.register(MyMethod);
```

---

## Palette Panel Connection (automatic)

When a method loads via `switchMethod(id)`:
1. `buildPalettePanel()` populates the right panel with the method's palette cards
2. Clicking any palette card → `applyPalette(pal, idx)` → immediate re-render
3. Active swatch bar at panel top updates automatically

**No extra code needed.** The system handles it if `palettes[]` is defined.

---

## Animation System Contract

### How it works

`AnimController` provides per-param linear keyframe animation for any `range` param:

| Field | Meaning |
|-------|---------|
| **From** | Start value — set manually by the user |
| **To** | End value — **always wired to the current field parameter state** |
| **Mode** | `A→B` (forward), `B→A` (backward), `A→B→A` (ping-pong) |

The `To` field is **read-only and live**. When a sidebar slider changes, `To` updates automatically via `_syncAnimTo()`. This means:
> "Set your desired final state with the sliders → open Animate → set From → hit Play/Record"

### Wiring rule

- **`render(canvas, ctx, W, H, params, palette)`** is the only contract.
- The animation engine calls `render()` with interpolated params each frame.
- No method-specific animation code is ever needed.
- Every `range` param automatically appears in the animation panel.

### `To` is always the current state

```
User moves Erosion slider to 0.80
  → state.params.erosion = 0.80
  → _syncAnimTo('erosion', 0.80, 2) is called
  → AnimController.defs.erosion.to = 0.80
  → DOM anim-to[data-key="erosion"].value = "0.80"  (readonly, accent color)
```

The `from` is retained across slider changes so the user can set: "go from 0.00 to wherever I am now."

### Recording

- **▶ Preview** — renders frames as fast as possible, no video file
- **⏺ Record** — captures every frame to `canvas.captureStream(0)` + `requestFrame()`, encodes to WebM, auto-downloads on completion

---

## Colour Rules (both methods)

```js
// CORRECT — use palette's l as the true lightness base
const lBase = palColor.l;
const l = Math.min(98, Math.max(2, lBase * (0.6 + 0.8 * (1 - depthT))));

// WRONG — hardcoded range ignores palette
const l = 12 + 53 * ringT; // parchment (l=95) renders as near-black
```

```js
// CORRECT — always opaque
data[idx+3] = 255;

// WRONG — partial alpha muddles colours against black background
data[idx+3] = (a * 255) | 0;  // where a = 0.5 + 0.5 * t
```

### Colour distribution — uniform hashing

```js
// CORRECT — Knuth multiplicative hash, coprime to any palLen
const uidHash  = ((uid * 2654435761) >>> 0);
const palIdx   = (uidHash + depthShift + seed) % palLen;

// WRONG — gcd(step, palLen) > 1 causes clustering
const palIdx   = (uid * 3) % 6; // only ever 0, 3 → 2 colours used
```

---

## Adding a New Method — Checklist

- [ ] `palettes[]` with ≥ 1 entry, each having `name`, `mood`, `colors[]`
- [ ] `render()` uses `palette[i].{h,s,l}` exclusively — no hardcoded colours
- [ ] Alpha is always 255 (fully opaque)
- [ ] Lightness uses `palette[i].l` as base — modulate ±20–40%, clamp 2–98
- [ ] All adjustable parameters are `type: 'range'` for animation support
- [ ] File saved to `app/methods/my-method.js`
- [ ] `<script src="methods/my-method.js">` added to `index.html` **before** `eros.js`
- [ ] No `marginRatio` or manual border/margin — canvas fills edge-to-edge
