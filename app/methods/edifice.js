/* ═══════════════════════════════════════════════════════════════
   Eros v7 — Method: Edifice (Mereological Tectonics)
   The sole SSoT method of the Eros generative engine.
   
   Lineage: kovach.js (v1.1) → edifice-v2 → edifice-v3 → this (v7.0)
   
   Features:
   ─ Position-deterministic color (immune to physics PRNG shifts)
   ─ Full cloth/spring physics simulation with controllable parameters
   ─ 3 fill styles (Random Walk, Random Box, Ns)
   ─ 9 displacement types (Twist, Sharp, Shift, Squish, Wave, Turn, Smooth, Detach, None)
   ─ Spring Mesh + RK4 Flow + Hybrid render modes
   ─ 3 texture styles (Lattice, Hatched, Sqribble)
   ─ TDA density clamping (prevents ink black-hole collapse)
   ─ Cell aspect ratio, symmetry modes, pack density control
   ─ Per-enclosure line width variation & explosion spread control
   ─ Canvas grain (plotter emulation)
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'edifice',
  name: 'Edifice (Mereological Tectonics)',
  category: 'Eros SSoT',
  version: '7.0.0',
  type: '2d',
  description: 'Brutalist mereological tectonics — cloth simulation, deterministic color, controllable physics, RK4 hatching, symmetry, and topological density regulation.',

  palettes: [
    {
      name: 'Edifice 834 (Blueprints)', mood: 'Structural Analysis',
      colors: [
        { h: 216, s: 68, l: 30 },
        { h: 204, s: 62, l: 48 },
        { h: 198, s: 58, l: 56 },
        { h: 36,  s: 20, l: 87 },
      ]
    },
    {
      name: 'Black Salt', mood: 'Carbon Scoring',
      colors: [
        { h: 218, s: 55, l: 18 },
        { h: 205, s: 50, l: 40 },
        { h: 195, s: 45, l: 58 },
        { h: 38,  s: 25, l: 87 },
      ]
    },
    {
      name: 'Risograph Red', mood: 'Ink Saturation',
      colors: [
        { h: 0,   s: 70, l: 40 },
        { h: 10,  s: 80, l: 50 },
        { h: 350, s: 60, l: 30 },
        { h: 42,  s: 20, l: 92 },
      ]
    },
    {
      name: 'Concrete Oxide', mood: 'Industrial Decay',
      colors: [
        { h: 30,  s: 35, l: 35 },
        { h: 22,  s: 45, l: 50 },
        { h: 15,  s: 30, l: 25 },
        { h: 40,  s: 15, l: 88 },
      ]
    },
    {
      name: 'Graphite', mood: 'Carbon Scoring',
      colors: [
        { h: 0,   s: 5,  l: 15 },
        { h: 0,   s: 0,  l: 30 },
        { h: 0,   s: 0,  l: 50 },
        { h: 40,  s: 10, l: 94 },
      ]
    },
    {
      name: 'Crimson Vault', mood: 'Iron & Blood',
      colors: [
        { h: 350, s: 60, l: 25 },
        { h: 355, s: 50, l: 40 },
        { h: 15,  s: 40, l: 50 },
        { h: 45,  s: 15, l: 90 },
      ]
    },
    {
      name: 'Sunflower', mood: 'Warm Harvest',
      colors: [
        { h: 42,  s: 75, l: 40 },
        { h: 35,  s: 80, l: 55 },
        { h: 28,  s: 65, l: 30 },
        { h: 48,  s: 20, l: 92 },
      ]
    },
    {
      name: 'Deep Ocean', mood: 'Abyssal Pressure',
      colors: [
        { h: 220, s: 65, l: 20 },
        { h: 200, s: 55, l: 35 },
        { h: 185, s: 50, l: 50 },
        { h: 190, s: 15, l: 90 },
      ]
    }
  ],

  params: [
    // ── Level 0: The Seed ────────────────────────────
    { key: 'seed',         type: 'number', label: 'Hash Seed',           default: 834,   min: 1,     max: 999999, category: 'Method' },
    { key: 'canvasMargin', type: 'range',  label: 'Canvas Margin %',     default: 6,     min: 0,     max: 20,     precision: 0, category: 'Method' },

    // ── Level 1: The Pack ────────────────────────────
    { key: 'gridCols',     type: 'range',  label: 'Cell Area (Cols)',     default: 22,    min: 4,     max: 50,     precision: 0, category: 'Method' },
    { key: 'aspectRatio',  type: 'range',  label: 'Cell Aspect Ratio',   default: 1.0,   min: 0.25,  max: 4.0,    precision: 2, category: 'Method' },
    { key: 'fillAlgo',     type: 'select', label: 'Fill Style',          default: 'Random Walk', options: ['Random Walk', 'Random Box', 'Ns', 'Bars'], category: 'Method' },
    { key: 'symmetry',     type: 'select', label: 'Symmetry',            default: 'None', options: ['None', 'Horizontal', 'Vertical', 'Radial'], category: 'Method' },
    { key: 'packDensity',  type: 'range',  label: 'Pack Density',        default: 0.42,  min: 0.1,   max: 0.9,    precision: 2, category: 'Method' },

    // ── Level 2: The Net (Forces) ────────────────────
    { key: 'boundStyle',   type: 'select', label: 'Boundary Style',      default: 'Modern (Sticky)', options: ['Modern (Sticky)', 'Explosive (Bounce)'], category: 'Physics' },
    { key: 'expCount',     type: 'range',  label: 'Explosion Amount',     default: 0,     min: 0,     max: 100,    precision: 0, category: 'Physics' },
    { key: 'expPos',       type: 'select', label: 'Explosion Source',     default: 'Random', options: ['Random', 'Corners', 'Edges', 'Central'], category: 'Physics' },
    { key: 'interference', type: 'range',  label: 'Interference Radius',  default: 450,   min: 50,    max: 1500,   precision: 0, category: 'Physics' },
    { key: 'forceMin',     type: 'range',  label: 'Min Blast Force',      default: 800,   min: 100,   max: 5000,   precision: 0, category: 'Physics' },
    { key: 'forceMax',     type: 'range',  label: 'Max Blast Force',      default: 4500,  min: 1000,  max: 15000,  precision: 0, category: 'Physics' },
    { key: 'displacement', type: 'select', label: 'Displacement Type',    default: 'None', options: ['None', 'Twist', 'Sharp', 'Shift', 'Squish', 'Wave', 'Turn', 'Smooth', 'Detach'], category: 'Physics' },

    // ── Level 3: The Cloth (Physics Sim) ─────────────
    { key: 'springK',      type: 'range',  label: 'Spring Rigidity',      default: 0.50,  min: 0.05,  max: 1.0,    precision: 2, category: 'Physics' },
    { key: 'damp',         type: 'range',  label: 'Velocity Damping',     default: 0.85,  min: 0.40,  max: 0.99,   precision: 2, category: 'Physics' },
    { key: 'simSteps',     type: 'range',  label: 'Sim Iterations',       default: 25,    min: 5,     max: 100,    precision: 0, category: 'Physics' },
    { key: 'bounceEnergy', type: 'range',  label: 'Bounce Energy',        default: 0.50,  min: 0.1,   max: 1.0,    precision: 2, category: 'Physics' },
    { key: 'spread',       type: 'range',  label: 'Explosion Spread',     default: 0,     min: 0,     max: 20,     precision: 1, category: 'Physics' },

    // ── Level 4/5: The Hatch (Render) ────────────────
    { key: 'hatchMode',    type: 'select', label: 'Hatch Mode',           default: 'Spring Mesh', options: ['Spring Mesh', 'RK4 Flow', 'Hybrid'], category: 'Render' },
    { key: 'texture',      type: 'select', label: 'Texture Style',        default: 'Hatched', options: ['Lattice', 'Hatched', 'Sqribble'], category: 'Render' },
    { key: 'outlineColor', type: 'select', label: 'Grid Color',           default: 'Black', options: ['Black', 'Transparent', 'White', 'Palette Color'], category: 'Render' },
    { key: 'gridOutline',  type: 'range',  label: 'Grid Outline Thk',     default: 1.5,   min: 0.0,   max: 15.0,   precision: 1, category: 'Render' },
    { key: 'meshSubdivs',  type: 'range',  label: 'Mesh Subdivision',     default: 6.0,   min: 1.0,   max: 30.0,   precision: 1, category: 'Render' },
    { key: 'lineWeight',   type: 'range',  label: 'Ink Pen Size',         default: 0.60,  min: 0.1,   max: 3.0,    precision: 2, category: 'Render' },
    { key: 'lineWidthVar', type: 'range',  label: 'Pen Size Variation',   default: 0,     min: 0,     max: 1.0,    precision: 2, category: 'Render' },
    { key: 'lineAlpha',    type: 'range',  label: 'Ink Alpha',            default: 0.85,  min: 0.05,  max: 1.0,    precision: 2, category: 'Render' },
    { key: 'hatchDensity', type: 'range',  label: 'Hatch Density',        default: 1.0,   min: 0.1,   max: 5.0,    precision: 1, category: 'Render' },
    { key: 'massDensity',  type: 'select', label: 'Mass-Density Scale',   default: 'Off', options: ['Off', 'On'], category: 'Render' },
    { key: 'densityClamp', type: 'range',  label: 'Max Ink Density',      default: 0,     min: 0,     max: 100,    precision: 0, category: 'Render' },
    { key: 'sketchWarp',   type: 'range',  label: 'Sketch Warp (Noise)',  default: 0.0,   min: 0.0,   max: 5.0,    precision: 1, category: 'Render' },
    { key: 'grainIntensity', type: 'range', label: 'Canvas Grain',        default: 10,    min: 0,     max: 50,     precision: 0, category: 'Render' },
  ],

  narrative(p) {
    return `Brutalist mereological tectonics. A ${p.gridCols}×${p.gridCols} sovereign matrix packed via ${p.fillAlgo}. ` +
      `Each enclosure holds a ${p.hatchMode} mesh (${p.texture}). ` +
      `${p.expCount} ${p.expPos} explosions (F∈[${p.forceMin},${p.forceMax}]) deform springs (K=${p.springK}, ζ=${p.damp}). ` +
      `Boundaries: ${p.boundStyle}. Displacement: ${p.displacement}.`;
  },

  equation(p) {
    return `[L0] Seed: PRNG(${p.seed})\n` +
      `[L1] Pack: Int8Array Fill(${p.fillAlgo})\n` +
      `[L2] Force: F = m/(r²+1), m∈[${p.forceMin},${p.forceMax}], r<${p.interference}\n` +
      `[L3] Spring: ΔL = (|d|−d₀)/|d| × K=${p.springK}, damp=${p.damp}\n` +
      `[L4] Limit: ${p.boundStyle}, bounce=${p.bounceEnergy}\n` +
      `[L5] Hatch: ${p.hatchMode}(${p.texture}) + ${p.displacement} Warp`;
  },

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER LOOP
  // ═══════════════════════════════════════════════════════════════
  render(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const startT = performance.now();

    const padding = Math.min(W, H) * (params.canvasMargin / 100);
    const drawW = W - padding * 2;
    const drawH = H - padding * 2;

    // ── 1. The Pack (Fill Style Algorithm) ───────────
    const gridRows = Math.max(1, Math.round(params.gridCols / params.aspectRatio));
    let enclosures = this._buildCompositionGrid(params.gridCols, gridRows, params.fillAlgo, prng, params.packDensity);

    // ── 1b. Symmetry post-processing ─────────────────
    if (params.symmetry !== 'None') {
      enclosures = this._applySymmetry(enclosures, params.gridCols, gridRows, params.symmetry);
    }

    // ── 2. The Net Forces (Explosions) ─────────────
    const explosionPool = this._generateExplosions(W, H, params, prng);

    // ── 3. Background Generation ────────────────────
    const bgColor = palette[palette.length - 1];
    ctx.fillStyle = `hsl(${bgColor.h}, ${bgColor.s}%, ${bgColor.l}%)`;
    ctx.fillRect(0, 0, W, H);
    if (params.grainIntensity > 0) {
      this._addGrain(ctx, W, H, prng, params.grainIntensity);
    }

    // Render configuration
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    ctx.lineWidth = params.lineWeight;

    let totalNodes = 0;
    const cellW = drawW / params.gridCols;
    const cellH = drawH / gridRows;

    const palLen = Math.max(1, palette.length - 1);
    const halfG = params.gridOutline / 2;

    // Density tracking grid for TDA clamping
    let densityGrid = null;
    let densityCellSize = 0;
    let densityGridW = 0;
    let densityGridH = 0;
    if (params.densityClamp > 0) {
      densityCellSize = Math.max(4, Math.floor(Math.min(W, H) / 80));
      densityGridW = Math.ceil(W / densityCellSize);
      densityGridH = Math.ceil(H / densityCellSize);
      densityGrid = new Float32Array(densityGridW * densityGridH);
    }

    // ── 4. The Hatch (Process each Enclosure) ────────
    for (let enc of enclosures) {
      let outX = padding + enc.gx * cellW;
      let outY = padding + enc.gy * cellH;
      let outW = enc.gw * cellW;
      let outH = enc.gh * cellH;

      const rect = {
        x: outX + halfG,
        y: outY + halfG,
        w: outW - params.gridOutline,
        h: outH - params.gridOutline
      };

      if (rect.w < 2 || rect.h < 2) continue;

      // ── COLOR STABILITY FIX ──
      // Color is a pure function of (seed, gx, gy) — immune to physics/render PRNG shifts
      const colorSeed = params.seed ^ (enc.gx * 7919 + enc.gy * 104729);
      const colorPRNG = new PRNG(colorSeed);
      const colIdx = Math.floor(colorPRNG.next() * palLen);
      const col = palette[colIdx];

      // ── Enclosure Phase (position-derived, deterministic) ──
      const encPhase = ((enc.gx * 31 + enc.gy * 97 + params.seed) % 628) / 100.0;

      // Draw Grid Outline (Container boundaries)
      if (params.gridOutline > 0 && params.outlineColor !== 'Transparent') {
        ctx.globalCompositeOperation = 'source-over';
        if (params.outlineColor === 'White') {
          ctx.strokeStyle = '#FFFFFF';
        } else if (params.outlineColor === 'Black') {
          ctx.strokeStyle = '#000000';
        } else {
          ctx.strokeStyle = `hsl(${col.h}, ${col.s}%, ${Math.max(10, col.l - 20)}%)`;
        }
        ctx.lineWidth = params.gridOutline;
        ctx.strokeRect(outX, outY, outW, outH);
        ctx.globalCompositeOperation = 'multiply';
      }

      // Filter local explosions by interference radius
      const localExplosions = explosionPool.filter(e => {
        const dx = rect.x + rect.w / 2 - e.x;
        const dy = rect.y + rect.h / 2 - e.y;
        return (Math.sqrt(dx * dx + dy * dy) < params.interference);
      });

      // ── Per-enclosure line width variation (GAP-11) ──
      let encLineWeight = params.lineWeight;
      if (params.lineWidthVar > 0) {
        const widthSeed = params.seed ^ (enc.gx * 3571 + enc.gy * 7793);
        const widthPRNG = new PRNG(widthSeed);
        const variation = 1.0 + (widthPRNG.next() - 0.5) * 2.0 * params.lineWidthVar;
        encLineWeight = params.lineWeight * Math.max(0.2, variation);
      }

      // ── Determine rendering mode ──
      const doSpringMesh = (params.hatchMode === 'Spring Mesh' || params.hatchMode === 'Hybrid');
      const doRK4Flow    = (params.hatchMode === 'RK4 Flow'    || params.hatchMode === 'Hybrid');

      // ── Spring Mesh rendering ──
      if (doSpringMesh) {
        // Calculate effective mesh subdivision with mass-density scaling
        let effectiveSubdivs = params.meshSubdivs;
        if (params.massDensity === 'On') {
          const mass = enc.gw * enc.gh;
          const densityMultiplier = 1.0 / Math.sqrt(Math.max(1, mass));
          effectiveSubdivs = Math.max(1.0, effectiveSubdivs * densityMultiplier * 3.0);
        }

        const cloth = this._buildClothMesh(rect, params.texture, prng, effectiveSubdivs);
        if (cloth.nodes.length > 0) {
          // Simulate physics
          this._simulateClothPhysics(cloth, rect, localExplosions, params);

          // Render mesh
          ctx.lineWidth = encLineWeight;
          ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${params.lineAlpha})`;
          this._renderMesh(ctx, cloth, W / 2, H / 2, params.displacement, rect, params, prng,
                           densityGrid, densityCellSize, densityGridW, params.densityClamp, params.lineAlpha);
          totalNodes += cloth.nodes.length;
        }
      }

      // ── RK4 Flow hatching ──
      if (doRK4Flow) {
        ctx.lineWidth = encLineWeight * (doSpringMesh ? 0.6 : 1.0);
        const rk4Alpha = params.lineAlpha * (doSpringMesh ? 0.3 : 0.6);
        ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${rk4Alpha})`;

        const mass = enc.gw * enc.gh;
        let lineCount = Math.floor(800 * params.hatchDensity);
        if (params.massDensity === 'On') {
          lineCount = Math.floor((3000 / Math.sqrt(Math.max(1, mass))) * params.hatchDensity);
        }

        this._renderRK4Hatch(ctx, rect, encPhase, localExplosions, prng, lineCount, params,
                              W / 2, H / 2, densityGrid, densityCellSize, densityGridW, params.densityClamp, rk4Alpha);
        totalNodes += lineCount;
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    const elapsed = performance.now() - startT;

    return {
      enclosures: enclosures.length,
      clothNodes: totalNodes,
      perf: `${elapsed.toFixed(0)}ms (Tectonic Topology)`,
      renderMode: `Hatch: ${params.hatchMode} / Texture: ${params.texture} / Bounds: ${params.boundStyle}`
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // 1. THE PACK (Fill Style Space Partitioning)
  // ═══════════════════════════════════════════════════════════════
  _buildCompositionGrid(cols, rows, fillAlgo, prng, packDensity) {
    const grid = new Int8Array(cols * rows);
    const enclosures = [];
    const threshold = packDensity || 0.42;

    // Bars fill style — equal-width vertical columns
    if (fillAlgo === 'Bars') {
      const barWidth = Math.max(1, Math.floor(cols / (3 + Math.floor(prng.next() * 6))));
      for (let x = 0; x < cols; x += barWidth) {
        const w = Math.min(barWidth, cols - x);
        for (let dy = 0; dy < rows; dy++) {
          for (let dx = 0; dx < w; dx++) {
            grid[dy * cols + (x + dx)] = 1;
          }
        }
        enclosures.push({ gx: x, gy: 0, gw: w, gh: rows });
      }
      return enclosures;
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y * cols + x] !== 0) continue;

        let w = 1;
        let h = 1;

        if (fillAlgo === 'Random Box') {
          w = Math.floor(prng.range(1, cols - x));
          h = Math.floor(prng.range(1, rows - y));
          while (w > 1 || h > 1) {
            let valid = true;
            for (let dy = 0; dy < h; dy++) {
              for (let dx = 0; dx < w; dx++) {
                if ((y + dy) >= rows || (x + dx) >= cols || grid[(y + dy) * cols + (x + dx)] !== 0) {
                  valid = false;
                }
              }
            }
            if (valid) break;
            if (w > 1) w--;
            if (h > 1 && !valid) h--;
          }
        }
        else if (fillAlgo === 'Ns') {
          const maxN = Math.min(cols - x, rows - y, 8);
          w = h = Math.floor(prng.range(1, maxN));
          while (w > 1) {
            let valid = true;
            for (let dy = 0; dy < w; dy++) {
              for (let dx = 0; dx < w; dx++) {
                if ((y + dy) >= rows || grid[(y + dy) * cols + (x + dx)] !== 0) valid = false;
              }
            }
            if (valid) break;
            w--; h--;
          }
        }
        else {
          // 'Random Walk' — thin, variable strips
          w = Math.floor(prng.range(1, cols - x));
          h = Math.floor(prng.range(1, rows - y));
          if (prng.next() > 0.5) w = prng.next() > 0.8 ? w : 1;
          else h = prng.next() > 0.8 ? h : 1;

          while (w > 1 || h > 1) {
            let valid = true;
            for (let dy = 0; dy < h; dy++) {
              for (let dx = 0; dx < w; dx++) {
                if ((y + dy) >= rows || grid[(y + dy) * cols + (x + dx)] !== 0) valid = false;
              }
            }
            if (valid) break;
            if (prng.next() > 0.5) { if (w > 1) w--; } else { if (h > 1) h--; }
          }
        }

        // Pack density gate — larger enclosures must pass stochastic threshold
        if (w > 1 || h > 1) {
          if (prng.next() < threshold) {
            // Reject: fill as 1×1 cells instead
            for (let dy = 0; dy < h; dy++) {
              for (let dx = 0; dx < w; dx++) {
                const cx = x + dx, cy = y + dy;
                if (grid[cy * cols + cx] === 0) {
                  grid[cy * cols + cx] = 1;
                  enclosures.push({ gx: cx, gy: cy, gw: 1, gh: 1 });
                }
              }
            }
            continue;
          }
        }

        // Write enclosure to matrix
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            grid[(y + dy) * cols + (x + dx)] = 1;
          }
        }

        enclosures.push({ gx: x, gy: y, gw: w, gh: h });
      }
    }
    return enclosures;
  },

  // ═══════════════════════════════════════════════════════════════
  // 1b. SYMMETRY (Post-packing transform)
  // ═══════════════════════════════════════════════════════════════
  _applySymmetry(enclosures, cols, rows, mode) {
    const result = [];
    const halfCols = Math.ceil(cols / 2);
    const halfRows = Math.ceil(rows / 2);

    if (mode === 'Horizontal') {
      // Keep top half, mirror to bottom
      for (const enc of enclosures) {
        if (enc.gy + enc.gh <= halfRows) {
          result.push(enc);
          // Mirror: reflected gy = rows - enc.gy - enc.gh
          const mirrorGY = rows - enc.gy - enc.gh;
          if (mirrorGY >= halfRows) {
            result.push({ gx: enc.gx, gy: mirrorGY, gw: enc.gw, gh: enc.gh });
          }
        }
      }
    } else if (mode === 'Vertical') {
      // Keep left half, mirror to right
      for (const enc of enclosures) {
        if (enc.gx + enc.gw <= halfCols) {
          result.push(enc);
          const mirrorGX = cols - enc.gx - enc.gw;
          if (mirrorGX >= halfCols) {
            result.push({ gx: mirrorGX, gy: enc.gy, gw: enc.gw, gh: enc.gh });
          }
        }
      }
    } else if (mode === 'Radial') {
      // Keep top-left quadrant, mirror to all 4
      for (const enc of enclosures) {
        if (enc.gx + enc.gw <= halfCols && enc.gy + enc.gh <= halfRows) {
          result.push(enc); // Top-left (original)
          // Top-right
          result.push({ gx: cols - enc.gx - enc.gw, gy: enc.gy, gw: enc.gw, gh: enc.gh });
          // Bottom-left
          result.push({ gx: enc.gx, gy: rows - enc.gy - enc.gh, gw: enc.gw, gh: enc.gh });
          // Bottom-right
          result.push({ gx: cols - enc.gx - enc.gw, gy: rows - enc.gy - enc.gh, gw: enc.gw, gh: enc.gh });
        }
      }
    }

    return result.length > 0 ? result : enclosures;
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. THE NET (Explosions Generator)
  // ═══════════════════════════════════════════════════════════════
  _generateExplosions(W, H, params, prng) {
    const pool = [];
    for (let i = 0; i < params.expCount; i++) {
      let ex = 0, ey = 0;
      // v3: User-controllable force range
      let forceMag = prng.range(params.forceMin, params.forceMax);

      switch (params.expPos) {
        case 'Central':
          ex = W / 2 + prng.range(-W * 0.2, W * 0.2);
          ey = H / 2 + prng.range(-H * 0.2, H * 0.2);
          break;
        case 'Corners':
          ex = prng.next() > 0.5 ? prng.range(-W * 0.1, W * 0.1) : prng.range(W * 0.9, W * 1.1);
          ey = prng.next() > 0.5 ? prng.range(-H * 0.1, H * 0.1) : prng.range(H * 0.9, H * 1.1);
          break;
        case 'Edges':
          if (prng.next() > 0.5) {
            ex = prng.next() > 0.5 ? 0 : W;
            ey = prng.range(0, H);
          } else {
            ex = prng.range(0, W);
            ey = prng.next() > 0.5 ? 0 : H;
          }
          break;
        case 'Random':
        default:
          ex = prng.range(-W * 0.1, W * 1.1);
          ey = prng.range(-H * 0.1, H * 1.1);
          break;
      }
      pool.push({ x: ex, y: ey, force: forceMag });
    }
    return pool;
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. THE CLOTH (Mesh Generation)
  // ═══════════════════════════════════════════════════════════════
  _buildClothMesh(rect, textureMode, prng, meshSubdivs) {
    let densityPixels = textureMode === 'Hatched' ? meshSubdivs / 2.0 : meshSubdivs;
    densityPixels = Math.max(1.0, densityPixels);

    if (rect.w < densityPixels * 2) return { nodes: [], links: [] };

    const cols = Math.max(2, Math.floor(rect.w / densityPixels));
    const rows = Math.max(2, Math.floor(rect.h / densityPixels));

    const nodes = [];
    const grid = [];

    // Create base nodes
    for (let r = 0; r <= rows; r++) {
      const rowArr = [];
      const py = rect.y + (r / rows) * rect.h;
      for (let c = 0; c <= cols; c++) {
        const px = rect.x + (c / cols) * rect.w;
        let jx = textureMode === 'Sqribble' ? prng.range(-2, 2) : 0;
        let jy = textureMode === 'Sqribble' ? prng.range(-2, 2) : 0;

        const node = { x: px + jx, y: py + jy, vx: 0, vy: 0 };
        nodes.push(node);
        rowArr.push(node);
      }
      grid.push(rowArr);
    }

    // Create mathematical links (indestructible)
    const links = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const node = grid[r][c];

        // Horizontal links
        if (c < cols) {
          links.push({ n1: node, n2: grid[r][c + 1], dist: rect.w / cols, isHorizontal: true });
        }

        // Vertical & Diagonal links (Lattice / Sqribble only)
        if (textureMode === 'Lattice' || textureMode === 'Sqribble') {
          if (r < rows) {
            links.push({ n1: node, n2: grid[r + 1][c], dist: rect.h / rows, isVertical: true });
          }
          if (r < rows && c < cols) {
            links.push({
              n1: node, n2: grid[r + 1][c + 1],
              dist: Math.sqrt(Math.pow(rect.w / cols, 2) + Math.pow(rect.h / rows, 2))
            });
          }
        }
      }
    }

    return { nodes, links };
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. THE LIMITS (Cloth Physics Simulation)
  //    v3: All constants are now user-controllable parameters
  // ═══════════════════════════════════════════════════════════════
  _simulateClothPhysics(cloth, rect, explosions, params) {
    if (explosions.length === 0) return;

    const springK = params.springK;
    const damp = params.damp;
    const simSteps = params.simSteps;
    const bounceE = -params.bounceEnergy;

    for (let step = 0; step < simSteps; step++) {
      // 1. Compute Inverse-Square Repulsion: F = m / (r² + ε)
      for (const node of cloth.nodes) {
        let fx = 0, fy = 0;
        for (const exp of explosions) {
          const dx = node.x - exp.x;
          const dy = node.y - exp.y;
          const distSq = dx * dx + dy * dy + 1; // ε = 1

          if (distSq < exp.force * 60) {
            const force = exp.force / distSq;
            const dist = Math.sqrt(distSq);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        }
        node.vx += fx;
        node.vy += fy;
      }

      // 2. Cloth link constraints (Hooke's Law): Δ = (|d| − d₀)/|d| × K
      for (const link of cloth.links) {
        const dx = link.n2.x - link.n1.x;
        const dy = link.n2.y - link.n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = (dist - link.dist) / dist;

        const ox = dx * diff * 0.5 * springK;
        const oy = dy * diff * 0.5 * springK;

        link.n1.x += ox; link.n1.y += oy;
        link.n2.x -= ox; link.n2.y -= oy;

        // Anti-tangling: preserve topological ordering
        if (link.isHorizontal && link.n1.x > link.n2.x - 0.1) {
          let mid = (link.n1.x + link.n2.x) / 2;
          link.n1.x = mid - 0.05; link.n2.x = mid + 0.05;
        }
        if (link.isVertical && link.n1.y > link.n2.y - 0.1) {
          let mid = (link.n1.y + link.n2.y) / 2;
          link.n1.y = mid - 0.05; link.n2.y = mid + 0.05;
        }
      }

      // 3. Velocity integration + boundary enforcement
      for (const node of cloth.nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= damp;
        node.vy *= damp;

        if (params.boundStyle === 'Modern (Sticky)') {
          if (node.x < rect.x)          { node.x = rect.x;          node.vx = 0; node.vy = 0; }
          if (node.x > rect.x + rect.w) { node.x = rect.x + rect.w; node.vx = 0; node.vy = 0; }
          if (node.y < rect.y)          { node.y = rect.y;          node.vx = 0; node.vy = 0; }
          if (node.y > rect.y + rect.h) { node.y = rect.y + rect.h; node.vx = 0; node.vy = 0; }
        } else {
          // Explosive (Bounce) with controllable restitution
          if (node.x < rect.x)          { node.x = rect.x;          node.vx *= bounceE; }
          if (node.x > rect.x + rect.w) { node.x = rect.x + rect.w; node.vx *= bounceE; }
          if (node.y < rect.y)          { node.y = rect.y;          node.vy *= bounceE; }
          if (node.y > rect.y + rect.h) { node.y = rect.y + rect.h; node.vy *= bounceE; }
        }
      }

      // 4. Spread control (GAP-12) — drift repulsors during simulation
      //    Low spread: fixed positions → sharp, focused deformation
      //    High spread: sinusoidal drift → soft, diffused textures
      if (params.spread > 0) {
        const drift = params.spread;
        for (let ei = 0; ei < explosions.length; ei++) {
          explosions[ei].x += Math.sin(step * 0.3 + ei * 2.1) * drift;
          explosions[ei].y += Math.cos(step * 0.4 + ei * 1.7) * drift;
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. THE DISPLACEMENT (Affine/Warp — now includes Squish)
  // ═══════════════════════════════════════════════════════════════
  _displacePoint(px, py, cx, cy, type) {
    let x = px;
    let y = py;
    let dx = x - cx;
    let dy = y - cy;

    if (type === 'Twist') {
      // Polar rotation proportional to distance: θ' = θ + r × 0.0005
      let dist = Math.sqrt(dx * dx + dy * dy);
      let angle = Math.atan2(dy, dx) + dist * 0.0005;
      x = cx + Math.cos(angle) * dist;
      y = cy + Math.sin(angle) * dist;
    } else if (type === 'Sharp') {
      // Power-law brutalist folding: x' += sign(dx) × |dx|^0.95 × 0.08
      let forceScale = 0.08;
      x += Math.sign(dx) * Math.pow(Math.abs(dx), 0.95) * forceScale;
      y += Math.sign(dy) * Math.pow(Math.abs(dy), 0.95) * forceScale;
    } else if (type === 'Shift') {
      // Sinusoidal cross-axis: x' += sin(y×0.02)×15
      x += Math.sin(y * 0.02) * 15;
      y += Math.cos(x * 0.02) * 15;
    } else if (type === 'Squish') {
      // Parity-based trapezoidal shear — alternating compression/expansion bands
      const rowParity = Math.floor(py * 0.04) % 2;
      const squishScale = (rowParity === 0) ? 1.4 : 0.6;
      x = cx + dx * squishScale;
    } else if (type === 'Wave') {
      // Sine wave undulation along Y axis
      x += 20 * Math.sin(y * 0.015);
    } else if (type === 'Turn') {
      // Uniform rotation by constant angle (15°)
      const turnAngle = 0.2618; // ~15 degrees
      const cosA = Math.cos(turnAngle), sinA = Math.sin(turnAngle);
      x = cx + dx * cosA - dy * sinA;
      y = cy + dx * sinA + dy * cosA;
    } else if (type === 'Smooth') {
      // Gentle sine/cosine bowing — soft curvature without breaking topology
      const freq = 0.008;
      const amp = 18;
      x += amp * Math.sin(y * freq);
      y += amp * 0.7 * Math.cos(x * freq);
    } else if (type === 'Detach') {
      // Tectonic plate separation — horizontal fault line through center
      // Points above/below center shift in opposite directions (shear + gap)
      const cutGap = 15;
      const shear = 8;
      if (dy > 0) {
        x += shear;
        y += cutGap;
      } else {
        x -= shear;
        y -= cutGap;
      }
    }

    return { x, y };
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. MESH RENDERER (Spring Mesh mode + density clamping)
  // ═══════════════════════════════════════════════════════════════
  _renderMesh(ctx, cloth, cx, cy, displacementType, rect, params, prng,
              densityGrid, densityCellSize, densityGridW, densityClamp, lineAlpha) {
    ctx.beginPath();
    for (const link of cloth.links) {
      let p1 = this._displacePoint(link.n1.x, link.n1.y, cx, cy, displacementType);
      let p2 = this._displacePoint(link.n2.x, link.n2.y, cx, cy, displacementType);

      if (params.sketchWarp > 0) {
        let force = params.sketchWarp;
        p1.x += (prng.next() - 0.5) * force;
        p1.y += (prng.next() - 0.5) * force;
        p2.x += (prng.next() - 0.5) * force;
        p2.y += (prng.next() - 0.5) * force;
      }

      // Absolute clamp to enclosure bounds
      p1.x = Math.max(rect.x, Math.min(rect.x + rect.w, p1.x));
      p1.y = Math.max(rect.y, Math.min(rect.y + rect.h, p1.y));
      p2.x = Math.max(rect.x, Math.min(rect.x + rect.w, p2.x));
      p2.y = Math.max(rect.y, Math.min(rect.y + rect.h, p2.y));

      // TDA Density clamping — skip stroke if local density exceeds threshold
      if (densityGrid && densityClamp > 0) {
        const midX = (p1.x + p2.x) * 0.5;
        const midY = (p1.y + p2.y) * 0.5;
        const cellIdx = Math.floor(midX / densityCellSize) + Math.floor(midY / densityCellSize) * densityGridW;
        if (cellIdx >= 0 && cellIdx < densityGrid.length) {
          if (densityGrid[cellIdx] >= densityClamp) continue; // SKIP — prevent ink black hole
          densityGrid[cellIdx] += lineAlpha;
        }
      }

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. RK4 FLOW HATCHING (New in v3)
  //    Phase-driven curved crosshatching using Fourth-Order Runge-Kutta
  // ═══════════════════════════════════════════════════════════════
  _rk4Step(x, y, phase, stepSize) {
    // Localized discrete flow derivative
    const f = (lx, ly) => ({
      vx: Math.cos(phase) + Math.sin(ly * 0.02),
      vy: Math.sin(phase) + Math.cos(lx * 0.02)
    });

    const k1 = f(x, y);
    const k2 = f(x + 0.5 * stepSize * k1.vx, y + 0.5 * stepSize * k1.vy);
    const k3 = f(x + 0.5 * stepSize * k2.vx, y + 0.5 * stepSize * k2.vy);
    const k4 = f(x + stepSize * k3.vx, y + stepSize * k3.vy);

    return {
      nx: x + (stepSize / 6) * (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx),
      ny: y + (stepSize / 6) * (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy)
    };
  },

  _renderRK4Hatch(ctx, rect, phase, explosions, prng, lineCount, params,
                   cx, cy, densityGrid, densityCellSize, densityGridW, densityClamp, rk4Alpha) {
    ctx.beginPath();

    for (let i = 0; i < lineCount; i++) {
      let lx = rect.x + prng.next() * rect.w;
      let ly = rect.y + prng.next() * rect.h;

      // Apply explosion displacement to starting position
      for (const exp of explosions) {
        const dx = lx - exp.x;
        const dy = ly - exp.y;
        const distSq = dx * dx + dy * dy + 1;
        if (distSq < exp.force * 30) {
          const force = exp.force / distSq * 0.3;
          const dist = Math.sqrt(distSq);
          lx += (dx / dist) * force;
          ly += (dy / dist) * force;
        }
      }

      // Clamp starting point
      lx = Math.max(rect.x, Math.min(rect.x + rect.w, lx));
      ly = Math.max(rect.y, Math.min(rect.y + rect.h, ly));

      let wp = this._displacePoint(lx, ly, cx, cy, params.displacement);
      ctx.moveTo(wp.x, wp.y);

      // Integrate path using RK4
      for (let step = 0; step < 30; step++) {
        let nextPos = this._rk4Step(lx, ly, phase, 2.0);
        lx = nextPos.nx;
        ly = nextPos.ny;

        // Enclosure clamp — break if out of bounds
        if (lx < rect.x || lx > rect.x + rect.w || ly < rect.y || ly > rect.y + rect.h) break;

        // TDA density check
        if (densityGrid && densityClamp > 0) {
          const cellIdx = Math.floor(lx / densityCellSize) + Math.floor(ly / densityCellSize) * densityGridW;
          if (cellIdx >= 0 && cellIdx < densityGrid.length) {
            if (densityGrid[cellIdx] >= densityClamp) break;
            densityGrid[cellIdx] += rk4Alpha * 0.5;
          }
        }

        wp = this._displacePoint(lx, ly, cx, cy, params.displacement);
        ctx.lineTo(wp.x, wp.y);
      }
    }
    ctx.stroke();
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. POST-PROCESS: Canvas Grain
  // ═══════════════════════════════════════════════════════════════
  _addGrain(ctx, W, H, prng, intensity) {
    const id = ctx.getImageData(0, 0, W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (prng.next() - 0.5) * intensity;
      d[i] += noise; d[i + 1] += noise; d[i + 2] += noise;
    }
    ctx.putImageData(id, 0, 0);
  }
});
