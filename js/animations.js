
const PARTICLE_CONFIG = {
    count: 80,
    colors: ['#D93535', '#E59389', '#6B9BD1', '#A78BFA', '#F59E0B'],
    sizes: [2, 3, 4, 5],
    icons: ['◯', '◇', '✦', '⬢', '▲'],
    speed: { min: 20, max: 150 }
};

// ===========================================

//  GSAP  registere
if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    if (typeof MotionPathPlugin !== 'undefined') {
        gsap.registerPlugin(MotionPathPlugin);
    }
}
// INTRO LOADER ANIMATION
// ===========================================
function createIntroLoader() {
    document.body.classList.add('intro-active');

    const mainContent = document.getElementById('main-content');
    const navigation = document.getElementById('main-navigation');
    const footer = document.querySelector('footer');

    [mainContent, navigation, footer].forEach(el => {
        if (el) {
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
        }
    });

    const loaderOverlay = document.createElement('div');
    loaderOverlay.className = 'intro-loader';
    loaderOverlay.innerHTML = `
        <div class="loader-content">
            <div class="logo-container">
                <img src="assets/logo.svg" alt="FlowState Logo" class="loader-logo">
            </div>
        </div>
    `;

    document.body.prepend(loaderOverlay);
    return loaderOverlay;
}

function animateIntro() {
    const loader = createIntroLoader();
    const logo = document.querySelector('.loader-logo');

    setTimeout(() => {
        const tl = gsap.timeline();

        tl.set(logo, {
            scale: 0.3,
            opacity: 0,
            rotation: -180
        })
        .to(logo, {
            duration: 1.2,
            scale: 1,
            opacity: 1,
            rotation: 0,
            ease: "elastic.out(1, 0.5)"
        })
        .to(logo, {
            duration: 0.8,
            scale: 1.05,
            ease: "power1.inOut",
            yoyo: true,
            repeat: 1
        })
        .to(logo, {
            duration: 1.5,
            scale: 8,
            opacity: 0,
            rotation: 180,
            ease: "power2.in"
        })
        .to('.intro-loader', {
            duration: 0.5,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                loader.remove();
                document.body.classList.remove('intro-active');

                const mainContent = document.getElementById('main-content');
                const navigation = document.getElementById('main-navigation');
                const footer = document.querySelector('footer');

                [mainContent, navigation, footer].forEach(el => {
                    if (el) el.style.visibility = 'visible';
                });

                gsap.to(['#main-navigation', '#main-content', 'footer'], {
                    duration: 0.8,
                    opacity: 1,
                    ease: "power2.out"
                });

                initAllAnimations();
            }
        });
    }, 50);
}

// ===========================================
//  PARTICLE SYSTEM
// ===========================================
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
       
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // mouse tracking for interactive particles
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

    
        this.createParticles();
        this.animate();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    createParticles() {
        for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: PARTICLE_CONFIG.sizes[Math.floor(Math.random() * PARTICLE_CONFIG.sizes.length)],
                color: PARTICLE_CONFIG.colors[Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)],
                icon: PARTICLE_CONFIG.icons[Math.floor(Math.random() * PARTICLE_CONFIG.icons.length)],
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulsePhase: Math.random() * Math.PI * 2,
                orbitRadius: Math.random() * 100 + 50,
                orbitSpeed: (Math.random() - 0.5) * 0.02,
                orbitAngle: Math.random() * Math.PI * 2,
                useOrbit: Math.random() > 0.7
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

       
        this.particles.forEach(particle => {
            
            particle.pulsePhase += particle.pulseSpeed;
            const pulseScale = 1 + Math.sin(particle.pulsePhase) * 0.3;

            
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;

            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                particle.x -= (dx / distance) * force * 2;
                particle.y -= (dy / distance) * force * 2;
            }

            // movement
            if (particle.useOrbit) {
                particle.orbitAngle += particle.orbitSpeed;
                particle.x += Math.cos(particle.orbitAngle) * 0.5;
                particle.y += Math.sin(particle.orbitAngle) * 0.5;
            } else {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
            }


            if (particle.x < -50) particle.x = this.canvas.width + 50;
            if (particle.x > this.canvas.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = this.canvas.height + 50;
            if (particle.y > this.canvas.height + 50) particle.y = -50;

           
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.font = `${particle.size * pulseScale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(particle.icon, particle.x, particle.y);

           
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = particle.color;
            this.ctx.restore();

           
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.save();
                    this.ctx.globalAlpha = (1 - distance / 100) * 0.2;
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            });
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// ===========================================
// GSAP TIMELINE ANIMATIONS
// ===========================================
function initHeroAnimation() {
    const heroTitle = document.querySelector('.hero__title');
    const heroSubtitle = document.querySelector('.hero__subtitle');
    const heroCta = document.querySelector('.hero__cta');
    const scrollIndicator = document.querySelector('.hero__scroll-indicator');

    if (!heroTitle) return;

    const tl = gsap.timeline({ delay: 0.3 });

    // animated title 
    const titleLines = heroTitle.querySelectorAll('.hero__title-line, .hero__title-accent');
    tl.from(titleLines, {
        duration: 1.2,
        y: 100,
        opacity: 0,
        rotationX: -90,
        transformOrigin: 'top center',
        stagger: 0.2,
        ease: "power4.out"
    })
    .from(heroSubtitle, {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: "power3.out"
    }, "-=0.4");
    
    // Animate CTA separately with proper visibility
    if (heroCta) {
        gsap.fromTo(heroCta, {
            scale: 0,
            opacity: 0,
            rotation: 180
        }, {
            duration: 1,
            scale: 1,
            opacity: 1,
            rotation: 0,
            ease: "elastic.out(1, 0.5)",
            delay: 1.5
        });
  
    // gsap.to(heroCta, {
    //     y: -10,
    //     duration: 2,
    //     ease: "sine.inOut",
    //     yoyo: true,
    //     repeat: -1,
    //     delay: 2.5
    // });
    }
    
    // scroll indicator animation
    if (scrollIndicator) {
        tl.from(scrollIndicator, {
            duration: 0.8,
            y: -20,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");
    }

    // Continuous scroll indicator animation fallback (MotionPath handled in initSVGAnimations)
    if (typeof MotionPathPlugin === 'undefined') {
        gsap.to('.hero__scroll-arrow', {
            y: 5,
            duration: 1,
            ease: "power1.inOut",
            yoyo: true,
            repeat: -1
        });
    }
}

// ===========================================
// SCROLLTRIGGER ANIMATIONS
// ===========================================
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // about section cards
    gsap.utils.toArray('.feature').forEach((feature, index) => {
        gsap.from(feature, {
            scrollTrigger: {
                trigger: feature,
                start: 'top 85%',
                end: 'top 60%',
                scrub: 1,
                toggleActions: 'play none none reverse'
            },
            x: index % 2 === 0 ? -100 : 100,
            opacity: 0,
            rotation: index % 2 === 0 ? -5 : 5,
            scale: 0.8,
            ease: "power3.out"
        });
    });

    // mood hub cards w 3D effect
    gsap.utils.toArray('.hub-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'top 40%',
                scrub: 2,
                toggleActions: 'play none none reverse'
            },
            y: 100,
            opacity: 0,
            rotationY: 90,
            transformOrigin: 'center center',
            scale: 0.7,
            ease: "power2.out",
            delay: index * 0.1
        });

        // parallax effect on scroll -- doent worl my god
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 3
            },
            y: -50,
            ease: "none"
        });
    });

    
    // about section title
    const aboutTitle = document.querySelector('.about__title');
    if (aboutTitle) {
        gsap.from(aboutTitle, {
            scrollTrigger: {
                trigger: aboutTitle,
                start: 'top 80%',
                end: 'top 50%',
                scrub: 1
            },
            scale: 0.5,
            opacity: 0,
            rotationX: -90,
            transformOrigin: 'center center',
            ease: "power3.out"
        });
    }
}


// ===========================================
// SVG & MOTIONPATH ANIMATIONS
// ===========================================
function initSVGAnimations() {
    //  scroll indicator arrow anima
    const scrollArrow = document.querySelector('.hero__scroll-arrow');
    if (scrollArrow && typeof gsap !== 'undefined' && typeof MotionPathPlugin !== 'undefined') {
        gsap.to(scrollArrow, {
            duration: 2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            motionPath: {
                path: [
                    { x: 0, y: 0 },
                    { x: 3, y: 6 },
                    { x: 0, y: 12 },
                    { x: -3, y: 6 },
                    { x: 0, y: 0 }
                ],
                autoRotate: false
            }
        });
    }

    
    document.querySelectorAll('.hub-card').forEach(card => {
        const arrow = card.querySelector('.hub-card__arrow');
        if (arrow) {
            card.addEventListener('mouseenter', () => {
                gsap.to(arrow, {
                    x: 5,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(arrow, {
                    x: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        }
    });
}

// ===========================================
//  3D TRANSFORM ANIMATIONS
// ===========================================

function initAdvanced3DAnimations() {
    // Content cards 3on hover
    document.querySelectorAll('.hub-card, .feature').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                z: 50,
                scale: 1.05,
                duration: 0.4,
                ease: "power2.out",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                z: 0,
                scale: 1,
                duration: 0.4,
                ease: "power2.out",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            });
        });
    });
}

// ===========================================
// TEXT REVEAL ANIMATION 
// ===========================================
function initTextRevealAnimations() {
    const textElements = document.querySelectorAll('.about__intro, .hub-hero__description');
    
    textElements.forEach(element => {

        // skipp if already processed
        if (element.dataset.animated === 'true') return;
        
        const text = element.textContent.trim();
        element.innerHTML = ''; 
        
        const words = text.split(' ');
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.marginRight = '0.25em'; //  space between word
            element.appendChild(span);
            
            // space node after each word except the last
            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });

        // boool to true if as animated
        element.dataset.animated = 'true';

        gsap.fromTo(element.querySelectorAll('span'), 
            {
                opacity: 0,
                y: 20
            },
            {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    end: 'top 60%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.03,
                ease: "power2.out"
            }
        );
    });
}

// ===========================================
// INITIALIZE ALL ANIMATIONS
// ===========================================
function initAllAnimations() {

    // initt particle system on hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        new ParticleSystem(heroSection);
    }

    
    const hubHero = document.querySelector('.hub-hero');
    const isWatchlist = document.querySelector('.watchlist');
    if (hubHero && !isWatchlist) {
        new ParticleSystem(hubHero);
    }

    // init  gSap animations
    initHeroAnimation();
    initScrollAnimations();
    initSVGAnimations();
    initAdvanced3DAnimations();
    initTextRevealAnimations();

    
    if (document.querySelector('.watchlist')) {
        if (window.WatchlistAnimations && typeof window.WatchlistAnimations.init === 'function') {
            window.WatchlistAnimations.init();
        }
    }

    //  scroll  
    document.querySelectorAll('a[href^="#"]:not(.nav-link)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return; 
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

          
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

           
            const nav = document.querySelector('nav');
            const navHeight = nav ? nav.offsetHeight : 0;
            const targetY = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;

            if (!prefersReduced && typeof gsap !== 'undefined' && gsap.to && typeof ScrollToPlugin !== 'undefined') {
                gsap.to(window, {
                    duration: 0.75,
                    scrollTo: { y: targetY, autoKill: true },
                    ease: 'power2.out'
                });
            } else {
               
                try {
                    window.scrollTo({ top: targetY, behavior: prefersReduced ? 'auto' : 'smooth' });
                } catch (err) {
                   
                    window.scroll(0, targetY);
                }
            }
        });
    });
}

// ===========================================
// INITIALIZATION
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
 
    const INTRO_FLAG = 'introPlayed';

    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded.... GSAP library ???! argh');
        return;
    }

    // check if we're on the homepage  index
    const isHomepage = location.pathname === '/' || 
                       location.pathname === '/index.html' || 
                       location.pathname.endsWith('/FlowState/') ||
                       location.pathname.endsWith('/FlowState/index.html');

    if (!isHomepage || sessionStorage.getItem(INTRO_FLAG)) {

        
        initAllAnimations();
    } else {
        animateIntro();
        try { sessionStorage.setItem(INTRO_FLAG, '1'); } catch (e) {  }
    }
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ParticleSystem,
        initAllAnimations
    };
}

// ===========================================
// WATCHLIST PAGE ANIMATI
// ===========================================
(function(){
    if (typeof window === 'undefined' || typeof gsap === 'undefined') return;

    const WatchlistAnimations = {
        init(){
            const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
            const hero = document.querySelector('.watchlist-hero__content');
            const stats = document.querySelectorAll('.watchlist-hero__stat');
            const filters = document.querySelectorAll('.wl-filter');

            if (hero){
                tl.from(hero.querySelector('.watchlist-hero__title'), { y: 20, opacity: 0, duration: 0.5 })
                  .from(hero.querySelector('.watchlist-hero__subtitle'), { y: 16, opacity: 0, duration: 0.4 }, '-=0.25')
                  .from(stats, { y: 10, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');
            }

            if (filters.length){
                tl.from(filters, { y: 12, opacity: 0, duration: 0.4, stagger: 0.06 }, '-=0.2');
            }
            const moodChips = document.querySelectorAll('.wl-mood-chip');
            if (moodChips.length){
                tl.from(moodChips, { y: 14, opacity: 0, duration: 0.35, stagger: 0.05 }, '-=0.15');
            }
        },

        animateGridIn(grid){
            const cards = grid.querySelectorAll('.wl-card');
            gsap.set(cards, { opacity: 0, y: 16 });
            gsap.to(cards, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out', onComplete: () => {
                
                const badges = grid.querySelectorAll('.wl-card__mood-badge');
                if (badges.length) {
                    gsap.fromTo(badges, { scale: 0.4, opacity: 0 }, { scale:1, opacity:1, duration:0.4, stagger:0.05, ease:'back.out(1.7)' });
                }
            }});
        },

        animateEmpty(empty){
            gsap.fromTo(empty, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 });
        },

        animateCardRemove(card, onDone){
            gsap.to(card, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => {
                card.remove();
                if (typeof onDone === 'function') onDone();
            }});
        },

        attachCardHover(card){
            card.addEventListener('mouseenter', () => gsap.to(card, { y: -6, duration: 0.2 }));
            card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, duration: 0.2 }));
            const badge = card.querySelector('.wl-card__mood-badge');
            if (badge) {
                card.addEventListener('mouseenter', () => gsap.to(badge, { scale:1.08, duration:0.25, ease:'power2.out', boxShadow:'0 0 0 3px rgba(255,255,255,0.15)' }));
                card.addEventListener('mouseleave', () => gsap.to(badge, { scale:1, duration:0.25, ease:'power2.inOut', boxShadow:'none' }));
            }
        }
    };

    window.WatchlistAnimations = WatchlistAnimations;
})();