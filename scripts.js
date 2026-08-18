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

if (location.protocol === 'http:' && location.hostname === 'samconnor.uk') {
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
}

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
     * Keyboard navigation for the primary nav. Scroll-linked hide/show is omitted
     * so scrolling stays on the compositor.
     */
    initialize() {
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

const mobileMenu = {
    initialize() {
        const menuButton = document.getElementById('mobile-menu-button');
        const menu = document.getElementById('mobile-menu');
        const closeButton = document.getElementById('mobile-menu-close');
        if (!menuButton || !menu || !closeButton) return;
        if (menu.dataset.bound === 'true') return;
        menu.dataset.bound = 'true';

        const close = () => {
            menu.classList.add('hidden');
            document.body.classList.remove('menu-open');
            menuButton.setAttribute('aria-expanded', 'false');
        };

        const open = () => {
            menu.classList.remove('hidden');
            document.body.classList.add('menu-open');
            menuButton.setAttribute('aria-expanded', 'true');
            closeButton.focus();
        };

        menuButton.addEventListener('click', () => {
            if (menu.classList.contains('hidden')) {
                open();
            } else {
                close();
                menuButton.focus();
            }
        });

        closeButton.addEventListener('click', () => {
            close();
            menuButton.focus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
                close();
                menuButton.focus();
            }
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
    isLocalHost() {
        return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    },

    unregisterAll() {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => registration.unregister());
        });
        if (window.caches) {
            caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
        }
    },

    register() {
        if (!('serviceWorker' in navigator)) return;

        // Firefox keeps a SW across visits; Cursor's preview usually does not.
        // Local testing should match a clean load, not a stale worker.
        if (this.isLocalHost()) {
            this.unregisterAll();
            return;
        }

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
        const label = document.createElement('span');
        label.textContent = 'Update available';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ml-2 underline';
        button.textContent = 'Reload';
        button.addEventListener('click', () => location.reload());
        indicator.append(label, button);
        document.body.appendChild(indicator);
    }
};

const backToTop = {
    initialize() {
        const button = document.getElementById('back-to-top');
        if (!button) return;
        if (button.dataset.bound === 'true') return;
        button.dataset.bound = 'true';

        let visible = false;
        let ticking = false;

        const update = () => {
            ticking = false;
            const shouldShow = window.scrollY > 300;
            if (shouldShow === visible) return;
            visible = shouldShow;
            button.classList.toggle('is-visible', visible);
        };

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });

        update();

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

const contactForm = {
    initialize() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const buttonText = submitButton && submitButton.querySelector('.button-text');
        const loadingSpinner = submitButton && submitButton.querySelector('.loading-spinner');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            if (formData.get('_gotcha')) return;

            if (submitButton) submitButton.disabled = true;
            if (buttonText) buttonText.classList.add('hidden');
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            if (successMessage) successMessage.classList.add('hidden');
            if (errorMessage) errorMessage.classList.add('hidden');

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' }
            })
                .then((response) => {
                    if (response.ok) {
                        if (successMessage) successMessage.classList.remove('hidden');
                        form.reset();
                    } else if (errorMessage) {
                        errorMessage.classList.remove('hidden');
                    }
                })
                .catch(() => {
                    if (errorMessage) errorMessage.classList.remove('hidden');
                })
                .finally(() => {
                    if (submitButton) submitButton.disabled = false;
                    if (buttonText) buttonText.classList.remove('hidden');
                    if (loadingSpinner) loadingSpinner.classList.add('hidden');
                });
        });
    }
};

function deferDecorativeImages() {
    const decorate = () => {
        document.querySelectorAll('img[data-src][data-decorative="true"]').forEach((img) => {
            if (!img.getAttribute('src')) {
                img.setAttribute('src', img.getAttribute('data-src'));
            }
        });
    };
    if ('requestIdleCallback' in window) {
        requestIdleCallback(decorate, { timeout: 1500 });
    } else {
        window.addEventListener('load', () => setTimeout(decorate, 1), { once: true });
    }
}

function enableMotionAfterIdle() {
    const enable = () => document.documentElement.classList.add('motion-ready');
    if ('requestIdleCallback' in window) {
        requestIdleCallback(enable, { timeout: 1200 });
    } else {
        window.setTimeout(enable, 400);
    }
}

function initializeApp() {
    utils.measurePerformance('app-initialization', () => {
        navigation.initialize();
        mobileMenu.initialize();
        projectCards.initialize();
        accessibility.initialize();
        backToTop.initialize();
        contactForm.initialize();
        deferDecorativeImages();

        // Defer SW + metrics off the critical path (INP / main-thread)
        const deferWork = () => {
            serviceWorker.register();
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
                // Keep console metrics opt-in to avoid main-thread noise on every load
                if (location.search.includes('debug=perf')) {
                    perfMonitor.logMetrics();
                }
            }
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(deferWork, { timeout: 2000 });
        } else {
            window.addEventListener('load', () => setTimeout(deferWork, 1), { once: true });
        }

        enableMotionAfterIdle();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
