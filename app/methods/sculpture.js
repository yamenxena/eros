MethodRegistry.register({
  id: 'sculpture',
  type: '3d',
  name: 'Sculpture (3D)',
  version: '1.0.0',
  description: 'Generative 3D random walk using instanced primitives.',
  
  palettes: [
    {
      name: 'Vapor Wave', mood: 'Neon 80s',
      colors: [
        { h: 320, s: 80, l: 60 },
        { h: 300, s: 70, l: 50 },
        { h: 280, s: 90, l: 70 },
        { h: 200, s: 80, l: 50 },
        { h: 180, s: 70, l: 80 },
        { h: 250, s: 15, l: 10 }
      ]
    },
    {
      name: 'Limestone', mood: 'Earthy architecture',
      colors: [
        { h: 40,  s: 20, l: 80 },
        { h: 35,  s: 25, l: 70 },
        { h: 30,  s: 30, l: 60 },
        { h: 25,  s: 35, l: 50 },
        { h: 20,  s: 40, l: 40 },
        { h: 40,  s: 10, l: 90 }
      ]
    }
  ],

  params: [
    { key: 'seed',       type: 'number', label: 'Seed',        default: 42,   min: 1, max: 999999, category: 'Method' },
    { key: 'steps',      type: 'range',  label: 'Path Steps',  default: 500,  min: 50, max: 4000, precision: 0, category: 'Method' },
    { key: 'blockSize',  type: 'range',  label: 'Block Size',  default: 1,    min: 0.1, max: 5, precision: 1, category: 'Method' },
    { key: 'spread',     type: 'range',  label: 'Spread',      default: 1.0,  min: 0.1, max: 5.0, precision: 1, category: 'Method' },
    
    { key: 'roughness',  type: 'range',  label: 'Roughness',   default: 0.7,  min: 0.0, max: 1.0, precision: 2, category: 'Materials' },
    { key: 'metalness',  type: 'range',  label: 'Metalness',   default: 0.1,  min: 0.0, max: 1.0, precision: 2, category: 'Materials' },
    
    { key: 'cameraType', type: 'select', label: 'Lens',        default: 'Orthographic', options: ['Orthographic', 'Perspective'], category: 'View' },
    { key: 'cameraView', type: 'select', label: 'Angle',       default: 'Isometric',    options: ['Isometric', 'Top', 'Front', 'Side', 'Free'], category: 'View' },
    
    { key: 'bgColor',    type: 'select', label: 'Background',  default: 'Dark', options: ['Dark', 'Light', 'Palette Base'], category: 'Background' }
  ],

  narrative(p) { return `A 3D spatial random walk of ${p.steps} steps.`; },
  equation(p) { return `P_{n+1} = P_n + \\Delta_{xyz}`; },

  _lastParamsStr: '',
  _lastPaletteName: '',

  render(renderer, scene, camera, controls, W, H, params, colors) {
    if (typeof THREE === 'undefined') return { error: 'Three.js not loaded' };
    
    const paramsStr = JSON.stringify(params);
    const paletteName = colors.map(c => `${c.h},${c.s},${c.l}`).join('|');
    const needsRebuild = (this._lastParamsStr !== paramsStr) || (this._lastPaletteName !== paletteName);
    
    if (needsRebuild) {
      this._lastParamsStr = paramsStr;
      this._lastPaletteName = paletteName;
      
      // 1. Cleardown previous scene
      while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
      }
      
      // 2. PRNG Setup
      const prng = new PRNG(params.seed);
      
      // 3. Background Color
      let bgCol = new THREE.Color(0x111111);
      if (params.bgColor === 'Light') bgCol = new THREE.Color(0xeeeeee);
      if (params.bgColor === 'Palette Base' && colors.length > 0) {
        const b = colors[colors.length-1];
        bgCol.setHSL(b.h/360, b.s/100, b.l/100);
      }
      renderer.setClearColor(bgCol);
      
      // 4. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(20, 60, 20);
      dirLight.castShadow = true;
      dirLight.shadow.camera.left = -50;
      dirLight.shadow.camera.right = 50;
      dirLight.shadow.camera.top = 50;
      dirLight.shadow.camera.bottom = -50;
      dirLight.shadow.bias = -0.001;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      scene.add(dirLight);

      const fillLight = new THREE.DirectionalLight(0xaaccff, 0.3);
      fillLight.position.set(-20, -10, -20);
      scene.add(fillLight);
      
      // 5. Build Material & Geometry
      const activeColors = colors.slice(0, colors.length - 1);
      if (activeColors.length === 0) activeColors.push(colors[0] || {h:0, s:0, l:50});

      const materials = activeColors.map(hsl => {
        const c = new THREE.Color().setHSL(hsl.h/360, hsl.s/100, hsl.l/100);
        return new THREE.MeshPhysicalMaterial({
          color: c,
          roughness: params.roughness,
          metalness: params.metalness,
          clearcoat: 1.0 - params.roughness, // Shiny when not rough
          clearcoatRoughness: 0.1,
          ior: 1.5 // Plastic-like index of refraction
        });
      });
      
      const geom = new THREE.BoxGeometry(params.blockSize, params.blockSize, params.blockSize);
      
      // 6. Algorithm: Random Walk 3D
      const group = new THREE.Group();
      scene.add(group);
      
      let cx = 0, cy = 0, cz = 0;
      let minX=0, maxX=0, minY=0, maxY=0, minZ=0, maxZ=0;
      
      for (let i = 0; i < params.steps; i++) {
          const matIdx = Math.floor(prng.next() * materials.length);
          const mesh = new THREE.Mesh(geom, materials[matIdx]);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.position.set(cx, cy, cz);
          group.add(mesh);
          
          if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
          if (cz < minZ) minZ = cz; if (cz > maxZ) maxZ = cz;
          
          const axis = Math.floor(prng.next() * 3);
          const dir = (prng.next() > 0.5 ? 1 : -1) * params.spread;
          if (axis === 0) cx += dir;
          else if (axis === 1) cy += dir;
          else cz += dir;
      }
      
      const bW = (maxX - minX) || 1;
      const bH = (maxY - minY) || 1;
      const bD = (maxZ - minZ) || 1;
      group.position.set( -minX - bW/2, -minY - bH/2, -minZ - bD/2 );
      
      this._lastMaxSize = Math.max(bW, bH, bD);
      this._lastBoundsText = `${bW.toFixed(1)} x ${bH.toFixed(1)} x ${bD.toFixed(1)}`;
      
      // Update camera position based on view FIRST time or if changed
      const camDist = this._lastMaxSize * 1.5;
      
      if (params.cameraView === 'Isometric') {
        camera.position.set(camDist, camDist, camDist);
      } else if (params.cameraView === 'Top') {
        camera.position.set(0, camDist * 1.5, 0);
      } else if (params.cameraView === 'Front') {
        camera.position.set(0, 0, camDist * 1.5);
      } else if (params.cameraView === 'Side') {
        camera.position.set(camDist * 1.5, 0, 0);
      } else {
        if (camera.position.lengthSq() < 1) camera.position.set(camDist, camDist*0.5, camDist);
      }
      camera.lookAt(0,0,0);
      if (controls) controls.target.set(0,0,0);
    }
    
    // Always update aspect and render
    if (camera.isOrthographicCamera) {
      const viewSize = this._lastMaxSize * 1.5;
      const aspect = W / H;
      camera.left = -viewSize * aspect / 2;
      camera.right = viewSize * aspect / 2;
      camera.top = viewSize / 2;
      camera.bottom = -viewSize / 2;
      camera.updateProjectionMatrix();
    } else {
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    if (controls) controls.update();
    
    // Rendering is now handled by ErosEngine.render to support PostProcessing
    
    return {
      blocks: params.steps,
      bounds: this._lastBoundsText
    };
  }
});
