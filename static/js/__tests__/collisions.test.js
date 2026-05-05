import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions, respawnEntities } from '../collisions.js';
import { gameState } from '../gameState.js';
import { getSize } from '../utils.js';
import { FOOD_COUNT, AI_COUNT, STARTING_SCORE } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    playerName: 'Windsurf'
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
});

describe('respawnEntities', () => {
  beforeEach(() => {
    gameState.playerCells = [{ x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 }];
    gameState.food = [];
    gameState.aiPlayers = [];
  });

  test('respawns food to reach FOOD_COUNT', () => {
    gameState.food = [{ x: 50, y: 50, color: 'red' }];

    respawnEntities();

    expect(gameState.food.length).toBe(FOOD_COUNT);
  });

  test('respawns AI players to reach AI_COUNT', () => {
    gameState.aiPlayers = [{ x: 50, y: 50, score: 50, color: 'blue', direction: 0, name: 'Cursor' }];

    respawnEntities();

    expect(gameState.aiPlayers.length).toBe(AI_COUNT);
  });

  test('does not remove existing food when respawning', () => {
    const existingFood = { x: 50, y: 50, color: 'red' };
    gameState.food = [existingFood];

    respawnEntities();

    expect(gameState.food[0]).toBe(existingFood);
  });

  test('respawns player if all cells are gone', () => {
    gameState.playerCells = [];

    respawnEntities();

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(STARTING_SCORE);
    expect(gameState.playerCells[0]).toHaveProperty('x');
    expect(gameState.playerCells[0]).toHaveProperty('y');
    expect(gameState.playerCells[0].velocityX).toBe(0);
    expect(gameState.playerCells[0].velocityY).toBe(0);
  });

  test('does not respawn player if cells exist', () => {
    gameState.playerCells = [{ x: 200, y: 200, score: 500, velocityX: 1, velocityY: 1 }];

    respawnEntities();

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(500);
  });

  test('new food items have position and color properties', () => {
    respawnEntities();

    gameState.food.forEach(food => {
      expect(food).toHaveProperty('x');
      expect(food).toHaveProperty('y');
      expect(food).toHaveProperty('color');
    });
  });
});