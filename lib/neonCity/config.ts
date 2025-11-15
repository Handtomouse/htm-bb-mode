// NeonCity Configuration
// Centralized constants for the 3D cyberpunk city renderer

export const RENDERING_CONFIG = {
  // Camera & Projection
  FOV: 550,
  CAMERA_HEIGHT: 80, // Units above ground level
  CAMERA_CENTER_Y: 0.5, // 50% down screen
  HORIZON_Y: 65, // Pixels from top

  // World Dimensions
  ROAD_WIDTH: 80,
  CITY_DEPTH: 2200,

  // Performance
  LOD_DISTANCE_FAR: 1500, // Skip windows beyond this
  LOD_DISTANCE_MID: 800, // Reduce window count here
  LOD_WINDOW_REDUCTION: 0.25, // Render 25% of windows in mid range
  DEFAULT_FPS_CAP: 60,
  ENABLE_DIRTY_RECT: false, // Experimental
  ENABLE_OFFSCREEN_CANVAS: true,

  // Animation
  SPEED_BASE: 260, // World units per second
  BOOST_SPEED_MULTIPLIER: 1.8,
  BOOST_DURATION: 3000, // ms
  BOOST_COOLDOWN: 8000, // ms

  // Mouse Parallax
  PARALLAX_STRENGTH: 30,
  PARALLAX_Y_MULTIPLIER: 0.2,
  PARALLAX_SMOOTHING: 3,

  // Entities
  NUM_BUILDINGS: 26,
  NUM_PARTICLES: 80,
  NUM_VEHICLES: 12,
  NUM_EMERGENCY_VEHICLES: 3,
  NUM_FLYING_VEHICLES: 6,
  NUM_STEAM_VENTS: 5,

  // Weather (Phase 4)
  WEATHER_ENABLED: false,
  RAIN_PARTICLE_COUNT: 200,
  FOG_DENSITY: 0.3,
  LIGHTNING_ENABLED: false,

  // Visual Effects (Phase 5)
  GLOW_ENABLED: true,
  SPEED_LINES_ENABLED: true,
  REFLECTIONS_ENABLED: true,
  CLOUD_LAYER_ENABLED: true,

  // Colors (cached, updated on theme change)
  STAR_COLOR: "rgba(255, 200, 150, 1)",
  SMOKE_COLOR: "rgba(200, 200, 200, 0.4)",
};

export const BUILDING_CONFIG = {
  MIN_WIDTH: 40,
  MAX_WIDTH: 130,
  MIN_DEPTH: 80,
  MAX_DEPTH: 240,
  MIN_HEIGHT: 120,
  MAX_HEIGHT: 380,

  TOWER_CHANCE: 0.3,
  COMMERCIAL_CHANCE: 0.3,
  TOWER_HEIGHT_MULTIPLIER: 1.3,

  WINDOW_SPACING: 12,
  WINDOW_ROW_HEIGHT: 15,
  WINDOW_LIT_CHANCE: 0.7,

  SIGN_CHANCE: 0.2,
  ROOFTOP_CHANCE: 0.4,
  BILLBOARD_CHANCE: 0.15,
  SEARCHLIGHT_CHANCE: 0.2,
  LIGHT_WAVE_CHANCE: 0.25,

  LANE_OFFSET_MULTIPLIER: 1.2,
  SPREAD: 220,

  SIGN_TEXTS: ['HTM', 'SWICH', 'OPEN', 'CAFE', 'BAR', 'HOTEL', 'SHOP'],
};

export const VEHICLE_CONFIG = {
  LANES: [-40, -16, 16, 40], // Derived from ROAD_WIDTH
  VEHICLE_SIZE: 8,
  VEHICLE_HEIGHT: 5,

  EMERGENCY_SPEED_MIN: 300,
  EMERGENCY_SPEED_MAX: 400,
  NORMAL_SPEED_MIN: 180,
  NORMAL_SPEED_MAX: 330,

  MOTION_BLUR_TRAILS: 4,
  MOTION_BLUR_SPACING: 15,

  STROBE_INTERVAL: 100, // ms for emergency lights
};

export const PARTICLE_CONFIG = {
  // Stars
  STAR_MIN_SIZE: 0.5,
  STAR_MAX_SIZE: 2,
  STAR_MIN_SPEED: 0.1,
  STAR_MAX_SPEED: 0.2,
  STAR_DEPTH_MIN: 800,

  // Steam
  STEAM_SPAWN_CHANCE: 0.08,
  STEAM_MIN_LIFETIME: 2,
  STEAM_MAX_LIFETIME: 4,
  STEAM_MIN_SIZE: 3,
  STEAM_MAX_SIZE: 8,
  STEAM_RISE_SPEED: 30,
  STEAM_EXPAND_RATE: 2,

  // Rain (Phase 4)
  RAIN_FALL_SPEED: 800,
  RAIN_WIND_DRIFT: 50,
  RAIN_LENGTH: 20,
  RAIN_THICKNESS: 1,
};

export const LIGHTING_CONFIG = {
  STREET_LIGHT_SPACING: 180,
  STREET_LIGHT_HEIGHT: 35,
  STREET_LIGHT_HALO_BLUR: 12,
  STREET_LIGHT_CONE_ALPHA: 0.15,

  WINDOW_GLOW_BLUR: 3,
  WINDOW_FLICKER_THRESHOLD: 0.1,

  SEARCHLIGHT_BEAM_LENGTH: 300,
  SEARCHLIGHT_BEAM_WIDTH: 30,
  SEARCHLIGHT_BEAM_ALPHA: 0.15,

  NEON_SIGN_BLUR: 8,
  BILLBOARD_FLICKER_SPEED: 0.007,
};

export type NeonCitySettings = {
  fpsTarget: 30 | 60 | 'unlimited';
  particleDensity: 'low' | 'medium' | 'high';
  weatherEnabled: boolean;
  glowEnabled: boolean;
  reflectionsEnabled: boolean;
  speedLinesEnabled: boolean;
  neonIntensity: number; // 0-100
};

export const DEFAULT_SETTINGS: NeonCitySettings = {
  fpsTarget: 60,
  particleDensity: 'medium',
  weatherEnabled: false,
  glowEnabled: true,
  reflectionsEnabled: true,
  speedLinesEnabled: true,
  neonIntensity: 80,
};
