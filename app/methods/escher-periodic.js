/**
 * Eros Generative Engine
 * escher-periodic.js
 * Phase 1: Regular Division of the Plane (Periodic Tessellations)
 */

class EscherPeriodicMethod {
  constructor() {
    this.id = 'escher-periodic';
    this.name = 'Periodic Division';
    this.type = '2d';

    this.params = [
      { key: 'seed',           type: 'number', default: 42 },
      { key: 'wallpaperGroup', type: 'select', options: ['p1','p2','p3','p4','p6','pm','pg','cm','p4mm','p6mm','p3m1','p31m'] },
      { key: 'tileScale',      type: 'range',  min: 40, max: 300, default: 120 },
      { key: 'edgeWarp',       type: 'range',  min: 0, max: 100, default: 25, scale: 0.01 },
      { key: 'motifComplexity',type: 'range',  min: 3, max: 12, default: 5 },
      { key: 'lineWeight',     type: 'range',  min: 0, max: 5, default: 1.5, scale: 0.5 },
      { key: 'filmGrain',      type: 'range',  min: 0, max: 50, default: 15 }
    ];

    this.palettes = [
      { name: 'Alhambra',      colors: ['#D25D38', '#2D728F', '#F4B942', '#E8E5DA'] },
      { name: 'Crystalline',   colors: ['#8BA6B9', '#6BAA95', '#B0B6BC', '#212429'] },
      { name: 'Dutch Master',  colors: ['#6D665E', '#4B3F35', '#728964', '#DED6C4'] },
      { name: 'Stained Glass', colors: ['#9A1B22', '#1C315E', '#166E45', '#C4811C', '#0A0A0A'] }
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

  generate(ctx, W, H, params, palette) {
    const prng = typeof ErosEngine !== 'undefined' ? ErosEngine.seedPRNG(params.seed) : Math.random;
    const group = this.groups[params.wallpaperGroup];
    const S = params.tileScale;
    
    // Clear canvas
    ctx.fillStyle = palette[0] || '#fff';
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
      
      fillPolygonBatch(ctx, batches[c], palette[c]);
      if (params.lineWeight > 0) {
        strokePolygonBatch(ctx, batches[c], '#0d0a14', params.lineWeight);
      }
    }

    if (params.filmGrain > 0 && typeof addFilmGrain !== 'undefined') {
      addFilmGrain(ctx, W, H, prng, params.filmGrain);
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
        if (params.edgeWarp > 0 && typeof deformEdge !== 'undefined') {
          // Pass absolute warp value (max 0.2 units in parameter space)
          const segs = deformEdge(pts[i], next, params.edgeWarp * 0.4, prng, 4);
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
  MethodRegistry.register('escher-periodic', new EscherPeriodicMethod());
}
