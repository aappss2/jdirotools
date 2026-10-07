// Presentation App JavaScript - Fixed Version
class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 25;
        this.slides = document.querySelectorAll('.slide');
        this.init();
    }

    init() {
        this.generateSlideNumbers();
        this.updateSlideDisplay();
        this.setupEventListeners();
        this.updateNavigation();
    }

    generateSlideNumbers() {
        const slideNumbersContainer = document.getElementById('slide-numbers');
        if (!slideNumbersContainer) return;
        
        slideNumbersContainer.innerHTML = '';

        for (let i = 1; i <= this.totalSlides; i++) {
            const slideNumber = document.createElement('div');
            slideNumber.className = 'slide-number';
            slideNumber.textContent = i;
            slideNumber.setAttribute('data-slide', i);
            
            // Use proper event binding
            slideNumber.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToSlide(i);
            };
            
            if (i === this.currentSlide) {
                slideNumber.classList.add('active');
            }
            
            slideNumbersContainer.appendChild(slideNumber);
        }
    }

    setupEventListeners() {
        // Previous button
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.previousSlide();
            };
        }
        
        // Next button  
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
            };
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
            }
        });
    }

    updateSlideDisplay() {
        // Update slide counter
        const currentSlideEl = document.getElementById('current-slide');
        const totalSlidesEl = document.getElementById('total-slides');
        
        if (currentSlideEl) currentSlideEl.textContent = this.currentSlide;
        if (totalSlidesEl) totalSlidesEl.textContent = this.totalSlides;

        // Update slide visibility
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            
            slide.classList.remove('active', 'prev');
            
            if (slideNumber === this.currentSlide) {
                slide.classList.add('active');
            } else if (slideNumber < this.currentSlide) {
                slide.classList.add('prev');
            }
        });

        // Update slide number indicators
        const slideNumbers = document.querySelectorAll('.slide-number');
        slideNumbers.forEach((number, index) => {
            number.classList.remove('active');
            if (index + 1 === this.currentSlide) {
                number.classList.add('active');
            }
        });
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 1;
            prevBtn.textContent = this.currentSlide === 1 ? '← Start' : '← Previous';
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides;
            nextBtn.textContent = this.currentSlide === this.totalSlides ? 'Finish ✓' : 'Next →';
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides && slideNumber !== this.currentSlide) {
            this.currentSlide = slideNumber;
            this.updateSlideDisplay();
            this.updateNavigation();
            
            // Scroll to top of slide
            const slidesContainer = document.querySelector('.slides-container');
            if (slidesContainer) {
                slidesContainer.scrollTop = 0;
            }

            // Add slide change animation feedback
            this.addSlideChangeEffect();
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    addSlideChangeEffect() {
        // Add subtle visual feedback for slide changes
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            currentSlideElement.style.transition = 'transform 0.15s ease-out';
            currentSlideElement.style.transform = 'scale(0.98)';
            setTimeout(() => {
                currentSlideElement.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // Method to get current slide info
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides
        };
    }
}

// Answer reveal functionality - Fixed
function revealAnswer(answerId) {
    const answerElement = document.getElementById(answerId);
    if (!answerElement) return;
    
    // Find the button that was clicked
    const clickedButton = event.target;
    
    if (answerElement.classList.contains('hidden')) {
        // Reveal the answer with animation
        answerElement.classList.remove('hidden');
        answerElement.style.opacity = '0';
        answerElement.style.transform = 'translateY(-10px)';
        
        // Animate in
        setTimeout(() => {
            answerElement.style.transition = 'all 0.3s ease-out';
            answerElement.style.opacity = '1';
            answerElement.style.transform = 'translateY(0)';
        }, 10);
        
        // Update button
        if (clickedButton) {
            clickedButton.textContent = 'Answer Revealed ✓';
            clickedButton.disabled = true;
            clickedButton.style.opacity = '0.6';
        }
        
        // Add success effect
        answerElement.style.animation = 'slideInUp 0.5s ease-out';
        
    } else {
        // Hide the answer
        answerElement.classList.add('hidden');
        if (clickedButton) {
            clickedButton.textContent = 'Show Answer';
            clickedButton.disabled = false;
            clickedButton.style.opacity = '1';
        }
    }
}

// Make revealAnswer globally accessible
window.revealAnswer = revealAnswer;

// Additional interactive functionality
class InteractiveFeatures {
    constructor() {
        this.setupHoverEffects();
        this.setupClickEffects();
        this.setupRevealButtons();
    }

    setupHoverEffects() {
        // Add hover effects to example sentences
        const examples = document.querySelectorAll('.active-example, .passive-example');
        examples.forEach(example => {
            example.addEventListener('mouseenter', () => {
                example.style.transform = 'translateY(-2px)';
                example.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                example.style.transition = 'all 0.2s ease-out';
            });
            
            example.addEventListener('mouseleave', () => {
                example.style.transform = 'translateY(0)';
                example.style.boxShadow = '';
            });
        });
    }

    setupClickEffects() {
        // Add click effects to interactive elements
        const buttons = document.querySelectorAll('.reveal-btn, .nav-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    setupRevealButtons() {
        // Setup reveal buttons with proper event handlers
        const revealButtons = document.querySelectorAll('.reveal-btn');
        revealButtons.forEach(button => {
            // Remove any existing onclick handlers
            button.removeAttribute('onclick');
            
            // Add proper event listener
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Find the answer ID from onclick attribute or data attribute
                const onclickAttr = button.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/revealAnswer\('([^']+)'\)/);
                    if (match) {
                        const answerId = match[1];
                        revealAnswer(answerId);
                    }
                }
            });
        });
    }
}

// Animation helpers
function addSlideAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .key-term {
            background-color: var(--color-bg-2);
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 500;
        }
        
        .slide.active .slide-content {
            animation: fadeIn 0.5s ease-out;
        }
        
        .reveal-btn:disabled {
            animation: pulse 1s ease-in-out;
        }
        
        /* Fix for button interactions */
        .reveal-btn, .nav-btn, .slide-number {
            user-select: none;
            cursor: pointer;
        }
        
        .reveal-btn:disabled {
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
}

// Accessibility enhancements
function setupAccessibility() {
    // Add ARIA labels for screen readers
    const slideElements = document.querySelectorAll('.slide');
    slideElements.forEach((slide, index) => {
        slide.setAttribute('aria-label', `Slide ${index + 1} of 25`);
        slide.setAttribute('role', 'img');
    });

    // Add keyboard navigation hints
    const navHelp = document.createElement('div');
    navHelp.className = 'sr-only';
    navHelp.textContent = 'Use arrow keys or space bar to navigate slides. Press Home for first slide, End for last slide.';
    document.body.appendChild(navHelp);
}

// Fullscreen functionality
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// URL Manager for slide bookmarking
class URLManager {
    constructor(presentationApp) {
        this.app = presentationApp;
        this.setupHashNavigation();
    }

    setupHashNavigation() {
        // Check for initial hash
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide-')) {
            const slideNumber = parseInt(hash.replace('#slide-', ''));
            if (slideNumber >= 1 && slideNumber <= 25) {
                setTimeout(() => {
                    this.app.goToSlide(slideNumber);
                }, 100);
            }
        }

        // Update hash when slide changes
        const originalGoToSlide = this.app.goToSlide.bind(this.app);
        this.app.goToSlide = (slideNumber) => {
            originalGoToSlide(slideNumber);
            history.replaceState(null, null, `#slide-${slideNumber}`);
        };

        // Handle browser back/forward
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#slide-')) {
                const slideNumber = parseInt(hash.replace('#slide-', ''));
                if (slideNumber >= 1 && slideNumber <= 25) {
                    originalGoToSlide(slideNumber);
                }
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Active & Passive Voice Presentation...');
    
    // Initialize main presentation app
    window.presentationApp = new PresentationApp();
    
    // Initialize interactive features
    window.interactiveFeatures = new InteractiveFeatures();
    
    // Initialize URL management
    setTimeout(() => {
        window.urlManager = new URLManager(window.presentationApp);
    }, 100);
    
    // Setup additional features
    addSlideAnimations();
    setupAccessibility();
    
    // Add fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '⛶';
    fullscreenBtn.title = 'Toggle Fullscreen (F11 also works)';
    fullscreenBtn.className = 'btn btn--secondary';
    fullscreenBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1000;
        padding: 8px 12px;
        font-size: 16px;
    `;
    fullscreenBtn.onclick = toggleFullscreen;
    document.body.appendChild(fullscreenBtn);
    
    console.log('Presentation loaded successfully!');
    console.log('Navigation: Use arrow keys, space bar, or click buttons');
    console.log('Shortcuts: Home = first slide, End = last slide');
});

// Handle F11 fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Global function exports
window.nextSlide = () => window.presentationApp?.nextSlide();
window.previousSlide = () => window.presentationApp?.previousSlide();
window.goToSlide = (n) => window.presentationApp?.goToSlide(n);