---
type: context
version: 1.0.0
last_updated: 2026-03-27
---

# Generative Art Heuristics

## §1 — Engine Selection

| Want this? | Use this engine |
|-----------|----------------|
| Swirling organic lines | Flow engine (Perlin noise) |
| Cosmic/galactic patterns | Physics engine (N-body) |
| Infinite zoom patterns | Fractal engine (Mandelbrot/Julia) |
| Geometric precision | Math engine (Lissajous/parametric) |
| Painterly texture | Neural engine (style transfer) |
| Tree/plant structures | Fractal engine (L-systems) |
| Strange loops/chaos | Math engine (attractors) |
| Dynamic evolving art | Iterator (any engine + mutation) |

## §2 — Parameter Sweet Spots

### Math Engine — Attractors
- Lorenz: σ=10, ρ=28, β=8/3 (classic butterfly)
- Rössler: a=0.2, b=0.2, c=5.7 (single scroll)
- Steps: 50,000–200,000 for rich detail
- dt: 0.001–0.01 (smaller = smoother, slower)

### Physics Engine — Particles
- 1,000–10,000 particles for visible structure
- Gravity strength: 0.01–1.0 (higher = tighter clusters)
- Trail length: 20–100 (longer = smoother)
- Damping: 0.98–0.999 (close to 1 = long-lived motion)

### Flow Engine
- Noise scale: 0.003–0.01 (smaller = larger features)
- Octaves: 3–6 (more = more detail)
- Particle count: 2,000–20,000
- Step size: 1–5 pixels

### Fractal Engine
- Mandelbrot max iterations: 256–1000 (more = finer detail at edges)
- Julia c: try (-0.7, 0.27015), (-0.4, 0.6), (0.285, 0.01)
- Color mapping: log-scale iterations → HSV hue

## §3 — Color Heuristics

| Palette Name | H range | S | L | Use for |
|-------------|---------|---|---|---------|
| Deep Space | 220-280° | 0.6-1.0 | 0.1-0.5 | Fractals, attractors |
| Solar Flare | 0-40° | 0.8-1.0 | 0.3-0.7 | Physics particles |
| Ocean Dream | 180-240° | 0.4-0.8 | 0.3-0.6 | Flow fields |
| Forest | 80-160° | 0.3-0.7 | 0.2-0.5 | L-systems |
| Monochrome | any | 0 | 0-1 | Minimalist |
| Rainbow | 0-360° | 0.7 | 0.5 | Iteration sequences |

## §4 — Composition Rules

1. **Layer order:** Background (fractal/noise) → Mid (physics/flow) → Foreground (math) → Post (neural)
2. **Blend modes:** Additive for light effects, Screen for layering, Multiply for depth
3. **Resolution:** Generate at 2× target, downsample for anti-aliasing
4. **Aspect ratios:** 1:1 (social media), 16:9 (desktop), 3:4 (print)

## §5 — Iteration Heuristics

- **Random mutation:** Perturb each parameter by ±5-15% of its range
- **Interesting detection:** Measure entropy + edge density → higher = more interesting
- **Convergence:** If 5 consecutive mutations produce visually similar results → increase mutation rate
- **Gallery selection:** Keep top 20% by entropy/variance → discard rest

## §6 — Fuzzy Logic Aesthetic Rules

| Linguistic Input | Numerical Effect |
|-----------------|-----------------|
| "chaos = high" | particle_count ×2, force_strength ×1.5, damping -0.02 |
| "density = dense" | particle_count ×3, trail_length ×2 |
| "warmth = warm" | hue_shift → [0°-60°], saturation ×1.2 |
| "warmth = cool" | hue_shift → [180°-280°], saturation ×0.8 |
| "complexity = simple" | octaves = 2, particle_count ÷2 |
| "complexity = rich" | octaves = 6, particle_count ×3, steps ×2 |

[AUTH: Eros | heuristics | 1.0.0 | 2026-03-27]
