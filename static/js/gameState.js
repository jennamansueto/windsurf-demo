import { WORLD_SIZE, STARTING_SCORE, HOLIDAY_THEME_ENABLED } from './config.js';

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
    holidayTheme: HOLIDAY_THEME_ENABLED
};

export const mouse = { x: 0, y: 0 };
