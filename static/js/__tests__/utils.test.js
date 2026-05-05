import { getSize, getDistance, calculateCenterOfMass, getRandomPosition, findSafeSpawnLocation } from '../utils.js';
import { WORLD_SIZE } from '../config.js';

describe('getSize', () => {
  test('returns correct size for score 0', () => {
    expect(getSize(0)).toBe(20);  // sqrt(0) + 20
  });

  test('returns correct size for score 100', () => {
    expect(getSize(100)).toBe(30);  // sqrt(100) + 20
  });

  test('returns correct size for score 400', () => {
    expect(getSize(400)).toBe(40);  // sqrt(400) + 20
  });
});

describe('getDistance', () => {
  test('returns 0 for same point', () => {
    const point = { x: 10, y: 10 };
    expect(getDistance(point, point)).toBe(0);
  });

  test('returns correct horizontal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 0 };
    expect(getDistance(point1, point2)).toBe(3);
  });

  test('returns correct vertical distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 0, y: 4 };
    expect(getDistance(point1, point2)).toBe(4);
  });

  test('returns correct diagonal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };
    expect(getDistance(point1, point2)).toBe(5);  // 3-4-5 triangle
  });
});

describe('calculateCenterOfMass', () => {
  test('returns center for single cell', () => {
    const cells = [{ x: 10, y: 20, score: 100 }];
    const center = calculateCenterOfMass(cells);
    expect(center).toEqual({ x: 10, y: 20 });
  });

  test('returns weighted center for multiple cells', () => {
    const cells = [
      { x: 0, y: 0, score: 100 },
      { x: 10, y: 10, score: 300 }
    ];
    const center = calculateCenterOfMass(cells);
    expect(center.x).toBeCloseTo(5);
    expect(center.y).toBeCloseTo(5);
  });

  test('returns {x: 0, y: 0} for empty cells array', () => {
    expect(calculateCenterOfMass([])).toEqual({ x: 0, y: 0 });
  });

  test('returns {x: 0, y: 0} for cells with zero total score', () => {
    const cells = [
      { x: 10, y: 20, score: 0 },
      { x: 30, y: 40, score: 0 }
    ];
    expect(calculateCenterOfMass(cells)).toEqual({ x: 0, y: 0 });
  });
});

describe('getRandomPosition', () => {
  test('returns object with x and y properties', () => {
    const pos = getRandomPosition();
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
  });

  test('returns position within world bounds', () => {
    for (let i = 0; i < 100; i++) {
      const pos = getRandomPosition();
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
    }
  });

  test('produces varying positions (not constant)', () => {
    const positions = Array.from({ length: 10 }, () => getRandomPosition());
    const uniqueX = new Set(positions.map(p => p.x));
    expect(uniqueX.size).toBeGreaterThan(1);
  });
});

describe('findSafeSpawnLocation', () => {
  test('returns position with x and y properties', () => {
    const state = { aiPlayers: [], playerCells: [] };
    const pos = findSafeSpawnLocation(state);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
  });

  test('returns position within world bounds', () => {
    const state = { aiPlayers: [], playerCells: [] };
    for (let i = 0; i < 20; i++) {
      const pos = findSafeSpawnLocation(state);
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
    }
  });

  test('avoids AI players when possible', () => {
    const state = {
      aiPlayers: [{ x: 100, y: 100, score: 1000 }],
      playerCells: []
    };
    const pos = findSafeSpawnLocation(state, 100);
    const distance = Math.sqrt((pos.x - 100) ** 2 + (pos.y - 100) ** 2);
    const aiSize = getSize(1000);
    expect(distance).toBeGreaterThan(aiSize);
  });

  test('returns a position even when world is crowded', () => {
    const crowdedState = {
      aiPlayers: Array.from({ length: 50 }, (_, i) => ({
        x: (i * 40) % WORLD_SIZE,
        y: Math.floor(i / 50) * 40,
        score: 500
      })),
      playerCells: [{ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, score: 500 }]
    };
    const pos = findSafeSpawnLocation(crowdedState);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeGreaterThanOrEqual(0);
  });
});