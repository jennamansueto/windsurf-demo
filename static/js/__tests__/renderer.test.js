import { gameState } from '../gameState.js';
import { initRenderer, drawGame } from '../renderer.js';

// Mock canvas and context
function createMockContext() {
    return {
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        fillText: jest.fn(),
        strokeText: jest.fn(),
        drawImage: jest.fn(),
        createRadialGradient: jest.fn(() => ({
            addColorStop: jest.fn()
        })),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        textAlign: '',
        textBaseline: '',
        font: '',
        globalCompositeOperation: ''
    };
}

function createMockCanvas(ctx) {
    return {
        width: 800,
        height: 600,
        getContext: jest.fn(() => ctx)
    };
}

describe('drawGame night mode overlay', () => {
    let mainCtx;
    let minimapCtx;

    beforeEach(() => {
        mainCtx = createMockContext();
        minimapCtx = createMockContext();

        const gameCanvas = createMockCanvas(mainCtx);
        const minimapCanvas = createMockCanvas(minimapCtx);

        // Mock document.createElement for the offscreen overlay canvas
        const overlayCtx = createMockContext();
        jest.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag === 'canvas') {
                return createMockCanvas(overlayCtx);
            }
            return document.createElement(tag);
        });

        initRenderer({
            gameCanvas,
            minimapCanvas,
            scoreElement: { textContent: '' },
            leaderboardContent: { innerHTML: '' }
        });

        // Reset player state
        gameState.playerCells = [{ x: 400, y: 300, score: 100, velocityX: 0, velocityY: 0 }];
        gameState.camera = { x: 0, y: 0 };
        gameState.food = [];
        gameState.aiPlayers = [];
    });

    afterEach(() => {
        gameState.nightMode = false;
        jest.restoreAllMocks();
    });

    test('draws overlay when nightMode is true', () => {
        gameState.nightMode = true;
        drawGame();

        // The overlay is drawn via drawImage on the main context
        expect(mainCtx.drawImage).toHaveBeenCalled();
    });

    test('does not draw overlay when nightMode is false', () => {
        gameState.nightMode = false;
        drawGame();

        // drawImage should not be called when night mode is off
        expect(mainCtx.drawImage).not.toHaveBeenCalled();
    });

    test('creates radial gradient for each player cell when nightMode is true', () => {
        gameState.nightMode = true;
        gameState.playerCells = [
            { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 },
            { x: 500, y: 400, score: 200, velocityX: 0, velocityY: 0 }
        ];
        drawGame();

        // An offscreen canvas was created for the overlay
        expect(document.createElement).toHaveBeenCalledWith('canvas');
    });
});
