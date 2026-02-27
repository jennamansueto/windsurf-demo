// Module-level particle pool
const particles = [];

// --- Emitters ---

/**
 * Spawn burst particles when a cell is consumed.
 * 8-12 particles radiating outward in random directions.
 * Default color: teal #008080 (player cell color per design SKILL.md)
 * maxLifetime ~ 20 ticks (~0.3s at 60fps)
 */
export function spawnBurstParticles(x, y, color = '#008080') {
    const count = 8 + Math.floor(Math.random() * 5); // 8-12
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 3 + Math.random() * 3,
            color,
            lifetime: 20,
            maxLifetime: 20,
            type: 'particle'
        });
    }
}

/**
 * Spawn food sparkles when food is eaten.
 * 4-6 tiny particles with HSL color (matches food color convention in design SKILL.md).
 * maxLifetime ~ 15 ticks
 * Small radius (2-3px)
 */
export function spawnFoodSparkles(x, y) {
    const count = 4 + Math.floor(Math.random() * 3); // 4-6
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2;
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2 + Math.random(),
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            lifetime: 15,
            maxLifetime: 15,
            type: 'particle'
        });
    }
}

/**
 * Spawn a split ring when a player splits.
 * A single expanding ring (not a cluster of particles).
 * strokeStyle = '#FFC107' (amber, per design SKILL.md)
 * Radius grows from 0 -> ~40px over maxLifetime ~ 18 ticks
 * Alpha fades out as lifetime / maxLifetime
 */
export function spawnSplitRing(x, y) {
    particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 0,
        color: '#FFC107',
        lifetime: 18,
        maxLifetime: 18,
        type: 'ring'
    });
}

// --- Update & Render ---

/**
 * Advance particle simulation: decrement lifetime, update positions, remove dead particles.
 */
export function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.lifetime--;

        if (p.lifetime <= 0) {
            particles.splice(i, 1);
            continue;
        }

        if (p.type === 'ring') {
            // Expand ring radius from 0 -> ~40px over its lifetime
            const progress = 1 - (p.lifetime / p.maxLifetime);
            p.radius = progress * 40;
        } else {
            // Move normal particles
            p.x += p.vx;
            p.y += p.vy;
        }
    }
}

/**
 * Render all live particles with alpha fade.
 * Save and restore ctx.globalAlpha around each particle draw.
 */
export function drawParticles(ctx) {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const alpha = p.lifetime / p.maxLifetime;

        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = alpha;

        if (p.type === 'ring') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        ctx.globalAlpha = prevAlpha;
    }
}
