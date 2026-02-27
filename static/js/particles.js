// Particle effects system for Windsurf vs All
// Manages burst, sparkle, and ring particles for game events

const particles = [];

/**
 * Spawn burst particles when a cell is consumed.
 * Emits 12–20 particles flying outward in random directions.
 * @param {number} x - World x position
 * @param {number} y - World y position
 * @param {string} color - HSL color string of the consumed cell
 */
export function spawnBurstParticles(x, y, color) {
    const count = 12 + Math.floor(Math.random() * 9); // 12–20
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100; // px/s
        particles.push({
            type: 'burst',
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 0.3, // 0.3s standard transition timing
            color,
            radius: 2 + Math.random() * 3
        });
    }
}

/**
 * Spawn sparkle particles when food is eaten.
 * Emits 5–8 small, short-lived sparkle particles.
 * @param {number} x - World x position
 * @param {number} y - World y position
 */
export function spawnSparkles(x, y) {
    const count = 5 + Math.floor(Math.random() * 4); // 5–8
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40; // subtle movement
        particles.push({
            type: 'sparkle',
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 0.3, // 0.3s standard transition timing
            color: `hsl(${Math.random() * 360}, 80%, 80%)`,
            radius: 1 + Math.random() * 2 // small/subtle (food is 5px)
        });
    }
}

/**
 * Spawn an expanding ring when a player splits.
 * @param {number} x - World x position of the split origin
 * @param {number} y - World y position of the split origin
 * @param {number} radius - Initial radius of the ring (cell size)
 */
export function spawnSplitRing(x, y, radius) {
    particles.push({
        type: 'ring',
        x,
        y,
        radius,
        maxRadius: radius * 2.5,
        life: 0,
        maxLife: 0.3, // 0.3s standard transition timing
        color: '#008080' // Player teal
    });
}

/**
 * Advance all active particle lifetimes by dt seconds.
 * Removes particles that have exceeded their maxLife.
 * @param {number} dt - Delta time in seconds
 */
export function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;

        if (p.life >= p.maxLife) {
            particles.splice(i, 1);
            continue;
        }

        if (p.type === 'burst' || p.type === 'sparkle') {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        if (p.type === 'ring') {
            const progress = p.life / p.maxLife;
            p.currentRadius = p.radius + (p.maxRadius - p.radius) * progress;
        }
    }
}

/**
 * Render all active particles to the canvas.
 * Coordinates are in world space; caller must set up camera transform.
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
 * @param {object} camera - Camera object with x,y offset
 */
export function drawParticles(ctx, camera) {
    for (const p of particles) {
        const alpha = 1 - (p.life / p.maxLife);
        const screenX = p.x - camera.x;
        const screenY = p.y - camera.y;

        if (p.type === 'burst') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (p.type === 'sparkle') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (p.type === 'ring') {
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.currentRadius || p.radius, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = alpha;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

/**
 * Get the current active particles array (for testing).
 * @returns {Array} The active particles array
 */
export function getParticles() {
    return particles;
}

/**
 * Clear all active particles (for testing).
 */
export function clearParticles() {
    particles.length = 0;
}
