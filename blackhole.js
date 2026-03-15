/**
 * blackhole.js
 * Advanced Three.js WebGL Black Hole Animation
 */

// Scene Setup
const canvas = document.getElementById('blackHoleCanvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Default position far enough to see the disk
const baseCameraZ = 60;
camera.position.set(0, 15, baseCameraZ);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
renderer.setClearColor(0x000000, 1);

// --- Cosmic Elements ---

// 1. The Event Horizon (Pure Black Sphere)
const sphereGeometry = new THREE.SphereGeometry(10, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
const blackHole = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(blackHole);

// Subtle glow rim behind the black hole
const glowGeometry = new THREE.SphereGeometry(10.5, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffaa00, 
    transparent: true, 
    opacity: 0.15,
    blending: THREE.AdditiveBlending 
});
const blackHoleGlow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(blackHoleGlow);

// 2. Accretion Disk (Particles)
// We'll create multiple rings of particles for depth and color variation
const isMobile = window.innerWidth <= 768;
const diskParticleCount = isMobile ? 8000 : 25000;

const diskGeometry = new THREE.BufferGeometry();
const diskPositions = new Float32Array(diskParticleCount * 3);
const diskColors = new Float32Array(diskParticleCount * 3);
const diskSizes = new Float32Array(diskParticleCount);
const diskAngles = new Float32Array(diskParticleCount); // Store initial angle for orbit animation

const colorInner = new THREE.Color(0xffffff); // Superhot white/yellow
const colorMid = new THREE.Color(0xffa500);   // Plasma orange
const colorOuter = new THREE.Color(0x8b0000); // Dark red / cooling
const tempColor = new THREE.Color();

for (let i = 0; i < diskParticleCount; i++) {
    const i3 = i * 3;
    
    // Distribution: clustered heavily near the radius, thinning out
    const radius = 12 + Math.pow(Math.random(), 2) * 35; // Disk from 12 to ~47 spread
    const angle = Math.random() * Math.PI * 2;
    // Slight vertical thickness to the disk, pinched at the inner edge
    const ySpread = (Math.random() - 0.5) * (radius / 5); 
    
    diskPositions[i3] = Math.cos(angle) * radius;
    diskPositions[i3 + 1] = ySpread;
    diskPositions[i3 + 2] = Math.sin(angle) * radius;
    
    diskAngles[i] = angle;
    
    // Color mapping based on radius
    const normalizedRadius = (radius - 12) / 35; // 0 to 1
    if (normalizedRadius < 0.3) {
        tempColor.lerpColors(colorInner, colorMid, normalizedRadius / 0.3);
    } else {
        tempColor.lerpColors(colorMid, colorOuter, (normalizedRadius - 0.3) / 0.7);
    }
    
    diskColors[i3] = tempColor.r;
    diskColors[i3 + 1] = tempColor.g;
    diskColors[i3 + 2] = tempColor.b;
    
    // Slight size variations
    diskSizes[i] = Math.random() * 2.5;
}

diskGeometry.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
diskGeometry.setAttribute('color', new THREE.BufferAttribute(diskColors, 3));
diskGeometry.setAttribute('size', new THREE.BufferAttribute(diskSizes, 1));
// Save original radius and angle for physics
diskGeometry.setAttribute('angle', new THREE.BufferAttribute(diskAngles, 1));

// Custom Shader Material for glowing, colored points
const diskMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.3 : 0.15,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8,
    depthWrite: false // Crucial for nice blending, prevents dark box artifacts
});

const accretionDisk = new THREE.Points(diskGeometry, diskMaterial);
scene.add(accretionDisk);

// Orbit physics attributes
const positions = diskGeometry.attributes.position.array;
const initialAngles = diskGeometry.attributes.angle.array;

// 3. Starfield Background
const starCount = isMobile ? 500 : 1500;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for(let i=0; i<starCount * 3; i+=3) {
    // Large sphere of stars
    const r = 100 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i+1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i+2] = r * Math.cos(phi);
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.5 : 0.8,
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.6,
    depthWrite: false
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// --- Interactions & Animations ---

let time = 0;
let targetCameraZ = baseCameraZ;
let targetCameraY = 15;

// Scroll to Zoom Interaction
let targetUIOpacity = 1;

window.addEventListener('scroll', () => {
    // Calculate scroll percentage
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(window.scrollY / maxScroll, 1.0);
    
    // Intense zoom: Map scroll to pull camera inside the event horizon (r=10)
    // 60 -> 2 (inside the black hole), 15 -> 0
    targetCameraZ = baseCameraZ - (scrollPercent * 58); 
    targetCameraY = 15 - (scrollPercent * 15);
    
    // UI fades out as you enter the event horizon (last 20% of the page)
    if (scrollPercent > 0.8) {
        targetUIOpacity = 1 - ((scrollPercent - 0.8) / 0.2);
    } else {
        targetUIOpacity = 1;
    }
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Dynamic particle sizing on resize
    if(window.innerWidth <= 768) {
        diskMaterial.size = 0.3;
        starMaterial.size = 0.5;
    } else {
        diskMaterial.size = 0.15;
        starMaterial.size = 0.8;
    }
});

// Main Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    time += delta;
    
    // Smoothly interpolate camera position
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
    camera.position.y += (targetCameraY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Fade UI Elements based on scroll
    const uiElements = document.querySelectorAll('main, .navbar, .footer, .noise-overlay');
    uiElements.forEach(el => {
        // Only update if it exists & difference is noticeable to save layout thrashing
        const currentOpac = parseFloat(el.style.opacity || 1);
        if (Math.abs(currentOpac - targetUIOpacity) > 0.01) {
            el.style.opacity = currentOpac + (targetUIOpacity - currentOpac) * 0.1;
        }
    });

    // Subtle star rotation
    stars.rotation.y = time * 0.01;
    
    // Accretion disk rotation (inner rotates faster than outer)
    accretionDisk.rotation.y -= 0.005; 
    
    // Space distortion effect: as camera gets closer to z=10, the disk swirls faster
    const proximityMultiplier = Math.max(1, (baseCameraZ / Math.max(1, camera.position.z)) * 0.2);

    // Simulate vortex physics directly on geometry vertices
    for (let i = 0; i < diskParticleCount; i++) {
        const i3 = i * 3;
        // Re-calculate radius from existing coords (ignoring y)
        const x = positions[i3];
        const z = positions[i3 + 2];
        const r = Math.sqrt(x*x + z*z);
        
        // Orbital velocity: faster closer to the hole and faster as camera zooms in
        const speed = (0.5 / Math.sqrt(r)) * proximityMultiplier; 
        
        // Update angle
        initialAngles[i] += speed * delta * 50; 
        
        positions[i3] = Math.cos(initialAngles[i]) * r;
        positions[i3 + 2] = Math.sin(initialAngles[i]) * r;
        
        // Very subtle lensing/distortion: oscillate Y slightly over time
        positions[i3 + 1] += Math.sin(time * 2 + r) * 0.01;
    }
    
    diskGeometry.attributes.position.needsUpdate = true;
    
    // Pulsing core glow
    glowMaterial.opacity = 0.15 + Math.sin(time * 3) * 0.05;

    renderer.render(scene, camera);
}

// Start
animate();
