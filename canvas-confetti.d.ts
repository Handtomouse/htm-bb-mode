declare module 'canvas-confetti' {
  export interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  export interface ConfettiFunction {
    (options?: Options): Promise<null> | null;
    reset: () => void;
    create: (
      canvas: HTMLCanvasElement | null,
      options?: { resize?: boolean; useWorker?: boolean }
    ) => ConfettiFunction;
  }

  const confetti: ConfettiFunction;
  export default confetti;
}
