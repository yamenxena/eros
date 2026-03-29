/* ═══════════════════════════════════════════════════════════════
   Eros — Method: Sakkal Star Vault
   Mamoun Sakkal's Muqarnas Block Taxonomy rendered as a 2D plan.
   Concentric star polygons star(n, m) with inter-tier rotation,
   modular block families derived from base angle θ.

   Source: Analysis/Mukarnas/muqarnas-generative-heuristics.md §2
   ═══════════════════════════════════════════════════════════════ */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'sakkal',
    name: 'Sakkal Star Vault',
    category: 'muqarnas',
    version: '1.0.0',
    description: 'Star polygon tessellation star(n,m) with concentric tiers and inter-tier angular rotation. Renders the 2D planimetric projection of a classical muqarnas vault.',

    palettes: [
      {
        name: 'Isfahan Turquoise', mood: 'Persian Mosque',
        colors: [
          { h: 180, s: 65, l: 45 }, { h: 195, s: 55, l: 55 },
          { h: 43,  s: 85, l: 55 }, { h: 210, s: 50, l: 35 },
          { h: 0,   s: 0,  l: 95 },
        ]
      },
      {
        name: 'Zellige Earth', mood: 'Moroccan Ceramic',
        colors: [
          { h: 25,  s: 70, l: 45 }, { h: 15,  s: 55, l: 55 },
          { h: 140, s: 40, l: 35 }, { h: 43,  s: 80, l: 50 },
          { h: 0,   s: 0,  l: 10 },
        ]
      },
      {
        name: 'Samarkand Gold', mood: 'Silk Road Splendor',
        colors: [
          { h: 43,  s: 90, l: 55 }, { h: 30,  s: 75, l: 40 },
          { h: 215, s: 65, l: 40 }, { h: 160, s: 50, l: 35 },
          { h: 350, s: 60, l: 40 },
        ]
      },
      {
        name: 'Midnight Geometry', mood: 'Cosmic Tessellation',
        colors: [
          { h: 230, s: 40, l: 15 }, { h: 210, s: 55, l: 30 },
          { h: 43,  s: 75, l: 50 }, { h: 280, s: 35, l: 25 },
          { h: 195, s: 50, l: 45 },
        ]
      }
    ],

    params: [
      { key: 'seed',         type: 'number', label: 'Seed',              default: 42,    min: 1,     max: 999999 },
      { key: 'starN',        type: 'range',  label: 'Star Points (n)',   default: 8,     min: 4,     max: 20,    precision: 0 },
      { key: 'starM',        type: 'range',  label: 'Star Skip (m)',     default: 3,     min: 1,     max: 8,     precision: 0 },
      { key: 'tiers',        type: 'range',  label: 'Concentric Tiers',  default: 8,     min: 3,     max: 20,    precision: 0 },
      { key: 'tierRotation', type: 'range',  label: 'Tier Rotation (°)', default: 22.5,  min: 0,     max: 45,    precision: 1 },
      { key: 'blockDetail',  type: 'range',  label: 'Block Density',     default: 3,     min: 1,     max: 6,     precision: 0 },
      { key: 'lineWeight',   type: 'range',  label: 'Khat Weight',       default: 1.2,   min: 0.3,   max: 4.0,   precision: 1 },
      { key: 'fillOpacity',  type: 'range',  label: 'Fill Opacity',      default: 0.7,   min: 0.1,   max: 1.0,   precision: 2 },
    ],

    narrative(p) {
      return `A star(${p.starN}, ${p.starM}) vault plan with ${p.tiers} concentric tiers, each rotated ${p.tierRotation}° ` +
        `from its predecessor. Block density ${p.blockDetail} fills inter-tier zones with modular geometric primitives.`;
    },

    equation(p) {
      return `star(${p.starN}, ${p.starM})\n` +
             `α = (2π·${p.starM}) / ${p.starN}\n` +
             `θ_tier(k) = θ_tier(k-1) + ${p.tierRotation}°\n` +
             `z(x,y) = H - tier(x,y)·Δh`;
    },

    render(canvas, ctx, W, H, params, palette) {
      const startT = performance.now();
      const prng = new PRNG(params.seed);
      const cx = W / 2, cy = H / 2;
      const maxR = Math.min(W, H) * 0.46;

      // Background
      const bg = palette[palette.length - 1];
      ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
      ctx.fillRect(0, 0, W, H);

      // Generate all tier star polygons
      const tiers = [];
      const n = params.starN;
      const m = Math.min(params.starM, Math.floor(n / 2));
      const tierCount = params.tiers;

      for (let t = 0; t < tierCount; t++) {
        const tierT = t / Math.max(tierCount - 1, 1);
        const r = maxR * (1 - tierT * 0.9);
        const rotation = t * (params.tierRotation * Math.PI / 180);
        const innerRatio = Math.max(0.25, Math.cos(Math.PI * m / n));

        const outerVerts = [];
        const innerVerts = [];
        const allVerts = [];

        for (let i = 0; i < n; i++) {
          const angle = (2 * Math.PI * i / n) + rotation;
          const outerR = r;
          const innerR = r * innerRatio;

          outerVerts.push({ x: cx + outerR * Math.cos(angle), y: cy + outerR * Math.sin(angle) });
          innerVerts.push({ x: cx + innerR * Math.cos(angle), y: cy + innerR * Math.sin(angle) });

          // Interleaved for full star polygon
          allVerts.push({ x: cx + outerR * Math.cos(angle), y: cy + outerR * Math.sin(angle) });
          const midAngle = angle + Math.PI / n;
          allVerts.push({ x: cx + innerR * Math.cos(midAngle), y: cy + innerR * Math.sin(midAngle) });
        }

        tiers.push({ tier: t, tierT, radius: r, outerVerts, innerVerts, allVerts, rotation });
      }

      // Render inter-tier mosaic blocks
      const palLen = palette.length;
      let blockCount = 0;

      for (let t = 0; t < tiers.length - 1; t++) {
        const outer = tiers[t];
        const inner = tiers[t + 1];

        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;

          // Build a quadrilateral between adjacent tier vertices
          const v0 = outer.allVerts[i * 2];
          const v1 = outer.allVerts[i * 2 + 1];
          const v2 = outer.allVerts[j * 2];

          // Map to inner tier
          const innerIdx = i % inner.allVerts.length;
          const innerIdxNext = (i + 1) % inner.allVerts.length;
          const u0 = inner.allVerts[innerIdx];
          const u1 = inner.allVerts[innerIdxNext];

          // Sub-divide the inter-tier zone into block primitives
          for (let bd = 0; bd < params.blockDetail; bd++) {
            const t0 = bd / params.blockDetail;
            const t1 = (bd + 1) / params.blockDetail;

            const p0 = this._lerp2(v0, u0, t0);
            const p1 = this._lerp2(v2, u1, t0);
            const p2 = this._lerp2(v2, u1, t1);
            const p3 = this._lerp2(v0, u0, t1);

            const colIdx = (t * 7 + i * 3 + bd * 11 + params.seed) % palLen;
            const col = palette[colIdx];

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();

            ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${params.fillOpacity})`;
            ctx.fill();

            ctx.strokeStyle = `hsla(${col.h}, ${Math.max(0, col.s - 20)}%, ${Math.max(5, col.l - 30)}%, 0.6)`;
            ctx.lineWidth = params.lineWeight * 0.5;
            ctx.stroke();
            blockCount++;
          }
        }
      }

      // Draw star skeleton overlays (the Kanon grid)
      ctx.lineWidth = params.lineWeight;
      for (const tier of tiers) {
        const col = palette[tier.tier % palLen];
        ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${Math.min(90, col.l + 20)}%, 0.7)`;

        // Star polygon: connect every m-th vertex
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const from = tier.outerVerts[i];
          const to = tier.outerVerts[(i + m) % n];
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
        }
        ctx.stroke();

        // Outer ring
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const v = tier.outerVerts[i % n];
          if (i === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Central rosette
      const centerR = tiers[tiers.length - 1]?.radius || maxR * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(3, centerR * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${palette[0].h}, ${palette[0].s}%, ${palette[0].l}%)`;
      ctx.fill();

      return { blocks: blockCount, tiers: tierCount, perf: `${(performance.now() - startT).toFixed(0)}ms` };
    },

    _lerp2(a, b, t) {
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  });
}
