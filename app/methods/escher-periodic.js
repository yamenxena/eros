/**
 * Eros Generative Engine
 * escher-periodic.js
 * Phase 1: Regular Division of the Plane (Periodic Tessellations)
 */

class EscherPeriodicMethod {
  constructor() {
    this.id = 'escher-periodic';
    this.name = 'Periodic Division';
    this.version = 1;
    this.type = '2d';
    this.description = 'Regular division of the plane using 12 wallpaper symmetry groups with Bézier edge deformation';

    this.params = [
      { key: 'seed',            label: 'Seed',            type: 'number', min: 1, max: 99999, default: 42 },
      { key: 'wallpaperGroup',  label: 'Symmetry Group',  type: 'select', options: ['p1','p2','p3','p4','p6','pm','pg','cm','p4mm','p6mm','p3m1','p31m'], default: 'p4' },
      { key: 'tileScale',       label: 'Tile Scale',      type: 'range',  min: 40, max: 300, default: 120 },
      { key: 'edgeWarp',        label: 'Edge Warp',       type: 'range',  min: 0, max: 100, default: 25, scale: 0.01, precision: 2 },
      { key: 'motifComplexity', label: 'Motif Complexity', type: 'range', min: 3, max: 12, default: 5 },
      { key: 'lineWeight',      label: 'Line Weight',     type: 'range',  min: 0, max: 5, default: 1.5, scale: 0.5, precision: 1 },
      { key: 'filmGrain',       label: 'Film Grain',      type: 'range',  min: 0, max: 50, default: 15 }
    ];

    this.palettes = [
      { name: 'Alhambra',      mood: 'Terracotta', colors: [{h:14,s:65,l:52}, {h:198,s:52,l:37}, {h:40,s:90,l:61}, {h:47,s:21,l:88}] },
      { name: 'Crystalline',   mood: 'Chiseled', colors: [{h:205,s:26,l:64}, {h:160,s:26,l:54}, {h:210,s:8,l:71}, {h:218,s:11,l:15}] },
      { name: 'Dutch Master',  mood: 'Painterly', colors: [{h:32,s:7,l:40}, {h:27,s:17,l:25}, {h:97,s:16,l:46}, {h:42,s:26,l:82}] },
      { name: 'Stained Glass', mood: 'Vibrant', colors: [{h:357,s:70,l:35}, {h:221,s:54,l:24}, {h:152,s:67,l:26}, {h:36,s:75,l:44}, {h:0,s:0,l:4}] }
    ];

    // Pre-computed constants for hexagon/triangle grids
    this.SIN60 = Math.sin(Math.PI / 3);
    this.COS60 = Math.cos(Math.PI / 3);
    
    // Abstracted matrices to map a fundamental domain around (0,0) based on wallpaper groups.
    // [a, b, c, d, tx, ty]
    this.groups = {
      'p1': {
        type: 'square',
        ops: [ [1,0, 0,1, 0,0] ] // Identity
      },
      'p2': {
        type: 'square',
        ops: [ 
          [1,0, 0,1, 0,0], 
          [-1,0, 0,-1, 0,0] // 180° rotation around origin
        ]
      },
      'p3': {
        type: 'hex',
        ops: [
          [1,0, 0,1, 0,0],
          [-0.5,-this.SIN60, this.SIN60,-0.5, 0,0], // 120°
          [-0.5,this.SIN60, -this.SIN60,-0.5, 0,0]  // 240°
        ]
      },
      'p4': {
        type: 'square',
        ops: [
          [1,0, 0,1, 0,0],
          [0,-1, 1,0, 0,0],  // 90°
          [-1,0, 0,-1, 0,0], // 180°
          [0,1, -1,0, 0,0]   // 270°
        ]
      },
      'p6': {
        type: 'hex',
        ops: [
          [1,0, 0,1, 0,0],
          [0.5,-this.SIN60, this.SIN60,0.5, 0,0],     // 60°
          [-0.5,-this.SIN60, this.SIN60,-0.5, 0,0],   // 120°
          [-1,0, 0,-1, 0,0],                          // 180°
          [-0.5,this.SIN60, -this.SIN60,-0.5, 0,0],   // 240°
          [0.5,this.SIN60, -this.SIN60,0.5, 0,0]      // 300°
        ]
      },
      'pm': {
        type: 'square',
        ops: [
          [1,0, 0,1, 0,0],
          [-1,0, 0,1, 0,0] // reflection across Y axis
        ]
      },
      'pg': {
        type: 'square',
        ops: [
          [1,0, 0,1, 0,0],
          [-1,0, 0,1, 0,0.5] // glide reflection
        ]
      },
      'cm': {
        type: 'oblique', // rhombus (staggered)
        ops: [
          [1,0, 0,1, 0,0],
          [-1,0, 0,1, 0,0]
        ]
      },
      'p4mm': {
        type: 'square',
        ops: [
          [1,0, 0,1, 0,0], [0,-1, 1,0, 0,0], [-1,0, 0,-1, 0,0], [0,1, -1,0, 0,0],
          [-1,0, 0,1, 0,0], [1,0, 0,-1, 0,0], [0,-1, -1,0, 0,0], [0,1, 1,0, 0,0]
        ]
      },
      'p6mm': {
        type: 'hex',
        ops: [
          [1,0, 0,1, 0,0], [0.5,-this.SIN60, this.SIN60,0.5, 0,0], [-0.5,-this.SIN60, this.SIN60,-0.5, 0,0],
          [-1,0, 0,-1, 0,0], [-0.5,this.SIN60, -this.SIN60,-0.5, 0,0], [0.5,this.SIN60, -this.SIN60,0.5, 0,0],
          [-1,0, 0,1, 0,0], [0.5,this.SIN60, this.SIN60,-0.5, 0,0], [0.5,-this.SIN60, -this.SIN60,-0.5, 0,0],
          [1,0, 0,-1, 0,0], [-0.5,this.SIN60, this.SIN60,0.5, 0,0], [-0.5,-this.SIN60, -this.SIN60,0.5, 0,0]
        ]
      },
      'p3m1': {
        type: 'hex',
        ops: [
          [1,0, 0,1, 0,0], [-0.5,-this.SIN60, this.SIN60,-0.5, 0,0], [-0.5,this.SIN60, -this.SIN60,-0.5, 0,0],
          [-1,0, 0,1, 0,0], [0.5,this.SIN60, this.SIN60,-0.5, 0,0], [0.5,-this.SIN60, -this.SIN60,-0.5, 0,0]
        ]
      },
      'p31m': {
        type: 'hex',
        ops: [
          [1,0, 0,1, 0,0], [-0.5,-this.SIN60, this.SIN60,-0.5, 0,0], [-0.5,this.SIN60, -this.SIN60,-0.5, 0,0],
          [-0.5,this.SIN60, this.SIN60,0.5, 0,0], [1,0, 0,-1, 0,0], [-0.5,-this.SIN60, -this.SIN60,0.5, 0,0]
        ]
      }
    };
  }

  narrative(p) {
    const groupName = p.wallpaperGroup || 'p4';
    const warpWord = p.edgeWarp < 0.1 ? 'rigid, crystalline' :
      p.edgeWarp < 0.4 ? 'gently undulating' :
      p.edgeWarp < 0.7 ? 'organically deformed' : 'wildly fluid';
    return `A ${groupName} wallpaper-group tessellation of ${warpWord} tiles at scale ${p.tileScale}px. ` +
      `Each fundamental domain carries ${p.motifComplexity} vertices, subdivided by Bézier edge deformation. ` +
      `The plane is divided according to Escher's principle: no gaps, no overlaps, infinite repetition.`;
  }

  equation(p) {
    return `E(x, y, seed=${p.seed}, group=${p.wallpaperGroup || 'p4'})\n\n` +
      `1. F_domain = generatrix(C=${p.motifComplexity}, warp=${(p.edgeWarp || 0).toFixed(2)})\n` +
      `2. T_lattice = lattice_${p.wallpaperGroup || 'p4'}(S=${p.tileScale})\n` +
      `3. P_tile  = affineTransform(F_domain, ops[group])\n` +
      `4. color   = palette[fastHash(i, j, opIdx) % |palette|]\n` +
      `5. grain   = filmGrain(${p.filmGrain}, seed)`;
  }

  render(canvas, ctx, W, H, params, palette) {
    const _rng = new PRNG(params.seed);
    const prng = () => _rng.next();
    const group = this.groups[params.wallpaperGroup];
    const S = params.tileScale;
    
    // Clear canvas
    const bg = palette[0] ? `hsl(${palette[0].h}, ${palette[0].s}%, ${palette[0].l}%)` : '#fff';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Build the generatrix polygon (Fundamental Domain = 1/N of unit cell, where N = ops count)
    const basePolygon = this.buildGeneratrix(params, prng, group.type, group.ops.length);

    // Rendering prep
    const batches = Array.from({ length: palette.length }, () => []);
    
    // Lattice vector step sizes based on lattice type
    // Must match the fundamental domain dimensions for seamless tiling
    let dx = S, dy = S;
    let type = group.type;
    if (type === 'hex') {
      // Flat-top hex: column spacing = 1.5 × circumradius, row = √3 × circumradius
      // circumradius = 0.5 in normalized space, scaled by S
      dx = S * 0.75; // 1.5 × 0.5
      dy = S * this.SIN60; // √3/2 × S (= 0.5 × √3)
    } else if (type === 'oblique') {
      dx = S * this.SIN60;
      dy = S;
    }

    // Tiling loops - span wide enough to cover entire canvas under all rotations
    const xSteps = Math.ceil(W / dx) + 4;
    const ySteps = Math.ceil(H / dy) + 4;

    for (let i = -4; i < xSteps; i++) {
        for (let j = -4; j < ySteps; j++) {
            
            // Lattice Anchor positions
            let ax = i * dx;
            let ay = j * dy;

            if (type === 'hex' || type === 'oblique') {
              if (i % 2 !== 0) ay += dy / 2;
            }

            // Iterate over symmetry operations
            for (let opIdx = 0; opIdx < group.ops.length; opIdx++) {
                const op = group.ops[opIdx];
                // Apply affine transform to base polygon
                let poly = affineTransform(basePolygon, op);
                
                // Translate by lattice anchor and scale
                poly = poly.map(pt => [
                    pt[0] * S + ax,
                    pt[1] * S + ay
                ]);

                // Hash for colouring ensures geometric symmetry in colors
                const colorHash = Math.abs(this.fastHash(i, j, opIdx)) % palette.length;
                batches[colorHash].push(poly);
            }
        }
    }

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Batch render
    for (let c = 0; c < palette.length; c++) {
      if (batches[c].length === 0) continue;
      
      const colObj = palette[c];
      const colStr = `hsl(${colObj.h}, ${colObj.s}%, ${colObj.l}%)`;
      
      fillPolygonBatch(ctx, batches[c], colStr);
      if (params.lineWeight > 0) {
        strokePolygonBatch(ctx, batches[c], '#0d0a14', params.lineWeight);
      }
    }

    if (params.filmGrain > 0) {
      addFilmGrain(ctx, W, H, params.seed, params.filmGrain);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // BUILD FUNDAMENTAL DOMAIN — Escher Edge Classification System
  // ══════════════════════════════════════════════════════════════════
  //
  // Escher's tessellation principle (§2.3 of heuristics):
  //
  //   Edges are classified into two types:
  //   ───────────────────────────────────────────────────
  //   FIXED edges   – lie on symmetry axes (rotation centers, mirror 
  //                   lines). These are internal boundaries between
  //                   symmetry copies within the same cell. They MUST
  //                   remain straight to guarantee zero-gap fitting
  //                   between rotated/reflected copies.
  //
  //   FREE edges    – lie on the unit cell boundary. These can be
  //                   deformed freely with Bézier curves. Opposite
  //                   free edges share the SAME deformation offsets
  //                   (translated or rotated) so adjacent cells
  //                   interlock seamlessly.
  //
  //   Vertex angle sum at every meeting point: Σθᵢ = 2π
  //   Warp amplitude clamped: |offset| ≤ 0.4 × edgeLength
  //
  // ══════════════════════════════════════════════════════════════════

  buildGeneratrix(params, prng, type, nOps) {
    const warp = params.edgeWarp;
    const C = Math.max(3, params.motifComplexity);

    if (type === 'hex') {
      return this._buildHexWedge(warp, C, prng, nOps);
    } else if (type === 'oblique') {
      return this._buildRhombusDomain(warp, C, prng, nOps);
    } else {
      return this._buildSquareWedge(warp, C, prng, nOps);
    }
  }

  // ── Square Lattice Fundamental Domains ────────────────────────
  _buildSquareWedge(warp, segCount, prng, nOps) {
    // edges[] array: each entry is { p0, p1, free: boolean }
    // 'free' = can be deformed; !free = must stay straight (on symmetry axis)

    if (nOps <= 1) {
      // p1: full unit square — ALL 4 edges are free (cell boundary)
      // Paired: bottom↔top (translation), left↔right (translation)
      return this._buildEdgeSystem([
        { p0: [-0.5,-0.5], p1: [0.5,-0.5], free: true, pairId: 0 }, // bottom
        { p0: [0.5,-0.5],  p1: [0.5, 0.5], free: true, pairId: 1 }, // right
        { p0: [0.5, 0.5],  p1: [-0.5,0.5], free: true, pairId: 0 }, // top (= bottom)
        { p0: [-0.5,0.5],  p1: [-0.5,-0.5],free: true, pairId: 1 }, // left (= right)
      ], warp, segCount, prng);
    }

    if (nOps === 2) {
      // p2/pm/pg: half square — bottom & top are free (cell boundary),
      // middle edge is on rotation axis → fixed
      return this._buildEdgeSystem([
        { p0: [-0.5,-0.5], p1: [0.5,-0.5], free: true,  pairId: 0 }, // bottom (free)
        { p0: [0.5,-0.5],  p1: [0.5, 0],   free: true,  pairId: 1 }, // right-half
        { p0: [0.5, 0],    p1: [-0.5, 0],   free: false, pairId: -1}, // axis (fixed)
        { p0: [-0.5, 0],   p1: [-0.5,-0.5], free: true,  pairId: 1 }, // left-half
      ], warp, segCount, prng);
    }

    if (nOps <= 4) {
      // p4: quarter square — edges from center (0,0) are on rotation axes → FIXED
      // Only the two cell-boundary edges are free
      return this._buildEdgeSystem([
        { p0: [0,0],      p1: [0.5, 0],   free: false, pairId: -1}, // bottom-axis (fixed)
        { p0: [0.5, 0],   p1: [0.5, 0.5], free: true,  pairId: 0 }, // right boundary (free)
        { p0: [0.5, 0.5], p1: [0, 0.5],   free: true,  pairId: 0 }, // top boundary (free, paired)
        { p0: [0, 0.5],   p1: [0, 0],     free: false, pairId: -1}, // left-axis (fixed)
      ], warp, segCount, prng);
    }

    // p4mm (8 ops): eighth triangle — hypotenuse is free, both legs are fixed
    return this._buildEdgeSystem([
      { p0: [0,0],      p1: [0.5, 0],   free: false, pairId: -1 }, // axis (fixed)
      { p0: [0.5, 0],   p1: [0.5, 0.5], free: true,  pairId: 0  }, // cell boundary (free)
      { p0: [0.5, 0.5], p1: [0, 0],     free: false, pairId: -1 }, // diagonal axis (fixed)
    ], warp, segCount, prng);
  }

  // ── Hexagonal Lattice Fundamental Domains ─────────────────────
  _buildHexWedge(warp, segCount, prng, nOps) {
    const r = 0.5;
    const c30 = Math.cos(Math.PI / 6); // √3/2
    const s30 = Math.sin(Math.PI / 6); // 0.5

    if (nOps <= 3) {
      // p3: 120° wedge — two radial edges fixed (rotation axes),
      // one arc-edge free (cell boundary)
      const A = [0, 0];
      const B = [r * c30, -r * s30]; // corner at -30°
      const C = [r * c30,  r * s30]; // corner at +30°
      return this._buildEdgeSystem([
        { p0: A, p1: B, free: false, pairId: -1 }, // radius (fixed)
        { p0: B, p1: C, free: true,  pairId: 0  }, // arc boundary (free)
        { p0: C, p1: A, free: false, pairId: -1 }, // radius (fixed)
      ], warp, segCount, prng);
    }

    if (nOps <= 6) {
      // p6/p3m1/p31m: 60° wedge — two radial edges fixed, one arc free
      const A = [0, 0];
      const B = [r * c30, -r * s30]; // corner at -30°
      const C = [r, 0];              // corner at 0°
      return this._buildEdgeSystem([
        { p0: A, p1: B, free: false, pairId: -1 }, // radius (fixed)
        { p0: B, p1: C, free: true,  pairId: 0  }, // arc boundary (free)
        { p0: C, p1: A, free: false, pairId: -1 }, // radius (fixed)
      ], warp, segCount, prng);
    }

    // p6mm (12 ops): 30° wedge — all edges on symmetry axes, only hypotenuse free
    const A = [0, 0];
    const B = [r, 0];
    const C = [r * c30, r * s30];   // midpoint of hex edge (full corner, NOT halved)
    return this._buildEdgeSystem([
      { p0: A, p1: B, free: false, pairId: -1 }, // axis (fixed)
      { p0: B, p1: C, free: true,  pairId: 0  }, // cell boundary edge (free)
      { p0: C, p1: A, free: false, pairId: -1 }, // axis (fixed)
    ], warp, segCount, prng);
  }

  // ── Oblique / Rhombic Lattice ─────────────────────────────────
  _buildRhombusDomain(warp, segCount, prng, nOps) {
    const s = 0.5;
    if (nOps <= 1) {
      // Full rhombus — all edges free, paired 0↔2, 1↔3
      return this._buildEdgeSystem([
        { p0: [0,-s],                   p1: [s*this.SIN60, -s*this.COS60], free: true, pairId: 0 },
        { p0: [s*this.SIN60,-s*this.COS60], p1: [0, s],                   free: true, pairId: 1 },
        { p0: [0, s],                   p1: [-s*this.SIN60, s*this.COS60], free: true, pairId: 0 },
        { p0: [-s*this.SIN60,s*this.COS60], p1: [0, -s],                  free: true, pairId: 1 },
      ], warp, segCount, prng);
    }
    // Half rhombus — one edge on mirror axis (fixed), two free
    return this._buildEdgeSystem([
      { p0: [0,-s],                   p1: [s*this.SIN60, -s*this.COS60], free: true,  pairId: 0 },
      { p0: [s*this.SIN60,-s*this.COS60], p1: [0, s],                   free: true,  pairId: 0 },
      { p0: [0, s],                   p1: [0, -s],                      free: false, pairId: -1},
    ], warp, segCount, prng);
  }

  // ══════════════════════════════════════════════════════════════════
  // EDGE SYSTEM BUILDER — converts edge descriptors to polygon points
  // ══════════════════════════════════════════════════════════════════
  _buildEdgeSystem(edges, warp, segCount, prng) {
    // Step 1: Generate offset arrays per unique pairId
    const pairOffsets = {};
    for (const edge of edges) {
      if (edge.free && edge.pairId >= 0 && !pairOffsets[edge.pairId]) {
        pairOffsets[edge.pairId] = this._genEdgeOffsets(segCount, warp, prng);
      }
    }

    // Step 2: Build polygon from edges
    const poly = [];
    for (const edge of edges) {
      const offsets = edge.free ? (pairOffsets[edge.pairId] || []) : null;
      this._addEdgeToPolygon(poly, edge.p0, edge.p1, offsets, segCount);
    }
    return poly;
  }

  // Generate N-1 random offset values for deforming one edge
  _genEdgeOffsets(segCount, warp, prng) {
    const offsets = [];
    for (let i = 0; i < segCount - 1; i++) {
      offsets.push((prng() * 2 - 1) * warp * 0.3);
    }
    return offsets;
  }

  // Add edge points to polygon.
  // If offsets is null → straight edge (fixed/axis).
  // If offsets is array → apply perpendicular Bézier deformation (free edge).
  // Corner vertices (i=0) are always exact. Interior points get offset.
  // Amplitude is clamped to 40% of edge length to prevent self-intersection.
  _addEdgeToPolygon(poly, p0, p1, offsets, segCount) {
    const n = segCount;
    const edx = p1[0] - p0[0];
    const edy = p1[1] - p0[1];
    const len = Math.sqrt(edx * edx + edy * edy) || 1;
    const nx = -edy / len; // perpendicular unit normal
    const ny =  edx / len;
    const maxOffset = len * 0.4; // clamp: 40% of edge length

    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = p0[0] + edx * t;
      const y = p0[1] + edy * t;

      if (i > 0 && offsets) {
        // Apply clamped perpendicular offset
        let d = offsets[i - 1] || 0;
        if (d > maxOffset) d = maxOffset;
        if (d < -maxOffset) d = -maxOffset;
        poly.push([x + nx * d, y + ny * d]);
      } else {
        // Corner (i=0) or straight/fixed edge — no deformation
        poly.push([x, y]);
      }
    }
  }


  fastHash(x, y, op) {
    let h = (x * 73856093) ^ (y * 19349663) ^ (op * 83492791);
    h = h ^ (h >> 16);
    h = Math.imul(h, 0x85ebca6b);
    h = h ^ (h >> 13);
    h = Math.imul(h, 0xc2b2ae35);
    return h ^ (h >> 16);
  }
}

// Register if standard environment
if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register(new EscherPeriodicMethod());
}
