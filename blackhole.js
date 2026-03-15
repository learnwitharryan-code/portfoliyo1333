/**
 * blackhole.js
 * Interactive Canvas Black Hole Background with Accretion Disk
 */

const canvas = document.getElementById('blackHoleCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height, cx, cy;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
}

window.addEventListener('resize', resize);
resize();

// Colors & Cosmic Params
const colors = ['#8a2be2', '#4b0082', '#00bfff', '#4169e1', '#ffffff', '#e0b0ff'];
// Optimize for mobile by significantly reducing particles
const isMobile = window.innerWidth <= 768;
const particleCount = isMobile ? 800 : 2500;
const bhRadius = isMobile ? 50 : 80;

const particles = [];
for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Distribute heavily near the event horizon with an exponential dropoff
    const distance = bhRadius + Math.random() * 20 + Math.pow(Math.random(), 3) * (Math.max(width, height) * 1.5);
    
    particles.push({
        angle: angle,
        dist: distance,
        size: Math.random() * 1.5 + 0.5,
        speed: (Math.random() * 0.02 + 0.005) * (bhRadius / (distance * 0.5)),
        color: colors[Math.floor(Math.random() * colors.length)]
    });
}

const stars = [];
for (let i = 0; i < 400; i++) {
    stars.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * Math.max(width, height),
        size: Math.random() * 1.5,
        alpha: Math.random() * 0.8 + 0.2
    });
}

// Interaction states
let speedMultiplier = 1;
let targetSpeedMultiplier = 1;

document.addEventListener('mousedown', () => targetSpeedMultiplier = 8);
document.addEventListener('mouseup', () => targetSpeedMultiplier = 1);

// For mobile, apply a burst of speed on touchstart (so scrolling feels heavy but fluid), 
// but don't hold the speed during the entire scroll drag to save battery logic cycles.
document.addEventListener('touchstart', () => {
    targetSpeedMultiplier = 5;
    setTimeout(() => targetSpeedMultiplier = 1, 300); // Quick reset burst
}, { passive: true });

let diskAngle = 0; 
const diskTilt = 0.35; // 1 is flat/top-down, 0 is edge-on

function animate() {
    // Cinematic trail effect via dark background with opacity
    ctx.fillStyle = 'rgba(2, 2, 4, 0.25)'; // Deep space black
    ctx.fillRect(0, 0, width, height);
    
    // Smooth interaction acceleration
    speedMultiplier += (targetSpeedMultiplier - speedMultiplier) * 0.05;
    diskAngle += 0.001 * speedMultiplier;

    // 1. Background Stars
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(diskAngle * 0.1); // Stars rotate very slowly
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        const sx = Math.cos(star.angle) * star.dist;
        const sy = Math.sin(star.angle) * star.dist;
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();

    // 2. Calculate Particle Positions ahead of rendering
    particles.forEach(p => {
        // Gravitational pull effect when interacting
        if (speedMultiplier > 1.5) {
             p.dist -= (speedMultiplier * 1.5) * (bhRadius / p.dist);
             // Re-emit particles that fall into the event horizon
             if (p.dist < bhRadius) {
                 p.dist = bhRadius + Math.random() * 300 + 100; 
                 p.angle = Math.random() * Math.PI * 2;
             }
        }
        
        p.angle += p.speed * speedMultiplier;
        
        // Calculate coords relative to tilted disk plane
        p.currentX = Math.cos(p.angle) * p.dist;
        p.currentY = Math.sin(p.angle) * p.dist * diskTilt;
        
        // Is it in the top half (y < 0) or bottom half (y >= 0)?
        // Math.sin(p.angle) dictates far/near split
        p.isFar = Math.sin(p.angle) < 0; 
    });

    // 3. Draw Far particles (Behind Black Hole)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(diskAngle); // Rotate whole disk on Z axis
    drawParticles(particles.filter(p => p.isFar));
    ctx.restore();

    // 4. Draw Black Hole (Event Horizon + Glow)
    ctx.save();
    ctx.translate(cx, cy);
    
    // Core glow
    const gradient = ctx.createRadialGradient(0, 0, bhRadius * 0.8, 0, 0, bhRadius * 4);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.3, `rgba(60, 10, 150, ${0.4 + speedMultiplier*0.08})`); // Deep Purple
    gradient.addColorStop(0.7, `rgba(0, 150, 255, ${0.15 + speedMultiplier*0.04})`); // Cosmic Blue
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, bhRadius * 4.5, 0, Math.PI * 2);
    ctx.fill();
    
    // The Absolute Void (Event Horizon)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Intense Event Horizon Rim
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + (speedMultiplier - 1)*0.05})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();

    // 5. Draw Near particles (In Front of Black Hole)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(diskAngle);
    drawParticles(particles.filter(p => !p.isFar));
    ctx.restore();
    
    requestAnimationFrame(animate);
}

function drawParticles(partArray) {
    partArray.forEach(p => {
        ctx.fillStyle = p.color;
        // Fade out slightly the further they are from the center
        const maxDist = Math.max(width, height) * 0.8;
        ctx.globalAlpha = Math.max(0, 1 - (p.dist / maxDist));
        
        ctx.beginPath();
        ctx.arc(p.currentX, p.currentY, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

// Kickoff
animate();
