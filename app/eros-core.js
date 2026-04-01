/* ═══════════════════════════════════════════════════════════════
   Eros v4 — Engine Core (The Loom)
   Shared utilities + MethodRegistry + ErosEngine shell.
   The engine is constant. The method is interchangeable.
   ═══════════════════════════════════════════════════════════════ */

// ── PRNG (Mulberry32 — replaces weak MINSTD LCG) ─────────────
class PRNG {
  constructor(seed = 42) { this.state = seed | 0; }
  next() {
    this.state |= 0;
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + this.next() * (b - a); }
  hash(x) { let h = (x * 2654435761) >>> 0; h ^= h >> 16; h = (h * 2246822519) >>> 0; h ^= h >> 13; return h / 4294967295; }
}

// ── Simplex Noise 2D ──────────────────────────────────────────
class SimplexNoise {
  constructor(seed = 42) {
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = seed | 0 || 1;
    for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  noise2(x, y) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0), G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const grad = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    const s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2, x0 = x - (i - t), y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const gi0 = this.perm[ii + this.perm[jj]] % 8;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 8;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 8;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0*x0 - y0*y0; if (t0 > 0) { t0 *= t0; n0 = t0*t0*(grad[gi0][0]*x0+grad[gi0][1]*y0); }
    let t1 = 0.5 - x1*x1 - y1*y1; if (t1 > 0) { t1 *= t1; n1 = t1*t1*(grad[gi1][0]*x1+grad[gi1][1]*y1); }
    let t2 = 0.5 - x2*x2 - y2*y2; if (t2 > 0) { t2 *= t2; n2 = t2*t2*(grad[gi2][0]*x2+grad[gi2][1]*y2); }
    return 70 * (n0 + n1 + n2);
  }
  fbm(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let val = 0, amp = 1, freq = 1, maxAmp = 0;
    for (let i = 0; i < octaves; i++) {
      val += this.noise2(x * freq, y * freq) * amp;
      maxAmp += amp; amp *= persistence; freq *= lacunarity;
    }
    return val / maxAmp;
  }
}

// ── HSL ↔ RGB ─────────────────────────────────────────────────
function hsl2rgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  let r, g, b;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [(r + m) * 255 | 0, (g + m) * 255 | 0, (b + m) * 255 | 0];
}

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s * 100, l * 100];
}

// ── Spatial Hashing Grid (SSoT Mandate: O(1) Collisions) ──────
class SpatialHashGrid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.cells = new Map();
  }

  _hash(x, y) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return cy * this.cols + cx;
  }

  insert(agent) {
    const hash = this._hash(agent.x, agent.y);
    if (!this.cells.has(hash)) this.cells.set(hash, []);
    this.cells.get(hash).push(agent);
  }

  queryRadius(x, y, radius) {
    const found = [];
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cellRadius = Math.ceil(radius / this.cellSize);
    const sqRadius = radius * radius;

    for (let j = cy - cellRadius; j <= cy + cellRadius; j++) {
      for (let i = cx - cellRadius; i <= cx + cellRadius; i++) {
        if (i < 0 || i >= this.cols || j < 0 || j >= this.rows) continue;
        const hash = j * this.cols + i;
        const cell = this.cells.get(hash);
        if (cell) {
          for (const agent of cell) {
            const dx = agent.x - x;
            const dy = agent.y - y;
            if (dx * dx + dy * dy <= sqRadius) {
              found.push(agent);
            }
          }
        }
      }
    }
    return found;
  }

  clear() { this.cells.clear(); }
}

// ── Distance Metrics ──────────────────────────────────────────
function euclideanDist(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
function chebyshevDist(x1, y1, x2, y2) {
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
}
function manhattanDist(x1, y1, x2, y2) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// ── Geometry Primitives (Universal Pipeline Foundation) ───────
const Geometry = {
  /**
   * Cyrus-Beck line clipping against a convex polygon (CW winding).
   * Returns {x1,y1,x2,y2} of the clipped segment, or null.
   */
  clipLineToConvexPoly(lx1, ly1, lx2, ly2, verts) {
    let tEnter = 0, tLeave = 1;
    const dx = lx2 - lx1, dy = ly2 - ly1;
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const ex = verts[j].x - verts[i].x;
      const ey = verts[j].y - verts[i].y;
      // Outward normal for CW winding: rotate edge 90° CW
      const nx = ey, ny = -ex;
      const denom = nx * dx + ny * dy;
      const numer = nx * (lx1 - verts[i].x) + ny * (ly1 - verts[i].y);
      if (Math.abs(denom) < 1e-10) {
        if (numer > 0) return null; // outside and parallel
        continue;
      }
      const t = -numer / denom;
      if (denom < 0) { if (t > tEnter) tEnter = t; }
      else           { if (t < tLeave) tLeave = t; }
      if (tEnter > tLeave) return null;
    }
    if (tEnter > tLeave) return null;
    return {
      x1: lx1 + tEnter * dx, y1: ly1 + tEnter * dy,
      x2: lx1 + tLeave * dx, y2: ly1 + tLeave * dy
    };
  },

  /** Shoelace formula — returns unsigned area of polygon. */
  polygonArea(verts) {
    let area = 0;
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += verts[i].x * verts[j].y - verts[j].x * verts[i].y;
    }
    return Math.abs(area) / 2;
  },

  /** Ray-casting point-in-polygon test. */
  pointInPolygon(px, py, verts) {
    let inside = false;
    for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
      const xi = verts[i].x, yi = verts[i].y;
      const xj = verts[j].x, yj = verts[j].y;
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }
};

// ── Semantic Meaning Ingestion ────────────────────────────────
const SemanticMap = {
  data: {}, // Bound dynamically via drops
  
  // Ex: read('sentiment', 0.5) returns a mapped factor
  getFactor(key, fallback = 0.5) {
    return this.data[key] !== undefined ? this.data[key] : fallback;
  }
};

// ── Escher Shared Utilities ───────────────────────────────────
// Complex arithmetic — inline, no object allocation in hot paths
// All functions use (real, imag) pairs to avoid GC pressure.

function cMul(ar, ai, br, bi) {
  return [ar * br - ai * bi, ar * bi + ai * br];
}

function cDiv(ar, ai, br, bi) {
  const d = br * br + bi * bi + 1e-30; // ε guard: avoid div-by-zero
  return [(ar * br + ai * bi) / d, (ai * br - ar * bi) / d];
}

function cExp(r, i) {
  const e = Math.exp(r);
  return [e * Math.cos(i), e * Math.sin(i)];
}

function cLog(r, i) {
  return [Math.log(Math.sqrt(r * r + i * i) + 1e-30), Math.atan2(i, r)];
}

function cPow(zr, zi, ar, ai) {
  const lr = Math.log(Math.sqrt(zr * zr + zi * zi) + 1e-30);
  const li = Math.atan2(zi, zr);
  const mr = ar * lr - ai * li;
  const mi = ar * li + ai * lr;
  const e = Math.exp(mr);
  return [e * Math.cos(mi), e * Math.sin(mi)];
}

function cMobius(zr, zi, ar, ai, br, bi, cr, ci, dr, di) {
  // f(z) = (a·z + b) / (c·z + d)
  const nr = ar * zr - ai * zi + br;
  const ni = ar * zi + ai * zr + bi;
  const denr = cr * zr - ci * zi + dr;
  const deni = cr * zi + ci * zr + di;
  const dd = denr * denr + deni * deni + 1e-30;
  return [(nr * denr + ni * deni) / dd, (ni * denr - nr * deni) / dd];
}

// Affine transform helper — applies [a,b,c,d,tx,ty] matrix to point array
// Same convention as ctx.transform(a, b, c, d, e, f)
function affineTransformPt(px, py, m) {
  return { x: m[0] * px + m[2] * py + m[4], y: m[1] * px + m[3] * py + m[5] };
}
function affineTransformPts(points, m) {
  const out = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    out[i] = { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] };
  }
  return out;
}

// Build affine matrix helpers
function affineIdentity() { return [1, 0, 0, 1, 0, 0]; }
function affineTranslate(tx, ty) { return [1, 0, 0, 1, tx, ty]; }
function affineRotate(theta) {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [c, s, -s, c, 0, 0];
}
function affineReflect(axisAngle) {
  const c2 = Math.cos(2 * axisAngle), s2 = Math.sin(2 * axisAngle);
  return [c2, s2, s2, -c2, 0, 0];
}
function affineCompose(a, b) {
  // Result = A·B (apply B first, then A)
  return [
    a[0]*b[0] + a[2]*b[1], a[1]*b[0] + a[3]*b[1],
    a[0]*b[2] + a[2]*b[3], a[1]*b[2] + a[3]*b[3],
    a[0]*b[4] + a[2]*b[5] + a[4], a[1]*b[4] + a[3]*b[5] + a[5]
  ];
}

// Polygon batch renderer — single beginPath/fill for many polygons
// Dramatically faster than per-polygon fillStyle changes.
function fillPolygonBatch(ctx, polygons, fillStyle) {
  if (polygons.length === 0) return;
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  for (let i = 0; i < polygons.length; i++) {
    const poly = polygons[i];
    ctx.moveTo(poly[0].x | 0, poly[0].y | 0);
    for (let j = 1; j < poly.length; j++) ctx.lineTo(poly[j].x | 0, poly[j].y | 0);
    ctx.closePath();
  }
  ctx.fill();
}

function strokePolygonBatch(ctx, polygons, strokeStyle, lineWidth) {
  if (polygons.length === 0) return;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let i = 0; i < polygons.length; i++) {
    const poly = polygons[i];
    ctx.moveTo(poly[0].x | 0, poly[0].y | 0);
    for (let j = 1; j < poly.length; j++) ctx.lineTo(poly[j].x | 0, poly[j].y | 0);
    ctx.closePath();
  }
  ctx.stroke();
}

// Bézier edge deformation — generates deformed edge between p0 and p1
// amplitude: max deviation (clamped to 0.4 × edgeLength for safety)
// seed: deterministic seed for control point placement
// segments: number of interpolation steps (default 8)
function deformEdgeBezier(p0, p1, amplitude, seed, segments) {
  segments = segments || 8;
  const rng = new PRNG(seed);
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const maxAmp = len * 0.4; // safety clamp per §19.5
  const amp = Math.min(amplitude, maxAmp);
  // Normal direction (perpendicular to edge)
  const nx = -dy / (len + 1e-10), ny = dx / (len + 1e-10);
  // Two control points for cubic Bézier, placed at 1/3 and 2/3 along edge
  const c1x = p0.x + dx / 3 + nx * amp * (rng.next() * 2 - 1);
  const c1y = p0.y + dy / 3 + ny * amp * (rng.next() * 2 - 1);
  const c2x = p0.x + 2 * dx / 3 + nx * amp * (rng.next() * 2 - 1);
  const c2y = p0.y + 2 * dy / 3 + ny * amp * (rng.next() * 2 - 1);
  // Interpolate along cubic Bézier
  const pts = new Array(segments + 1);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    pts[i] = {
      x: u*u*u*p0.x + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*p1.x,
      y: u*u*u*p0.y + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*p1.y
    };
  }
  return pts;
}

// Reverse a deformed edge (for constraint pairs: rotation/glide-reflection)
function reverseEdge(edgePts) {
  const out = new Array(edgePts.length);
  for (let i = 0; i < edgePts.length; i++) out[i] = edgePts[edgePts.length - 1 - i];
  return out;
}

// Film grain — shared across all methods
// Applies subtle noise overlay to ImageData for analog texture.
function addFilmGrain(ctx, W, H, seed, intensity) {
  if (intensity <= 0) return;
  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;
  const rng = new PRNG(seed + 77777);
  const strength = intensity * 0.5; // scale to useful range
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * strength;
    data[i]     = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    // data[i+3] alpha unchanged — always 255
  }
  ctx.putImageData(imgData, 0, 0);
}

// ── Method Registry ───────────────────────────────────────────
const MethodRegistry = {
  _methods: {},

  register(method) {
    if (!method.id || !method.render || !method.params) {
      throw new Error(`Method missing required fields: id, render, params`);
    }
    this._methods[method.id] = method;
  },

  get(id) { return this._methods[id] || null; },
  list() { return Object.values(this._methods); },
  ids() { return Object.keys(this._methods); },
};

// ── Eros Engine (The Loom) ────────────────────────────────────
const ErosEngine = {
  canvas: null, ctx: null, W: 0, H: 0,
  canvas3D: null, renderer3D: null, scene3D: null, camera3D: null, controls3D: null,
  perspCamera: null, orthoCamera: null,
  composer: null, ssaoPass: null, hqRender: false,
  activeMethod: null,

  init(canvas, canvas3D) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (canvas3D && typeof THREE !== 'undefined') {
      this.canvas3D = canvas3D;
      this.renderer3D = new THREE.WebGLRenderer({ canvas: canvas3D, antialias: true, preserveDrawingBuffer: true, alpha: true });
      this.renderer3D.setPixelRatio(window.devicePixelRatio);
      this.renderer3D.shadowMap.enabled = true;
      this.renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;

      this.scene3D = new THREE.Scene();
      
      // Studio Lighting Environment
      if (typeof THREE.RoomEnvironment !== 'undefined') {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer3D);
        pmremGenerator.compileEquirectangularShader();
        this.scene3D.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment()).texture;
      }
      
      this.renderer3D.outputEncoding = THREE.sRGBEncoding;
      this.renderer3D.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer3D.toneMappingExposure = 1.0;

      const aspect = 1;
      this.perspCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 10000);
      
      const frustumSize = 30; // Will be scaled dynamically by methods
      this.orthoCamera = new THREE.OrthographicCamera(-frustumSize/2, frustumSize/2, frustumSize/2, -frustumSize/2, 0.1, 10000);
      
      this.camera3D = this.perspCamera; // default
      
      if (typeof THREE.OrbitControls !== 'undefined') {
        this.controls3D = new THREE.OrbitControls(this.camera3D, this.renderer3D.domElement);
        this.controls3D.enableDamping = true;
        this.controls3D.addEventListener('change', () => {
          if (this.activeMethod && this.activeMethod.type === '3d' && window.triggerRender) {
            window.triggerRender();
          }
        });
      }

      // ── Post Processing Setup ──
      if (typeof THREE.EffectComposer !== 'undefined') {
        this.composer = new THREE.EffectComposer(this.renderer3D);
        const renderPass = new THREE.RenderPass(this.scene3D, this.camera3D);
        this.composer.addPass(renderPass);

        this.ssaoPass = new THREE.SSAOPass(this.scene3D, this.camera3D, this.W, this.H);
        this.ssaoPass.kernelRadius = 16;
        this.ssaoPass.minDistance = 0.005;
        this.ssaoPass.maxDistance = 0.1;
        this.composer.addPass(this.ssaoPass);
      }
    }

    this.W = canvas.width = 1024;
    this.H = canvas.height = 1024;
    if (this.canvas3D) {
      this.canvas3D.width = this.W;
      this.canvas3D.height = this.H;
      this.renderer3D.setSize(this.W, this.H, false);
      if (this.composer) this.composer.setSize(this.W, this.H);
    }
  },

  loadMethod(methodId) {
    const method = MethodRegistry.get(methodId);
    if (!method) throw new Error(`Method '${methodId}' not found in registry`);
    this.activeMethod = method;
    
    // Apply method-specified dimensions or fallback to 1024
    this.W = method.width || 1024;
    this.H = method.height || 1024;

    if (this.canvas) {
      this.canvas.width = this.W;
      this.canvas.height = this.H;
    }
    if (this.canvas3D) {
      this.canvas3D.width = this.W;
      this.canvas3D.height = this.H;
      this.renderer3D.setSize(this.W, this.H, false);
    }
    
    // Toggle canvas visibility based on type
    if (this.activeMethod.type === '3d') {
      if (this.canvas) this.canvas.style.display = 'none';
      if (this.canvas3D) this.canvas3D.style.display = 'block';
    } else {
      if (this.canvas) this.canvas.style.display = 'block';
      if (this.canvas3D) this.canvas3D.style.display = 'none';
    }
    
    return method;
  },

  getDefaults() {
    if (!this.activeMethod) return {};
    const defaults = {};
    this.activeMethod.params.forEach(p => {
      defaults[p.key] = p.scale ? p.default * p.scale : p.default;
    });
    return defaults;
  },

  render(params, paletteColors) {
    if (!this.activeMethod) throw new Error('No method loaded');
    const t0 = performance.now();
    let result = null;

    if (this.activeMethod.type === '3d') {
      
      // Dual Camera Swap Logic
      const isOrtho = params.cameraType === 'Orthographic';
      this.camera3D = isOrtho ? this.orthoCamera : this.perspCamera;
      
      if (this.controls3D) {
        this.controls3D.object = this.camera3D;
      }

      // Ensure post-processing knows the active camera
      if (this.composer) {
        this.composer.passes[0].camera = this.camera3D; // RenderPass
        if (this.ssaoPass) this.ssaoPass.camera = this.camera3D;
      }

      result = this.activeMethod.render(
        this.renderer3D, this.scene3D, this.camera3D, this.controls3D, 
        this.W, this.H, params, paletteColors
      );

      // Execute HQ Render via Composer or Draft Render
      if (this.hqRender && this.composer) {
        this.composer.render();
      } else {
        this.renderer3D.render(this.scene3D, this.camera3D);
      }
      
    } else {
      result = this.activeMethod.render(
        this.canvas, this.ctx, this.W, this.H, params, paletteColors
      );
    }

    const elapsed = performance.now() - t0;
    return { elapsed, ...(result || {}) };
  },
};
