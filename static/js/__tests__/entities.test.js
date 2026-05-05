import { splitPlayerCell, handlePlayerSplit, updatePlayer, updateAI, initEntities, respawnAI } from '../entities.js';
import { gameState, mouse } from '../gameState.js';
import { MIN_SPLIT_SCORE, MAX_PLAYER_CELLS, AI_STARTING_SCORE, FOOD_COUNT, AI_COUNT, WORLD_SIZE } from '../config.js';

// Mock gameState and mouse
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: []
  },
  mouse: { x: 0, y: 0 }
}));

describe('splitPlayerCell', () => {
  beforeEach(() => {
    gameState.playerCells = [];
  });

  test('does not split cell below minimum score', () => {
    const cell = { x: 100, y: 100, score: MIN_SPLIT_SCORE - 1 };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(MIN_SPLIT_SCORE - 1);
  });

  test('splits cell with sufficient score', () => {
    const cell = { x: 100, y: 100, score: 100 };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].score).toBe(50);
    expect(gameState.playerCells[1].score).toBe(50);
  });

  test('does not split when at max cells', () => {
    const cell = { x: 100, y: 100, score: 100 };
    gameState.playerCells = Array(MAX_PLAYER_CELLS).fill({ ...cell });

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(MAX_PLAYER_CELLS);
  });
});

describe('handlePlayerSplit', () => {
  beforeEach(() => {
    gameState.playerCells = [];
  });

  test('splits all eligible cells', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 100 },
      { x: 200, y: 200, score: MIN_SPLIT_SCORE - 1 },
      { x: 300, y: 300, score: 100 }
    ];

    handlePlayerSplit();

    expect(gameState.playerCells.length).toBe(5);  // 2 split + 1 unchanged
  });
});

describe('updatePlayer', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    mouse.x = 0;
    mouse.y = 0;
  });

  test('moves player cells towards mouse', () => {
    const cell = { 
      x: 0, 
      y: 0, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0 
    };
    gameState.playerCells = [cell];
    
    // Set mouse far to the right and run multiple updates to overcome inertia
    mouse.x = 1000;
    mouse.y = 0;
    
    // Run multiple updates to overcome initial inertia
    for (let i = 0; i < 5; i++) {
      updatePlayer();
    }

    expect(gameState.playerCells[0].velocityX).toBeGreaterThan(0);  // Should move right
  });

  test('applies speed based on cell size', () => {
    const smallCell = { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 };
    const largeCell = { x: 100, y: 100, score: 400, velocityX: 0, velocityY: 0 };

    // Test small cell
    gameState.playerCells = [smallCell];
    mouse.x = 200;
    updatePlayer();
    const smallCellSpeed = Math.abs(gameState.playerCells[0].velocityX);

    // Test large cell
    gameState.playerCells = [largeCell];
    mouse.x = 200;
    updatePlayer();
    const largeCellSpeed = Math.abs(gameState.playerCells[0].velocityX);

    expect(smallCellSpeed).toBeGreaterThan(largeCellSpeed);  // Smaller cells move faster
  });
});

describe('respawnAI', () => {
  test('returns AI with correct starting properties', () => {
    const ai = respawnAI();

    expect(ai).toHaveProperty('x');
    expect(ai).toHaveProperty('y');
    expect(ai.score).toBe(AI_STARTING_SCORE);
    expect(ai).toHaveProperty('color');
    expect(ai).toHaveProperty('direction');
    expect(ai).toHaveProperty('name');
  });
});

describe('updateAI', () => {
  beforeEach(() => {
    gameState.aiPlayers = [];
  });

  test('moves AI players based on their direction', () => {
    gameState.aiPlayers = [{
      x: 500,
      y: 500,
      score: AI_STARTING_SCORE,
      direction: 0,  // facing right
      color: '#ff0000',
      name: 'TestAI'
    }];

    updateAI();

    expect(gameState.aiPlayers[0].x).toBeGreaterThan(500);
    expect(gameState.aiPlayers[0].y).toBeCloseTo(500, 0);
  });

  test('clamps AI position to world bounds', () => {
    gameState.aiPlayers = [{
      x: WORLD_SIZE,
      y: WORLD_SIZE,
      score: AI_STARTING_SCORE,
      direction: 0,  // facing right (would go beyond WORLD_SIZE)
      color: '#ff0000',
      name: 'TestAI'
    }];

    updateAI();

    expect(gameState.aiPlayers[0].x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(gameState.aiPlayers[0].y).toBeLessThanOrEqual(WORLD_SIZE);
  });

  test('clamps AI position to zero minimum', () => {
    gameState.aiPlayers = [{
      x: 0,
      y: 0,
      score: AI_STARTING_SCORE,
      direction: Math.PI,  // facing left (would go below 0)
      color: '#ff0000',
      name: 'TestAI'
    }];

    updateAI();

    expect(gameState.aiPlayers[0].x).toBeGreaterThanOrEqual(0);
    expect(gameState.aiPlayers[0].y).toBeGreaterThanOrEqual(0);
  });

  test('larger AI moves slower than smaller AI', () => {
    const smallAI = {
      x: 500, y: 500, score: 50, direction: 0, color: '#ff0000', name: 'Small'
    };
    const largeAI = {
      x: 500, y: 500, score: 400, direction: 0, color: '#0000ff', name: 'Large'
    };

    gameState.aiPlayers = [smallAI];
    updateAI();
    const smallDistance = gameState.aiPlayers[0].x - 500;

    gameState.aiPlayers = [largeAI];
    updateAI();
    const largeDistance = gameState.aiPlayers[0].x - 500;

    expect(smallDistance).toBeGreaterThan(largeDistance);
  });
});

describe('initEntities', () => {
  beforeEach(() => {
    gameState.food = [];
    gameState.aiPlayers = [];
  });

  test('initializes correct number of food items', () => {
    initEntities();

    expect(gameState.food.length).toBe(FOOD_COUNT);
  });

  test('initializes correct number of AI players', () => {
    initEntities();

    expect(gameState.aiPlayers.length).toBe(AI_COUNT);
  });

  test('food items have position and color', () => {
    initEntities();

    gameState.food.forEach(food => {
      expect(food).toHaveProperty('x');
      expect(food).toHaveProperty('y');
      expect(food).toHaveProperty('color');
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThanOrEqual(WORLD_SIZE);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThanOrEqual(WORLD_SIZE);
    });
  });

  test('AI players have required properties', () => {
    initEntities();

    gameState.aiPlayers.forEach(ai => {
      expect(ai).toHaveProperty('x');
      expect(ai).toHaveProperty('y');
      expect(ai.score).toBe(AI_STARTING_SCORE);
      expect(ai).toHaveProperty('color');
      expect(ai).toHaveProperty('direction');
      expect(ai).toHaveProperty('name');
    });
  });

  test('clears existing entities before initialization', () => {
    gameState.food = [{ x: 1, y: 1, color: 'red' }];
    gameState.aiPlayers = [{ x: 1, y: 1, score: 100, color: 'blue', direction: 0, name: 'Old' }];

    initEntities();

    expect(gameState.food.length).toBe(FOOD_COUNT);
    expect(gameState.aiPlayers.length).toBe(AI_COUNT);
  });
});