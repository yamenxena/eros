/* ═══════════════════════════════════════════════════════════════
   Eros Method: Muqarnas Radial Field
   Concentric ring tessellation · recursive subdivision · tension
   E(x, y, t, seed) → (h, s, l, a)
   ═══════════════════════════════════════════════════════════════ */

const MuqarnasMethod = {
  id: 'muqarnas',
  name: 'Muqarnas Field',
  version: 1,
  description: 'Concentric ring tessellation with recursive subdivision and radial tension',

  params: [
    { key: 'seed',      label: 'Seed',         type: 'number', min: 1,  max: 99999, default: 42 },
    { key: 'erosion',   label: 'Erosion',      type: 'range',  min: 0,  max: 100,   default: 0,   scale: 0.01, precision: 2 },
    { key: 'module',    label: 'Module',       type: 'range',  min: 20, max: 200,   default: 80 },
    { key: 'nRings',    label: 'Rings',        type: 'range',  min: 3,  max: 20,    default: 7 },
    { key: 'fold',      label: 'Fold',         type: 'select', options: [4, 5, 6, 8], default: 6, format: v => v + '-fold' },
    { key: 'subdivisionDepth', label: 'Subdivision', type: 'range', min: 0, max: 6, default: 3 },
    { key: 'frequency', label: 'Frequency',    type: 'range',  min: 50, max: 500,   default: 200, scale: 0.01, precision: 1 },
    { key: 'amplitude', label: 'Amplitude',    type: 'range',  min: 0,  max: 200,   default: 60 },
  ],

  palettes: [
    {
      name: 'Nakkashane', mood: 'Imperial workshop',
      colors: [
        { h: 225, s: 75, l: 40 }, { h: 5, s: 85, l: 50 }, { h: 43, s: 90, l: 55 },
        { h: 155, s: 60, l: 35 }, { h: 48, s: 80, l: 60 }, { h: 0, s: 0, l: 8 },
      ]
    },
    {
      name: 'Sultanahmet', mood: 'Sacred blue',
      colors: [
        { h: 215, s: 65, l: 45 }, { h: 210, s: 60, l: 55 }, { h: 220, s: 70, l: 35 },
        { h: 43, s: 85, l: 55 }, { h: 0, s: 0, l: 92 },
      ]
    },
    {
      name: 'Iznik', mood: 'Mediterranean ceramic',
      colors: [
        { h: 200, s: 70, l: 45 }, { h: 355, s: 80, l: 45 }, { h: 155, s: 55, l: 40 },
        { h: 0, s: 0, l: 95 }, { h: 43, s: 85, l: 55 },
      ]
    },
    {
      name: 'Harem', mood: 'Intimate warmth',
      colors: [
        { h: 340, s: 70, l: 45 }, { h: 25, s: 75, l: 50 }, { h: 43, s: 90, l: 55 },
        { h: 275, s: 40, l: 35 }, { h: 15, s: 80, l: 40 },
      ]
    },
    {
      name: 'Rüstem Paşa', mood: 'Intricate tile',
      colors: [
        { h: 200, s: 75, l: 40 }, { h: 5, s: 80, l: 50 }, { h: 155, s: 65, l: 35 },
        { h: 43, s: 85, l: 55 }, { h: 345, s: 60, l: 50 },
      ]
    },
    {
      name: 'Bosphorus Night', mood: 'Deep dusk',
      colors: [
        { h: 230, s: 50, l: 20 }, { h: 210, s: 60, l: 35 }, { h: 280, s: 40, l: 25 },
        { h: 195, s: 55, l: 45 }, { h: 43, s: 70, l: 50 },
      ]
    },
    {
      name: 'Flesh Topology', mood: 'Skin · warmth',
      colors: [
        { h: 15, s: 55, l: 55 }, { h: 25, s: 60, l: 45 }, { h: 10, s: 65, l: 35 },
        { h: 350, s: 50, l: 40 }, { h: 35, s: 50, l: 65 },
      ]
    },
    {
      name: 'Obsidian Rose', mood: 'Dark radiance',
      colors: [
        { h: 340, s: 65, l: 45 }, { h: 350, s: 55, l: 30 }, { h: 20, s: 70, l: 50 },
        { h: 280, s: 35, l: 25 }, { h: 0, s: 0, l: 6 },
      ]
    },
  ],

  narrative(p) {
    const foldWord = { 4: 'square', 5: 'pentagonal', 6: 'hexagonal', 8: 'octagonal' }[p.fold] || p.fold + '-fold';
    const erosionWord = p.erosion < 0.15 ? 'pristine, untouched' :
      p.erosion < 0.4 ? 'gently weathered' :
      p.erosion < 0.7 ? 'deeply eroded, revealing' : 'dissolved into sensation';
    return `A ${foldWord} field of ${p.nRings} concentric tiers, subdivided to depth ${p.subdivisionDepth}. ` +
      `The structure is ${erosionWord} (t=${p.erosion.toFixed(2)}). ` +
      `Module scale: ${p.module}px. Every point carries its own address: ring, cell, tension.`;
  },

  equation(p) {
    return `E(x, y, t=${p.erosion.toFixed(2)}, seed=${p.seed})\n\n` +
      `1. P_sym    = fold_${p.fold}(P, center)\n` +
      `2. P_erode  = P_sym + ${p.erosion.toFixed(2)} · A · fbm(P_sym, 4, ${p.seed})\n` +
      `3. (n, c, τ) = address(P_erode, module=${p.module}, rings=${p.nRings})\n` +
      `4. h = palette[hash(c)].h + 30·(n/N − 0.5)\n` +
      `5. s = palette[...].s · (1 − 0.35·τ)\n` +
      `6. l = 12 + 53 · n/N · (1 + 0.2·t)\n` +
      `7. boundary → gold (n>0.7N) or carbon`;
  },

  // ── Internal helpers ──

  _buildStructure(W, H, params) {
    const { seed, module: mod, nRings, subdivisionDepth, fold } = params;
    const rng = new PRNG(seed);
    const cx = W / 2, cy = H / 2;
    const maxRadius = Math.min(W, H) * 0.48;
    const cells = [];
    const baseSectors = Math.max(fold, 4);

    for (let ring = 0; ring < nRings; ring++) {
      const ringT = ring / Math.max(nRings - 1, 1);
      const radius = maxRadius * (1 - ringT);
      const sectorCount = baseSectors * (ring + 1);
      for (let sec = 0; sec < sectorCount; sec++) {
        const angle = (sec / sectorCount) * Math.PI * 2 + (ring % 2) * (Math.PI / sectorCount);
        cells.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
          ring, sector: sec, ringT, angle,
          size: mod * (1 - ringT * 0.5),
          depth: Math.round(subdivisionDepth * (0.3 + 0.7 * ringT)),
          id: ring * 1000 + sec,
          seedHash: rng.hash(ring * 997 + sec * 131 + seed),
        });
      }
    }
    cells.push({ x: cx, y: cy, ring: nRings, sector: 0, ringT: 1.0, angle: 0,
      size: mod * 0.5, depth: subdivisionDepth, id: nRings * 1000, seedHash: rng.hash(seed + 7919) });
    return cells;
  },

  _addressPoint(px, py, cells, seed) {
    let minDist = Infinity, secondDist = Infinity, nearestIdx = 0;
    for (let i = 0; i < cells.length; i++) {
      const dx = px - cells[i].x, dy = py - cells[i].y;
      const d = dx * dx + dy * dy;
      if (d < minDist) { secondDist = minDist; minDist = d; nearestIdx = i; }
      else if (d < secondDist) { secondDist = d; }
    }
    const d1 = Math.sqrt(minDist), d2 = Math.sqrt(secondDist);
    const tension = d2 > 0 ? 1 - (d2 - d1) / (d2 + d1 + 0.001) : 0;
    const cell = cells[nearestIdx];
    let subId = 0;
    if (cell.depth > 0) {
      let lx = px - cell.x, ly = py - cell.y;
      for (let d = 0; d < cell.depth; d++) {
        const rng = new PRNG(cell.id * 31 + d * 7 + seed);
        subId = subId * 2 + ((rng.next() > 0.5 ? lx : ly) > 0 ? 1 : 0);
      }
    }
    return { cell, tension, subId, dist: d1 };
  },

  _quickCellId(px, py, cx, cy, W, H, foldAngle, cells, noise, freq, amp, erosion) {
    let nx = (px - cx) / (W / 2), ny = (py - cy) / (H / 2);
    let angle = Math.atan2(ny, nx); if (angle < 0) angle += Math.PI * 2;
    const dist = Math.sqrt(nx * nx + ny * ny);
    const fa = angle % foldAngle, hf = foldAngle / 2;
    const ma = fa > hf ? foldAngle - fa : fa;
    let fx = cx + dist * Math.cos(ma) * (W / 2), fy = cy + dist * Math.sin(ma) * (H / 2);
    if (erosion > 0.001) {
      fx += noise.fbm(fx * freq / W, fy * freq / H, 4, 0.5, 2.0) * amp * erosion;
      fy += noise.fbm(fx * freq / W + 100, fy * freq / H + 100, 4, 0.5, 2.0) * amp * erosion;
    }
    let minD = Infinity, nearestId = 0;
    for (let i = 0; i < cells.length; i++) {
      const dx = fx - cells[i].x, dy = fy - cells[i].y, d = dx * dx + dy * dy;
      if (d < minD) { minD = d; nearestId = cells[i].id; }
    }
    return nearestId;
  },

  // ── THE FIELD FUNCTION ──
  render(canvas, ctx, W, H, params, palette) {
    const { seed, erosion, fold, frequency, amplitude } = params;
    const cx = W / 2, cy = H / 2;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const noise = new SimplexNoise(seed);
    const cells = this._buildStructure(W, H, params);
    const palLen = palette.length;
    const twoPi = Math.PI * 2;
    const foldAngle = twoPi / fold;
    const ringHueShift = 30;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let nx = (px - cx) / (W / 2), ny = (py - cy) / (H / 2);

        // 1. Fold
        let angle = Math.atan2(ny, nx); if (angle < 0) angle += twoPi;
        const dist = Math.sqrt(nx * nx + ny * ny);
        const fa = angle % foldAngle, hf = foldAngle / 2;
        const ma = fa > hf ? foldAngle - fa : fa;
        const fx = cx + dist * Math.cos(ma) * (W / 2);
        const fy = cy + dist * Math.sin(ma) * (H / 2);

        // 2. Displace
        let ex = fx, ey = fy;
        if (erosion > 0.001) {
          ex = fx + noise.fbm(fx * frequency / W, fy * frequency / H, 4, 0.5, 2.0) * amplitude * erosion;
          ey = fy + noise.fbm(fx * frequency / W + 100, fy * frequency / H + 100, 4, 0.5, 2.0) * amplitude * erosion;
        }

        // 3. Address
        const addr = this._addressPoint(ex, ey, cells, seed);
        const cell = addr.cell;
        const ringT = cell.ringT, tau = addr.tension;

        // 4. Color — additive depth modulation preserves extreme palette values
        // (white stays white, black stays black regardless of ringT)
        const palIdx = Math.abs((cell.id * 7 + addr.subId * 13 + seed) % palLen);
        const palColor = palette[palIdx];
        const h = palColor.h + ringHueShift * (ringT - 0.5);
        const s = Math.max(0, palColor.s * (1 - 0.25 * tau));
        // Additive: ±18 lightness based on depth — preserves l=95 (white) and l=8 (near-black)
        const l = Math.min(97, Math.max(3, palColor.l + 18 * (0.5 - ringT)));

        // 5. Boundary
        let fh = h, fs = s, fl = l;
        if (px > 0 && py > 0 && px < W - 1 && py < H - 1) {
          const step = 2;
          const cr = this._quickCellId(px + step, py, cx, cy, W, H, foldAngle, cells, noise, frequency, amplitude, erosion);
          const cd = this._quickCellId(px, py + step, cx, cy, W, H, foldAngle, cells, noise, frequency, amplitude, erosion);
          if (cr !== cell.id || cd !== cell.id) {
            if (ringT > 0.7) { fh = 43; fs = 90; fl = 55; }
            else { fh = 0; fs = 0; fl = 8; }
          }
        }

        const [r, g, b] = hsl2rgb(fh, fs, fl);
        const idx = (py * W + px) * 4;
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255; // always opaque
      }
    }

    ctx.putImageData(imgData, 0, 0);
    // No post-processing overlay — preserve exact palette tones
    return { cellCount: cells.length };
  },
};

// Register
MethodRegistry.register(MuqarnasMethod);
