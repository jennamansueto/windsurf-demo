import { splitPlayerCell, handlePlayerSplit, updatePlayer, updateAI, initEntities, respawnAI } from '../entities.js';
import { gameState, mouse } from '../gameState.js';
import { MIN_SPLIT_SCORE, MAX_PLAYER_CELLS, AI_STARTING_SCORE, WORLD_SIZE, FOOD_COUNT, AI_COUNT, MERGE_COOLDOWN } from '../config.js';

// Mock gameState and mouse
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    playerName: 'Windsurf'
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
      x: 500, y: 500, score: 50, direction: 0, name: 'TestAI'
    }];

    const origX = gameState.aiPlayers[0].x;
    updateAI();

    // direction=0 means moving right (cos(0)=1)
    expect(gameState.aiPlayers[0].x).toBeGreaterThan(origX);
  });

  test('clamps AI position within world bounds', () => {
    gameState.aiPlayers = [{
      x: WORLD_SIZE, y: WORLD_SIZE, score: 50, direction: 0, name: 'TestAI'
    }];

    updateAI();

    expect(gameState.aiPlayers[0].x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(gameState.aiPlayers[0].y).toBeLessThanOrEqual(WORLD_SIZE);
  });

  test('clamps AI position at lower bound', () => {
    // direction = Math.PI means moving left (cos(PI) = -1)
    gameState.aiPlayers = [{
      x: 0, y: 0, score: 50, direction: Math.PI, name: 'TestAI'
    }];

    updateAI();

    expect(gameState.aiPlayers[0].x).toBeGreaterThanOrEqual(0);
    expect(gameState.aiPlayers[0].y).toBeGreaterThanOrEqual(0);
  });

  test('larger AI moves slower than smaller AI', () => {
    gameState.aiPlayers = [{
      x: 500, y: 500, score: 50, direction: 0, name: 'SmallAI'
    }];
    updateAI();
    const smallDelta = gameState.aiPlayers[0].x - 500;

    gameState.aiPlayers = [{
      x: 500, y: 500, score: 500, direction: 0, name: 'LargeAI'
    }];
    updateAI();
    const largeDelta = gameState.aiPlayers[0].x - 500;

    expect(Math.abs(smallDelta)).toBeGreaterThan(Math.abs(largeDelta));
  });
});

describe('initEntities', () => {
  beforeEach(() => {
    gameState.food = [];
    gameState.aiPlayers = [];
  });

  test('creates the correct number of food items', () => {
    initEntities();
    expect(gameState.food.length).toBe(FOOD_COUNT);
  });

  test('creates the correct number of AI players', () => {
    initEntities();
    expect(gameState.aiPlayers.length).toBe(AI_COUNT);
  });

  test('food items have x, y, and color properties', () => {
    initEntities();
    gameState.food.forEach(food => {
      expect(food).toHaveProperty('x');
      expect(food).toHaveProperty('y');
      expect(food).toHaveProperty('color');
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

  test('AI players have unique names', () => {
    initEntities();
    const names = gameState.aiPlayers.map(ai => ai.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('clears existing entities before initializing', () => {
    gameState.food = [{ x: 0, y: 0, color: 'red' }];
    gameState.aiPlayers = [{ x: 0, y: 0, score: 100, name: 'Old' }];

    initEntities();

    expect(gameState.food.length).toBe(FOOD_COUNT);
    expect(gameState.aiPlayers.length).toBe(AI_COUNT);
  });
});

describe('updateCellMerging (via updatePlayer)', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    mouse.x = window.innerWidth / 2;
    mouse.y = window.innerHeight / 2;
  });

  test('does not merge cells within cooldown period', () => {
    const now = Date.now();
    gameState.playerCells = [
      { x: 100, y: 100, score: 50, velocityX: 0, velocityY: 0, splitTime: now },
      { x: 101, y: 100, score: 50, velocityX: 0, velocityY: 0, splitTime: now }
    ];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(2);
  });

  test('merges cells after cooldown when close together', () => {
    const oldTime = Date.now() - MERGE_COOLDOWN - 1000;
    gameState.playerCells = [
      { x: 100, y: 100, score: 50, velocityX: 0, velocityY: 0, splitTime: oldTime },
      { x: 100, y: 100, score: 50, velocityX: 0, velocityY: 0, splitTime: oldTime }
    ];

    // Run several updates to let cells merge
    for (let i = 0; i < 10; i++) {
      updatePlayer();
    }

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(100);
  });

  test('applies repulsion when cells are too close but in cooldown', () => {
    const now = Date.now();
    gameState.playerCells = [
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: now },
      { x: 101, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: now }
    ];

    updatePlayer();

    // Cells should have been pushed apart (repulsion)
    const cell1Vx = gameState.playerCells[0].velocityX;
    const cell2Vx = gameState.playerCells[1].velocityX;
    // They should have opposite velocity components from repulsion
    expect(cell1Vx * cell2Vx).toBeLessThanOrEqual(0);
  });
});