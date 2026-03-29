/* ═══════════════════════════════════════════════════════════════
   Eros v5 — Method: Hansmeyer Subdivision
   Modified Catmull-Clark selective subdivision with asymmetric
   weighting on a 2D quad mesh. Deterministic. No randomness.
   Pure iterative geometric rules creating muqarnas-grade
   complexity from a single bounding quad.

   Source: Analysis/Mukarnas/muqarnas-generative-heuristics.md §1
   ═══════════════════════════════════════════════════════════════ */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'hansmeyer',
    name: 'Hansmeyer Subdivision',
    category: 'muqarnas',
    version: '1.0.0',
    description: 'Deterministic modified Catmull-Clark selective subdivision. Asymmetric weights mutate a single bounding quad into thousands of articulated muqarnas tiles.',

    palettes: [
      {
        name: 'Carved Limestone', mood: 'Ancient Vault',
        colors: [
          { h: 38,  s: 35, l: 75 },  // Warm sandstone
          { h: 30,  s: 25, l: 60 },  // Aged mortar
          { h: 25,  s: 20, l: 45 },  // Deep shadow
          { h: 42,  s: 40, l: 85 },  // Highlight limestone
          { h: 20,  s: 15, l: 30 },  // Crevice darkness
        ]
      },
      {
        name: 'Alhambra Gold', mood: 'Nasrid Dynasty',
        colors: [
          { h: 43,  s: 90, l: 55 },  // Burnished gold
          { h: 15,  s: 75, l: 40 },  // Terracotta
          { h: 200, s: 60, l: 35 },  // Andalusian blue
          { h: 0,   s: 0,  l: 95 },  // Plaster white
          { h: 355, s: 65, l: 45 },  // Pomegranate
        ]
      },
      {
        name: 'Algorithmic Concrete', mood: 'Digital Fabrication',
        colors: [
          { h: 0,   s: 0,  l: 88 },  // Light concrete
          { h: 0,   s: 0,  l: 65 },  // Medium grey
          { h: 0,   s: 0,  l: 40 },  // Dark grey
          { h: 0,   s: 0,  l: 20 },  // Near black
          { h: 210, s: 15, l: 50 },  // Cool steel hint
        ]
      },
      {
        name: 'Oxidised Copper', mood: 'Patina',
        colors: [
          { h: 165, s: 55, l: 45 },  // Verdigris
          { h: 160, s: 40, l: 60 },  // Pale patina
          { h: 25,  s: 70, l: 45 },  // Raw copper
          { h: 15,  s: 50, l: 30 },  // Dark oxide
          { h: 170, s: 30, l: 75 },  // Mint frost
        ]
      }
    ],

    params: [
      { key: 'seed',            type: 'number', label: 'Hash Seed',             default: 42,    min: 1,     max: 999999 },
      { key: 'subdivisions',    type: 'range',  label: 'Subdivision Depth',     default: 4,     min: 1,     max: 7,     precision: 0 },
      { key: 'selectiveThresh', type: 'range',  label: 'Selective Threshold',   default: 0.02,  min: 0.001, max: 0.15,  precision: 3 },
      { key: 'weightBias',      type: 'range',  label: 'Weight Asymmetry',      default: 0.35,  min: 0.05,  max: 0.48,  precision: 2 },
      { key: 'tierRotation',    type: 'range',  label: 'Tier Rotation (°)',     default: 15,    min: 0,     max: 45,    precision: 1 },
      { key: 'starPoints',      type: 'range',  label: 'Star Polygon (n)',      default: 8,     min: 4,     max: 16,    precision: 0 },
      { key: 'starSkip',        type: 'range',  label: 'Star Skip (m)',         default: 3,     min: 1,     max: 7,     precision: 0 },
      { key: 'concentricTiers', type: 'range',  label: 'Concentric Tiers',      default: 5,     min: 2,     max: 12,    precision: 0 },
      { key: 'lineWeight',      type: 'range',  label: 'Line Weight',           default: 0.8,   min: 0.2,   max: 3.0,   precision: 1 },
    ],

    narrative(p) {
      return `A ${p.starPoints}-pointed star polygon (skip ${p.starSkip}) is inscribed across ${p.concentricTiers} concentric tiers. ` +
        `Each quad face undergoes Modified Catmull-Clark subdivision to depth ${p.subdivisions} with ` +
        `asymmetric weight bias w=${p.weightBias}. Selective threshold=${p.selectiveThresh} suppresses ` +
        `subdivision of small tiles, creating the tiered resolution gradient of classical muqarnas.`;
    },

    equation(p) {
      return `Face:   F = (1/k) Σ V_i\n` +
             `Edge:   E = w₁V₁ + w₂V₂ + w₃F₁ + w₄F₂  (w_bias=${p.weightBias})\n` +
             `Vertex: V' = (Q + 2R + (n-3)V) / n\n` +
             `Select: subdivide iff area(face) > ${p.selectiveThresh}\n` +
             `Star:   star(${p.starPoints}, ${p.starSkip}), tiers=${p.concentricTiers}`;
    },

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════
    render(canvas, ctx, W, H, params, palette) {
      const startT = performance.now();
      const prng = new PRNG(params.seed);

      // 1. Background
      const bg = palette[palette.length - 1];
      ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.min(W, H) * 0.46;

      // 2. Generate the concentric star-tier skeleton
      const tiers = this._generateStarTiers(cx, cy, maxR, params);

      // 3. Build quad faces between consecutive tiers
      let allQuads = this._buildInterTierQuads(tiers, params);

      // 4. Recursive selective subdivision (Modified Catmull-Clark 2D)
      for (let d = 0; d < params.subdivisions; d++) {
        const nextQuads = [];
        const areaThreshold = params.selectiveThresh * (W * H) * Math.pow(0.5, d);
        for (const quad of allQuads) {
          const a = this._quadArea(quad);
          if (a > areaThreshold) {
            nextQuads.push(...this._subdivideQuad(quad, params.weightBias, prng));
          } else {
            nextQuads.push(quad);
          }
        }
        allQuads = nextQuads;
      }

      // 5. Render each quad tile
      const palLen = Math.max(1, palette.length - 1);
      ctx.lineWidth = params.lineWeight;
      ctx.lineJoin = 'miter';

      for (let i = 0; i < allQuads.length; i++) {
        const quad = allQuads[i];
        const area = this._quadArea(quad);
        
        // Depth-based coloring: smaller tiles = deeper in the vault = darker
        const depthT = Math.min(1, area / (params.selectiveThresh * W * H * 0.5));
        const palIdx = Math.floor(depthT * palLen);
        const col = palette[Math.min(palIdx, palLen - 1)];

        // Subtle hue shift per tile for visual richness
        const hShift = ((i * 7) % 30) - 15;
        const lShift = ((i * 13) % 20) - 10;

        ctx.beginPath();
        ctx.moveTo(quad[0].x, quad[0].y);
        ctx.lineTo(quad[1].x, quad[1].y);
        ctx.lineTo(quad[2].x, quad[2].y);
        ctx.lineTo(quad[3].x, quad[3].y);
        ctx.closePath();

        const h = col.h + hShift;
        const s = col.s;
        const l = Math.max(5, Math.min(95, col.l + lShift * 0.3));

        ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
        ctx.fill();

        // Architectural stroke (the vault grid lines)
        ctx.strokeStyle = `hsla(${bg.h}, ${bg.s * 0.3}%, ${Math.min(95, bg.l + 20)}%, 0.4)`;
        ctx.stroke();
      }

      // 6. Draw star skeleton overlay (the Kanon)
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = `hsl(${palette[0].h}, ${palette[0].s}%, ${Math.min(90, palette[0].l + 30)}%)`;
      ctx.lineWidth = 0.5;
      for (const tier of tiers) {
        ctx.beginPath();
        for (let i = 0; i < tier.vertices.length; i++) {
          const v = tier.vertices[i];
          if (i === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      const elapsed = performance.now() - startT;
      return {
        totalTiles: allQuads.length,
        tiers: tiers.length,
        perf: `${elapsed.toFixed(0)}ms`,
        renderMode: 'Hansmeyer Selective Subdivision'
      };
    },

    // ═══════════════════════════════════════════════════════════════
    // SAKKAL STAR TIER GENERATOR
    // ═══════════════════════════════════════════════════════════════
    // star(n, m) = connect every m-th vertex of an n-gon
    // θ_tier(k) = θ_tier(k-1) + tierRotation
    _generateStarTiers(cx, cy, maxR, params) {
      const { starPoints, starSkip, concentricTiers, tierRotation } = params;
      const n = starPoints * 2;  // Double for inner/outer star vertices
      const tiers = [];

      for (let t = 0; t < concentricTiers; t++) {
        const tierT = t / Math.max(concentricTiers - 1, 1);
        const r = maxR * (1 - tierT * 0.85); // Don't collapse to zero
        const rotation = t * (tierRotation * Math.PI / 180);
        const vertices = [];

        for (let i = 0; i < n; i++) {
          const isOuter = (i % 2 === 0);
          const innerRatio = Math.cos(Math.PI * starSkip / starPoints);
          const radius = isOuter ? r : r * Math.max(0.2, innerRatio);
          const angle = (2 * Math.PI * i / n) + rotation;

          vertices.push({
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
          });
        }
        tiers.push({ tier: t, vertices, radius: r, tierT });
      }

      // Add center point as a degenerate tier
      tiers.push({
        tier: concentricTiers,
        vertices: [{ x: cx, y: cy }],
        radius: 0,
        tierT: 1.0
      });

      return tiers;
    },

    // ═══════════════════════════════════════════════════════════════
    // BUILD INTER-TIER QUAD FACES
    // ═══════════════════════════════════════════════════════════════
    _buildInterTierQuads(tiers, params) {
      const quads = [];

      for (let t = 0; t < tiers.length - 1; t++) {
        const outer = tiers[t].vertices;
        const inner = tiers[t + 1].vertices;

        if (inner.length === 1) {
          // Final tier: create triangles (degenerate quads) to center
          const center = inner[0];
          for (let i = 0; i < outer.length; i++) {
            const j = (i + 1) % outer.length;
            // Degenerate quad (triangle): two corners share center
            quads.push([outer[i], outer[j], center, center]);
          }
        } else {
          // Map outer vertices to inner vertices
          const outerN = outer.length;
          const innerN = inner.length;

          for (let i = 0; i < outerN; i++) {
            const j = (i + 1) % outerN;
            // Map to inner tier (may have different vertex count)
            const iInner = Math.floor((i / outerN) * innerN);
            const jInner = Math.floor((j / outerN) * innerN);

            if (iInner === jInner) {
              // Triangle (degenerate quad)
              quads.push([outer[i], outer[j], inner[jInner], inner[iInner]]);
            } else {
              // True quad
              quads.push([outer[i], outer[j], inner[jInner], inner[iInner]]);
            }
          }
        }
      }

      return quads;
    },

    // ═══════════════════════════════════════════════════════════════
    // MODIFIED CATMULL-CLARK 2D SUBDIVISION (THE MUTATION)
    // ═══════════════════════════════════════════════════════════════
    // V' = (Q + 2R + (n-3)V) / n
    // E  = w₁·V₁ + w₂·V₂ + w₃·F₁ + w₄·F₂  (asymmetric!)
    _subdivideQuad(quad, weightBias, prng) {
      // quad = [v0, v1, v2, v3] (four 2D points)

      // Face Point: centroid
      const face = {
        x: (quad[0].x + quad[1].x + quad[2].x + quad[3].x) / 4,
        y: (quad[0].y + quad[1].y + quad[2].y + quad[3].y) / 4
      };

      // Edge midpoints with ASYMMETRIC weighting (Hansmeyer's mutation)
      // Instead of 0.5/0.5, we bias toward one vertex
      const w1 = 0.5 + weightBias;
      const w2 = 0.5 - weightBias;

      const edgeMids = [];
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        // Alternate bias direction per edge for chaotic articulation
        const useForward = (i % 2 === 0);
        const wa = useForward ? w1 : w2;
        const wb = useForward ? w2 : w1;

        // Blended edge point: influenced by face point (Catmull-Clark style)
        const ex = wa * quad[i].x + wb * quad[j].x;
        const ey = wa * quad[i].y + wb * quad[j].y;

        // Mix in face point influence (canonical CC has 25% face influence)
        const faceInfluence = 0.15;
        edgeMids.push({
          x: ex * (1 - faceInfluence) + face.x * faceInfluence,
          y: ey * (1 - faceInfluence) + face.y * faceInfluence
        });
      }

      // Generate 4 child quads (one per original corner)
      return [
        [quad[0], edgeMids[0], face, edgeMids[3]],
        [edgeMids[0], quad[1], edgeMids[1], face],
        [face, edgeMids[1], quad[2], edgeMids[2]],
        [edgeMids[3], face, edgeMids[2], quad[3]]
      ];
    },

    // ═══════════════════════════════════════════════════════════════
    // QUAD AREA (Shoelace Formula for 4-vertex polygon)
    // ═══════════════════════════════════════════════════════════════
    _quadArea(quad) {
      let area = 0;
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        area += quad[i].x * quad[j].y;
        area -= quad[j].x * quad[i].y;
      }
      return Math.abs(area) / 2;
    }
  });
}
