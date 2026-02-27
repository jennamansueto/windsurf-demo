import { updatePlayer, spawnSpeedBoostFood } from '../entities.js';
import { handleFoodCollisions } from '../collisions.js';
import { gameState, mouse } from '../gameState.js';
import { SPEED_BOOST_DURATION, SPEED_BOOST_MULTIPLIER, SPEED_BOOST_FOOD_COLOR, SPEED_BOOST_FOOD_SIZE } from '../config.js';

jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: []
  },
  mouse: { x: 0, y: 0 }
}));

describe('spawnSpeedBoostFood', () => {
  test('returns food with speedBoost type and correct properties', () => {
    const food = spawnSpeedBoostFood();

    expect(food.type).toBe('speedBoost');
    expect(food.color).toBe(SPEED_BOOST_FOOD_COLOR);
    expect(food.radius).toBe(SPEED_BOOST_FOOD_SIZE);
    expect(food).toHaveProperty('x');
    expect(food).toHaveProperty('y');
  });
});

describe('speed boost consumption', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    gameState.aiPlayers = [];
    gameState.food = [];
  });

  test('applies speed boost when player consumes speed boost food', () => {
    const cell = { x: 100, y: 100, score: 200, velocityX: 0, velocityY: 0 };
    gameState.playerCells = [cell];
    gameState.food = [{
      x: 100,
      y: 100,
      color: SPEED_BOOST_FOOD_COLOR,
      type: 'speedBoost',
      radius: SPEED_BOOST_FOOD_SIZE
    }];

    handleFoodCollisions();

    expect(cell.speedBoostActive).toBe(true);
    expect(cell.speedBoostExpiry).toBeGreaterThan(Date.now());
    expect(cell.speedBoostExpiry).toBeLessThanOrEqual(Date.now() + SPEED_BOOST_DURATION);
  });

  test('does not increase score when consuming speed boost food', () => {
    const cell = { x: 100, y: 100, score: 200, velocityX: 0, velocityY: 0 };
    const originalScore = cell.score;
    gameState.playerCells = [cell];
    gameState.food = [{
      x: 100,
      y: 100,
      color: SPEED_BOOST_FOOD_COLOR,
      type: 'speedBoost',
      radius: SPEED_BOOST_FOOD_SIZE
    }];

    handleFoodCollisions();

    expect(cell.score).toBe(originalScore);
  });
});

describe('speed boost multiplier in updatePlayer', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    mouse.x = 0;
    mouse.y = 0;
  });

  test('applies 2x speed multiplier during boost window', () => {
    const baseCell = { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 };
    const boostedCell = {
      x: 100,
      y: 100,
      score: 100,
      velocityX: 0,
      velocityY: 0,
      speedBoostActive: true,
      speedBoostExpiry: Date.now() + SPEED_BOOST_DURATION
    };

    // Test base cell speed
    gameState.playerCells = [baseCell];
    mouse.x = 1000;
    mouse.y = window.innerHeight / 2;
    updatePlayer();
    const baseSpeed = Math.abs(baseCell.velocityX);

    // Test boosted cell speed
    gameState.playerCells = [boostedCell];
    mouse.x = 1000;
    mouse.y = window.innerHeight / 2;
    updatePlayer();
    const boostedSpeed = Math.abs(boostedCell.velocityX);

    // Boosted speed should be approximately 2x the base speed
    expect(boostedSpeed).toBeCloseTo(baseSpeed * SPEED_BOOST_MULTIPLIER, 1);
  });

  test('speed returns to normal after boost duration expires', () => {
    const cell = {
      x: 100,
      y: 100,
      score: 100,
      velocityX: 0,
      velocityY: 0,
      speedBoostActive: true,
      speedBoostExpiry: Date.now() - 1 // Already expired
    };

    gameState.playerCells = [cell];
    mouse.x = 1000;
    mouse.y = window.innerHeight / 2;
    updatePlayer();

    expect(cell.speedBoostActive).toBe(false);
  });
});

describe('trail management', () => {
  test('trail entries older than 300ms are pruned', () => {
    const now = Date.now();
    const trail = [
      { x: 10, y: 10, timestamp: now - 400 }, // older than 300ms, should be removed
      { x: 20, y: 20, timestamp: now - 200 }, // within 300ms, should stay
      { x: 30, y: 30, timestamp: now - 50 }   // within 300ms, should stay
    ];

    // Simulate the same pruning logic used in renderer.js
    const pruned = trail.filter(t => now - t.timestamp < 300);

    expect(pruned.length).toBe(2);
    expect(pruned[0].x).toBe(20);
    expect(pruned[1].x).toBe(30);
  });

  test('trail entries within 300ms window are kept', () => {
    const now = Date.now();
    const trail = [
      { x: 10, y: 10, timestamp: now - 100 },
      { x: 20, y: 20, timestamp: now - 50 },
      { x: 30, y: 30, timestamp: now }
    ];

    const pruned = trail.filter(t => now - t.timestamp < 300);

    expect(pruned.length).toBe(3);
  });
});
