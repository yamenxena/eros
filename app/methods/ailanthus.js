/**
 * Ailanthus Bark V3: Macro Stripes & Micro Inverse Growth
 * Simulates a dual-layered topological quad mesh.
 * Macro-stripes tear apart geometrically under Trunk Expansion (lateral tension).
 * Micro-cells inside the stripes experience Inverse Growth (Callus Swelling) to geometrically fill the voids without overlapping.
 */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'ailanthus',
    name: 'Ailanthus Bark (2D)',
    type: '2d',
    version: '3.0.0',
    description: 'Macro/Micro Voronoi-style fracture mechanics. Outer vertical stripes tear while internal cells geometrically swell via inverse growth equations.',

    palettes: [
      {
        name: 'Ailanthus Life Cycle', mood: 'Botanical Tension',
        colors: [
          { h: 140, s: 2, l: 63 },  // #9FA1A0 - Light Gray Bark Base (Rigid Plate)
          { h: 25, s: 60, l: 30 },  // #8B4513 - Chestnut Shadow (Deep Fissure Void)
          { h: 73, s: 50, l: 70 },  // #C6D68F - Yellow-Green Matrix (Callus)
          { h: 106, s: 23, l: 33 }, // #4A6741 - Deep Canopy Green (Accents)
          { h: 26, s: 38, l: 51 },  // #B07C55 - Bronze Spring Growth (Edge Highlight)
        ]
      },
      {
        name: 'Dead Wood', mood: 'Winter Suberin',
        colors: [
          { h: 30, s: 10, l: 40 },  
          { h: 0, s: 0, l: 15 },    
          { h: 40, s: 20, l: 30 },  
          { h: 30, s: 5, l: 80 },   
          { h: 0, s: 0, l: 90 },    
        ]
      }
    ],

    params: [
      { key: 'growthTimeline',  type: 'range',   label: 'Trunk Expansion (t)',  default: 0.1,   min: 0.0, max: 1.0, precision: 2, category: 'Physics' },
      { key: 'macroDensity',    type: 'range',   label: 'Macro Stripes',        default: 8,     min: 3,   max: 24,  precision: 0, category: 'Geometry' },
      { key: 'microDensity',    type: 'range',   label: 'Micro Cells/Stripe',   default: 4,     min: 1,   max: 10,  precision: 0, category: 'Geometry' },
      { key: 'fractureStrength',type: 'range',   label: 'Bark Rigidity',        default: 45,    min: 10,  max: 150, precision: 0, category: 'Physics' },
      { key: 'callusSwell',     type: 'range',   label: 'Cellular Inverse Swell',default: 1.5,  min: 0.0, max: 4.0, precision: 1, category: 'Physics' },
      { key: 'anisotropy',      type: 'range',   label: 'Vertical Grain Ratio', default: 3.0,   min: 1.0, max: 6.0, precision: 1, category: 'Geometry' },
      { key: 'noiseImpact',     type: 'range',   label: 'Biological Jitter',    default: 0.8,   min: 0.0, max: 2.0, precision: 2, category: 'Geometry' },
      { key: 'seed',            type: 'number',  label: 'Seed',                 default: 2026,  min: 0,   max: 99999, category: 'Method' },
      { key: 'paletteMode',     type: 'select',  label: 'Color Theme',          default: 'Ailanthus Life Cycle', options: ['Ailanthus Life Cycle', 'Dead Wood'], category: 'Materials' }
    ],

    narrative(p) { return `A dual-layered topological lattice. Rigid outer Macro Stripes (${p.macroDensity}) tear apart under lateral tree trunk expansion (t=${p.growthTimeline}). The internal Micro Cells (${p.microDensity}/stripe) react to the void pressure by exhibiting massive Inverse Growth, swelling geometrically into the fissures, transitioning from dead bark to glowing Bronze/Yellow-Green callus.`; },
    equation(p) { return `Topology = MacroStripes(N) × MicroCells(M)\nF_tension(x) = x * t_expansion\nFracture: IF Boundary_Strain > ${p.fractureStrength} → SNAP()\nInverseGrowth: IF snapped, Internal_Rest_X += t * CallusSwell`; },

    _mesh: null,
    _lastParams: {},
    _lastW: null,
    _lastH: null,

    // ═══════════════════════════════════════════════════════════════
    // BUILD THE DUAL-LAYER FRACTURE MESH
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

      const cols = params.macroDensity * params.microDensity;
      const cellW = w / cols;
      const cellH = cellW * params.anisotropy; 
      const rows = Math.ceil(h / cellH) + 2; 

      this._mesh = { quads: [], nodes: [], internalSprings: [], structuralSprings: [] };

      // 1. Generate Virtual Grid Points (Jittered)
      // Brick staggered pattern for geometric diamond fissures
      const vGrid = [];
      for (let r = -1; r <= rows; r++) {
         const rowPoints = [];
         const stagger = (r % 2 === Math.abs(r % 2) ? 0.5 : 0) * cellW;
         for (let c = -1; c <= cols; c++) {
             let px = c * cellW + stagger;
             let py = r * cellH;
             
             // Biological Jitter
             const nx = noiseFn(px * 0.005, py * 0.005);
             const ny = noiseFn(px * 0.005 + 100, py * 0.005 + 100);
             px += nx * cellW * params.noiseImpact * 0.5;
             py += ny * cellH * params.noiseImpact * 0.5;
             
             rowPoints.push({ x: px, y: py, r: r, c: c });
         }
         vGrid.push(rowPoints);
      }

      // 2. Create Independent Quads (Micro-Cells)
      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
             const tl = { x: vGrid[r][c].x, y: vGrid[r][c].y, vx: 0, vy: 0, originX: vGrid[r][c].x, originY: vGrid[r][c].y };
             const tr = { x: vGrid[r][c+1].x, y: vGrid[r][c+1].y, vx: 0, vy: 0, originX: vGrid[r][c+1].x, originY: vGrid[r][c+1].y };
             const br = { x: vGrid[r+1][c+1].x, y: vGrid[r+1][c+1].y, vx: 0, vy: 0, originX: vGrid[r+1][c+1].x, originY: vGrid[r+1][c+1].y };
             const bl = { x: vGrid[r+1][c].x, y: vGrid[r+1][c].y, vx: 0, vy: 0, originX: vGrid[r+1][c].x, originY: vGrid[r+1][c].y };
             
             // Slight shrink for micro-margins
             const cx = (tl.x + tr.x + br.x + bl.x) / 4;
             const cy = (tl.y + tr.y + br.y + bl.y) / 4;
             const shrink = 0.99;
             tl.x = cx + (tl.x - cx)*shrink; tl.y = cy + (tl.y - cy)*shrink;
             tr.x = cx + (tr.x - cx)*shrink; tr.y = cy + (tr.y - cy)*shrink;
             br.x = cx + (br.x - cx)*shrink; br.y = cy + (br.y - cy)*shrink;
             bl.x = cx + (bl.x - cx)*shrink; bl.y = cy + (bl.y - cy)*shrink;

             this._mesh.nodes.push(tl, tr, br, bl);
             
             // Identify Macro Stripe Ownership
             const macroStripeId = Math.floor(c / params.microDensity);

             const quad = {
                 n: [tl, tr, br, bl],
                 r: r, c: c,
                 macroStripeId: macroStripeId,
                 originalWidth: Math.abs(tr.x - tl.x),
                 center: { x: cx, y: cy }
             };
             this._mesh.quads.push(quad);

             // Extremely stiff internal springs hold perfect micro-cell geometry
             const addInternal = (n1, n2, isHorizontal=false) => {
                 const dist = Math.sqrt((n2.x-n1.x)**2 + (n2.y-n1.y)**2);
                 this._mesh.internalSprings.push({ n1, n2, rest: dist, originalRest: dist, broken: false, k: 0.95, isHorizontal });
             };
             // Tag horizontal springs for 'Inverse Growth' swelling later
             addInternal(tl, tr, true); addInternal(bl, br, true); 
             addInternal(tr, br); addInternal(bl, tl);
             addInternal(tl, br); addInternal(tr, bl); // Cross braces prevent skew
         }
      }

      // 3. Connect Quads (Inter-cellular & Inter-macro Adhesions)
      const getQuad = (r, c) => this._mesh.quads.find(q => q.r === r && q.c === c);
      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
             const q = getQuad(r, c);
             if (!q) continue;

             const addStructural = (n1, n2, isMacroBoundary) => {
                 if(!n1 || !n2) return;
                 const dist = Math.sqrt((n2.x-n1.x)**2 + (n2.y-n1.y)**2);
                 // Macro Boundaries tear easily (low threshold). 
                 // Micro Boundaries NEVER tear (infinite threshold).
                 const threshold = isMacroBoundary ? prng.range(1.0, 3.5) : 999999.0;
                 // Micro-boundaries also have an expansive element (they swell horizontally)
                 this._mesh.structuralSprings.push({ n1, n2, rest: dist, originalRest: dist, broken: false, k: 0.3, threshold, isMacroBoundary });
             };

             // Connect to Right neighbor
             const qRight = getQuad(r, c+1);
             if (qRight) {
                 const isMacroBoundary = (q.macroStripeId !== qRight.macroStripeId);
                 addStructural(q.n[1], qRight.n[0], isMacroBoundary); // TR -> Right's TL
                 addStructural(q.n[2], qRight.n[3], isMacroBoundary); // BR -> Right's BL
             }
             // Connect to Bottom neighbor
             const qBot = getQuad(r+1, c);
             if (qBot) {
                 // Vertical boundaries almost never tear (inf threshold) to maintain stripes
                 addStructural(q.n[3], qBot.n[0], false); // BL -> Bot's TL
                 addStructural(q.n[2], qBot.n[1], false); // BR -> Bot's TR
             }
         }
      }

      // Track exact parameters
      this._lastParams = { ...params };
      this._lastW = w;
      this._lastH = h;
    },

    // ═══════════════════════════════════════════════════════════════
    // DUAL-LAYER PHYSICS: ITERATIVE SOLVER with INVERSE GROWTH
    // ═══════════════════════════════════════════════════════════════
    _solvePhysics(W, H, growthT, Rigidity, callusSwell) {
        const simSteps = 60; // Physics fidelity
        const maxExpansion = W * 0.8 * growthT; // Max lateral force

        // INVERSE GROWTH: Expand horizontal micro-cell properties based on time
        for (const sp of this._mesh.internalSprings) {
            if (sp.isHorizontal) {
                // Micro-cell geometry swells actively 
                sp.rest = sp.originalRest * (1.0 + (growthT * callusSwell));
            }
        }
        for (const sp of this._mesh.structuralSprings) {
            if (!sp.isMacroBoundary && !sp.broken) {
                // The inter-cell connections within the stripe also swell
                sp.rest = sp.originalRest * (1.0 + (growthT * callusSwell));
            }
        }

        // INTEGRATION
        for (let s = 0; s < simSteps; s++) {
            // Apply Tensor Field Force (Trunk Expansion)
            for (const n of this._mesh.nodes) {
                const distFromCenter = (n.originX - W/2); 
                const lateralForce = (distFromCenter / (W/2)) * (maxExpansion / simSteps);
                
                n.vx += lateralForce * 0.05; 
                const distY = (n.originY - H/2);
                n.vy += (distY / (H/2)) * (maxExpansion / simSteps) * 0.02; // Minor vertical
            }

            // Move nodes
            for (const n of this._mesh.nodes) {
                n.x += n.vx;
                n.y += n.vy;
                n.vx *= 0.8; // Dampening
                n.vy *= 0.8;
            }

            // Reverse-Integrate Springs (Iterative Constraint Solver)
            for (let i = 0; i < 3; i++) {
                // 1. Maintain Micro-Cell geometry & Swelling
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

                // 2. Structural/Macro Boundaries (Fracture Mechanics)
                for (const sp of this._mesh.structuralSprings) {
                    if (sp.broken) continue;

                    const dx = sp.n2.x - sp.n1.x;
                    const dy = sp.n2.y - sp.n1.y;
                    const dist = Math.sqrt(dx*dx + dy*dy) || 0.01;
                    const strain = dist - sp.rest;

                    // The SNAP! Only Macro boundaries can break
                    if (sp.isMacroBoundary && strain > sp.threshold * (Rigidity * 0.1)) {
                        sp.broken = true;
                        continue; // Void opens up laterally
                    }

                    const diff = strain / dist;
                    // Lower K for inter-cell bridges to allow bending
                    const offsetX = dx * 0.5 * diff * sp.k;
                    const offsetY = dy * 0.5 * diff * sp.k;
                    sp.n1.x += offsetX; sp.n1.y += offsetY;
                    sp.n2.x -= offsetX; sp.n2.y -= offsetY;
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // DYNAMIC STRAIN COLORING HELPER
    // ═══════════════════════════════════════════════════════════════
    _lerpColor(c1, c2, t) {
        return {
            h: c1.h + (c2.h - c1.h) * t,
            s: c1.s + (c2.s - c1.s) * t,
            l: c1.l + (c2.l - c1.l) * t
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // RENDER LOOP
    // ═══════════════════════════════════════════════════════════════
    render(canvas, ctx, W, H, params, palette) {
      // Rebuild mesh only on geometry change
      const isParamChanged = [
          'macroDensity', 'microDensity', 'anisotropy', 'noiseImpact', 'seed'
      ].some(k => params[k] !== this._lastParams[k]);

      if (!this._mesh || isParamChanged || W !== this._lastW || H !== this._lastH) {
          this._buildFractureGrid(params, W, H);
      }

      // Reset mesh strictly to origin for timeless deterministic physics
      for (let n of this._mesh.nodes) {
          n.x = n.originX; n.y = n.originY; n.vx = 0; n.vy = 0;
      }
      for (let s of this._mesh.structuralSprings) {
          s.broken = false;
      }

      // Execute Mathematics
      this._solvePhysics(W, H, params.growthTimeline, params.fractureStrength, params.callusSwell);

      // Deep Shadow Void (Chestnut)
      let bg = `hsl(${palette[1].h}, ${palette[1].s}%, ${palette[1].l}%)`;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Draw the Healing Callus Threads
      ctx.lineWidth = 1.0;
      for (const sp of this._mesh.structuralSprings) {
          if (sp.broken && sp.isMacroBoundary) {
              const dx = sp.n2.x - sp.n1.x;
              const dy = sp.n2.y - sp.n1.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < W * 0.15) {
                  // Connect glowing Yellow-Green fibers across the tear
                  ctx.strokeStyle = `hsla(${palette[2].h}, ${palette[2].s}%, ${palette[2].l}%, ${1.0 - (dist/(W*0.15))})`;
                  ctx.beginPath();
                  ctx.moveTo(sp.n1.x, sp.n1.y);
                  ctx.lineTo(sp.n2.x, sp.n2.y);
                  ctx.stroke();
              }
          }
      }

      // Draw Micro-Cells mapped by Strain Energy (Coloring the entire canvas!)
      const cLightGray = palette[0];
      const cBronze    = palette[4];
      const cYellowGre = palette[2];

      for (const quad of this._mesh.quads) {
          ctx.beginPath();
          ctx.moveTo(quad.n[0].x, quad.n[0].y);
          ctx.lineTo(quad.n[1].x, quad.n[1].y);
          ctx.lineTo(quad.n[2].x, quad.n[2].y);
          ctx.lineTo(quad.n[3].x, quad.n[3].y);
          ctx.closePath();

          // Calculate Dynamic Strain: Current Average Width / Original Width
          const curWidth = Math.abs(quad.n[1].x - quad.n[0].x) + Math.abs(quad.n[2].x - quad.n[3].x);
          const strain = (curWidth / 2) / quad.originalWidth;

          // Color Algorithm: 
          // 1.0 (dead bark) -> 1.5 (Bronze) -> 2.5 (Yellow-Green)
          let finalColor;
          if (strain <= 1.0) {
              finalColor = cLightGray;
          } else if (strain < 1.5) {
              const t = (strain - 1.0) / 0.5;
              finalColor = this._lerpColor(cLightGray, cBronze, t);
          } else if (strain < 3.0) {
              const t = (strain - 1.5) / 1.5;
              finalColor = this._lerpColor(cBronze, cYellowGre, Math.min(t, 1.0));
          } else {
              finalColor = cYellowGre;
          }

          ctx.fillStyle = `hsl(${finalColor.h}, ${finalColor.s}%, ${finalColor.l}%)`;
          ctx.fill();

          // Stroke Edge 
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = `hsl(${palette[3].h}, ${palette[3].s}%, ${palette[3].l}%)`; // Deep Green outline
          ctx.stroke();
      }
    }
  });
}
