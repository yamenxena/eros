/* ═══════════════════════════════════════════════════════════════
   Eros v5 — Method: Inversion (The Inverted Klimt Synthesis)
   Forked from Edifice. Implements:
   1. Recursive Slicing (Muqarnas / Escher fractals in Flanks)
   2. Vector Shearing (Kandinsky directional physics)
   3. Architectural Hatch Rendering (Siliakus materiality contrast)
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'inversion',
  name: 'Inversion',
  version: '5.0.0',
  description: 'Rigid geometry trapping violent fluid physics. Uses Hieratic Scale (Trunk vs Flanks) with recursive Muqarnas slicing and Kandinsky vector shearing.',

  palettes: [
    {
      name: 'Klimt Void', mood: 'Theoretical Synthesis',
      colors: [
        { h: 42,  s: 70, l: 45 },  // Gold Leaf
        { h: 216, s: 68, l: 30 },  // Prussian Architecture
        { h: 10,  s: 60, l: 40 },  // Vermilion 
        { h: 36,  s: 15, l: 92 },  // Siliakus Paper
      ]
    },
    {
      name: 'Blueprints (3aac7)', mood: 'Structural Analysis',
      colors: [
        { h: 216, s: 68, l: 30 },
        { h: 204, s: 62, l: 48 },
        { h: 198, s: 58, l: 56 },
        { h: 36,  s: 20, l: 87 },
      ]
    }
  ],

  params: [
    { key: 'seed',         type: 'number', label: 'Hash Seed',           default: 1888,  min: 1,    max: 999999 },
    { key: 'columns',      type: 'range',  label: 'Grid Columns',        default: 16,   min: 5,    max: 40,     precision: 0 },
    { key: 'composition',  type: 'select', label: 'Hieratic Scale',      default: 'cross', options: ['trunk', 'cross', 'cluster'] },
    { key: 'cellMargin',   type: 'range',  label: 'Paper Margin (px)',   default: 1.5,  min: 0.0,  max: 10.0,   precision: 1 },
    
    // Physics Config
    { key: 'meshRes',      type: 'range',  label: 'Cloth Density (px)',  default: 4.0,  min: 2.0,  max: 10.0,   precision: 1 },
    { key: 'shearForces',  type: 'range',  label: 'Shear Vectors',       default: 8,    min: 1,    max: 30,     precision: 0 },
    { key: 'simSteps',     type: 'range',  label: 'Physics Iterations',  default: 40,   min: 10,   max: 80,     precision: 0 },
  ],

  narrative(p) {
    return `Governed by the Siliakus-Kandinsky inversion. A ${p.composition} topology establishes Hieratic Scale across ${p.columns} columns. ` +
      `Peripheral zones collapse into Escher-like recursive fractals, while central pillars remain monolithic. ` +
      `Internal to shattered cells, an Ebru-elastic 2D cloth (res ${p.meshRes}px) is sheared diagonally by ${p.shearForces} Kandinsky vectors. ` +
      `Pristine cells render as dense architectural hatches; torn cells reveal violent negative space voids.`;
  },

  equation(p) {
    return `Tension = Mesh(2D) ⊗ VectorShear(Kandinsky)\n` +
      `Layout = RecursiveSplit(Muqarnas, depth∝1/Importance)\n` +
      `Material = Hatching(Siliakus) | Void(Ebru)`;
  },

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER LOOP 
  // ═══════════════════════════════════════════════════════════════
  render(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const startT = performance.now();

    // ── 1. The Composition Layout (Recursive Muqarnas) ──────────
    let baseRects = this._buildCompositionGrid(W, H, params.columns, params.composition, prng);
    
    // Apply Recursive Shattering to "Flank" (Low Importance) chunks
    let finalRects = [];
    for (const br of baseRects) {
      if (br.importance === 'low') {
         this._shatterRect(br, 0, prng.range(1, 3), finalRects, prng);
      } else {
         finalRects.push(br);
      }
    }

    // ── 2. Siliakus Margins (The Paper Cut) ─────────────────────
    const pixelRects = [];
    for (const r of finalRects) {
      let px = r.x + params.cellMargin;
      let py = r.y + params.cellMargin;
      let pw = r.w - params.cellMargin * 2;
      let ph = r.h - params.cellMargin * 2;
      if (pw > 2 && ph > 2) {
        pixelRects.push({ x: px, y: py, w: pw, h: ph, importance: r.importance });
      }
    }

    // ── 3. Background Setup ─────────────────────────────────────
    const bgColor = palette[palette.length - 1]; 
    ctx.fillStyle = `hsl(${bgColor.h}, ${bgColor.s}%, ${bgColor.l}%)`;
    ctx.fillRect(0, 0, W, H);
    this._addGrain(ctx, W, H, prng);

    // ── 4. Kandinsky Shearing Vectors ───────────────────────────
    const palLen = Math.max(1, palette.length - 1);
    const shears = this._generateShears(W, H, params, prng);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    
    let totalNodes = 0;

    // ── 5. Simulate & Render ────────────────────────────────────
    for (let ri = 0; ri < pixelRects.length; ri++) {
      const rect = pixelRects[ri];
      const colIdx = Math.floor(prng.next() * palLen);
      const col = palette[colIdx];
      
      const aspect = rect.h / rect.w;
      const maxLength = Math.max(rect.w, rect.h);
      
      // Hieratic Scale determines Physics Resistance
      let tearResistance = 1.0;
      if (rect.importance === 'high') tearResistance = 1000.0; // Monoliths are immune
      else if (maxLength > H * 0.25) tearResistance = 50.0; // Medium mostly immune
      else tearResistance = prng.range(0.1, 4.0); // Fractal chunks tear effortlessly!
      
      const localShears = shears.filter(e => 
        e.x >= rect.x - 300 && e.x <= rect.x + rect.w + 300 &&
        e.y >= rect.y - 300 && e.y <= rect.y + rect.h + 300
      );

      // Render Strategy: Siliakus vs Ebru (Immune vs Torn)
      ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.8)`;
      
      if (tearResistance > 100 || localShears.length === 0) {
          // PRISTINE MONOLITH: Siliakus Dense Architectural Hatching
          ctx.lineWidth = 0.5;
          this._renderSiliakusHatch(ctx, rect, prng);
      } else {
          // TORN CELL: 2D Cloth Mesh with Kandinsky Vector Shear
          ctx.lineWidth = 0.8;
          const cloth = this._buildClothMesh(rect, params.meshRes);
          if (cloth.nodes.length > 0) {
             this._simulateKandinskyShear(cloth, rect, localShears, params.simSteps, tearResistance);
             this._renderEbruCloth(ctx, cloth);
             totalNodes += cloth.nodes.length;
          }
      }
    }

    const elapsed = performance.now() - startT;

    return {
      rectangles: pixelRects.length,
      clothNodes: totalNodes,
      perf: `${elapsed.toFixed(0)}ms (Inversion Matrix)`,
      renderMode: 'Klimt Inversion / High Contrast Materiality'
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // RECURSIVE MUQARNAS LAYOUT
  // ═══════════════════════════════════════════════════════════════
  _buildCompositionGrid(W, H, numCols, style, prng) {
    const rects = [];
    const colW = W / numCols;
    const cx1 = numCols * 0.3;
    const cx2 = numCols * 0.7;
    const cy1 = H * 0.3;
    const cy2 = H * 0.7;

    for (let c = 0; c < numCols; c++) {
      let y = 0;
      const x = c * colW;
      
      while (y < H) {
        let isMainShape = false;
        if (style === 'trunk') isMainShape = (c >= cx1 && c <= cx2); 
        if (style === 'cross') isMainShape = (c >= cx1 && c <= cx2) || (y >= cy1 && y <= cy2); 
        if (style === 'cluster') isMainShape = (Math.sin(c*0.5) * Math.cos(y*0.01) > 0.2);

        let sliceH;
        let imp = 'low';
        
        if (isMainShape) {
          if (prng.next() > 0.4) {
             sliceH = prng.range(H * 0.25, H * 0.7);
             imp = 'high'; // Towering monoliths
          } else {
             sliceH = prng.range(20, 100);
             imp = 'medium';
          }
        } else {
          sliceH = prng.range(10, 30);
          imp = 'low'; // Subdivides furiously later
        }

        if (y + sliceH > H) { sliceH = H - y; imp = 'low'; } // Edge cleanup

        let widthSpan = colW;
        if (imp === 'high' && prng.next() > 0.7) {
           let spanCols = Math.floor(prng.range(2, 5));
           widthSpan = colW * Math.min(spanCols, numCols - c);
        }
        
        rects.push({ x: x, y: y, w: widthSpan, h: sliceH, importance: imp });
        y += sliceH;
      }
    }
    return rects;
  },

  _shatterRect(rect, depth, maxDepth, out, prng) {
    if (depth >= maxDepth || rect.w < 8 || rect.h < 8) {
       out.push(rect);
       return;
    }
    // Random split (Escher/Muqarnas subdivision)
    if (prng.next() > 0.5 && rect.w > 15) {
        const split = prng.range(0.3, 0.7) * rect.w;
        this._shatterRect({x: rect.x, y: rect.y, w: split, h: rect.h, importance: 'low'}, depth+1, maxDepth, out, prng);
        this._shatterRect({x: rect.x + split, y: rect.y, w: rect.w - split, h: rect.h, importance: 'low'}, depth+1, maxDepth, out, prng);
    } else if (rect.h > 15) {
        const split = prng.range(0.3, 0.7) * rect.h;
        this._shatterRect({x: rect.x, y: rect.y, w: rect.w, h: split, importance: 'low'}, depth+1, maxDepth, out, prng);
        this._shatterRect({x: rect.x, y: rect.y + split, w: rect.w, h: rect.h - split, importance: 'low'}, depth+1, maxDepth, out, prng);
    } else {
        out.push(rect);
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // KANDINSKY VECTOR PHYSICS
  // ═══════════════════════════════════════════════════════════════
  _generateShears(W, H, params, prng) {
    const pool = [];
    const count = params.shearForces; 
    for (let i = 0; i < count; i++) {
        const angle = prng.range(0, Math.PI * 2);
        pool.push({
            x: prng.range(-W*0.1, W*1.1),
            y: prng.range(-H*0.1, H*1.1),
            force: prng.range(1000, 5000),
            vx: Math.cos(angle), // Sharp directional vector (Kandinsky)
            vy: Math.sin(angle)
        });
    }
    return pool;
  },

  _buildClothMesh(rect, density) {
    const cols = Math.max(2, Math.floor(rect.w / density));
    const rows = Math.max(2, Math.floor(rect.h / density));
    const nodes = [];
    const grid = [];

    for (let r = 0; r <= rows; r++) {
      const rowArr = [];
      const py = rect.y + (r / rows) * rect.h;
      for (let c = 0; c <= cols; c++) {
        const px = rect.x + (c / cols) * rect.w;
        const node = {
          x: px, y: py,
          vx: 0, vy: 0,
          isEdgeX: (c === 0 || c === cols),
          isEdgeY: (r === 0 || r === rows)
        };
        nodes.push(node);
        rowArr.push(node);
      }
      grid.push(rowArr);
    }
    
    // Cross-stitching constraints
    const links = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const node = grid[r][c];
        if (c < cols) links.push({ n1: node, n2: grid[r][c+1], dist: (rect.w / cols) }); 
        if (r < rows) links.push({ n1: node, n2: grid[r+1][c], dist: (rect.h / rows) }); 
      }
    }
    return { nodes, links, cols, rows };
  },

  _simulateKandinskyShear(cloth, rect, shears, steps, resistance) {
    const springK = 0.5; 
    const damp = 0.85;   
    const repulseModifier = 1.0 / resistance;

    for (let step = 0; step < steps; step++) {
      // 1. Vector Shearing (Not just radial bomb)
      for (const node of cloth.nodes) {
        if (node.isEdgeX && node.isEdgeY) continue; 

        let fx = 0, fy = 0;
        for (const shear of shears) {
          const dx = node.x - shear.x;
          const dy = node.y - shear.y;
          const distSq = dx * dx + dy * dy + 1; 
          
          if (distSq < shear.force * 50) {
             const forceMag = (shear.force / distSq) * repulseModifier;
             // Push entirely along the Kandinsky angle, not radially!
             fx += shear.vx * forceMag * 15;
             fy += shear.vy * forceMag * 15;
          }
        }
        node.vx += fx;
        node.vy += fy;
      }
      
      // 2. Cloth Link Constraints 
      for (let iter = 0; iter < 2; iter++) {
        for (const link of cloth.links) {
           const dx = link.n2.x - link.n1.x;
           const dy = link.n2.y - link.n1.y;
           const dist = Math.sqrt(dx * dx + dy * dy) || 1;
           const diff = (dist - link.dist) / dist;
           
           const ox = dx * diff * 0.5 * springK;
           const oy = dy * diff * 0.5 * springK;
           
           if (!link.n1.isEdgeX && !link.n1.isEdgeY) { link.n1.x += ox; link.n1.y += oy; }
           if (!link.n2.isEdgeX && !link.n2.isEdgeY) { link.n2.x -= ox; link.n2.y -= oy; }
        }
      }

      // 3. Update & Strict Boundaries (Siliakus Cut)
      for (const node of cloth.nodes) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= damp;
          node.vy *= damp;
          
          if (node.x < rect.x) { node.x = rect.x; node.vx = 0; }
          if (node.x > rect.x + rect.w) { node.x = rect.x + rect.w; node.vx = 0; }
          if (node.y < rect.y) { node.y = rect.y; node.vy = 0; }
          if (node.y > rect.y + rect.h) { node.y = rect.y + rect.h; node.vy = 0; }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // HIGH CONTRAST RENDERERS
  // ═══════════════════════════════════════════════════════════════
  _renderEbruCloth(ctx, cloth) {
    ctx.beginPath();
    for (const link of cloth.links) {
       ctx.moveTo(link.n1.x, link.n1.y);
       ctx.lineTo(link.n2.x, link.n2.y);
    }
    ctx.stroke();
  },

  _renderSiliakusHatch(ctx, rect, prng) {
    ctx.beginPath();
    const density = 2.0; 
    const mode = prng.next();
    
    // Choose hatching style for this specific monolith
    if (mode > 0.6) {
        // Strict horizontal lines
        for (let y = rect.y; y <= rect.y + rect.h; y += density) {
            ctx.moveTo(rect.x, y);
            ctx.lineTo(rect.x + rect.w, y);
        }
    } else if (mode > 0.3) {
        // Dense true grid (horizontal + vertical)
        for (let y = rect.y; y <= rect.y + rect.h; y += density) {
            ctx.moveTo(rect.x, y); ctx.lineTo(rect.x + rect.w, y);
        }
        for (let x = rect.x; x <= rect.x + rect.w; x += density) {
            ctx.moveTo(x, rect.y); ctx.lineTo(x, rect.y + rect.h);
        }
    } else {
        // Diagonal sheer (Kandinsky foresight)
        for (let d = -rect.w; d <= rect.h + rect.w; d += density*1.5) {
            const startX = Math.max(rect.x, rect.x + d);
            const startY = Math.max(rect.y, rect.y + d - rect.w);
            const endX = Math.min(rect.x + rect.w, rect.x + d + rect.h);
            const endY = Math.min(rect.y + rect.h, rect.y + d);
            if (endX >= startX && endY >= startY) {
               ctx.moveTo(startX, startY);
               ctx.lineTo(endX, endY);
            }
        }
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
