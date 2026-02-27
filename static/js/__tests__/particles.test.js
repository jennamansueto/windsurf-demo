import { spawnBurstParticles, spawnFoodSparkles, spawnSplitRing, updateParticles, drawParticles } from '../particles.js';

describe('spawnBurstParticles', () => {
  test('adds particles to the pool', () => {
    // Clear by running updates until empty
    for (let i = 0; i < 100; i++) updateParticles();

    spawnBurstParticles(100, 200);

    // Create a mock canvas context to draw and count particles
    const drawn = [];
    const ctx = {
      globalAlpha: 1,
      beginPath: jest.fn(),
      arc: jest.fn((...args) => drawn.push(args)),
      fillStyle: '',
      fill: jest.fn(),
      strokeStyle: '',
      lineWidth: 1,
      stroke: jest.fn()
    };

    drawParticles(ctx);

    // Should have drawn 8-12 particles
    expect(drawn.length).toBeGreaterThanOrEqual(8);
    expect(drawn.length).toBeLessThanOrEqual(12);
  });

  test('uses default teal color #008080', () => {
    // Clear by running updates until empty
    for (let i = 0; i < 100; i++) updateParticles();

    spawnBurstParticles(50, 50);

    const colors = [];
    const ctx = {
      globalAlpha: 1,
      beginPath: jest.fn(),
      arc: jest.fn(),
      set fillStyle(c) { colors.push(c); },
      get fillStyle() { return ''; },
      fill: jest.fn(),
      strokeStyle: '',
      lineWidth: 1,
      stroke: jest.fn()
    };

    drawParticles(ctx);

    expect(colors.length).toBeGreaterThan(0);
    colors.forEach(c => expect(c).toBe('#008080'));
  });
});

describe('spawnFoodSparkles', () => {
  test('uses HSL color in range 0-360', () => {
    // Clear particles
    for (let i = 0; i < 100; i++) updateParticles();

    spawnFoodSparkles(100, 100);

    const colors = [];
    const ctx = {
      globalAlpha: 1,
      beginPath: jest.fn(),
      arc: jest.fn(),
      set fillStyle(c) { colors.push(c); },
      get fillStyle() { return ''; },
      fill: jest.fn(),
      strokeStyle: '',
      lineWidth: 1,
      stroke: jest.fn()
    };

    drawParticles(ctx);

    expect(colors.length).toBeGreaterThanOrEqual(4);
    expect(colors.length).toBeLessThanOrEqual(6);
    colors.forEach(c => {
      expect(c).toMatch(/^hsl\(\d+(\.\d+)?, 50%, 50%\)$/);
    });
  });
});

describe('spawnSplitRing', () => {
  test('creates a single ring particle with amber color #FFC107', () => {
    // Clear particles
    for (let i = 0; i < 100; i++) updateParticles();

    spawnSplitRing(200, 200);

    const strokeColors = [];
    const ctx = {
      globalAlpha: 1,
      beginPath: jest.fn(),
      arc: jest.fn(),
      fillStyle: '',
      fill: jest.fn(),
      set strokeStyle(c) { strokeColors.push(c); },
      get strokeStyle() { return ''; },
      lineWidth: 1,
      stroke: jest.fn()
    };

    drawParticles(ctx);

    // Should draw exactly one ring
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(strokeColors).toContain('#FFC107');
  });
});

describe('updateParticles', () => {
  test('removes particles when lifetime reaches zero', () => {
    // Clear particles
    for (let i = 0; i < 100; i++) updateParticles();

    spawnBurstParticles(0, 0);

    // Particles have maxLifetime of 20, so after 20 updates they should be gone
    for (let i = 0; i < 20; i++) {
      updateParticles();
    }

    // All particles should be removed
    const drawn = [];
    const ctx = {
      globalAlpha: 1,
      beginPath: jest.fn(),
      arc: jest.fn((...args) => drawn.push(args)),
      fillStyle: '',
      fill: jest.fn(),
      strokeStyle: '',
      lineWidth: 1,
      stroke: jest.fn()
    };

    drawParticles(ctx);
    expect(drawn.length).toBe(0);
  });
});

describe('drawParticles', () => {
  test('sets globalAlpha proportional to remaining lifetime', () => {
    // Clear particles
    for (let i = 0; i < 100; i++) updateParticles();

    spawnBurstParticles(0, 0);

    // Update once so lifetime = 19, maxLifetime = 20 -> alpha = 19/20 = 0.95
    updateParticles();

    const alphaValues = [];
    const ctx = {
      _globalAlpha: 1,
      get globalAlpha() { return this._globalAlpha; },
      set globalAlpha(v) {
        this._globalAlpha = v;
        alphaValues.push(v);
      },
      beginPath: jest.fn(),
      arc: jest.fn(),
      fillStyle: '',
      fill: jest.fn(),
      strokeStyle: '',
      lineWidth: 1,
      stroke: jest.fn()
    };

    drawParticles(ctx);

    // Pattern: set alpha, draw, restore alpha — so even indices are particle alphas
    const particleAlphas = alphaValues.filter((_, i) => i % 2 === 0);

    expect(particleAlphas.length).toBeGreaterThan(0);
    particleAlphas.forEach(a => {
      // After 1 tick: lifetime=19, maxLifetime=20 -> alpha = 0.95
      expect(a).toBeCloseTo(19 / 20, 2);
    });
  });
});
