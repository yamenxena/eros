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
  activeMethod: null,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width = 1024;
    this.H = canvas.height = 1024;
  },

  loadMethod(methodId) {
    const method = MethodRegistry.get(methodId);
    if (!method) throw new Error(`Method '${methodId}' not found in registry`);
    this.activeMethod = method;
    
    // Apply method-specified dimensions or fallback to 1024
    if (this.canvas) {
      this.W = this.canvas.width = method.width || 1024;
      this.H = this.canvas.height = method.height || 1024;
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
    const result = this.activeMethod.render(
      this.canvas, this.ctx, this.W, this.H, params, paletteColors
    );
    const elapsed = performance.now() - t0;
    return { elapsed, ...(result || {}) };
  },
};
