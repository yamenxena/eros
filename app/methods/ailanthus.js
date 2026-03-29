/**
 * Ailanthus Bark: Cellular Growth Simulator (2D)
 * Simulates localized expansion of spongy parenchyma (lenticels) pushing 
 * through dead suberin (bark substrate), resulting in diamond reticulations.
 */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'ailanthus',
    name: 'Ailanthus Bark (2D)',
    type: '2d',
    description: 'Cellular growth simulation of Ailanthus altissima bark pattern.',
    parameters: [
      { key: 'growthTimeline',  type: 'range',   label: 'Growth Timeline',  default: 0.6,   min: 0.0, max: 1.0, precision: 2, category: 'Physics' },
      { key: 'cellularDensity', type: 'range',   label: 'Cell Density',     default: 40,    min: 10,  max: 100, precision: 0, category: 'Physics' },
      { key: 'anisotropy',      type: 'range',   label: 'Anisotropy',       default: 2.2,   min: 1.0, max: 4.0, precision: 2, category: 'Physics' },
      { key: 'ageGradient',     type: 'boolean', label: 'Age Gradient',     default: true,  category: 'Physics' },
      { key: 'noiseImpact',     type: 'range',   label: 'Biological Noise', default: 0.5,   min: 0.0, max: 1.0, precision: 2, category: 'Physics' },
      
      { key: 'paletteMode',     type: 'select',  label: 'Color Theme',      default: 'Ailanthus Nature', options: ['Ailanthus Nature', 'Palette Mapped'], category: 'Materials' }
    ],
    
    _seeds: null,
    _lastDensity: null,
    _lastW: null,
    _lastH: null,

    init(params, canvas, ctx) {
      if (typeof Prando === 'undefined') {
        console.error('Prando PRNG not found.');
      }
      if (typeof SimplexNoise === 'undefined' && typeof noise !== 'undefined') {
          // ensure Simplex is available globally or we use Math.random fallback for noise later
      }
      this.generateSeeds(params, canvas.width, canvas.height);
    },

    generateSeeds(params, w, h) {
      this._seeds = [];
      const prng = new Prando('ailanthus-growth');
      
      const cols = params.cellularDensity;
      const rows = Math.floor(cols * (h / w));
      const cellW = w / cols;
      const cellH = h / rows;

      // Jittered grid to simulate biological cell placement
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          const cx = (x * cellW) + (prng.next() - 0.5) * cellW * 0.8;
          const cy = (y * cellH) + (prng.next() - 0.5) * cellH * 0.8;
          
          this._seeds.push({
            x: cx,
            y: cy,
            baseRadius: (Math.min(cellW, cellH) * 0.5) * (0.8 + prng.next() * 0.4),
            noiseOffset: prng.next() * 1000
          });
        }
      }
      this._lastDensity = params.cellularDensity;
      this._lastW = w;
      this._lastH = h;
    },

    render(params, canvas, ctx) {
      if (!this._seeds || params.cellularDensity !== this._lastDensity || canvas.width !== this._lastW || canvas.height !== this._lastH) {
        this.generateSeeds(params, canvas.width, canvas.height);
      }

      // ── Physical Colors ──
      const deepShadow = '#1B1E15';
      const charcoalOlive = '#2A2D24';
      const oliveGrey = '#6B6D5F';
      const paleAsh = '#D1D3C4';
      const highlightWhite = '#E8E9E4';

      let bg = deepShadow;
      let strokeCol = charcoalOlive;
      let fillBase = oliveGrey;
      let fillHighlight = paleAsh;

      if (params.paletteMode === 'Palette Mapped' && window.ErosState && ErosState.palette) {
          const c = ErosState.palette.colors;
          if (c.length >= 4) {
              bg = c[0];
              strokeCol = c[1];
              fillBase = c[2];
              fillHighlight = c[c.length-1];
          }
      }

      // 1. Dead Substrate Base (The Void)
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. We will draw each expanding active lenticel cluster
      const tl = params.growthTimeline; // 0.0 to 1.0

      ctx.save();
      // Use multiply mix or just normal drawing with soft shadows to simulate depth
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = params.noiseImpact * 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const simplex = typeof SimplexNoise !== 'undefined' ? new SimplexNoise('ailanthus') : null;

      for (const seed of this._seeds) {
          // Calculate localized growth timeline (Age Gradient)
          let localTl = tl;
          if (params.ageGradient) {
              // Top of canvas is younger (tl * 0.2), bottom is older (tl * 1.5)
              const ageFactor = 0.2 + (seed.y / canvas.height) * 1.3;
              localTl = Math.min(1.0, tl * ageFactor);
          }
          
          if (localTl <= 0.01) continue;

          // Anisotropic scale: horizontal stretch makes vertical diamond gaps
          const rx = seed.baseRadius * localTl * params.anisotropy * 1.2;
          const ry = seed.baseRadius * localTl * 1.2;

          ctx.beginPath();
          
          // Draw a biologically noisy elliptical cluster
          const segments = 16;
          for (let i = 0; i <= segments; i++) {
              const theta = (i / segments) * Math.PI * 2;
              
              let nDiag = 0;
              if (simplex && params.noiseImpact > 0) {
                  // Simplex noise evaluated at radial coordinates
                  const nx = seed.noiseOffset + Math.cos(theta) * 0.5;
                  const ny = seed.noiseOffset + Math.sin(theta) * 0.5;
                  nDiag = simplex.noise2D(nx, ny) * params.noiseImpact * 0.3; // +-30% variation
              } else if (params.noiseImpact > 0) {
                  nDiag = (Math.random() - 0.5) * params.noiseImpact * 0.5; // fallback
              }

              const rFactor = 1.0 + nDiag;
              const px = seed.x + Math.cos(theta) * rx * rFactor;
              const py = seed.y + Math.sin(theta) * ry * rFactor;

              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
          }
          ctx.closePath();

          // Fill: the "islands" are filled with OliveGrey base, bordered heavily by PaleAsh callus
          // We can use a radial gradient to simulate the soft callus edge, or draw it twice.
          const rGrad = ctx.createRadialGradient(seed.x, seed.y, 0, seed.x, seed.y, Math.max(rx, ry));
          rGrad.addColorStop(0, fillBase);
          rGrad.addColorStop(Math.min(0.9, 1.0 - (params.noiseImpact * 0.2)), fillBase);
          rGrad.addColorStop(1, fillHighlight);

          ctx.fillStyle = rGrad;
          ctx.fill();
          
          // Inner detail stroke (gives it that chunky, torn, organic feel)
          ctx.lineWidth = 1 + params.noiseImpact * 2;
          ctx.strokeStyle = strokeCol;
          ctx.stroke();
      }

      ctx.restore();
    }
  });
}
