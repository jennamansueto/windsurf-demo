import { gameState } from './gameState.js';

// Particle lifetime in frames (~0.3s at 60fps = 18 frames)
const PARTICLE_LIFETIME = 18;
const BURST_PARTICLE_COUNT = 12;
const SPARKLE_PARTICLE_COUNT = 8;

/**
 * Spawn a radial burst of colored particles when a cell is consumed.
 * Player cell bursts use teal #008080; AI cell bursts use the cell's own color.
 */
export function spawnBurstParticles(x, y, color) {
    for (let i = 0; i < BURST_PARTICLE_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / BURST_PARTICLE_COUNT;
        const speed = 2 + Math.random() * 2;
        gameState.particles.push({
            type: 'burst',
            x,
            y,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            color: color,
            lifetime: PARTICLE_LIFETIME,
            maxLifetime: PARTICLE_LIFETIME,
            radius: 3 + Math.random() * 2
        });
    }
}

/**
 * Spawn a small sparkle cluster when food is eaten.
 * Colors use HSL matching the food color palette.
 */
export function spawnSparkles(x, y) {
    for (let i = 0; i < SPARKLE_PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 1.5;
        gameState.particles.push({
            type: 'sparkle',
            x,
            y,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            lifetime: PARTICLE_LIFETIME,
            maxLifetime: PARTICLE_LIFETIME,
            radius: 1.5 + Math.random() * 1.5
        });
    }
}

/**
 * Spawn an expanding ring animation when a player splits.
 * Ring is a circle that grows outward with an opacity fade,
 * mirroring the panel reveal pattern (scale grows from small value outward).
 */
export function spawnExpandingRing(x, y, radius) {
    gameState.particles.push({
        type: 'ring',
        x,
        y,
        velocityX: 0,
        velocityY: 0,
        color: '#008080',
        lifetime: PARTICLE_LIFETIME,
        maxLifetime: PARTICLE_LIFETIME,
        radius: radius * 0.5,
        startRadius: radius * 0.5,
        maxRadius: radius * 2.0,
        lineWidth: 2
    });
}

/**
 * Advance all particle lifetimes and positions each game tick.
 * Removes particles whose lifetime has expired.
 */
export function updateParticles() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.lifetime--;

        if (p.lifetime <= 0) {
            gameState.particles.splice(i, 1);
            continue;
        }

        // Update position for burst and sparkle particles
        if (p.type === 'burst' || p.type === 'sparkle') {
            p.x += p.velocityX;
            p.y += p.velocityY;
            // Apply friction
            p.velocityX *= 0.95;
            p.velocityY *= 0.95;
        }

        // Expand ring radius over time (linear interpolation from initial to max)
        if (p.type === 'ring') {
            const progress = 1 - (p.lifetime / p.maxLifetime);
            p.radius = p.startRadius + (p.maxRadius - p.startRadius) * progress;
        }
    }
}

/**
 * Draw all active particles to the canvas.
 * Uses camera offset from gameState for world-to-screen conversion.
 */
export function drawParticles(ctx) {
    for (const p of gameState.particles) {
        const screenX = p.x - gameState.camera.x;
        const screenY = p.y - gameState.camera.y;
        const alpha = p.lifetime / p.maxLifetime;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.type === 'ring') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.lineWidth;
            ctx.stroke();
        } else {
            // burst and sparkle particles
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        ctx.restore();
    }
}
