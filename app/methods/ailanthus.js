/**
 * Ailanthus Bark V2: Geometric Fracture & Growth Tension Physics
 * Simulates a topological quad mesh representing rigid suberin (bark plates).
 * Exerts a circumferential tension force over time.
 * When tension exceeds a threshold, adjoining cells snap apart, generating
 * organic, non-overlapping diamond voids (lenticular fissures).
 */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'ailanthus',
    name: 'Ailanthus Bark (2D)',
    type: '2d',
    version: '2.0.0',
    description: 'Voronoi-style fracture mechanics simulating circumferential tree growth and rigid bark tearing.',

    palettes: [
      {
        name: 'Ailanthus Life Cycle', mood: 'Botanical Tension',
        colors: [
          { h: 140, s: 2, l: 63 },  // #9FA1A0 - Light Gray Bark Base (Rigid Plate)
          { h: 25, s: 60, l: 30 },  // #8B4513 - Chestnut Shadow (Deep Fissure)
          { h: 73, s: 50, l: 70 },  // #C6D68F - Yellow-Green Matrix (Callus)
          { h: 106, s: 23, l: 33 }, // #4A6741 - Deep Canopy Green (Accents)
          { h: 26, s: 38, l: 51 },  // #B07C55 - Bronze Spring Growth (Edge Highlight)
        ]
      },
      {
        name: 'Dead Wood', mood: 'Winter Suberin',
        colors: [
          { h: 30, s: 10, l: 40 },  
          { h: 0, s: 0, l: 10 },    
          { h: 40, s: 20, l: 30 },  
          { h: 30, s: 5, l: 80 },   
          { h: 0, s: 0, l: 90 },    
        ]
      }
    ],

    params: [
      { key: 'growthTimeline',  type: 'range',   label: 'Trunk Expansion (t)',  default: 0.1,   min: 0.0, max: 1.0, precision: 2, category: 'Physics' },
      { key: 'structuralDensity', type: 'range', label: 'Plate Density',        default: 16,    min: 4,   max: 40,  precision: 0, category: 'Geometry' },
      { key: 'fractureStrength',type: 'range',   label: 'Bark Rigidity',        default: 45,    min: 10,  max: 150, precision: 0, category: 'Physics' },
      { key: 'anisotropy',      type: 'range',   label: 'Vertical Grain Ratio', default: 2.8,   min: 1.0, max: 5.0, precision: 1, category: 'Geometry' },
      { key: 'noiseImpact',     type: 'range',   label: 'Biological Jitter',    default: 0.6,   min: 0.0, max: 1.5, precision: 2, category: 'Geometry' },
      { key: 'seed',            type: 'number',  label: 'Seed',                 default: 1842,  min: 0,   max: 99999, category: 'Method' },
      { key: 'paletteMode',     type: 'select',  label: 'Color Theme',          default: 'Ailanthus Life Cycle', options: ['Ailanthus Life Cycle', 'Dead Wood'], category: 'Materials' }
    ],

    narrative(p) { return `A dense topological lattice of independent bark plates (${p.structuralDensity} columns). As time processes (t=${p.growthTimeline}), a circumferential tension force simulates the growing girth of the tree. Plates fracture geometrically when lateral stress exceeds ${p.fractureStrength} thresholds, opening up non-overlapping diamond voids bounded by rigid mechanics.`; },
    equation(p) { return `Lattice = JitteredQuads(c=${p.structuralDensity}, α=${p.anisotropy})\nF_tension(x) = (x - W/2) * t_expansion\nLimit: if(Δd > Stress) -> SnapEdge()\nClamp: Σ Plates ∩ Void = ∅`; },
    
    _mesh: null,
    _lastDensity: null,
    _lastAnisotropy: null,
    _lastNoise: null,
    _lastSeed: null,
    _lastW: null,
    _lastH: null,

    // ═══════════════════════════════════════════════════════════════
    // BUILD THE TOPOLOGICAL FRACTURE MESH
    // ═══════════════════════════════════════════════════════════════
    _buildFractureGrid(params, w, h) {
      const prng = new PRNG(params.seed);
      let noiseFn = null;
      if (typeof SimplexNoise !== 'undefined') {
          const simplex = new SimplexNoise(params.seed);
          if (typeof simplex.noise2 === 'function') noiseFn = (x,y) => simplex.noise2(x,y);
          else if (typeof simplex.noise3d === 'function') noiseFn = (x,y) => simplex.noise3d(x,y,0);
          else if (typeof simplex.noise2D === 'function') noiseFn = (x,y) => simplex.noise2D(x,y);
      }
      
      if (!noiseFn) noiseFn = (x,y) => (prng.next() - 0.5) * 2.0;

      const cols = params.structuralDensity;
      const cellW = w / cols;
      const cellH = cellW * params.anisotropy; 
      const rows = Math.ceil(h / cellH) + 2; 

      this._mesh = {
          quads: [],
          nodes: [],
          internalSprings: [],
          structuralSprings: []
      };

      // 1. Generate Virtual Grid Points (Jittered)
      // To create diamond fissures later, we use a "brick" staggered pattern
      const vGrid = [];
      for (let r = -1; r <= rows; r++) {
         const rowPoints = [];
         const stagger = (r % 2 === Math.abs(r % 2) ? 0.5 : 0) * cellW; // proper modulo
         for (let c = -1; c <= cols; c++) {
             let px = c * cellW + stagger;
             let py = r * cellH;
             
             // Biological Jitter
             const nx = noiseFn(px * 0.005, py * 0.005);
             const ny = noiseFn(px * 0.005 + 100, py * 0.005 + 100);
             
             px += nx * cellW * params.noiseImpact * 0.4;
             py += ny * cellH * params.noiseImpact * 0.4;
             
             rowPoints.push({ x: px, y: py, r: r, c: c });
         }
         vGrid.push(rowPoints);
      }

      // 2. Create Independent Quads (Plates)
      // Each quad gets its very own 4 nodes so it can rip away from neighbors.
      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
             const tl = { x: vGrid[r][c].x, y: vGrid[r][c].y, vx: 0, vy: 0, originX: vGrid[r][c].x, originY: vGrid[r][c].y };
             const tr = { x: vGrid[r][c+1].x, y: vGrid[r][c+1].y, vx: 0, vy: 0, originX: vGrid[r][c+1].x, originY: vGrid[r][c+1].y };
             const br = { x: vGrid[r+1][c+1].x, y: vGrid[r+1][c+1].y, vx: 0, vy: 0, originX: vGrid[r+1][c+1].x, originY: vGrid[r+1][c+1].y };
             const bl = { x: vGrid[r+1][c].x, y: vGrid[r+1][c].y, vx: 0, vy: 0, originX: vGrid[r+1][c].x, originY: vGrid[r+1][c].y };
             
             // A slight shrink to create visible micromargins even before tearing
             const cx = (tl.x + tr.x + br.x + bl.x) / 4;
             const cy = (tl.y + tr.y + br.y + bl.y) / 4;
             const shrink = 0.98;
             tl.x = cx + (tl.x - cx)*shrink; tl.y = cy + (tl.y - cy)*shrink;
             tr.x = cx + (tr.x - cx)*shrink; tr.y = cy + (tr.y - cy)*shrink;
             br.x = cx + (br.x - cx)*shrink; br.y = cy + (br.y - cy)*shrink;
             bl.x = cx + (bl.x - cx)*shrink; bl.y = cy + (bl.y - cy)*shrink;

             this._mesh.nodes.push(tl, tr, br, bl);
             
             const quad = {
                 n: [tl, tr, br, bl],
                 r: r, c: c,
                 area: cellW * cellH,
                 center: { x: cx, y: cy }
             };
             this._mesh.quads.push(quad);

             // Extremely stiff internal springs to hold plate shape perfectly intact
             const addInternal = (n1, n2) => {
                 const dist = Math.sqrt((n2.x-n1.x)**2 + (n2.y-n1.y)**2);
                 this._mesh.internalSprings.push({ n1, n2, rest: dist, broken: false, k: 0.95 });
             };
             addInternal(tl, tr); addInternal(tr, br); addInternal(br, bl); addInternal(bl, tl);
             addInternal(tl, br); addInternal(tr, bl); // Cross braces prevent skewing
         }
      }

      // 3. Connect Quads with Structural Adhesion Springs (The ones that SNAP)
      const getQuad = (r, c) => this._mesh.quads.find(q => q.r === r && q.c === c);
      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
             const q = getQuad(r, c);
             if (!q) continue;

             const addStructural = (n1, n2) => {
                 if(!n1 || !n2) return;
                 const dist = Math.sqrt((n2.x-n1.x)**2 + (n2.y-n1.y)**2);
                 // Threshold incorporates biological noise (some tear easy, some hard)
                 const threshold = prng.range(1.0, 3.5);
                 this._mesh.structuralSprings.push({ n1, n2, rest: dist, broken: false, k: 0.2, threshold });
             };

             // Connect to Right neighbor
             const qRight = getQuad(r, c+1);
             if (qRight) {
                 addStructural(q.n[1], qRight.n[0]); // TR -> Right's TL
                 addStructural(q.n[2], qRight.n[3]); // BR -> Right's BL
             }
             // Connect to Bottom neighbor
             const qBot = getQuad(r+1, c);
             if (qBot) {
                 addStructural(q.n[3], qBot.n[0]); // BL -> Bot's TL
                 addStructural(q.n[2], qBot.n[1]); // BR -> Bot's TR
             }
         }
      }

      this._lastDensity = params.structuralDensity;
      this._lastAnisotropy = params.anisotropy;
      this._lastNoise = params.noiseImpact;
      this._lastSeed = params.seed;
      this._lastW = w;
      this._lastH = h;
    },

    // ═══════════════════════════════════════════════════════════════
    // PHYSICS SOLVER: EULER INTEGRATION + ITERATIVE SPRING RELAXATION
    // ═══════════════════════════════════════════════════════════════
    _solvePhysics(W, H, growthT, Rigidity) {
        // Deep clone current node states to origin states so physics is deterministic per frame based solely on growthT
        // Actually, since we want realtime dragging timeline, we MUST reset the mesh every frame.
        // Wait, resetting 4000 nodes and re-running 50 steps per frame is heavy but perfectly viable.
        
        const simSteps = 60; // Physics steps
        const maxExpansion = W * 0.8 * growthT; // Max lateral force

        for (let s = 0; s < simSteps; s++) {
            // Apply Tensor Field Force
            for (const n of this._mesh.nodes) {
                // Growth pulls laterally from the center of the tree
                const distFromCenter = (n.originX - W/2); 
                const lateralForce = (distFromCenter / (W/2)) * (maxExpansion / simSteps);
                
                n.vx += lateralForce * 0.05; // Force vector
                // Little bit of vertical expansion
                const distY = (n.originY - H/2);
                n.vy += (distY / (H/2)) * (maxExpansion / simSteps) * 0.05;
            }

            // Integrative step
            for (const n of this._mesh.nodes) {
                n.x += n.vx;
                n.y += n.vy;
                n.vx *= 0.8; // High friction/dampening
                n.vy *= 0.8;
            }

            // Resolve Springs (Iterations for stiffness)
            for (let i = 0; i < 3; i++) {
                // Internal Springs (Unbreakable, maintain Plate geometry)
                for (const sp of this._mesh.internalSprings) {
                    const dx = sp.n2.x - sp.n1.x;
                    const dy = sp.n2.y - sp.n1.y;
                    const dist = Math.sqrt(dx*dx + dy*dy) || 0.01;
                    const diff = (dist - sp.rest) / dist;
                    const offsetX = dx * 0.5 * diff * sp.k;
                    const offsetY = dy * 0.5 * diff * sp.k;
                    sp.n1.x += offsetX; sp.n1.y += offsetY;
                    sp.n2.x -= offsetX; sp.n2.y -= offsetY;
                }

                // Structural Adhesion Springs (Fracture Mechanics)
                for (const sp of this._mesh.structuralSprings) {
                    if (sp.broken) continue;

                    const dx = sp.n2.x - sp.n1.x;
                    const dy = sp.n2.y - sp.n1.y;
                    const dist = Math.sqrt(dx*dx + dy*dy) || 0.01;
                    const strain = dist - sp.rest;

                    // The SNAP!
                    if (strain > sp.threshold * (Rigidity * 0.1)) {
                        sp.broken = true;
                        continue; // No force applied, they fly apart!
                    }

                    const diff = strain / dist;
                    const offsetX = dx * 0.5 * diff * sp.k;
                    const offsetY = dy * 0.5 * diff * sp.k;
                    sp.n1.x += offsetX; sp.n1.y += offsetY;
                    sp.n2.x -= offsetX; sp.n2.y -= offsetY;
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // RENDER LOOP
    // ═══════════════════════════════════════════════════════════════
    render(canvas, ctx, W, H, params, palette) {
      // Because this is a deterministic timeline, we MUST rebuild the mesh from scratch 
      // every frame if parameters change, so `growthTimeline` scrubbing is flawless.
      if (!this._mesh || 
          params.structuralDensity !== this._lastDensity || 
          params.anisotropy !== this._lastAnisotropy ||
          params.noiseImpact !== this._lastNoise ||
          params.seed !== this._lastSeed || 
          W !== this._lastW || H !== this._lastH) {
        
          this._buildFractureGrid(params, W, H);
      }

      // 1. Reset mesh to zero state before applying physics timeline
      for (let n of this._mesh.nodes) {
          n.x = n.originX; n.y = n.originY; n.vx = 0; n.vy = 0;
      }
      for (let s of this._mesh.structuralSprings) {
          s.broken = false;
      }

      // 2. Compute Physical Deformation
      this._solvePhysics(W, H, params.growthTimeline, params.fractureStrength);

      // 3. Stringify the Color Palette Safely
      let bg = `hsl(${palette[1].h}, ${palette[1].s}%, ${palette[1].l}%)`; // Default Fissure Shadow
      let structuralPlate = `hsl(${palette[0].h}, ${palette[0].s}%, ${palette[0].l}%)`;
      let callusMatrix = `hsl(${palette[2].h}, ${palette[2].s}%, ${palette[2].l}%)`;
      let plateEdge = `hsl(${palette[4].h}, ${palette[4].s}%, ${palette[4].l}%)`; // Bronze

      // Render Void Base
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // 4. Draw Callus Tissue (Connecting threads where bark broke)
      // Visual flair showing the living tissue beneath tearing
      ctx.lineWidth = 1.0;
      for (const sp of this._mesh.structuralSprings) {
          if (sp.broken) {
              const dx = sp.n2.x - sp.n1.x;
              const dy = sp.n2.y - sp.n1.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              // Only draw threads if they aren't astronomically far
              if (dist < W * 0.1) {
                  ctx.strokeStyle = `hsla(${palette[2].h}, ${palette[2].s}%, ${palette[2].l}%, ${1.0 - (dist/(W*0.1))})`;
                  ctx.beginPath();
                  ctx.moveTo(sp.n1.x, sp.n1.y);
                  ctx.lineTo(sp.n2.x, sp.n2.y);
                  ctx.stroke();
              }
          }
      }

      // 5. Draw the Rigid Bark Plates (Suberin)
      for (const quad of this._mesh.quads) {
          ctx.beginPath();
          ctx.moveTo(quad.n[0].x, quad.n[0].y);
          ctx.lineTo(quad.n[1].x, quad.n[1].y);
          ctx.lineTo(quad.n[2].x, quad.n[2].y);
          ctx.lineTo(quad.n[3].x, quad.n[3].y);
          ctx.closePath();

          ctx.fillStyle = structuralPlate;
          ctx.fill();

          // Outer hard edge (Bronze highlights / weathering)
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = plateEdge;
          ctx.stroke();
      }

    }
  });
}
