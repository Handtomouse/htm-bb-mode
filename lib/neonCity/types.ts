export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Vehicle {
  lane: number;
  z: number;
  speed: number;
  color: string;
  isEmergency: boolean;
}

export interface FlyingVehicle {
  x: number;
  y: number;
  z: number;
  speed: number;
  bobPhase: number;
}

export interface ColorCache {
  accent: string;
  line: string;
  roadLine: string;
  horizon: string;
  lastUpdate: number;
}

export interface CameraState {
  x: number;
  y: number;
  smoothMouseX: number;
  smoothMouseY: number;
}

export interface BoostState {
  active: boolean;
  endTime: number;
  cooldownEnd: number;
}

export interface WeatherState {
  rainEnabled: boolean;
  fogDensity: number;
  lightningActive: boolean;
  lightningEndTime: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  particleCount: number;
}
