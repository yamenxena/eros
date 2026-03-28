/* ═══════════════════════════════════════════════════════════════
   Eros v7.0 — Method: Manifold (Recursive Tartan Bounded Deformation)
   Implements:
   - Level 1 & Level 2 Recursive Tartan Subgrids.
   - Visible Subgrid Euclidean cells & Invisible Mesh boundaries.
   - Aspect-Ratio based Intact Girder Vulnerability.
   - Internal cloth contraction mapped to variable Line Thicknesses.
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'manifold',
  name: 'Manifold',
  version: '7.0.0',
  description: 'Hierarchical Tartan Automata. Subgrids stroke visible architectural lines while invisible margins house massive elastic topology.',

  palettes: [
    {
      name: 'Fuzzy Tartan', mood: 'Woven Entropy',
      colors: [
        { h: 32,  s: 85, l: 50 },  // Force Vector Rust
        { h: 216, s: 70, l: 30 },  // Topology Navy
        { h: 200, s: 60, l: 45 },  // Elastic Cerulean
        { h: 36,  s: 15, l: 92 },  // Isometric Void Paper
      ]
    },
    {
      name: 'Architectural Blueprint', mood: 'Drafted Precision',
      colors: [
        { h: 218, s: 55, l: 18 },  // Dark drafting ink
        { h: 205, s: 50, l: 40 },  
        { h: 195, s: 45, l: 58 },
        { h: 42,  s: 15, l: 90 },  // Old tracing paper
      ]
    }
  ],

  params: [
    { key: 'seed',         type: 'number', label: 'Hash Seed',           default: 3341, min: 1,    max: 999999 },
    
    // Pillar I: Subgrid Tartan
    { key: 'tartanScale',  type: 'range',  label: 'Subgrid Freq',        default: 8.0,  min: 2.0,  max: 15.0,   precision: 1 },
    { key: 'cellMargin',   type: 'range',  label: 'Invisible Void (px)', default: 3.5,  min: 0.0,  max: 15.0,   precision: 1 },
    
    // Pillar II: Aspect-Ratio Structural Immunity
    { key: 'intactRatio',  type: 'range',  label: 'Girder Aspect Ratio', default: 3.5,  min: 2.0,  max: 8.0,    precision: 1 },
    
    // Pillar III: Physics
    { key: 'density',      type: 'range',  label: 'Weave Density (px)',  default: 5.0,  min: 3.0,  max: 15.0,   precision: 1 },
    { key: 'tensorMag',    type: 'range',  label: 'Stress Tensor Magnitude',default: 60.0, min: 10.0, max: 200.0,  precision: 1 },
    { key: 'simSteps',     type: 'range',  label: 'Entropy Iterations',  default: 80,   min: 10,   max: 150,    precision: 0 },
  ],

  narrative(p) {
    return `Space is uniquely fractured into a Main Tartan grid, which immediately recurses into a Level 2 Tartan Subgrid (Frequency ${p.tartanScale}). ` +
      `The subgrid walls are rendered as visible boundaries, containing invisible interior margins (${p.cellMargin}px). ` +
      `Lengthy stripes measuring an Aspect Ratio > ${p.intactRatio} become massive architectural girders locking at Vulnerability 0. ` +
      `Cloth meshes freely detach and contract internally covering less area when pounded by the ${p.tensorMag} Tensor force, while perfectly obeying external topological boundaries (no overlap).`;
  },

  equation(p) {
    return `Layout: MainTartan() -> SubTartan()\n` +
      `Res: V(stripe) = { 0 if w/h > ${p.intactRatio}, else Area/V }\n` +
      `Physics: P_new = Spring(P_unpinned) + Euler(Tensor)\n` +
      `Law: Stroke(Subgrid_Border) && Clamp(P, Invisible_Limit)`;
  },

  render(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const startT = performance.now();

    // ── Setup Global Canvas ────────────────────────────────────────
    const bgColor = palette[palette.length - 1]; 
    ctx.fillStyle = `hsl(${bgColor.h}, ${bgColor.s}%, ${bgColor.l}%)`;
    ctx.fillRect(0, 0, W, H);
    this._addGrain(ctx, W, H, prng);

    const palLen = Math.max(1, palette.length - 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    
    // ── Pillar I: Recursive Tartan Subgrids ───────────────────────
    let subgridCells = [];
    
    // Level 1: Main Tartan (Huge chunks)
    const mainCells = this._buildSubTartanBlock(0, 0, W, H, 2.0, prng);
    
    // Level 2: Subgrid Tartan
    for (const mc of mainCells) {
       // If a Main Cell is too tiny, skip recursion
       if (mc.w < W/10 || mc.h < H/10) {
           subgridCells.push(mc);
       } else {
           const subT = this._buildSubTartanBlock(mc.x, mc.y, mc.w, mc.h, params.tartanScale, prng);
           subgridCells = subgridCells.concat(subT);
       }
    }

    // ── Pillar II & IV: Fuzzy Automata & Aspect Ratio Intactness ─
    const finalCells = [];
    const totalArea = W * H;

    for (let c of subgridCells) {
      // Establish the Invisible Bounds for the Mesh
      const ix = c.x + params.cellMargin;
      const iy = c.y + params.cellMargin;
      const iw = c.w - params.cellMargin * 2;
      const ih = c.h - params.cellMargin * 2;
      
      if (iw < 4 || ih < 4) continue; // Filter out microscopic noise

      const invisBounds = {x: ix, y: iy, w: iw, h: ih};
      const cellArea = iw * ih;
      const aspectR = Math.max(iw, ih) / Math.min(iw, ih);

      let innateV = 0;
      
      // If it's a massive, long column or row -> Intact Girder (Perfect 0.0)
      if (aspectR > params.intactRatio) {
          innateV = 0.0; 
      } else {
          // Otherwise scaled by raw area
          const areaRatio = cellArea / totalArea;
          if (areaRatio > 0.05) innateV = 0.05; // Medium squares
          else innateV = prng.range(1.0, 1.8);  // Tiny weak cells
      }

      finalCells.push({ 
          visible: c, 
          invisible: invisBounds, 
          area: cellArea, 
          innateV: innateV, 
          fuzzyV: 0, 
          neighbors: [] 
      });
    }

    // Graph the Neighborhood for "little fuzzy" automata
    for (let i=0; i<finalCells.length; i++) {
       for (let j=i+1; j<finalCells.length; j++) {
           if (this._cellsTouch(finalCells[i].visible, finalCells[j].visible, 2.0)) {
              finalCells[i].neighbors.push(finalCells[j]);
              finalCells[j].neighbors.push(finalCells[i]);
           }
       }
    }

    // Calculate Fuzziness
    for (let c of finalCells) {
       if (c.innateV === 0.0) {
           c.fuzzyV = 0.0; // The Intact Girder blocks all fuzziness completely
           continue; 
       }
       let stress = 0;
       for (let n of c.neighbors) {
           if (n.innateV > 1.0) stress += 0.15; // Absorb local violence
       }
       c.fuzzyV = c.innateV + stress;
    }

    // ── Pillar III: Simulated Topology & Rendering ───────────────
    const tOffsetX = prng.range(1000, 9000);
    const tOffsetY = prng.range(1000, 9000);
    let totalPoints = 0;

    for (let i = 0; i < finalCells.length; i++) {
      const cellData = finalCells[i];
      const vis = cellData.visible;
      const invis = cellData.invisible;

      // 1. Draw the Visible Subgrid Structure Line!
      ctx.strokeStyle = `hsla(${bgColor.h}, ${Math.max(0, bgColor.s - 20).toFixed(0)}%, ${Math.max(0, bgColor.l - 40).toFixed(0)}%, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(vis.x, vis.y, vis.w, vis.h);

      const colIdx = Math.floor(prng.next() * palLen);
      const col = palette[colIdx];
      
      // Build mesh dynamically inside the INVISIBLE bounds
      const mesh = this._build2DCoordinates(invis, params.density, prng);
      if (mesh.nodes.length === 0) continue;

      if (cellData.fuzzyV > 0) {
         this._evaluateTopologicalPhysics(
             mesh, 
             invis, // Explodes/Shrinks WITHIN invisible bounds
             params.simSteps, 
             params.tensorMag, 
             cellData.fuzzyV, 
             tOffsetX, 
             tOffsetY,
             prng
         );
      }

      // Map Line Thickness to Intactness: 
      // Girder (FuzzyV 0.0) -> 2.0px thick architectural line
      // Torn Cell (FuzzyV > 1.0) -> 0.4px thin thread
      const thickBase = 2.0 - Math.min(cellData.fuzzyV, 1.8);
      ctx.lineWidth = Math.max(0.4, thickBase);
      ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.90)`;
      
      this._renderTopological2DGrid(ctx, mesh);
      totalPoints += mesh.nodes.length;
    }

    const elapsed = performance.now() - startT;

    return {
      rectangles: finalCells.length,
      clothNodes: totalPoints,
      perf: `${elapsed.toFixed(0)}ms (SubTartan + Internal Kinetics)`,
      renderMode: 'Bounded 2D Mesh'
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // RECURSIVE SUBGRID TARTAN GENERATOR
  // ═══════════════════════════════════════════════════════════════
  _buildSubTartanBlock(x, y, w, h, freq, prng) {
     const cells = [];
     const colBands = [];
     const rowBands = [];
     
     let sumX = 0;
     while(sumX < w) {
         let bw = w / prng.range(freq * 0.4, freq * 1.5);
         if (prng.next() > 0.8) bw *= prng.range(2, 4); // Massive column girder
         if (bw < 5) bw = 5; 
         if (sumX + bw > w) bw = w - sumX;
         colBands.push(bw);
         sumX += bw;
     }

     let sumY = 0;
     while(sumY < h) {
         let bh = h / prng.range(freq * 0.4, freq * 1.5);
         if (prng.next() > 0.8) bh *= prng.range(2, 4); // Massive row girder
         if (bh < 5) bh = 5;
         if (sumY + bh > h) bh = h - sumY;
         rowBands.push(bh);
         sumY += bh;
     }

     let cx = x;
     for (let cw of colBands) {
         let cy = y;
         for (let ch of rowBands) {
             cells.push({ x: cx, y: cy, w: cw, h: ch });
             cy += ch;
         }
         cx += cw;
     }
     return cells;
  },

  _cellsTouch(a, b, margin) {
     return !(b.x > a.x + a.w + margin || 
              b.x + b.w < a.x - margin || 
              b.y > a.y + a.h + margin ||
              b.y + b.h < a.y - margin);
  },

  // ═══════════════════════════════════════════════════════════════
  // 2D TOPOLOGY MANIFOLD (UNPINNED EDGES)
  // ═══════════════════════════════════════════════════════════════
  _build2DCoordinates(cell, density, prng) {
    const cols = Math.max(2, Math.floor(cell.w / density));
    const rows = Math.max(2, Math.floor(cell.h / density));
    const grid = [];
    const nodes = [];
    const links = [];

    // EDGES ARE NO LONGER PINNED! The Cloth is free to deform internally!
    for (let r = 0; r <= rows; r++) {
      const rowArr = [];
      const py = cell.y + (r / rows) * cell.h;
      for (let c = 0; c <= cols; c++) {
        const px = cell.x + (c / cols) * cell.w;
        const n = { x: px, y: py, vx: 0, vy: 0, r: r, c: c };
        rowArr.push(n);
        nodes.push(n);
      }
      grid.push(rowArr);
    }

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (c < cols) links.push({ n1: grid[r][c], n2: grid[r][c+1], dist: (cell.w/cols) });
        if (r < rows) links.push({ n1: grid[r][c], n2: grid[r+1][c], dist: (cell.h/rows) });
      }
    }
    
    return { grid, nodes, links, cols, rows };
  },

  // ═══════════════════════════════════════════════════════════════
  // ROBUST KINETICS + THE ORDERING LAW + EXTERNAL BOUND LIMITS
  // ═══════════════════════════════════════════════════════════════
  _evaluateTopologicalPhysics(mesh, bounds, steps, tensorMag, vuln, tx, ty, prng) {
    const K = 0.50; // Elastic Tension
    const damp = 0.65; // Internal Friction

    const expX = bounds.x + (bounds.w * prng.range(0.2, 0.8));
    const expY = bounds.y + (bounds.h * prng.range(0.2, 0.8));

    for (let s = 0; s < steps; s++) {
        
        // 1. Stress Tensor / Explosion Dynamics
        for (const n of mesh.nodes) {
            const dx = n.x - expX;
            const dy = n.y - expY;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            
            let forceX = (dx / dist) * (tensorMag / dist);
            let forceY = (dy / dist) * (tensorMag / dist);
            
            const ny = Math.sin(n.x * 0.05 + tx);
            const nx = Math.cos(n.y * 0.05 + ty);
            forceX += nx * tensorMag * 0.05;
            forceY += ny * tensorMag * 0.05;

            n.vx += forceX * vuln;
            n.vy += forceY * vuln;
        }

        // 2. Spring Relaxation (Unpinned! The cloth can shrink internally to cover less area!)
        for (let iter = 0; iter < 4; iter++) {
            for (const link of mesh.links) {
                const dx = link.n2.x - link.n1.x;
                const dy = link.n2.y - link.n1.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                const diff = (dist - link.dist) / dist;
                const ox = dx * diff * 0.5 * K;
                const oy = dy * diff * 0.5 * K;
                
                link.n1.x += ox; link.n1.y += oy;
                link.n2.x -= ox; link.n2.y -= oy;
            }
        }

        // 3. Absolute Law of Topological Ordering (Zero Overlap allowed)
        const buffer = 0.1; 
        for (let r = 0; r <= mesh.rows; r++) {
            for (let c = 1; c <= mesh.cols; c++) {
                let left = mesh.grid[r][c-1]; let right = mesh.grid[r][c];
                if (right.x < left.x + buffer) { right.x = left.x + buffer; right.vx = 0; }
            }
            for (let c = mesh.cols - 1; c >= 0; c--) {
                let right = mesh.grid[r][c+1]; let left = mesh.grid[r][c];
                if (left.x > right.x - buffer) { left.x = right.x - buffer; left.vx = 0; }
            }
        }

        for (let c = 0; c <= mesh.cols; c++) {
            for (let r = 1; r <= mesh.rows; r++) {
                let top = mesh.grid[r-1][c]; let bot = mesh.grid[r][c];
                if (bot.y < top.y + buffer) { bot.y = top.y + buffer; bot.vy = 0; }
            }
            for (let r = mesh.rows - 1; r >= 0; r--) {
                let bot = mesh.grid[r+1][c]; let top = mesh.grid[r][c];
                if (top.y > bot.y - buffer) { top.y = bot.y - buffer; top.vy = 0; }
            }
        }

        // 4. Integrator & External Boundary Limits (Nodes are mathematically prevented from escaping!)
        for (const n of mesh.nodes) {
            n.x += n.vx;
            n.y += n.vy;
            n.vx *= damp;
            n.vy *= damp;
            
            if (n.x <= bounds.x) { n.x = bounds.x; n.vx = -n.vx*damp; }
            if (n.x >= bounds.x + bounds.w) { n.x = bounds.x + bounds.w; n.vx = -n.vx*damp; }
            if (n.y <= bounds.y) { n.y = bounds.y; n.vy = -n.vy*damp; }
            if (n.y >= bounds.y + bounds.h) { n.y = bounds.y + bounds.h; n.vy = -n.vy*damp; }
        }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════
  _renderTopological2DGrid(ctx, mesh) {
    ctx.beginPath();
    for (let r = 0; r <= mesh.rows; r++) {
      ctx.moveTo(mesh.grid[r][0].x, mesh.grid[r][0].y);
      for (let c = 1; c <= mesh.cols; c++) { ctx.lineTo(mesh.grid[r][c].x, mesh.grid[r][c].y); }
    }
    for (let c = 0; c <= mesh.cols; c++) {
      ctx.moveTo(mesh.grid[0][c].x, mesh.grid[0][c].y);
      for (let r = 1; r <= mesh.rows; r++) { ctx.lineTo(mesh.grid[r][c].x, mesh.grid[r][c].y); }
    }
    ctx.stroke();
  },

  _addGrain(ctx, W, H, prng) {
    const id = ctx.getImageData(0, 0, W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (prng.next() - 0.5) * 15;
      d[i] += noise; d[i + 1] += noise; d[i + 2] += noise;
    }
    ctx.putImageData(id, 0, 0);
  }
});
