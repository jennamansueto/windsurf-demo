import { splitPlayerCell, handlePlayerSplit, updatePlayer, respawnAI, initEntities } from '../entities.js';
import { gameState, mouse } from '../gameState.js';
import { MIN_SPLIT_SCORE, MAX_PLAYER_CELLS, DIFFICULTY_PRESETS, setDifficulty, getDifficultyConfig } from '../config.js';

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
  test('returns AI with correct starting properties for medium difficulty', () => {
    setDifficulty('medium');
    const ai = respawnAI();

    expect(ai).toHaveProperty('x');
    expect(ai).toHaveProperty('y');
    expect(ai.score).toBe(DIFFICULTY_PRESETS.medium.AI_STARTING_SCORE);
    expect(ai).toHaveProperty('color');
    expect(ai).toHaveProperty('direction');
    expect(ai).toHaveProperty('name');
  });
});

describe('difficulty presets', () => {
  beforeEach(() => {
    gameState.aiPlayers = [];
    gameState.food = [];
  });

  test('easy difficulty uses correct AI_STARTING_SCORE and AI_COUNT', () => {
    setDifficulty('easy');
    const config = getDifficultyConfig();
    expect(config.AI_STARTING_SCORE).toBe(30);
    expect(config.AI_COUNT).toBe(5);

    initEntities();
    expect(gameState.aiPlayers.length).toBe(5);
    gameState.aiPlayers.forEach(ai => {
      expect(ai.score).toBe(30);
    });
  });

  test('medium difficulty uses correct AI_STARTING_SCORE and AI_COUNT', () => {
    setDifficulty('medium');
    const config = getDifficultyConfig();
    expect(config.AI_STARTING_SCORE).toBe(50);
    expect(config.AI_COUNT).toBe(10);

    initEntities();
    expect(gameState.aiPlayers.length).toBe(10);
    gameState.aiPlayers.forEach(ai => {
      expect(ai.score).toBe(50);
    });
  });

  test('hard difficulty uses correct AI_STARTING_SCORE and AI_COUNT', () => {
    setDifficulty('hard');
    const config = getDifficultyConfig();
    expect(config.AI_STARTING_SCORE).toBe(100);
    expect(config.AI_COUNT).toBe(15);

    initEntities();
    expect(gameState.aiPlayers.length).toBe(15);
    gameState.aiPlayers.forEach(ai => {
      expect(ai.score).toBe(100);
    });
  });

  test('respawnAI uses correct AI_STARTING_SCORE per difficulty', () => {
    setDifficulty('easy');
    expect(respawnAI().score).toBe(30);

    setDifficulty('medium');
    expect(respawnAI().score).toBe(50);

    setDifficulty('hard');
    expect(respawnAI().score).toBe(100);
  });
});
