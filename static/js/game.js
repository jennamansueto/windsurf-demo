import { gameState, mouse } from './gameState.js';
import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from './renderer.js';
import { updatePlayer, updateAI, initEntities, handlePlayerSplit } from './entities.js';
import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions, respawnEntities } from './collisions.js';
import { initUI } from './ui.js';
import { setDifficulty } from './config.js';

function setupInputHandlers() {
    const canvas = document.getElementById('gameCanvas');
    
    // Mouse movement
    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Mouse click for splitting
    canvas.addEventListener('click', (e) => {
        handlePlayerSplit();
    });

    // Window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
}

function checkCollisions() {
    handleFoodCollisions();
    handlePlayerAICollisions();
    handleAIAICollisions();
    respawnEntities();
}

function verifyGameState() {
    console.log('Verifying game state...');
    console.log('Player cells:', gameState.playerCells);
    console.log('AI players:', gameState.aiPlayers);
    console.log('Food count:', gameState.food.length);

    if (gameState.playerCells.length === 0) {
        console.error('No player cells found!');
    }
    if (gameState.aiPlayers.length === 0) {
        console.error('No AI players found!');
    }
    if (gameState.food.length === 0) {
        console.error('No food found!');
    }
}

function gameLoop() {
    updatePlayer();
    updateAI();
    checkCollisions();
    updateLeaderboard();
    drawGame();
    drawMinimap();
    requestAnimationFrame(gameLoop);
}

async function initGame() {
    try {
        console.log('Initializing game...');
        
        // Get DOM elements
        const elements = {
            gameCanvas: document.getElementById('gameCanvas'),
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };

        // Verify all elements are found
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Could not find element: ${key}`);
            }
        });

        console.log('DOM elements found');

        // Initialize game components in order
        initRenderer(elements);
        console.log('Renderer initialized');
        
        setupInputHandlers();
        console.log('Input handlers set up');
        
        // Set difficulty from the start screen selector
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect) {
            setDifficulty(difficultySelect.value);
        }

        initEntities();
        console.log('Entities initialized');

        initUI();
        console.log('UI initialized');

        // Verify game state
        verifyGameState();

        // Start game loop
        console.log('Starting game loop');
        gameLoop();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Wait for DOM, then defer game init until the Play button is clicked
function onReady() {
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('start-screen').style.display = 'none';
            initGame();
        });
    } else {
        // Fallback: no start screen (e.g. tests), init immediately
        initGame();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
} else {
    onReady();
}
