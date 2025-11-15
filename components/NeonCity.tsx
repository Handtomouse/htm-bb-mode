"use client";

import React, { useEffect, useRef } from "react";

const NeonCity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    const dpi = window.devicePixelRatio || 1;

    const FOV = 550;          // focal length
    const ROAD_WIDTH = 80;    // world units
    const CITY_DEPTH = 2200;  // how far buildings extend
    const NUM_BUILDINGS = 16; // Reduced from 26 for performance
    const SPEED_BASE = 260;   // world units per second

    // Cached color calculations (computed once, huge performance gain)
    const root = document.documentElement;
    let accentHex = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ff9d23';

    // Ensure it's a hex color (remove any whitespace/invalid chars)
    if (!accentHex.startsWith('#')) {
      accentHex = '#ff9d23';
    }

    const hexToRgba = (hex: string, alpha: number) => {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Pre-computed colors (no function calls in render loop) - 15% brighter
    const COLOR_LINE = hexToRgba(accentHex, 0.85);
    const COLOR_ROAD_LINE = (() => {
      const r = Math.min(255, parseInt(accentHex.substring(1, 3), 16) + 55);
      const g = Math.min(255, parseInt(accentHex.substring(3, 5), 16) + 55);
      const b = Math.min(255, parseInt(accentHex.substring(5, 7), 16) + 55);
      return `rgba(${r}, ${g}, ${b}, 1.0)`;
    })();
    const COLOR_HORIZON = hexToRgba(accentHex, 0.35);
    const COLOR_ACCENT = accentHex;

    let speed = SPEED_BASE;

    // Boost mode
    let isBoostActive = false;
    let boostEndTime = 0;
    let boostCooldownEnd = 0;
    const BOOST_DURATION = 3000; // 3 seconds
    const BOOST_COOLDOWN = 8000; // 8 seconds
    const BOOST_SPEED_MULTIPLIER = 1.8;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width === 0 || height === 0) return;
      canvas.width = width * dpi;
      canvas.height = height * dpi;
      ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
      cx = width / 2;
      cy = height * 0.5;
    };

    // Watch canvas element for size changes (handles ResponsiveStage scaling)
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    // Also listen to window resize for additional safety
    window.addEventListener("resize", resize);
    resize();

    // Boost trigger handlers
    const triggerBoost = () => {
      const now = performance.now();
      if (now > boostCooldownEnd && !isBoostActive) {
        isBoostActive = true;
        boostEndTime = now + BOOST_DURATION;
        boostCooldownEnd = now + BOOST_DURATION + BOOST_COOLDOWN;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        triggerBoost();
      }
    };

    const handleClick = () => {
      triggerBoost();
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);

    class Building {
      side: number;
      x = 0;
      width = 0;
      depth = 0;
      height = 0;
      z = 0;
      windows: Array<{ x: number; y: number; lit: boolean; flicker: number }> = [];
      windowCols = 0;
      windowRows = 0;
      type: 'residential' | 'commercial' | 'tower' = 'residential';
      hasSign = false;
      signText = '';

      constructor(side: number) {
        this.side = side;
        this.reset(true);
      }

      reset(initial: boolean = false) {
        const laneOffset = ROAD_WIDTH * 1.2;
        const spread = 220;

        const sideOffset = laneOffset + Math.random() * spread;
        this.x = this.side * sideOffset;
        this.width = 40 + Math.random() * 90;
        this.depth = 80 + Math.random() * 160;
        this.height = 120 + Math.random() * 260;

        this.z = initial
          ? Math.random() * CITY_DEPTH + 80
          : CITY_DEPTH + 80 + Math.random() * 400;

        // Determine building type
        const typeRoll = Math.random();
        if (typeRoll < 0.3) {
          this.type = 'tower';
          this.height *= 1.3;
        } else if (typeRoll < 0.6) {
          this.type = 'commercial';
        } else {
          this.type = 'residential';
        }

        // Add windows
        this.windowCols = Math.floor(this.width / 12);
        this.windowRows = Math.floor(this.height / 15);
        this.windows = [];

        for (let row = 0; row < this.windowRows; row++) {
          for (let col = 0; col < this.windowCols; col++) {
            this.windows.push({
              x: col,
              y: row,
              lit: Math.random() > 0.3, // 70% chance of being lit
              flicker: Math.random() * 1000
            });
          }
        }

        // Neon signs (20% chance)
        this.hasSign = Math.random() > 0.8;
        if (this.hasSign) {
          const signs = ['HTM', 'SWICH', 'OPEN', 'CAFE', 'BAR', 'HOTEL', 'SHOP'];
          this.signText = signs[Math.floor(Math.random() * signs.length)];
        }

      }

      update(dt: number) {
        this.z -= speed * dt;
        if (this.z + this.depth < 40) {
          this.reset(false);
        }
      }

      getVertices() {
        const x = this.x;
        const w = this.width;
        const h = this.height;
        const zFront = this.z;
        const zBack = this.z + this.depth;

        return [
          // Front face
          { x: x - w / 2, y: 0, z: zFront }, // 0
          { x: x + w / 2, y: 0, z: zFront }, // 1
          { x: x - w / 2, y: h, z: zFront }, // 2
          { x: x + w / 2, y: h, z: zFront }, // 3
          // Back face
          { x: x - w / 2, y: 0, z: zBack },  // 4
          { x: x + w / 2, y: 0, z: zBack },  // 5
          { x: x - w / 2, y: h, z: zBack },  // 6
          { x: x + w / 2, y: h, z: zBack }   // 7
        ];
      }
    }

    const buildings: Building[] = [];
    for (let i = 0; i < NUM_BUILDINGS; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      buildings.push(new Building(side));
    }

    // Background particles (stars)
    const particles: Array<{ x: number; y: number; z: number; size: number; speed: number }> = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 2,
        y: Math.random() * height * 0.4 - 50, // Above horizon
        z: 800 + Math.random() * CITY_DEPTH,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.1 + Math.random() * 0.2
      });
    }

    // Traffic vehicles with enhanced properties
    type VehicleType = 'sedan' | 'sports' | 'truck' | 'police' | 'ambulance';
    const vehicles: Array<{
      lane: number;
      z: number;
      speed: number;
      bodyColor: string;
      glowColor: string;
      isEmergency: boolean;
      type: VehicleType;
    }> = [];

    const vehicleColors = [
      { body: 'rgba(0, 255, 255, 1)', glow: 'rgba(0, 255, 255, 0.6)' }, // Cyan
      { body: 'rgba(255, 0, 255, 1)', glow: 'rgba(255, 0, 255, 0.6)' }, // Magenta
      { body: 'rgba(255, 255, 0, 1)', glow: 'rgba(255, 255, 0, 0.6)' }, // Yellow
      { body: 'rgba(0, 255, 100, 1)', glow: 'rgba(0, 255, 100, 0.6)' }, // Green
      { body: 'rgba(255, 100, 0, 1)', glow: 'rgba(255, 100, 0, 0.6)' }, // Orange
      { body: 'rgba(100, 200, 255, 1)', glow: 'rgba(100, 200, 255, 0.6)' }, // Light Blue
    ];

    for (let i = 0; i < 8; i++) {
      const lanes = [-ROAD_WIDTH * 0.5, -ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.5];
      const isEmergency = i < 2;

      let type: VehicleType;
      let colorSet;

      if (isEmergency) {
        type = i === 0 ? 'police' : 'ambulance';
        colorSet = i === 0
          ? { body: 'rgba(0, 100, 255, 1)', glow: 'rgba(0, 100, 255, 0.8)' } // Police blue
          : { body: 'rgba(255, 255, 255, 1)', glow: 'rgba(255, 50, 50, 0.8)' }; // Ambulance white/red
      } else {
        const rand = Math.random();
        if (rand < 0.3) type = 'sports';
        else if (rand < 0.6) type = 'sedan';
        else type = 'truck';
        colorSet = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];
      }

      vehicles.push({
        lane: Math.floor(Math.random() * lanes.length),
        z: Math.random() * CITY_DEPTH + 200,
        speed: isEmergency ? 350 + Math.random() * 100 : (type === 'sports' ? 250 + Math.random() * 100 : 180 + Math.random() * 120),
        bodyColor: colorSet.body,
        glowColor: colorSet.glow,
        isEmergency,
        type
      });
    }


    const projectPoint = (p: { x: number; y: number; z: number }, totalCamX: number = 0) => {
      const z = Math.max(p.z, 10);
      const scale = FOV / z;
      // Apply camera offset for turning effect + mouse parallax
      const offsetX = (p.x - totalCamX) * scale;
      return {
        x: cx + offsetX,
        y: cy - (p.y - 80) * scale // Elevated camera 80 units above ground
      };
    };

    const drawEdge = (a: any, b: any, camX: number = 0) => {
      const pa = projectPoint(a, camX);
      const pb = projectPoint(b, camX);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    };

    const drawRoad = (now: number, camX: number) => {
      const t = now * 0.002;
      const segments = 10;
      const segLength = CITY_DEPTH / segments;

      ctx.lineWidth = 1;

      for (let i = 0; i < segments; i++) {
        const z0 = i * segLength - (t % segLength);
        const z1 = z0 + segLength * 0.9;

        if (z1 < 40) continue;

        const left0 = { x: -ROAD_WIDTH, y: 0, z: z0 };
        const right0 = { x: ROAD_WIDTH, y: 0, z: z0 };
        const left1 = { x: -ROAD_WIDTH, y: 0, z: z1 };
        const right1 = { x: ROAD_WIDTH, y: 0, z: z1 };

        // road borders
        ctx.strokeStyle = COLOR_LINE;
        drawEdge(left0, left1, camX);
        drawEdge(right0, right1, camX);

        // centre broken line
        if (i % 2 === 0) {
          const mid0 = { x: 0, y: 0.1, z: z0 };
          const mid1 = { x: 0, y: 0.1, z: z1 };
          ctx.strokeStyle = COLOR_ROAD_LINE;
          drawEdge(mid0, mid1, camX);
        }
      }

      // Street lights along road edges
      const lightSpacing = 180;
      const numLights = Math.floor(CITY_DEPTH / lightSpacing);

      for (let i = 0; i < numLights; i++) {
        const lz = i * lightSpacing + 100 - ((now * 0.0005 * SPEED_BASE) % lightSpacing);
        if (lz < 40 || lz > CITY_DEPTH) continue;

        // Left side lights
        const leftBase = { x: -ROAD_WIDTH - 10, y: 0, z: lz };
        const leftTop = { x: -ROAD_WIDTH - 10, y: 35, z: lz };
        ctx.strokeStyle = hexToRgba(COLOR_ACCENT, 0.5);
        ctx.lineWidth = 2;
        drawEdge(leftBase, leftTop, camX);

        // Light glow
        const leftPos = projectPoint(leftTop, camX);
        const pulsePhase = (now * 0.001 + i * 0.3) % 2;
        const intensity = 0.6 + Math.sin(pulsePhase * Math.PI) * 0.4;
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = COLOR_ROAD_LINE;
        ctx.shadowBlur = 12;
        ctx.shadowColor = hexToRgba(COLOR_ACCENT, 0.8);
        ctx.fillRect(leftPos.x - 2, leftPos.y - 2, 4, 4);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Right side lights
        const rightBase = { x: ROAD_WIDTH + 10, y: 0, z: lz };
        const rightTop = { x: ROAD_WIDTH + 10, y: 35, z: lz };
        ctx.strokeStyle = hexToRgba(COLOR_ACCENT, 0.5);
        ctx.lineWidth = 2;
        drawEdge(rightBase, rightTop, camX);

        const rightPos = projectPoint(rightTop, camX);
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = COLOR_ROAD_LINE;
        ctx.shadowBlur = 12;
        ctx.shadowColor = hexToRgba(COLOR_ACCENT, 0.8);
        ctx.fillRect(rightPos.x - 2, rightPos.y - 2, 4, 4);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    };

    let frameId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Check boost state
      if (isBoostActive && now > boostEndTime) {
        isBoostActive = false;
      }

      ctx.clearRect(0, 0, width, height);

      const pulse = 1 + Math.sin(now * 0.0007) * 0.08;
      const baseSpeed = SPEED_BASE * pulse;
      speed = isBoostActive ? baseSpeed * BOOST_SPEED_MULTIPLIER : baseSpeed;

      // Camera centered on road
      const totalCameraX = 0;

      // Horizon - aligned with status bar top
      const horizonY = 65;
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, width, horizonY);

      // Background particles (stars)
      particles.forEach(p => {
        p.z -= speed * dt * p.speed * 0.3; // Move slower than buildings
        if (p.z < 800) {
          p.z = CITY_DEPTH + 800;
          p.x = (Math.random() - 0.5) * width * 2;
          p.y = Math.random() * height * 0.4 - 50;
        }

        const projected = projectPoint(p, totalCameraX);
        if (projected.y < horizonY) {
          const twinkle = 0.5 + Math.sin(now * 0.001 * (p.z % 10)) * 0.5;
          ctx.globalAlpha = twinkle * 0.6;
          ctx.fillStyle = "rgba(255, 200, 150, 1)";
          ctx.shadowBlur = 2;
          ctx.shadowColor = "rgba(255, 200, 150, 0.8)";
          ctx.fillRect(projected.x, projected.y, p.size, p.size);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      });

      ctx.strokeStyle = COLOR_HORIZON;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Road
      drawRoad(now, totalCameraX);


      // Traffic vehicles - Enhanced
      const lanes = [-ROAD_WIDTH * 0.5, -ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.5];
      vehicles.forEach(v => {
        v.z -= v.speed * dt;
        if (v.z < 40) {
          v.z = CITY_DEPTH + Math.random() * 400;
          v.lane = Math.floor(Math.random() * lanes.length);
        }

        const vx = lanes[v.lane];
        const distance = v.z;
        const alpha = Math.max(0, Math.min(1, 1 - (distance - 200) / CITY_DEPTH));

        // Type-specific dimensions
        let width, height, length;
        if (v.type === 'sports') {
          width = 7; height = 4; length = 12;
        } else if (v.type === 'truck') {
          width = 9; height = 7; length = 14;
        } else {
          width = 8; height = 5; length = 12;
        }

        // Vehicle body vertices
        const verts = [
          { x: vx - width/2, y: 0, z: v.z },                    // 0: front-left-bottom
          { x: vx + width/2, y: 0, z: v.z },                    // 1: front-right-bottom
          { x: vx - width/2, y: height, z: v.z },               // 2: front-left-top
          { x: vx + width/2, y: height, z: v.z },               // 3: front-right-top
          { x: vx - width/2, y: 0, z: v.z + length },           // 4: rear-left-bottom
          { x: vx + width/2, y: 0, z: v.z + length },           // 5: rear-right-bottom
          { x: vx - width/2, y: height, z: v.z + length },      // 6: rear-left-top
          { x: vx + width/2, y: height, z: v.z + length },      // 7: rear-right-top
          // Windshield (angled)
          { x: vx - width/2, y: height * 1.3, z: v.z + 3 },     // 8: windshield-left
          { x: vx + width/2, y: height * 1.3, z: v.z + 3 },     // 9: windshield-right
        ];

        const projected = verts.map(p => projectPoint(p, totalCameraX));

        // Underglow neon effect
        if (distance < 600) {
          const underglowY = projected[0].y + 2;
          ctx.globalAlpha = alpha * 0.4;
          ctx.fillStyle = v.glowColor;
          ctx.shadowBlur = 15;
          ctx.shadowColor = v.glowColor;
          ctx.beginPath();
          ctx.ellipse((projected[0].x + projected[1].x) / 2, underglowY, width * 2, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw car body with gradient
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = v.bodyColor;
        ctx.lineWidth = 2;

        // Front face
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        ctx.lineTo(projected[3].x, projected[3].y);
        ctx.lineTo(projected[2].x, projected[2].y);
        ctx.closePath();
        ctx.stroke();

        // Top face (roof)
        ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.moveTo(projected[2].x, projected[2].y);
        ctx.lineTo(projected[3].x, projected[3].y);
        ctx.lineTo(projected[7].x, projected[7].y);
        ctx.lineTo(projected[6].x, projected[6].y);
        ctx.closePath();
        ctx.stroke();

        // Side edges
        ctx.globalAlpha = alpha * 0.8;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[4].x, projected[4].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(projected[1].x, projected[1].y);
        ctx.lineTo(projected[5].x, projected[5].y);
        ctx.stroke();

        // Windshield (angled for sports cars)
        if (v.type === 'sports' && distance < 500) {
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(projected[2].x, projected[2].y);
          ctx.lineTo(projected[8].x, projected[8].y);
          ctx.moveTo(projected[3].x, projected[3].y);
          ctx.lineTo(projected[9].x, projected[9].y);
          ctx.stroke();
        }

        // Headlight beams (forward projection)
        if (distance < 600) {
          ctx.globalAlpha = alpha * 0.3;
          const beamLength = 40;
          const beam1 = projectPoint({ x: vx - width/3, y: height/2, z: v.z - beamLength }, totalCameraX);
          const beam2 = projectPoint({ x: vx + width/3, y: height/2, z: v.z - beamLength }, totalCameraX);

          ctx.fillStyle = 'rgba(255, 255, 200, 0.2)';
          ctx.beginPath();
          ctx.moveTo(projected[0].x, projected[0].y);
          ctx.lineTo(projected[1].x, projected[1].y);
          ctx.lineTo(beam2.x, beam2.y);
          ctx.lineTo(beam1.x, beam1.y);
          ctx.closePath();
          ctx.fill();
        }

        // Headlights
        if (distance < 500) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = 'rgba(255, 255, 200, 1)';
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(255, 255, 200, 0.8)';
          ctx.fillRect(projected[0].x - 2, projected[0].y - 1, 3, 2);
          ctx.fillRect(projected[1].x - 1, projected[1].y - 1, 3, 2);
          ctx.shadowBlur = 0;

          // Taillights (red)
          ctx.fillStyle = 'rgba(255, 50, 50, 1)';
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(255, 50, 50, 0.6)';
          ctx.fillRect(projected[4].x - 2, projected[4].y - 1, 3, 2);
          ctx.fillRect(projected[5].x - 1, projected[5].y - 1, 3, 2);
          ctx.shadowBlur = 0;
        }

        // Emergency lights (roof light bar)
        if (v.isEmergency && distance < 600) {
          const strobePhase = Math.floor(now / 80) % 2;
          const strobeColor = v.type === 'police'
            ? (strobePhase === 0 ? "rgba(255, 0, 0, 1)" : "rgba(0, 100, 255, 1)")
            : "rgba(255, 50, 50, 1)";

          ctx.globalAlpha = alpha;
          ctx.fillStyle = strobeColor;
          ctx.shadowBlur = 20;
          ctx.shadowColor = strobeColor;

          // Roof light bar (elongated)
          const barY = (projected[2].y + projected[3].y) / 2 - 3;
          const barX = (projected[2].x + projected[3].x) / 2;
          ctx.fillRect(barX - 4, barY, 8, 2);

          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
      });

      // Buildings
      buildings.sort(
        (a, b) => (b.z + b.depth) - (a.z + a.depth)
      );

      ctx.strokeStyle = COLOR_LINE;
      ctx.lineWidth = 1.2;

      for (const b of buildings) {
        b.update(dt);
        const v = b.getVertices();

        // Calculate distance for LOD and fog
        const distance = b.z;
        const fogFactor = Math.max(0, Math.min(1, (distance - 200) / CITY_DEPTH));
        const alpha = 0.7 - fogFactor * 0.5; // Fade distant buildings

        // Front rectangle with fog
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = hexToRgba(COLOR_ACCENT, alpha);
        ctx.lineWidth = 1.2;
        drawEdge(v[0], v[1], totalCameraX);
        drawEdge(v[1], v[3], totalCameraX);
        drawEdge(v[3], v[2], totalCameraX);
        drawEdge(v[2], v[0], totalCameraX);

        // Back rectangle (dimmer)
        ctx.globalAlpha = alpha * 0.6;
        drawEdge(v[4], v[5], totalCameraX);
        drawEdge(v[5], v[7], totalCameraX);
        drawEdge(v[7], v[6], totalCameraX);
        drawEdge(v[6], v[4], totalCameraX);

        // Connect front/back (side edges)
        ctx.globalAlpha = alpha * 0.7;
        drawEdge(v[0], v[4], totalCameraX);
        drawEdge(v[1], v[5], totalCameraX);
        drawEdge(v[2], v[6], totalCameraX);
        drawEdge(v[3], v[7], totalCameraX);

        // Draw windows (only on nearby buildings for performance)
        if (distance < 800) {
          const windowWidth = b.width / b.windowCols;
          const windowHeight = b.height / b.windowRows;

          b.windows.forEach(win => {
            // Flicker effect
            const flickerPhase = (now * 0.001 + win.flicker) % 1;
            const isFlickering = flickerPhase < 0.1 && Math.random() > 0.8;

            if (win.lit && !isFlickering) {
              const wx = b.x - b.width / 2 + (win.x + 0.5) * windowWidth;
              const wy = (win.y + 0.5) * windowHeight;
              const wz = b.z + b.depth * 0.3;

              const projected = projectPoint({ x: wx, y: wy, z: wz }, totalCameraX);

              // Window glow
              ctx.globalAlpha = alpha * 0.8;
              ctx.fillStyle = `rgba(255, 200, 100, 0.9)`;
              ctx.shadowBlur = 3;
              ctx.shadowColor = `rgba(255, 200, 100, 0.8)`;
              ctx.fillRect(projected.x - 1, projected.y - 1, 2, 2);
              ctx.shadowBlur = 0;
            }
          });
        }

        // Draw neon sign
        if (b.hasSign && distance < 600) {
          const signY = b.height * 0.7;
          const signPos = projectPoint({ x: b.x, y: signY, z: b.z }, totalCameraX);

          ctx.globalAlpha = alpha;
          ctx.fillStyle = hexToRgba(COLOR_ACCENT, 1);
          ctx.shadowBlur = 8;
          ctx.shadowColor = hexToRgba(COLOR_ACCENT, 0.9);
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.fillText(b.signText, signPos.x, signPos.y);
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        cursor: "pointer",
        opacity: 0.45
      }}
    />
  );
};

export default NeonCity;
