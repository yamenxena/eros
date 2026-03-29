/* ═══════════════════════════════════════════════════════════════
   Eros — Method: Oxman Ecology
   Variable-density material ecology via Perlin noise + Wolff's Law.
   Source: Analysis/Mukarnas/muqarnas-generative-heuristics.md §5
   ═══════════════════════════════════════════════════════════════ */
if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'oxman', name: 'Oxman Ecology', category: 'muqarnas', version: '1.0.0',
    description: 'Variable-density material ecology. Multi-octave Perlin noise maps to functional density grading with Wolff\'s Law adaptive porosity.',
    palettes: [
      { name: 'Trabecular Bone', mood: 'Biological Structure', colors: [
        { h: 35, s: 40, l: 85 }, { h: 30, s: 35, l: 70 }, { h: 25, s: 30, l: 50 },
        { h: 20, s: 25, l: 35 }, { h: 15, s: 20, l: 15 }
      ]},
      { name: 'Chitin Armor', mood: 'Insect Carapace', colors: [
        { h: 45, s: 50, l: 65 }, { h: 100, s: 40, l: 45 }, { h: 60, s: 35, l: 30 },
        { h: 30, s: 55, l: 35 }, { h: 0, s: 0, l: 8 }
      ]},
      { name: 'Melanin Gradient', mood: 'Skin Topology', colors: [
        { h: 25, s: 55, l: 70 }, { h: 20, s: 50, l: 55 }, { h: 15, s: 45, l: 40 },
        { h: 10, s: 40, l: 28 }, { h: 5, s: 35, l: 15 }
      ]},
      { name: 'Silk Pavilion', mood: 'Multi-Material', colors: [
        { h: 55, s: 30, l: 90 }, { h: 200, s: 40, l: 60 }, { h: 45, s: 70, l: 55 },
        { h: 340, s: 45, l: 40 }, { h: 210, s: 30, l: 20 }
      ]}
    ],
    params: [
      { key: 'seed',        type: 'number', label: 'Seed',             default: 42,    min: 1,     max: 999999 },
      { key: 'octaves',     type: 'range',  label: 'Noise Octaves',    default: 6,     min: 1,     max: 8,     precision: 0 },
      { key: 'persistence', type: 'range',  label: 'Persistence',      default: 0.5,   min: 0.2,   max: 0.8,   precision: 2 },
      { key: 'lacunarity',  type: 'range',  label: 'Lacunarity',       default: 2.0,   min: 1.5,   max: 3.5,   precision: 1 },
      { key: 'baseFreq',    type: 'range',  label: 'Base Frequency',   default: 0.004, min: 0.001, max: 0.015, precision: 3 },
      { key: 'densityMin',  type: 'range',  label: 'Min Density (ρ)',  default: 0.05,  min: 0.0,   max: 0.4,   precision: 2 },
      { key: 'densityMax',  type: 'range',  label: 'Max Density (ρ)',  default: 1.0,   min: 0.5,   max: 1.0,   precision: 2 },
      { key: 'wolffRate',   type: 'range',  label: 'Wolff Remodeling', default: 0.3,   min: 0.0,   max: 1.0,   precision: 2 },
      { key: 'cellSize',    type: 'range',  label: 'Cell Resolution',  default: 4,     min: 1,     max: 12,    precision: 0 },
    ],
    narrative(p) {
      return `Material ecology: ${p.octaves}-octave Perlin (pers=${p.persistence}, lac=${p.lacunarity}). ` +
        `Density [${p.densityMin}, ${p.densityMax}]. Wolff η=${p.wolffRate}.`;
    },
    equation(p) {
      return `noise(x,y) = Σ ${p.persistence}^i · perlin(x·${p.lacunarity}^i·${p.baseFreq}, ...)\n` +
             `ρ = remap(noise, [-1,1], [${p.densityMin}, ${p.densityMax}])\n` +
             `ρ_new = ρ_old + ${p.wolffRate}·(σ - σ_eq)`;
    },
    render(canvas, ctx, W, H, params, palette) {
      const startT = performance.now();
      const sn = new SimplexNoise(params.seed);
      const cs = params.cellSize;
      const cols = Math.ceil(W / cs), rows = Math.ceil(H / cs);

      // Phase 1: Raw density field
      const df = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = sn.fbm(c * cs * params.baseFreq, r * cs * params.baseFreq,
                             params.octaves, params.persistence, params.lacunarity);
          df[r * cols + c] = Math.max(0, Math.min(1,
            params.densityMin + (val + 1) * 0.5 * (params.densityMax - params.densityMin)));
        }
      }

      // Phase 2: Wolff's Law remodeling
      if (params.wolffRate > 0.01) {
        const rm = new Float32Array(df);
        for (let r = 1; r < rows - 1; r++) {
          for (let c = 1; c < cols - 1; c++) {
            const idx = r * cols + c;
            const lap = df[(r-1)*cols+c] + df[(r+1)*cols+c] + df[r*cols+c-1] + df[r*cols+c+1] - 4 * df[idx];
            rm[idx] = Math.max(0, Math.min(1, df[idx] + params.wolffRate * (Math.abs(lap) * 10 - 0.5) * 0.1));
          }
        }
        df.set(rm);
      }

      // Phase 3: Render
      const bg = palette[palette.length - 1];
      ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
      ctx.fillRect(0, 0, W, H);

      const imgData = ctx.createImageData(W, H);
      const data = imgData.data;
      const palLen = palette.length;
      const sn2 = new SimplexNoise(params.seed + 7919);

      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const c = Math.min(cols - 1, Math.floor(px / cs));
          const r = Math.min(rows - 1, Math.floor(py / cs));
          const d = Math.max(0, Math.min(1, df[r * cols + c] + sn2.noise2(px * 0.05, py * 0.05) * 0.1));

          const palPos = d * (palLen - 1);
          const pi = Math.floor(palPos), frac = palPos - pi;
          const c0 = palette[Math.min(pi, palLen - 1)];
          const c1 = palette[Math.min(pi + 1, palLen - 1)];
          const [rv, gv, bv] = hsl2rgb(
            c0.h + (c1.h - c0.h) * frac,
            c0.s + (c1.s - c0.s) * frac,
            c0.l + (c1.l - c0.l) * frac
          );

          const idx = (py * W + px) * 4;
          const alpha = d < params.densityMin * 1.5 ? d / (params.densityMin * 1.5) : 1.0;
          data[idx] = rv; data[idx+1] = gv; data[idx+2] = bv; data[idx+3] = Math.floor(alpha * 255);
        }
      }
      ctx.putImageData(imgData, 0, 0);

      return { cells: cols * rows, octaves: params.octaves, perf: `${(performance.now() - startT).toFixed(0)}ms` };
    }
  });
}
