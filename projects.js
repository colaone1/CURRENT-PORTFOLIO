(function () {
    function initProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        const paginationControls = document.getElementById('pagination-controls');
        if (!projectsGrid || !paginationControls) return;

        const filterButtons = document.querySelectorAll('.filter-btn');
        const allProjectCards = Array.from(projectsGrid.querySelectorAll('[data-type]'));
        const CARDS_PER_PAGE = 3;
        let currentPage = 1;
        let currentFilter = 'all';

        function getFilteredCards() {
            return allProjectCards.filter(
                (card) =>
                    currentFilter === 'all' ||
                    card.getAttribute('data-type') === currentFilter
            );
        }

        function renderPage(page) {
            const filteredCards = getFilteredCards();
            const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE) || 1;
            currentPage = Math.max(1, Math.min(page, totalPages));

            allProjectCards.forEach((card) => {
                card.classList.add('hidden');
                card.classList.remove('visible', 'project-card-fade');
            });

            const start = (currentPage - 1) * CARDS_PER_PAGE;
            filteredCards.slice(start, start + CARDS_PER_PAGE).forEach((card) => {
                card.classList.remove('hidden');
                card.classList.add('visible', 'project-card-fade');
            });

            renderPaginationControls(totalPages);
        }

        function renderPaginationControls(totalPages) {
            paginationControls.replaceChildren();
            if (totalPages <= 1) return;

            const makeButton = (label, onClick, isCurrent) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = label;
                btn.className =
                    'mx-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ' +
                    (isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300');
                btn.addEventListener('click', onClick);
                return btn;
            };

            paginationControls.appendChild(
                makeButton('Previous', () => {
                    renderPage(currentPage === 1 ? totalPages : currentPage - 1);
                }, false)
            );

            for (let i = 1; i <= totalPages; i += 1) {
                paginationControls.appendChild(
                    makeButton(String(i), () => renderPage(i), i === currentPage)
                );
            }

            paginationControls.appendChild(
                makeButton('Next', () => {
                    renderPage(currentPage === totalPages ? 1 : currentPage + 1);
                }, false)
            );
        }

        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                currentFilter = button.getAttribute('data-filter');
                filterButtons.forEach((btn) => {
                    btn.classList.remove('active', 'bg-blue-600', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.remove('bg-gray-200', 'text-gray-700');
                button.classList.add('active', 'bg-blue-600', 'text-white');
                renderPage(1);
            });
        });

        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }

        renderPage(1);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjects);
    } else {
        initProjects();
    }
})();
