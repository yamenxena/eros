# Eros — Digital Art Agent

Generative art engine using mathematics, physics, neural networks, and fuzzy logic.

## Quick Start

```bash
cd D:\YO\Eros\app
pip install -r requirements.txt
python main.py
```

Then open → http://127.0.0.1:7860

## Engines

| Tab | Engine | What it creates |
|-----|--------|----------------|
| 🌀 Attractors | Math | Lorenz, Rössler, Aizawa, Thomas strange attractors |
| 〰️ Lissajous | Math | Parametric harmonic curves |
| ⚛️ Physics | Physics | N-body particle systems with trails |
| 🌊 Flow Fields | Flow | Perlin noise vector field particle tracing |
| 🔷 Fractals | Fractal | Mandelbrot, Julia sets, L-system trees |
| 🧠 Fuzzy Logic | Fuzzy | Navigate parameter space with linguistic inputs |
| 🖌️ Neural Style | Neural | Artistic filter post-processing |
| 🔄 Iterator | Iterator | Evolve art through parameter mutation |

## File Structure

```
Eros/
├── .agents/          # Governance (constitution, guardrails, policies)
├── app/              # Python generative art app
│   ├── main.py       # Gradio entry point (8 tabs)
│   ├── engines/      # 6 generation engines
│   ├── composer.py   # Multi-engine blending
│   └── iterator.py   # Parameter mutation loop
├── context/          # Heuristics and goals
└── output/           # Generated art + presets
```

[AUTH: Eros | readme | 1.0.0 | 2026-03-27]
