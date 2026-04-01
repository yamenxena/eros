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

  // ── Build the fundamental domain as a space-filling polygon ──────
  // For wallpaper groups, the fundamental domain is 1/N of the unit cell,
  // where N = number of symmetry operations. The ops tile the domain
  // to fill one cell, and the lattice tiles cells to fill the plane.
  //
  // For translation-only groups (p1), domain = full cell.
  // For groups with rotations/reflections, domain is a proportional fraction.
  //
  // Edge deformation uses paired offsets: opposite/shared edges get the
  // same deformation so tiles interlock seamlessly (Escher's technique).
  buildGeneratrix(params, prng, type, nOps) {
    const warp = params.edgeWarp;
    const C = Math.max(3, params.motifComplexity); // segments per edge

    if (type === 'hex') {
      return this._buildHexWedge(warp, C, prng, nOps);
    } else if (type === 'oblique') {
      return this._buildRhombusDomain(warp, C, prng, nOps);
    } else {
      return this._buildSquareWedge(warp, C, prng, nOps);
    }
  }

  // Square-lattice fundamental domain — sized to 1/nOps of the unit cell
  _buildSquareWedge(warp, segCount, prng, nOps) {
    let corners;
    
    if (nOps <= 1) {
      // p1: full unit square
      corners = [[-0.5,-0.5], [0.5,-0.5], [0.5,0.5], [-0.5,0.5]];
    } else if (nOps === 2) {
      // p2, pm, pg: half of square (rectangle)
      corners = [[-0.5,-0.5], [0.5,-0.5], [0.5,0], [-0.5,0]];
    } else if (nOps <= 4) {
      // p4: quarter square (right triangle / square quadrant)
      corners = [[0,0], [0.5,0], [0.5,0.5], [0,0.5]];
    } else {
      // p4mm (8 ops): eighth of square (right triangle wedge)
      corners = [[0,0], [0.5,0], [0.5,0.5]];
    }

    return this._buildDeformedPoly(corners, warp, segCount, prng);
  }

  // Hex-lattice fundamental domain — sized as wedge of unit hex
  _buildHexWedge(warp, segCount, prng, nOps) {
    const r = 0.5;
    let corners;

    if (nOps <= 3) {
      // p3: 120° wedge (isoceles triangle = 1/3 of hex)
      corners = [
        [0, 0],
        [r * Math.cos(-Math.PI/6), r * Math.sin(-Math.PI/6)],
        [r * Math.cos(Math.PI/6),  r * Math.sin(Math.PI/6)]
      ];
    } else if (nOps <= 6) {
      // p6, p3m1, p31m: 60° wedge (equilateral triangle = 1/6 of hex)
      corners = [
        [0, 0],
        [r * Math.cos(-Math.PI/6), r * Math.sin(-Math.PI/6)],
        [r, 0]
      ];
    } else {
      // p6mm (12 ops): 30° wedge (right triangle = 1/12 of hex)
      corners = [
        [0, 0],
        [r, 0],
        [r * Math.cos(Math.PI/6) * 0.5, r * Math.sin(Math.PI/6) * 0.5]
      ];
    }

    return this._buildDeformedPoly(corners, warp, segCount, prng);
  }

  // Rhombic (oblique cm) fundamental domain
  _buildRhombusDomain(warp, segCount, prng, nOps) {
    const s = 0.5;
    let corners;
    if (nOps <= 1) {
      // Full rhombus
      corners = [
        [0, -s],
        [s * this.SIN60, -s * this.COS60],
        [0, s],
        [-s * this.SIN60, s * this.COS60]
      ];
    } else {
      // Half rhombus (triangle)
      corners = [
        [0, -s],
        [s * this.SIN60, -s * this.COS60],
        [0, s]
      ];
    }
    return this._buildDeformedPoly(corners, warp, segCount, prng);
  }

  // Generic deformed polygon builder — works for any number of corners
  _buildDeformedPoly(corners, warp, segCount, prng) {
    const nEdges = corners.length;
    // Generate deformation offsets for each edge
    // Pair opposite edges (floor(nEdges/2) independent, rest shared)
    const nIndependent = Math.ceil(nEdges / 2);
    const edgeOffsets = [];
    for (let i = 0; i < nIndependent; i++) {
      edgeOffsets.push(this._genEdgeOffsets(segCount, warp, prng));
    }
    // Remaining edges share offsets with their opposite
    while (edgeOffsets.length < nEdges) {
      edgeOffsets.push(edgeOffsets[edgeOffsets.length - nIndependent]);
    }

    const poly = [];
    for (let i = 0; i < nEdges; i++) {
      const p0 = corners[i];
      const p1 = corners[(i + 1) % nEdges];
      this._addDeformedEdge(poly, p0, p1, edgeOffsets[i], segCount);
    }
    return poly;
  }

  // Generate N random offset values used to deform one edge
  _genEdgeOffsets(segCount, warp, prng) {
    const offsets = [];
    for (let i = 0; i < segCount - 1; i++) {
      offsets.push((prng() * 2 - 1) * warp * 0.3);
    }
    return offsets;
  }

  // Add a deformed edge to polygon — applying perpendicular offsets
  // Uses the edge's actual normal direction (not axis-locked)
  _addDeformedEdge(poly, p0, p1, offsets, segCount) {
    const n = segCount;
    // Compute perpendicular (normal) to edge
    const edx = p1[0] - p0[0];
    const edy = p1[1] - p0[1];
    const len = Math.sqrt(edx * edx + edy * edy) || 1;
    const nx = -edy / len; // perpendicular unit normal
    const ny =  edx / len;

    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = p0[0] + edx * t;
      const y = p0[1] + edy * t;
      // Apply perpendicular offset for interior points (not first vertex)
      if (i > 0) {
        const offset = offsets[i - 1] || 0;
        poly.push([x + nx * offset, y + ny * offset]);
      } else {
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
