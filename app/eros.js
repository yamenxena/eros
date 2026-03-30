/* ═══════════════════════════════════════════════════════════════
   Eros v4 — UI Controller
   Dynamic sidebar from method.params[]. Method picker. Gallery.
   Animation: AnimController — frame-by-frame, MediaRecorder export.
   ═══════════════════════════════════════════════════════════════ */

// ── App State ─────────────────────────────────────────────────
const state = {
  methodId: null,
  params: {},
  palette: null,
  paletteIndex: 0,
};

let renderPending = false;
let renderTimeout = null;

// ── Animation Controller ──────────────────────────────────────
// Per-param linear animation: each range param has its own from → to range.
// Direction: forward (A→B), backward (B→A), pingpong (A→B→A).
// Records to WebM via captureStream(0) + requestFrame() for exact fps.
const AnimController = {
  running:     false,
  recording:   false,
  frame:       0,
  totalFrames: 0,
  fps:         12,
  duration:    8,
  mode:        'forward',  // 'forward' | 'backward' | 'pingpong'
  defs:        {},         // paramKey → { enabled, from, to }  — scaled values
  baseParams:  null,
  mediaRecorder: null,

  // Build per-param defs. from = min (scaled), to = CURRENT state value (always live).
  // 'from' is preserved if user has set it; 'to' is always overwritten from state.
  buildDefs() {
    const method = ErosEngine.activeMethod;
    if (!method) return;
    const prev = this.defs;
    this.defs = {};
    method.params.forEach(p => {
      if (p.type !== 'range') return;
      const scale = p.scale || 1;
      const minSc = p.min * scale;
      const maxSc = p.max * scale;
      const curSc = state.params[p.key] ?? minSc;
      // from: keep previous user value, default to param min
      const prevFrom = prev[p.key]?.from ?? minSc;
      this.defs[p.key] = {
        enabled: prev[p.key]?.enabled || false,
        from: Math.max(minSc, Math.min(maxSc, prevFrom)),
        to:   curSc,   // ALWAYS current state — wired to field params
      };
    });
  },

  // Get effective t [0,1] by applying direction mode
  _effectiveT(rawT) {
    if (this.mode === 'backward')  return 1 - rawT;
    if (this.mode === 'pingpong')  return rawT < 0.5 ? rawT * 2 : (1 - rawT) * 2;
    return rawT; // forward
  },

  // Compute interpolated params for normalised time rawT ∈ [0,1]
  getAnimatedParams(rawT) {
    const method = ErosEngine.activeMethod;
    const result = { ...this.baseParams };
    const t = this._effectiveT(rawT);
    method.params.forEach(p => {
      if (p.type !== 'range') return;
      const def = this.defs[p.key];
      if (!def?.enabled) return;
      const scale = p.scale || 1;
      const minSc = p.min * scale, maxSc = p.max * scale;
      // Linear lerp from → to
      const val = def.from + (def.to - def.from) * t;
      result[p.key] = Math.max(minSc, Math.min(maxSc, val));
    });
    return result;
  },

  start(record) {
    if (this.running) return;
    this.running     = true;
    this.recording   = record;
    this.frame       = 0;
    this.baseParams  = { ...state.params };
    this.fps         = parseInt(document.getElementById('anim-fps')?.value     || 12);
    this.duration    = parseInt(document.getElementById('anim-duration')?.value || 8);
    this.mode        = document.getElementById('anim-mode')?.value || 'forward';
    this.totalFrames = Math.ceil(this.duration * this.fps);
    _animUpdateUI(true);
    this._runLoop(record); // fire-and-forget async
  },

  stop() {
    this.running = false; // async loop checks each iteration and exits
  },

  // ══ PHASE 1: render all frames live (preview visible on canvas)
  // ══ PHASE 2: replay stored frames at exact fps into MediaRecorder
  async _runLoop(record) {
    const canvas = document.getElementById('eros-canvas');
    const ctx    = canvas.getContext('2d');
    const frames = record ? [] : null; // ImageData[] only when recording

    // ── Phase 1: Render ─────────────────────────────────────────
    for (let frame = 0; frame <= this.totalFrames; frame++) {
      if (!this.running) break;
      this.frame = frame;
      const aParams = this.getAnimatedParams(frame / this.totalFrames);

      await new Promise(r => requestAnimationFrame(r)); // yield → UI repaints
      if (!this.running) break;

      ErosEngine.render(aParams, state.palette.colors);
      if (frames) frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

      const pPct  = record ? (frame / this.totalFrames) * 50
                           : (frame / this.totalFrames) * 100;
      const pBar   = document.getElementById('anim-progress-bar');
      const pLabel = document.getElementById('anim-progress-label');
      if (pBar)   pBar.style.width   = pPct + '%';
      if (pLabel) pLabel.textContent = record
        ? `Rendering ${frame + 1} / ${this.totalFrames}`
        : `Preview ${frame + 1} / ${this.totalFrames}`;
    }

    if (!record || !this.running) {
      this.running = false; this.mediaRecorder = null;
      _animUpdateUI(false);
      ErosEngine.render(state.params, state.palette.colors);
      updateConcept();
      return;
    }

    // ── Phase 2: Record at EXACT fps ────────────────────────────
    // putImageData is instant; sleep(frameDuration) controls video speed.
    // Video will be exactly (totalFrames/fps) = duration seconds.
    let recorder = null;
    const chunks = [];
    try {
      const stream  = canvas.captureStream(this.fps);
      const area    = canvas.width * canvas.height;
      const bitrate = Math.max(8_000_000, Math.round(area * this.fps * 0.5));
      const mime    = ['video/webm;codecs=vp9', 'video/webm', '']
        .find(m => m === '' || MediaRecorder.isTypeSupported(m));
      const opts = { videoBitsPerSecond: bitrate };
      if (mime) opts.mimeType = mime;
      recorder = new MediaRecorder(stream, opts);
      recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };
      recorder.onerror = e => console.error('MediaRecorder error:', e);
      recorder.start(200);
      this.mediaRecorder = recorder;
    } catch (err) {
      console.error('Recording failed:', err);
      alert('Recording not supported. Try Chrome or Firefox.');
      this.running = false; _animUpdateUI(false);
      ErosEngine.render(state.params, state.palette.colors);
      return;
    }

    const frameDuration = 1000 / this.fps;
    for (let i = 0; i < frames.length; i++) {
      if (!this.running) break;
      ctx.putImageData(frames[i], 0, 0);
      const rPct = 50 + (i / frames.length) * 50;
      const pBar   = document.getElementById('anim-progress-bar');
      const pLabel = document.getElementById('anim-progress-label');
      if (pBar)   pBar.style.width   = rPct + '%';
      if (pLabel) pLabel.textContent = `Recording ${i + 1} / ${frames.length}`;
      await new Promise(r => setTimeout(r, frameDuration)); // exact timing
    }

    // ── Finalise ────────────────────────────────────────────────
    if (recorder && recorder.state !== 'inactive') {
      recorder.requestData();
      recorder.stop();
      await new Promise(r => {
        const t = setTimeout(r, 2000);
        recorder.addEventListener('stop', () => { clearTimeout(t); r(); }, { once: true });
      });
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `eros-${state.methodId}-${Date.now()}.webm`;
        document.body.appendChild(a); a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
      } else {
        alert('No video data captured. Try a shorter duration or lower FPS.');
      }
    }

    this.running = false; this.mediaRecorder = null;
    _animUpdateUI(false);
    ErosEngine.render(state.params, state.palette.colors);
    updateConcept();
  },
};

// ── Canvas View Controller (Zoom + Pan) ───────────────────────
const CanvasView = {
  scale: 1,
  panX: 0, panY: 0,
  _dragging: false,
  _lastX: 0, _lastY: 0,
  _fadeTimer: null,

  MIN_SCALE: 0.1,
  MAX_SCALE: 8,

  init() {
    const vp = document.getElementById('canvas-viewport');
    if (!vp) return;

    // Mouse wheel zoom
    vp.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = vp.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this._zoomAt(mx, my, delta);
    }, { passive: false });

    // Pan via left-mouse drag
    vp.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      this._dragging = true;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      vp.classList.add('grabbing');
    });
    window.addEventListener('mousemove', e => {
      if (!this._dragging) return;
      const dx = e.clientX - this._lastX;
      const dy = e.clientY - this._lastY;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      this.panX += dx;
      this.panY += dy;
      this._apply();
    });
    window.addEventListener('mouseup', () => {
      if (!this._dragging) return;
      this._dragging = false;
      vp.classList.remove('grabbing');
    });

    // Touch pinch-zoom + pan
    let lastTouchDist = 0;
    vp.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 1) {
        this._dragging = true;
        this._lastX = e.touches[0].clientX;
        this._lastY = e.touches[0].clientY;
      }
    }, { passive: false });
    vp.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = dist / (lastTouchDist || dist);
        lastTouchDist = dist;
        const rect = vp.getBoundingClientRect();
        const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
        const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
        this._zoomAt(cx, cy, delta);
      } else if (this._dragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - this._lastX;
        const dy = e.touches[0].clientY - this._lastY;
        this._lastX = e.touches[0].clientX;
        this._lastY = e.touches[0].clientY;
        this.panX += dx;
        this.panY += dy;
        this._apply();
      }
    }, { passive: false });
    vp.addEventListener('touchend', () => { this._dragging = false; lastTouchDist = 0; });
  },

  _zoomAt(mx, my, factor) {
    const oldScale = this.scale;
    const newScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, oldScale * factor));
    // Adjust pan so the point under the cursor stays fixed
    this.panX = mx - (mx - this.panX) * (newScale / oldScale);
    this.panY = my - (my - this.panY) * (newScale / oldScale);
    this.scale = newScale;
    this._apply();
  },

  zoomIn()  { this._zoomAtCenter(1.25); },
  zoomOut() { this._zoomAtCenter(0.8); },

  _zoomAtCenter(factor) {
    const vp = document.getElementById('canvas-viewport');
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    this._zoomAt(rect.width / 2, rect.height / 2, factor);
  },

  fit() {
    const vp = document.getElementById('canvas-viewport');
    const canvas = document.getElementById('eros-canvas');
    if (!vp || !canvas) return;
    const vpW = vp.clientWidth, vpH = vp.clientHeight;
    const cW = canvas.width, cH = canvas.height;
    const pad = 40;
    this.scale = Math.min((vpW - pad) / cW, (vpH - pad) / cH, 1);
    this.panX = (vpW - cW * this.scale) / 2;
    this.panY = (vpH - cH * this.scale) / 2;
    this._apply();
  },

  reset() {
    this.scale = 1;
    const vp = document.getElementById('canvas-viewport');
    const canvas = document.getElementById('eros-canvas');
    if (vp && canvas) {
      this.panX = (vp.clientWidth - canvas.width) / 2;
      this.panY = (vp.clientHeight - canvas.height) / 2;
    } else {
      this.panX = 0; this.panY = 0;
    }
    this._apply();
  },

  _apply() {
    const canvas = document.getElementById('eros-canvas');
    const canvas3D = document.getElementById('eros-canvas-3d');
    const transformStr = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    if (canvas) canvas.style.transform = transformStr;
    if (canvas3D) canvas3D.style.transform = transformStr;
    this._showIndicator();
  },

  _showIndicator() {
    let badge = document.getElementById('zoom-indicator');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'zoom-indicator';
      document.getElementById('canvas-area')?.appendChild(badge);
    }
    badge.textContent = `${Math.round(this.scale * 100)}%`;
    badge.classList.add('visible');
    clearTimeout(this._fadeTimer);
    this._fadeTimer = setTimeout(() => badge.classList.remove('visible'), 1200);
  }
};


// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Init canvas
  const canvas = document.getElementById('eros-canvas');
  const canvas3D = document.getElementById('eros-canvas-3d');
  ErosEngine.init(canvas, canvas3D);

  // ── Tab management (desktop) ──
  let activeTabType = '2d';
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchToTab(btn.dataset.tab);
    });
  });

  // ── Palette panel collapse (desktop) ──
  const palettePanel = document.getElementById('palette-panel');
  document.getElementById('palette-collapse-btn').addEventListener('click', () => {
    palettePanel.classList.toggle('collapsed');
  });
  document.getElementById('btn-palette-toggle')?.addEventListener('click', () => {
    palettePanel.classList.toggle('collapsed');
  });

  // ═══════════════════════════════════════════════════════════════
  // ── MOBILE NAVIGATION CONTROLLER ──
  // Bottom nav bar, bottom-sheet drawers, backdrop, 2D/3D toggle
  // ═══════════════════════════════════════════════════════════════
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileNav = document.getElementById('mobile-nav');

  function isMobile() { return window.innerWidth <= 768; }

  function closeMobileSheets() {
    document.body.classList.remove('sidebar-open', 'palette-open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('visible');
  }

  function openMobileSheet(which) {
    closeMobileSheets();
    document.body.classList.add(which + '-open');
    if (mobileBackdrop) mobileBackdrop.classList.add('visible');
  }

  // Shared tab-switching logic for both desktop and mobile
  function switchToTab(targetId) {
    // Clear desktop nav active states
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Clear mobile nav active states (only for tab buttons, not action buttons)
    document.querySelectorAll('.mobile-nav-btn[data-tab]').forEach(b => b.classList.remove('active'));

    // Close any open mobile sheets
    closeMobileSheets();

    if (targetId === 'canvas-2d' || targetId === 'canvas-3d') {
      document.getElementById('tab-canvas').classList.add('active');
      const newType = targetId === 'canvas-3d' ? '3d' : '2d';
      if (newType !== activeTabType) {
        activeTabType = newType;
        buildMethodSelector(activeTabType);
      }
      // Activate desktop tab btn
      const deskBtn = document.querySelector(`#main-nav [data-tab="${targetId}"]`);
      if (deskBtn) deskBtn.classList.add('active');
      // Activate mobile btn (always 'canvas-2d' since 3D is a floating toggle)
      const mobBtn = document.querySelector(`#mobile-nav [data-tab="canvas-2d"]`);
      if (mobBtn) mobBtn.classList.add('active');
      // Update 2D/3D toggle text
      const toggle3d = document.getElementById('mobile-3d-toggle');
      if (toggle3d) {
        toggle3d.textContent = activeTabType === '3d' ? '3D' : '2D';
        toggle3d.classList.toggle('active-3d', activeTabType === '3d');
      }
    } else {
      const tabEl = document.getElementById('tab-' + targetId);
      if (tabEl) tabEl.classList.add('active');
      // Desktop
      const deskBtn = document.querySelector(`#main-nav [data-tab="${targetId}"]`);
      if (deskBtn) deskBtn.classList.add('active');
      // Mobile
      const mobBtn = document.querySelector(`#mobile-nav [data-tab="${targetId}"]`);
      if (mobBtn) mobBtn.classList.add('active');
    }
  }

  // Mobile bottom nav: tab buttons
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      const action = btn.dataset.action;

      if (tab) {
        switchToTab(tab);
      } else if (action === 'sidebar') {
        const isOpen = document.body.classList.contains('sidebar-open');
        if (isOpen) {
          closeMobileSheets();
        } else {
          openMobileSheet('sidebar');
        }
        // Highlight active state for action buttons
        document.querySelectorAll('.mobile-nav-btn[data-action]').forEach(b => b.classList.remove('active'));
        if (!isOpen) btn.classList.add('active');
      } else if (action === 'palette') {
        const isOpen = document.body.classList.contains('palette-open');
        if (isOpen) {
          closeMobileSheets();
        } else {
          openMobileSheet('palette');
        }
        document.querySelectorAll('.mobile-nav-btn[data-action]').forEach(b => b.classList.remove('active'));
        if (!isOpen) btn.classList.add('active');
      }
    });
  });

  // Backdrop tap → close sheets
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', () => {
      closeMobileSheets();
      // Remove active state from action buttons, restore tab active
      document.querySelectorAll('.mobile-nav-btn[data-action]').forEach(b => b.classList.remove('active'));
    });
  }

  // 2D/3D floating toggle (mobile only)
  const mobile3DToggle = document.getElementById('mobile-3d-toggle');
  if (mobile3DToggle) {
    mobile3DToggle.addEventListener('click', () => {
      const newType = activeTabType === '2d' ? 'canvas-3d' : 'canvas-2d';
      switchToTab(newType);
    });
  }

  // ── Build method selector ──
  buildMethodSelector('2d');

  // ── Static button bindings ──
  document.getElementById('btn-new-seed').addEventListener('click', () => {
    const newSeed = Math.floor(Math.random() * 99999) + 1;
    state.params.seed = newSeed;
    const seedInput = document.getElementById('input-seed');
    if (seedInput) { seedInput.value = newSeed; }
    const seedVal = document.getElementById('val-seed');
    if (seedVal) { seedVal.textContent = newSeed; }
    scheduleRender();
  });

  document.getElementById('btn-export').addEventListener('click', exportPNG);
  document.getElementById('btn-save').addEventListener('click', saveToGallery);
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    const el = document.getElementById('eros-canvas');
    if (el.requestFullscreen) el.requestFullscreen();
  });

  // ── Zoom / Pan ──
  CanvasView.init();
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => CanvasView.zoomIn());
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => CanvasView.zoomOut());
  document.getElementById('btn-zoom-fit')?.addEventListener('click', () => CanvasView.fit());
  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => CanvasView.reset());

  // ── Canvas Size ──
  document.getElementById('btn-canvas-apply')?.addEventListener('click', applyCanvasSize);
  document.getElementById('hq-render-toggle')?.addEventListener('change', (e) => {
    ErosEngine.hqRender = e.target.checked;
    scheduleRender();
  });

  // ── Harmony (in right panel) ──
  bindSlider('harmony-hue', 'val-base-hue', updateHarmony);
  bindSlider('harmony-sat', 'val-base-sat', updateHarmony);
  bindSlider('harmony-lit', 'val-base-lit', updateHarmony);
  document.getElementById('harmony-mode').addEventListener('change', updateHarmony);
  document.getElementById('btn-apply-harmony').addEventListener('click', applyHarmony);

  // ── Image extraction ──
  const dropZone = document.getElementById('image-drop-zone');
  const fileInput = document.getElementById('image-upload');
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) extractColorsFromImage(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) extractColorsFromImage(fileInput.files[0]); });
  document.getElementById('btn-apply-extracted')?.addEventListener('click', applyExtractedPalette);

  // ── Gallery ──
  loadGallery();

  // ── Animation UI ──
  document.getElementById('anim-toggle')?.addEventListener('click', () => {
    const panel = document.getElementById('anim-panel');
    panel.classList.toggle('hidden');
    document.getElementById('anim-toggle').classList.toggle('open');
  });
  document.getElementById('btn-anim-preview')?.addEventListener('click', () => {
    if (AnimController.running) { AnimController.stop(); return; }
    AnimController.start(false);
  });
  document.getElementById('btn-anim-record')?.addEventListener('click', () => {
    if (AnimController.running) { AnimController.stop(); return; }
    AnimController.start(true);
  });
  bindSlider('anim-duration', 'val-anim-dur', () => {});

  updateHarmony();
});

// ── Method Selector (Collapsible Category-Grouped) ────────────
function buildMethodSelector(methodTypeFilter = '2d') {
  const container = document.getElementById('method-cards');
  container.innerHTML = '';
  
  const methods = MethodRegistry.list().filter(m => {
    const is3D = m.type === '3d';
    return methodTypeFilter === '3d' ? is3D : !is3D;
  });

  // Category definitions with display order and icons
  const categoryConfig = [
    { key: 'architectural', label: '▾ Architectural', icon: '◼', ids: ['edifice', 'xylem'] },
    { key: 'botanical',     label: '▾ Botanical',     icon: '◼', ids: ['ailanthus'] },
    { key: 'muqarnas',      label: '▾ Muqarnas',      icon: '◼', ids: ['muqarnas'] },
    { key: 'generative',    label: '▾ Generative',    icon: '◼', ids: [] }, // Catch-all
  ];

  // Assign methods to categories
  const categorized = new Map();
  for (const cat of categoryConfig) categorized.set(cat.key, []);

  for (const method of methods) {
    const explicitCat = method.category;
    let placed = false;

    if (explicitCat && categorized.has(explicitCat)) {
      categorized.get(explicitCat).push(method);
      placed = true;
    }
    
    if (!placed) {
      for (const cat of categoryConfig) {
        if (cat.ids.includes(method.id)) {
          categorized.get(cat.key).push(method);
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      categorized.get('generative').push(method);
    }
  }

  // Sort within each category
  const getPriority = (id) => {
    if (id === 'edifice') return 1;
    if (id === 'xylem') return 2;
    if (id === 'muqarnas') return 1;
    return 99;
  };

  for (const [, list] of categorized) {
    list.sort((a, b) => {
      const pA = getPriority(a.id), pB = getPriority(b.id);
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });
  }

  // Load collapsed state from sessionStorage (default: true -> collapsed)
  const getCollapsed = (key) => {
    try { return sessionStorage.getItem(`eros-cat-${key}`) !== '0'; } catch(e) { return true; }
  };
  const setCollapsed = (key, val) => {
    try { sessionStorage.setItem(`eros-cat-${key}`, val ? '1' : '0'); } catch(e) {}
  };

  let firstMethod = null;

  // Render collapsible categories
  for (const cat of categoryConfig) {
    const list = categorized.get(cat.key);
    if (list.length === 0) continue;

    let collapsed = getCollapsed(cat.key);

    // Category header (clickable to toggle)
    const header = document.createElement('div');
    header.className = 'method-category-header';
    header.setAttribute('data-cat', cat.key);
    const updateHeaderText = (isCollapsed) => {
      const arrow = isCollapsed ? '▸' : '▾';
      header.textContent = `${arrow} ${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}`;
      const badge = document.createElement('span');
      badge.textContent = ` (${list.length})`;
      badge.style.cssText = 'opacity:0.5; font-size:9px;';
      header.appendChild(badge);
    };
    updateHeaderText(collapsed);

    header.style.cssText = `
      font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
      color: var(--accent, #ff6b35); padding: 10px 10px 4px;
      font-weight: 700; cursor: pointer; user-select: none; opacity: 0.85;
      transition: opacity 0.15s;
    `.replace(/\n/g, '');
    header.addEventListener('mouseenter', () => header.style.opacity = '1');
    header.addEventListener('mouseleave', () => header.style.opacity = '0.85');

    container.appendChild(header);

    // Cards container (collapsible)
    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'method-category-cards';
    cardsWrap.style.cssText = `
      overflow: hidden; transition: max-height 0.3s ease, opacity 0.2s ease;
      max-height: ${collapsed ? '0px' : '5000px'};
      opacity: ${collapsed ? '0' : '1'};
    `.replace(/\n/g, '');

    // Toggle handler
    header.addEventListener('click', () => {
      collapsed = !collapsed;
      setCollapsed(cat.key, collapsed);
      updateHeaderText(collapsed);
      if (collapsed) {
        cardsWrap.style.maxHeight = '0px';
        cardsWrap.style.opacity = '0';
      } else {
        cardsWrap.style.maxHeight = '5000px';
        cardsWrap.style.opacity = '1';
      }
    });

    // Method cards inside collapsible container
    for (const method of list) {
      if (!firstMethod) firstMethod = method;
      const card = document.createElement('div');
      card.className = 'method-card';
      card.dataset.id = method.id;
      card.innerHTML = `
        <div class="method-card-name">${method.name}</div>
        <div class="method-card-desc">${method.description}</div>
        <div class="method-card-params" id="params-${method.id}" style="display:none; padding-top: 10px; padding-bottom: 5px; cursor: default;"></div>
      `;
      // Prevent clicking params from switching methods repeatedly
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.method-card-params')) {
          switchMethod(method.id);
        }
      });
      cardsWrap.appendChild(card);
    }
    container.appendChild(cardsWrap);
  }
  
  if (firstMethod) {
    switchMethod(firstMethod.id);
  } else {
    state.methodId = null;
  }
}

function switchMethod(methodId) {
  if (state.methodId === methodId) return;

  const currentSeed = state.params.seed;
  const method = ErosEngine.loadMethod(methodId);
  state.methodId = methodId;
  state.params = ErosEngine.getDefaults();

  if (currentSeed) state.params.seed = currentSeed;

  if (method.palettes && method.palettes.length > 0) {
    state.palette = method.palettes[0];
    state.paletteIndex = 0;
  }

  document.querySelectorAll('.method-card').forEach(c => {
    const isActive = (c.dataset.id === methodId);
    c.classList.toggle('active', isActive);
    const paramBox = c.querySelector('.method-card-params');
    if (paramBox) {
      paramBox.style.display = isActive ? 'block' : 'none';
      if (!isActive) paramBox.innerHTML = ''; // clear others
    }
  });

  // Sync canvas size inputs to method dimensions
  _syncCanvasSizeUI();
  CanvasView.fit();

  buildParamSidebar(method);
  buildPalettePanel();  // ← right panel
  buildAnimPanel();     // ← animation param list
  doRender();

  // Scroll params into view so they're always visible after method switch
  const activeCard = document.querySelector(`.method-card[data-id="${methodId}"]`);
  if (activeCard) setTimeout(() => activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

// ── Dynamic Sidebar Builder ───────────────────────────────────
function buildParamSidebar(method) {
  const container = document.getElementById(`params-${method.id}`);
  if (!container) return;
  container.innerHTML = '';
  
  // Stop clicks inside params from bubbling up to the card handler
  container.onclick = (e) => e.stopPropagation();
  
  if (!method.params || method.params.length === 0) return;

  // Group params by category
  const categories = {};
  method.params.forEach(p => {
    const cat = p.category || 'Method';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  for (const [catName, params] of Object.entries(categories)) {
    const section = document.createElement('div');
    section.className = 'anim-section';
    section.style.marginBottom = '8px';

    const toggle = document.createElement('div');
    toggle.className = 'anim-toggle open';
    toggle.innerHTML = `<span>⏵ ${catName}</span><span class="anim-chevron">›</span>`;
    
    const panel = document.createElement('div');
    panel.className = 'anim-panel';

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      panel.classList.toggle('hidden');
    });

    section.appendChild(toggle);
    section.appendChild(panel);

    params.forEach(paramDef => {
      const group = document.createElement('div');
      group.className = 'param-group';

      const value = state.params[paramDef.key];
      const displayValue = formatParamValue(paramDef, value);

      if (paramDef.type === 'number') {
        group.innerHTML = `
          <label>${paramDef.label} <span id="val-${paramDef.key}" class="param-val">${displayValue}</span></label>
          <input type="number" id="input-${paramDef.key}" value="${value}" min="${paramDef.min}" max="${paramDef.max}">
        `;
        panel.appendChild(group);
        const input = group.querySelector('input');
        input.addEventListener('change', () => {
          state.params[paramDef.key] = parseInt(input.value) || paramDef.default;
          document.getElementById(`val-${paramDef.key}`).textContent = state.params[paramDef.key];
          scheduleRender();
        });

      } else if (paramDef.type === 'range') {
        const rawValue = paramDef.scale ? value / paramDef.scale : value;
        group.innerHTML = `
          <label>${paramDef.label} <span id="val-${paramDef.key}" class="param-val">${displayValue}</span></label>
          <input type="range" id="input-${paramDef.key}" min="${paramDef.min}" max="${paramDef.max}" value="${rawValue}">
        `;
        panel.appendChild(group);
        const input = group.querySelector('input');
        input.addEventListener('input', () => {
          const raw    = parseFloat(input.value);
          const scaled = paramDef.scale ? raw * paramDef.scale : raw;
          state.params[paramDef.key] = scaled;
          document.getElementById(`val-${paramDef.key}`).textContent = formatParamValue(paramDef, scaled);
          _syncAnimTo(paramDef.key, scaled, paramDef.precision ?? 0); // keep anim 'to' live
          scheduleRender();
        });

      } else if (paramDef.type === 'select') {
        const optionsHTML = paramDef.options.map(opt => {
          const label = paramDef.format ? paramDef.format(opt) : opt;
          return `<option value="${opt}" ${opt === value ? 'selected' : ''}>${label}</option>`;
        }).join('');
        group.innerHTML = `
          <label>${paramDef.label} <span id="val-${paramDef.key}" class="param-val">${displayValue}</span></label>
          <select id="input-${paramDef.key}">${optionsHTML}</select>
        `;
        panel.appendChild(group);
        const input = group.querySelector('select');
        input.addEventListener('change', () => {
          state.params[paramDef.key] = isNaN(input.value) ? input.value : parseFloat(input.value);
          document.getElementById(`val-${paramDef.key}`).textContent = formatParamValue(paramDef, state.params[paramDef.key]);
          scheduleRender();
        });
      }
    });

    container.appendChild(section);
  }
}

function formatParamValue(paramDef, value) {
  if (paramDef.format) return paramDef.format(value);
  if (paramDef.precision !== undefined) return Number(value).toFixed(paramDef.precision);
  return value;
}

// Keep the animation 'to' value live-wired to the current state param.
// Called every time a range slider moves in the sidebar.
function _syncAnimTo(key, scaledVal, prec) {
  if (!AnimController.defs[key]) return;
  AnimController.defs[key].to = scaledVal;
  const toInput = document.querySelector(`.anim-to[data-key="${key}"]`);
  if (toInput) toInput.value = scaledVal.toFixed(prec);
}

// ── Render ─────────────────────────────────────────────────────
function scheduleRender() {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(doRender, 80);
}

window.triggerRender = doRender;
function doRender() {
  if (renderPending) return;
  renderPending = true;
  const info = document.getElementById('render-info');
  info.textContent = 'composing…';

  requestAnimationFrame(() => {
    const result = ErosEngine.render(state.params, state.palette.colors);
    const stats = Object.entries(result).filter(([k]) => k !== 'elapsed')
      .map(([k, v]) => `${v} ${k.replace('Count', '')}`).join(' · ');
    info.textContent = `${stats} · ${result.elapsed.toFixed(0)} ms`;
    renderPending = false;
    updateConcept();
  });
}

// ── Canvas Size Controls ──────────────────────────────────────
function _syncCanvasSizeUI() {
  const wInput = document.getElementById('canvas-width');
  const hInput = document.getElementById('canvas-height');
  if (wInput) wInput.value = ErosEngine.W;
  if (hInput) hInput.value = ErosEngine.H;
}

function applyCanvasSize() {
  const wInput = document.getElementById('canvas-width');
  const hInput = document.getElementById('canvas-height');
  if (!wInput || !hInput) return;

  let w = parseInt(wInput.value) || 1024;
  let h = parseInt(hInput.value) || 1024;
  w = Math.max(256, Math.min(4096, w));
  h = Math.max(256, Math.min(4096, h));
  wInput.value = w;
  hInput.value = h;

  // Update engine canvas
  const canvas = document.getElementById('eros-canvas');
  if (canvas) {
    canvas.width = w;
    canvas.height = h;
    ErosEngine.W = w;
    ErosEngine.H = h;
  }

  CanvasView.fit();
  doRender();
}

// ── Animation Panel ───────────────────────────────────────────
function buildAnimPanel() {
  AnimController.buildDefs();
  const method = ErosEngine.activeMethod;
  if (!method) return;

  const container = document.getElementById('anim-params');
  if (!container) return;
  container.innerHTML = '';

  method.params.forEach(p => {
    if (p.type !== 'range') return;
    const def   = AnimController.defs[p.key];
    const scale = p.scale || 1;
    const prec  = p.precision ?? 0;
    const step  = prec > 0 ? Math.pow(10, -prec) : 1;
    const minSc = p.min * scale, maxSc = p.max * scale;

    const row = document.createElement('div');
    row.className = 'anim-param-row' + (def.enabled ? ' active' : '');

    // 'to' is always the CURRENT state value — reset every time panel opens
    const currentTo = (state.params[p.key] ?? def.to);
    def.to = currentTo; // keep def in sync before render

    row.innerHTML = `
      <label class="anim-check-label">
        <input type="checkbox" class="anim-check" ${def.enabled ? 'checked' : ''}>
        <span>${p.label}</span>
      </label>
      <div class="anim-fromto">
        <input type="number" class="anim-from" value="${def.from.toFixed(prec)}"
               min="${minSc}" max="${maxSc}" step="${step}" title="From">
        <span class="anim-arrow">→</span>
        <input type="number" class="anim-to" data-key="${p.key}" value="${currentTo.toFixed(prec)}"
               min="${minSc}" max="${maxSc}" step="${step}" title="To (current state)" readonly>
        <button class="anim-swap" title="Swap">⇄</button>
      </div>
    `;
    container.appendChild(row);

    const chk     = row.querySelector('.anim-check');
    const inFrom  = row.querySelector('.anim-from');
    const inTo    = row.querySelector('.anim-to');
    const swapBtn = row.querySelector('.anim-swap');

    chk.addEventListener('change', () => {
      AnimController.defs[p.key].enabled = chk.checked;
      row.classList.toggle('active', chk.checked);
    });
    inFrom.addEventListener('change', () => {
      const v = Math.max(minSc, Math.min(maxSc, parseFloat(inFrom.value) || minSc));
      AnimController.defs[p.key].from = v;
      inFrom.value = v.toFixed(prec);
    });
    // inTo is readonly — driven by _syncAnimTo() / current state, no manual change handler
    swapBtn.addEventListener('click', () => {
      // Swap: from ← current 'to' (current state), keeping 'to' anchored to state
      // Effect: "start from where I am now, animate toward the old 'from'"
      const oldFrom = AnimController.defs[p.key].from;
      AnimController.defs[p.key].from = AnimController.defs[p.key].to;
      inFrom.value = AnimController.defs[p.key].from.toFixed(prec);
      // Optionally: also store oldFrom as the new conceptual target
      // (to stays wired to state so it reflects live param)
    });
  });
}

function _animUpdateUI(running) {
  const btnPreview = document.getElementById('btn-anim-preview');
  const btnRecord  = document.getElementById('btn-anim-record');
  const progress   = document.getElementById('anim-progress');

  if (btnPreview) btnPreview.textContent = running ? '■ Stop' : '▶ Preview';
  if (btnRecord)  btnRecord.textContent  = running && AnimController.recording ? '■ Stop' : '⏺ Record';
  if (progress)   progress.classList.toggle('hidden', !running);
  if (running && progress) {
    const bar = document.getElementById('anim-progress-bar');
    if (bar) bar.style.width = '0%';
    const lbl = document.getElementById('anim-progress-label');
    if (lbl) lbl.textContent = '0 / ' + AnimController.totalFrames;
  }
}


// ── Slider helper ─────────────────────────────────────────────
function bindSlider(inputId, valId, callback) {
  const input = document.getElementById(inputId);
  const handler = () => {
    const v = parseFloat(input.value);
    const span = document.getElementById(valId);
    if (span) span.textContent = v;
    callback(v);
  };
  input.addEventListener('input', handler);
}

// ── Right Palette Panel ───────────────────────────────────────
// Rule: any method registered in MethodRegistry MUST define palettes[].
// buildPalettePanel() is called on every method switch and applies the
// active method's palettes to the panel. Click on any card = immediate render.
function buildPalettePanel() {
  const method = ErosEngine.activeMethod;
  if (!method) return;

  // Build clickable palette cards in the right panel
  const list = document.getElementById('panel-curated-palettes');
  list.innerHTML = '';

  method.palettes.forEach((pal, idx) => {
    const card = document.createElement('div');
    card.className = 'panel-palette-card' + (idx === state.paletteIndex ? ' active' : '');
    card.innerHTML = `
      <div class="panel-palette-swatches">
        ${pal.colors.map(c => `<div class="swatch" style="background:hsl(${c.h},${c.s}%,${c.l}%)"></div>`).join('')}
      </div>
      <div class="panel-palette-name">${pal.name}</div>
      <div class="panel-palette-mood">${pal.mood}</div>
    `;
    // 1-click apply — WS heuristic #3: core actions in 1 click
    card.addEventListener('click', () => {
      applyPalette(pal, idx);
      list.querySelectorAll('.panel-palette-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
    list.appendChild(card);
  });

  // Update active palette bar at panel top
  refreshActivePaletteBar();
}

// Apply a palette object to state and trigger render immediately
function applyPalette(pal, idx) {
  state.palette = pal;
  state.paletteIndex = idx ?? -1;
  refreshActivePaletteBar();
  scheduleRender();
}

// Update the active swatch strip + name at top of panel
function refreshActivePaletteBar() {
  if (!state.palette) return;
  const bar = document.getElementById('active-palette-swatches');
  const nameEl = document.getElementById('active-palette-name');
  if (bar) {
    bar.innerHTML = state.palette.colors
      .map(c => `<div class="swatch" style="background:hsl(${c.h},${c.s}%,${c.l}%)"></div>`)
      .join('');
  }
  if (nameEl) nameEl.textContent = state.palette.name;
}

let _extractedPalette = null;
function applyExtractedPalette() {
  if (_extractedPalette) applyPalette(_extractedPalette);
}

// ── HSL Wheel ─────────────────────────────────────────────────
function drawHSLWheel() {
  const canvas = document.getElementById('hsl-wheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 110, cy = 110, r = 100;
  for (let angle = 0; angle < 360; angle++) {
    const rad = angle * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, rad, rad + Math.PI / 180 * 1.5);
    ctx.closePath();
    ctx.fillStyle = `hsl(${angle}, 70%, 50%)`; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2);
  ctx.fillStyle = '#0d0a14'; ctx.fill();
}

// ── Harmony ───────────────────────────────────────────────────
let harmonyColors = [];

function updateHarmony() {
  const hue = parseInt(document.getElementById('harmony-hue').value);
  const sat = parseInt(document.getElementById('harmony-sat').value);
  const lit = parseInt(document.getElementById('harmony-lit').value);
  const mode = document.getElementById('harmony-mode').value;
  const offsets = {
    analogous: [-30, -15, 0, 15, 30],
    complementary: [0, 180],
    triadic: [0, 120, 240],
    split: [0, 150, 210],
    tetradic: [0, 90, 180, 270],
  };
  harmonyColors = (offsets[mode] || [0]).map(off => ({
    h: (hue + off + 360) % 360, s: sat, l: lit,
  }));
  document.getElementById('harmony-swatches').innerHTML = harmonyColors.map(c =>
    `<div class="swatch" style="background:hsl(${c.h},${c.s}%,${c.l}%)" title="hsl(${c.h},${c.s}%,${c.l}%)"></div>`
  ).join('');
}

function applyHarmony() {
  if (harmonyColors.length === 0) return;
  applyPalette({ name: 'Custom Harmony', mood: 'user-defined', colors: [...harmonyColors] }, -1);
  buildPalettePanel(); // refresh active highlight
}

// ── Image extraction ──────────────────────────────────────────
function extractColorsFromImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 64, 64);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      const samples = [];
      for (let i = 0; i < 500; i++) {
        const idx = Math.floor(Math.random() * 4096) * 4;
        samples.push([data[idx], data[idx+1], data[idx+2]]);
      }
      const colors = medianCut(samples, 6);
      const hslColors = colors.map(([r,g,b]) => {
        const [h, s, l] = rgb2hsl(r, g, b);
        return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
      });
      const container = document.getElementById('extracted-swatches');
      container.innerHTML = hslColors.map(c =>
        `<div class="swatch" style="background:hsl(${c.h},${c.s}%,${c.l}%)"></div>`
      ).join('');
      // Store for apply button
      _extractedPalette = { name: 'Extracted', mood: 'from image', colors: hslColors };
      const applyBtn = document.getElementById('btn-apply-extracted');
      if (applyBtn) applyBtn.style.display = 'block';
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function medianCut(pixels, depth) {
  if (depth === 0 || pixels.length === 0) {
    const avg = pixels.reduce((a, p) => [a[0]+p[0], a[1]+p[1], a[2]+p[2]], [0,0,0]);
    const n = pixels.length || 1;
    return [[avg[0]/n|0, avg[1]/n|0, avg[2]/n|0]];
  }
  let ranges = [0,1,2].map(ch => {
    const vals = pixels.map(p => p[ch]);
    return Math.max(...vals) - Math.min(...vals);
  });
  const ch = ranges.indexOf(Math.max(...ranges));
  pixels.sort((a, b) => a[ch] - b[ch]);
  const mid = pixels.length >> 1;
  return [...medianCut(pixels.slice(0, mid), depth - 1), ...medianCut(pixels.slice(mid), depth - 1)].slice(0, 6);
}

// ── Concept tab ───────────────────────────────────────────────
function updateConcept() {
  const method = ErosEngine.activeMethod;
  if (!method) return;
  const pal = state.palette;
  const p = state.params;

  document.getElementById('concept-narrative').textContent = method.narrative(p);
  document.getElementById('concept-equation').textContent = method.equation(p);

  document.getElementById('concept-params').textContent = JSON.stringify({
    method: method.id,
    ...p,
    palette: pal.name,
  }, null, 2);

  document.getElementById('concept-meta').innerHTML = `
    <div class="meta-item"><span class="meta-label">Engine</span><span class="meta-value">Eros v4 — ${method.name}</span></div>
    <div class="meta-item"><span class="meta-label">Method</span><span class="meta-value">${method.id} v${method.version}</span></div>
    <div class="meta-item"><span class="meta-label">Palette</span><span class="meta-value">${pal.name} (${pal.colors.length} hues)</span></div>
    ${method.params.filter(pd => pd.key !== 'seed').map(pd =>
      `<div class="meta-item"><span class="meta-label">${pd.label}</span><span class="meta-value">${formatParamValue(pd, p[pd.key])}</span></div>`
    ).join('')}
    <div class="meta-item"><span class="meta-label">Timestamp</span><span class="meta-value">${new Date().toISOString()}</span></div>
  `;
}

// ── Gallery ───────────────────────────────────────────────────
function saveToGallery() {
  const method = ErosEngine.activeMethod;
  const canvas = method && method.type === '3d' 
    ? document.getElementById('eros-canvas-3d') 
    : document.getElementById('eros-canvas');
  
  // Create a high-res thumbnail to match new larger cards
  const thumbSize = 800;
  const scale = thumbSize / Math.max(canvas.width, canvas.height);
  const tCanvas = document.createElement('canvas');
  tCanvas.width = canvas.width * scale;
  tCanvas.height = canvas.height * scale;
  const tCtx = tCanvas.getContext('2d');
  tCtx.drawImage(canvas, 0, 0, tCanvas.width, tCanvas.height);
  
  // Use JPEG for massive data reduction, avoiding uncompressed PNG bloat
  const thumb = tCanvas.toDataURL('image/jpeg', 0.6);

  const entry = {
    id: Date.now(),
    thumb,
    methodId: state.methodId,
    params: { ...state.params },
    palette: { name: state.palette.name, mood: state.palette.mood, colors: [...state.palette.colors] },
    timestamp: new Date().toISOString(),
  };
  const gallery = JSON.parse(localStorage.getItem('eros-gallery') || '[]');
  gallery.unshift(entry);
  if (gallery.length > 50) gallery.pop();
  localStorage.setItem('eros-gallery', JSON.stringify(gallery));
  loadGallery();
  
  // Visual feedback that a new card was created
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    const ogText = saveBtn.textContent;
    saveBtn.textContent = '✓ Saved as New Card';
    saveBtn.classList.add('btn-success-pulse');
    setTimeout(() => {
      saveBtn.textContent = ogText;
      saveBtn.classList.remove('btn-success-pulse');
    }, 1500);
  }
}

function loadGallery() {
  const gallery = JSON.parse(localStorage.getItem('eros-gallery') || '[]');
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  if (gallery.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = gallery.map(item => `
    <div class="gallery-item" data-id="${item.id}">
      <img src="${item.thumb}" alt="Saved composition">
      <div class="gallery-item-info">
        <span>${item.palette?.name || 'Custom'}</span>
        <span>${item.methodId || 'muqarnas'} · seed ${item.params.seed}</span>
      </div>
      <div class="gallery-item-actions">
        <button class="btn-load" data-id="${item.id}">Load</button>
        <button class="btn-delete" data-id="${item.id}">✕</button>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.btn-load').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = gallery.find(g => g.id === parseInt(btn.dataset.id));
      if (item) loadFromGallery(item);
    });
  });
  grid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtered = gallery.filter(g => g.id !== parseInt(btn.dataset.id));
      localStorage.setItem('eros-gallery', JSON.stringify(filtered));
      loadGallery();
    });
  });
}

function loadFromGallery(item) {
  const targetMethodId = item.methodId || 'muqarnas';
  
  // Cleanly switch method to ensure DOM is set up (card opened, others closed)
  if (state.methodId !== targetMethodId) {
    switchMethod(targetMethodId);
  }

  // Restore params
  const method = ErosEngine.activeMethod;
  state.params = { ...ErosEngine.getDefaults(), ...item.params };

  // Restore palette
  if (item.palette?.colors) {
    const matchIdx = method.palettes.findIndex(p => p.name === item.palette.name);
    if (matchIdx >= 0) {
      state.palette = method.palettes[matchIdx];
      state.paletteIndex = matchIdx;
    } else {
      state.palette = item.palette;
      state.paletteIndex = -1;
    }
  }

  // Rebuild sidebar with restored params
  buildParamSidebar(method);
  buildPalettePanel();
  buildAnimPanel();
  refreshActivePaletteBar();

  // Switch to canvas tab (sync both desktop and mobile nav)
  const targetTabName = (method && method.type === '3d') ? 'canvas-3d' : 'canvas-2d';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-btn[data-tab]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-btn[data-action]').forEach(b => b.classList.remove('active'));
  document.body.classList.remove('sidebar-open', 'palette-open');
  const backdrop = document.getElementById('mobile-backdrop');
  if (backdrop) backdrop.classList.remove('visible');

  const targetBtn = document.querySelector(`#main-nav [data-tab="${targetTabName}"]`);
  if (targetBtn) targetBtn.classList.add('active');
  const mobileCanvasBtn = document.querySelector('#mobile-nav [data-tab="canvas-2d"]');
  if (mobileCanvasBtn) mobileCanvasBtn.classList.add('active');
  document.getElementById('tab-canvas').classList.add('active');

  CanvasView.fit();
  doRender();
}

// ── Export ─────────────────────────────────────────────────────
function exportPNG() {
  const method = ErosEngine.activeMethod;
  const canvas = method && method.type === '3d' 
    ? document.getElementById('eros-canvas-3d') 
    : document.getElementById('eros-canvas');
  const link = document.createElement('a');
  link.download = `eros_${state.methodId}_${state.params.seed}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
