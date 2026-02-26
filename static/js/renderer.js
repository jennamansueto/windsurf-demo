import { gameState } from './gameState.js';
import { getSize, calculateCenterOfMass } from './utils.js';
import { WORLD_SIZE, COLORS, FOOD_SIZE } from './config.js';

let canvas, ctx, minimapCanvas, minimapCtx, scoreElement, leaderboardContent;

export function initRenderer(canvasElements) {
    canvas = canvasElements.gameCanvas;
    ctx = canvas.getContext('2d');
    minimapCanvas = canvasElements.minimapCanvas;
    minimapCtx = minimapCanvas.getContext('2d');
    scoreElement = canvasElements.scoreElement;
    leaderboardContent = canvasElements.leaderboardContent;

    // Initial canvas setup
    resizeCanvas();
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawCircle(x, y, value, color, isFood) {
    const size = isFood ? value : getSize(value);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSantaHat(x, y, cellSize) {
    ctx.save();

    // Scale all hat dimensions relative to cell size
    const scale = cellSize / 40;

    // Hat sits on top of the cell
    const hatBaseY = y - cellSize * 0.75;

    // White fur brim (wide band at the base of the hat)
    const brimWidth = cellSize * 1.1;
    const brimHeight = 10 * scale;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(x, hatBaseY, brimWidth / 2, brimHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red hat body (triangle curving to the right)
    ctx.fillStyle = '#CC0000';
    ctx.beginPath();
    ctx.moveTo(x - brimWidth / 2, hatBaseY);
    // Left side curves up
    ctx.quadraticCurveTo(
        x - cellSize * 0.2, hatBaseY - cellSize * 0.9,
        x + cellSize * 0.5, hatBaseY - cellSize * 0.85
    );
    // Tip curves back down to the right
    ctx.quadraticCurveTo(
        x + cellSize * 0.3, hatBaseY - cellSize * 0.5,
        x + brimWidth / 2, hatBaseY
    );
    ctx.closePath();
    ctx.fill();

    // White pompom at the tip
    const pompomRadius = 6 * scale;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(
        x + cellSize * 0.5,
        hatBaseY - cellSize * 0.85,
        pompomRadius,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
}

function drawCellWithName(x, y, score, color, name, isPlayer) {
    const size = getSize(score);
    
    // Draw cell
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw Santa hat on player cell if holiday theme is active
    if (isPlayer && gameState.holidayTheme) {
        drawSantaHat(x, y, size);
    }

    // Draw name
    if (size > 20) {  // Only draw name if cell is big enough
        ctx.save();
        
        // Calculate font size based on cell size
        const fontSize = Math.max(12, Math.min(20, size / 2));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text stroke (outline)
        ctx.strokeText(name, x, y);
        // Draw text fill
        ctx.fillText(name, x, y);
        
        ctx.restore();
    }
}

export function drawGame() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update camera to follow player's center of mass
    const centerOfMass = calculateCenterOfMass(gameState.playerCells);
    gameState.camera.x = centerOfMass.x - canvas.width / 2;
    gameState.camera.y = centerOfMass.y - canvas.height / 2;

    // Draw food
    gameState.food.forEach(food => {
        const screenX = food.x - gameState.camera.x;
        const screenY = food.y - gameState.camera.y;
        
        if (screenX >= -FOOD_SIZE && screenX <= canvas.width + FOOD_SIZE &&
            screenY >= -FOOD_SIZE && screenY <= canvas.height + FOOD_SIZE) {
            drawCircle(screenX, screenY, FOOD_SIZE, food.color, true);
        }
    });

    // Draw AI players
    gameState.aiPlayers.forEach(ai => {
        const screenX = ai.x - gameState.camera.x;
        const screenY = ai.y - gameState.camera.y;
        const size = getSize(ai.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            drawCellWithName(screenX, screenY, ai.score, ai.color, ai.name, false);
        }
    });

    // Draw player cells
    gameState.playerCells.forEach(cell => {
        const screenX = cell.x - gameState.camera.x;
        const screenY = cell.y - gameState.camera.y;
        const size = getSize(cell.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            drawCellWithName(screenX, screenY, cell.score, COLORS.PLAYER, gameState.playerName, true);
        }
    });

    // Update score display
    scoreElement.textContent = `Score: ${Math.floor(gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0))}`;
}

export function drawMinimap() {
    if (!minimapCtx) return;

    const MINIMAP_SIZE = 150;
    const scale = MINIMAP_SIZE / WORLD_SIZE;
    
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    minimapCtx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    
    const viewWidth = canvas.width * scale;
    const viewHeight = canvas.height * scale;
    const viewX = gameState.camera.x * scale;
    const viewY = gameState.camera.y * scale;
    minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    minimapCtx.strokeRect(viewX, viewY, viewWidth, viewHeight);

    // Draw AI players on minimap
    gameState.aiPlayers.forEach(ai => {
        minimapCtx.beginPath();
        minimapCtx.arc(
            ai.x * scale,
            ai.y * scale,
            2,
            0,
            Math.PI * 2
        );
        minimapCtx.fillStyle = COLORS.MINIMAP.OTHER;
        minimapCtx.fill();
    });

    // Draw player cells on minimap
    gameState.playerCells.forEach(cell => {
        minimapCtx.beginPath();
        minimapCtx.arc(
            cell.x * scale,
            cell.y * scale,
            3,
            0,
            Math.PI * 2
        );
        minimapCtx.fillStyle = COLORS.MINIMAP.PLAYER;
        minimapCtx.fill();
    });
}

export function updateLeaderboard() {
    if (!leaderboardContent) return;

    const playerTotalScore = gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0);
    
    // Combine player score with AI scores
    const allPlayers = [
        { 
            name: gameState.playerName,
            score: playerTotalScore,
            isPlayer: true
        },
        ...gameState.aiPlayers.map(ai => ({
            name: ai.name,
            score: ai.score,
            isPlayer: false
        }))
    ];

    allPlayers.sort((a, b) => b.score - a.score);
    
    leaderboardContent.innerHTML = allPlayers
        .slice(0, 5)
        .map((player, index) => `
            <div class="leaderboard-item">
                <span class="${player.isPlayer ? 'player-name' : ''}">${index + 1}. ${player.name}</span>
                <span>${Math.floor(player.score)}</span>
            </div>
        `)
        .join('');
}
