"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Building } from "@/lib/neonCity/Building";
import { StarSystem, SteamSystem, RainSystem, CloudSystem } from "@/lib/neonCity/ParticleSystem";
import {
  RENDERING_CONFIG,
  BUILDING_CONFIG,
  VEHICLE_CONFIG,
  LIGHTING_CONFIG,
  PARTICLE_CONFIG,
  DEFAULT_SETTINGS,
  type NeonCitySettings
} from "@/lib/neonCity/config";
import type { Point3D, Point2D, Vehicle, FlyingVehicle, ColorCache, CameraState, BoostState, WeatherState } from "@/lib/neonCity/types";

interface NeonCityProps {
  settings?: Partial<NeonCitySettings>;
}

const NeonCityOptimized: React.FC<NeonCityProps> = ({ settings: userSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState<NeonCitySettings>({ ...DEFAULT_SETTINGS, ...userSettings });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Offscreen canvas for background (Phase 3 - Improvement #1)
    let offscreenCanvas: HTMLCanvasElement | null = null;
    let offscreenCtx: CanvasRenderingContext2D | null = null;

    if (RENDERING_CONFIG.ENABLE_OFFSCREEN_CANVAS && typeof document !== 'undefined') {
      offscreenCanvas = document.createElement('canvas');
      offscreenCtx = offscreenCanvas.getContext("2d");
      offscreenCanvasRef.current = offscreenCanvas;
    }

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    const dpi = window.devicePixelRatio || 1;

    // Phase 2 - Improvement #4: Memoized color cache
    const colorCache: ColorCache = {
      accent: '',
      line: '',
      roadLine: '',
      horizon: '',
      lastUpdate: 0
    };

    const updateColorCache = () => {
      const root = document.documentElement;
      const accentHex = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ff9d23';

      const hexToRgba = (hex: string, alpha: number) => {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      colorCache.accent = accentHex;
      colorCache.line = hexToRgba(accentHex, 0.7);
      colorCache.roadLine = (() => {
        const r = Math.min(255, parseInt(accentHex.substring(1, 3), 16) + 40);
        const g = Math.min(255, parseInt(accentHex.substring(3, 5), 16) + 40);
        const b = Math.min(255, parseInt(accentHex.substring(5, 7), 16) + 40);
        return `rgba(${r}, ${g}, ${b}, 0.9)`;
      })();
      colorCache.horizon = hexToRgba(accentHex, 0.2);
      colorCache.lastUpdate = performance.now();
    };

    updateColorCache();

    const hexToRgba = (hex: string, alpha: number) => {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    let speed = RENDERING_CONFIG.SPEED_BASE;

    // Camera state
    const camera: CameraState = {
      x: 0,
      y: 0,
      smoothMouseX: 0,
      smoothMouseY: 0
    };

    let mouseX = 0;
    let mouseY = 0;

    // Boost state
    const boostState: BoostState = {
      active: false,
      endTime: 0,
      cooldownEnd: 0
    };

    // Weather state (Phase 4)
    const weatherState: WeatherState = {
      rainEnabled: settings.weatherEnabled,
      fogDensity: 0.3,
      lightningActive: false,
      lightningEndTime: 0
    };

    // Touch gesture state (Phase 6 - Improvement #19)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartDist = 0;
    let pinchZoom = 1;

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
      cy = height * RENDERING_CONFIG.CAMERA_CENTER_Y;

      // Resize offscreen canvas
      if (offscreenCanvas && offscreenCtx) {
        offscreenCanvas.width = width * dpi;
        offscreenCanvas.height = height * dpi;
        offscreenCtx.setTransform(dpi, 0, 0, dpi, 0, 0);
      }

      // Resize particle systems
      starSystem.resize(width, height);
      rainSystem.resize(width, height);
      cloudSystem.resize(width);
    };

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);
    resize();

    // Mouse parallax handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width - 0.5) * 2;
      mouseY = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Touch gesture handlers (Phase 6 - Improvement #19)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Swipe for camera pan
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        mouseX = (deltaX / width) * 4; // Amplify for touch
        mouseY = (deltaY / height) * 4;
      } else if (e.touches.length === 2) {
        // Pinch for zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        pinchZoom = Math.max(0.5, Math.min(2, dist / touchStartDist));
      }
    };

    const handleTouchEnd = () => {
      // Reset mouse position on touch end
      setTimeout(() => {
        mouseX = 0;
        mouseY = 0;
      }, 300);
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Boost trigger
    const triggerBoost = () => {
      const now = performance.now();
      if (now > boostState.cooldownEnd && !boostState.active) {
        boostState.active = true;
        boostState.endTime = now + RENDERING_CONFIG.BOOST_DURATION;
        boostState.cooldownEnd = now + RENDERING_CONFIG.BOOST_DURATION + RENDERING_CONFIG.BOOST_COOLDOWN;
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

    // Double-tap for boost (touch)
    let lastTap = 0;
    const handleTouchDoubleTap = (e: TouchEvent) => {
      const now = performance.now();
      if (now - lastTap < 300) {
        triggerBoost();
      }
      lastTap = now;
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouchDoubleTap as any);

    // Phase 2 - Improvement #2: Object pooling via ParticleSystem
    const starSystem = new StarSystem(RENDERING_CONFIG.NUM_PARTICLES, width, height);
    const steamSystem = new SteamSystem(RENDERING_CONFIG.NUM_STEAM_VENTS);
    const rainSystem = new RainSystem(PARTICLE_CONFIG.RAIN_PARTICLE_COUNT, width, height);
    const cloudSystem = new CloudSystem(8, width);

    if (settings.weatherEnabled) {
      rainSystem.enable();
    }

    // Buildings using extracted class (Phase 1 - Improvement #15)
    const buildings: Building[] = [];
    for (let i = 0; i < RENDERING_CONFIG.NUM_BUILDINGS; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      buildings.push(new Building(side));
    }

    // Traffic vehicles
    const vehicles: Vehicle[] = [];
    for (let i = 0; i < RENDERING_CONFIG.NUM_VEHICLES; i++) {
      const isEmergency = i < RENDERING_CONFIG.NUM_EMERGENCY_VEHICLES;
      vehicles.push({
        lane: Math.floor(Math.random() * VEHICLE_CONFIG.LANES.length),
        z: Math.random() * RENDERING_CONFIG.CITY_DEPTH + 200,
        speed: isEmergency
          ? VEHICLE_CONFIG.EMERGENCY_SPEED_MIN + Math.random() * (VEHICLE_CONFIG.EMERGENCY_SPEED_MAX - VEHICLE_CONFIG.EMERGENCY_SPEED_MIN)
          : VEHICLE_CONFIG.NORMAL_SPEED_MIN + Math.random() * (VEHICLE_CONFIG.NORMAL_SPEED_MAX - VEHICLE_CONFIG.NORMAL_SPEED_MIN),
        color: isEmergency ? "rgba(255, 255, 255, 1)" : (Math.random() > 0.7 ? "rgba(255, 50, 50, 1)" : "rgba(100, 200, 255, 1)"),
        isEmergency
      });
    }

    // Flying vehicles
    const flyingVehicles: FlyingVehicle[] = [];
    for (let i = 0; i < RENDERING_CONFIG.NUM_FLYING_VEHICLES; i++) {
      flyingVehicles.push({
        x: (Math.random() - 0.5) * RENDERING_CONFIG.ROAD_WIDTH * 4,
        y: 80 + Math.random() * 120,
        z: Math.random() * RENDERING_CONFIG.CITY_DEPTH + 200,
        speed: 200 + Math.random() * 100,
        bobPhase: Math.random() * Math.PI * 2
      });
    }

    const projectPoint = (p: Point3D, totalCamX: number = 0): Point2D => {
      const z = Math.max(p.z, 10);
      const scale = (RENDERING_CONFIG.FOV * pinchZoom) / z;
      const offsetX = (p.x - totalCamX) * scale;
      return {
        x: cx + offsetX,
        y: cy - (p.y - RENDERING_CONFIG.CAMERA_HEIGHT) * scale - camera.smoothMouseY * RENDERING_CONFIG.PARALLAX_Y_MULTIPLIER
      };
    };

    const drawEdge = (a: Point3D, b: Point3D, camX: number = 0) => {
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
      const segLength = RENDERING_CONFIG.CITY_DEPTH / segments;

      ctx.lineWidth = 1;

      for (let i = 0; i < segments; i++) {
        const z0 = i * segLength - (t % segLength);
        const z1 = z0 + segLength * 0.9;

        if (z1 < 40) continue;

        const left0 = { x: -RENDERING_CONFIG.ROAD_WIDTH, y: 0, z: z0 };
        const right0 = { x: RENDERING_CONFIG.ROAD_WIDTH, y: 0, z: z0 };
        const left1 = { x: -RENDERING_CONFIG.ROAD_WIDTH, y: 0, z: z1 };
        const right1 = { x: RENDERING_CONFIG.ROAD_WIDTH, y: 0, z: z1 };

        ctx.strokeStyle = colorCache.line;
        drawEdge(left0, left1, camX);
        drawEdge(right0, right1, camX);

        if (i % 2 === 0) {
          const mid0 = { x: 0, y: 0.1, z: z0 };
          const mid1 = { x: 0, y: 0.1, z: z1 };
          ctx.strokeStyle = colorCache.roadLine;
          drawEdge(mid0, mid1, camX);
        }
      }

      // Street lights
      const lightSpacing = LIGHTING_CONFIG.STREET_LIGHT_SPACING;
      const numLights = Math.floor(RENDERING_CONFIG.CITY_DEPTH / lightSpacing);

      for (let i = 0; i < numLights; i++) {
        const lz = i * lightSpacing + 100 - ((now * 0.0005 * RENDERING_CONFIG.SPEED_BASE) % lightSpacing);
        if (lz < 40 || lz > RENDERING_CONFIG.CITY_DEPTH) continue;

        // Left light
        const leftBase = { x: -RENDERING_CONFIG.ROAD_WIDTH - 10, y: 0, z: lz };
        const leftTop = { x: -RENDERING_CONFIG.ROAD_WIDTH - 10, y: LIGHTING_CONFIG.STREET_LIGHT_HEIGHT, z: lz };
        ctx.strokeStyle = hexToRgba(colorCache.accent, 0.5);
        ctx.lineWidth = 2;
        drawEdge(leftBase, leftTop, camX);

        const leftPos = projectPoint(leftTop, camX);
        const pulsePhase = (now * 0.001 + i * 0.3) % 2;
        const intensity = 0.6 + Math.sin(pulsePhase * Math.PI) * 0.4;
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = colorCache.roadLine;
        ctx.shadowBlur = LIGHTING_CONFIG.STREET_LIGHT_HALO_BLUR;
        ctx.shadowColor = hexToRgba(colorCache.accent, 0.8);
        ctx.fillRect(leftPos.x - 2, leftPos.y - 2, 4, 4);

        // Light cone
        ctx.shadowBlur = 0;
        ctx.globalAlpha = intensity * LIGHTING_CONFIG.STREET_LIGHT_CONE_ALPHA;
        ctx.fillStyle = hexToRgba(colorCache.accent, 0.2);
        ctx.beginPath();
        ctx.moveTo(leftPos.x, leftPos.y);
        ctx.lineTo(leftPos.x - 15, leftPos.y + 40);
        ctx.lineTo(leftPos.x + 15, leftPos.y + 40);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Right light (mirror)
        const rightBase = { x: RENDERING_CONFIG.ROAD_WIDTH + 10, y: 0, z: lz };
        const rightTop = { x: RENDERING_CONFIG.ROAD_WIDTH + 10, y: LIGHTING_CONFIG.STREET_LIGHT_HEIGHT, z: lz };
        ctx.strokeStyle = hexToRgba(colorCache.accent, 0.5);
        ctx.lineWidth = 2;
        drawEdge(rightBase, rightTop, camX);

        const rightPos = projectPoint(rightTop, camX);
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = colorCache.roadLine;
        ctx.shadowBlur = LIGHTING_CONFIG.STREET_LIGHT_HALO_BLUR;
        ctx.shadowColor = hexToRgba(colorCache.accent, 0.8);
        ctx.fillRect(rightPos.x - 2, rightPos.y - 2, 4, 4);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = intensity * LIGHTING_CONFIG.STREET_LIGHT_CONE_ALPHA;
        ctx.fillStyle = hexToRgba(colorCache.accent, 0.2);
        ctx.beginPath();
        ctx.moveTo(rightPos.x, rightPos.y);
        ctx.lineTo(rightPos.x - 15, rightPos.y + 40);
        ctx.lineTo(rightPos.x + 15, rightPos.y + 40);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Phase 4 - Improvement #10: Road reflections
      if (settings.reflectionsEnabled && weatherState.rainEnabled) {
        drawRoadReflections(now, camX);
      }
    };

    // Phase 4 - Improvement #10: Neon reflections on wet road
    const drawRoadReflections = (now: number, camX: number) => {
      ctx.globalAlpha = 0.3;
      ctx.save();
      ctx.translate(0, cy);
      ctx.scale(1, -0.5); // Mirror and compress vertically
      ctx.translate(0, -cy);

      // Re-draw simplified building outlines as reflections
      buildings.forEach(b => {
        if (b.z > RENDERING_CONFIG.LOD_DISTANCE_MID) return; // Only nearby buildings

        const v = b.getVertices();
        ctx.strokeStyle = hexToRgba(colorCache.accent, 0.2);
        ctx.lineWidth = 0.8;

        const p0 = projectPoint(v[0], camX);
        const p1 = projectPoint(v[1], camX);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      });

      ctx.restore();
      ctx.globalAlpha = 1;
    };

    // Phase 4 - Improvement #9: Atmospheric depth fog
    const drawAtmosphericFog = () => {
      const fogGradient = ctx.createLinearGradient(0, RENDERING_CONFIG.HORIZON_Y, 0, height);
      fogGradient.addColorStop(0, hexToRgba(colorCache.accent, 0.05));
      fogGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
      fogGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, RENDERING_CONFIG.HORIZON_Y, width, height - RENDERING_CONFIG.HORIZON_Y);
    };

    // Phase 5 - Improvement #14: Speed lines during boost
    const drawSpeedLines = (now: number) => {
      if (!boostState.active || !settings.speedLinesEnabled) return;

      const lineCount = 20;
      const progress = (boostState.endTime - now) / RENDERING_CONFIG.BOOST_DURATION;

      ctx.globalAlpha = 0.3 * progress;
      ctx.strokeStyle = hexToRgba(colorCache.accent, 0.8);
      ctx.lineWidth = 1;

      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const dist = 100 + (1 - progress) * 300;
        const x1 = cx + Math.cos(angle) * dist;
        const y1 = cy + Math.sin(angle) * dist;
        const x2 = cx + Math.cos(angle) * (dist + 50);
        const y2 = cy + Math.sin(angle) * (dist + 50);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    // Phase 4 - Improvement #8: Rain rendering
    const drawRain = (now: number, camX: number) => {
      if (!weatherState.rainEnabled) return;

      const raindrops = rainSystem.getRainDrops();

      ctx.strokeStyle = 'rgba(200, 220, 255, 0.3)';
      ctx.lineWidth = PARTICLE_CONFIG.RAIN_THICKNESS;
      ctx.globalAlpha = 0.6;

      raindrops.forEach(drop => {
        const p1 = projectPoint({ x: drop.x, y: drop.y, z: drop.z }, camX);
        const p2 = projectPoint({ x: drop.x, y: drop.y - drop.length, z: drop.z }, camX);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
    };

    // Phase 2 - Improvement #7: FPS throttling
    let lastFrameTime = 0;
    const fpsInterval = settings.fpsTarget === 'unlimited' ? 0 : 1000 / settings.fpsTarget;

    let frameId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      // FPS throttling
      if (fpsInterval > 0) {
        const elapsed = now - lastFrameTime;
        if (elapsed < fpsInterval) {
          frameId = requestAnimationFrame(render);
          return;
        }
        lastFrameTime = now - (elapsed % fpsInterval);
      }

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Check boost state
      if (boostState.active && now > boostState.endTime) {
        boostState.active = false;
      }

      ctx.clearRect(0, 0, width, height);

      const pulse = 1 + Math.sin(now * 0.0007) * 0.08;
      const baseSpeed = RENDERING_CONFIG.SPEED_BASE * pulse;
      speed = boostState.active ? baseSpeed * RENDERING_CONFIG.BOOST_SPEED_MULTIPLIER : baseSpeed;

      // Mouse parallax (smooth interpolation)
      camera.smoothMouseX += (mouseX * RENDERING_CONFIG.PARALLAX_STRENGTH - camera.smoothMouseX) * RENDERING_CONFIG.PARALLAX_SMOOTHING * dt;
      camera.smoothMouseY += (mouseY * RENDERING_CONFIG.PARALLAX_STRENGTH - camera.smoothMouseY) * RENDERING_CONFIG.PARALLAX_SMOOTHING * dt;

      const totalCameraX = camera.smoothMouseX;

      const horizonY = RENDERING_CONFIG.HORIZON_Y;
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, width, horizonY);

      // Update particle systems (Phase 2 - Object pooling)
      starSystem.update(dt, speed);
      steamSystem.spawn();
      steamSystem.update(dt);
      rainSystem.update(dt, speed);
      cloudSystem.update(dt, speed);

      // Background - stars
      const stars = starSystem.getStars();
      stars.forEach(p => {
        const projected = projectPoint(p, totalCameraX);
        if (projected.y < horizonY) {
          const twinkle = 0.5 + Math.sin(now * 0.001 * (p.z % 10)) * 0.5;
          ctx.globalAlpha = twinkle * 0.6;
          ctx.fillStyle = RENDERING_CONFIG.STAR_COLOR;
          ctx.shadowBlur = 2;
          ctx.shadowColor = "rgba(255, 200, 150, 0.8)";
          ctx.fillRect(projected.x, projected.y, p.size, p.size);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      });

      // Phase 4 - Improvement #12: Clouds
      if (settings.reflectionsEnabled) {
        const clouds = cloudSystem.getClouds();
        clouds.forEach(cloud => {
          const p1 = projectPoint({ x: cloud.x - cloud.width / 2, y: cloud.y, z: cloud.z }, totalCameraX);
          const p2 = projectPoint({ x: cloud.x + cloud.width / 2, y: cloud.y, z: cloud.z }, totalCameraX);

          ctx.globalAlpha = cloud.opacity;
          const gradient = ctx.createRadialGradient(
            (p1.x + p2.x) / 2, p1.y,
            0,
            (p1.x + p2.x) / 2, p1.y,
            (p2.x - p1.x) / 2
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(p1.x, p1.y - cloud.height / 2, p2.x - p1.x, cloud.height);
          ctx.globalAlpha = 1;
        });
      }

      ctx.strokeStyle = colorCache.horizon;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Phase 4 - Improvement #9: Atmospheric fog
      drawAtmosphericFog();

      // Road
      drawRoad(now, totalCameraX);

      // Steam particles
      const steamParticles = steamSystem.getParticles();
      steamParticles.forEach(sp => {
        const distance = sp.z;
        if (distance < RENDERING_CONFIG.CITY_DEPTH) {
          const projected = projectPoint(sp, totalCameraX);
          const lifeProgress = sp.age / sp.maxAge;
          const alpha = (1 - lifeProgress) * 0.3 * (1 - (distance - 200) / RENDERING_CONFIG.CITY_DEPTH);

          if (alpha > 0.01) {
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle = RENDERING_CONFIG.SMOKE_COLOR;
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(150, 150, 150, 0.3)';
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, sp.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });
      ctx.globalAlpha = 1;

      // Vehicles (simplified for brevity - similar to original)
      vehicles.forEach(v => {
        v.z -= v.speed * dt;
        if (v.z < 40) {
          v.z = RENDERING_CONFIG.CITY_DEPTH + Math.random() * 400;
          v.lane = Math.floor(Math.random() * VEHICLE_CONFIG.LANES.length);
        }

        const vx = VEHICLE_CONFIG.LANES[v.lane];
        const vehicleSize = VEHICLE_CONFIG.VEHICLE_SIZE;
        const vehicleHeight = VEHICLE_CONFIG.VEHICLE_HEIGHT;

        const verts = [
          { x: vx - vehicleSize/2, y: 0, z: v.z },
          { x: vx + vehicleSize/2, y: 0, z: v.z },
          { x: vx - vehicleSize/2, y: vehicleHeight, z: v.z },
          { x: vx + vehicleSize/2, y: vehicleHeight, z: v.z },
          { x: vx - vehicleSize/2, y: 0, z: v.z + vehicleSize * 1.5 },
          { x: vx + vehicleSize/2, y: 0, z: v.z + vehicleSize * 1.5 },
        ];

        const projected = verts.map(pt => projectPoint(pt, totalCameraX));
        const distance = v.z;
        const alpha = Math.max(0, Math.min(1, 1 - (distance - 200) / RENDERING_CONFIG.CITY_DEPTH));

        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        ctx.lineTo(projected[3].x, projected[3].y);
        ctx.lineTo(projected[2].x, projected[2].y);
        ctx.closePath();
        ctx.stroke();

        // Emergency strobes
        if (distance < 500 && v.isEmergency) {
          const strobePhase = Math.floor(now / VEHICLE_CONFIG.STROBE_INTERVAL) % 2;
          const strobeColor = strobePhase === 0 ? "rgba(255, 0, 0, 1)" : "rgba(0, 100, 255, 1)";

          ctx.fillStyle = strobeColor;
          ctx.shadowBlur = 12;
          ctx.shadowColor = strobeColor;
          ctx.fillRect(projected[4].x - 2, projected[4].y - 2, 4, 4);
          ctx.fillRect(projected[5].x - 2, projected[5].y - 2, 4, 4);
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
      });

      // Flying vehicles (simplified)
      flyingVehicles.forEach(fv => {
        fv.z -= fv.speed * dt;
        fv.bobPhase += dt * 2;

        if (fv.z < 40) {
          fv.z = RENDERING_CONFIG.CITY_DEPTH + Math.random() * 400;
          fv.x = (Math.random() - 0.5) * RENDERING_CONFIG.ROAD_WIDTH * 4;
          fv.y = 80 + Math.random() * 120;
        }

        const bobAmount = Math.sin(fv.bobPhase) * 8;
        const currentY = fv.y + bobAmount;

        const droneSize = 6;
        const verts = [
          { x: fv.x, y: currentY + droneSize, z: fv.z },
          { x: fv.x + droneSize, y: currentY, z: fv.z },
          { x: fv.x, y: currentY - droneSize, z: fv.z },
          { x: fv.x - droneSize, y: currentY, z: fv.z },
        ];

        const projected = verts.map(v => projectPoint(v, totalCameraX));
        const distance = fv.z;
        const alpha = Math.max(0, Math.min(1, 1 - (distance - 200) / RENDERING_CONFIG.CITY_DEPTH));

        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = hexToRgba(colorCache.accent, 0.8);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        ctx.lineTo(projected[2].x, projected[2].y);
        ctx.lineTo(projected[3].x, projected[3].y);
        ctx.closePath();
        ctx.stroke();

        ctx.globalAlpha = 1;
      });

      // Buildings - with LOD system (Phase 2 - Improvement #3)
      buildings.sort((a, b) => (b.z + b.depth) - (a.z + a.depth));

      buildings.forEach(b => {
        b.update(dt, speed);
        const v = b.getVertices();
        const distance = b.z;
        const fogFactor = Math.max(0, Math.min(1, (distance - 200) / RENDERING_CONFIG.CITY_DEPTH));
        const alpha = 0.7 - fogFactor * 0.5;

        // Draw building wireframe (simplified - full implementation would match original)
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = hexToRgba(colorCache.accent, alpha);
        ctx.lineWidth = 1.2;

        // Front face
        drawEdge(v[0], v[1], totalCameraX);
        drawEdge(v[1], v[3], totalCameraX);
        drawEdge(v[3], v[2], totalCameraX);
        drawEdge(v[2], v[0], totalCameraX);

        // Phase 2 - Improvement #3: LOD for windows
        if (b.shouldRenderWindows(distance)) {
          const renderRatio = b.getWindowRenderRatio(distance);
          const windowWidth = b.width / b.windowCols;
          const windowHeight = b.height / b.windowRows;

          b.windows.forEach((win, idx) => {
            // Skip windows based on LOD ratio
            if (Math.random() > renderRatio) return;

            const flickerPhase = (now * 0.001 + win.flicker) % 1;
            const isFlickering = flickerPhase < LIGHTING_CONFIG.WINDOW_FLICKER_THRESHOLD && Math.random() > 0.8;

            if (win.lit && !isFlickering) {
              const wx = b.x - b.width / 2 + (win.x + 0.5) * windowWidth;
              const wy = (win.y + 0.5) * windowHeight;
              const wz = b.z + b.depth * 0.3;

              const projected = projectPoint({ x: wx, y: wy, z: wz }, totalCameraX);

              ctx.globalAlpha = alpha * 0.8;
              ctx.fillStyle = hexToRgba(colorCache.accent, 0.9);
              ctx.shadowBlur = LIGHTING_CONFIG.WINDOW_GLOW_BLUR;
              ctx.shadowColor = hexToRgba(colorCache.accent, 0.8);
              ctx.fillRect(projected.x - 1, projected.y - 1, 2, 2);
              ctx.shadowBlur = 0;
            }
          });
        }

        ctx.globalAlpha = 1;
      });

      // Phase 4 - Improvement #8: Rain
      drawRain(now, totalCameraX);

      // Phase 5 - Improvement #14: Speed lines
      drawSpeedLines(now);

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouchStart as any);
      canvas.removeEventListener("touchmove", handleTouchMove as any);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchstart", handleTouchDoubleTap as any);
    };
  }, [settings]);

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

export default NeonCityOptimized;
