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

    // Build the generatrix polygon (Fundamental Domain visual Motif)
    const basePolygon = this.buildGeneratrix(params, prng, group.type);

    // Rendering prep
    const batches = Array.from({ length: palette.length }, () => []);
    
    // Lattice vector step sizes based on lattice type
    let dx = S, dy = S, sx = S, sy = S;
    let type = group.type;
    if (type === 'hex') {
      dx = S * 1.5;
      dy = S * this.SIN60 * 2;
    } else if (type === 'oblique') {
      dx = S * 1.5;
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
      
      // We skip drawing the background color shapes to let it breathe (stencil effect)
      if (c === 0 && palette.length > 2) continue; 
      
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

  // Generates the base decorative polygon restricted to fundamental domain
  buildGeneratrix(params, prng, type) {
    const pts = [];
    const C = params.motifComplexity;
    
    // Create an irregular star inside [0, 0.5] space respecting the type bounds
    // to prevent overlaps when 8x rotated in p4mm, etc.
    let maxR = 0.5;
    if (type === 'square') maxR = 0.5;
    if (type === 'hex') maxR = 0.577; // 1/sqrt(3)

    for (let i = 0; i < C; i++) {
        const a = (i / C) * Math.PI * 2;
        const r = maxR * (0.3 + 0.7 * prng());
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }

    // Apply bezier deformation along edges
    const deformed = [];
    for(let i = 0; i < pts.length; i++) {
        const next = pts[(i+1) % pts.length];
        // Only deform if edge warp is > 0
        if (params.edgeWarp > 0) {
          // Clamp amplitude to 0.4 × edge length to prevent tessellation breakage (§19.5)
          const edgeLen = Math.sqrt((next[0]-pts[i][0])**2 + (next[1]-pts[i][1])**2);
          const amp = Math.min(params.edgeWarp * 0.4, edgeLen * 0.4);
          const segs = deformEdge(pts[i], next, amp, prng, 4);
          deformed.push(...segs.slice(0, -1));
        } else {
          deformed.push(pts[i]);
        }
    }
    return deformed;
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
