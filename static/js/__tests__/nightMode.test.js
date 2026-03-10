import { drawGame } from '../renderer.js';
import { gameState } from '../gameState.js';
import { NIGHT_MODE_RADIUS } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    camera: { x: 0, y: 0 },
    playerName: 'TestPlayer',
    nightMode: false
  },
  mouse: { x: 0, y: 0 }
}));

// Mock canvas context methods
const mockCtx = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  rect: jest.fn(),
  fill: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  set fillStyle(_v) {},
  get fillStyle() { return ''; },
  set strokeStyle(_v) {},
  get strokeStyle() { return ''; },
  set lineWidth(_v) {},
  get lineWidth() { return 1; },
  set font(_v) {},
  get font() { return ''; },
  set textAlign(_v) {},
  get textAlign() { return ''; },
  set textBaseline(_v) {},
  get textBaseline() { return ''; }
};

const mockCanvas = {
  width: 800,
  height: 600,
  getContext: jest.fn(() => mockCtx)
};

// Mock renderer internals by importing and initializing
jest.mock('../utils.js', () => ({
  getSize: jest.fn((score) => Math.sqrt(score) + 20),
  calculateCenterOfMass: jest.fn(() => ({ x: 100, y: 100 }))
}));

// We need to import initRenderer to set up internal canvas references
import { initRenderer } from '../renderer.js';

describe('nightMode default state', () => {
  test('gameState.nightMode defaults to false', () => {
    expect(gameState.nightMode).toBe(false);
  });
});

describe('drawGame with nightMode', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Reset gameState
    gameState.playerCells = [{ x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 }];
    gameState.aiPlayers = [];
    gameState.food = [];
    gameState.camera = { x: 0, y: 0 };
    gameState.nightMode = false;

    // Initialize renderer with mock canvas elements
    initRenderer({
      gameCanvas: mockCanvas,
      minimapCanvas: { ...mockCanvas, getContext: jest.fn(() => ({ ...mockCtx })) },
      scoreElement: { textContent: '' },
      leaderboardContent: { innerHTML: '' }
    });
  });

  test('does not draw night overlay when nightMode is false', () => {
    gameState.nightMode = false;

    drawGame();

    // save/restore are used by drawCellWithName, but the night mode
    // specific pattern is rect + arc + fill('evenodd')
    expect(mockCtx.fill).not.toHaveBeenCalledWith('evenodd');
  });

  test('draws night overlay when nightMode is true', () => {
    gameState.nightMode = true;

    drawGame();

    // Night mode should call fill with 'evenodd' for the cutout
    expect(mockCtx.fill).toHaveBeenCalledWith('evenodd');
    // Should create a radial gradient for the soft edge
    expect(mockCtx.createRadialGradient).toHaveBeenCalled();
    // Should save and restore context
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  test('does not throw when nightMode is toggled during gameplay', () => {
    gameState.nightMode = true;
    expect(() => drawGame()).not.toThrow();

    gameState.nightMode = false;
    expect(() => drawGame()).not.toThrow();
  });
});
