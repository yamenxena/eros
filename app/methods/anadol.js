/* ═══════════════════════════════════════════════════════════════
   Eros — Method: Anadol Fluid
   Stable Fluids (Jos Stam 1999) applied as a painting medium.
   Navier-Stokes velocity field advects colour density across
   the canvas, creating Refik Anadol-style data murmurations.

   Source: Analysis/Mukarnas/muqarnas-generative-heuristics.md §3
   ═══════════════════════════════════════════════════════════════ */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'anadol',
    name: 'Anadol Fluid',
    category: 'muqarnas',
    version: '1.0.0',
    description: 'Navier-Stokes stable fluid simulation. Data-driven force injections create swirling, luminous data murmurations inspired by Refik Anadol.',

    palettes: [
      {
        name: 'Machine Hallucination', mood: 'Neural Latent Space',
        colors: [
          { h: 270, s: 80, l: 55 }, { h: 200, s: 70, l: 50 },
          { h: 320, s: 65, l: 45 }, { h: 180, s: 60, l: 60 },
          { h: 0,   s: 0,  l: 5 },
        ]
      },
      {
        name: 'Coral Memory', mood: 'Bioluminescent',
        colors: [
          { h: 350, s: 75, l: 55 }, { h: 30,  s: 85, l: 55 },
          { h: 45,  s: 90, l: 60 }, { h: 15,  s: 70, l: 40 },
          { h: 0,   s: 0,  l: 3 },
        ]
      },
      {
        name: 'Wind Data', mood: 'Atmospheric Flow',
        colors: [
          { h: 200, s: 50, l: 65 }, { h: 210, s: 40, l: 80 },
          { h: 195, s: 55, l: 45 }, { h: 220, s: 35, l: 30 },
          { h: 0,   s: 0,  l: 98 },
        ]
      },
      {
        name: 'Unsupervised', mood: 'MoMA Installation',
        colors: [
          { h: 45,  s: 80, l: 60 }, { h: 15,  s: 70, l: 50 },
          { h: 190, s: 60, l: 40 }, { h: 340, s: 55, l: 45 },
          { h: 60,  s: 20, l: 10 },
        ]
      }
    ],

    params: [
      { key: 'seed',       type: 'number', label: 'Seed',           default: 42,    min: 1,     max: 999999 },
      { key: 'gridRes',    type: 'range',  label: 'Grid Resolution', default: 128,  min: 32,    max: 256,    precision: 0 },
      { key: 'viscosity',  type: 'range',  label: 'Viscosity (ν)',   default: 0.0001, min: 0.00001, max: 0.005, precision: 5 },
      { key: 'diffusion',  type: 'range',  label: 'Diffusion',      default: 0.0001, min: 0.00001, max: 0.005, precision: 5 },
      { key: 'simSteps',   type: 'range',  label: 'Sim Steps',      default: 60,    min: 10,    max: 200,    precision: 0 },
      { key: 'forceScale', type: 'range',  label: 'Force Scale',    default: 5000,  min: 500,   max: 20000,  precision: 0 },
      { key: 'injections', type: 'range',  label: 'Force Injections', default: 12,  min: 3,     max: 40,     precision: 0 },
      { key: 'brightness', type: 'range',  label: 'Brightness',     default: 1.5,   min: 0.5,   max: 4.0,    precision: 1 },
    ],

    narrative(p) {
      return `A ${p.gridRes}×${p.gridRes} Navier-Stokes fluid field evolves over ${p.simSteps} timesteps. ` +
        `${p.injections} seed-driven force injections at scale ${p.forceScale} create swirling density patterns. ` +
        `Viscosity ν=${p.viscosity} governs the smoothness of the flow.`;
    },

    equation(p) {
      return `∂u/∂t = -(u·∇)u - ∇p/ρ + ${p.viscosity}∇²u + F\n` +
             `∇·u = 0\n` +
             `Advection: u_new(x) = u_old(x - Δt·u(x))\n` +
             `Project: u ← u - ∇(∇⁻²(∇·u))`;
    },

    render(canvas, ctx, W, H, params, palette) {
      const startT = performance.now();
      const prng = new PRNG(params.seed);
      const N = params.gridRes;
      const size = (N + 2) * (N + 2);

      // Fluid state arrays
      let u = new Float32Array(size);
      let v = new Float32Array(size);
      let u0 = new Float32Array(size);
      let v0 = new Float32Array(size);
      let dens = new Float32Array(size);
      let dens0 = new Float32Array(size);

      const IX = (i, j) => i + (N + 2) * j;
      const dt = 0.1;

      // Diffuse (Gauss-Seidel relaxation)
      const diffuse = (b, x, x0, diff) => {
        const a = dt * diff * N * N;
        for (let k = 0; k < 20; k++) {
          for (let j = 1; j <= N; j++) {
            for (let i = 1; i <= N; i++) {
              x[IX(i,j)] = (x0[IX(i,j)] + a * (
                x[IX(i-1,j)] + x[IX(i+1,j)] +
                x[IX(i,j-1)] + x[IX(i,j+1)]
              )) / (1 + 4 * a);
            }
          }
          this._setBnd(N, b, x);
        }
      };

      // Advect (Semi-Lagrangian)
      const advect = (b, d, d0, velU, velV) => {
        const dt0 = dt * N;
        for (let j = 1; j <= N; j++) {
          for (let i = 1; i <= N; i++) {
            let x = i - dt0 * velU[IX(i,j)];
            let y = j - dt0 * velV[IX(i,j)];
            x = Math.max(0.5, Math.min(N + 0.5, x));
            y = Math.max(0.5, Math.min(N + 0.5, y));
            const i0 = Math.floor(x), i1 = i0 + 1;
            const j0 = Math.floor(y), j1 = j0 + 1;
            const s1 = x - i0, s0 = 1 - s1;
            const t1 = y - j0, t0 = 1 - t1;
            d[IX(i,j)] = s0 * (t0 * d0[IX(i0,j0)] + t1 * d0[IX(i0,j1)]) +
                          s1 * (t0 * d0[IX(i1,j0)] + t1 * d0[IX(i1,j1)]);
          }
        }
        this._setBnd(N, b, d);
      };

      // Project (Helmholtz-Hodge decomposition)
      const project = (velU, velV, p, div) => {
        for (let j = 1; j <= N; j++) {
          for (let i = 1; i <= N; i++) {
            div[IX(i,j)] = -0.5 * (velU[IX(i+1,j)] - velU[IX(i-1,j)] +
                                     velV[IX(i,j+1)] - velV[IX(i,j-1)]) / N;
            p[IX(i,j)] = 0;
          }
        }
        this._setBnd(N, 0, div);
        this._setBnd(N, 0, p);
        for (let k = 0; k < 20; k++) {
          for (let j = 1; j <= N; j++) {
            for (let i = 1; i <= N; i++) {
              p[IX(i,j)] = (div[IX(i,j)] + p[IX(i-1,j)] + p[IX(i+1,j)] +
                             p[IX(i,j-1)] + p[IX(i,j+1)]) / 4;
            }
          }
          this._setBnd(N, 0, p);
        }
        for (let j = 1; j <= N; j++) {
          for (let i = 1; i <= N; i++) {
            velU[IX(i,j)] -= 0.5 * N * (p[IX(i+1,j)] - p[IX(i-1,j)]);
            velV[IX(i,j)] -= 0.5 * N * (p[IX(i,j+1)] - p[IX(i,j-1)]);
          }
        }
        this._setBnd(N, 1, velU);
        this._setBnd(N, 2, velV);
      };

      // Velocity step
      const velStep = () => {
        u0.set(u); v0.set(v);
        diffuse(1, u, u0, params.viscosity);
        diffuse(2, v, v0, params.viscosity);
        project(u, v, u0, v0);
        u0.set(u); v0.set(v);
        advect(1, u, u0, u0, v0);
        advect(2, v, v0, u0, v0);
        project(u, v, u0, v0);
      };

      // Density step
      const densStep = () => {
        dens0.set(dens);
        diffuse(0, dens, dens0, params.diffusion);
        dens0.set(dens);
        advect(0, dens, dens0, u, v);
      };

      // Inject forces and density (data-driven, PRNG-based)
      const sn = new SimplexNoise(params.seed);
      for (let inj = 0; inj < params.injections; inj++) {
        const fi = Math.floor(prng.range(N * 0.15, N * 0.85));
        const fj = Math.floor(prng.range(N * 0.15, N * 0.85));
        const angle = prng.next() * Math.PI * 2;
        const force = params.forceScale;
        // Spread the injection over a radius
        const radius = Math.floor(prng.range(2, N * 0.08));
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ii = fi + dx, jj = fj + dy;
            if (ii < 1 || ii > N || jj < 1 || jj > N) continue;
            if (dx*dx + dy*dy > radius*radius) continue;
            const falloff = 1 - Math.sqrt(dx*dx + dy*dy) / radius;
            u[IX(ii,jj)] += Math.cos(angle) * force * falloff;
            v[IX(ii,jj)] += Math.sin(angle) * force * falloff;
            dens[IX(ii,jj)] += prng.range(50, 200) * falloff;
          }
        }
      }

      // Simulate
      for (let step = 0; step < params.simSteps; step++) {
        velStep();
        densStep();
      }

      // Render density field to canvas
      const bg = palette[palette.length - 1];
      ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
      ctx.fillRect(0, 0, W, H);

      const imgData = ctx.createImageData(W, H);
      const data = imgData.data;
      const palLen = palette.length - 1;
      const scaleX = W / N, scaleY = H / N;

      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const gi = Math.min(N, Math.max(1, Math.floor(px / scaleX)));
          const gj = Math.min(N, Math.max(1, Math.floor(py / scaleY)));
          const d = dens[IX(gi, gj)] * params.brightness;
          const clamped = Math.min(1, Math.max(0, d / 255));

          // Map density to palette with smooth interpolation
          const palPos = clamped * (palLen - 1);
          const palIdx = Math.floor(palPos);
          const palFrac = palPos - palIdx;
          const c0 = palette[Math.min(palIdx, palLen - 1)];
          const c1 = palette[Math.min(palIdx + 1, palLen - 1)];

          const h = c0.h + (c1.h - c0.h) * palFrac;
          const s = c0.s + (c1.s - c0.s) * palFrac;
          const l = c0.l + (c1.l - c0.l) * palFrac;

          const [r, g, b] = hsl2rgb(h, s, Math.min(95, l + clamped * 30));
          const idx = (py * W + px) * 4;
          // Blend over background based on density
          const alpha = Math.min(1, clamped * 2);
          const bgRgb = hsl2rgb(bg.h, bg.s, bg.l);
          data[idx]     = Math.floor(bgRgb[0] * (1 - alpha) + r * alpha);
          data[idx + 1] = Math.floor(bgRgb[1] * (1 - alpha) + g * alpha);
          data[idx + 2] = Math.floor(bgRgb[2] * (1 - alpha) + b * alpha);
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      return { gridRes: N, simSteps: params.simSteps, perf: `${(performance.now() - startT).toFixed(0)}ms` };
    },

    _setBnd(N, b, x) {
      const IX = (i, j) => i + (N + 2) * j;
      for (let i = 1; i <= N; i++) {
        x[IX(0,   i)] = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
        x[IX(N+1, i)] = b === 1 ? -x[IX(N, i)] : x[IX(N, i)];
        x[IX(i,   0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, N+1)] = b === 2 ? -x[IX(i, N)] : x[IX(i, N)];
      }
      x[IX(0,   0)]   = 0.5 * (x[IX(1, 0)]   + x[IX(0, 1)]);
      x[IX(0,   N+1)] = 0.5 * (x[IX(1, N+1)] + x[IX(0, N)]);
      x[IX(N+1, 0)]   = 0.5 * (x[IX(N, 0)]   + x[IX(N+1, 1)]);
      x[IX(N+1, N+1)] = 0.5 * (x[IX(N, N+1)] + x[IX(N+1, N)]);
    }
  });
}
