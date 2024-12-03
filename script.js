document.addEventListener('DOMContentLoaded', () => {
    const doorSound = document.getElementById('doorSound');
    const startButton = document.getElementById('startButton');
    const closeButton = document.getElementById('closeButton');
    
    const playDoorSound = () => {
        doorSound.currentTime = 0;
        doorSound.play();
        setTimeout(() => {
            doorSound.pause();
            doorSound.currentTime = 0;
        }, 2000);
    };

    const startAnimation = () => {
        startButton.classList.add('hidden');
        
        const tl = gsap.timeline();
        
        tl.to({}, { duration: 0.5 })
        .call(() => {
            playDoorSound();
        })
        .to('.door-left', {
            duration: 2,
            scaleX: 0,
            ease: 'power2.inOut'
        }, 0.5)
        .to('.door-right', {
            duration: 2,
            scaleX: 0,
            ease: 'power2.inOut'
        }, 0.5)
        .to('.hello-text', {
            duration: 1.5,
            opacity: 1,
            y: 0,
            ease: 'power4.out'
        }, '-=0.5')
        .to('.close-button', {
            duration: 1,
            opacity: 1,
            y: 0,
            ease: 'power2.out'
        }, '-=1');
    };

    const closeAnimation = () => {
        const tl = gsap.timeline();
        
        tl.to('.close-button', {
            duration: 0.5,
            opacity: 0,
            y: 20,
            ease: 'power2.in'
        })
        .to('.hello-text', {
            duration: 1,
            opacity: 0,
            y: 100,
            ease: 'power2.in'
        }, '-=0.3')
        .call(() => {
            playDoorSound();
        })
        .to('.door-left', {
            duration: 2,
            scaleX: 1,
            ease: 'power2.inOut'
        })
        .to('.door-right', {
            duration: 2,
            scaleX: 1,
            ease: 'power2.inOut'
        }, '<')
        .to('.start-button', {
            duration: 1,
            opacity: 1,
            onComplete: () => {
                startButton.classList.remove('hidden');
            }
        });
    };

    startButton.addEventListener('click', startAnimation);
    closeButton.addEventListener('click', closeAnimation);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            doorSound.pause();
        }
    });
}); 