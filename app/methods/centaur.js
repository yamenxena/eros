/* ═══════════════════════════════════════════════════════════════
   Eros Method: The Centaur Field
   Implementation of the SSoT Dual-Engine Paradigm
   Phase A: Structural Mathematics (Tension Map)
   Phase B: Dynamic Agents (Spatial Hashing & Flow Mechanics)
   ═══════════════════════════════════════════════════════════════ */

const CentaurMethod = {
  id: 'centaur',
  name: 'The Centaur Field',
  version: 1,
  description: 'Dual-Engine paradigm: A structural pixel map guides thousands of dynamically hashed vector agents.',

  params: [
    { key: 'seed',        label: 'Seed',         type: 'number', min: 1,  max: 99999, default: 42 },
    { key: 'agents',      label: 'Agent Count',  type: 'range',  min: 50, max: 8000,  default: 2000 },
    { key: 'flowScale',   label: 'Flow Scale',   type: 'range',  min: 10, max: 500,   default: 150, scale: 0.001, precision: 3 },
    { key: 'structure',   label: 'Structure',    type: 'range',  min: 1,  max: 10,    default: 4 },
    { key: 'thickness',   label: 'Thickness',    type: 'range',  min: 1,  max: 20,    default: 5 },
    { key: 'friction',    label: 'Friction',     type: 'range',  min: 1,  max: 100,   default: 20, scale: 0.01, precision: 2 },
  ],

  palettes: [
    {
      name: 'Yamin Zeyna Signature', mood: 'Semantic Gravity',
      colors: [
        { h: 10,  s: 80, l: 35 }, // deep terracotta
        { h: 43,  s: 90, l: 55 }, // structural gold
        { h: 220, s: 70, l: 20 }, // void blue
        { h: 0,   s: 0,  l: 95 }, // rare white
        { h: 0,   s: 0,  l: 12 }, // ink black
      ]
    },
    {
      name: 'Fidenza Echo', mood: 'Sharp Curves',
      colors: [
        { h: 180, s: 60, l: 45 }, { h: 35, s: 80, l: 55 },
        { h: 350, s: 70, l: 40 }, { h: 0, s: 0, l: 90 },
        { h: 0, s: 0, l: 15 }
      ]
    }
  ],

  narrative(p) {
    return `A Dual-Engine composition. Phase A maps a structural topology (level=${p.structure}). Phase B injects ${p.agents} dynamic vector agents into the flow field (scale=${(p.flowScale*1000).toFixed(1)}). Agents query a SpatialHashGrid to prevent O(N²) collision mud, reacting to standard human friction (μ=${p.friction.toFixed(2)}).`;
  },

  equation(p) {
    return `SSoT Dual-Engine\n` +
      `A: T(x,y) = || sin(x*S) + cos(y*S) ||\n` +
      `B: dp/dt = V(p) · N(x,y)\n` +
      `Hash: O(1) grid enforcement`;
  },

  // Phase A: Structural Field Equation (Math only, no rendering)
  _getStructureTension(x, y, w, h, structureLevel) {
    const nx = (x / w) * structureLevel * Math.PI;
    const ny = (y / h) * structureLevel * Math.PI;
    const val = Math.sin(nx) * Math.cos(ny);
    // Returns tension 0.0 to 1.0
    return Math.abs(val);
  },

  // Polygon Stroke for "Tapering" Aesthetic
  _drawTaperedStroke(ctx, path, thickness, h, s, l) {
    if (path.length < 2) return;
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    ctx.beginPath();
    
    // Forward pass (top edge)
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      // Taper at ends (0 at start/end, max in middle)
      const dist = Math.sin((i / (path.length - 1)) * Math.PI);
      const r = Math.max(0.5, (thickness / 2) * dist);
      
      const angle = p.angle !== undefined ? p.angle + Math.PI/2 : 0;
      const vx = Math.cos(angle) * r;
      const vy = Math.sin(angle) * r;
      
      if (i === 0) ctx.moveTo(p.x + vx, p.y + vy);
      else ctx.lineTo(p.x + vx, p.y + vy);
    }
    
    // Backward pass (bottom edge)
    for (let i = path.length - 1; i >= 0; i--) {
      const p = path[i];
      const dist = Math.sin((i / (path.length - 1)) * Math.PI);
      const r = Math.max(0.5, (thickness / 2) * dist);
      
      const angle = p.angle !== undefined ? p.angle + Math.PI/2 : 0;
      const vx = Math.cos(angle) * -r;
      const vy = Math.sin(angle) * -r;
      
      ctx.lineTo(p.x + vx, p.y + vy);
    }
    
    ctx.closePath();
    ctx.fill();
  },

  render(canvas, ctx, W, H, params, palette) {
    const { seed, agents, flowScale, structure, thickness, friction } = params;
    const rng = new PRNG(seed);
    const noise = new SimplexNoise(seed);
    const palLen = palette.length;

    // Clear Canvas to pale background
    ctx.fillStyle = '#f2efe9';
    ctx.fillRect(0, 0, W, H);

    // Mandated Spatial Hash (O(1) collision)
    // Cell size roughly 2x thickness to guarantee we catch neighbors
    const collisionDist = thickness * 1.5;
    const grid = new SpatialHashGrid(W, H, Math.max(20, collisionDist * 2));

    const allPaths = [];

    // Phase B loop: Inject and simulate Agents
    for (let i = 0; i < agents; i++) {
      let x = rng.range(0, W);
      let y = rng.range(0, H);
      
      // Determine agent's identity and color via Phase A & Seed
      const structuralTension = this._getStructureTension(x, y, W, H, structure);
      
      // Probability shaping: Most are standard width, 5% are thick master strokes
      const isRare = rng.next() > 0.95;
      const agentThickness = isRare ? thickness * 2.5 : thickness * (0.5 + 0.5 * structuralTension);
      
      // Select color
      const colorHash = (rng.hash(i * 31 + seed) * 100) | 0;
      const palColor = palette[colorHash % palLen];
      
      // Mud prevention: strict $\pm L$, no additive opacity
      const adjustedL = Math.min(95, Math.max(5, palColor.l + (structuralTension - 0.5) * 20));

      const path = [];
      let active = true;
      const maxSteps = isRare ? 500 : 150;
      
      for (let step = 0; step < maxSteps && active; step++) {
        // Evaluate Flow Vector
        const nAngle = noise.fbm(x * flowScale, y * flowScale, 4, 0.5, 2.0) * Math.PI * 4;
        
        // Semantic Injection: friction alters the flow rigidity
        const adjustedAngle = nAngle + (structuralTension * friction * 0.1);
        
        path.push({ x, y, angle: adjustedAngle });
        grid.insert({ x, y, id: i });

        x += Math.cos(adjustedAngle) * 2;
        y += Math.sin(adjustedAngle) * 2;

        // Boundary Kill
        if (x < 0 || x > W || y < 0 || y > H) {
          active = false;
          break;
        }

        // Collision Kill (O(1) Check)
        const neighbors = grid.queryRadius(x, y, collisionDist);
        for (const n of neighbors) {
          if (n.id !== i) { // Collided with a DIFFERENT agent
            active = false;
            break;
          }
        }
      }

      // Render Stroke if path is long enough to be interesting
      if (path.length > 5) {
        this._drawTaperedStroke(ctx, path, agentThickness, palColor.h, palColor.s, adjustedL);
      }
    }

    return { agentCount: agents, hashCells: grid.cells.size };
  }
};

MethodRegistry.register(CentaurMethod);
