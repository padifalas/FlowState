// notes 
// ===========================
// Lightweight visuals: particle canvas + floating shapes
// - Responsive to pointer movement
// - Reacts to timer state via .timer-widget[data-state]
// - Respects prefers-reduced-motion

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return; // do nothing if user prefers reduced motion

    // helpers
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* ---------- part System ---------- */
    class Particles {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = 0; this.height = 0;
            this.particles = [];
            this.pointer = { x: -9999, y: -9999, vx: 0, vy: 0 };
            this.tick = this.tick.bind(this);
            this.lastTime = performance.now();
            this.max = 120; // conservative limit
            this.devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
            this.resize();
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('pointermove', (e) => this.onPointer(e));
            this.running = true;
            requestAnimationFrame(this.tick);
        }

        resize() {
            this.width = this.canvas.clientWidth;
            this.height = this.canvas.clientHeight;
            this.canvas.width = Math.floor(this.width * this.devicePixelRatio);
            this.canvas.height = Math.floor(this.height * this.devicePixelRatio);
            this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
        }

        onPointer(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const vx = (x - this.pointer.x) || 0;
            const vy = (y - this.pointer.y) || 0;
            this.pointer = { x, y, vx, vy };

            // spawn a few particles near pointer
            for (let i = 0; i < 3; i++) this.spawn(x + (Math.random()-0.5)*20, y + (Math.random()-0.5)*20);
        }

        spawn(x, y) {
            if (this.particles.length >= this.max) return;
            const life = 800 + Math.random() * 1200; // ms
            const size = 1 + Math.random()*3;
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.15 + Math.random() * 0.6;
            const hue = 200 + (Math.random()*60 - 20);
            this.particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life, age: 0, size, hue });
        }

        tick(now) {
            if (!this.running) return;
            const dt = now - this.lastTime;
            this.lastTime = now;
            this.ctx.clearRect(0,0,this.width,this.height);

            // occasional ambient spawn
            if (Math.random() < 0.06 && this.particles.length < this.max) {
                this.spawn(Math.random()*this.width, Math.random()*this.height);
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.age += dt;
                if (p.age >= p.life) { this.particles.splice(i,1); continue; }
                // simple attraction to pointer
                const dx = this.pointer.x - p.x;
                const dy = this.pointer.y - p.y;
                const d2 = dx*dx + dy*dy;
                if (d2 < 25000) { // within 150px
                    p.vx += (dx/50000) * (1 + (this.pointer.vx||0));
                    p.vy += (dy/50000) * (1 + (this.pointer.vy||0));
                }
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                const alpha = 1 - (p.age / p.life);
                this.ctx.beginPath();
                this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${0.12 * alpha})`;
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                this.ctx.fill();
            }

            requestAnimationFrame(this.tick);
        }

        stop() { this.running = false; }
    }

    /* ---------- Floating Shapes ---------- */
    class FloatingShapes {
        constructor(container) {
            this.container = container;
            this.shapes = [];
            this.count = 6;
            this.init();
        }

        init() {
            for (let i=0;i<this.count;i++){
                const el = document.createElement('div');
                el.className = 'floating-shape shape--' + ['circle','triangle','diamond'][i%3];
                const size = 36 + Math.floor(Math.random()*120);
                el.style.setProperty('--size', size+'px');
                el.style.left = Math.floor(Math.random()*90) + '%';
                el.style.top = Math.floor(Math.random()*85) + '%';
                el.style.opacity = 0.06 + Math.random()*0.6;
                el.style.transform = `translate3d(0,0,${(i%4)*6}px) rotate(${Math.random()*40-20}deg)`;
                // color tint via background blend
                if (i%3 === 0) el.style.background = 'linear-gradient(135deg, rgba(217,53,53,0.10), rgba(217,53,53,0.02))';
                if (i%3 === 1) el.style.background = 'linear-gradient(135deg, rgba(229,147,137,0.08), rgba(229,147,137,0.02))';
                if (i%3 === 2) el.style.background = 'linear-gradient(135deg, rgba(123,143,163,0.06), rgba(123,143,163,0.01))';
                this.container.appendChild(el);
                this.shapes.push({ el, baseY: parseFloat(el.style.top), speed: 0.3 + Math.random()*0.7, phase: Math.random()*Math.PI*2 });
            }
            this.raf = requestAnimationFrame(this.frame.bind(this));
        }

        frame(t){
            for (const s of this.shapes){
                const y = s.baseY + Math.sin((t/1000)*s.speed + s.phase) * 4; // small vertical float
                s.el.style.top = `${y}%`;
                const rz = Math.sin((t/1000)*0.3 + s.phase) * 6;
                s.el.style.transform = `translate3d(0,0,0) rotate(${rz}deg)`;
            }
            this.raf = requestAnimationFrame(this.frame.bind(this));
        }

        destroy(){ cancelAnimationFrame(this.raf); this.shapes.forEach(s=>s.el.remove()); }
    }

    /* ---------- Initialization ---------- */
    function initVisuals(){
        const root = document.getElementById('visuals-root');
        if (!root) return;

        const canvas = document.getElementById('visual-canvas');
        const shapesRoot = document.getElementById('floating-shapes');

        const particles = new Particles(canvas);
        const shapes = new FloatingShapes(shapesRoot);

        // react to timer state changes
        const timer = document.querySelector('.timer-widget');
        function applyTimerState() {
            if (!timer) return;
            const state = timer.getAttribute('data-state');
            // adjust particle spawn rate/opacity via CSS variables or classes
            if (state === 'running') {
                canvas.style.opacity = 1;
            } else if (state === 'paused') {
                canvas.style.opacity = 0.6;
            } else if (state === 'break') {
                canvas.style.opacity = 0.5;
            }
        }

        if (timer) {
            // observe attribute changes
            const mo = new MutationObserver(applyTimerState);
            mo.observe(timer, { attributes: true, attributeFilter: ['data-state'] });
            applyTimerState();
        }

        // stop visuals on page hide to save CPU
        document.addEventListener('visibilitychange', ()=>{
            if (document.hidden) particles.stop();
            else requestAnimationFrame(particles.tick.bind(particles));
        });
    }

    // wait for DOMContentLoaded if necessary
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVisuals);
    } else {
        initVisuals();
    }
})();
