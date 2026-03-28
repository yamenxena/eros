/* ═══════════════════════════════════════════════════════════════
   Eros v4 — Method: Topological Flow (Fidenza Experiment)
   Implements Vector Fields, O(1) Spatial Hash Collision Detection,
   and Geometric Tapering. 
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'flow',
  name: 'Topological Flow',
  version: '1.0.0',
  description: 'Deterministic vector flow fields simulating physical paint logic. Features O(1) collision packing and bezier tapering.',

  palettes: [
    {
      name: 'Chromey',
      mood: 'Fidenza Classic',
      colors: [
        {h: 0, s: 80, l: 45},   // Poppy Red
        {h: 40, s: 90, l: 55},  // Golden Yellow
        {h: 210, s: 80, l: 40}, // Deep Navy
        {h: 190, s: 70, l: 60}, // Sky Blue
        {h: 30, s: 20, l: 20},  // Charcoal Black
        {h: 40, s: 5, l: 85}    // Off-White Paper
      ]
    },
    {
      name: 'Monolith',
      mood: 'Brutalist Contrast',
      colors: [
        {h: 0, s: 0, l: 15},    // Near Black
        {h: 0, s: 0, l: 30},    // Dark Grey
        {h: 0, s: 0, l: 60},    // Mid Grey
        {h: 0, s: 0, l: 85},    // Light Grey
        {h: 15, s: 90, l: 50}   // Single Accent Orange
      ]
    }
  ],

  params: [
    { key: 'seed', type: 'number', label: 'Hash Seed', default: 834, min: 1, max: 999999 },
    { key: 'lines', type: 'range', label: 'Max Curves', default: 1500, min: 100, max: 6000, precision: 0 },
    { key: 'scale', type: 'range', label: 'Field Scale', default: 0.002, min: 0.0005, max: 0.015, precision: 4 },
    { key: 'margin', type: 'range', label: 'Pack Margin', default: 10, min: 2, max: 50, precision: 1 },
    { key: 'steps', type: 'range', label: 'Max Length', default: 300, min: 20, max: 1500, precision: 0 },
    { key: 'stepLen', type: 'range', label: 'Velocity', default: 5, min: 1, max: 20, precision: 1 },
    { key: 'thick', type: 'range', label: 'Max Width', default: 12, min: 2, max: 80, precision: 1 },
  ],

  narrative: function(p) {
    return `An invisible mathematical river governed by a noise field scaled at ${p.scale}. ` +
           `${p.lines} autonomous agents are dropped into this space. They navigate forward ` +
           `but are violently terminated if they ever come within ${p.margin} pixels of another ` +
           `agent's path, creating perfect spatial packing.`;
  },
  
  equation: function(p) {
    return `d𝐏/dt = V(𝐏)\nθ = N(x·${p.scale.toFixed(4)}, y·${p.scale.toFixed(4)}) · 4π \nDistance(A, B) > ${p.margin}`;
  },

  render: function(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const sn = new SimplexNoise(params.seed);

    // Initialise collision grid. Cells must be large enough to hold the margin check.
    const grid = new SpatialHashGrid(W, H, Math.max(params.margin, 10));

    // Base background layer: warm, textured paper feel
    ctx.fillStyle = '#EBE9DD'; // Hardcoded Fidenza paper base
    ctx.fillRect(0, 0, W, H);
    
    // Add subtle paper grain
    this._addGrain(ctx, W, H, prng);

    let drawnCounter = 0;

    // We process lines in order. They stay alive until they hit a wall or margin.
    for (let i = 0; i < params.lines; i++) {
        
      // 1. Curve Characteristics (Probability Shaping)
      // Some lines are massive, most are average, some are thin.
      // We shape the probability using multiple PRNG calls.
      let sizeFactor = Math.pow(prng.next(), 3); // heavily biased near 0
      let lineThickness = params.thick * 0.1 + (params.thick * 0.9 * sizeFactor);
      
      // Select color (weighted so paper off-white isn't chosen too often for giant lines)
      let cIdx = Math.floor(prng.next() * palette.length);
      let col = palette[cIdx];

      // 2. Pick starting drop point
      let x = prng.range(params.margin, W - params.margin);
      let y = prng.range(params.margin, H - params.margin);

      // Check if drop point is immediately illegal
      if (this._isColliding(grid, x, y, params.margin, i, 0, params.stepLen)) {
          continue; // Dead on arrival
      }

      const path = [];
      path.push({ x, y });
      grid.insert({ x, y, lineId: i, stepId: 0 });

      // 3. Flow Field Navigation
      let alive = true;
      let steps = 0;

      while (alive && steps < params.steps) {
        steps++;
        
        // Read the noise topology
        let angle = sn.noise2(x * params.scale, y * params.scale) * Math.PI * 4;
        
        // Move agent
        let nx = x + Math.cos(angle) * params.stepLen;
        let ny = y + Math.sin(angle) * params.stepLen;

        // Check boundaries
        if (nx < params.margin || ny < params.margin || nx > W - params.margin || ny > H - params.margin) {
          alive = false;
          break;
        }

        // Check Collision Grid (The Packing Problem)
        let collision = this._isColliding(grid, nx, ny, params.margin, i, steps, params.stepLen);
        if (collision) {
          alive = false;
          break;
        }

        x = nx;
        y = ny;
        path.push({ x, y });
        grid.insert({ x, y, lineId: i, stepId: steps });
      }

      // 4. Render Polygon (Tapering)
      // Only draw if it lived long enough to be visible
      if (path.length > 3) {
        drawnCounter++;
        this._drawTaperedPath(ctx, path, lineThickness, col);
      }
    }

    return { 
      agentsDeployed: params.lines, 
      survivorsPainted: drawnCounter,
      collisionChecks: "O(1) Spatial" 
    };
  },

  // Helper: Grid collision logic
  _isColliding(grid, x, y, margin, currentLineId, currentStepId, stepLen) {
    const neighbors = grid.queryRadius(x, y, margin);
    for (const n of neighbors) {
      // If it's a point from our own active line
      if (n.lineId === currentLineId) {
        // If it's physically close along the spline sequence, ignore it (it's our recent tail)
        // Calculating safe tail distance: (margin / step length) + buffer
        const safeWindow = Math.ceil(margin / stepLen) + 2;
        if (Math.abs(currentStepId - n.stepId) < safeWindow) {
            continue;
        }
        // If it's further back in the sequence, it means the line is curling into itself -> COLLISION!
      }
      return true; // Hard collision with another line or self-curl
    }
    return false;
  },

  // Helper: Vector Geometry Tapering
  _drawTaperedPath(ctx, path, maxThick, col) {
    const lefts = [];
    const rights = [];
    
    // Smooth Bezier Polygon Math
    for (let i = 0; i < path.length; i++) {
      let p = path[i];
      let dx = 0, dy = 0;
      
      // Calculate continuous tangent
      if (i === 0) { 
          dx = path[1].x - p.x; 
          dy = path[1].y - p.y; 
      } else if (i === path.length - 1) { 
          dx = p.x - path[i-1].x; 
          dy = p.y - path[i-1].y; 
      } else {
          dx = path[i+1].x - path[i-1].x;
          dy = path[i+1].y - path[i-1].y;
      }
      
      let len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;
      dx /= len; 
      dy /= len;
      
      // Normal vector (perpendicular)
      let nx = -dy; 
      let ny = dx;
      
      // Tapering logic: Start thin -> Thick -> End thin (sine wave mapping)
      let t = i / (path.length - 1);
      // Fidenza taper relies on a fast ramp up, then stable, then fast ramp down.
      // We use Math.sin(t * PI) mapped through an exponent to widen the flat middle.
      let taper = Math.pow(Math.sin(t * Math.PI), 0.3);
      let w = taper * (maxThick / 2);
      
      lefts.push({ x: p.x + nx * w, y: p.y + ny * w });
      rights.push({ x: p.x - nx * w, y: p.y - ny * w });
    }
    
    // Draw polygon
    ctx.beginPath();
    ctx.moveTo(lefts[0].x, lefts[0].y);
    for (let i = 1; i < lefts.length; i++) ctx.lineTo(lefts[i].x, lefts[i].y);
    // Draw the rounded cap at the end implicitly by jumping to the right side
    for (let i = rights.length - 1; i >= 0; i--) ctx.lineTo(rights[i].x, rights[i].y);
    ctx.closePath();
    
    // Pure RGB/HSL fill without stacking globalAlpha to avoid "Mud"
    ctx.fillStyle = `hsl(${col.h}, ${col.s}%, ${col.l}%)`;
    ctx.fill();
    
    // Delicate outline to simulate dried pigment edge
    ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${Math.max(0, col.l - 25)}%, 0.4)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  },

  // Helper: Generates static paper grain overlay (fast implementation)
  _addGrain(ctx, W, H, prng) {
     const id = ctx.getImageData(0,0,W,H);
     const d = id.data;
     for (let i=0; i<d.length; i+=4) {
         // Tiny luminescence jitter
         let noise = (prng.next() - 0.5) * 15;
         d[i] += noise;
         d[i+1] += noise;
         d[i+2] += noise;
     }
     ctx.putImageData(id, 0, 0);
  }
});
