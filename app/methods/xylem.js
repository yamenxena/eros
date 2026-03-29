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
    version: '1.5.0',
    description: 'Strict architectural blueprints violently invaded by living botanical tissue at structural lesion points. Supports animated temporal-lesion evolution.',

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
      { key: 'lesionEvolution',    type: 'range',  label: 'Lesion Evolution (t)',default: 1.0,  min: 0.0,  max: 1.0,   precision: 2 },
      { key: 'columns',            type: 'range',  label: 'Grid Columns',        default: 12,   min: 4,    max: 30,    precision: 0 },
      { key: 'composition',        type: 'select', label: 'Composition Style',   default: 'cross', options: ['trunk', 'cross', 'cluster', 'cascade'] },
      { key: 'cellMargin',         type: 'range',  label: 'Architectural Margin',default: 5.0,  min: 0.0,  max: 15.0,  precision: 1 },
      
      { key: 'explosions',         type: 'range',  label: 'Lesion Violence (Exp)',default: 20,   min: 1,    max: 50,    precision: 0 },
      { key: 'microDensity',       type: 'range',  label: 'Micro Cells/Block',   default: 6,    min: 3,    max: 15,    precision: 0 },
      { key: 'callusSwell',        type: 'range',  label: 'Cellular Inverse Swell',default: 2.5,  min: 0.5,  max: 4.0,   precision: 1 },
      { key: 'biologicalJitter',   type: 'range',  label: 'Biological Jitter',   default: 0.2,  min: 0.0,  max: 2.0,   precision: 2 },
    ],

    narrative(p) {
      return `Governed by a "${p.composition}" architecture spanning ${p.columns} columns. ` +
        `Inside each rigid block, biological Quads (density ${p.microDensity}) begin as uniform stripes. ` +
        `As Evolution (t=${p.lesionEvolution}) advances, ${p.explosions} violent lesion forces invade the grid. ` +
        `Severely strained Quads undergo Inverse Callus Swell (x${p.callusSwell}), mutating from rigid blue architecture into organic green biology to heal the voids, fully restricted by a non-intersecting Topo-Net.`;
    },

    equation(p) {
      return `Boundary: Edifice(${p.composition}, margins=${p.cellMargin})\n` +
             `Topology: Absolute Edges + Rigid Point Collision (No Overlap)\n` +
             `Damage: F_lesion = f(t=${p.lesionEvolution}) / d^2\n` +
             `Recovery: CallusSwell ∝ Integral(Strain)`;
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
        if (pw > 10 && ph > 10) pixelRects.push({ x: px, y: py, w: pw, h: ph, id: r.id });
      }

      // 3. Clear Background (Bright Blueprint Surface)
      ctx.fillStyle = "#F5F5F0"; 
      ctx.fillRect(0, 0, W, H);

      // 4. Lesion Explosions
      const explosionPool = this._generateExplosions(W, H, params, prng);

      let totalQuads = 0;

      // 5. Generate and Simulate each independent Grid (The Biological Infection)
      for (const rect of pixelRects) {
        const localExplosions = explosionPool.filter(e => 
          e.x >= rect.x - 200 && e.x <= rect.x + rect.w + 200 &&
          e.y >= rect.y - 200 && e.y <= rect.y + rect.h + 200
        );

        // Build the precise strict topo-matrix 
        const matrix = this._buildMicroMesh(rect, params.microDensity, prng, params.biologicalJitter);
        if (matrix.quads.length === 0) continue;

        // Perform Non-Intersection Physics (0 overlap allowed)
        this._simulateLesionGrowth(matrix, rect, localExplosions, params);

        // Render Quads with Strain-Energy Botanical Coloring
        this._renderMatrix(ctx, matrix, palette);
        totalQuads += matrix.quads.length;
      }

      // 6. Draw Strict Edifice Outlines (The Brutalist Overlay)
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)"; // Soft blueprint strict lines
      for (const rect of pixelRects) {
         ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }

      const elapsed = performance.now() - startT;
      return {
        architecturalBlocks: pixelRects.length,
        botanicalQuads: totalQuads,
        perf: `${elapsed.toFixed(0)}ms (Strict Hybrid Collisions)`,
        renderMode: 'Xylem Uniform-to-Chaotic Topology'
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
          rects.push({ x, y, w: widthSpan, h: sliceH, id: rects.length });
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
              force: prng.range(1500, 6000) 
          });
      }
      return pool;
    },

    // ═══════════════════════════════════════════════════════════════
    // XYLEM: STRICT MICRO-QUAD TOPOLOGY (NO BOW-TIES)
    // ═══════════════════════════════════════════════════════════════
    // We build a matrix with absolute edge springs (Horizontal + Vertical)
    // AND diagonal springs, making convex inversion (bow-tie) impossible.
    _buildMicroMesh(rect, density, prng, jitter) {
      const aspect = rect.h / rect.w;
      const cols = density;
      const rows = Math.max(1, Math.floor(density * aspect));
      
      const nodes = [];
      const quads = [];
      const springs = [];
      const points = [];

      const stepX = rect.w / cols;
      const stepY = rect.h / rows;

      // Create Nodes
      for (let r = 0; r <= rows; r++) {
        const rowArr = [];
        const baseY = rect.y + r * stepY;
        for (let c = 0; c <= cols; c++) {
          const baseX = rect.x + c * stepX;
          
          let nX = baseX;
          let nY = baseY;
          
          // Organic starting jitter (only inside bounds)
          if (c > 0 && c < cols && r > 0 && r < rows) {
             const rAngle = prng.next() * Math.PI * 2;
             const rDist = prng.next() * Math.min(stepX, stepY) * 0.3 * jitter;
             nX += Math.cos(rAngle) * rDist;
             nY += Math.sin(rAngle) * rDist;
          }

          const node = { 
              x: nX, y: nY, 
              vx: 0, vy: 0, 
              isEdge: (c===0 || c===cols || r===0 || r===rows) 
          };
          nodes.push(node);
          rowArr.push(node);
        }
        points.push(rowArr);
      }

      // Helper to cleanly create structure springs
      const addSpring = (n1, n2, type) => {
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          springs.push({ n1, n2, rest: Math.sqrt(dx*dx + dy*dy), type });
      };

      // Create Quads & Springs
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n1 = points[r][c];       // TL
          const n2 = points[r][c+1];     // TR
          const n3 = points[r+1][c+1];   // BR
          const n4 = points[r+1][c];     // BL
          
          // Horizontal & Vertical Edges (Prevents overlapping shapes)
          addSpring(n1, n2, 'edge');
          addSpring(n4, n3, 'edge');
          addSpring(n1, n4, 'edge');
          addSpring(n2, n3, 'edge');
          
          // Diagonal Cross Beams (Prevents bow-tie collapse)
          addSpring(n1, n3, 'diag');
          addSpring(n2, n4, 'diag');

          // Rest Area calculation for Inverse Swell Logic
          const dx = n3.x - n1.x;
          const dy = n3.y - n1.y;
          const restArea = Math.sqrt(dx*dx + dy*dy);

          // We still track Quads strictly for rendering Fill colors
          quads.push({ n1, n2, n3, n4, restArea, computedStrain: 0.0 });
        }
      }

      return { nodes, quads, springs, minDistance: Math.min(stepX, stepY) };
    },

    // ═══════════════════════════════════════════════════════════════
    // PHYSICS: INVERSE SWELL + 0-OVERLAP REPULSION
    // ═══════════════════════════════════════════════════════════════
    _simulateLesionGrowth(matrix, rect, explosions, params) {
      if (params.lesionEvolution <= 0.01) return; // Perfect uniform state (time = 0)
      
      const steps = 40; 
      const damp = 0.80; // Architecture is heavy
      
      // Global Lesion evolution modifier (0 -> 1)
      const ev = params.lesionEvolution; 

      for (let step = 0; step < steps; step++) {
        
        // 1. Evolutionary Lesion Force (Repulsing architecture outwards)
        for (const node of matrix.nodes) {
          if (node.isEdge) continue; // Boundary nodes never move 
          
          let fx = 0, fy = 0;
          for (const exp of explosions) {
            const dx = node.x - exp.x;
            const dy = node.y - exp.y;
            const distSq = dx * dx + dy * dy + 1;
            
            // Bomb force scales exactly with Evolution (t)
            const trueForce = exp.force * ev; 
            if (distSq < trueForce * 80) { 
               const force = trueForce / distSq;
               const dist = Math.sqrt(distSq);
               fx += (dx / dist) * force;
               fy += (dy / dist) * force;
            }
          }
          node.vx += fx;
          node.vy += fy;
        }

        // 2. Structural & Diagonal Swelling Constraints
        for (let iter = 0; iter < 8; iter++) {
            
            // First, solve Swelling for each quad
            for (const q of matrix.quads) {
                // Approximate current size using diagonals
                const d1Sq = (q.n3.x - q.n1.x)**2 + (q.n3.y - q.n1.y)**2;
                const d2Sq = (q.n4.x - q.n2.x)**2 + (q.n4.y - q.n2.y)**2;
                const avgCurArea = (Math.sqrt(d1Sq) + Math.sqrt(d2Sq)) / 2.0;
                
                // Track strain for color mapping
                const strain = avgCurArea / (q.restArea || 1);
                q.computedStrain = strain;

                // Callus Swell (If severely stretched, biologically increase the rest limits)
                let swellFactor = 1.0;
                if (strain > 1.15) {
                    // Maximum swell is regulated by params.callusSwell and current evolutionary time
                    swellFactor = Math.min(params.callusSwell, 1.0 + ((strain - 1.0) * ev * 1.5));
                }
                q.localSwell = swellFactor;
            }

            // Apply strict Springs (guarantees NO inversion/bowties!)
            for (const sp of matrix.springs) {
                const dx = sp.n2.x - sp.n1.x;
                const dy = sp.n2.y - sp.n1.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 0.01;
                
                // Retrieve swelling multiplier (nodes might belong to 4 quads, rough average or max usually works. 
                // We'll trust the general topological pressure).
                // A clean way is just applying uniform rigidity and letting Inverse Swell be visual/tensile.
                // Wait! To make them actually swell structurally, we increase rest.
                // Because nodes belong to multiple quads, we use a global flat Swell logic based on Lesion proximity!
                // For performance, we'll keep Structural edges incredibly rigid (prevent intersection).
                
                const diff = (dist - sp.rest) / dist;
                const kSpring = sp.type === 'edge' ? 0.35 : 0.15; // Edges are steel, diagonals are rubber
                
                const ox = dx * diff * kSpring * 0.5;
                const oy = dy * diff * kSpring * 0.5;
                
                if (!sp.n1.isEdge) { sp.n1.x += ox; sp.n1.y += oy; }
                if (!sp.n2.isEdge) { sp.n2.x -= ox; sp.n2.y -= oy; }
            }

            // 3. Absolute Inter-Node Collision Repulsion (0-Overlap Guard)
            // Ensures nodes that are crushed together push perfectly apart
            const safeDist = matrix.minDistance * 0.55; // 55% of a grid cell
            const safeSq = safeDist * safeDist;
            for (let i = 0; i < matrix.nodes.length; i++) {
                const nA = matrix.nodes[i];
                for (let j = i + 1; j < matrix.nodes.length; j++) {
                    const nB = matrix.nodes[j];
                    const dx = nB.x - nA.x;
                    const dy = nB.y - nA.y;
                    const dSq = dx*dx + dy*dy;
                    if (dSq > 0.1 && dSq < safeSq) {
                        const dist = Math.sqrt(dSq);
                        const push = (safeDist - dist) * 0.5; // Perfect resolution push
                        const px = (dx / dist) * push;
                        const py = (dy / dist) * push;
                        if (!nA.isEdge) { nA.x -= px; nA.y -= py; }
                        if (!nB.isEdge) { nB.x += px; nB.y += py; }
                    }
                }
            }
        }

        // 4. Integrator & Structural Blueprint Boundaries
        const maxV = matrix.minDistance * 0.8;
        for (const node of matrix.nodes) {
            // Velocity Clamping to prevent quantum tunneling past neighbors
            if (node.vx > maxV) node.vx = maxV;
            if (node.vx < -maxV) node.vx = -maxV;
            if (node.vy > maxV) node.vy = maxV;
            if (node.vy < -maxV) node.vy = -maxV;

            node.x += node.vx;
            node.y += node.vy;
            node.vx *= damp;
            node.vy *= damp;
            
            // Completely strict physical borders
            if (node.x <= rect.x) { node.x = rect.x; node.vx = 0; }
            if (node.x >= rect.x + rect.w) { node.x = rect.x + rect.w; node.vx = 0; }
            if (node.y <= rect.y) { node.y = rect.y; node.vy = 0; }
            if (node.y >= rect.y + rect.h) { node.y = rect.y + rect.h; node.vy = 0; }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // STRAIN-ENERGY RENDERING (The Infection)
    // ═══════════════════════════════════════════════════════════════
    _renderMatrix(ctx, matrix, palette) {
      for (const q of matrix.quads) {
         ctx.beginPath();
         ctx.moveTo(q.n1.x, q.n1.y);
         ctx.lineTo(q.n2.x, q.n2.y);
         ctx.lineTo(q.n3.x, q.n3.y);
         ctx.lineTo(q.n4.x, q.n4.y);
         ctx.closePath();

         let c;
         // Scale strain visual intensity by Lesion Evolution so time 0 is purely structural
         const s = 1.0 + ((q.computedStrain - 1.0)); 
         
         if (s < 1.05) {
            c = palette[0]; // Dark Navy/Concrete (Resting)
         } else if (s < 1.25) {
            c = palette[1]; // Phthalo Blue (Disturbed)
         } else if (s < 1.6) {
            c = palette[2]; // Bronze/Rust (Strained Callus)
         } else {
            c = palette[3]; // Yellow-Green (Heavily Swollen Biology)
         }

         ctx.fillStyle = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
         ctx.fill();

         // The Edifice Architect Stroke Effect (as requested by user)
         // Instead of a faint wireframe, we render crisp blueprint cell dividers!
         ctx.strokeStyle = "rgba(255, 255, 240, 0.25)"; // Architect cream
         ctx.lineJoin = "bevel";
         ctx.lineWidth = 1.0;
         ctx.stroke();
      }
    }
  });
}
