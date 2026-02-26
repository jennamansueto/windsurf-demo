import { WORLD_SIZE, STARTING_SCORE } from './config.js';

export const gameState = {
    playerCells: [{
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        score: STARTING_SCORE,
        velocityX: 0,
        velocityY: 0
    }],
    playerName: 'Windsurf',
    camera: {
        x: 0,
        y: 0
    },
    food: [],
    aiPlayers: [],
    // Analytics mode runtime state
    analytics: {
        showSidebar: true,
        aiConsumed: 0,
        foodEaten: 0,
        timeAliveStart: Date.now(),
        scoreHistory: []   // Array of { time, score } for sparkline / tracking
    }
};

export const mouse = { x: 0, y: 0 };
