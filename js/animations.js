function createIntroLoader() {
    document.body.classList.add('intro-active');

    // hide main content at first
    const mainContent = document.getElementById('main-content');
    const navigation = document.getElementById('main-navigation');
    const footer = document.querySelector('footer');

    if (mainContent) {
        mainContent.style.visibility = 'hidden';
        mainContent.style.opacity = '0';
    }
    if (navigation) {
        navigation.style.visibility = 'hidden';
        navigation.style.opacity = '0';
    }
    if (footer) {
        footer.style.visibility = 'hidden';
        footer.style.opacity = '0';
    }

    // loader structure
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

        // initial state - logo small and centered
        tl.set(logo, {
            scale: 0.3,
            opacity: 0
        })

        // fade in and scale up to normal size
        .to(logo, {
            duration: 1.2,
            scale: 1,
            opacity: 1,
            ease: "power2.out"
        })

        // hold briefly
        .to(logo, {
            duration: 0.8,
            scale: 1,
            ease: "power1.inOut"
        })

        // zoom in and fade out
        .to(logo, {
            duration: 1.5,
            scale: 8,
            opacity: 0,
            ease: "power2.in"
        })

        // fade out loader
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

                if (mainContent) mainContent.style.visibility = 'visible';
                if (navigation) navigation.style.visibility = 'visible';
                if (footer) footer.style.visibility = 'visible';

                gsap.to(['#main-navigation', '#main-content', 'footer'], {
                    duration: 0.8,
                    opacity: 1,
                    ease: "power2.out"
                });
            }
        });
    }, 50);
}

document.addEventListener('DOMContentLoaded', function() {
    animateIntro();
});
