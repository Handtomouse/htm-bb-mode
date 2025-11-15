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
    const NUM_BUILDINGS = 26;
    const SPEED_BASE = 260;   // world units per second

    // Get accent color from CSS variables
    const getAccentColor = () => {
      const root = document.documentElement;
      const accentHex = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ff9d23';
      return accentHex;
    };

    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Dynamic color functions
    const getLineColor = () => hexToRgba(getAccentColor(), 0.7);
    const getRoadLineColor = () => {
      // Lighter version for road lines
      const hex = getAccentColor();
      const r = Math.min(255, parseInt(hex.substring(1, 3), 16) + 40);
      const g = Math.min(255, parseInt(hex.substring(3, 5), 16) + 40);
      const b = Math.min(255, parseInt(hex.substring(5, 7), 16) + 40);
      return `rgba(${r}, ${g}, ${b}, 0.9)`;
    };
    const getHorizonColor = () => hexToRgba(getAccentColor(), 0.2);

    let speed = SPEED_BASE;
    let cameraOffsetX = 0; // Camera horizontal position for turning
    let targetOffsetX = 0; // Target position for smooth interpolation
    let turnDirection = 0; // -1 = left, 0 = straight, 1 = right

    // Turn schedule (in seconds)
    let nextTurnTime = 5;
    const TURN_DURATION = 2.5;
    const TURN_AMOUNT = 150;

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    // Boost mode
    let isBoostActive = false;
    let boostEndTime = 0;
    let boostCooldownEnd = 0;
    const BOOST_DURATION = 3000; // 3 seconds
    const BOOST_COOLDOWN = 8000; // 8 seconds
    const BOOST_SPEED_MULTIPLIER = 1.8;

    // Camera roll (banking effect during turns)
    let cameraRoll = 0; // in radians
    const MAX_ROLL = 0.06; // ~3.4 degrees max tilt

    // Lightning storm system
    let lightningActive = false;
    let lightningEndTime = 0;
    let nextLightningTime = 8000 + Math.random() * 12000; // Next strike in 8-20 seconds
    let lightningBranches: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }> = [];
    const LIGHTNING_DURATION = 150; // milliseconds
    const LIGHTNING_BRANCH_COUNT = 8;

    // Performance HUD
    let fps = 60;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpi;
      canvas.height = height * dpi;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
      cx = width / 2;
      cy = height * 0.6;
    };

    window.addEventListener("resize", resize);
    resize();

    // Mouse move handler for parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width - 0.5) * 2; // -1 to 1
      mouseY = (e.clientY / height - 0.5) * 2; // -1 to 1
    };
    window.addEventListener("mousemove", handleMouseMove);

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
      rooftopType: 'antenna' | 'helipad' | 'dish' | 'none' = 'none';
      hasBillboard = false;
      billboardPattern: 'grid' | 'bars' | 'pulse' | 'wave' = 'grid';
      billboardPhase = 0;
      lightWavePattern: 'none' | 'vertical' | 'horizontal' | 'spiral' = 'none';
      lightWaveSpeed = 1;
      hasSearchlight = false;
      searchlightAngle = 0;
      searchlightSpeed = 1;

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

        // Rooftop details (40% chance)
        if (Math.random() > 0.6) {
          const rooftops: Array<'antenna' | 'helipad' | 'dish'> = ['antenna', 'helipad', 'dish'];
          this.rooftopType = rooftops[Math.floor(Math.random() * rooftops.length)];
        } else {
          this.rooftopType = 'none';
        }

        // Holographic billboards (15% chance, mainly on commercial/tower buildings)
        this.hasBillboard = (this.type === 'commercial' || this.type === 'tower') && Math.random() > 0.85;
        if (this.hasBillboard) {
          const patterns: Array<'grid' | 'bars' | 'pulse' | 'wave'> = ['grid', 'bars', 'pulse', 'wave'];
          this.billboardPattern = patterns[Math.floor(Math.random() * patterns.length)];
          this.billboardPhase = Math.random() * Math.PI * 2;
        }

        // Light wave patterns (25% chance, mainly on tower buildings)
        if (this.type === 'tower' && Math.random() > 0.75) {
          const wavePatterns: Array<'vertical' | 'horizontal' | 'spiral'> = ['vertical', 'horizontal', 'spiral'];
          this.lightWavePattern = wavePatterns[Math.floor(Math.random() * wavePatterns.length)];
          this.lightWaveSpeed = 0.5 + Math.random() * 1.5;
        } else {
          this.lightWavePattern = 'none';
        }

        // Rotating searchlights (20% chance, mainly on tall commercial/tower buildings)
        this.hasSearchlight = (this.type === 'tower' || this.type === 'commercial') && this.height > 200 && Math.random() > 0.8;
        if (this.hasSearchlight) {
          this.searchlightAngle = Math.random() * Math.PI * 2;
          this.searchlightSpeed = 0.3 + Math.random() * 0.7; // radians per second
        }
      }

      update(dt: number) {
        this.z -= speed * dt;
        if (this.z + this.depth < 40) {
          this.reset(false);
        }
        // Update searchlight rotation
        if (this.hasSearchlight) {
          this.searchlightAngle += this.searchlightSpeed * dt;
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
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 2,
        y: Math.random() * height * 0.4 - 50, // Above horizon
        z: 800 + Math.random() * CITY_DEPTH,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.1 + Math.random() * 0.2
      });
    }

    // Traffic vehicles
    const vehicles: Array<{ lane: number; z: number; speed: number; color: string; isEmergency: boolean }> = [];
    for (let i = 0; i < 12; i++) {
      const lanes = [-ROAD_WIDTH * 0.5, -ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.5];
      const isEmergency = i < 3; // First 3 vehicles are emergency
      vehicles.push({
        lane: Math.floor(Math.random() * lanes.length),
        z: Math.random() * CITY_DEPTH + 200,
        speed: isEmergency ? 300 + Math.random() * 100 : 180 + Math.random() * 150,
        color: isEmergency ? "rgba(255, 255, 255, 1)" : (Math.random() > 0.7 ? "rgba(255, 50, 50, 1)" : "rgba(100, 200, 255, 1)"),
        isEmergency
      });
    }

    // Flying vehicles/drones
    const flyingVehicles: Array<{ x: number; y: number; z: number; speed: number; bobPhase: number }> = [];
    for (let i = 0; i < 6; i++) {
      flyingVehicles.push({
        x: (Math.random() - 0.5) * ROAD_WIDTH * 4,
        y: 80 + Math.random() * 120, // Flying height
        z: Math.random() * CITY_DEPTH + 200,
        speed: 200 + Math.random() * 100,
        bobPhase: Math.random() * Math.PI * 2
      });
    }

    // Steam vents & smoke particles
    const steamParticles: Array<{ x: number; y: number; z: number; age: number; maxAge: number; size: number }> = [];
    const steamVents = [
      { x: -ROAD_WIDTH * 1.5, z: 300 },
      { x: ROAD_WIDTH * 1.8, z: 600 },
      { x: -ROAD_WIDTH * 2, z: 900 },
      { x: ROAD_WIDTH * 1.3, z: 1200 },
      { x: -ROAD_WIDTH * 1.7, z: 1500 },
    ];

    const projectPoint = (p: { x: number; y: number; z: number }, totalCamX: number = 0) => {
      const z = Math.max(p.z, 10);
      const scale = FOV / z;
      // Apply camera offset for turning effect + mouse parallax
      const offsetX = (p.x - totalCamX) * scale;
      return {
        x: cx + offsetX,
        y: cy - p.y * scale - smoothMouseY * 0.2 // Subtle Y parallax
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
      const segments = 14;
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
        ctx.strokeStyle = getLineColor();
        drawEdge(left0, left1, camX);
        drawEdge(right0, right1, camX);

        // centre broken line
        if (i % 2 === 0) {
          const mid0 = { x: 0, y: 0.1, z: z0 };
          const mid1 = { x: 0, y: 0.1, z: z1 };
          ctx.strokeStyle = getRoadLineColor();
          drawEdge(mid0, mid1, camX);
        }
      }

      // extra perspective guide rails with pulsing lights
      ctx.strokeStyle = hexToRgba(getAccentColor(), 0.4);
      const guideOffset = ROAD_WIDTH * 2.4;
      drawEdge({ x: -guideOffset, y: 0, z: 40 }, { x: 0, y: 0, z: CITY_DEPTH }, camX);
      drawEdge({ x: guideOffset, y: 0, z: 40 }, { x: 0, y: 0, z: CITY_DEPTH }, camX);

      // Street lights along road edges
      const lightSpacing = 180;
      const numLights = Math.floor(CITY_DEPTH / lightSpacing);

      for (let i = 0; i < numLights; i++) {
        const lz = i * lightSpacing + 100 - ((now * 0.0005 * SPEED_BASE) % lightSpacing);
        if (lz < 40 || lz > CITY_DEPTH) continue;

        // Left side lights
        const leftBase = { x: -ROAD_WIDTH - 10, y: 0, z: lz };
        const leftTop = { x: -ROAD_WIDTH - 10, y: 35, z: lz };
        ctx.strokeStyle = hexToRgba(getAccentColor(), 0.5);
        ctx.lineWidth = 2;
        drawEdge(leftBase, leftTop, camX);

        // Light halo
        const leftPos = projectPoint(leftTop, camX);
        const pulsePhase = (now * 0.001 + i * 0.3) % 2;
        const intensity = 0.6 + Math.sin(pulsePhase * Math.PI) * 0.4;
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = getRoadLineColor();
        ctx.shadowBlur = 12;
        ctx.shadowColor = hexToRgba(getAccentColor(), 0.8);
        ctx.fillRect(leftPos.x - 2, leftPos.y - 2, 4, 4);

        // Light cone effect
        ctx.shadowBlur = 0;
        ctx.globalAlpha = intensity * 0.15;
        ctx.fillStyle = hexToRgba(getAccentColor(), 0.2);
        ctx.beginPath();
        ctx.moveTo(leftPos.x, leftPos.y);
        ctx.lineTo(leftPos.x - 15, leftPos.y + 40);
        ctx.lineTo(leftPos.x + 15, leftPos.y + 40);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Right side lights
        const rightBase = { x: ROAD_WIDTH + 10, y: 0, z: lz };
        const rightTop = { x: ROAD_WIDTH + 10, y: 35, z: lz };
        ctx.strokeStyle = hexToRgba(getAccentColor(), 0.5);
        ctx.lineWidth = 2;
        drawEdge(rightBase, rightTop, camX);

        const rightPos = projectPoint(rightTop, camX);
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = getRoadLineColor();
        ctx.shadowBlur = 12;
        ctx.shadowColor = hexToRgba(getAccentColor(), 0.8);
        ctx.fillRect(rightPos.x - 2, rightPos.y - 2, 4, 4);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = intensity * 0.15;
        ctx.fillStyle = hexToRgba(getAccentColor(), 0.2);
        ctx.beginPath();
        ctx.moveTo(rightPos.x, rightPos.y);
        ctx.lineTo(rightPos.x - 15, rightPos.y + 40);
        ctx.lineTo(rightPos.x + 15, rightPos.y + 40);
        ctx.closePath();
        ctx.fill();
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

      // Lightning storm system
      if (lightningActive && now > lightningEndTime) {
        lightningActive = false;
      }
      if (!lightningActive && now > nextLightningTime) {
        // Trigger new lightning strike
        lightningActive = true;
        lightningEndTime = now + LIGHTNING_DURATION;
        nextLightningTime = now + 8000 + Math.random() * 12000;

        // Generate branching lightning bolts
        lightningBranches = [];
        const startX = width * (0.3 + Math.random() * 0.4);
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = height * 0.6;

        // Main bolt
        lightningBranches.push({ x1: startX, y1: startY, x2: endX, y2: endY, alpha: 1 });

        // Branch bolts (zigzag segments)
        for (let i = 0; i < LIGHTNING_BRANCH_COUNT; i++) {
          const t = Math.random();
          const branchStartX = startX + (endX - startX) * t;
          const branchStartY = startY + (endY - startY) * t;
          const branchEndX = branchStartX + (Math.random() - 0.5) * 150;
          const branchEndY = branchStartY + Math.random() * 100 + 50;
          lightningBranches.push({
            x1: branchStartX,
            y1: branchStartY,
            x2: branchEndX,
            y2: branchEndY,
            alpha: 0.5 + Math.random() * 0.5
          });
        }
      }

      ctx.clearRect(0, 0, width, height);

      const pulse = 1 + Math.sin(now * 0.0007) * 0.08;
      const baseSpeed = SPEED_BASE * pulse;
      speed = isBoostActive ? baseSpeed * BOOST_SPEED_MULTIPLIER : baseSpeed;

      // Update FPS counter
      frameCount++;
      if (now - lastFpsUpdate > 1000) {
        fps = Math.round(frameCount * 1000 / (now - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Turning logic - schedule random turns
      const timeSeconds = now * 0.001;
      if (timeSeconds > nextTurnTime) {
        // Start a new turn
        turnDirection = Math.random() > 0.5 ? 1 : -1;
        targetOffsetX = turnDirection * TURN_AMOUNT;
        nextTurnTime = timeSeconds + TURN_DURATION + Math.random() * 3 + 2; // Next turn in 2-5 seconds after this one ends
      }

      // Smooth camera interpolation
      const lerpSpeed = 1.2;
      cameraOffsetX += (targetOffsetX - cameraOffsetX) * lerpSpeed * dt;

      // Return to center after turn
      if (timeSeconds > nextTurnTime - 1) {
        targetOffsetX = 0;
      }

      // Mouse parallax (smooth interpolation)
      const parallaxStrength = 30;
      smoothMouseX += (mouseX * parallaxStrength - smoothMouseX) * 3 * dt;
      smoothMouseY += (mouseY * parallaxStrength - smoothMouseY) * 3 * dt;

      // Add mouse parallax to camera offset
      const totalCameraX = cameraOffsetX + smoothMouseX;

      // Camera roll (banking) - proportional to turn intensity
      const targetRoll = -(cameraOffsetX / TURN_AMOUNT) * MAX_ROLL; // Negative for natural banking direction
      cameraRoll += (targetRoll - cameraRoll) * 2.5 * dt;

      // Apply camera roll transformation
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(cameraRoll);
      ctx.translate(-cx, -cy);

      // Horizon
      const horizonY = cy - (FOV / (CITY_DEPTH * 0.45)) * FOV;
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

      ctx.strokeStyle = getHorizonColor();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Atmospheric depth fog - layered gradient from bottom to horizon
      const fogGradient = ctx.createLinearGradient(0, height, 0, horizonY);
      fogGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)'); // Subtle at bottom
      fogGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)'); // Medium at middle
      fogGradient.addColorStop(1, hexToRgba(getAccentColor(), 0.12)); // Accent tint at horizon
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Road
      drawRoad(now, totalCameraX);

      // Steam vents & smoke particles
      // Spawn new particles
      steamVents.forEach(vent => {
        if (Math.random() < 0.08) { // 8% chance per frame to spawn
          steamParticles.push({
            x: vent.x + (Math.random() - 0.5) * 20,
            y: 0,
            z: vent.z + (Math.random() - 0.5) * 30,
            age: 0,
            maxAge: 2 + Math.random() * 2, // 2-4 seconds lifetime
            size: 3 + Math.random() * 5
          });
        }
      });

      // Update and render steam particles
      for (let i = steamParticles.length - 1; i >= 0; i--) {
        const sp = steamParticles[i];
        sp.age += dt;
        sp.y += 30 * dt; // Rise upward
        sp.x += (Math.random() - 0.5) * 10 * dt; // Slight horizontal drift
        sp.size += 2 * dt; // Expand as it rises

        // Remove old particles
        if (sp.age > sp.maxAge) {
          steamParticles.splice(i, 1);
          continue;
        }

        // Render particle
        const distance = sp.z;
        if (distance < CITY_DEPTH) {
          const projected = projectPoint(sp, totalCameraX);
          const lifeProgress = sp.age / sp.maxAge;
          const alpha = (1 - lifeProgress) * 0.3 * (1 - (distance - 200) / CITY_DEPTH);

          if (alpha > 0.01) {
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(150, 150, 150, 0.3)';
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, sp.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
      ctx.globalAlpha = 1;

      // Traffic vehicles
      const lanes = [-ROAD_WIDTH * 0.5, -ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.5];
      vehicles.forEach(v => {
        v.z -= v.speed * dt;
        if (v.z < 40) {
          v.z = CITY_DEPTH + Math.random() * 400;
          v.lane = Math.floor(Math.random() * lanes.length);
          // Preserve emergency status, update colors accordingly
          if (!v.isEmergency) {
            v.color = Math.random() > 0.7 ? "rgba(255, 50, 50, 1)" : "rgba(100, 200, 255, 1)";
          }
        }

        const vx = lanes[v.lane];
        const vehicleSize = 8;
        const vehicleHeight = 5;

        // Vehicle body (small cube)
        const verts = [
          { x: vx - vehicleSize/2, y: 0, z: v.z },
          { x: vx + vehicleSize/2, y: 0, z: v.z },
          { x: vx - vehicleSize/2, y: vehicleHeight, z: v.z },
          { x: vx + vehicleSize/2, y: vehicleHeight, z: v.z },
          { x: vx - vehicleSize/2, y: 0, z: v.z + vehicleSize * 1.5 },
          { x: vx + vehicleSize/2, y: 0, z: v.z + vehicleSize * 1.5 },
        ];

        const projected = verts.map(v => projectPoint(v, totalCameraX));
        const distance = v.z;
        const alpha = Math.max(0, Math.min(1, 1 - (distance - 200) / CITY_DEPTH));

        // Motion blur trails (for fast vehicles, especially emergency ones)
        if (v.isEmergency || isBoostActive) {
          const trailCount = 4;
          for (let i = 1; i <= trailCount; i++) {
            const trailZ = v.z + i * 15;
            const trailAlpha = alpha * (1 - i / trailCount) * 0.3;
            const trailVerts = [
              { x: vx - vehicleSize/2, y: vehicleHeight/2, z: trailZ },
              { x: vx + vehicleSize/2, y: vehicleHeight/2, z: trailZ },
            ];
            const projTrail = trailVerts.map(v => projectPoint(v, totalCameraX));
            ctx.globalAlpha = trailAlpha;
            ctx.strokeStyle = v.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(projTrail[0].x, projTrail[0].y);
            ctx.lineTo(projTrail[1].x, projTrail[1].y);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 1.5;

        // Draw vehicle outline
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        ctx.lineTo(projected[3].x, projected[3].y);
        ctx.lineTo(projected[2].x, projected[2].y);
        ctx.closePath();
        ctx.stroke();

        // Headlights/taillights
        if (distance < 500) {
          if (v.isEmergency) {
            // Emergency strobes - alternate red/blue every 100ms
            const strobePhase = Math.floor(now / 100) % 2;
            const strobeColor = strobePhase === 0 ? "rgba(255, 0, 0, 1)" : "rgba(0, 100, 255, 1)";

            // Multiple strobe lights (front + top)
            ctx.fillStyle = strobeColor;
            ctx.shadowBlur = 12;
            ctx.shadowColor = strobeColor;

            // Front strobes (larger and brighter)
            ctx.fillRect(projected[4].x - 2, projected[4].y - 2, 4, 4);
            ctx.fillRect(projected[5].x - 2, projected[5].y - 2, 4, 4);

            // Roof strobes (top of vehicle)
            ctx.fillRect(projected[2].x - 1.5, projected[2].y - 1.5, 3, 3);
            ctx.fillRect(projected[3].x - 1.5, projected[3].y - 1.5, 3, 3);

            ctx.shadowBlur = 0;
          } else {
            // Regular headlights/taillights
            ctx.fillStyle = v.color;
            ctx.shadowBlur = 4;
            ctx.shadowColor = v.color;
            ctx.fillRect(projected[4].x - 1, projected[4].y - 1, 2, 2);
            ctx.fillRect(projected[5].x - 1, projected[5].y - 1, 2, 2);
            ctx.shadowBlur = 0;
          }
        }

        ctx.globalAlpha = 1;
      });

      // Flying vehicles/drones
      flyingVehicles.forEach(fv => {
        fv.z -= fv.speed * dt;
        fv.bobPhase += dt * 2; // Bob up and down

        if (fv.z < 40) {
          fv.z = CITY_DEPTH + Math.random() * 400;
          fv.x = (Math.random() - 0.5) * ROAD_WIDTH * 4;
          fv.y = 80 + Math.random() * 120;
        }

        // Add bobbing motion
        const bobAmount = Math.sin(fv.bobPhase) * 8;
        const currentY = fv.y + bobAmount;

        // Draw simple drone shape (diamond)
        const droneSize = 6;
        const verts = [
          { x: fv.x, y: currentY + droneSize, z: fv.z }, // top
          { x: fv.x + droneSize, y: currentY, z: fv.z }, // right
          { x: fv.x, y: currentY - droneSize, z: fv.z }, // bottom
          { x: fv.x - droneSize, y: currentY, z: fv.z }, // left
        ];

        const projected = verts.map(v => projectPoint(v, totalCameraX));
        const distance = fv.z;
        const alpha = Math.max(0, Math.min(1, 1 - (distance - 200) / CITY_DEPTH));

        // Draw drone body
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = hexToRgba(getAccentColor(), 0.8);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        ctx.lineTo(projected[2].x, projected[2].y);
        ctx.lineTo(projected[3].x, projected[3].y);
        ctx.closePath();
        ctx.stroke();

        // Drone lights (blinking)
        if (distance < 600 && Math.floor(now / 300) % 2 === 0) {
          const center = projectPoint({ x: fv.x, y: currentY, z: fv.z }, totalCameraX);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = hexToRgba(getAccentColor(), 1);
          ctx.shadowBlur = 5;
          ctx.shadowColor = hexToRgba(getAccentColor(), 0.8);
          ctx.fillRect(center.x - 1, center.y - 1, 2, 2);
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
      });

      // Buildings
      buildings.sort(
        (a, b) => (b.z + b.depth) - (a.z + a.depth)
      );

      ctx.strokeStyle = getLineColor();
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
        ctx.strokeStyle = hexToRgba(getAccentColor(), alpha);
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

        // Neon ground glow at building base
        if (distance < 800) {
          const baseLeft = projectPoint(v[0], totalCameraX);
          const baseRight = projectPoint(v[1], totalCameraX);
          const glowHeight = 25;

          // Create vertical gradient from building base
          const glowGradient = ctx.createLinearGradient(
            baseLeft.x, baseLeft.y,
            baseLeft.x, baseLeft.y + glowHeight
          );
          glowGradient.addColorStop(0, hexToRgba(getAccentColor(), 0.15 * alpha));
          glowGradient.addColorStop(0.6, hexToRgba(getAccentColor(), 0.05 * alpha));
          glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.globalAlpha = alpha * 0.6;
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.moveTo(baseLeft.x, baseLeft.y);
          ctx.lineTo(baseRight.x, baseRight.y);
          ctx.lineTo(baseRight.x, baseRight.y + glowHeight);
          ctx.lineTo(baseLeft.x, baseLeft.y + glowHeight);
          ctx.closePath();
          ctx.fill();
        }

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

              // Calculate light wave brightness
              let waveBrightness = 1;
              if (b.lightWavePattern !== 'none') {
                const waveTime = now * 0.001 * b.lightWaveSpeed;
                if (b.lightWavePattern === 'vertical') {
                  // Vertical wave (top to bottom)
                  const wavePhase = (win.y / b.windowRows + waveTime) % 1;
                  waveBrightness = 0.4 + Math.sin(wavePhase * Math.PI * 2) * 0.6;
                } else if (b.lightWavePattern === 'horizontal') {
                  // Horizontal wave (left to right)
                  const wavePhase = (win.x / b.windowCols + waveTime) % 1;
                  waveBrightness = 0.4 + Math.sin(wavePhase * Math.PI * 2) * 0.6;
                } else if (b.lightWavePattern === 'spiral') {
                  // Spiral wave (distance from center)
                  const centerX = b.windowCols / 2;
                  const centerY = b.windowRows / 2;
                  const dist = Math.sqrt((win.x - centerX) ** 2 + (win.y - centerY) ** 2);
                  const wavePhase = (dist / Math.max(b.windowCols, b.windowRows) + waveTime) % 1;
                  waveBrightness = 0.4 + Math.sin(wavePhase * Math.PI * 2) * 0.6;
                }
              }

              // Window glow with wave effect
              const finalBrightness = waveBrightness;
              ctx.globalAlpha = alpha * 0.8 * finalBrightness;

              // Color shift based on wave (cooler when dim, warmer when bright)
              const r = Math.floor(255 * finalBrightness);
              const g = Math.floor(200 * finalBrightness);
              const blue = Math.floor(100 * (0.7 + finalBrightness * 0.3));
              ctx.fillStyle = `rgba(${r}, ${g}, ${blue}, 0.9)`;
              ctx.shadowBlur = 3 * finalBrightness;
              ctx.shadowColor = `rgba(${r}, ${g}, ${blue}, ${0.8 * finalBrightness})`;
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
          ctx.fillStyle = hexToRgba(getAccentColor(), 1);
          ctx.shadowBlur = 8;
          ctx.shadowColor = hexToRgba(getAccentColor(), 0.9);
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.fillText(b.signText, signPos.x, signPos.y);
          ctx.shadowBlur = 0;
        }

        // Draw rooftop details
        if (b.rooftopType !== 'none' && distance < 1000) {
          const roofBase = v[2];
          const roofTop = { x: b.x, y: b.height + 20, z: b.z };

          ctx.globalAlpha = alpha * 0.8;
          ctx.strokeStyle = hexToRgba(getAccentColor(), alpha * 0.8);
          ctx.lineWidth = 1;

          if (b.rooftopType === 'antenna') {
            // Vertical antenna
            drawEdge(roofBase, roofTop, totalCameraX);
            // Blinking light on top
            if (Math.floor(now / 500) % 2 === 0) {
              const lightPos = projectPoint(roofTop, totalCameraX);
              ctx.fillStyle = "rgba(255, 0, 0, 1)";
              ctx.shadowBlur = 5;
              ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
              ctx.fillRect(lightPos.x - 1.5, lightPos.y - 1.5, 3, 3);
              ctx.shadowBlur = 0;
            }
          } else if (b.rooftopType === 'helipad') {
            // H shape on roof
            const pad1 = { x: b.x - 10, y: b.height + 2, z: b.z };
            const pad2 = { x: b.x + 10, y: b.height + 2, z: b.z };
            drawEdge(pad1, pad2, totalCameraX);
          } else if (b.rooftopType === 'dish') {
            // Satellite dish
            const dishBase = { x: b.x, y: b.height + 5, z: b.z };
            drawEdge(roofBase, dishBase, totalCameraX);
            const p = projectPoint(dishBase, totalCameraX);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Draw holographic billboard
        if (b.hasBillboard && distance < 700) {
          const billboardY = b.height * 0.5; // Middle of building
          const billboardWidth = b.width * 0.8;
          const billboardHeight = b.height * 0.25;

          // Billboard corners in 3D
          const bbTL = { x: b.x - billboardWidth / 2, y: billboardY + billboardHeight / 2, z: b.z - 1 };
          const bbTR = { x: b.x + billboardWidth / 2, y: billboardY + billboardHeight / 2, z: b.z - 1 };
          const bbBL = { x: b.x - billboardWidth / 2, y: billboardY - billboardHeight / 2, z: b.z - 1 };
          const bbBR = { x: b.x + billboardWidth / 2, y: billboardY - billboardHeight / 2, z: b.z - 1 };

          const projBB = [bbTL, bbTR, bbBR, bbBL].map(p => projectPoint(p, totalCameraX));

          // Holographic flicker (alpha variation)
          const flicker = 0.5 + Math.sin(now * 0.007 + b.billboardPhase) * 0.15;
          const holoAlpha = alpha * flicker;

          // Draw billboard background glow
          ctx.globalAlpha = holoAlpha * 0.3;
          ctx.fillStyle = hexToRgba(getAccentColor(), 0.4);
          ctx.beginPath();
          ctx.moveTo(projBB[0].x, projBB[0].y);
          ctx.lineTo(projBB[1].x, projBB[1].y);
          ctx.lineTo(projBB[2].x, projBB[2].y);
          ctx.lineTo(projBB[3].x, projBB[3].y);
          ctx.closePath();
          ctx.fill();

          // Draw pattern based on type
          ctx.globalAlpha = holoAlpha * 0.7;
          ctx.strokeStyle = hexToRgba(getAccentColor(), 1);
          ctx.lineWidth = 1;

          if (b.billboardPattern === 'grid') {
            // Grid pattern
            const gridCols = 5;
            const gridRows = 3;
            for (let i = 1; i < gridCols; i++) {
              const t = i / gridCols;
              const x1 = projBB[0].x + (projBB[1].x - projBB[0].x) * t;
              const y1 = projBB[0].y + (projBB[1].y - projBB[0].y) * t;
              const x2 = projBB[3].x + (projBB[2].x - projBB[3].x) * t;
              const y2 = projBB[3].y + (projBB[2].y - projBB[3].y) * t;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
            for (let i = 1; i < gridRows; i++) {
              const t = i / gridRows;
              const x1 = projBB[0].x + (projBB[3].x - projBB[0].x) * t;
              const y1 = projBB[0].y + (projBB[3].y - projBB[0].y) * t;
              const x2 = projBB[1].x + (projBB[2].x - projBB[1].x) * t;
              const y2 = projBB[1].y + (projBB[2].y - projBB[1].y) * t;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          } else if (b.billboardPattern === 'bars') {
            // Horizontal bars
            const barCount = 6;
            for (let i = 0; i < barCount; i++) {
              const t = (i + 0.5) / barCount;
              const brightness = 0.5 + Math.sin(now * 0.003 + i * 0.5 + b.billboardPhase) * 0.5;
              ctx.globalAlpha = holoAlpha * brightness;
              const x1 = projBB[0].x + (projBB[3].x - projBB[0].x) * t;
              const y1 = projBB[0].y + (projBB[3].y - projBB[0].y) * t;
              const x2 = projBB[1].x + (projBB[2].x - projBB[1].x) * t;
              const y2 = projBB[1].y + (projBB[2].y - projBB[1].y) * t;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          } else if (b.billboardPattern === 'pulse') {
            // Pulsing center dot
            const pulse = 0.3 + Math.sin(now * 0.005 + b.billboardPhase) * 0.7;
            const centerX = (projBB[0].x + projBB[2].x) / 2;
            const centerY = (projBB[0].y + projBB[2].y) / 2;
            ctx.globalAlpha = holoAlpha * pulse;
            ctx.fillStyle = hexToRgba(getAccentColor(), 1);
            ctx.shadowBlur = 8;
            ctx.shadowColor = hexToRgba(getAccentColor(), 0.8);
            ctx.beginPath();
            const radius = 3 + pulse * 5;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (b.billboardPattern === 'wave') {
            // Wave pattern
            const wavePoints = 20;
            ctx.beginPath();
            for (let i = 0; i <= wavePoints; i++) {
              const t = i / wavePoints;
              const wave = Math.sin(t * Math.PI * 3 + now * 0.002 + b.billboardPhase) * 0.3;
              const baseX = projBB[0].x + (projBB[1].x - projBB[0].x) * t;
              const baseY = projBB[0].y + (projBB[1].y - projBB[0].y) * t;
              const offsetX = projBB[3].x + (projBB[2].x - projBB[3].x) * t;
              const offsetY = projBB[3].y + (projBB[2].y - projBB[3].y) * t;
              const x = baseX + (offsetX - baseX) * (0.5 + wave);
              const y = baseY + (offsetY - baseY) * (0.5 + wave);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Scanline effect
          ctx.globalAlpha = holoAlpha * 0.4;
          const scanlineY = ((now * 0.0005 + b.billboardPhase) % 1);
          const scanX1 = projBB[0].x + (projBB[3].x - projBB[0].x) * scanlineY;
          const scanY1 = projBB[0].y + (projBB[3].y - projBB[0].y) * scanlineY;
          const scanX2 = projBB[1].x + (projBB[2].x - projBB[1].x) * scanlineY;
          const scanY2 = projBB[1].y + (projBB[2].y - projBB[1].y) * scanlineY;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(scanX1, scanY1);
          ctx.lineTo(scanX2, scanY2);
          ctx.stroke();

          // Billboard border
          ctx.globalAlpha = holoAlpha;
          ctx.strokeStyle = hexToRgba(getAccentColor(), 0.9);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(projBB[0].x, projBB[0].y);
          ctx.lineTo(projBB[1].x, projBB[1].y);
          ctx.lineTo(projBB[2].x, projBB[2].y);
          ctx.lineTo(projBB[3].x, projBB[3].y);
          ctx.closePath();
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw rotating searchlight
        if (b.hasSearchlight && distance < 1000) {
          const roofTop = { x: b.x, y: b.height, z: b.z };
          const roofPos = projectPoint(roofTop, totalCameraX);

          // Calculate beam endpoint (rotating around building)
          const beamLength = 300;
          const beamEndX = b.x + Math.cos(b.searchlightAngle) * beamLength;
          const beamEndY = b.height + 150; // Beam extends upward
          const beamEndZ = b.z + Math.sin(b.searchlightAngle) * beamLength;
          const beamEnd = projectPoint({ x: beamEndX, y: beamEndY, z: beamEndZ }, totalCameraX);

          // Draw beam (gradient from bright to transparent)
          ctx.globalAlpha = alpha * 0.15;
          const beamGradient = ctx.createLinearGradient(roofPos.x, roofPos.y, beamEnd.x, beamEnd.y);
          beamGradient.addColorStop(0, hexToRgba(getAccentColor(), 0.4));
          beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          // Draw beam cone
          ctx.fillStyle = beamGradient;
          ctx.beginPath();
          const coneWidth = 30;
          const perpX = -(beamEnd.y - roofPos.y);
          const perpY = beamEnd.x - roofPos.x;
          const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
          const normPerpX = (perpX / perpLen) * coneWidth;
          const normPerpY = (perpY / perpLen) * coneWidth;

          ctx.moveTo(roofPos.x, roofPos.y);
          ctx.lineTo(beamEnd.x + normPerpX, beamEnd.y + normPerpY);
          ctx.lineTo(beamEnd.x - normPerpX, beamEnd.y - normPerpY);
          ctx.closePath();
          ctx.fill();

          // Draw bright center line
          ctx.globalAlpha = alpha * 0.4;
          ctx.strokeStyle = hexToRgba(getAccentColor(), 0.8);
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 6;
          ctx.shadowColor = hexToRgba(getAccentColor(), 0.6);
          ctx.beginPath();
          ctx.moveTo(roofPos.x, roofPos.y);
          ctx.lineTo(beamEnd.x, beamEnd.y);
          ctx.stroke();

          // Draw searchlight source
          ctx.globalAlpha = alpha * 0.9;
          ctx.fillStyle = hexToRgba(getAccentColor(), 1);
          ctx.shadowBlur = 8;
          ctx.shadowColor = hexToRgba(getAccentColor(), 0.9);
          ctx.fillRect(roofPos.x - 2, roofPos.y - 2, 4, 4);
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
      }

      // Restore transformation (boost effects drawn without rotation)
      ctx.restore();

      // Boost visual effects
      if (isBoostActive) {
        // Motion blur vignette (edges glow)
        const boostProgress = (boostEndTime - now) / BOOST_DURATION; // 1 to 0
        const vignette = ctx.createRadialGradient(cx, cy, width * 0.3, cx, cy, width * 0.7);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, `rgba(255, 200, 100, ${0.08 * (1 - boostProgress * 0.5)})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Speed lines hint (horizontal streaks)
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.15 * (1 - boostProgress)})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const y = Math.random() * height;
          const len = 50 + Math.random() * 100;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(len, y);
          ctx.moveTo(width, y);
          ctx.lineTo(width - len, y);
          ctx.stroke();
        }
      }

      // Lightning rendering
      if (lightningActive) {
        const lightningProgress = (lightningEndTime - now) / LIGHTNING_DURATION; // 1 to 0
        const flashIntensity = lightningProgress * 0.2;

        // Screen flash (ambient light from lightning)
        ctx.globalAlpha = flashIntensity;
        ctx.fillStyle = 'rgba(200, 220, 255, 1)';
        ctx.fillRect(0, 0, width, height);

        // Draw lightning bolts
        ctx.globalAlpha = lightningProgress * 0.8 + 0.2;
        ctx.strokeStyle = 'rgba(220, 230, 255, 1)';
        ctx.shadowColor = 'rgba(180, 200, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        lightningBranches.forEach(branch => {
          ctx.globalAlpha = branch.alpha * (lightningProgress * 0.7 + 0.3);
          ctx.beginPath();
          ctx.moveTo(branch.x1, branch.y1);
          ctx.lineTo(branch.x2, branch.y2);
          ctx.stroke();
        });

        // Inner bright core of main bolt
        if (lightningBranches.length > 0) {
          ctx.globalAlpha = lightningProgress;
          ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1.5;
          const mainBolt = lightningBranches[0];
          ctx.beginPath();
          ctx.moveTo(mainBolt.x1, mainBolt.y1);
          ctx.lineTo(mainBolt.x2, mainBolt.y2);
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Performance HUD (top-right corner)
      const hudX = width - 180;
      const hudY = 20;
      const lineHeight = 18;

      ctx.globalAlpha = 0.8;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(hudX - 10, hudY - 5, 170, lineHeight * 6 + 10);

      ctx.globalAlpha = 1;
      ctx.fillStyle = hexToRgba(getAccentColor(), 1);
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 3;
      ctx.shadowColor = hexToRgba(getAccentColor(), 0.6);

      let yOffset = 0;
      ctx.fillText(`FPS: ${fps}`, hudX, hudY + yOffset);
      yOffset += lineHeight;
      ctx.fillText(`Speed: ${Math.round(speed)}`, hudX, hudY + yOffset);
      yOffset += lineHeight;
      ctx.fillText(`Buildings: ${buildings.length}`, hudX, hudY + yOffset);
      yOffset += lineHeight;
      ctx.fillText(`Vehicles: ${vehicles.length}`, hudX, hudY + yOffset);
      yOffset += lineHeight;
      ctx.fillText(`Drones: ${flyingVehicles.length}`, hudX, hudY + yOffset);
      yOffset += lineHeight;
      ctx.fillText(`Steam: ${steamParticles.length}`, hudX, hudY + yOffset);

      // Boost indicator
      if (isBoostActive) {
        ctx.fillStyle = 'rgba(255, 200, 100, 1)';
        ctx.fillText('⚡ BOOST', hudX, hudY + yOffset + lineHeight);
      } else if (now < boostCooldownEnd) {
        const cooldownProgress = (boostCooldownEnd - now) / BOOST_COOLDOWN;
        ctx.fillStyle = `rgba(150, 150, 150, ${0.5 + cooldownProgress * 0.5})`;
        ctx.fillText(`⏳ ${Math.ceil((boostCooldownEnd - now) / 1000)}s`, hudX, hudY + yOffset + lineHeight);
      }

      ctx.shadowBlur = 0;
      ctx.textAlign = 'start';
      ctx.globalAlpha = 1;

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
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
        opacity: 0.3
      }}
    />
  );
};

export default NeonCity;
