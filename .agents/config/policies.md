---
type: config
version: 1.0.0
last_updated: 2026-03-27
---

# Policies

## §1 — Output Naming
`[engine]_[timestamp]_[hash6].png`
Example: `fractal_20260327_a3f2c1.png`

## §2 — Preset Naming
`[engine]_[descriptive-name].json`
Example: `math_lorenz-purple-spiral.json`

## §3 — Provenance
Every output includes a sidecar `.json` with:
- Engine(s) used, all parameters, render timestamp
- Resolution, duration (if animated), seed value

## §4 — Reproducibility
Given the same parameters + seed → identical output. Always save seed.

[AUTH: Eros | policies | 1.0.0 | 2026-03-27]
