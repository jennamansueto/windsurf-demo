import { gameState } from './gameState.js';
import { getSize, calculateCenterOfMass } from './utils.js';
import { WORLD_SIZE, COLORS, FOOD_SIZE, SPEED_BOOST_FOOD_SIZE, SPEED_BOOST_FOOD_COLOR } from './config.js';

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

function drawCellWithName(x, y, score, color, name) {
    const size = getSize(score);
    
    // Draw cell
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

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
        const foodRadius = food.type === 'speedBoost' ? SPEED_BOOST_FOOD_SIZE : FOOD_SIZE;
        const screenX = food.x - gameState.camera.x;
        const screenY = food.y - gameState.camera.y;
        
        if (screenX >= -foodRadius && screenX <= canvas.width + foodRadius &&
            screenY >= -foodRadius && screenY <= canvas.height + foodRadius) {
            if (food.type === 'speedBoost') {
                // Draw speed boost food with a pulsing glow
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = SPEED_BOOST_FOOD_COLOR;
                drawCircle(screenX, screenY, foodRadius, food.color, true);
                ctx.restore();
            } else {
                drawCircle(screenX, screenY, foodRadius, food.color, true);
            }
        }
    });

    // Draw AI players
    gameState.aiPlayers.forEach(ai => {
        const screenX = ai.x - gameState.camera.x;
        const screenY = ai.y - gameState.camera.y;
        const size = getSize(ai.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            drawCellWithName(screenX, screenY, ai.score, ai.color, ai.name);
        }
    });

    // Draw player cells
    gameState.playerCells.forEach(cell => {
        const screenX = cell.x - gameState.camera.x;
        const screenY = cell.y - gameState.camera.y;
        const size = getSize(cell.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            // Draw trail if speed boost is active
            if (cell.speedBoostActive && cell.trail) {
                const now = Date.now();
                // Add current position to trail
                cell.trail.push({ x: cell.x, y: cell.y, timestamp: now });
                // Remove trail entries older than 300ms
                cell.trail = cell.trail.filter(t => now - t.timestamp < 300);

                // Draw trail points (before the cell so cell renders on top)
                cell.trail.forEach(point => {
                    const trailScreenX = point.x - gameState.camera.x;
                    const trailScreenY = point.y - gameState.camera.y;
                    const age = now - point.timestamp;
                    const alpha = Math.max(0, 1 - age / 300);

                    ctx.save();
                    ctx.globalAlpha = alpha * 0.5;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = SPEED_BOOST_FOOD_COLOR;
                    ctx.beginPath();
                    ctx.arc(trailScreenX, trailScreenY, size * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = SPEED_BOOST_FOOD_COLOR;
                    ctx.fill();
                    ctx.restore();
                });

                // Draw cell with glow effect
                ctx.save();
                ctx.shadowBlur = 20;
                ctx.shadowColor = SPEED_BOOST_FOOD_COLOR;
                drawCellWithName(screenX, screenY, cell.score, COLORS.PLAYER, gameState.playerName);
                ctx.restore();
            } else {
                // Clear trail when boost ends
                cell.trail = [];
                drawCellWithName(screenX, screenY, cell.score, COLORS.PLAYER, gameState.playerName);
            }
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
