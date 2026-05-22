import { WORLD_SIZE, STARTING_SCORE, NIGHT_MODE } from './config.js';

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
    nightMode: false,
    stars: []
};

export function generateStars() {
    gameState.stars = [];
    for (let i = 0; i < NIGHT_MODE.STAR_COUNT; i++) {
        gameState.stars.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            radius: Math.random() * 1.5 + 0.5,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
}

export const mouse = { x: 0, y: 0 };