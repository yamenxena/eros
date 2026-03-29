/* ═══════════════════════════════════════════════════════════════
   Eros v5 — Method: Lattice (The Woven Edifice)
   Implements Tartan Grid space-packing, 2D Spring-Mass mesh with
   directional gravitational tearing, dense triangular subdivision, 
   and strict sticky/bouncy container boundary controls.
   Canvas is natively set to 1200x1600 (Portrait).
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'lattice',
  name: 'Lattice',
  version: '2.0.0',
  description: 'A 2D true physics approach. Tartan layout populated by triangular spring meshes that warp and tear under explosions and gravity while trapped inside cells.',
  
  // Custom Canvas Properties parsed by eros-core.js
  width: 1200,
  height: 1600,

  palettes: [
    {
      name: 'Retro Architectural', mood: 'Risograph',
      colors: [
        { h: 0,   s: 0,  l: 16 },  // Charcoal Black
        { h: 18,  s: 60, l: 49 },  // Terracotta / Burnt Orange
        { h: 42,  s: 60, l: 55 },  // Mustard / Dull Goldenrod
        { h: 185, s: 35, l: 37 },  // Muted Teal / Deep Cyan
        { h: 350, s: 70, l: 75 },  // Blush / Pale Coral
        { h: 44,  s: 30, l: 94 },  // Warm Cream Background (Canvas)
      ]
    },
    {
      name: 'Structural Blueprints', mood: 'Rigid Analysis',
      colors: [
        { h: 216, s: 68, l: 20 },  // Deep Indigo
        { h: 204, s: 62, l: 48 },  // Royal Blue
        { h: 198, s: 58, l: 56 },  // Cerulean Shift
        { h: 220, s: 15, l: 35 },  // Slate Grey
        { h: 200, s: 20, l: 70 },  // Pale Slate
        { h: 36,  s: 20, l: 87 },  // Bleached Paper Cream
      ]
    }
  ],

  params: [
    { key: 'seed',         type: 'number', label: 'Hash Seed',           default: 505,  min: 1,    max: 999999 },
    { key: 'columns',      type: 'range',  label: 'Grid Columns',        default: 18,   min: 5,    max: 40,     precision: 0 },
    { key: 'clothDensity', type: 'range',  label: 'Mesh Density (px)',   default: 6.0,  min: 3.0,  max: 15.0,   precision: 1 },
    { key: 'explosions',   type: 'range',  label: 'Explosion Count',     default: 18,   min: 0,    max: 50,     precision: 0 },
    { key: 'gravityX',     type: 'range',  label: 'Gravity X',           default: 0.0,  min: -40.0,max: 40.0,   precision: 1 },
    { key: 'gravityY',     type: 'range',  label: 'Gravity Y',           default: 12.0, min: -40.0,max: 40.0,   precision: 1 },
    { key: 'boundary',     type: 'select', label: 'Boundary Rule',       default: 'Sticky', options: ['Sticky', 'Bouncy'] },
    { key: 'simSteps',     type: 'range',  label: 'Physics Steps',       default: 50,   min: 10,   max: 100,    precision: 0 },
    { key: 'cellMargin',   type: 'range',  label: 'Cell Margin (px)',    default: 1.5,  min: 0.0,  max: 10.0,   precision: 1 },
    { key: 'lineWidth',    type: 'range',  label: 'Mesh Line Width',     default: 0.6,  min: 0.1,  max: 3.0,    precision: 1 },
  ],

  narrative(p) {
    return `Set on a large portrait grid (${this.width}x${this.height}), ` +
      `the algorithm generates a Tartan composition of ${p.columns} columns. ` +
      `Each discrete block houses a triangulated, spring-linked mesh (density ${p.clothDensity}px). ` +
      `Subjected to ${p.explosions} explosion nodes and a physical pull of [${p.gravityX.toFixed(1)}, ${p.gravityY.toFixed(1)}], ` +
      `the fabric tears and distorts, bounded strictly by ${p.boundary} walls.`;
  },

  equation(p) {
    return `Layout: TartanCross(cols=${p.columns}, margin=${p.cellMargin}px)\n` +
      `Texture: TriGrid2D(Δ=${p.clothDensity}px) ⊗ F_exp(${p.explosions}) + g(${p.gravityX},${p.gravityY})\n` +
      `Constraints: BoxCollider(mode=${p.boundary})`;
  },

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER LOOP 
  // ═══════════════════════════════════════════════════════════════
  render(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const startT = performance.now();

    // 1. Build Tartan Grid Layout
    let rects = this._buildTartanGrid(W, H, params.columns, prng);

    // Apply Margins
    const pixelRects = [];
    for (const r of rects) {
      let px = r.x + params.cellMargin;
      let py = r.y + params.cellMargin;
      let pw = r.w - params.cellMargin * 2;
      let ph = r.h - params.cellMargin * 2;
      if (pw > 2 && ph > 2) {
        pixelRects.push({ x: px, y: py, w: pw, h: ph, isCentral: r.isCentral });
      }
    }

    // 2. Background
    const bgColor = palette[palette.length - 1]; // Light paper at end
    ctx.fillStyle = `hsl(${bgColor.h}, ${bgColor.s}%, ${bgColor.l}%)`;
    ctx.fillRect(0, 0, W, H);
    this._addGrain(ctx, W, H, prng);

    // 3. Global Forces
    const palLen = Math.max(1, palette.length - 1);
    const explosionPool = this._generateExplosions(W, H, params, prng);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    ctx.lineWidth = params.lineWidth;

    let totalNodes = 0;

    // 4. Mesh Generation & Simulation
    for (let ri = 0; ri < pixelRects.length; ri++) {
      const rect = pixelRects[ri];

      // Structural Color
      const colIdx = Math.floor(prng.next() * palLen);
      const col = palette[colIdx];
      
      // Resistance Logic (from Art Analysis)
      // Long intact vertical stripes in trunk vs torn small chunks in flanks
      const aspect = rect.h / rect.w;
      const maxLength = Math.max(rect.w, rect.h);
      let tearResistance = 1.0;
      
      if (rect.isCentral && maxLength > H * 0.4) {
         tearResistance = 1000.0; // Central long blocks are highly resistant (intact)
      } else if (rect.isCentral) {
         tearResistance = 5.0; // Medium center blocks (partially ~30% deformed)
      } else {
         tearResistance = prng.range(0.2, 3.0); // Flanks: heavily torn due to zero resistance
      }

      // Build True Triangular Mesh
      const cloth = this._buildClothMesh(rect, params.clothDensity);
      if (cloth.nodes.length === 0) continue;
      
      const localExplosions = explosionPool.filter(e => 
        e.x >= rect.x - 400 && e.x <= rect.x + rect.w + 400 &&
        e.y >= rect.y - 400 && e.y <= rect.y + rect.h + 400
      );

      // Simulate!
      this._simulateLatticePhysics(cloth, rect, localExplosions, params, prng, tearResistance);
      
      // Render
      ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.85)`;
      this._renderMesh(ctx, cloth);
      
      totalNodes += cloth.nodes.length;
    }

    const elapsed = performance.now() - startT;

    return {
      rectangles: pixelRects.length,
      meshNodes: totalNodes,
      perf: `${elapsed.toFixed(0)}ms (Lattice Simulation)`,
      renderMode: 'TriGrid Canvas'
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // STRUCTURAL COMPOSITION GENERATION (TARTAN)
  // ═══════════════════════════════════════════════════════════════
  _buildTartanGrid(W, H, numCols, prng) {
    const rects = [];
    const colW = W / numCols;
    
    // Tartan Cross Areas
    const cx1 = Math.floor(numCols * 0.35); 
    const cx2 = Math.floor(numCols * 0.65); 
    const cy1 = H * 0.35;
    const cy2 = H * 0.65;

    for (let c = 0; c < numCols; c++) {
      let y = 0;
      const x = c * colW;
      
      while (y < H) {
        const inCrossX = (c >= cx1 && c <= cx2);
        const inCrossY = (y >= cy1 && y <= cy2);
        const isTrunk = inCrossX || inCrossY;
        
        // Random lengths according to the Tartan topology
        let sliceH;
        if (isTrunk) {
            // Main structure elements are large bands
            sliceH = prng.range(100, H * 0.65); 
        } else {
            // Corner Flanks are short staccato stripes
            sliceH = prng.range(10, 80); 
        }

        if (y + sliceH > H) sliceH = H - y;

        // Add some horizontal clustering to fuse thin columns
        let widthSpan = colW;
        if (isTrunk && prng.next() > 0.7) {
            let spanCols = Math.floor(prng.range(2, 4));
            widthSpan = colW * Math.min(spanCols, numCols - c);
            // Caution: does not truly skip the looped columns, 
            // so overlapping adds dense visual strata
        }
        
        rects.push({ x, y, w: widthSpan, h: sliceH, isCentral: isTrunk });
        y += sliceH;
      }
    }
    
    return rects;
  },

  // ═══════════════════════════════════════════════════════════════
  // 2D CLOTH MESH PHYSICS
  // ═══════════════════════════════════════════════════════════════
  _buildClothMesh(rect, density) {
    const cols = Math.max(2, Math.floor(rect.w / density));
    const rows = Math.max(2, Math.floor(rect.h / density));
    
    const nodes = [];
    const grid = [];

    // Create Nodes
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
    
    // Create true 2D structural links (Triangle Subdivisions!)
    const links = [];
    const diagDist = Math.sqrt(Math.pow(rect.w/cols, 2) + Math.pow(rect.h/rows, 2));

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const node = grid[r][c];
        if (c < cols) links.push({ n1: node, n2: grid[r][c+1], dist: (rect.w / cols) }); // H
        if (r < rows) links.push({ n1: node, n2: grid[r+1][c], dist: (rect.h / rows) }); // V
        
        // Triangulating diagonals form the dense mesh
        if (r < rows && c < cols) {
           links.push({ n1: node, n2: grid[r+1][c+1], dist: diagDist });
        }
      }
    }

    return { nodes, links, cols, rows };
  },

  _generateExplosions(W, H, params, prng) {
    const pool = [];
    const totalExp = params.explosions; 
    for (let i = 0; i < totalExp; i++) {
        pool.push({
            x: prng.range(-W*0.1, W*1.1),
            y: prng.range(-H*0.1, H*1.1),
            force: prng.range(1200, 6000) // Explosive repulsors
        });
    }
    return pool;
  },

  _simulateLatticePhysics(cloth, rect, explosions, params, prng, resistance) {
    if (explosions.length === 0 && params.gravityX === 0 && params.gravityY === 0) return;
    if (resistance > 100) return; // Completely immune (Trunks)

    const springK = 0.5; 
    const damp = 0.82;   
    const repulseModifier = 1.0 / Math.max(0.1, resistance);
    const isBouncy = params.boundary === 'Bouncy';

    for (let step = 0; step < params.simSteps; step++) {
      // 1. External Forces: Gravity and Explosions
      for (const node of cloth.nodes) {
        // Sticky boundary conditions completely lock perimeter nodes
        if (!isBouncy && (node.isEdgeX || node.isEdgeY)) continue;

        let fx = params.gravityX * 0.1 * repulseModifier;
        let fy = params.gravityY * 0.1 * repulseModifier;

        // Repulsive Explosions
        for (const exp of explosions) {
          const dx = node.x - exp.x;
          const dy = node.y - exp.y;
          const distSq = dx * dx + dy * dy + 1;
          
          if (distSq < exp.force * 60) {
             const force = exp.force / distSq;
             const dist = Math.sqrt(distSq);
             fx += (dx / dist) * force * repulseModifier;
             fy += (dy / dist) * force * repulseModifier;
          }
        }
        
        node.vx += fx;
        node.vy += fy;
      }
      
      // 2. Mesh Tension
      for (let iter = 0; iter < 2; iter++) { 
        for (const link of cloth.links) {
           const dx = link.n2.x - link.n1.x;
           const dy = link.n2.y - link.n1.y;
           const dist = Math.sqrt(dx * dx + dy * dy) || 1;
           const diff = (dist - link.dist) / dist;
           
           const ox = dx * diff * 0.5 * springK;
           const oy = dy * diff * 0.5 * springK;
           
           const n1Locked = !isBouncy && (link.n1.isEdgeX || link.n1.isEdgeY);
           const n2Locked = !isBouncy && (link.n2.isEdgeX || link.n2.isEdgeY);

           if (!n1Locked) { link.n1.x += ox; link.n1.y += oy; }
           if (!n2Locked) { link.n2.x -= ox; link.n2.y -= oy; }
        }
      }

      // 3. Integration & Box-Collider Bounds
      const bounceStr = -0.5; // Dampened bounce
      for (const node of cloth.nodes) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= damp;
          node.vy *= damp;
          
          // X Bounds
          if (node.x <= rect.x) {
             node.x = rect.x;
             if (isBouncy) node.vx *= bounceStr; else node.vx = 0;
          } else if (node.x >= rect.x + rect.w) {
             node.x = rect.x + rect.w;
             if (isBouncy) node.vx *= bounceStr; else node.vx = 0;
          }

          // Y Bounds
          if (node.y <= rect.y) {
             node.y = rect.y;
             if (isBouncy) node.vy *= bounceStr; else node.vy = 0;
          } else if (node.y >= rect.y + rect.h) {
             node.y = rect.y + rect.h;
             if (isBouncy) node.vy *= bounceStr; else node.vy = 0;
          }
      }
    }
  },

  _renderMesh(ctx, cloth) {
    ctx.beginPath();
    for (const link of cloth.links) {
       ctx.moveTo(link.n1.x, link.n1.y);
       ctx.lineTo(link.n2.x, link.n2.y);
    }
    ctx.stroke();
  },

  _addGrain(ctx, W, H, prng) {
    const id = ctx.getImageData(0, 0, W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (prng.next() - 0.5) * 14;
      d[i] += noise; d[i + 1] += noise; d[i + 2] += noise;
    }
    ctx.putImageData(id, 0, 0);
  }
});
