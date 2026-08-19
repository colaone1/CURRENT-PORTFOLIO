(function () {
    var STORAGE_KEY = 'theme';

    function systemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function storedTheme() {
        try {
            var value = localStorage.getItem(STORAGE_KEY);
            if (value === 'light' || value === 'dark') {
                return value;
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    function currentTheme() {
        return storedTheme() || systemTheme();
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        var isDark = theme === 'dark';
        document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
            button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        });
    }

    applyTheme(currentTheme());

    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(currentTheme());
        document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                try {
                    localStorage.setItem(STORAGE_KEY, next);
                } catch (error) {
                    /* Private mode can block storage; theme still applies for this page. */
                }
                applyTheme(next);
            });
        });
    });

    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () {
        if (!storedTheme()) {
            applyTheme(systemTheme());
        }
    };
    if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onChange);
    } else if (typeof media.addListener === 'function') {
        media.addListener(onChange);
    }
})();
