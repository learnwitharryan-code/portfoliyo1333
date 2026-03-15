// script.js - Advanced Premium Interactions for Rishi Singh Portfolio

document.addEventListener('DOMContentLoaded', () => {

    // --- Custom Cursor & LERP (Linear Interpolation) ---
    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Smoothly follow mouse with lerp
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        cursor.style.transform = `translate(${cursorX - 5}px, ${cursorY - 5}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // --- Magnetic Buttons & Elements ---
    const magnetics = document.querySelectorAll('.magnetic');
    
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const position = btn.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            // Move the button slightly toward mouse
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            
            // Expand cursor on hover
            cursor.classList.add('active');
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            cursor.classList.remove('active');
        });
    });

    // --- Work Item Cursor Expansion ---
    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach(item => {
        item.addEventListener('mouseenter', () => cursor.classList.add('active'));
        item.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });


    // --- Preloader & Hero Entry ---
    const preloader = document.getElementById('preloader');
    const hero = document.getElementById('hero');

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
            // Activate hero after preloader slides up
            setTimeout(() => {
                hero.classList.add('active');
            }, 600);
        }, 1200);
    });

    // --- Intersection Observer (Scroll Reveal) ---
    const observerOptions = {
        threshold: 0.2
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // For Skills, trigger width animation
                if (entry.target.id === 'skills') {
                    // Logic handled by CSS if needed or here
                }
            }
        });
    }, observerOptions);

    // Apply observer to paragraphs and sections
    document.querySelectorAll('.reveal-p').forEach(p => sectionObserver.observe(p));
    document.querySelectorAll('.section').forEach(section => sectionObserver.observe(section));


    // --- Work Grid Magnetic Hover ---
    const workGridItems = document.querySelectorAll('.magnetic-wrap');
    workGridItems.forEach(wrapper => {
        const content = wrapper.querySelector('.magnetic-content');
        
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            content.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.02)`;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            content.style.transform = 'translate(0, 0) scale(1)';
        });
    });

});
