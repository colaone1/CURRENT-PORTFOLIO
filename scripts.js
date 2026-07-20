/**
 * Portfolio Website - Core JavaScript
 *
 * Key Modules:
 * - utils: Utility functions for performance optimization
 * - navigation: Navigation and scroll handling
 * - projectCards: Project card interactions
 * - accessibility: Accessibility features
 * - perfMonitor: Performance monitoring and metrics
 * - serviceWorker: Service worker management
 * - backToTop: Back-to-top button behaviour
 */

const utils = {
    /**
     * Throttles function execution to limit how often it can be called
     * @param {Function} func - The function to throttle
     * @param {number} limit - Time in milliseconds between function calls
     * @returns {Function} - Throttled version of the input function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Debounces function execution to prevent excessive calls
     * @param {Function} func - The function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced version of the input function
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Measures execution time for performance monitoring
     * @param {string} label - Label for the measurement
     * @param {Function} fn - Function to measure
     * @returns {any} - Result of the function execution
     */
    measurePerformance(label, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

const navigation = {
    /**
     * Initializes navigation functionality including scroll-based hiding/showing
     */
    initialize() {
        const nav = document.querySelector('.nav-container');
        if (!nav) return;

        let lastScroll = 0;

        window.addEventListener('scroll', utils.throttle(() => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > lastScroll && currentScroll > 80) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        }, 100));

        const navLinks = document.querySelectorAll('.nav-button');
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' && index < navLinks.length - 1) {
                    navLinks[index + 1].focus();
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    navLinks[index - 1].focus();
                } else if (e.key === 'Home') {
                    navLinks[0].focus();
                } else if (e.key === 'End') {
                    navLinks[navLinks.length - 1].focus();
                }
            });
        });
    }
};

const projectCards = {
    /**
     * Initializes project card interactions including hover effects and focus states
     */
    initialize() {
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            card.addEventListener('focus', () => {
                card.classList.add('ring-2', 'ring-blue-500');
            });

            card.addEventListener('blur', () => {
                card.classList.remove('ring-2', 'ring-blue-500');
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('a');
                    if (link) link.click();
                }
            });
        });
    }
};

const accessibility = {
    handleReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
            document.documentElement.style.setProperty('--transition-duration', '0s');
        }
    },

    /**
     * Ensures a skip link exists without duplicating existing markup
     */
    initializeSkipLink() {
        const existingSkip = document.querySelector('a[href="#main-content"]');
        if (existingSkip) return;

        if (!document.getElementById('main-content')) return;

        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
        document.body.insertBefore(skipLink, document.body.firstChild);
    },

    initialize() {
        this.handleReducedMotion();
        this.initializeSkipLink();

        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                button.setAttribute('aria-label', 'Button');
            }
        });
    }
};

const perfMonitor = {
    logMetrics() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        const metrics = {
            totalLoadTime: performance.now(),
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime ?? null,
            domContentLoaded: navigationEntry
                ? navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart
                : null,
            loadComplete: navigationEntry
                ? navigationEntry.loadEventEnd - navigationEntry.loadEventStart
                : null
        };

        this.observeLCP((value) => {
            metrics.largestContentfulPaint = value;
            console.log('Performance Metrics:', metrics);
        });

        console.log('Performance Metrics:', metrics);
        return metrics;
    },

    observeLCP(onValue) {
        if (typeof PerformanceObserver === 'undefined') return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry && typeof onValue === 'function') {
                    onValue(lastEntry.startTime);
                }
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (error) {
            // Unsupported entry type in this browser — ignore
        }
    }
};

const serviceWorker = {
    register() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    },

    showOffline() {
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded z-50';
        indicator.textContent = 'You are offline';
        document.body.appendChild(indicator);
    },

    showUpdateAvailable() {
        const indicator = document.createElement('div');
        indicator.className = 'update-indicator fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded z-50';
        indicator.innerHTML = `
            <span>Update available</span>
            <button type="button" onclick="location.reload()" class="ml-2 underline">Reload</button>
        `;
        document.body.appendChild(indicator);
    }
};

const backToTop = {
    initialize() {
        const button = document.getElementById('back-to-top');
        if (!button) return;

        // Skip if the page already wired up its own handler
        if (button.dataset.bound === 'true') return;
        button.dataset.bound = 'true';

        window.addEventListener('scroll', utils.throttle(() => {
            if (window.pageYOffset > 300) {
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
            } else {
                button.style.opacity = '0';
                button.style.pointerEvents = 'none';
            }
        }, 100));

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

function initializeApp() {
    utils.measurePerformance('app-initialization', () => {
        navigation.initialize();
        projectCards.initialize();
        accessibility.initialize();
        backToTop.initialize();
        serviceWorker.register();
        perfMonitor.logMetrics();
        console.log('Portfolio website initialized successfully');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
