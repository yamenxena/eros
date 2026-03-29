/* ═══════════════════════════════════════════════════════════════
   Eros — Method: Fornes Colony
   Stigmergic Agent-Based Modeling (ABM). Autonomous crawling
   agents follow a stress-flow vector field, depositing structural
   trails that form self-organized architectural patterns.

   Source: Analysis/Mukarnas/muqarnas-generative-heuristics.md §4
   ═══════════════════════════════════════════════════════════════ */

if (typeof MethodRegistry !== 'undefined') {
  MethodRegistry.register({
    id: 'fornes',
    name: 'Fornes Colony',
    category: 'muqarnas',
    version: '1.0.0',
    description: 'Agent-based structural crawlers that follow stress-flow vector fields, depositing trails to form self-organized perforated lattices.',

    palettes: [
      {
        name: 'Anodized Aluminum', mood: 'Structural Skin',
        colors: [
          { h: 210, s: 15, l: 80 }, { h: 200, s: 10, l: 65 },
          { h: 215, s: 20, l: 50 }, { h: 220, s: 25, l: 35 },
          { h: 0,   s: 0,  l: 12 },
        ]
      },
      {
        name: 'Vermillion Structure', mood: 'Public Pavilion',
        colors: [
          { h: 5,   s: 85, l: 50 }, { h: 15,  s: 75, l: 55 },
          { h: 355, s: 60, l: 40 }, { h: 25,  s: 90, l: 60 },
          { h: 0,   s: 0,  l: 8 },
        ]
      },
      {
        name: 'Chromatic Green', mood: 'Living Surface',
        colors: [
          { h: 145, s: 65, l: 45 }, { h: 130, s: 50, l: 55 },
          { h: 160, s: 55, l: 35 }, { h: 100, s: 40, l: 60 },
          { h: 0,   s: 0,  l: 5 },
        ]
      },
      {
        name: 'Titanium White', mood: 'Gallery Installation',
        colors: [
          { h: 0,   s: 0,  l: 95 }, { h: 0,   s: 0,  l: 85 },
          { h: 0,   s: 0,  l: 70 }, { h: 210, s: 10, l: 55 },
          { h: 0,   s: 0,  l: 15 },
        ]
      }
    ],

    params: [
      { key: 'seed',           type: 'number', label: 'Seed',              default: 42,    min: 1,     max: 999999 },
      { key: 'agentCount',     type: 'range',  label: 'Agent Count',       default: 300,   min: 50,    max: 1000,   precision: 0 },
      { key: 'agentLife',      type: 'range',  label: 'Agent Lifespan',    default: 200,   min: 50,    max: 800,    precision: 0 },
      { key: 'trailWidth',     type: 'range',  label: 'Trail Width',       default: 2.5,   min: 0.5,   max: 8.0,    precision: 1 },
      { key: 'fieldScale',     type: 'range',  label: 'Field Scale',       default: 0.004, min: 0.001, max: 0.015,  precision: 3 },
      { key: 'stressWeight',   type: 'range',  label: 'Stress Alignment',  default: 0.6,   min: 0.1,   max: 1.0,    precision: 2 },
      { key: 'avoidanceRadius',type: 'range',  label: 'Avoidance Radius',  default: 15,    min: 3,     max: 50,     precision: 0 },
      { key: 'depositRate',    type: 'range',  label: 'Deposit Rate',      default: 0.8,   min: 0.1,   max: 2.0,    precision: 1 },
    ],

    narrative(p) {
      return `${p.agentCount} autonomous agents crawl across a stress-flow vector field (scale ${p.fieldScale}). ` +
        `Each agent aligns ${(p.stressWeight * 100).toFixed(0)}% to principal stress directions and avoids neighbors ` +
        `within ${p.avoidanceRadius}px. Trail deposit rate ${p.depositRate} creates emergent structural patterns.`;
    },

    equation(p) {
      return `dir(t) = normalize(\n` +
             `  ${p.stressWeight}·stress_∇ +\n` +
             `  ${(1-p.stressWeight).toFixed(2)}·avoidance +\n` +
             `  pheromone_∇)\n` +
             `trail(x,y) += ${p.depositRate}·(1 - coverage)`;
    },

    render(canvas, ctx, W, H, params, palette) {
      const startT = performance.now();
      const prng = new PRNG(params.seed);
      const sn = new SimplexNoise(params.seed);

      // Background
      const bg = palette[palette.length - 1];
      ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`;
      ctx.fillRect(0, 0, W, H);

      // Trail coverage map (low res for performance)
      const mapRes = 4;
      const mapW = Math.ceil(W / mapRes);
      const mapH = Math.ceil(H / mapRes);
      const trailMap = new Float32Array(mapW * mapH);

      // Spatial hash for agent avoidance
      const grid = new SpatialHashGrid(W, H, Math.max(params.avoidanceRadius, 10));

      // Stress-flow vector field from noise
      const getStressDir = (x, y) => {
        const angle = sn.fbm(x * params.fieldScale, y * params.fieldScale, 3, 0.5, 2.0) * Math.PI * 2;
        return { x: Math.cos(angle), y: Math.sin(angle) };
      };

      // Trail map gradient
      const getTrailGrad = (x, y) => {
        const mi = Math.floor(x / mapRes), mj = Math.floor(y / mapRes);
        if (mi < 1 || mi >= mapW - 1 || mj < 1 || mj >= mapH - 1) return { x: 0, y: 0 };
        const gx = (trailMap[(mj) * mapW + (mi + 1)] - trailMap[(mj) * mapW + (mi - 1)]) * 0.5;
        const gy = (trailMap[(mj + 1) * mapW + (mi)] - trailMap[(mj - 1) * mapW + (mi)]) * 0.5;
        return { x: -gx, y: -gy }; // Move AWAY from high trail density
      };

      // Initialize agents
      const agents = [];
      const palLen = palette.length - 1;

      for (let a = 0; a < params.agentCount; a++) {
        agents.push({
          x: prng.range(W * 0.05, W * 0.95),
          y: prng.range(H * 0.05, H * 0.95),
          life: params.agentLife,
          speed: prng.range(1.5, 3.5),
          trail: [],
          colIdx: a % palLen,
          id: a
        });
      }

      // Simulate all agents
      for (let step = 0; step < params.agentLife; step++) {
        // Rebuild spatial hash each step
        grid.clear();
        for (const agent of agents) {
          if (agent.life <= 0) continue;
          grid.insert(agent);
        }

        for (const agent of agents) {
          if (agent.life <= 0) continue;

          // 1. Stress-flow direction
          const stress = getStressDir(agent.x, agent.y);

          // 2. Neighbor avoidance
          const neighbors = grid.queryRadius(agent.x, agent.y, params.avoidanceRadius);
          let ax = 0, ay = 0;
          for (const n of neighbors) {
            if (n.id === agent.id) continue;
            const dx = agent.x - n.x, dy = agent.y - n.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            ax += (dx / dist) / dist;
            ay += (dy / dist) / dist;
          }
          const aLen = Math.sqrt(ax * ax + ay * ay) || 1;
          ax /= aLen; ay /= aLen;

          // 3. Trail gradient (pheromone)
          const trail = getTrailGrad(agent.x, agent.y);

          // 4. Weighted direction
          const sw = params.stressWeight;
          const aw = (1 - sw) * 0.6;
          const tw = (1 - sw) * 0.4;
          let dx = sw * stress.x + aw * ax + tw * trail.x;
          let dy = sw * stress.y + aw * ay + tw * trail.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;

          agent.x += (dx / len) * agent.speed;
          agent.y += (dy / len) * agent.speed;
          agent.life--;

          // Boundary check
          if (agent.x < 5 || agent.x > W - 5 || agent.y < 5 || agent.y > H - 5) {
            agent.life = 0;
            continue;
          }

          // Deposit trail
          const mi = Math.floor(agent.x / mapRes);
          const mj = Math.floor(agent.y / mapRes);
          if (mi >= 0 && mi < mapW && mj >= 0 && mj < mapH) {
            trailMap[mj * mapW + mi] += params.depositRate;
          }

          agent.trail.push({ x: agent.x, y: agent.y });
        }
      }

      // Render trails
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const agent of agents) {
        if (agent.trail.length < 3) continue;

        const col = palette[agent.colIdx];
        const lifeRatio = agent.trail.length / params.agentLife;

        ctx.beginPath();
        ctx.moveTo(agent.trail[0].x, agent.trail[0].y);
        for (let i = 1; i < agent.trail.length; i++) {
          ctx.lineTo(agent.trail[i].x, agent.trail[i].y);
        }

        ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${0.5 + lifeRatio * 0.4})`;
        ctx.lineWidth = params.trailWidth * (0.5 + lifeRatio * 0.5);
        ctx.stroke();
      }

      // Aperture eating: transparent holes where coverage is low
      ctx.globalCompositeOperation = 'destination-out';
      for (let mj = 0; mj < mapH; mj++) {
        for (let mi = 0; mi < mapW; mi++) {
          const coverage = trailMap[mj * mapW + mi];
          if (coverage < 0.3) {
            const alpha = Math.max(0, 0.15 - coverage * 0.5);
            if (alpha > 0.01) {
              ctx.fillStyle = `rgba(0,0,0,${alpha})`;
              ctx.fillRect(mi * mapRes, mj * mapRes, mapRes, mapRes);
            }
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      const aliveCount = agents.filter(a => a.trail.length > 3).length;
      return { agents: params.agentCount, surviving: aliveCount, perf: `${(performance.now() - startT).toFixed(0)}ms` };
    }
  });
}
