/* ═══════════════════════════════════════════════════════════════
   Eros v5 — Method: Kovach (v1.0 - Ontological & Mereological Tectonics)
   Strict compliance with art-heuristics-v2.md
   - Int8 N-Descending Packing (The Pack)
   - Pre-Displacement Clamping (The Enclosure)
   - Inverse-Square Repulsors & Affine Squish/Sharp (The Net)
   - Fourth-Order Runge-Kutta Integration (The Hatch)
   - Multiplicative Analog Render (Level 5)
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'kovach',
  name: 'Kovach (Mereology)',
  version: '1.0.0',
  type: '2d',
  description: 'Pure ontological mereology: N-Descending Int8 matrix bounds subjected to inverse-square torsion and RK4 fractional integration layers. Zero Perlin noise.',

  palettes: [
    {
      name: 'Blueprint (Kovach)', mood: 'Architectural Decay',
      colors: [
        { h: 216, s: 68, l: 20 },  // Deep Indigo Code
        { h: 204, s: 62, l: 38 },  // Royal Blue Main
        { h: 198, s: 58, l: 46 },  // Cerulean Shift
        { h: 36, s: 20, l: 92 },   // Bleached Paper Cream (Background)
      ]
    },
    {
      name: 'Graphite', mood: 'Carbon Scoring',
      colors: [
        { h: 0, s: 5, l: 15 },   // Almost Black
        { h: 0, s: 0, l: 30 },   // Heavy Grey
        { h: 0, s: 0, l: 50 },   // Mid Grey
        { h: 40, s: 10, l: 94 }, // Paper
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

  params: [
    { key: 'seed', type: 'number', label: 'Hash Seed', category: 'Method', default: 42, min: 1, max: 999999 },
    { key: 'gridCols', type: 'range', label: 'Grid Matrix (Cols)', category: 'Method', default: 60, min: 20, max: 120, precision: 0 },
    { key: 'maxScale', type: 'range', label: 'Max Monolith Size', category: 'Method', default: 25, min: 5, max: 50, precision: 0 },
    
    // Physics Config
    { key: 'repulsors', type: 'range', label: 'Torsion Generators', category: 'Physics', default: 12, min: 0, max: 40, precision: 0 },
    { key: 'squish', type: 'range', label: 'Affine Squish Intensity', category: 'Physics', default: 0.08, min: 0.0, max: 0.3, precision: 2 },
    
    // Hatch/Render Config
    { key: 'lineDensity', type: 'range', label: 'Hatch Density Mult', category: 'Render', default: 1.0, min: 0.1, max: 4.0, precision: 2 },
    { key: 'integSteps', type: 'range', label: 'RK4 Steps per Plot', category: 'Render', default: 35, min: 5, max: 150, precision: 0 },
    { key: 'stepSize', type: 'range', label: 'RK4 Step Size', category: 'Render', default: 1.8, min: 0.5, max: 5.0, precision: 1 },
  ],

  narrative(p) {
    return `Governed by pure ontological mereology, a ${p.gridCols}x${p.gridCols} grid is aggressively partitioned using N-Descending packing (max monolith ${p.maxScale}). ` +
      `Space is literally distorted by affine matrices and ${p.repulsors} inverse-square repulsors. ` +
      `Continuous boundaries enforce absolute topological clipping, while plotting forces are calculated exclusively through Fourth-Order Runge-Kutta (RK4) integration lacking all Perlin noise. ` +
      `Pigments emulate a distressed mechanical plotter.`;
  },

  equation(p) {
    return `Level 1 [Pack]: Int8Array. Iter(N=max->1). Failure Threshold: p > 0.42\n` +
      `Level 2 [Bound]: If pt ∉ Box[x0, x1], V=0\n` +
      `Level 3 [Force]: F = m / (15.0 + r²), Shear = f(y parity)\n` +
      `Level 4 [RK4]: dx/dt = cos(φ) + sin(y*k), x_{n+1} = x_n + h/6*(k1 + 2k2 + 2k3 + k4)` ;
  },

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER LOOP 
  // ═══════════════════════════════════════════════════════════════
  render(canvas, ctx, W, H, params, palette) {
    const prng = new window.PRNG(params.seed);
    const startT = performance.now();

    const padding = Math.min(W, H) * 0.08;
    const drawW = W - padding * 2;
    const drawH = H - padding * 2;

    // 1. The Pack (N-Descending topological space partitioning)
    const enclosures = this._allocateTopologicalGrid(params.gridCols, params.gridCols, params.maxScale, prng, palette.length - 1);

    // 2. The Net (Repulsors)
    const repulsors = [];
    for(let i=0; i<params.repulsors; i++){
        repulsors.push({
            x: padding + prng.next() * drawW,
            y: padding + prng.next() * drawH,
            mass: prng.range(-2000, 2000) // Attractors and Repulsors
        });
    }

    // Canvas Basics
    const bgColor = palette[palette.length - 1];
    ctx.fillStyle = `hsl(${bgColor.h}, ${bgColor.s}%, ${bgColor.l}%)`;
    ctx.fillRect(0, 0, W, H);
    this._addGrain(ctx, W, H, prng);

    // The Hatch Rendering Config
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    ctx.lineWidth = 0.45;

    let totalStrokes = 0;

    // For every sovereign mereological object
    // Map grid coords to pixel coords
    const cellW = drawW / params.gridCols;
    const cellH = drawH / params.gridCols;

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

        // Density is inversely proportional to square root of mass
        const structuralMass = enc.gw * enc.gh; 
        // 12000 lines scaled by density config and mass
        const lineCount = Math.floor((12000 / Math.sqrt(structuralMass)) * prng.next() * params.lineDensity);

        const col = palette[enc.colIdx];
        // Brutalist Analog Pigment
        ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.05)`;

        ctx.beginPath();
        for(let i = 0; i < lineCount; i++) {
            totalStrokes++;

            // Start locally inside the enclosure
            let lx = bounds.startX + prng.next() * (bounds.endX - bounds.startX);
            let ly = bounds.startY + prng.next() * (bounds.endY - bounds.startY);

            // Warp initial point 
            let warpedStart = this._applyMereologicalDisplacement(lx, ly, W/2, H/2, repulsors, params.squish);
            ctx.moveTo(warpedStart.x, warpedStart.y);

            // Integration Loop
            let TDA_bettiThreshold = 0;
            let lastDist = 0;

            for(let step = 0; step < params.integSteps; step++) {
                // RK4 Spatial Step
                let nextPos = this._rk4Step(lx, ly, enc.phase, params.stepSize);
                
                let dx = nextPos.nx - lx;
                let dy = nextPos.ny - ly;
                let stepDist = dx*dx + dy*dy;

                lx = nextPos.nx;
                ly = nextPos.ny;

                // TDA: Check for cyclic loops (infinite density trap)
                // If the stroke barely moves in a step, it's trapped in a topological zero-hole
                if(stepDist < 0.001) TDA_bettiThreshold++;
                if(TDA_bettiThreshold > 3) break; // Terminate early to prevent "unknown unknown" blob

                // The Enclosure: Absolute Pre-Displacement Clamp (Sticky Modern Edge)
                if (lx < bounds.startX) { lx = bounds.startX; }
                if (lx > bounds.endX)   { lx = bounds.endX; }
                if (ly < bounds.startY) { ly = bounds.startY; }
                if (ly > bounds.endY)   { ly = bounds.endY; }

                // Stop drawing if we hit the edge? 
                // Or let it slide along the edge? Kovach allows sliding to build up dark fault lines!
                
                // Route through Global Affine warp
                let warpedPoint = this._applyMereologicalDisplacement(lx, ly, W/2, H/2, repulsors, params.squish);
                ctx.lineTo(warpedPoint.x, warpedPoint.y);
                
                // If perfectly clamped at corner trap, terminate early for efficiency
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
      renderMode: 'Ontological Matrix & RK4 TDA Clamping'
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // 1. THE PACK (N-Descending Space Partitioning)
  // ═══════════════════════════════════════════════════════════════
  _allocateTopologicalGrid(cols, rows, maxScale, prng, allowedColors) {
    const grid = new Int8Array(cols * rows);
    const enclosures = [];

    // Iterating backwards from massive structs to micro-dust
    for (let N = maxScale; N >= 1; N--) {
        for (let i = 0; i < cols * rows; i++) {
            if (grid[i] !== 0) continue;

            const x = i % cols;
            const y = Math.floor(i / cols);

            // Dimensional fit check
            if (x + N <= cols && y + N <= rows) {
                let valid = true;
                for (let dy = 0; dy < N; dy++) {
                    for (let dx = 0; dx < N; dx++) {
                        if (grid[(y + dy) * cols + (x + dx)] !== 0) valid = false;
                    }
                }

                // Inject destructive flaw: PRNG forces imperfect packing to make architectural asymmetry
                if (valid && (prng.next() > 0.42 || N === 1)) {
                    for (let dy = 0; dy < N; dy++) {
                        for (let dx = 0; dx < N; dx++) {
                            grid[(y + dy) * cols + (x + dx)] = 1;
                        }
                    }
                    enclosures.push({
                        gx: x, gy: y, gw: N, gh: N,
                        phase: prng.next() * Math.PI * 2,
                        colIdx: Math.floor(prng.next() * allowedColors)
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

    // Torsion logic: Inverse-square gravitational effects
    let torsionX = 0;
    let torsionY = 0;
    for (let i = 0; i < repulsors.length; i++) {
        let rx = px - repulsors[i].x;
        let ry = py - repulsors[i].y;
        let distSq = rx * rx + ry * ry;

        // F = m / (epsilon + r^2)
        let force = repulsors[i].mass / (15.0 + distSq);
        torsionX += rx * force;
        torsionY += ry * force;
    }

    // Affine 'Squish/Sharp' Logic: Parity-based horizontal shear
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
  _rk4Step(x, y, phase, stepSize) {
    const derivative = (lx, ly) => {
        return {
            vx: Math.cos(phase) + Math.sin(ly * 0.02),
            vy: Math.sin(phase) + Math.cos(lx * 0.02)
        };
    };

    const k1 = derivative(x, y);
    const k2 = derivative(x + 0.5 * stepSize * k1.vx, y + 0.5 * stepSize * k1.vy);
    const k3 = derivative(x + 0.5 * stepSize * k2.vx, y + 0.5 * stepSize * k2.vy);
    const k4 = derivative(x + stepSize * k3.vx, y + stepSize * k3.vy);

    return {
        nx: x + (stepSize / 6.0) * (k1.vx + 2.0 * k2.vx + 2.0 * k3.vx + k4.vx),
        ny: y + (stepSize / 6.0) * (k1.vy + 2.0 * k2.vy + 2.0 * k3.vy + k4.vy)
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
