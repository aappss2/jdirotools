// Presentation JavaScript - Navigation Fix
let presentation = null;

class TensePresentation {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 26;
        this.slides = document.querySelectorAll('.slide');
        this.progressBar = document.getElementById('progress-bar');
        this.slideCounter = document.getElementById('current-slide');
        this.isFullscreen = false;
        
        this.init();
    }
    
    init() {
        // Ensure first slide is visible
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            if (index === 0) {
                slide.classList.add('active');
            }
        });
        
        this.updateDisplay();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        
        console.log('Presentation initialized with', this.totalSlides, 'slides');
    }
    
    // Navigation methods
    nextSlide() {
        console.log('Next slide called, current:', this.currentSlide, 'going to:', this.currentSlide + 1);
        if (this.currentSlide < this.totalSlides - 1) {
            const nextSlideIndex = this.currentSlide + 1;
            this.goToSlide(nextSlideIndex);
        } else {
            console.log('Already at last slide');
        }
    }
    
    previousSlide() {
        console.log('Previous slide called, current:', this.currentSlide, 'going to:', this.currentSlide - 1);
        if (this.currentSlide > 0) {
            const prevSlideIndex = this.currentSlide - 1;
            this.goToSlide(prevSlideIndex);
        } else {
            console.log('Already at first slide');
        }
    }
    
    goToSlide(slideIndex) {
        console.log('goToSlide called with index:', slideIndex, 'current:', this.currentSlide);
        
        if (slideIndex < 0 || slideIndex >= this.totalSlides) {
            console.log('Invalid slide index:', slideIndex);
            return;
        }
        
        // Remove active class from current slide
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.remove('active', 'prev');
        }
        
        // Update current slide index
        this.currentSlide = slideIndex;
        
        // Add active class to new slide
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.add('active');
        }
        
        this.updateDisplay();
        console.log('Successfully moved to slide:', this.currentSlide + 1);
    }
    
    updateDisplay() {
        // Update progress bar
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        if (this.progressBar) {
            this.progressBar.style.width = progress + '%';
        }
        
        // Update slide counter
        if (this.slideCounter) {
            this.slideCounter.textContent = this.currentSlide + 1;
        }
        
        // Update URL hash for bookmarking
        window.location.hash = `slide-${this.currentSlide + 1}`;
        
        console.log('Display updated - Slide:', this.currentSlide + 1, 'Progress:', Math.round(progress) + '%');
    }
    
    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
                case 'Escape':
                    if (this.isFullscreen) {
                        this.toggleFullscreen();
                    }
                    break;
                case 'f':
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        });
    }
    
    // Touch navigation for mobile
    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only trigger if horizontal swipe is greater than vertical
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        this.nextSlide();
                    } else {
                        this.previousSlide();
                    }
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    // Fullscreen functionality
    toggleFullscreen() {
        const container = document.querySelector('.presentation-container');
        
        if (!this.isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            container.classList.add('fullscreen');
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            container.classList.remove('fullscreen');
            this.isFullscreen = false;
        }
    }
    
    // Print summary functionality
    printSummary() {
        const summaryContent = this.generateSummaryContent();
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>English Tenses - Summary</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            line-height: 1.6;
                            color: #333;
                        }
                        .tense-summary { 
                            margin-bottom: 30px; 
                            page-break-inside: avoid; 
                            border: 1px solid #ddd;
                            padding: 15px;
                            border-radius: 8px;
                        }
                        .formula { 
                            font-weight: bold; 
                            color: #2563eb; 
                            background: #f0f9ff;
                            padding: 8px;
                            border-radius: 4px;
                            margin: 10px 0;
                        }
                        .examples { margin: 10px 0; }
                        .page-break { page-break-before: always; }
                        h1, h2, h3 { color: #1e40af; }
                        h1 { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                        ol li { margin: 8px 0; }
                    </style>
                </head>
                <body>
                    ${summaryContent}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    }
    
    generateSummaryContent() {
        const tenseData = [
            { name: "Present Simple", formula: "Subject + V1 (+s/es) + Object", example: "He plays cricket every day.", usage: "Habits, routines, facts" },
            { name: "Present Continuous", formula: "Subject + am/is/are + V1-ing + Object", example: "She is dancing beautifully.", usage: "Actions happening now" },
            { name: "Present Perfect", formula: "Subject + has/have + V3 + Object", example: "I have finished my homework.", usage: "Past actions with present relevance" },
            { name: "Present Perfect Continuous", formula: "Subject + has/have been + V1-ing + Object", example: "He has been studying for two hours.", usage: "Actions continuing till now" },
            { name: "Past Simple", formula: "Subject + V2 + Object", example: "We visited Delhi last year.", usage: "Completed past actions" },
            { name: "Past Continuous", formula: "Subject + was/were + V1-ing + Object", example: "She was cooking dinner when I arrived.", usage: "Ongoing actions in the past" },
            { name: "Past Perfect", formula: "Subject + had + V3 + Object", example: "He had left before I arrived.", usage: "Action completed before another past action" },
            { name: "Past Perfect Continuous", formula: "Subject + had been + V1-ing + Object", example: "I had been studying for hours before dinner.", usage: "Duration up to a past point" },
            { name: "Future Simple", formula: "Subject + will/shall + V1 + Object", example: "I will call you later.", usage: "Future predictions, decisions" },
            { name: "Future Continuous", formula: "Subject + will be + V1-ing + Object", example: "She will be studying at 8 pm tomorrow.", usage: "Future actions in progress" },
            { name: "Future Perfect", formula: "Subject + will have + V3 + Object", example: "They will have finished by noon.", usage: "Actions completed by future time" },
            { name: "Future Perfect Continuous", formula: "Subject + will have been + V1-ing + Object", example: "We will have been studying for three hours by midnight.", usage: "Duration up to future point" }
        ];
        
        let summaryHTML = `
            <h1>English Tenses - Complete Summary</h1>
            <p style="text-align: center; font-size: 18px; color: #666;">Classes 9-12 | CBSE/HBSE Board Preparation</p>
        `;
        
        tenseData.forEach((tense, index) => {
            if (index === 6) summaryHTML += '<div class="page-break"></div>';
            
            summaryHTML += `
                <div class="tense-summary">
                    <h3 style="color: #1e40af; border-left: 4px solid #2563eb; padding-left: 10px;">${tense.name}</h3>
                    <div class="formula"><strong>Formula:</strong> ${tense.formula}</div>
                    <div class="examples"><strong>Example:</strong> ${tense.example}</div>
                    <div style="color: #666; font-style: italic;"><strong>Usage:</strong> ${tense.usage}</div>
                </div>
            `;
        });
        
        summaryHTML += `
            <div class="page-break"></div>
            <h2 style="border-left: 4px solid #16a34a; padding-left: 15px;">Golden Rules for Success</h2>
            <ol style="font-size: 16px;">
                <li><strong>Subject-Verb Agreement:</strong> Always match subject and verb (He plays, They play)</li>
                <li><strong>Time Words:</strong> Use time indicators carefully (yesterday→Past, now→Present, tomorrow→Future)</li>
                <li><strong>Stative Verbs:</strong> Never use continuous forms with stative verbs (know, believe, love, own)</li>
                <li><strong>Conditional Clauses:</strong> Use present tense in 'if/when' clauses for future meaning</li>
                <li><strong>Since vs For:</strong> Since (starting point: since 2020), For (duration: for 3 years)</li>
            </ol>
            
            <h2 style="border-left: 4px solid #dc2626; padding-left: 15px;">Important Distinctions</h2>
            
            <h3>Will vs Going to</h3>
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p><strong>Will:</strong> Instant decisions, promises, predictions based on opinion</p>
                <p style="margin-left: 20px; color: #666;"><em>Example: "The phone is ringing. I'll answer it."</em></p>
                <p><strong>Going to:</strong> Planned actions, predictions based on evidence</p>
                <p style="margin-left: 20px; color: #666;"><em>Example: "I'm going to start a new hobby next month."</em></p>
            </div>
            
            <h3>Common Exam Traps</h3>
            <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <ul>
                    <li><strong>Stative Verb Error:</strong> ❌ "I am knowing him" → ✅ "I know him"</li>
                    <li><strong>Perfect Tense Error:</strong> ❌ "She have done" → ✅ "She has done"</li>
                    <li><strong>Time Mismatch:</strong> ❌ "Yesterday I go" → ✅ "Yesterday I went"</li>
                    <li><strong>Continuous Error:</strong> ❌ "He is play" → ✅ "He is playing"</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
                <p style="font-size: 18px; font-weight: bold; color: #1e40af;">🎯 Remember: Practice Makes Perfect! 🎯</p>
                <p style="color: #666;">Keep practicing these tenses daily for Board exam success.</p>
            </div>
        `;
        
        return summaryHTML;
    }
}

// Global Navigation Functions
function nextSlide() {
    console.log('Global nextSlide function called');
    if (presentation) {
        presentation.nextSlide();
    } else {
        console.error('Presentation not initialized');
    }
}

function previousSlide() {
    console.log('Global previousSlide function called');
    if (presentation) {
        presentation.previousSlide();
    } else {
        console.error('Presentation not initialized');
    }
}

function goToSlide(slideIndex) {
    console.log('Global goToSlide function called with:', slideIndex);
    if (presentation) {
        presentation.goToSlide(slideIndex);
    } else {
        console.error('Presentation not initialized');
    }
}

function toggleFullscreen() {
    if (presentation) {
        presentation.toggleFullscreen();
    } else {
        console.error('Presentation not initialized');
    }
}

function printSummary() {
    if (presentation) {
        presentation.printSummary();
    } else {
        console.error('Presentation not initialized');
    }
}

// Interactive Functions for Slides

// Show tense when clicked (Slide 2)
function showTense(element, tenseName) {
    if (!element.dataset.revealed) {
        const badge = document.createElement('span');
        badge.style.cssText = `
            font-size: 0.8em; 
            background: #16a34a; 
            color: white; 
            padding: 2px 6px; 
            border-radius: 3px; 
            margin-left: 5px;
            font-weight: bold;
        `;
        badge.textContent = tenseName;
        element.appendChild(badge);
        element.dataset.revealed = "true";
        
        // Add celebration animation
        element.style.transform = 'scale(1.1)';
        element.style.background = '#dcfce7';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            setTimeout(() => {
                element.style.background = '';
            }, 200);
        }, 200);
    }
}

// Show answers for practice questions
function showAnswers(button, answers) {
    const practiceBox = button.closest('.practice-box');
    if (!practiceBox) return;
    
    const questions = practiceBox.querySelectorAll('.practice-questions p');
    
    questions.forEach((question, index) => {
        if (index < answers.length) {
            // Remove existing answer if present
            const existingAnswer = question.querySelector('.answer-revealed');
            if (existingAnswer) {
                existingAnswer.remove();
            }
            
            // Add new answer
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-revealed';
            answerDiv.style.cssText = `
                background: #dcfce7;
                padding: 8px;
                border-radius: 4px;
                margin-top: 8px;
                font-weight: bold;
                border-left: 4px solid #16a34a;
            `;
            answerDiv.innerHTML = `<strong>✅ Answer:</strong> ${answers[index]}`;
            question.appendChild(answerDiv);
        }
    });
    
    button.style.display = 'none';
}

// Show exercise answers
function showExerciseAnswers(exerciseId) {
    const answersDiv = document.getElementById(exerciseId);
    if (answersDiv) {
        answersDiv.classList.remove('hidden');
        
        // Hide the button that was clicked
        const button = answersDiv.parentElement.querySelector('.exercise-btn');
        if (button) {
            button.style.display = 'none';
        }
        
        // Add smooth reveal animation
        answersDiv.style.opacity = '0';
        answersDiv.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            answersDiv.style.transition = 'all 0.4s ease';
            answersDiv.style.opacity = '1';
            answersDiv.style.transform = 'translateY(0)';
        }, 10);
    }
}

// Slide-specific interactions
function initializeSlideInteractions() {
    // Add click handlers for tense grid cells (Slide 5)
    const tenseCells = document.querySelectorAll('.tense-cell');
    tenseCells.forEach(cell => {
        cell.addEventListener('click', function() {
            // Add visual feedback
            const originalBg = this.style.backgroundColor;
            this.style.backgroundColor = '#dcfce7';
            this.style.transform = 'scale(1.02)';
            
            setTimeout(() => {
                this.style.backgroundColor = originalBg;
                this.style.transform = 'scale(1)';
            }, 300);
        });
    });
    
    // Add enhanced hover effects
    const interactiveElements = document.querySelectorAll('.highlight-text, .objective-item, .tense-cell');
    interactiveElements.forEach(element => {
        element.style.cursor = 'pointer';
        
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing presentation...');
    
    // Wait for CSS to load
    setTimeout(() => {
        try {
            // Create global presentation instance
            presentation = new TensePresentation();
            window.presentation = presentation;
            
            // Initialize slide interactions
            initializeSlideInteractions();
            
            // Check for hash in URL to start at specific slide
            if (window.location.hash) {
                const hashSlide = window.location.hash.replace('#slide-', '');
                const slideNumber = parseInt(hashSlide);
                if (slideNumber && slideNumber >= 1 && slideNumber <= 26) {
                    presentation.goToSlide(slideNumber - 1);
                }
            }
            
            console.log('✅ Presentation fully initialized and ready!');
            
        } catch (error) {
            console.error('❌ Error initializing presentation:', error);
        }
    }, 100);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
    if (window.location.hash && presentation) {
        const hashSlide = window.location.hash.replace('#slide-', '');
        const slideNumber = parseInt(hashSlide);
        if (slideNumber && slideNumber >= 1 && slideNumber <= 26) {
            presentation.goToSlide(slideNumber - 1);
        }
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Presentation error:', e.error);
});

// Debug helper
window.debugPresentation = function() {
    if (presentation) {
        console.log('📊 Presentation Debug Info:');
        console.log('Current slide:', presentation.currentSlide + 1);
        console.log('Total slides:', presentation.totalSlides);
        console.log('Slides found in DOM:', document.querySelectorAll('.slide').length);
        console.log('Active slide element:', document.querySelector('.slide.active'));
    } else {
        console.log('❌ Presentation not initialized');
    }
};