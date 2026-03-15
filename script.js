/**
 * Rishi Singh Portfolio - Premium Redesign Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader Logic ---
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 1000);
        }
    });

    // --- Custom Cursor ---
    const cursor = document.getElementById('custom-cursor');
    const links = document.querySelectorAll('a, button, .project-card, .skill-row');

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        // Smother following
        cursor.animate({
            left: `${x}px`,
            top: `${y}px`
        }, { duration: 400, fill: "forwards" });
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
    });

    // --- Intersection Observer for Reveals ---
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // Once visible, we can unobserve if we only want it once
                // observer.unobserve(entry.target); 
            }
        });
    }, revealOptions);

    document.querySelectorAll('.fade-in-section, .title-mask').forEach(item => {
        revealOnScroll.observe(item);
    });

    // --- Magnetic Effect for Links ---
    const magneticLinks = document.querySelectorAll('.magnetic-link, .nav-links a');

    magneticLinks.forEach(link => {
        link.addEventListener('mousemove', function(e) {
            const pos = this.getBoundingClientRect();
            const x = e.pageX - pos.left - window.scrollX;
            const y = e.pageY - pos.top - window.scrollY;
            
            this.style.transform = `translate(${(x - pos.width / 2) * 0.3}px, ${(y - pos.height / 2) * 0.3}px)`;
        });

        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                window.scrollTo({
                    top: target.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

});
