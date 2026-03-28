---
type: config
version: 1.0.0
last_updated: 2026-03-27
---

# Guardrails

## §1 — Path Boundaries
- Agent writes ONLY to `D:\YO\Eros\`
- WS and KB are read-only references

## §2 — Resource Limits
- Max render resolution: 4096×4096 (default 1024×1024)
- Max particle count: 100,000 (default 5,000)
- Max iteration steps: 10,000 (default 1,000)
- Max fractal zoom: 10^15 (floating point limit)
- Timeout per render: 120 seconds (warn at 60s)
- Max output file size: 50MB per image, 200MB per video

## §3 — Neural Engine Limits
- Style transfer: max 500 iterations (default 100)
- Model loading: PyTorch CPU mode by default, GPU if available
- No model fine-tuning (inference only)
- No external API calls for generation (all local)

## §4 — Safety
- No NSFW content generation
- No copyrighted artwork reproduction (style transfer uses style, not content)
- All generated art includes metadata attribution in EXIF/sidecar

[AUTH: Eros | guardrails | 1.0.0 | 2026-03-27]
