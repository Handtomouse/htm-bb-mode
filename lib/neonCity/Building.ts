import { BUILDING_CONFIG, RENDERING_CONFIG } from './config';

export type BuildingType = 'residential' | 'commercial' | 'tower';
export type RooftopType = 'antenna' | 'helipad' | 'dish' | 'none';
export type BillboardPattern = 'grid' | 'bars' | 'pulse' | 'wave';
export type LightWavePattern = 'none' | 'vertical' | 'horizontal' | 'spiral';

export interface Window {
  x: number;
  y: number;
  lit: boolean;
  flicker: number;
}

export class Building {
  side: number;
  x = 0;
  width = 0;
  depth = 0;
  height = 0;
  z = 0;
  windows: Window[] = [];
  windowCols = 0;
  windowRows = 0;
  type: BuildingType = 'residential';
  hasSign = false;
  signText = '';
  rooftopType: RooftopType = 'none';
  hasBillboard = false;
  billboardPattern: BillboardPattern = 'grid';
  billboardPhase = 0;
  lightWavePattern: LightWavePattern = 'none';
  lightWaveSpeed = 1;
  hasSearchlight = false;
  searchlightAngle = 0;
  searchlightSpeed = 1;

  // Animation state for Phase 5
  lightSequencePhase = 0;
  powerSurgeTime = 0;

  constructor(side: number) {
    this.side = side;
    this.reset(true);
  }

  reset(initial: boolean = false) {
    const laneOffset = RENDERING_CONFIG.ROAD_WIDTH * BUILDING_CONFIG.LANE_OFFSET_MULTIPLIER;
    const spread = BUILDING_CONFIG.SPREAD;

    const sideOffset = laneOffset + Math.random() * spread;
    this.x = this.side * sideOffset;
    this.width = BUILDING_CONFIG.MIN_WIDTH + Math.random() * (BUILDING_CONFIG.MAX_WIDTH - BUILDING_CONFIG.MIN_WIDTH);
    this.depth = BUILDING_CONFIG.MIN_DEPTH + Math.random() * (BUILDING_CONFIG.MAX_DEPTH - BUILDING_CONFIG.MIN_DEPTH);
    this.height = BUILDING_CONFIG.MIN_HEIGHT + Math.random() * (BUILDING_CONFIG.MAX_HEIGHT - BUILDING_CONFIG.MIN_HEIGHT);

    this.z = initial
      ? Math.random() * RENDERING_CONFIG.CITY_DEPTH + 80
      : RENDERING_CONFIG.CITY_DEPTH + 80 + Math.random() * 400;

    // Determine building type
    const typeRoll = Math.random();
    if (typeRoll < BUILDING_CONFIG.TOWER_CHANCE) {
      this.type = 'tower';
      this.height *= BUILDING_CONFIG.TOWER_HEIGHT_MULTIPLIER;
    } else if (typeRoll < BUILDING_CONFIG.TOWER_CHANCE + BUILDING_CONFIG.COMMERCIAL_CHANCE) {
      this.type = 'commercial';
    } else {
      this.type = 'residential';
    }

    // Add windows
    this.windowCols = Math.floor(this.width / BUILDING_CONFIG.WINDOW_SPACING);
    this.windowRows = Math.floor(this.height / BUILDING_CONFIG.WINDOW_ROW_HEIGHT);
    this.windows = [];

    for (let row = 0; row < this.windowRows; row++) {
      for (let col = 0; col < this.windowCols; col++) {
        this.windows.push({
          x: col,
          y: row,
          lit: Math.random() > (1 - BUILDING_CONFIG.WINDOW_LIT_CHANCE),
          flicker: Math.random() * 1000
        });
      }
    }

    // Neon signs
    this.hasSign = Math.random() < BUILDING_CONFIG.SIGN_CHANCE;
    if (this.hasSign) {
      this.signText = BUILDING_CONFIG.SIGN_TEXTS[Math.floor(Math.random() * BUILDING_CONFIG.SIGN_TEXTS.length)];
    }

    // Rooftop details
    if (Math.random() < BUILDING_CONFIG.ROOFTOP_CHANCE) {
      const rooftops: RooftopType[] = ['antenna', 'helipad', 'dish'];
      this.rooftopType = rooftops[Math.floor(Math.random() * rooftops.length)];
    } else {
      this.rooftopType = 'none';
    }

    // Holographic billboards
    this.hasBillboard = (this.type === 'commercial' || this.type === 'tower') && Math.random() < BUILDING_CONFIG.BILLBOARD_CHANCE;
    if (this.hasBillboard) {
      const patterns: BillboardPattern[] = ['grid', 'bars', 'pulse', 'wave'];
      this.billboardPattern = patterns[Math.floor(Math.random() * patterns.length)];
      this.billboardPhase = Math.random() * Math.PI * 2;
    }

    // Light wave patterns
    if (this.type === 'tower' && Math.random() < BUILDING_CONFIG.LIGHT_WAVE_CHANCE) {
      const wavePatterns: Exclude<LightWavePattern, 'none'>[] = ['vertical', 'horizontal', 'spiral'];
      this.lightWavePattern = wavePatterns[Math.floor(Math.random() * wavePatterns.length)];
      this.lightWaveSpeed = 0.5 + Math.random() * 1.5;
    } else {
      this.lightWavePattern = 'none';
    }

    // Rotating searchlights
    this.hasSearchlight = (this.type === 'tower' || this.type === 'commercial') && this.height > 200 && Math.random() < BUILDING_CONFIG.SEARCHLIGHT_CHANCE;
    if (this.hasSearchlight) {
      this.searchlightAngle = Math.random() * Math.PI * 2;
      this.searchlightSpeed = 0.3 + Math.random() * 0.7;
    }

    // Animation initialization
    this.lightSequencePhase = Math.random() * Math.PI * 2;
    this.powerSurgeTime = 0;
  }

  update(dt: number, speed: number) {
    this.z -= speed * dt;
    if (this.z + this.depth < 40) {
      this.reset(false);
    }

    // Update searchlight rotation
    if (this.hasSearchlight) {
      this.searchlightAngle += this.searchlightSpeed * dt;
    }

    // Update animation phases (Phase 5)
    this.lightSequencePhase += dt * 0.5;
    if (this.powerSurgeTime > 0) {
      this.powerSurgeTime -= dt;
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

  // LOD helper - Phase 2
  shouldRenderWindows(distance: number): boolean {
    return distance < RENDERING_CONFIG.LOD_DISTANCE_FAR;
  }

  getWindowRenderRatio(distance: number): number {
    if (distance > RENDERING_CONFIG.LOD_DISTANCE_FAR) return 0;
    if (distance > RENDERING_CONFIG.LOD_DISTANCE_MID) return RENDERING_CONFIG.LOD_WINDOW_REDUCTION;
    return 1;
  }

  // Phase 5: Trigger power surge animation
  triggerPowerSurge() {
    this.powerSurgeTime = 0.5; // 500ms surge duration
  }
}
