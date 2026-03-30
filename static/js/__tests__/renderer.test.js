import { initRenderer, drawGame, drawMinimap } from '../renderer.js';
import { gameState } from '../gameState.js';
import { FEATURE_FLAGS } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    camera: { x: 0, y: 0 },
    playerName: 'TestPlayer',
    nightMode: false
  }
}));

// Mock config with mutable FEATURE_FLAGS
jest.mock('../config.js', () => ({
  WORLD_SIZE: 2000,
  FOOD_SIZE: 5,
  FEATURE_FLAGS: {
    NIGHT_MODE: true
  },
  NIGHT_MODE_RADIUS: 250,
  NIGHT_MODE_SCALE_FACTOR: 0.5,
  COLORS: {
    PLAYER: '#008080',
    MINIMAP: {
      PLAYER: '#4CAF50',
      TOP_PLAYER: '#FFC107',
      OTHER: 'rgba(255, 255, 255, 0.3)'
    }
  }
}));

// Create mock canvas contexts
function createMockCtx() {
  return {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    strokeRect: jest.fn(),
    createRadialGradient: jest.fn(() => ({
      addColorStop: jest.fn()
    })),
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    font: null,
    textAlign: null,
    textBaseline: null
  };
}

describe('drawGame', () => {
  let mockCtx;
  let mockMinimapCtx;

  beforeEach(() => {
    mockCtx = createMockCtx();
    mockMinimapCtx = createMockCtx();

    const mockCanvas = {
      getContext: () => mockCtx,
      width: 800,
      height: 600
    };
    const mockMinimapCanvas = {
      getContext: () => mockMinimapCtx,
      width: 150,
      height: 150
    };
    const mockScoreElement = { textContent: '' };
    const mockLeaderboardContent = { innerHTML: '' };

    initRenderer({
      gameCanvas: mockCanvas,
      minimapCanvas: mockMinimapCanvas,
      scoreElement: mockScoreElement,
      leaderboardContent: mockLeaderboardContent
    });

    gameState.playerCells = [{ x: 400, y: 300, score: 100, velocityX: 0, velocityY: 0 }];
    gameState.aiPlayers = [];
    gameState.food = [];
    gameState.camera = { x: 0, y: 0 };
    gameState.nightMode = false;
    FEATURE_FLAGS.NIGHT_MODE = true;
  });

  test('does not draw night mode overlay when nightMode is false', () => {
    gameState.nightMode = false;

    drawGame();

    expect(mockCtx.createRadialGradient).not.toHaveBeenCalled();
  });

  test('draws night mode overlay when nightMode is true and feature flag is on', () => {
    gameState.nightMode = true;

    drawGame();

    expect(mockCtx.createRadialGradient).toHaveBeenCalled();
    // Canvas dimensions come from resizeCanvas() using window.innerWidth/Height
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, expect.any(Number), expect.any(Number));
  });

  test('does not draw night mode overlay when feature flag is off', () => {
    gameState.nightMode = true;
    FEATURE_FLAGS.NIGHT_MODE = false;

    drawGame();

    expect(mockCtx.createRadialGradient).not.toHaveBeenCalled();
  });

  test('gradient uses correct color stops for night mode', () => {
    gameState.nightMode = true;
    const mockGradient = { addColorStop: jest.fn() };
    mockCtx.createRadialGradient.mockReturnValue(mockGradient);

    drawGame();

    expect(mockGradient.addColorStop).toHaveBeenCalledWith(0, 'rgba(0, 0, 0, 0)');
    expect(mockGradient.addColorStop).toHaveBeenCalledWith(0.7, 'rgba(0, 0, 0, 0)');
    expect(mockGradient.addColorStop).toHaveBeenCalledWith(1, 'rgba(0, 0, 0, 0.95)');
  });
});

describe('drawMinimap', () => {
  let mockCtx;
  let mockMinimapCtx;

  beforeEach(() => {
    mockCtx = createMockCtx();
    mockMinimapCtx = createMockCtx();

    const mockCanvas = {
      getContext: () => mockCtx,
      width: 800,
      height: 600
    };
    const mockMinimapCanvas = {
      getContext: () => mockMinimapCtx,
      width: 150,
      height: 150
    };
    const mockScoreElement = { textContent: '' };
    const mockLeaderboardContent = { innerHTML: '' };

    initRenderer({
      gameCanvas: mockCanvas,
      minimapCanvas: mockMinimapCanvas,
      scoreElement: mockScoreElement,
      leaderboardContent: mockLeaderboardContent
    });

    gameState.playerCells = [{ x: 400, y: 300, score: 100 }];
    gameState.aiPlayers = [{ x: 600, y: 400, score: 50, color: 'red', name: 'AI1' }];
    gameState.food = [];
    gameState.camera = { x: 0, y: 0 };
    gameState.nightMode = false;
    FEATURE_FLAGS.NIGHT_MODE = true;
  });

  test('draws AI dots on minimap when night mode is off', () => {
    gameState.nightMode = false;

    drawMinimap();

    // Player dot + AI dot = at least 2 arc calls
    const arcCalls = mockMinimapCtx.arc.mock.calls;
    expect(arcCalls.length).toBeGreaterThanOrEqual(2);
  });

  test('skips AI dots on minimap when night mode is on', () => {
    gameState.nightMode = true;

    drawMinimap();

    // Only the player dot should be drawn (1 arc call)
    const arcCalls = mockMinimapCtx.arc.mock.calls;
    expect(arcCalls.length).toBe(1);
  });

  test('still draws player marker on minimap in night mode', () => {
    gameState.nightMode = true;

    drawMinimap();

    // Player dot should still be drawn
    expect(mockMinimapCtx.arc).toHaveBeenCalled();
    expect(mockMinimapCtx.fill).toHaveBeenCalled();
  });

  test('still draws viewport rectangle on minimap in night mode', () => {
    gameState.nightMode = true;

    drawMinimap();

    expect(mockMinimapCtx.strokeRect).toHaveBeenCalled();
  });
});
