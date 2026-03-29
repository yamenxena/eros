/* ═══════════════════════════════════════════════════════════════
   Eros v5 — Method: Edifice v2 (Kovach)
   A fully robust evolution of Edifice matching the strict 
   ontological taxonomy and heuristics (v2).
   Provides the "missing settings" of Edifice:
   - Fill Style Grid generation (Random Walk / Ns)
   - Cloth Lattice & Hatched Textures
   - Explosive / Modern Boundary rules
   - Inverse-Square Explosions & Displacements
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'edifice-v2',
  name: 'Edifice v2 (Kovach)',
  category: 'Architectural',
  version: '5.1.0',
  description: 'Pure ontological spatial matrix (Random Walk Fill/Ns) enclosing 2D nets subjected to inverse-square repulsive explosions, bounded by sticky/bouncy enclosures, and post-warped.',

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
        { h: 0, s: 70, l: 40 },
        { h: 10, s: 80, l: 50 },
        { h: 350, s: 60, l: 30 },
        { h: 42, s: 20, l: 92 },
      ]
    }
  ],

  // Parameters MUST start from simple foundational iterations (low grid sizes, fast physics)
  params: [
    { key: 'seed', type: 'number', label: 'Hash Seed', default: 834, min: 1, max: 999999, category: 'Method' },
    
    // Level 1: The Pack
    { key: 'gridCols', type: 'range', label: 'Cell Area (Cols)', default: 22, min: 4, max: 50, precision: 0, category: 'Method' },
    { key: 'fillAlgo', type: 'select', label: 'Fill Style', default: 'Random Walk', options: ['Random Walk', 'Random Box', 'Ns'], category: 'Method' },

    // Level 2/3: The Enclosure & Forces
    { key: 'boundStyle', type: 'select', label: 'Style (Enclosure)', default: 'Modern (Sticky)', options: ['Modern (Sticky)', 'Explosive (Bounce)'], category: 'Physics' },
    { key: 'expCount', type: 'range', label: 'Explosion Amount', default: 15, min: 0, max: 100, precision: 0, category: 'Physics' },
    { key: 'expPos', type: 'select', label: 'Explosion Source', default: 'Random', options: ['Random', 'Corners', 'Edges', 'Central'], category: 'Physics' },
    { key: 'interference', type: 'range', label: 'Interference Rad', default: 450, min: 50, max: 1500, precision: 0, category: 'Physics' },
    { key: 'displacement', type: 'select', label: 'Displacement Type', default: 'Sharp', options: ['None', 'Twist', 'Sharp', 'Shift'], category: 'Physics' },
    
    // Level 4/5: The Hatch & Texture
    { key: 'texture', type: 'select', label: 'Texture Style', default: 'Hatched', options: ['Lattice', 'Hatched', 'Sqribble'], category: 'Render' },
    { key: 'lineWeight', type: 'range', label: 'Ink Pen Size', default: 0.60, min: 0.1, max: 3.0, precision: 2, category: 'Render' },
    { key: 'lineAlpha', type: 'range', label: 'Ink Alpha', default: 0.85, min: 0.05, max: 1.0, precision: 2, category: 'Render' },
  ],

  narrative(p) {
    return `An abstraction of Brutalist physics. A ${p.gridCols}x${p.gridCols} metric space partitioned via ${p.fillAlgo} packing. ` +
      `Each architectural sector holds a mesh rendered in ${p.texture} mode, disturbed by ${p.expCount} ${p.expPos} explosions. ` +
      `Boundaries enforce strict ${p.boundStyle} mereology. Form is finalized by ${p.displacement}-type topological displacement matrices.`;
  },

  equation(p) {
    return `[L1] Pack: Int8Array Fill(${p.fillAlgo})\n` +
      `[L2] Limit: BoxClamp = ${p.boundStyle}\n` +
      `[L3] Force: InverseSq(F, r < ${p.interference})\n` +
      `[L4] Mesh: Draw(${p.texture})\n` +
      `[L5] Pigment: Accum ↑ w/ ${p.displacement} Warp = Analog`;
  },

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER LOOP 
  // ═══════════════════════════════════════════════════════════════
  render(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const startT = performance.now();

    const padding = Math.min(W, H) * 0.06;
    const drawW = W - padding * 2;
    const drawH = H - padding * 2;

    // ── 1. The Pack (Fill Style Algorithm) ───────────
    const enclosures = this._buildCompositionGrid(params.gridCols, params.fillAlgo, prng);

    // ── 2. The Net Forces (Explosions) ─────────────
    const explosionPool = this._generateExplosions(W, H, params, prng);

    // ── 3. Background Generation ────────────────────
    const bgColor = palette[palette.length - 1]; // Light paper is usually last
    ctx.fillStyle = `hsl(${bgColor.h}, ${bgColor.s}%, ${bgColor.l}%)`;
    ctx.fillRect(0, 0, W, H);
    this._addGrain(ctx, W, H, prng);

    // Render configuration
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    ctx.lineWidth = params.lineWeight;

    let totalNodes = 0;
    const cellW = drawW / params.gridCols;
    const cellH = drawH / params.gridCols;

    const palLen = Math.max(1, palette.length - 1);

    // ── 4. The Hatch (Process each Enclosure Mesh) ───
    for (let enc of enclosures) {
      const rect = {
         x: padding + enc.gx * cellW + 1.0, // slight 1px margin
         y: padding + enc.gy * cellH + 1.0,
         w: enc.gw * cellW - 2.0,
         h: enc.gh * cellH - 2.0
      };

      if (rect.w < 2 || rect.h < 2) continue;

      // Taxonomy-driven structural color (random picking as in Kovach's risograph proxy)
      const colIdx = Math.floor(prng.next() * palLen);
      const col = palette[colIdx];

      // Build 2D Cloth Mesh according to Texture Mode
      const cloth = this._buildClothMesh(rect, params.texture, prng);
      if (cloth.nodes.length === 0) continue;

      // Filter local explosions
      const localExplosions = explosionPool.filter(e => {
         const dx = rect.x + rect.w/2 - e.x;
         const dy = rect.y + rect.h/2 - e.y;
         return (Math.sqrt(dx*dx + dy*dy) < params.interference);
      });

      // Simulate!
      this._simulateClothPhysics(cloth, rect, localExplosions, params.boundStyle);

      // Render Vectors with Displacement Warp
      ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${params.lineAlpha})`;
      this._renderMesh(ctx, cloth, W/2, H/2, params.displacement);

      totalNodes += cloth.nodes.length;
    }

    ctx.globalCompositeOperation = 'source-over';
    const elapsed = performance.now() - startT;

    return {
      enclosures: enclosures.length,
      clothNodes: totalNodes,
      perf: `${elapsed.toFixed(0)}ms (Mereological Tectonics)`,
      renderMode: `Texture: ${params.texture} / Bounds: ${params.boundStyle}`
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // 1. THE PACK (Fill Style Space Partitioning)
  // ═══════════════════════════════════════════════════════════════
  _buildCompositionGrid(cols, fillAlgo, prng) {
    const grid = new Int8Array(cols * cols);
    const enclosures = [];

    // Sweeping through the grid to fill every cell
    for (let y = 0; y < cols; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y * cols + x] !== 0) continue;

        let w = 1;
        let h = 1;

        if (fillAlgo === 'Random Box') {
           w = Math.floor(prng.range(1, cols - x));
           h = Math.floor(prng.range(1, cols - y));
           while(w > 1 || h > 1) {
             let valid = true;
             for (let dy = 0; dy < h; dy++) {
               for (let dx = 0; dx < w; dx++) {
                 if ((y + dy) >= cols || (x + dx) >= cols || grid[(y + dy) * cols + (x + dx)] !== 0) {
                   valid = false;
                 }
               }
             }
             if(valid) break;
             if(w > 1) w--;
             if(h > 1 && !valid) h--;
           }
        } 
        else if (fillAlgo === 'Ns') {
           // Force Square Blocks (N x N)
           w = h = Math.floor(prng.range(1, Math.min(cols - x, cols - y, 8)));
           while(w > 1) {
             let valid = true;
             for(let dy=0; dy<w; dy++) {
               for(let dx=0; dx<w; dx++) {
                 if (grid[(y + dy) * cols + (x + dx)] !== 0) valid = false;
               }
             }
             if(valid) break;
             w--; h--;
           }
        } 
        else {
           // 'Random Walk' approximation: Thin, variable strips stretching unevenly
           w = Math.floor(prng.range(1, cols - x));
           h = Math.floor(prng.range(1, cols - y));
           if (prng.next() > 0.5) w = prng.next() > 0.8 ? w : 1; 
           else h = prng.next() > 0.8 ? h : 1;
           
           while(w > 1 || h > 1) {
             let valid = true;
             for(let dy=0; dy<h; dy++) {
               for(let dx=0; dx<w; dx++) {
                 if (grid[(y + dy) * cols + (x + dx)] !== 0) valid = false;
               }
             }
             if(valid) break;
             if(prng.next() > 0.5) { if(w > 1) w--; } else { if(h > 1) h--; }
           }
        }

        // Write the finalized enclosure to the INT8 Matrix
        for(let dy=0; dy<h; dy++){
           for(let dx=0; dx<w; dx++){
             grid[(y + dy) * cols + (x + dx)] = 1;
           }
        }

        enclosures.push({ gx: x, gy: y, gw: w, gh: h });
      }
    }
    return enclosures;
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. THE NET (Explosions & Structural Mesh Generators)
  // ═══════════════════════════════════════════════════════════════
  _generateExplosions(W, H, params, prng) {
    const pool = [];
    for (let i = 0; i < params.expCount; i++) {
        let ex = 0, ey = 0;
        let forceMag = prng.range(800, 4500); 
        
        switch(params.expPos) {
           case 'Central':
              ex = W/2 + prng.range(-W*0.2, W*0.2);
              ey = H/2 + prng.range(-H*0.2, H*0.2);
              break;
           case 'Corners':
              ex = prng.next() > 0.5 ? prng.range(-W*0.1, W*0.1) : prng.range(W*0.9, W*1.1);
              ey = prng.next() > 0.5 ? prng.range(-H*0.1, H*0.1) : prng.range(H*0.9, H*1.1);
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
              ex = prng.range(-W*0.1, W*1.1);
              ey = prng.range(-H*0.1, H*1.1);
              break;
        }
        pool.push({ x: ex, y: ey, force: forceMag });
    }
    return pool;
  },

  _buildClothMesh(rect, textureMode, prng) {
    // Hatched texture demands much higher line density
    let densityPixels = textureMode === 'Hatched' ? 3.0 : 8.0; 
    
    if (rect.w < densityPixels * 2) return { nodes: [], links: [] };

    const cols = Math.max(2, Math.floor(rect.w / densityPixels));
    const rows = Math.max(2, Math.floor(rect.h / densityPixels));
    
    const nodes = [];
    const grid = [];

    // Create Base Nodes
    for (let r = 0; r <= rows; r++) {
      const rowArr = [];
      const py = rect.y + (r / rows) * rect.h;
      for (let c = 0; c <= cols; c++) {
        const px = rect.x + (c / cols) * rect.w;
        // Sqribble injects initial random displacement jitter before physics
        let jx = textureMode === 'Sqribble' ? prng.range(-2, 2) : 0;
        let jy = textureMode === 'Sqribble' ? prng.range(-2, 2) : 0;

        const node = {
          x: px + jx, y: py + jy,
          vx: 0, vy: 0,
        };
        nodes.push(node);
        rowArr.push(node);
      }
      grid.push(rowArr);
    }
    
    // Create Mathematical Links (Connections never break)
    const links = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const node = grid[r][c];
        
        // Horizontal Links (Applies to Lattice, Hatched, Sqribble)
        if (c < cols) {
           links.push({ n1: node, n2: grid[r][c+1], dist: rect.w/cols }); 
        }

        // Vertical && Diagonal Links (Lattice / Sqribble ONLY)
        if (textureMode === 'Lattice' || textureMode === 'Sqribble') {
           if (r < rows) {
              links.push({ n1: node, n2: grid[r+1][c], dist: rect.h/rows }); // V
           }
           if (r < rows && c < cols) {
              links.push({ n1: node, n2: grid[r+1][c+1], dist: Math.sqrt(Math.pow(rect.w/cols,2) + Math.pow(rect.h/rows,2)) }); // Diag
           }
        }
      }
    }

    return { nodes, links };
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. THE LIMITS (Cloth Physics Simulation & Tension Matrix)
  // ═══════════════════════════════════════════════════════════════
  _simulateClothPhysics(cloth, rect, explosions, boundStyle) {
    if (explosions.length === 0) return;

    const springK = 0.5;   // Network Structural Rigidity 
    const damp = 0.85;     // Velocity decay multiplier
    const simSteps = 25;   // Fixed timestep iterations for stability

    for (let step = 0; step < simSteps; step++) {
      // 1. Compute Inverse-Square Repulsion
      for (const node of cloth.nodes) {
        let fx = 0, fy = 0;
        for (const exp of explosions) {
          const dx = node.x - exp.x;
          const dy = node.y - exp.y;
          const distSq = dx * dx + dy * dy + 1;
          
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
      
      // 2. Cloth Link Constraints (Maintains Net Integrity)
      for (let iter = 0; iter < 1; iter++) { 
        for (const link of cloth.links) {
           const dx = link.n2.x - link.n1.x;
           const dy = link.n2.y - link.n1.y;
           const dist = Math.sqrt(dx * dx + dy * dy) || 1;
           const diff = (dist - link.dist) / dist;
           
           const ox = dx * diff * 0.5 * springK;
           const oy = dy * diff * 0.5 * springK;
           
           link.n1.x += ox; link.n1.y += oy;
           link.n2.x -= ox; link.n2.y -= oy;
        }
      }

      // 3. Move Nodes & Bound (The Space Enclosure Limits)
      for (const node of cloth.nodes) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= damp;
          node.vy *= damp;
          
          if (boundStyle === 'Modern (Sticky)') {
             if (node.x < rect.x) { node.x = rect.x; node.vx = 0; node.vy = 0; }
             if (node.x > rect.x + rect.w) { node.x = rect.x + rect.w; node.vx = 0; node.vy = 0; }
             if (node.y < rect.y) { node.y = rect.y; node.vx = 0; node.vy = 0; }
             if (node.y > rect.y + rect.h) { node.y = rect.y + rect.h; node.vx = 0; node.vy = 0; }
          } else {
             // Explosive (Bounce)
             const bounceEnergy = -0.5;
             if (node.x < rect.x) { node.x = rect.x; node.vx *= bounceEnergy; }
             if (node.x > rect.x + rect.w) { node.x = rect.x + rect.w; node.vx *= bounceEnergy; }
             if (node.y < rect.y) { node.y = rect.y; node.vy *= bounceEnergy; }
             if (node.y > rect.y + rect.h) { node.y = rect.y + rect.h; node.vy *= bounceEnergy; }
          }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. THE DISPLACEMENT (Topological Affine/Warp Modifications)
  // ═══════════════════════════════════════════════════════════════
  _displacePoint(px, py, cx, cy, type) {
     let x = px;
     let y = py;
     let dx = x - cx;
     let dy = y - cy;
     
     if (type === 'Twist') {
         let dist = Math.sqrt(dx*dx + dy*dy);
         let angle = Math.atan2(dy, dx) + dist * 0.0005; 
         x = cx + Math.cos(angle) * dist;
         y = cy + Math.sin(angle) * dist;
     } else if (type === 'Sharp') {
         // Forces distinct 45-degree brutalist tearing
         let forceScale = 0.08;
         x += Math.sign(dx) * Math.pow(Math.abs(dx), 0.95) * forceScale;
         y += Math.sign(dy) * Math.pow(Math.abs(dy), 0.95) * forceScale;
     } else if (type === 'Shift') {
         x += Math.sin(y * 0.02) * 15;
         y += Math.cos(x * 0.02) * 15;
     }
     
     return { x, y };
  },

  _renderMesh(ctx, cloth, cx, cy, displacementType) {
    ctx.beginPath();
    for (const link of cloth.links) {
       let p1 = this._displacePoint(link.n1.x, link.n1.y, cx, cy, displacementType);
       let p2 = this._displacePoint(link.n2.x, link.n2.y, cx, cy, displacementType);
       
       ctx.moveTo(p1.x, p1.y);
       ctx.lineTo(p2.x, p2.y);
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
