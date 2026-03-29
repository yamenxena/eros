/* ═══════════════════════════════════════════════════════════════
   Eros — Method: ZHA Gyroid
   Triply Periodic Minimal Surface (TPMS) cross-section renderer.
   Implements Gyroid, Schwarz-P, and Diamond implicit surfaces.
   Source: Analysis/Mukarnas/muqarnas-generative-heuristics.md §6
   ═══════════════════════════════════════════════════════════════ */
if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'gyroid', name: 'ZHA Gyroid', category: 'muqarnas', version: '1.0.0',
    description: 'Triply Periodic Minimal Surface cross-sections (Gyroid, Schwarz-P, Diamond). Implicit function level-set rendering with variable shell thickness.',
    palettes: [
      { name: 'Concrete Shell', mood: 'Structural Exhibition', colors: [
        { h: 0, s: 0, l: 90 }, { h: 0, s: 0, l: 70 }, { h: 0, s: 0, l: 45 },
        { h: 210, s: 10, l: 30 }, { h: 0, s: 0, l: 10 }
      ]},
      { name: 'Resin Print', mood: '3D Printed', colors: [
        { h: 35, s: 60, l: 60 }, { h: 25, s: 50, l: 45 }, { h: 15, s: 40, l: 30 },
        { h: 200, s: 25, l: 55 }, { h: 0, s: 0, l: 5 }
      ]},
      { name: 'Biocomposite', mood: 'Living Material', colors: [
        { h: 145, s: 45, l: 50 }, { h: 160, s: 35, l: 40 }, { h: 100, s: 40, l: 55 },
        { h: 55, s: 50, l: 65 }, { h: 200, s: 20, l: 15 }
      ]},
      { name: 'Titanium Blue', mood: 'Anodized Metal', colors: [
        { h: 215, s: 60, l: 55 }, { h: 225, s: 50, l: 40 }, { h: 200, s: 45, l: 65 },
        { h: 240, s: 35, l: 30 }, { h: 210, s: 20, l: 12 }
      ]}
    ],
    params: [
      { key: 'seed',      type: 'number', label: 'Seed',            default: 42,   min: 1,    max: 999999 },
      { key: 'surface',   type: 'select', label: 'Surface Type',    default: 'gyroid', options: ['gyroid', 'schwarzP', 'diamond'] },
      { key: 'scale',     type: 'range',  label: 'Repetitions',     default: 4,    min: 1,    max: 12,    precision: 1 },
      { key: 'zSlice',    type: 'range',  label: 'Z-Slice',         default: 0.0,  min: 0.0,  max: 1.0,   precision: 2 },
      { key: 'thickness', type: 'range',  label: 'Shell Thickness', default: 0.4,  min: 0.05, max: 1.2,   precision: 2 },
      { key: 'gradient',  type: 'range',  label: 'Thickness Gradient', default: 0.0, min: 0.0, max: 1.0,  precision: 2 },
      { key: 'rotation',  type: 'range',  label: 'Rotation (°)',    default: 0,    min: 0,    max: 360,   precision: 0 },
    ],
    narrative(p) {
      return `A ${p.surface} TPMS cross-section at z=${p.zSlice.toFixed(2)}, repeating ${p.scale} times. ` +
        `Shell thickness=${p.thickness} with gradient=${p.gradient}. Rotation=${p.rotation}°.`;
    },
    equation(p) {
      const eqs = {
        gyroid:   'f = sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x)',
        schwarzP: 'f = cos(x) + cos(y) + cos(z)',
        diamond:  'f = sin(x)sin(y)sin(z) + sin(x)cos(y)cos(z) + cos(x)sin(y)cos(z) + cos(x)cos(y)sin(z)'
      };
      return `${eqs[p.surface]}\nshell: |f(x,y,z)| < ${p.thickness}/2\nz = ${p.zSlice}`;
    },
    render(canvas, ctx, W, H, params, palette) {
      const startT = performance.now();
      const bg = palette[palette.length - 1];
      ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
      ctx.fillRect(0, 0, W, H);

      const imgData = ctx.createImageData(W, H);
      const data = imgData.data;
      const palLen = palette.length - 1;
      const TWO_PI = Math.PI * 2;
      const scale = params.scale;
      const z = params.zSlice * TWO_PI;
      const rot = params.rotation * Math.PI / 180;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);

      // TPMS implicit functions
      const surfaces = {
        gyroid: (x, y, z) => Math.sin(x) * Math.cos(y) + Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(x),
        schwarzP: (x, y, z) => Math.cos(x) + Math.cos(y) + Math.cos(z),
        diamond: (x, y, z) => Math.sin(x)*Math.sin(y)*Math.sin(z) + Math.sin(x)*Math.cos(y)*Math.cos(z) +
                              Math.cos(x)*Math.sin(y)*Math.cos(z) + Math.cos(x)*Math.cos(y)*Math.sin(z)
      };
      const fn = surfaces[params.surface] || surfaces.gyroid;

      // Distance from center for gradient thickness
      const cx = W / 2, cy = H / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          // Normalize and rotate
          let nx = (px / W - 0.5), ny = (py / H - 0.5);
          const rx = nx * cosR - ny * sinR;
          const ry = nx * sinR + ny * cosR;

          const x = (rx + 0.5) * scale * TWO_PI;
          const y = (ry + 0.5) * scale * TWO_PI;

          // Variable thickness (gradient from center)
          const dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)) / maxDist;
          const localThick = params.thickness * (1 + params.gradient * (0.5 - dist));

          const f = fn(x, y, z);
          const absF = Math.abs(f);
          const idx = (py * W + px) * 4;

          if (absF < localThick / 2) {
            // On the shell surface
            const intensity = 1.0 - (absF / (localThick / 2));
            const palPos = intensity * (palLen - 1);
            const pi = Math.floor(palPos), frac = palPos - pi;
            const c0 = palette[Math.min(pi, palLen - 1)];
            const c1 = palette[Math.min(pi + 1, palLen - 1)];
            const [r, g, b] = hsl2rgb(
              c0.h + (c1.h - c0.h) * frac,
              c0.s + (c1.s - c0.s) * frac,
              c0.l + (c1.l - c0.l) * frac
            );
            data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
          } else {
            // Void — draw background
            const [r, g, b] = hsl2rgb(bg.h, bg.s, bg.l);
            data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return { surface: params.surface, scale, perf: `${(performance.now() - startT).toFixed(0)}ms` };
    }
  });
}
