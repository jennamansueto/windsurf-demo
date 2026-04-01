import { initRenderer, drawGame, drawMinimap, resizeCanvas } from '../renderer.js';
import { gameState } from '../gameState.js';
import { NIGHT_MODE_RADIUS } from '../config.js';

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

jest.mock('../utils.js', () => ({
  getSize: jest.fn((score) => Math.sqrt(score) + 20),
  calculateCenterOfMass: jest.fn(() => ({ x: 100, y: 100 }))
}));

let mockCtx, mockMinimapCtx, mockCanvas, mockMinimapCanvas;

beforeEach(() => {
  gameState.playerCells = [{ x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 }];
  gameState.aiPlayers = [];
  gameState.food = [];
  gameState.camera = { x: 0, y: 0 };
  gameState.nightMode = false;

  mockCtx = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    createRadialGradient: jest.fn(() => ({
      addColorStop: jest.fn()
    })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    globalCompositeOperation: ''
  };

  mockMinimapCtx = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillStyle: '',
    strokeStyle: ''
  };

  mockCanvas = {
    getContext: jest.fn(() => mockCtx),
    width: 800,
    height: 600
  };

  mockMinimapCanvas = {
    getContext: jest.fn(() => mockMinimapCtx),
    width: 150,
    height: 150
  };

  initRenderer({
    gameCanvas: mockCanvas,
    minimapCanvas: mockMinimapCanvas,
    scoreElement: { textContent: '' },
    leaderboardContent: { innerHTML: '' }
  });
});

describe('drawGame', () => {
  test('draws game without night mode overlay when disabled', () => {
    gameState.nightMode = false;
    drawGame();

    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.createRadialGradient).not.toHaveBeenCalled();
  });

  test('applies night mode overlay when enabled', () => {
    gameState.nightMode = true;
    drawGame();

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.createRadialGradient).toHaveBeenCalled();
    expect(mockCtx.globalCompositeOperation).toBe('destination-in');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  test('creates radial gradient centered on player center of mass', () => {
    gameState.nightMode = true;
    drawGame();

    const call = mockCtx.createRadialGradient.mock.calls[0];
    const screenX = call[0];
    const screenY = call[1];
    expect(call[2]).toBe(0);
    expect(call[3]).toBe(screenX);
    expect(call[4]).toBe(screenY);
    expect(call[5]).toBe(NIGHT_MODE_RADIUS);
  });
});

describe('drawMinimap', () => {
  test('does not apply night mode overlay to minimap', () => {
    gameState.nightMode = true;
    drawMinimap();

    expect(mockMinimapCtx.fillRect).toHaveBeenCalledTimes(1);
    expect(mockMinimapCtx.fillRect).toHaveBeenCalledWith(0, 0, 150, 150);
  });
});
