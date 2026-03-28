---
description: main workflow — eros session lifecycle
---

# Main Workflow

This is the controlling workflow for all Eros sessions. Every session follows these steps.

## 1. Session Start — Re-Entry

1. Read constitution: `.agents/rules/eros.md`
2. Read goals: `context/GOALS.md`
3. Read current tasks (if exists): `operations/tasks.md`
4. Scan recent presets: `output/presets/` (last 5)

## 2. Understand Request

1. Parse the user directive
2. Identify target engine(s): `math`, `physics`, `neural`, `fuzzy`, `flow`, `fractal`
3. Determine whether this is a **new generation**, **iteration**, or **composition**

## 3. Pre-Flight Checks

1. Validate parameters against guardrails (`.agents/config/guardrails.md`)
2. Estimate render time — warn if > 60s
3. Confirm resource limits (resolution, particle count, iterations)

## 4. Generate

1. Execute the engine pipeline via `app/main.py`
2. Log all parameters + seed for reproducibility
3. Save output to `output/renders/` with naming per policies

## 5. Post-Generation

1. Write provenance sidecar `.json` alongside the render
2. If user requests iteration → mutate parameters → return to step 4
3. If user approves → save preset to `output/presets/`

## 6. Session End

1. Update `operations/tasks.md` with session summary
2. Commit any new presets or notable outputs
