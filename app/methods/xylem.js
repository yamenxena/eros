/* ═══════════════════════════════════════════════════════════════
   Eros v5 — Method: Xylem (Hybrid Architectura/Botanica)
   Synthesizes the rigid compositional partitioning of Edifice
   with the dual-layered strain-swelling physics of Ailanthus.
   Explosions inside strict architectural boundaries trigger organic,
   botanical cell swellings that geometrically heal the torn paths.
   ═══════════════════════════════════════════════════════════════ */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'xylem',
    name: 'Xylem (Hybrid)',
    version: '1.0.0',
    description: 'Strict architectural blueprints violently invaded by living botanical tissue at structural lesion points.',

    palettes: [
      {
        name: 'Hybrid Life Cycle', mood: 'Architectural Decay',
        colors: [
          { h: 218, s: 55, l: 18 },  // Edifice: Deep Prussian Navy (Resting)
          { h: 205, s: 50, l: 40 },  // Edifice: Phthalo Blueprint (Resting)
          { h: 25,  s: 40, l: 52 },  // Ailanthus: Bronze Tension (Strained)
          { h: 74,  s: 55, l: 70 },  // Ailanthus: Yellow-Green Growth (Severely Strained)
        ]
      },
      {
        name: 'Infected Concrete', mood: 'Post-Industrial',
        colors: [
          { h: 0,   s: 0,  l: 15 },  // Black Concrete
          { h: 0,   s: 0,  l: 45 },  // Grey Slab
          { h: 0,   s: 80, l: 45 },  // Blood Rust Tension
          { h: 120, s: 80, l: 60 },  // Toxic Neon Ivy
        ]
      }
    ],

    params: [
      { key: 'seed',               type: 'number', label: 'Hash Seed',           default: 1337, min: 1,    max: 999999 },
      { key: 'columns',            type: 'range',  label: 'Grid Columns',        default: 12,   min: 4,    max: 30,    precision: 0 },
      { key: 'composition',        type: 'select', label: 'Composition Style',   default: 'cross', options: ['trunk', 'cross', 'cluster', 'cascade'] },
      { key: 'cellMargin',         type: 'range',  label: 'Architectural Margin',default: 3.0,  min: 0.0,  max: 15.0,  precision: 1 },
      
      { key: 'explosions',         type: 'range',  label: 'Lesion Violence (Exp)',default: 20,   min: 1,    max: 50,    precision: 0 },
      { key: 'microDensity',       type: 'range',  label: 'Micro Cells/Block',   default: 6,    min: 3,    max: 15,    precision: 0 },
      { key: 'callusSwell',        type: 'range',  label: 'Cellular Inverse Swell',default: 2.0,  min: 0.5,  max: 4.0,   precision: 1 },
      { key: 'biologicalJitter',   type: 'range',  label: 'Biological Jitter',   default: 0.5,  min: 0.0,  max: 2.0,   precision: 2 },
    ],

    narrative(p) {
      return `Governed by a "${p.composition}" architecture spanning ${p.columns} columns. ` +
        `Inside each rigid block, biological Quads (density ${p.microDensity}) are subjected to ${p.explosions} violent lesion forces. ` +
        `Severely strained Quads undergo Inverse Callus Swell (x${p.callusSwell}), mutating from rigid blue architecture into organic green biology to heal the voids.`;
    },

    equation(p) {
      return `Boundary: Edifice(${p.composition}, margins=${p.cellMargin})\n` +
             `Damage: F_lesion = C / d^2\n` +
             `Recovery: CallusSwell ∝ Integral(Strain)\n` +
             `Topology: No Overlap [Rigid Clamp]`;
    },

    // ═══════════════════════════════════════════════════════════════
    // MAIN GENERATOR
    // ═══════════════════════════════════════════════════════════════
    render(canvas, ctx, W, H, params, palette) {
      const prng = new PRNG(params.seed);
      const startT = performance.now();
      const noise = new SimplexNoise(prng);

      // 1. Procedural Composition Layout
      let rects = this._buildCompositionGrid(W, H, params.columns, params.composition, prng);

      // 2. Padding/Margin Enclosures
      const pixelRects = [];
      for (const r of rects) {
        let px = r.x + params.cellMargin;
        let py = r.y + params.cellMargin;
        let pw = r.w - params.cellMargin * 2;
        let ph = r.h - params.cellMargin * 2;
        if (pw > 10 && ph > 10) pixelRects.push({ x: px, y: py, w: pw, h: ph });
      }

      // 3. Clear Background (Bright Blueprint Surface)
      ctx.fillStyle = "#F5F5F0"; 
      ctx.fillRect(0, 0, W, H);

      // 4. Lesion Explosions
      const explosionPool = this._generateExplosions(W, H, params, prng);

      let totalQuads = 0;

      // 5. Generate and Simulate each independent Grid
      for (const rect of pixelRects) {
        // Only run explosions that are close to this rect
        const localExplosions = explosionPool.filter(e => 
          e.x >= rect.x - 200 && e.x <= rect.x + rect.w + 200 &&
          e.y >= rect.y - 200 && e.y <= rect.y + rect.h + 200
        );

        // Build the Quad matrix strictly inside this rect
        const matrix = this._buildMicroMesh(rect, params.microDensity, prng, noise, params.biologicalJitter);
        if (matrix.quads.length === 0) continue;

        // Perform Inverse Swell Damage Physics
        this._simulateLesionGrowth(matrix, rect, localExplosions, params);

        // Render Quads with Strain-Energy Botanical Coloring
        this._renderMatrix(ctx, matrix, palette);
        totalQuads += matrix.quads.length;
      }

      const elapsed = performance.now() - startT;
      return {
        architecturalBlocks: pixelRects.length,
        botanicalQuads: totalQuads,
        perf: `${elapsed.toFixed(0)}ms (Hybrid Physics)`,
        renderMode: 'Xylem Structural Hybrid'
      };
    },

    // ═══════════════════════════════════════════════════════════════
    // EDIFICE: MACRO COMPOSITION
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
          switch (style) {
            case 'trunk': isMainShape = (c >= cx1 && c <= cx2); break;
            case 'cross': isMainShape = (c >= cx1 && c <= cx2) || (y >= cy1 && y <= cy2); break;
            case 'cluster': isMainShape = (Math.sin(c*0.5) * Math.cos(y*0.01) > 0.2); break;
            case 'cascade': isMainShape = (prng.next() > (y / H)); break;
          }

          let sliceH;
          if (isMainShape) {
            if (prng.next() > 0.3) sliceH = prng.range(H * 0.2, H * 0.5);
            else sliceH = prng.range(20, 100);
          } else {
            sliceH = prng.range(10, 40);
          }

          if (y + sliceH > H) sliceH = H - y;

          let widthSpan = colW;
          if (isMainShape && sliceH < 60 && prng.next() > 0.7) {
             let spanCols = Math.floor(prng.range(2, 4));
             widthSpan = colW * Math.min(spanCols, numCols - c);
          }
          rects.push({ x, y, w: widthSpan, h: sliceH });
          y += sliceH;
        }
      }
      return rects;
    },

    _generateExplosions(W, H, params, prng) {
      const pool = [];
      for (let i = 0; i < params.explosions; i++) {
          pool.push({
              x: prng.range(0, W),
              y: prng.range(0, H),
              force: prng.range(1500, 5000) 
          });
      }
      return pool;
    },

    // ═══════════════════════════════════════════════════════════════
    // AILANTHUS: MICRO-QUAD PACKING & INVERSE SWELL PHYSICS
    // ═══════════════════════════════════════════════════════════════
    _buildMicroMesh(rect, density, prng, noise, jitter) {
      const aspect = rect.h / rect.w;
      const cols = density;
      const rows = Math.max(1, Math.floor(density * aspect));
      
      const nodes = [];
      const quads = [];
      const points = [];

      const stepX = rect.w / cols;
      const stepY = rect.h / rows;

      for (let r = 0; r <= rows; r++) {
        const rowArr = [];
        const baseY = rect.y + r * stepY;
        for (let c = 0; c <= cols; c++) {
          const baseX = rect.x + c * stepX;
          
          let nX = baseX;
          let nY = baseY;
          
          if (c > 0 && c < cols && r > 0 && r < rows) {
             const rAngle = prng.next() * Math.PI * 2;
             const rDist = prng.next() * Math.min(stepX, stepY) * 0.4 * jitter;
             const jx = Math.cos(rAngle) * rDist;
             const jy = Math.sin(rAngle) * rDist;
             nX += jx; nY += jy;
          }

          const node = { x: nX, y: nY, restX: nX, restY: nY, vx: 0, vy: 0, 
                         isEdgeX: (c===0 || c===cols), isEdgeY: (r===0 || r===rows) };
          nodes.push(node);
          rowArr.push(node);
        }
        points.push(rowArr);
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n1 = points[r][c];
          const n2 = points[r][c+1];
          const n3 = points[r+1][c+1];
          const n4 = points[r+1][c];
          
          // Resting diagonal distance establishes base geometry size
          const dx = n3.x - n1.x;
          const dy = n3.y - n1.y;
          const restArea = Math.sqrt(dx*dx + dy*dy);

          // Internal Quad structure
          quads.push({ n1, n2, n3, n4, restArea, computedStrain: 0.0 });
        }
      }

      return { nodes, quads, points };
    },

    _simulateLesionGrowth(matrix, rect, explosions, params) {
      const steps = 30; // Fast hybrid solver
      const damp = 0.85;

      for (let step = 0; step < steps; step++) {
        
        // 1. Lesion Force (Repulsing architecture outwards)
        for (const node of matrix.nodes) {
          if (node.isEdgeX && node.isEdgeY) continue; 
          let fx = 0, fy = 0;
          for (const exp of explosions) {
            const dx = node.x - exp.x;
            const dy = node.y - exp.y;
            const distSq = dx * dx + dy * dy + 1;
            if (distSq < exp.force * 40) {
               const force = exp.force / distSq;
               const dist = Math.sqrt(distSq);
               fx += (dx / dist) * force;
               fy += (dy / dist) * force;
            }
          }
          node.vx += fx;
          node.vy += fy;
        }

        // 2. Ailanthus Inverse Callus Healing and Constraint Solving
        // (Nodes attempt to retain shape, but trigger Inverse Swell if severely pushed)
        for (let iter = 0; iter < 3; iter++) {
            for (const q of matrix.quads) {
                // Calculate current diagonal size vs rest size
                const dx1 = q.n3.x - q.n1.x;
                const dy1 = q.n3.y - q.n1.y;
                const curDiag1 = Math.sqrt(dx1*dx1 + dy1*dy1) || 1;
                
                const dx2 = q.n4.x - q.n2.x;
                const dy2 = q.n4.y - q.n2.y;
                const curDiag2 = Math.sqrt(dx2*dx2 + dy2*dy2) || 1;
                
                const avgCurArea = (curDiag1 + curDiag2) / 2.0;
                
                // Calculate Strain
                const strain = avgCurArea / (q.restArea || 1);
                q.computedStrain = strain; // Save for coloring

                // Inverse Swell Equation: If severely strained (torn by explosion), radically increase target size
                let targetSize = q.restArea;
                if (strain > 1.2) {
                    targetSize = q.restArea * Math.min(params.callusSwell, strain * 1.5);
                }

                // Apply quad diagonal structural constraints
                const kQuad = 0.15; // Semi-elastic architecture
                
                const diff1 = (curDiag1 - targetSize) / curDiag1;
                const ox1 = dx1 * diff1 * kQuad * 0.5;
                const oy1 = dy1 * diff1 * kQuad * 0.5;
                if (!q.n1.isEdgeX && !q.n1.isEdgeY) { q.n1.x += ox1; q.n1.y += oy1; }
                if (!q.n3.isEdgeX && !q.n3.isEdgeY) { q.n3.x -= ox1; q.n3.y -= oy1; }

                const diff2 = (curDiag2 - targetSize) / curDiag2;
                const ox2 = dx2 * diff2 * kQuad * 0.5;
                const oy2 = dy2 * diff2 * kQuad * 0.5;
                if (!q.n2.isEdgeX && !q.n2.isEdgeY) { q.n2.x += ox2; q.n2.y += oy2; }
                if (!q.n4.isEdgeX && !q.n4.isEdgeY) { q.n4.x -= ox2; q.n4.y -= oy2; }
            }
        }

        // 3. Update & Rigid Compositional Enclosure Check
        for (const node of matrix.nodes) {
            node.x += node.vx;
            node.y += node.vy;
            node.vx *= damp;
            node.vy *= damp;
            
            // Edifice-style Strict Absolute Bounds Closure
            if (node.x <= rect.x) { node.x = rect.x; node.vx = 0; }
            if (node.x >= rect.x + rect.w) { node.x = rect.x + rect.w; node.vx = 0; }
            if (node.y <= rect.y) { node.y = rect.y; node.vy = 0; }
            if (node.y >= rect.y + rect.h) { node.y = rect.y + rect.h; node.vy = 0; }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // STRAIN-ENERGY RENDERING
    // ═══════════════════════════════════════════════════════════════
    _renderMatrix(ctx, matrix, palette) {
      for (const q of matrix.quads) {
         ctx.beginPath();
         ctx.moveTo(q.n1.x, q.n1.y);
         ctx.lineTo(q.n2.x, q.n2.y);
         ctx.lineTo(q.n3.x, q.n3.y);
         ctx.lineTo(q.n4.x, q.n4.y);
         ctx.closePath();

         // Architectural baseline vs Botanical Swell color interpolation
         let c;
         const s = q.computedStrain;
         
         if (s < 1.1) {
            c = palette[0]; // Dark Navy/Concrete (Resting)
         } else if (s < 1.4) {
            c = palette[1]; // Phthalo Blue (Disturbed)
         } else if (s < 2.0) {
            c = palette[2]; // Bronze/Rust (Strained Callus)
         } else {
            c = palette[3]; // Yellow-Green (Heavily Swollen Biology)
         }

         ctx.fillStyle = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
         ctx.fill();

         // Wireframe border for structural blueprint aesthetic
         ctx.strokeStyle = `hsla(0, 0%, 100%, 0.1)`;
         ctx.lineWidth = 0.5;
         ctx.stroke();
      }
    }
  });
}
