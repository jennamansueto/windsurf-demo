import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions, respawnEntities } from '../collisions.js';
import { gameState } from '../gameState.js';
import { getSize } from '../utils.js';
import { FOOD_COUNT, AI_COUNT, STARTING_SCORE } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: []
  }
}));

describe('handleFoodCollisions', () => {
  beforeEach(() => {
    // Reset gameState before each test
    gameState.playerCells = [];
    gameState.food = [];
  });

  test('player cell consumes food when overlapping', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
    gameState.food = [{ x: 100, y: 100 }];

    handleFoodCollisions();

    expect(gameState.food.length).toBe(0);
    expect(gameState.playerCells[0].score).toBe(110);  // Initial + FOOD_SCORE
  });

  test('food remains when not overlapping with player', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
    gameState.food = [{ x: 500, y: 500 }];

    handleFoodCollisions();

    expect(gameState.food.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(100);
  });
});

describe('handlePlayerAICollisions', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    gameState.aiPlayers = [];
  });

  test('larger player cell consumes AI', () => {
    const playerCell = { x: 100, y: 100, score: 400 };  // Large player
    const ai = { x: 100, y: 100, score: 100 };  // Small AI

    gameState.playerCells = [playerCell];
    gameState.aiPlayers = [ai];

    handlePlayerAICollisions();

    expect(gameState.aiPlayers.length).toBe(0);
    expect(gameState.playerCells[0].score).toBe(600);  // 400 + 100 + 100 bonus
  });

  test('larger AI consumes player cell', () => {
    const playerCell = { x: 100, y: 100, score: 100 };  // Small player
    const ai = { x: 100, y: 100, score: 400 };  // Large AI

    gameState.playerCells = [playerCell];
    gameState.aiPlayers = [ai];

    handlePlayerAICollisions();

    expect(gameState.playerCells.length).toBe(1);  // Player respawns
    expect(gameState.aiPlayers[0].score).toBe(600);  // 400 + 100 + 100 bonus
  });
});

describe('handleAIAICollisions', () => {
  beforeEach(() => {
    gameState.aiPlayers = [];
  });

  test('larger AI consumes smaller AI', () => {
    const ai1 = { x: 100, y: 100, score: 400 };  // Large AI
    const ai2 = { x: 100, y: 100, score: 100 };  // Small AI

    gameState.aiPlayers = [ai1, ai2];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(1);
    expect(gameState.aiPlayers[0].score).toBe(600);  // 400 + 100 + 100 bonus
  });

  test('equal sized AIs do not consume each other', () => {
    const ai1 = { x: 100, y: 100, score: 100 };
    const ai2 = { x: 100, y: 100, score: 100 };

    gameState.aiPlayers = [ai1, ai2];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(2);
    expect(gameState.aiPlayers[0].score).toBe(100);
    expect(gameState.aiPlayers[1].score).toBe(100);
  });

  test('smaller AI is consumed when second AI is larger', () => {
    const ai1 = { x: 100, y: 100, score: 100 };
    const ai2 = { x: 100, y: 100, score: 400 };

    gameState.aiPlayers = [ai1, ai2];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(1);
    expect(gameState.aiPlayers[0].score).toBe(600);
  });

  test('does not consume AIs that are far apart', () => {
    const ai1 = { x: 100, y: 100, score: 400 };
    const ai2 = { x: 900, y: 900, score: 100 };

    gameState.aiPlayers = [ai1, ai2];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(2);
  });
});

describe('handleFoodCollisions (AI eating)', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    gameState.aiPlayers = [];
    gameState.food = [];
  });

  test('AI consumes food when overlapping', () => {
    gameState.aiPlayers = [{ x: 100, y: 100, score: 100 }];
    gameState.food = [{ x: 100, y: 100 }];

    handleFoodCollisions();

    expect(gameState.food.length).toBe(0);
    expect(gameState.aiPlayers[0].score).toBe(110);
  });

  test('AI does not consume food when far away', () => {
    gameState.aiPlayers = [{ x: 100, y: 100, score: 100 }];
    gameState.food = [{ x: 500, y: 500 }];

    handleFoodCollisions();

    expect(gameState.food.length).toBe(1);
    expect(gameState.aiPlayers[0].score).toBe(100);
  });

  test('multiple AIs can eat different food items', () => {
    gameState.aiPlayers = [
      { x: 100, y: 100, score: 100 },
      { x: 500, y: 500, score: 100 }
    ];
    gameState.food = [
      { x: 100, y: 100 },
      { x: 500, y: 500 }
    ];

    handleFoodCollisions();

    expect(gameState.food.length).toBe(0);
    expect(gameState.aiPlayers[0].score).toBe(110);
    expect(gameState.aiPlayers[1].score).toBe(110);
  });
});

describe('respawnEntities', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    gameState.aiPlayers = [];
    gameState.food = [];
  });

  test('respawns food to reach FOOD_COUNT', () => {
    gameState.food = [];
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];

    respawnEntities();

    expect(gameState.food.length).toBe(FOOD_COUNT);
  });

  test('respawns AI players to reach AI_COUNT', () => {
    gameState.aiPlayers = [];
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];

    respawnEntities();

    expect(gameState.aiPlayers.length).toBe(AI_COUNT);
  });

  test('does not add extra food when already at FOOD_COUNT', () => {
    gameState.food = Array.from({ length: FOOD_COUNT }, () => ({
      x: Math.random() * 1000, y: Math.random() * 1000, color: 'red'
    }));
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];

    respawnEntities();

    expect(gameState.food.length).toBe(FOOD_COUNT);
  });

  test('respawns player cell when all player cells are gone', () => {
    gameState.playerCells = [];

    respawnEntities();

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(STARTING_SCORE);
    expect(gameState.playerCells[0].velocityX).toBe(0);
    expect(gameState.playerCells[0].velocityY).toBe(0);
  });

  test('does not respawn player when player cells exist', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 200, velocityX: 1, velocityY: 1 }];

    respawnEntities();

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(200);
  });
});