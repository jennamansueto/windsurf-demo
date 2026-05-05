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
    expect(center.x).toBeCloseTo(7.5);
    expect(center.y).toBeCloseTo(7.5);
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
  test('returns position within world bounds', () => {
    const pos = getRandomPosition();
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
  });

  test('returns object with x and y properties', () => {
    const pos = getRandomPosition();
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
  });

  test('returns different positions on subsequent calls', () => {
    const positions = Array.from({ length: 10 }, () => getRandomPosition());
    const uniqueX = new Set(positions.map(p => p.x));
    expect(uniqueX.size).toBeGreaterThan(1);
  });
});

describe('findSafeSpawnLocation', () => {
  test('returns position within world bounds', () => {
    const state = { aiPlayers: [], playerCells: [] };
    const pos = findSafeSpawnLocation(state);
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
  });

  test('returns position away from AI players', () => {
    const state = {
      aiPlayers: [{ x: 500, y: 500, score: 100 }],
      playerCells: []
    };
    const minDistance = 100;
    const pos = findSafeSpawnLocation(state, minDistance);
    const dx = pos.x - 500;
    const dy = pos.y - 500;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const aiSize = getSize(100);
    expect(dist).toBeGreaterThanOrEqual(aiSize + minDistance - 1);
  });

  test('returns position away from player cells', () => {
    const state = {
      aiPlayers: [],
      playerCells: [{ x: 500, y: 500, score: 100 }]
    };
    const minDistance = 100;
    const pos = findSafeSpawnLocation(state, minDistance);
    const dx = pos.x - 500;
    const dy = pos.y - 500;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const playerSize = getSize(100);
    expect(dist).toBeGreaterThanOrEqual(playerSize + minDistance - 1);
  });

  test('returns best-effort position when map is crowded', () => {
    // Fill the map with many entities so safe spawn is hard to find
    const crowdedState = {
      aiPlayers: Array.from({ length: 50 }, (_, i) => ({
        x: (i % 10) * (WORLD_SIZE / 10),
        y: Math.floor(i / 10) * (WORLD_SIZE / 5),
        score: 500
      })),
      playerCells: []
    };
    const pos = findSafeSpawnLocation(crowdedState);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeGreaterThanOrEqual(0);
  });
});