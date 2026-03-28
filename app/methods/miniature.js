/* ═══════════════════════════════════════════════════════════════
   Eros Method: Ottoman Miniature Field
   Hierarchical rectangular subdivision · flat color · no perspective
   Scale-by-importance · border tahrir · warm center
   M(x, y, t, seed) → (h, s, l, a)
   ═══════════════════════════════════════════════════════════════ */

const MiniatureMethod = {
  id: 'miniature',
  name: 'Ottoman Miniature',
  version: 1,
  description: 'Hierarchical rectangular subdivision with flat color and scale-by-importance',

  params: [
    { key: 'seed',       label: 'Seed',        type: 'number', min: 1,  max: 99999, default: 42 },
    { key: 'erosion',    label: 'Erosion',     type: 'range',  min: 0,  max: 100,   default: 0,  scale: 0.01, precision: 2 },
    { key: 'depth',      label: 'Hierarchy',   type: 'range',  min: 2,  max: 8,     default: 5 },
    { key: 'borderWeight', label: 'Border',    type: 'range',  min: 1,  max: 8,     default: 3 },
    { key: 'scaleRatio', label: 'Scale Ratio', type: 'range',  min: 20, max: 80,    default: 40, scale: 0.01, precision: 2 },
    { key: 'frequency',  label: 'Frequency',   type: 'range',  min: 50, max: 500,   default: 150, scale: 0.01, precision: 1 },
    { key: 'amplitude',  label: 'Amplitude',   type: 'range',  min: 0,  max: 150,   default: 40 },
  ],

  palettes: [
    {
      name: 'Surname-i Hümayun', mood: 'Imperial festival',
      colors: [
        { h: 5,   s: 80, l: 48 }, // vermillion
        { h: 43,  s: 88, l: 52 }, // gold
        { h: 155, s: 55, l: 38 }, // malachite
        { h: 225, s: 70, l: 40 }, // lapis
        { h: 30,  s: 70, l: 55 }, // saffron
        { h: 0,   s: 0,  l: 95 }, // parchment
      ]
    },
    {
      name: 'Matrakçı Nasuh', mood: 'Topographic clarity',
      colors: [
        { h: 120, s: 45, l: 40 }, // land green
        { h: 200, s: 55, l: 50 }, // water blue
        { h: 35,  s: 65, l: 55 }, // earth ochre
        { h: 5,   s: 70, l: 45 }, // roof terracotta
        { h: 0,   s: 0,  l: 90 }, // sky/parchment
      ]
    },
    {
      name: 'Levni', mood: 'Tulip-era elegance',
      colors: [
        { h: 340, s: 65, l: 50 }, // tulip rose
        { h: 280, s: 40, l: 40 }, // amethyst
        { h: 45,  s: 80, l: 55 }, // gold
        { h: 170, s: 50, l: 42 }, // jade
        { h: 15,  s: 60, l: 50 }, // coral
        { h: 0,   s: 0,  l: 8  }, // ink
      ]
    },
    {
      name: 'Siyer-i Nebi', mood: 'Prophetic narrative',
      colors: [
        { h: 45,  s: 85, l: 55 }, // divine gold
        { h: 155, s: 60, l: 38 }, // paradise green
        { h: 215, s: 60, l: 42 }, // heaven blue
        { h: 0,   s: 0,  l: 95 }, // cloud white
        { h: 350, s: 50, l: 35 }, // earth burgundy
      ]
    },
    {
      name: 'Topkapı Leaf', mood: 'Manuscript gold',
      colors: [
        { h: 43,  s: 90, l: 50 }, // burnished gold
        { h: 35,  s: 75, l: 45 }, // aged gold
        { h: 20,  s: 60, l: 35 }, // umber
        { h: 0,   s: 0,  l: 12 }, // ink black
        { h: 0,   s: 0,  l: 90 }, // vellum
      ]
    },
    {
      name: 'Harem Garden', mood: 'Secret bloom',
      colors: [
        { h: 340, s: 70, l: 50 }, // rose
        { h: 120, s: 50, l: 38 }, // garden green
        { h: 275, s: 45, l: 40 }, // wisteria
        { h: 45,  s: 80, l: 55 }, // sunlight gold
        { h: 15,  s: 65, l: 48 }, // pomegranate
      ]
    },
  ],

  narrative(p) {
    const erosionWord = p.erosion < 0.15 ? 'pristine, freshly illuminated' :
      p.erosion < 0.4 ? 'gently aged, like a handled manuscript' :
      p.erosion < 0.7 ? 'weathered, pigments bleeding at the margins' :
      'dissolved into memory, ink returning to water';
    return `A hierarchical composition of ${p.depth} registers, each subdivided by importance. ` +
      `The structure is ${erosionWord} (t=${p.erosion.toFixed(2)}). ` +
      `Borders: ${p.borderWeight}px tahrir. Scale ratio: ${(p.scaleRatio).toFixed(0)}%. ` +
      `Flat color fills — no perspective, no gradient — the miniature sees all planes equally.`;
  },

  equation(p) {
    return `M(x, y, t=${p.erosion.toFixed(2)}, seed=${p.seed})\n\n` +
      `1. P_margin = inset(P, ${(p.marginRatio).toFixed(2)})\n` +
      `2. P_erode  = P + ${p.erosion.toFixed(2)} · A · fbm(P, ${p.seed})\n` +
      `3. (depth_d, cell_c, edge_e) = partition(P_erode, depth=${p.depth})\n` +
      `4. importance = 1 − d / ${p.depth}\n` +
      `5. h = palette[hash(c)].h + 20·importance\n` +
      `6. s = palette[...].s · (1 − 0.2·edge)\n` +
      `7. l = 20 + 55·importance · (1 + 0.15·t)\n` +
      `8. border (|Δc| > 0) → ink or gold`;
  },

  // ── Internal: build recursive partition tree ──

  _buildPartitions(x, y, w, h, depth, maxDepth, seed) {
    const rng = new PRNG(seed);
    const partitions = [];
    let counter = 0; // unique per-partition counter

    const subdivide = (rx, ry, rw, rh, d) => {
      const importance = 1 - d / maxDepth;

      if (d >= maxDepth || rw < 4 || rh < 4) {
        partitions.push({ x: rx, y: ry, w: rw, h: rh, depth: d, uid: counter++, importance });
        return;
      }

      // Decide split direction by aspect ratio + seeded noise
      const splitH = rng.next() > 0.5 ? (rw > rh) : (rh >= rw);
      const bias = 0.3 + 0.4 * rng.next(); // 30–70% split

      if (splitH) {
        const splitY = ry + Math.floor(rh * bias);
        subdivide(rx, ry,      rw, splitY - ry,       d + 1);
        subdivide(rx, splitY,  rw, ry + rh - splitY,  d + 1);
      } else {
        const splitX = rx + Math.floor(rw * bias);
        subdivide(rx,      ry, splitX - rx,       rh, d + 1);
        subdivide(splitX,  ry, rx + rw - splitX,  rh, d + 1);
      }
    };

    subdivide(x, y, w, h, 0);
    return partitions;
  },

  // ── THE FIELD FUNCTION ──
  render(canvas, ctx, W, H, params, palette) {
    const { seed, erosion, depth, borderWeight, frequency, amplitude } = params;
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const noise = new SimplexNoise(seed);
    const palLen = palette.length;

    // Full canvas — no margin
    const partitions = this._buildPartitions(0, 0, W, H, depth, depth, seed);

    // Pre-compute: each partition gets its palette colour
    const partColors = partitions.map((p) => {
      const uidHash = ((p.uid * 2654435761) >>> 0);
      const depthShift = Math.round(p.depth * palLen / Math.max(depth, 1));
      const palIdx = (uidHash + depthShift + seed) % palLen;
      return { ...p, palIdx, baseH: palette[palIdx].h, baseS: palette[palIdx].s, baseL: palette[palIdx].l };
    });

    // Pixel loop
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const idx = (py * W + px) * 4;

        // Apply erosion displacement
        let ex = px, ey = py;
        if (erosion > 0.001) {
          ex = px + noise.fbm(px * frequency / W, py * frequency / H, 4, 0.5, 2.0) * amplitude * erosion;
          ey = py + noise.fbm(px * frequency / W + 100, py * frequency / H + 100, 4, 0.5, 2.0) * amplitude * erosion;
        }

        // Find partition at (ex, ey)
        let foundPart = null;
        for (let i = partColors.length - 1; i >= 0; i--) {
          const p = partColors[i];
          if (ex >= p.x && ex < p.x + p.w && ey >= p.y && ey < p.y + p.h) {
            foundPart = p; break;
          }
        }

        if (!foundPart) {
          // Outside all partitions (can happen with high erosion displacement)
          const [r, g, b] = hsl2rgb(0, 0, 10);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
          continue;
        }

        // Distance to nearest partition edge (for border detection)
        const distToEdge = Math.min(
          ex - foundPart.x, foundPart.x + foundPart.w - ex,
          ey - foundPart.y, foundPart.y + foundPart.h - ey
        );

        const importance = foundPart.importance;

        // Additive depth modulation: ±12 based on importance
        // Preserves extreme values: white (l=95) stays 83–97, dark (l=8) stays 2–20
        const h = foundPart.baseH + 10 * (importance - 0.5);
        const s = Math.max(0, foundPart.baseS * (0.88 + 0.22 * importance));
        const l = Math.min(97, Math.max(3, foundPart.baseL + 12 * (importance - 0.5)));

        // Border detection
        let fh = h, fs = s, fl = l;
        if (distToEdge < borderWeight) {
          if (importance > 0.6) {
            fh = 43; fs = 85; fl = 50; // Gold ink
          } else {
            fh = 0; fs = 0; fl = 10; // Carbon ink
          }
        }

        const [r, g, b] = hsl2rgb(fh, fs, fl);
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    // No post-processing — preserve exact palette tones on canvas
    return { partitionCount: partitions.length };
  },
};

// Register
MethodRegistry.register(MiniatureMethod);
