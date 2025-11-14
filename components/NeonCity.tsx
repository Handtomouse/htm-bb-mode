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

    // AMBER THEME COLORS
    const LINE_COL = "rgba(255, 157, 35, 0.7)";        // #ff9d23 amber
    const ROAD_LINE_COL = "rgba(255, 200, 100, 0.9)"; // lighter amber
    const HORIZON_COL = "rgba(255, 157, 35, 0.2)";

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
    const vehicles: Array<{ lane: number; z: number; speed: number; color: string }> = [];
    for (let i = 0; i < 12; i++) {
      const lanes = [-ROAD_WIDTH * 0.5, -ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.5];
      vehicles.push({
        lane: Math.floor(Math.random() * lanes.length),
        z: Math.random() * CITY_DEPTH + 200,
        speed: 180 + Math.random() * 150,
        color: Math.random() > 0.7 ? "rgba(255, 50, 50, 1)" : "rgba(100, 200, 255, 1)"
      });
    }

    const projectPoint = (p: { x: number; y: number; z: number }) => {
      const z = Math.max(p.z, 10);
      const scale = FOV / z;
      // Apply camera offset for turning effect
      const offsetX = (p.x - cameraOffsetX) * scale;
      return {
        x: cx + offsetX,
        y: cy - p.y * scale
      };
    };

    const drawEdge = (a: any, b: any) => {
      const pa = projectPoint(a);
      const pb = projectPoint(b);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    };

    const drawRoad = (now: number) => {
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
        ctx.strokeStyle = LINE_COL;
        drawEdge(left0, left1);
        drawEdge(right0, right1);

        // centre broken line
        if (i % 2 === 0) {
          const mid0 = { x: 0, y: 0.1, z: z0 };
          const mid1 = { x: 0, y: 0.1, z: z1 };
          ctx.strokeStyle = ROAD_LINE_COL;
          drawEdge(mid0, mid1);
        }
      }

      // extra perspective guide rails with pulsing lights
      ctx.strokeStyle = "rgba(255, 157, 35, 0.4)";
      const guideOffset = ROAD_WIDTH * 2.4;
      drawEdge({ x: -guideOffset, y: 0, z: 40 }, { x: 0, y: 0, z: CITY_DEPTH });
      drawEdge({ x: guideOffset, y: 0, z: 40 }, { x: 0, y: 0, z: CITY_DEPTH });

      // Street lights along road edges
      const lightSpacing = 180;
      const numLights = Math.floor(CITY_DEPTH / lightSpacing);

      for (let i = 0; i < numLights; i++) {
        const lz = i * lightSpacing + 100 - ((now * 0.0005 * SPEED_BASE) % lightSpacing);
        if (lz < 40 || lz > CITY_DEPTH) continue;

        // Left side lights
        const leftBase = { x: -ROAD_WIDTH - 10, y: 0, z: lz };
        const leftTop = { x: -ROAD_WIDTH - 10, y: 35, z: lz };
        ctx.strokeStyle = "rgba(255, 157, 35, 0.5)";
        ctx.lineWidth = 2;
        drawEdge(leftBase, leftTop);

        // Light halo
        const leftPos = projectPoint(leftTop);
        const pulsePhase = (now * 0.001 + i * 0.3) % 2;
        const intensity = 0.6 + Math.sin(pulsePhase * Math.PI) * 0.4;
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = "rgba(255, 200, 100, 1)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(255, 200, 100, 0.8)";
        ctx.fillRect(leftPos.x - 2, leftPos.y - 2, 4, 4);

        // Light cone effect
        ctx.shadowBlur = 0;
        ctx.globalAlpha = intensity * 0.15;
        ctx.fillStyle = "rgba(255, 200, 100, 0.2)";
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
        ctx.strokeStyle = "rgba(255, 157, 35, 0.5)";
        ctx.lineWidth = 2;
        drawEdge(rightBase, rightTop);

        const rightPos = projectPoint(rightTop);
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = "rgba(255, 200, 100, 1)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(255, 200, 100, 0.8)";
        ctx.fillRect(rightPos.x - 2, rightPos.y - 2, 4, 4);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = intensity * 0.15;
        ctx.fillStyle = "rgba(255, 200, 100, 0.2)";
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

      ctx.clearRect(0, 0, width, height);

      const pulse = 1 + Math.sin(now * 0.0007) * 0.08;
      speed = SPEED_BASE * pulse;

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

        const projected = projectPoint(p);
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

      ctx.strokeStyle = HORIZON_COL;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Road
      drawRoad(now);

      // Traffic vehicles
      const lanes = [-ROAD_WIDTH * 0.5, -ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.2, ROAD_WIDTH * 0.5];
      vehicles.forEach(v => {
        v.z -= v.speed * dt;
        if (v.z < 40) {
          v.z = CITY_DEPTH + Math.random() * 400;
          v.lane = Math.floor(Math.random() * lanes.length);
          v.color = Math.random() > 0.7 ? "rgba(255, 50, 50, 1)" : "rgba(100, 200, 255, 1)";
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

        const projected = verts.map(projectPoint);
        const distance = v.z;
        const alpha = Math.max(0, Math.min(1, 1 - (distance - 200) / CITY_DEPTH));

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
          ctx.fillStyle = v.color;
          ctx.shadowBlur = 4;
          ctx.shadowColor = v.color;
          ctx.fillRect(projected[4].x - 1, projected[4].y - 1, 2, 2);
          ctx.fillRect(projected[5].x - 1, projected[5].y - 1, 2, 2);
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
      });

      // Buildings
      buildings.sort(
        (a, b) => (b.z + b.depth) - (a.z + a.depth)
      );

      ctx.strokeStyle = LINE_COL;
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
        ctx.strokeStyle = `rgba(255, 157, 35, ${alpha})`;
        ctx.lineWidth = 1.2;
        drawEdge(v[0], v[1]);
        drawEdge(v[1], v[3]);
        drawEdge(v[3], v[2]);
        drawEdge(v[2], v[0]);

        // Back rectangle (dimmer)
        ctx.globalAlpha = alpha * 0.6;
        drawEdge(v[4], v[5]);
        drawEdge(v[5], v[7]);
        drawEdge(v[7], v[6]);
        drawEdge(v[6], v[4]);

        // Connect front/back (side edges)
        ctx.globalAlpha = alpha * 0.7;
        drawEdge(v[0], v[4]);
        drawEdge(v[1], v[5]);
        drawEdge(v[2], v[6]);
        drawEdge(v[3], v[7]);

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

              const projected = projectPoint({ x: wx, y: wy, z: wz });

              // Window glow
              ctx.globalAlpha = alpha * 0.8;
              ctx.fillStyle = "rgba(255, 200, 100, 0.9)";
              ctx.shadowBlur = 3;
              ctx.shadowColor = "rgba(255, 200, 100, 0.8)";
              ctx.fillRect(projected.x - 1, projected.y - 1, 2, 2);
              ctx.shadowBlur = 0;
            }
          });
        }

        // Draw neon sign
        if (b.hasSign && distance < 600) {
          const signY = b.height * 0.7;
          const signPos = projectPoint({ x: b.x, y: signY, z: b.z });

          ctx.globalAlpha = alpha;
          ctx.fillStyle = "rgba(255, 157, 35, 1)";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(255, 157, 35, 0.9)";
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
          ctx.strokeStyle = `rgba(255, 157, 35, ${alpha * 0.8})`;
          ctx.lineWidth = 1;

          if (b.rooftopType === 'antenna') {
            // Vertical antenna
            drawEdge(roofBase, roofTop);
            // Blinking light on top
            if (Math.floor(now / 500) % 2 === 0) {
              const lightPos = projectPoint(roofTop);
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
            drawEdge(pad1, pad2);
          } else if (b.rooftopType === 'dish') {
            // Satellite dish
            const dishBase = { x: b.x, y: b.height + 5, z: b.z };
            drawEdge(roofBase, dishBase);
            const p = projectPoint(dishBase);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
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
        pointerEvents: "none",
        opacity: 0.3
      }}
    />
  );
};

export default NeonCity;
