/* ═══════════════════════════════════════════════════════════════
   Eros v5 — Method: Kovach (v1.1 - Ontological & Mereological Tectonics)
   Strict compliance with art-heuristics-v2.md
   - Int8 N-Descending Packing (The Pack) - Optimized O(1) early break
   - Pre-Displacement Clamping (The Enclosure)
   - Inverse-Square Repulsors & Affine Squish/Sharp (The Net)
   - Fourth-Order Runge-Kutta Integration (The Hatch) - Inline hyper-optimized
   - Multiplicative Analog Render (Level 5) - Taxonomy-driven Palettes
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'kovach',
  name: 'Kovach (Mereology)',
  category: 'Architectural',
  version: '1.1.0',
  type: '2d',
  description: 'Pure ontological mereology: N-Descending Int8 matrix bounds subjected to inverse-square torsion and RK4 fractional integration layers. Zero Perlin noise.',

  palettes: [
    {
      name: 'Blueprint (Kovach)', mood: 'Architectural Decay',
      colors: [
        { h: 216, s: 68, l: 20 },  // 0: Micro-Shrapnel (Dark Tectonic Lines)
        { h: 204, s: 62, l: 38 },  // 1: Macro-Monoliths (Main Support)
        { h: 198, s: 58, l: 46 },  // 2: Mid-Scale Structures (Fill)
        { h: 36, s: 20, l: 92 },   // 3: Bleached Paper Cream (Background)
      ]
    },
    {
      name: 'Graphite', mood: 'Carbon Scoring',
      colors: [
        { h: 0, s: 5, l: 15 },   // 0: Micro-Shrapnel
        { h: 0, s: 0, l: 30 },   // 1: Macro-Monoliths
        { h: 0, s: 0, l: 50 },   // 2: Mid-Scale Structures
        { h: 40, s: 10, l: 94 }, // 3: Paper
      ]
    },
    {
       name: 'Crimson Vault', mood: 'Iron & Blood',
       colors: [
         { h: 350, s: 60, l: 25 },
         { h: 355, s: 50, l: 40 },
         { h: 15, s: 40, l: 50 },
         { h: 45, s: 15, l: 90 },
       ]
    }
  ],

  // Parameters MUST start from simple foundational iterations (low grid sizes, fast integration)
  params: [
    { key: 'seed', type: 'number', label: 'Hash Seed', category: 'Method', default: 42, min: 1, max: 999999 },
    // Simplified scaling for entry-level rendering
    { key: 'gridCols', type: 'range', label: 'Grid Matrix (Cols)', category: 'Method', default: 30, min: 10, max: 100, precision: 0 },
    { key: 'maxScale', type: 'range', label: 'Max Monolith Size', category: 'Method', default: 10, min: 2, max: 30, precision: 0 },
    
    // Physics Config (Basic iterations)
    { key: 'repulsors', type: 'range', label: 'Torsion Generators', category: 'Physics', default: 3, min: 0, max: 20, precision: 0 },
    { key: 'squish', type: 'range', label: 'Affine Squish Intensity', category: 'Physics', default: 0.05, min: 0.0, max: 0.3, precision: 3 },
    
    // Hatch/Render Config (Well-scaled integers/floats)
    { key: 'lineDensity', type: 'range', label: 'Hatch Density Mult', category: 'Render', default: 0.8, min: 0.1, max: 3.0, precision: 2 },
    { key: 'strokeWeight', type: 'range', label: 'Pen Tip Size (px)', category: 'Render', default: 0.45, min: 0.05, max: 2.5, precision: 2 },
    { key: 'strokeAlpha', type: 'range', label: 'Ink Opacity', category: 'Render', default: 0.45, min: 0.01, max: 1.0, precision: 2 },
    { key: 'integSteps', type: 'range', label: 'RK4 Steps per Plot', category: 'Render', default: 35, min: 5, max: 150, precision: 0 },
    { key: 'stepSize', type: 'range', label: 'RK4 Step Size', category: 'Render', default: 2.5, min: 0.5, max: 8.0, precision: 1 },
  ],

  narrative(p) {
    return `Governed by pure ontological mereology, a ${p.gridCols}x${p.gridCols} grid is aggressively partitioned using N-Descending packing (max monolith ${p.maxScale}). ` +
      `Space is literally distorted by affine matrices and ${p.repulsors} inverse-square repulsors. ` +
      `Continuous boundaries enforce absolute topological clipping, while plotting forces are calculated exclusively through inline Fourth-Order Runge-Kutta (RK4) integration lacking all Perlin noise. ` +
      `Pigments emulate a distressed mechanical plotter via mass-based density scaling, mapped directly to structural taxonomy.`;
  },

  equation(p) {
    return `Level 1 [Pack]: Int8Array. Iter(N=max->1). Failure Threshold: p > 0.42\n` +
      `Level 2 [Bound]: If pt ∉ Box[x0, x1], V=0\n` +
      `Level 3 [Force]: F = m / (15.0 + r²), Shear = f(y parity)\n` +
      `Level 4 [RK4]: dx/dt = cos(φ) + sin(y*k), x_n = RK4(h/6)\n` + 
      `Level 5 [Render]: TotalLines ∝ AreaRatio, Taxonomy -> PaletteIdx`;
  },

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER LOOP 
  // ═══════════════════════════════════════════════════════════════
  render(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const startT = performance.now();

    const padding = Math.min(W, H) * 0.08;
    const drawW = W - padding * 2;
    const drawH = H - padding * 2;

    // 1. The Pack (N-Descending topological space partitioning)
    const enclosures = this._allocateTopologicalGrid(params.gridCols, params.gridCols, params.maxScale, prng, palette.length - 1);

    // 2. The Net (Repulsors)
    const repulsors = [];
    for(let i=0; i < params.repulsors; i++){
        repulsors.push({
            x: padding + prng.next() * drawW,
            y: padding + prng.next() * drawH,
            mass: prng.range(-2000, 2000) // Attractors and Repulsors
        });
    }

    // Canvas Basics (Background is the last palette item)
    const bgColor = palette[palette.length - 1] || {h:0, s:0, l:100};
    ctx.fillStyle = `hsl(${bgColor.h}, ${bgColor.s}%, ${bgColor.l}%)`;
    ctx.fillRect(0, 0, W, H);
    this._addGrain(ctx, W, H, prng);

    // The Hatch Rendering Config
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    ctx.lineWidth = params.strokeWeight; // Calibrated plotter stroke

    let totalStrokes = 0;

    const cellW = drawW / params.gridCols;
    const cellH = drawH / params.gridCols;
    const totalMatrixCells = params.gridCols * params.gridCols;

    for (let enc of enclosures) {
        const rx = padding + enc.gx * cellW;
        const ry = padding + enc.gy * cellH;
        const rw = enc.gw * cellW;
        const rh = enc.gh * cellH;

        // Shrink slightly to create absolute boundaries/fault lines between structures
        const gap = 1.0; 
        const bounds = {
            startX: rx + gap, endX: rx + rw - gap,
            startY: ry + gap, endY: ry + rh - gap
        };

        if(bounds.endX <= bounds.startX || bounds.endY <= bounds.startY) continue;

        // Stable mathematical normalization for simple baseline performance
        const structuralMass = enc.gw * enc.gh; 
        const cellRatio = structuralMass / totalMatrixCells;
        const baseLines = 85000 * cellRatio; 

        // Micro-shrapnel density boost
        const densityBoost = Math.max(1, Math.min(8, 6 / Math.sqrt(structuralMass)));
        const lineCount = Math.floor(baseLines * densityBoost * prng.next() * params.lineDensity);

        const colIdx = Math.min(enc.colIdx, palette.length - 2);
        const col = palette[Math.max(0, colIdx)];
        
        // Use the dedicated Ink Opacity parameter instead of a static faint 0.05 blur
        ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${params.strokeAlpha})`;

        ctx.beginPath();
        for(let i = 0; i < lineCount; i++) {
            totalStrokes++;

            let lx = bounds.startX + prng.next() * (bounds.endX - bounds.startX);
            let ly = bounds.startY + prng.next() * (bounds.endY - bounds.startY);

            let warpedStart = this._applyMereologicalDisplacement(lx, ly, W/2, H/2, repulsors, params.squish);
            ctx.moveTo(warpedStart.x, warpedStart.y);

            let TDA_bettiThreshold = 0;

            for(let step = 0; step < params.integSteps; step++) {
                // RK4 Spatial Step
                let nextPos = this._rk4StepInline(lx, ly, enc.phase, params.stepSize);
                
                let dx = nextPos.nx - lx;
                let dy = nextPos.ny - ly;
                let stepDist = dx*dx + dy*dy;

                lx = nextPos.nx;
                ly = nextPos.ny;

                // TDA: Detect infinite phase traps
                if(stepDist < 0.001) TDA_bettiThreshold++;
                if(TDA_bettiThreshold > 3) break; 

                // The Enclosure: Pre-Displacement Clamp
                if (lx < bounds.startX) { lx = bounds.startX; }
                if (lx > bounds.endX)   { lx = bounds.endX; }
                if (ly < bounds.startY) { ly = bounds.startY; }
                if (ly > bounds.endY)   { ly = bounds.endY; }
                
                // Route through Global Affine warp
                let warpedPoint = this._applyMereologicalDisplacement(lx, ly, W/2, H/2, repulsors, params.squish);
                ctx.lineTo(warpedPoint.x, warpedPoint.y);
                
                // Perfect trap termination
                if((lx === bounds.startX || lx === bounds.endX) && (ly === bounds.startY || ly === bounds.endY)) {
                    break;
                }
            }
        }
        ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    const elapsed = performance.now() - startT;

    return {
      enclosures: enclosures.length,
      strokes: totalStrokes,
      perf: `${elapsed.toFixed(0)}ms (RK4 Tectonics)`,
      renderMode: 'Ontological Matrix & Taxonomy Coloring'
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // 1. THE PACK (N-Descending Space Partitioning)
  // ═══════════════════════════════════════════════════════════════
  _allocateTopologicalGrid(cols, rows, maxScale, prng, allowedColors) {
    const grid = new Int8Array(cols * rows);
    const enclosures = [];

    // Safety fallback for unexpected palette sizes
    const colorMaxClass = Math.max(1, allowedColors);

    for (let N = maxScale; N >= 1; N--) {
        for (let i = 0; i < cols * rows; i++) {
            if (grid[i] !== 0) continue;

            const x = i % cols;
            const y = Math.floor(i / cols);

            if (x + N <= cols && y + N <= rows) {
                let valid = true;
                for (let dy = 0; dy < N; dy++) {
                    for (let dx = 0; dx < N; dx++) {
                        if (grid[(y + dy) * cols + (x + dx)] !== 0) {
                            valid = false; break;
                        }
                    }
                    if (!valid) break;
                }

                if (valid && (prng.next() > 0.42 || N === 1)) {
                    for (let dy = 0; dy < N; dy++) {
                        let rowOffset = (y + dy) * cols;
                        for (let dx = 0; dx < N; dx++) {
                            grid[rowOffset + (x + dx)] = 1;
                        }
                    }

                    // TECTONIC TAXONOMY: The size of the structural part determines its pigment extraction!
                    // Micro-fragments (N=1) map to color index 0 (The darkest, structural ink).
                    // Macro-monoliths map to color index 1.
                    // Mid-structures map to color index 2.
                    let assignedColorIdx = 0;
                    if (colorMaxClass > 1) {
                        if (N === 1) assignedColorIdx = 0;
                        else if (N >= maxScale * 0.5) assignedColorIdx = Math.min(1, colorMaxClass - 1);
                        else assignedColorIdx = Math.min(2, colorMaxClass - 1);
                    }

                    enclosures.push({
                        gx: x, gy: y, gw: N, gh: N,
                        phase: prng.next() * Math.PI * 2,
                        colIdx: assignedColorIdx
                    });
                }
            }
        }
    }
    return enclosures;
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. THE NET (Global Affine & Local Torsion)
  // ═══════════════════════════════════════════════════════════════
  _applyMereologicalDisplacement(px, py, cx, cy, repulsors, squishForce) {
    let dx = px - cx;
    let dy = py - cy;

    let torsionX = 0;
    let torsionY = 0;
    for (let i = 0; i < repulsors.length; i++) {
        let rx = px - repulsors[i].x;
        let ry = py - repulsors[i].y;
        let distSq = rx * rx + ry * ry;

        let force = repulsors[i].mass / (15.0 + distSq);
        torsionX += rx * force;
        torsionY += ry * force;
    }

    const rowParity = Math.floor(py * 0.04) % 2;
    const squishScale = (rowParity === 0) ? (1.0 + squishForce) : (1.0 - squishForce);

    return {
        x: cx + (dx * squishScale) + torsionX,
        y: cy + dy + torsionY
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. THE HATCH (Fourth-Order Runge-Kutta Vector Integration)
  // ═══════════════════════════════════════════════════════════════
  _rk4StepInline(x, y, phase, stepSize) {
      const cosP = Math.cos(phase);
      const sinP = Math.sin(phase);
      
      const v1x = cosP + Math.sin(y * 0.02);
      const v1y = sinP + Math.cos(x * 0.02);

      const px2 = x + 0.5 * stepSize * v1x;
      const py2 = y + 0.5 * stepSize * v1y;
      const v2x = cosP + Math.sin(py2 * 0.02);
      const v2y = sinP + Math.cos(px2 * 0.02);

      const px3 = x + 0.5 * stepSize * v2x;
      const py3 = y + 0.5 * stepSize * v2y;
      const v3x = cosP + Math.sin(py3 * 0.02);
      const v3y = sinP + Math.cos(px3 * 0.02);

      const px4 = x + stepSize * v3x;
      const py4 = y + stepSize * v3y;
      const v4x = cosP + Math.sin(py4 * 0.02);
      const v4y = sinP + Math.cos(px4 * 0.02);

      return {
          nx: x + (stepSize / 6.0) * (v1x + 2.0 * v2x + 2.0 * v3x + v4x),
          ny: y + (stepSize / 6.0) * (v1y + 2.0 * v2y + 2.0 * v3y + v4y)
      };
  },

  _addGrain(ctx, W, H, prng) {
    const id = ctx.getImageData(0, 0, W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (prng.next() - 0.5) * 12;
      d[i] += noise; d[i + 1] += noise; d[i + 2] += noise;
    }
    ctx.putImageData(id, 0, 0);
  }
});
