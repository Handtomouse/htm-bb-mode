import { PARTICLE_CONFIG, RENDERING_CONFIG } from './config';

export interface Particle {
  x: number;
  y: number;
  z: number;
  active: boolean;
}

export interface Star extends Particle {
  size: number;
  speed: number;
}

export interface SteamParticle extends Particle {
  age: number;
  maxAge: number;
  size: number;
}

export interface RainDrop extends Particle {
  vx: number;
  vy: number;
  length: number;
}

export interface Cloud extends Particle {
  width: number;
  height: number;
  opacity: number;
  speed: number;
}

// Object pooling for particles - Phase 2
export class ParticlePool<T extends Particle> {
  private pool: T[];
  private factory: () => T;
  private resetFn: (particle: T) => void;

  constructor(size: number, factory: () => T, resetFn: (particle: T) => void) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.pool = [];
    for (let i = 0; i < size; i++) {
      const particle = factory();
      particle.active = false;
      this.pool.push(particle);
    }
  }

  acquire(): T | null {
    const particle = this.pool.find(p => !p.active);
    if (particle) {
      particle.active = true;
      this.resetFn(particle);
    }
    return particle || null;
  }

  release(particle: T) {
    particle.active = false;
  }

  getActive(): T[] {
    return this.pool.filter(p => p.active);
  }

  clear() {
    this.pool.forEach(p => p.active = false);
  }
}

export class StarSystem {
  private pool: ParticlePool<Star>;
  private width: number;
  private height: number;

  constructor(count: number, width: number, height: number) {
    this.width = width;
    this.height = height;

    this.pool = new ParticlePool(
      count,
      () => ({
        x: 0,
        y: 0,
        z: 0,
        size: 0,
        speed: 0,
        active: false,
      }),
      (star) => {
        star.x = (Math.random() - 0.5) * this.width * 2;
        star.y = Math.random() * this.height * 0.4 - 50;
        star.z = PARTICLE_CONFIG.STAR_DEPTH_MIN + Math.random() * RENDERING_CONFIG.CITY_DEPTH;
        star.size = PARTICLE_CONFIG.STAR_MIN_SIZE + Math.random() * (PARTICLE_CONFIG.STAR_MAX_SIZE - PARTICLE_CONFIG.STAR_MIN_SIZE);
        star.speed = PARTICLE_CONFIG.STAR_MIN_SPEED + Math.random() * (PARTICLE_CONFIG.STAR_MAX_SPEED - PARTICLE_CONFIG.STAR_MIN_SPEED);
      }
    );

    // Initialize all stars
    for (let i = 0; i < count; i++) {
      this.pool.acquire();
    }
  }

  update(dt: number, speed: number) {
    const stars = this.pool.getActive();
    stars.forEach(star => {
      star.z -= speed * dt * star.speed * 0.3;
      if (star.z < PARTICLE_CONFIG.STAR_DEPTH_MIN) {
        star.z = RENDERING_CONFIG.CITY_DEPTH + PARTICLE_CONFIG.STAR_DEPTH_MIN;
        star.x = (Math.random() - 0.5) * this.width * 2;
        star.y = Math.random() * this.height * 0.4 - 50;
      }
    });
  }

  getStars(): Star[] {
    return this.pool.getActive();
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

export class SteamSystem {
  private pool: ParticlePool<SteamParticle>;
  private vents: Array<{ x: number; z: number }>;

  constructor(ventCount: number) {
    this.pool = new ParticlePool(
      200, // Max 200 steam particles
      () => ({
        x: 0,
        y: 0,
        z: 0,
        age: 0,
        maxAge: 0,
        size: 0,
        active: false,
      }),
      (particle) => {
        // Reset is handled in spawn()
      }
    );

    // Create vents
    this.vents = [];
    for (let i = 0; i < ventCount; i++) {
      this.vents.push({
        x: (Math.random() - 0.5) * RENDERING_CONFIG.ROAD_WIDTH * 3,
        z: 300 + i * (RENDERING_CONFIG.CITY_DEPTH / ventCount),
      });
    }
  }

  spawn() {
    this.vents.forEach(vent => {
      if (Math.random() < PARTICLE_CONFIG.STEAM_SPAWN_CHANCE) {
        const particle = this.pool.acquire();
        if (particle) {
          particle.x = vent.x + (Math.random() - 0.5) * 20;
          particle.y = 0;
          particle.z = vent.z + (Math.random() - 0.5) * 30;
          particle.age = 0;
          particle.maxAge = PARTICLE_CONFIG.STEAM_MIN_LIFETIME + Math.random() * (PARTICLE_CONFIG.STEAM_MAX_LIFETIME - PARTICLE_CONFIG.STEAM_MIN_LIFETIME);
          particle.size = PARTICLE_CONFIG.STEAM_MIN_SIZE + Math.random() * (PARTICLE_CONFIG.STEAM_MAX_SIZE - PARTICLE_CONFIG.STEAM_MIN_SIZE);
        }
      }
    });
  }

  update(dt: number) {
    const particles = this.pool.getActive();
    particles.forEach(particle => {
      particle.age += dt;
      particle.y += PARTICLE_CONFIG.STEAM_RISE_SPEED * dt;
      particle.x += (Math.random() - 0.5) * 10 * dt;
      particle.size += PARTICLE_CONFIG.STEAM_EXPAND_RATE * dt;

      if (particle.age > particle.maxAge) {
        this.pool.release(particle);
      }
    });
  }

  getParticles(): SteamParticle[] {
    return this.pool.getActive();
  }
}

// Phase 4: Rain System
export class RainSystem {
  private pool: ParticlePool<RainDrop>;
  private width: number;
  private height: number;
  private enabled: boolean;

  constructor(count: number, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.enabled = false;

    this.pool = new ParticlePool(
      count,
      () => ({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        length: 0,
        active: false,
      }),
      (drop) => {
        drop.x = (Math.random() - 0.5) * this.width * 3;
        drop.y = -PARTICLE_CONFIG.RAIN_LENGTH;
        drop.z = Math.random() * RENDERING_CONFIG.CITY_DEPTH + 100;
        drop.vx = PARTICLE_CONFIG.RAIN_WIND_DRIFT;
        drop.vy = PARTICLE_CONFIG.RAIN_FALL_SPEED;
        drop.length = PARTICLE_CONFIG.RAIN_LENGTH;
      }
    );
  }

  enable() {
    this.enabled = true;
    // Spawn initial rain
    for (let i = 0; i < PARTICLE_CONFIG.RAIN_PARTICLE_COUNT; i++) {
      this.pool.acquire();
    }
  }

  disable() {
    this.enabled = false;
    this.pool.clear();
  }

  update(dt: number, speed: number) {
    if (!this.enabled) return;

    const drops = this.pool.getActive();
    drops.forEach(drop => {
      drop.z -= speed * dt;
      drop.y += drop.vy * dt;
      drop.x += drop.vx * dt;

      // Respawn if off screen or behind camera
      if (drop.y > this.height || drop.z < 50) {
        drop.x = (Math.random() - 0.5) * this.width * 3;
        drop.y = -PARTICLE_CONFIG.RAIN_LENGTH;
        drop.z = RENDERING_CONFIG.CITY_DEPTH + Math.random() * 500;
      }
    });
  }

  getRainDrops(): RainDrop[] {
    return this.enabled ? this.pool.getActive() : [];
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

// Phase 4: Cloud System
export class CloudSystem {
  private pool: ParticlePool<Cloud>;
  private width: number;

  constructor(count: number, width: number) {
    this.width = width;

    this.pool = new ParticlePool(
      count,
      () => ({
        x: 0,
        y: 0,
        z: 0,
        width: 0,
        height: 0,
        opacity: 0,
        speed: 0,
        active: false,
      }),
      (cloud) => {
        cloud.x = (Math.random() - 0.5) * this.width * 4;
        cloud.y = 150 + Math.random() * 100;
        cloud.z = 1000 + Math.random() * RENDERING_CONFIG.CITY_DEPTH;
        cloud.width = 100 + Math.random() * 200;
        cloud.height = 30 + Math.random() * 60;
        cloud.opacity = 0.05 + Math.random() * 0.1;
        cloud.speed = 0.05 + Math.random() * 0.1;
      }
    );

    // Initialize clouds
    for (let i = 0; i < count; i++) {
      this.pool.acquire();
    }
  }

  update(dt: number, speed: number) {
    const clouds = this.pool.getActive();
    clouds.forEach(cloud => {
      cloud.z -= speed * dt * cloud.speed * 0.1; // Move very slowly
      if (cloud.z < 1000) {
        cloud.z = RENDERING_CONFIG.CITY_DEPTH + 1000;
        cloud.x = (Math.random() - 0.5) * this.width * 4;
      }
    });
  }

  getClouds(): Cloud[] {
    return this.pool.getActive();
  }

  resize(width: number) {
    this.width = width;
  }
}
