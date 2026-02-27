import { spawnBurstParticles, spawnSparkles, spawnExpandingRing, updateParticles, drawParticles } from '../particles.js';
import { gameState } from '../gameState.js';

// Mock gameState and mouse
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    camera: { x: 0, y: 0 },
    playerName: 'TestPlayer',
    particles: []
  },
  mouse: { x: 0, y: 0 }
}));

describe('spawnBurstParticles', () => {
  beforeEach(() => {
    gameState.particles = [];
  });

  test('adds particles to gameState on burst spawn', () => {
    spawnBurstParticles(100, 200, '#008080');

    expect(gameState.particles.length).toBeGreaterThan(0);
    gameState.particles.forEach(p => {
      expect(p.type).toBe('burst');
      expect(p.x).toBe(100);
      expect(p.y).toBe(200);
      expect(p.color).toBe('#008080');
      expect(p).toHaveProperty('lifetime');
      expect(p).toHaveProperty('maxLifetime');
      expect(p).toHaveProperty('velocityX');
      expect(p).toHaveProperty('velocityY');
      expect(p).toHaveProperty('radius');
    });
  });

  test('creates 12 burst particles', () => {
    spawnBurstParticles(50, 50, '#ff0000');

    expect(gameState.particles.length).toBe(12);
  });
});

describe('spawnSparkles', () => {
  beforeEach(() => {
    gameState.particles = [];
  });

  test('adds sparkle particles to gameState', () => {
    spawnSparkles(300, 400);

    expect(gameState.particles.length).toBeGreaterThan(0);
    gameState.particles.forEach(p => {
      expect(p.type).toBe('sparkle');
      expect(p.x).toBe(300);
      expect(p.y).toBe(400);
      expect(p).toHaveProperty('color');
      expect(p).toHaveProperty('lifetime');
    });
  });

  test('creates 8 sparkle particles', () => {
    spawnSparkles(0, 0);

    expect(gameState.particles.length).toBe(8);
  });
});

describe('spawnExpandingRing', () => {
  beforeEach(() => {
    gameState.particles = [];
  });

  test('adds a ring particle to gameState', () => {
    spawnExpandingRing(150, 250, 30);

    expect(gameState.particles.length).toBe(1);
    const ring = gameState.particles[0];
    expect(ring.type).toBe('ring');
    expect(ring.x).toBe(150);
    expect(ring.y).toBe(250);
    expect(ring).toHaveProperty('radius');
    expect(ring).toHaveProperty('startRadius');
    expect(ring).toHaveProperty('maxRadius');
    expect(ring.maxRadius).toBeGreaterThan(ring.startRadius);
  });
});

describe('updateParticles', () => {
  beforeEach(() => {
    gameState.particles = [];
  });

  test('removes expired particles after lifetime elapses', () => {
    gameState.particles.push({
      type: 'burst',
      x: 10,
      y: 10,
      velocityX: 1,
      velocityY: 1,
      color: '#008080',
      lifetime: 1,
      maxLifetime: 18,
      radius: 3
    });

    expect(gameState.particles.length).toBe(1);

    updateParticles();

    expect(gameState.particles.length).toBe(0);
  });

  test('expanding ring radius increases each update tick', () => {
    spawnExpandingRing(100, 100, 40);

    const initialRadius = gameState.particles[0].radius;

    updateParticles();

    expect(gameState.particles[0].radius).toBeGreaterThan(initialRadius);
  });

  test('moves burst particles based on velocity', () => {
    gameState.particles.push({
      type: 'burst',
      x: 0,
      y: 0,
      velocityX: 5,
      velocityY: 3,
      color: '#008080',
      lifetime: 10,
      maxLifetime: 18,
      radius: 3
    });

    updateParticles();

    expect(gameState.particles[0].x).toBeGreaterThan(0);
    expect(gameState.particles[0].y).toBeGreaterThan(0);
  });

  test('does not remove particles that still have lifetime remaining', () => {
    spawnBurstParticles(50, 50, '#008080');
    const count = gameState.particles.length;

    updateParticles();

    expect(gameState.particles.length).toBe(count);
  });
});

describe('drawParticles', () => {
  beforeEach(() => {
    gameState.particles = [];
    gameState.camera = { x: 0, y: 0 };
  });

  test('calls canvas drawing methods for each particle', () => {
    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    };

    spawnBurstParticles(100, 100, '#008080');
    drawParticles(mockCtx);

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  test('draws ring particles with stroke instead of fill', () => {
    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    };

    spawnExpandingRing(50, 50, 20);
    drawParticles(mockCtx);

    expect(mockCtx.stroke).toHaveBeenCalled();
  });
});
