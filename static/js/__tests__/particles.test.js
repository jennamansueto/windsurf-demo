import { spawnBurstParticles, spawnSparkles, spawnSplitRing, updateParticles, drawParticles, getParticles, clearParticles } from '../particles.js';

describe('spawnBurstParticles', () => {
  beforeEach(() => {
    clearParticles();
  });

  test('emits 12 to 20 particles', () => {
    spawnBurstParticles(100, 200, 'hsl(180, 70%, 50%)');

    const particles = getParticles();
    expect(particles.length).toBeGreaterThanOrEqual(12);
    expect(particles.length).toBeLessThanOrEqual(20);
  });

  test('creates particles at the given position', () => {
    spawnBurstParticles(50, 75, 'hsl(0, 50%, 50%)');

    const particles = getParticles();
    particles.forEach(p => {
      expect(p.x).toBe(50);
      expect(p.y).toBe(75);
    });
  });

  test('assigns the consumed cell color to each particle', () => {
    const color = 'hsl(120, 70%, 50%)';
    spawnBurstParticles(0, 0, color);

    const particles = getParticles();
    particles.forEach(p => {
      expect(p.color).toBe(color);
    });
  });

  test('particles have type burst and 0.3s max life', () => {
    spawnBurstParticles(0, 0, 'red');

    const particles = getParticles();
    particles.forEach(p => {
      expect(p.type).toBe('burst');
      expect(p.maxLife).toBeCloseTo(0.3, 2);
      expect(p.life).toBe(0);
    });
  });

  test('particles have random velocities', () => {
    spawnBurstParticles(0, 0, 'red');

    const particles = getParticles();
    // At least some particles should have different velocities
    const vxSet = new Set(particles.map(p => p.vx));
    expect(vxSet.size).toBeGreaterThan(1);
  });
});

describe('spawnSparkles', () => {
  beforeEach(() => {
    clearParticles();
  });

  test('emits 5 to 8 sparkle particles', () => {
    spawnSparkles(100, 200);

    const particles = getParticles();
    expect(particles.length).toBeGreaterThanOrEqual(5);
    expect(particles.length).toBeLessThanOrEqual(8);
  });

  test('creates sparkle particles at the given position', () => {
    spawnSparkles(30, 40);

    const particles = getParticles();
    particles.forEach(p => {
      expect(p.x).toBe(30);
      expect(p.y).toBe(40);
    });
  });

  test('sparkle particles have small radius', () => {
    spawnSparkles(0, 0);

    const particles = getParticles();
    particles.forEach(p => {
      expect(p.radius).toBeGreaterThanOrEqual(1);
      expect(p.radius).toBeLessThanOrEqual(3);
    });
  });

  test('sparkle particles have type sparkle and 0.3s max life', () => {
    spawnSparkles(0, 0);

    const particles = getParticles();
    particles.forEach(p => {
      expect(p.type).toBe('sparkle');
      expect(p.maxLife).toBeCloseTo(0.3, 2);
    });
  });
});

describe('spawnSplitRing', () => {
  beforeEach(() => {
    clearParticles();
  });

  test('creates a single ring particle', () => {
    spawnSplitRing(100, 200, 30);

    const particles = getParticles();
    expect(particles.length).toBe(1);
    expect(particles[0].type).toBe('ring');
  });

  test('ring uses player teal color #008080', () => {
    spawnSplitRing(0, 0, 20);

    const particles = getParticles();
    expect(particles[0].color).toBe('#008080');
  });

  test('ring starts at the given radius and expands', () => {
    spawnSplitRing(50, 60, 25);

    const particles = getParticles();
    expect(particles[0].radius).toBe(25);
    expect(particles[0].maxRadius).toBeGreaterThan(25);
  });

  test('ring has 0.3s max life', () => {
    spawnSplitRing(0, 0, 10);

    const particles = getParticles();
    expect(particles[0].maxLife).toBeCloseTo(0.3, 2);
  });
});

describe('updateParticles', () => {
  beforeEach(() => {
    clearParticles();
  });

  test('advances particle life by dt', () => {
    spawnBurstParticles(0, 0, 'red');

    updateParticles(0.1);

    const particles = getParticles();
    particles.forEach(p => {
      expect(p.life).toBeCloseTo(0.1, 5);
    });
  });

  test('moves burst particles based on velocity and dt', () => {
    spawnBurstParticles(100, 100, 'red');
    const particles = getParticles();
    const firstParticle = particles[0];
    const initialX = firstParticle.x;
    const initialY = firstParticle.y;
    const vx = firstParticle.vx;
    const vy = firstParticle.vy;

    updateParticles(0.1);

    expect(firstParticle.x).toBeCloseTo(initialX + vx * 0.1, 5);
    expect(firstParticle.y).toBeCloseTo(initialY + vy * 0.1, 5);
  });

  test('removes particles that exceed maxLife', () => {
    spawnBurstParticles(0, 0, 'red');

    // Advance past maxLife (0.3s)
    updateParticles(0.35);

    const particles = getParticles();
    expect(particles.length).toBe(0);
  });

  test('expands ring currentRadius over time', () => {
    spawnSplitRing(0, 0, 20);

    updateParticles(0.15); // Half of maxLife

    const particles = getParticles();
    expect(particles[0].currentRadius).toBeGreaterThan(20);
    expect(particles[0].currentRadius).toBeLessThan(particles[0].maxRadius);
  });
});

describe('drawParticles', () => {
  beforeEach(() => {
    clearParticles();
  });

  test('calls canvas drawing methods for burst particles', () => {
    spawnBurstParticles(50, 50, 'hsl(0, 50%, 50%)');

    const ctx = {
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    };
    const camera = { x: 0, y: 0 };

    drawParticles(ctx, camera);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  test('calls canvas stroke for ring particles', () => {
    spawnSplitRing(100, 100, 30);
    updateParticles(0.05); // Small advance so ring has currentRadius

    const ctx = {
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    };
    const camera = { x: 0, y: 0 };

    drawParticles(ctx, camera);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  test('applies camera offset to screen positions', () => {
    spawnBurstParticles(200, 300, 'red');

    const ctx = {
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    };
    const camera = { x: 100, y: 50 };

    drawParticles(ctx, camera);

    // First arc call should have screenX = 200-100=100, screenY = 300-50=250
    const firstArcCall = ctx.arc.mock.calls[0];
    expect(firstArcCall[0]).toBe(100); // screenX
    expect(firstArcCall[1]).toBe(250); // screenY
  });
});

describe('getParticles', () => {
  beforeEach(() => {
    clearParticles();
  });

  test('returns the active particles array', () => {
    const particles = getParticles();
    expect(Array.isArray(particles)).toBe(true);
    expect(particles.length).toBe(0);
  });

  test('reflects spawned particles', () => {
    spawnSparkles(0, 0);

    const particles = getParticles();
    expect(particles.length).toBeGreaterThan(0);
  });
});

describe('clearParticles', () => {
  test('removes all active particles', () => {
    spawnBurstParticles(0, 0, 'red');
    spawnSparkles(10, 10);
    spawnSplitRing(20, 20, 15);

    expect(getParticles().length).toBeGreaterThan(0);

    clearParticles();

    expect(getParticles().length).toBe(0);
  });
});
