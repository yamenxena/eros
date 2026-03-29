/* ═══════════════════════════════════════════════════════════════
   Eros v6 — Method: Lattice
   Faithful recreation of Ben Kovach's Edifice algorithm.
   
   Primary source: bendotk.com/writing/edifice
   Reference: Art Blocks Project #204 (976 editions)
   
   Architecture:
   1. Rectangular Cell Grid (cellSize × cellAspect)
   2. Fill Style algorithm packs variable-size rectangles into grid
   3. Each rectangle = a net (mass-spring lattice)
   4. Explosions positioned by strategy → applied to nets
   5. Style determines boundary behavior (Explosive/Modern)
   6. Texture determines rendering (Lattice/Hatched/Sqribble)
   7. Displacement warps all points post-build
   8. Symmetry reflects grid structure
   9. Interference controls explosion proximity per-net
   10. Topology determines edge behavior (Finite/Torus)
   
   Canvas: 1200×1600 (Portrait)
   ═══════════════════════════════════════════════════════════════ */

MethodRegistry.register({
  id: 'lattice',
  name: 'Lattice',
  version: '3.0.0',
  description: 'Faithful Edifice system: Fill-style rectangle packing → spring-mass nets → explosions → displacement warp. No gravity, no 3D.',

  width: 1200,
  height: 1600,

  palettes: [
    {
      name: 'Porcelain', mood: 'Subtle / Near-blank',
      colors: [
        { h: 30,  s: 15, l: 92 },
        { h: 25,  s: 10, l: 88 },
        { h: 35,  s: 8,  l: 85 },
        { h: 20,  s: 12, l: 80 },
        { h: 40,  s: 5,  l: 95 },
      ]
    },
    {
      name: 'Noct', mood: 'Dark / Structural',
      colors: [
        { h: 220, s: 40, l: 15 },
        { h: 210, s: 55, l: 30 },
        { h: 200, s: 50, l: 45 },
        { h: 195, s: 60, l: 55 },
        { h: 215, s: 20, l: 75 },
        { h: 36,  s: 18, l: 93 },
      ]
    },
    {
      name: 'Blood Orange', mood: 'Warm Gradient',
      colors: [
        { h: 10,  s: 75, l: 40 },
        { h: 20,  s: 70, l: 50 },
        { h: 30,  s: 65, l: 55 },
        { h: 40,  s: 60, l: 60 },
        { h: 15,  s: 80, l: 35 },
        { h: 38,  s: 25, l: 93 },
      ]
    },
    {
      name: 'Meep Morp', mood: 'Cool Gradient',
      colors: [
        { h: 260, s: 50, l: 45 },
        { h: 280, s: 45, l: 55 },
        { h: 300, s: 40, l: 60 },
        { h: 320, s: 35, l: 65 },
        { h: 340, s: 30, l: 70 },
        { h: 30,  s: 20, l: 94 },
      ]
    },
    {
      name: 'Salt', mood: 'Monochrome gradient',
      colors: [
        { h: 210, s: 5,  l: 20 },
        { h: 210, s: 5,  l: 40 },
        { h: 210, s: 5,  l: 60 },
        { h: 210, s: 5,  l: 80 },
        { h: 30,  s: 10, l: 95 },
      ]
    },
  ],

  params: [
    { key: 'seed',          type: 'number', label: 'Seed',               default: 834,   min: 1,    max: 999999 },
    { key: 'cellSize',      type: 'range',  label: 'Cell Size',          default: 4,     min: 2,    max: 12,    precision: 0 },
    { key: 'cellAspect',    type: 'select', label: 'Cell Aspect',        default: 'Square', options: ['Extra_Tall','Tall','Square','Wide','Extra_Wide'], format: v => v.replace('_',' ') },
    { key: 'fillStyle',     type: 'select', label: 'Fill Style',         default: 'RandomWalk', options: ['RandomWalk','Random','Ns','Bars','Distance'] },
    { key: 'texture',       type: 'select', label: 'Texture',            default: 'Lattice', options: ['Lattice','Hatched','Sqribble'] },
    { key: 'style',         type: 'select', label: 'Style',              default: 'Explosive', options: ['Explosive','Modern'] },
    { key: 'explosionCount',type: 'range',  label: 'Explosion Count',    default: 25,    min: 0,    max: 80,    precision: 0 },
    { key: 'explPosition',  type: 'select', label: 'Explosion Position', default: 'Random', options: ['Random','Central','RectCenters','Corners','Edges','GridCenters'] },
    { key: 'interference',  type: 'select', label: 'Interference',       default: 'Low', options: ['Low','High'] },
    { key: 'displacement',  type: 'select', label: 'Displacement',       default: 'None', options: ['None','Twist','Sharp','Shift','Smooth','Wave','Squish'] },
    { key: 'symmetry',      type: 'select', label: 'Symmetry',           default: 'Random', options: ['Random','Horizontal','Vertical','Radial'] },
    { key: 'topology',      type: 'select', label: 'Topology',           default: 'Finite', options: ['Finite','Torus'] },
    { key: 'simSteps',      type: 'range',  label: 'Physics Iterations', default: 40,    min: 10,   max: 100,   precision: 0 },
    { key: 'lineWidth',     type: 'range',  label: 'Line Width',         default: 0.55,  min: 0.1,  max: 3.0,   precision: 2 },
    { key: 'spread',        type: 'range',  label: 'Explosion Spread',   default: 0.0,   min: 0.0,  max: 50.0,  precision: 1 },
    { key: 'cellMargin',    type: 'range',  label: 'Cell Margin',        default: 1.5,   min: 0.0,  max: 8.0,   precision: 1 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // NARRATIVE (Concept Tab — full technical report)
  // ═══════════════════════════════════════════════════════════════
  narrative(p) {
    return [
      `╔══ LATTICE METHOD — Technical Report ══╗`,
      ``,
      `Based on Ben Kovach's Edifice (Art Blocks #204, 976 editions, Nov 2021).`,
      ``,
      `── 1. GRID CONSTRUCTION ──`,
      `An underlying rectangular grid is built. Cell Size=${p.cellSize} controls the granularity`,
      `(Fine=2 → Colossal=12). Cell Aspect="${p.cellAspect}" shapes each cell`,
      `(Square=1:1, Tall=1:2, Wide=2:1, etc.).`,
      ``,
      `── 2. FILL STYLE: ${p.fillStyle} ──`,
      p.fillStyle === 'RandomWalk' ?
        `Random Walk: picks a random open cell, grows a rectangle in a random direction` +
        ` until blocked by grid edge or filled cell. Then picks a neighboring cell from the` +
        ` shape's endpoint and grows a new rectangle. Repeats until grid is full.` :
      p.fillStyle === 'Random' ?
        `Random: picks a random open cell and direction, grows until blocked. Repeats` +
        ` with a new random open cell each time.` :
      p.fillStyle === 'Ns' ?
        `Ns: picks N∈[1,8], attempts to fill rectangles of height/width=N. Once stuck,` +
        ` decrements N until N=1 (fills remaining cells individually).` :
      p.fillStyle === 'Bars' ?
        `Bars: builds towers of equal width next to one another until the grid is full.` :
        `Distance: picks a start point and grows outward, choosing the closest unfilled` +
        ` cell to the initial starting point by Euclidean distance.`,
      ``,
      `── 3. NET PHYSICS ──`,
      `Each rectangle is a "net" — a mass-spring lattice where nodes have mass and respond`,
      `to forces. Connections CANNOT break but CAN stretch infinitely.`,
      `${p.explosionCount} explosions are placed using "${p.explPosition}" positioning strategy.`,
      `Spread=${p.spread.toFixed(1)} controls how much explosions drift during simulation.`,
      `Interference="${p.interference}" — Low: each net only responds to explosions inside it.`,
      `High: nets respond to explosions in wider proximity.`,
      ``,
      `── 4. STYLE: ${p.style} ──`,
      p.style === 'Explosive' ?
        `Explosive: net enclosure is rubbery. When the net touches the edge, it bounces` +
        ` back inward. Creates organic, puffed shapes.` :
        `Modern: enclosure edges are sticky. When a piece of the net hits it, it stays` +
        ` stuck there. Produces traced/partially traced cells as emergent behavior.`,
      ``,
      `── 5. TEXTURE: ${p.texture} ──`,
      p.texture === 'Lattice' ?
        `Lattice: all connections (horizontal + vertical) are drawn.` :
      p.texture === 'Hatched' ?
        `Hatched: ONLY horizontal connections are drawn. Nets are denser to compensate.` +
        ` This produces the characteristic horizontal stripe appearance.` :
        `Sqribble: each node is randomly perturbed before explosions, creating a scribbly texture.`,
      ``,
      `── 6. DISPLACEMENT: ${p.displacement} ──`,
      p.displacement === 'None' ? `None: no post-build warp applied.` :
      p.displacement === 'Twist' ? `Twist: rotates all points around the image center by a variable amount.` :
      p.displacement === 'Sharp' ? `Sharp: skews odd rows/columns one direction, even rows/columns the other. Produces jagged edges.` :
      p.displacement === 'Shift' ? `Shift: skews the entire space uniformly.` :
      p.displacement === 'Smooth' ? `Smooth: applies a single smooth curving displacement.` :
      p.displacement === 'Wave' ? `Wave: applies sine wave displacement based on cell dimensions.` :
        `Squish: compresses even rows into triangles, expands odd rows into trapezoids.`,
      ``,
      `── 7. SYMMETRY: ${p.symmetry} ──`,
      p.symmetry === 'Random' ? `Random: no symmetry applied.` :
      p.symmetry === 'Horizontal' ? `Horizontal: top half reflected onto bottom.` :
      p.symmetry === 'Vertical' ? `Vertical: left half reflected onto right.` :
        `Radial: both horizontal and vertical reflections → fourfold symmetry.`,
      ``,
      `── 8. TOPOLOGY: ${p.topology} ──`,
      p.topology === 'Finite' ? `Finite: nets falling off the canvas edge are clipped.` :
        `Torus: nets wrap around to the opposite edge.`,
    ].join('\n');
  },

  equation(p) {
    return [
      `Grid: CellGrid(size=${p.cellSize}, aspect=${p.cellAspect})`,
      `Fill: ${p.fillStyle}(grid) → R[] (packed rectangles)`,
      `Net:  MassSpring(R_i, density=${p.texture === 'Hatched' ? '2×' : '1×'})`,
      `Expl: F_repulse(pos=${p.explPosition}, n=${p.explosionCount}, spread=${p.spread.toFixed(1)})`,
      `      ∀node: F = Σ_explosions (node-exp)/|node-exp|² × force`,
      `      if interference=High: radius = ∞; else radius = rect_diagonal`,
      `Spring: F_spring = -k × (|d| - rest_length) × d̂,  k=0.5,  damping=${0.82}`,
      `Bound: ${p.style === 'Explosive' ? 'v *= -0.5 (bounce)' : 'v = 0, pos = clamp (stick)'}`,
      `Disp: ${p.displacement}(point) → point'  (post-build warp)`,
      `Sym:  ${p.symmetry}`,
      `Topo: ${p.topology}`,
      `Render: ${p.texture}(links) → stroke(lineWidth=${p.lineWidth.toFixed(2)})`,
    ].join('\n');
  },

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════
  render(canvas, ctx, W, H, params, palette) {
    const prng = new PRNG(params.seed);
    const t0 = performance.now();

    // ── 1. Build Cell Grid ──
    const aspectMap = { Extra_Tall: 0.4, Tall: 0.65, Square: 1, Wide: 1.5, Extra_Wide: 2.5 };
    const aspect = aspectMap[params.cellAspect] || 1;
    const baseCell = Math.max(12, 140 / params.cellSize);
    const cellW = Math.round(baseCell * Math.max(1, aspect));
    const cellH = Math.round(baseCell / Math.min(1, aspect));
    const gridCols = Math.max(1, Math.floor(W / cellW));
    const gridRows = Math.max(1, Math.floor(H / cellH));

    // ── 2. Fill Style → packed rectangles ──
    let rects = this._fillGrid(gridCols, gridRows, cellW, cellH, params.fillStyle, prng);

    // ── 3. Symmetry ──
    rects = this._applySymmetry(rects, params.symmetry, W, H);

    // ── 4. Margins ──
    const m = params.cellMargin;
    const netRects = [];
    for (const r of rects) {
      const rx = r.x + m, ry = r.y + m;
      const rw = r.w - m * 2, rh = r.h - m * 2;
      if (rw > 3 && rh > 3) netRects.push({ x: rx, y: ry, w: rw, h: rh });
    }

    // ── 5. Background ──
    const bg = palette[palette.length - 1];
    ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
    ctx.fillRect(0, 0, W, H);

    // ── 6. Generate Explosions ──
    const explosions = this._generateExplosions(W, H, netRects, gridCols, gridRows, cellW, cellH, params, prng);

    // ── 7. Build, Simulate, Render each net ──
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';
    ctx.lineWidth = params.lineWidth;
    const palLen = Math.max(1, palette.length - 1);
    const isModern = params.style === 'Modern';
    const isHatched = params.texture === 'Hatched';
    const isSqribble = params.texture === 'Sqribble';
    const isHighInterference = params.interference === 'High';
    const isTorus = params.topology === 'Torus';
    let totalNodes = 0;

    for (let i = 0; i < netRects.length; i++) {
      const rect = netRects[i];

      // Color: weighted bucket sampling (prefer earlier palette entries)
      const weight = prng.next();
      const colIdx = Math.floor(Math.pow(weight, 0.7) * palLen);
      const col = palette[Math.min(colIdx, palLen - 1)];

      // ── FILL rectangle container with color (the visible "stripe") ──
      ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.92)`;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

      // Build net mesh
      const densityMult = isHatched ? 0.5 : 1.0; // Hatched = denser net
      const cloth = this._buildNet(rect, densityMult);
      if (cloth.nodes.length === 0) continue;

      // Sqribble: perturb before explosions
      if (isSqribble) {
        for (const n of cloth.nodes) {
          n.x += (prng.next() - 0.5) * 6;
          n.y += (prng.next() - 0.5) * 6;
        }
      }

      // Filter explosions by interference
      const localExpl = this._filterExplosions(explosions, rect, isHighInterference);

      // Simulate physics
      this._simulate(cloth, rect, localExpl, params, prng, isModern, isTorus, W, H);

      // Displacement warp (applied to all nodes after physics)
      if (params.displacement !== 'None') {
        this._displace(cloth.nodes, params.displacement, W, H, prng);
      }

      // ── Render mesh lines ON TOP of filled rect ──
      // Use a darker/more contrasted version of the same color for mesh lines
      const meshL = Math.max(5, col.l - 20);
      const meshS = Math.min(100, col.s + 10);
      ctx.strokeStyle = `hsla(${col.h}, ${meshS}%, ${meshL}%, 0.85)`;
      this._renderNet(ctx, cloth, isHatched);

      totalNodes += cloth.nodes.length;
    }

    // Grain
    this._addGrain(ctx, W, H, prng);

    return {
      cells: `${gridCols}×${gridRows}`,
      rectangles: netRects.length,
      meshNodes: totalNodes,
      elapsed: performance.now() - t0
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // FILL STYLE ALGORITHMS
  // ═══════════════════════════════════════════════════════════════
  _fillGrid(cols, rows, cellW, cellH, style, prng) {
    const filled = Array.from({ length: rows }, () => new Uint8Array(cols));
    const rects = [];

    const isOpen = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && !filled[r][c];

    const growRect = (sr, sc, dir) => {
      // dir: 0=right, 1=down, 2=left, 3=up
      let er = sr, ec = sc;
      if (dir === 0) { while (ec + 1 < cols && !filled[sr][ec + 1]) ec++; }
      else if (dir === 1) { while (er + 1 < rows && !filled[er + 1][sc]) er++; }
      else if (dir === 2) { while (ec - 1 >= 0 && !filled[sr][ec - 1]) ec--; if (ec < sc) { const t = ec; ec = sc; sc = t; } }
      else { while (er - 1 >= 0 && !filled[er - 1][sc]) er--; if (er < sr) { const t = er; er = sr; sr = t; } }
      // Try to expand perpendicular
      const isHoriz = (dir === 0 || dir === 2);
      if (isHoriz) {
        let canExpand = true;
        while (canExpand && er + 1 < rows) {
          for (let c = sc; c <= ec; c++) { if (filled[er + 1][c]) { canExpand = false; break; } }
          if (canExpand) er++;
          if (prng.next() > 0.6) break; // Random stop for variety
        }
      } else {
        let canExpand = true;
        while (canExpand && ec + 1 < cols) {
          for (let r = sr; r <= er; r++) { if (filled[r][ec + 1]) { canExpand = false; break; } }
          if (canExpand) ec++;
          if (prng.next() > 0.6) break;
        }
      }
      // Mark filled
      for (let r = sr; r <= er; r++)
        for (let c = sc; c <= ec; c++) filled[r][c] = 1;
      rects.push({
        x: sc * cellW, y: sr * cellH,
        w: (ec - sc + 1) * cellW, h: (er - sr + 1) * cellH,
        gr: sr, gc: sc, ger: er, gec: ec
      });
      return { er, ec, sr, sc };
    };

    const findOpen = () => {
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (!filled[r][c]) return { r, c };
      return null;
    };

    const findRandomOpen = () => {
      const opens = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (!filled[r][c]) opens.push({ r, c });
      return opens.length > 0 ? opens[Math.floor(prng.next() * opens.length)] : null;
    };

    if (style === 'RandomWalk') {
      let pos = findRandomOpen();
      while (pos) {
        const dir = Math.floor(prng.next() * 4);
        const result = growRect(pos.r, pos.c, dir);
        // Pick neighbor from endpoint
        const neighbors = [
          { r: result.er + 1, c: result.ec },
          { r: result.sr - 1, c: result.sc },
          { r: result.sr, c: result.ec + 1 },
          { r: result.sr, c: result.sc - 1 },
        ].filter(n => isOpen(n.r, n.c));
        pos = neighbors.length > 0 ? neighbors[Math.floor(prng.next() * neighbors.length)] : findRandomOpen();
      }
    } else if (style === 'Random') {
      let pos = findRandomOpen();
      while (pos) {
        growRect(pos.r, pos.c, Math.floor(prng.next() * 4));
        pos = findRandomOpen();
      }
    } else if (style === 'Ns') {
      let N = Math.floor(prng.range(2, 8));
      while (N >= 1) {
        let placed = false;
        let attempts = 0;
        while (attempts < cols * rows) {
          const pos = findRandomOpen();
          if (!pos) break;
          // Try to place an N-sized rect
          let ok = true;
          const isH = prng.next() > 0.5;
          const endR = isH ? pos.r : Math.min(pos.r + N - 1, rows - 1);
          const endC = isH ? Math.min(pos.c + N - 1, cols - 1) : pos.c;
          for (let r = pos.r; r <= endR && ok; r++)
            for (let c = pos.c; c <= endC && ok; c++)
              if (filled[r][c]) ok = false;
          if (ok) {
            for (let r = pos.r; r <= endR; r++)
              for (let c = pos.c; c <= endC; c++) filled[r][c] = 1;
            rects.push({
              x: pos.c * cellW, y: pos.r * cellH,
              w: (endC - pos.c + 1) * cellW, h: (endR - pos.r + 1) * cellH,
              gr: pos.r, gc: pos.c, ger: endR, gec: endC
            });
            placed = true;
          }
          attempts++;
          if (placed) break;
        }
        if (!placed) N--;
      }
      // Fill remaining individually
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (!filled[r][c]) {
            filled[r][c] = 1;
            rects.push({ x: c * cellW, y: r * cellH, w: cellW, h: cellH, gr: r, gc: c, ger: r, gec: c });
          }
    } else if (style === 'Bars') {
      const barW = Math.max(1, Math.floor(prng.range(1, 4)));
      for (let c = 0; c < cols; c += barW) {
        const endC = Math.min(c + barW - 1, cols - 1);
        for (let r = 0; r < rows; r++) {
          for (let cc = c; cc <= endC; cc++) filled[r][cc] = 1;
        }
        rects.push({
          x: c * cellW, y: 0,
          w: (endC - c + 1) * cellW, h: rows * cellH,
          gr: 0, gc: c, ger: rows - 1, gec: endC
        });
      }
    } else if (style === 'Distance') {
      const startR = Math.floor(prng.next() * rows);
      const startC = Math.floor(prng.next() * cols);
      const order = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          order.push({ r, c, d: Math.sqrt((r - startR) ** 2 + (c - startC) ** 2) });
      order.sort((a, b) => a.d - b.d);
      for (const cell of order) {
        if (filled[cell.r][cell.c]) continue;
        growRect(cell.r, cell.c, Math.floor(prng.next() * 4));
      }
    }

    return rects;
  },

  // ═══════════════════════════════════════════════════════════════
  // SYMMETRY
  // ═══════════════════════════════════════════════════════════════
  _applySymmetry(rects, sym, W, H) {
    if (sym === 'Random') return rects;
    const out = [];
    for (const r of rects) {
      out.push(r);
      if (sym === 'Horizontal' || sym === 'Radial') {
        out.push({ ...r, y: H - r.y - r.h });
      }
      if (sym === 'Vertical' || sym === 'Radial') {
        out.push({ ...r, x: W - r.x - r.w });
      }
      if (sym === 'Radial') {
        out.push({ ...r, x: W - r.x - r.w, y: H - r.y - r.h });
      }
    }
    return out;
  },

  // ═══════════════════════════════════════════════════════════════
  // NET (MASS-SPRING LATTICE) CONSTRUCTION
  // ═══════════════════════════════════════════════════════════════
  _buildNet(rect, densityMult) {
    const spacing = Math.max(3, 8 * densityMult);
    const netCols = Math.max(2, Math.floor(rect.w / spacing));
    const netRows = Math.max(2, Math.floor(rect.h / spacing));
    const nodes = [];
    const grid = [];

    for (let r = 0; r <= netRows; r++) {
      const row = [];
      for (let c = 0; c <= netCols; c++) {
        const node = {
          x: rect.x + (c / netCols) * rect.w,
          y: rect.y + (r / netRows) * rect.h,
          ox: rect.x + (c / netCols) * rect.w,  // original position for displacement
          oy: rect.y + (r / netRows) * rect.h,
          vx: 0, vy: 0,
          row: r, col: c
        };
        nodes.push(node);
        row.push(node);
      }
      grid.push(row);
    }

    // Structural + shear links
    const links = [];
    const hDist = rect.w / netCols;
    const vDist = rect.h / netRows;

    for (let r = 0; r <= netRows; r++) {
      for (let c = 0; c <= netCols; c++) {
        // Horizontal structural spring
        if (c < netCols)
          links.push({ n1: grid[r][c], n2: grid[r][c + 1], dist: hDist, type: 'h' });
        // Vertical structural spring
        if (r < netRows)
          links.push({ n1: grid[r][c], n2: grid[r + 1][c], dist: vDist, type: 'v' });
        // Shear diagonals (prevent mesh collapse)
        if (r < netRows && c < netCols)
          links.push({ n1: grid[r][c], n2: grid[r + 1][c + 1], dist: Math.hypot(hDist, vDist), type: 'd' });
      }
    }

    return { nodes, links, grid, netCols, netRows };
  },

  // ═══════════════════════════════════════════════════════════════
  // EXPLOSION GENERATION
  // ═══════════════════════════════════════════════════════════════
  _generateExplosions(W, H, rects, gridCols, gridRows, cellW, cellH, params, prng) {
    const pool = [];
    const n = params.explosionCount;
    const pos = params.explPosition;

    for (let i = 0; i < n; i++) {
      let ex, ey;
      if (pos === 'Random') {
        ex = prng.range(0, W);
        ey = prng.range(0, H);
      } else if (pos === 'Central') {
        // Normal distribution around horizontal center
        const u1 = prng.next(), u2 = prng.next();
        const z0 = Math.sqrt(-2 * Math.log(u1 + 0.001)) * Math.cos(2 * Math.PI * u2);
        const z1 = Math.sqrt(-2 * Math.log(u1 + 0.001)) * Math.sin(2 * Math.PI * u2);
        ex = W / 2 + z0 * W * 0.25;
        ey = H / 2 + z1 * H * 0.15;
      } else if (pos === 'RectCenters' && rects.length > 0) {
        const r = rects[Math.floor(prng.next() * rects.length)];
        ex = r.x + r.w / 2 + (prng.next() - 0.5) * r.w * 0.3;
        ey = r.y + r.h / 2 + (prng.next() - 0.5) * r.h * 0.3;
      } else if (pos === 'Corners' && rects.length > 0) {
        const r = rects[Math.floor(prng.next() * rects.length)];
        const corners = [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]];
        const c = corners[Math.floor(prng.next() * 4)];
        ex = c[0]; ey = c[1];
      } else if (pos === 'Edges' && rects.length > 0) {
        const r = rects[Math.floor(prng.next() * rects.length)];
        const edges = [
          [r.x + r.w / 2, r.y], [r.x + r.w / 2, r.y + r.h],
          [r.x, r.y + r.h / 2], [r.x + r.w, r.y + r.h / 2]
        ];
        const e = edges[Math.floor(prng.next() * 4)];
        ex = e[0]; ey = e[1];
      } else if (pos === 'GridCenters') {
        const gc = Math.floor(prng.next() * gridCols);
        const gr = Math.floor(prng.next() * gridRows);
        ex = (gc + 0.5) * cellW;
        ey = (gr + 0.5) * cellH;
      } else {
        ex = prng.range(0, W);
        ey = prng.range(0, H);
      }

      pool.push({ x: ex, y: ey, force: prng.range(2000, 8000) });
    }
    return pool;
  },

  // ═══════════════════════════════════════════════════════════════
  // EXPLOSION INTERFERENCE FILTER
  // ═══════════════════════════════════════════════════════════════
  _filterExplosions(allExplosions, rect, highInterference) {
    if (highInterference) {
      // All explosions in wider proximity
      const pad = Math.max(rect.w, rect.h) * 2;
      return allExplosions.filter(e =>
        e.x >= rect.x - pad && e.x <= rect.x + rect.w + pad &&
        e.y >= rect.y - pad && e.y <= rect.y + rect.h + pad
      );
    }
    // Low: only explosions directly inside this rect
    return allExplosions.filter(e =>
      e.x >= rect.x && e.x <= rect.x + rect.w &&
      e.y >= rect.y && e.y <= rect.y + rect.h
    );
  },

  // ═══════════════════════════════════════════════════════════════
  // PHYSICS SIMULATION
  // ═══════════════════════════════════════════════════════════════
  _simulate(cloth, rect, explosions, params, prng, isModern, isTorus, W, H) {
    if (explosions.length === 0) return;

    const springK = 0.5;
    const damp = 0.82;

    for (let step = 0; step < params.simSteps; step++) {
      // Explosion spread: drift explosion positions slightly each step
      if (params.spread > 0) {
        for (const e of explosions) {
          e.x += (prng.next() - 0.5) * params.spread * 0.1;
          e.y += (prng.next() - 0.5) * params.spread * 0.1;
        }
      }

      // 1. External forces from explosions (repulsion only)
      for (const node of cloth.nodes) {
        let fx = 0, fy = 0;
        for (const exp of explosions) {
          const dx = node.x - exp.x;
          const dy = node.y - exp.y;
          const distSq = dx * dx + dy * dy + 1;
          if (distSq < exp.force * 80) {
            const force = exp.force / distSq;
            const dist = Math.sqrt(distSq);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        }
        node.vx += fx;
        node.vy += fy;
      }

      // 2. Spring constraint resolution (2 passes for stability)
      for (let iter = 0; iter < 2; iter++) {
        for (const link of cloth.links) {
          const dx = link.n2.x - link.n1.x;
          const dy = link.n2.y - link.n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const diff = (dist - link.dist) / dist;
          const ox = dx * diff * 0.5 * springK;
          const oy = dy * diff * 0.5 * springK;
          link.n1.x += ox; link.n1.y += oy;
          link.n2.x -= ox; link.n2.y -= oy;
        }
      }

      // 3. Velocity integration + boundary enforcement
      for (const node of cloth.nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= damp;
        node.vy *= damp;

        if (isTorus) {
          // Wrap around
          if (node.x < 0) node.x += W;
          if (node.x > W) node.x -= W;
          if (node.y < 0) node.y += H;
          if (node.y > H) node.y -= H;
        } else {
          // Boundary: Explosive (bounce) vs Modern (stick)
          if (node.x < rect.x) {
            node.x = rect.x;
            node.vx = isModern ? 0 : node.vx * -0.5;
          } else if (node.x > rect.x + rect.w) {
            node.x = rect.x + rect.w;
            node.vx = isModern ? 0 : node.vx * -0.5;
          }
          if (node.y < rect.y) {
            node.y = rect.y;
            node.vy = isModern ? 0 : node.vy * -0.5;
          } else if (node.y > rect.y + rect.h) {
            node.y = rect.y + rect.h;
            node.vy = isModern ? 0 : node.vy * -0.5;
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // DISPLACEMENT FUNCTIONS (post-build warp)
  // ═══════════════════════════════════════════════════════════════
  _displace(nodes, mode, W, H, prng) {
    const cx = W / 2, cy = H / 2;
    const strength = prng.range(0.3, 1.2);

    for (const n of nodes) {
      const dx = n.x - cx, dy = n.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (mode === 'Twist') {
        const angle = dist * 0.003 * strength;
        const cos = Math.cos(angle), sin = Math.sin(angle);
        const nx = cx + dx * cos - dy * sin;
        const ny = cy + dx * sin + dy * cos;
        n.x = nx; n.y = ny;
      } else if (mode === 'Sharp') {
        const gridR = Math.floor(n.y / 50);
        const gridC = Math.floor(n.x / 50);
        const shiftAmt = 12 * strength;
        n.x += (gridR % 2 === 0 ? shiftAmt : -shiftAmt);
        n.y += (gridC % 2 === 0 ? shiftAmt : -shiftAmt);
      } else if (mode === 'Shift') {
        const shear = 0.15 * strength;
        n.x += n.y * shear;
      } else if (mode === 'Smooth') {
        const t = (n.y / H) * Math.PI;
        n.x += Math.sin(t) * 40 * strength;
      } else if (mode === 'Wave') {
        const freq = 2 * Math.PI * 3 / W;
        n.x += Math.sin(n.y * freq) * 20 * strength;
        n.y += Math.cos(n.x * freq) * 15 * strength;
      } else if (mode === 'Squish') {
        const row = Math.floor(n.y / 60);
        if (row % 2 === 0) {
          const t = (n.x - cx) / (W / 2);
          n.y += t * 15 * strength * (n.y / H);
        } else {
          const t = (n.x - cx) / (W / 2);
          n.y -= t * 15 * strength * (1 - n.y / H);
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════
  _renderNet(ctx, cloth, isHatched) {
    ctx.beginPath();
    for (const link of cloth.links) {
      // Hatched: draw ONLY horizontal connections
      if (isHatched && link.type !== 'h') continue;
      ctx.moveTo(link.n1.x, link.n1.y);
      ctx.lineTo(link.n2.x, link.n2.y);
    }
    ctx.stroke();
  },

  _addGrain(ctx, W, H, prng) {
    const id = ctx.getImageData(0, 0, W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (prng.next() - 0.5) * 12;
      d[i] += noise; d[i + 1] += noise; d[i + 2] += noise;
    }
    ctx.putImageData(id, 0, 0);
  }
});
