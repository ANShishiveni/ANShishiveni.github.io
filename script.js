// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// Scroll spy: keep nav hover/active effect while section is in view
(function () {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('nav a.nav-link'));

    if (!sections.length || !navLinks.length) return;

    const linkById = {};
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('#')) {
            const id = href.slice(1);
            linkById[id] = link;
        }
    });

    function setActive(id) {
        Object.values(linkById).forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
        });
        const targetLink = linkById[id];
        if (targetLink) {
            targetLink.classList.add('active');
            targetLink.setAttribute('aria-current', 'page');
        }
    }

    const observer = new IntersectionObserver(entries => {
        // Choose the most visible section
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
            setActive(visible.target.id);
        }
    }, {
        root: null,
        threshold: [0.5, 0.6, 0.7, 0.8]
    });

    sections.forEach(sec => observer.observe(sec));

    // Set initial state based on current hash or topmost section
    const initialId = (location.hash || '').replace('#', '') || (sections[0] && sections[0].id);
    if (initialId) setActive(initialId);
})();

// Form validation and submission
// Contact form functionality removed as requested.

// Projects: GitHub API integration and manual fallback
(function () {
    const GITHUB_USERNAME = ""; // TODO: Set to your GitHub username, e.g., "absalom-shishiveni"
    const projectsGrid = document.getElementById('projectsGrid');
    const projectsError = document.getElementById('projectsError');

    if (!projectsGrid) return;

    const placeholderThumb =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
          <rect width="100%" height="100%" fill="#e5e7eb"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                font-family="Inter, Arial, sans-serif" font-size="20" fill="#6b7280">
            Project Thumbnail
          </text>
        </svg>`);

    function createTagChip(text) {
        const span = document.createElement('span');
        span.className = 'inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded';
        span.textContent = text;
        return span;
    }

    // Snapshots modal utilities
    function ensureSnapshotModal() {
        let modal = document.getElementById('snapshotModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'snapshotModal';
        modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 hidden';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Project snapshots');
        modal.innerHTML = `
          <div class="bg-white rounded-xl shadow-2xl w-11/12 max-w-3xl relative" tabindex="0">
            <button id="snapshotClose" class="absolute top-3 right-3 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow" aria-label="Close snapshots">
              ×
            </button>
            <div class="p-4">
              <h3 id="snapshotTitle" class="text-xl font-semibold mb-2 text-teal-700"></h3>
              <div class="relative">
                <img id="snapshotImage" src="" alt="Project snapshot" class="w-full max-h-[60vh] object-contain rounded-lg bg-gray-50 border" />
                <button id="snapshotPrev" class="absolute left-3 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow" aria-label="Previous snapshot">‹</button>
                <button id="snapshotNext" class="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow" aria-label="Next snapshot">›</button>
              </div>
              <div id="snapshotDots" class="flex justify-center gap-2 mt-3"></div>
            </div>
          </div>`;
        document.body.appendChild(modal);
        return modal;
    }

    function openSnapshots(item) {
        const modal = ensureSnapshotModal();
        const titleEl = modal.querySelector('#snapshotTitle');
        const imgEl = modal.querySelector('#snapshotImage');
        const prevBtn = modal.querySelector('#snapshotPrev');
        const nextBtn = modal.querySelector('#snapshotNext');
        const dotsEl = modal.querySelector('#snapshotDots');
        const closeBtn = modal.querySelector('#snapshotClose');

        const snapshots = (item.snapshots && item.snapshots.length) ? item.snapshots : [
            item.thumbnail || placeholderThumb
        ];

        let index = 0;
        titleEl.textContent = item.title || item.name || 'Project Snapshots';

        function render() {
            imgEl.src = snapshots[index];
            dotsEl.innerHTML = '';
            snapshots.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'w-2.5 h-2.5 rounded-full ' + (i === index ? 'bg-red-600' : 'bg-gray-300');
                dot.setAttribute('aria-label', `Go to snapshot ${i + 1}`);
                dot.onclick = () => { index = i; render(); };
                dotsEl.appendChild(dot);
            });
        }

        prevBtn.onclick = () => { index = (index - 1 + snapshots.length) % snapshots.length; render(); };
        nextBtn.onclick = () => { index = (index + 1) % snapshots.length; render(); };
        closeBtn.onclick = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; };

        // Close when clicking overlay outside the panel
        modal.addEventListener('click', (e) => {
            const panel = modal.querySelector('div[tabindex="0"]');
            if (e.target === modal) { closeBtn.click(); }
        });

        function onKey(e) {
            if (e.key === 'Escape') { modal.classList.add('hidden'); document.body.style.overflow = ''; }
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        }
        document.addEventListener('keydown', onKey, { once: true });

        render();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        // Focus the close button for accessibility
        closeBtn.focus();
    }

    function renderProjects(items) {
        projectsGrid.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md card-hover overflow-hidden flex flex-col';

            const img = document.createElement('img');
            img.src = item.thumbnail || `resources/projects/${item.slug || item.name}.png`;
            img.alt = `${item.name} thumbnail`;
            img.className = 'w-full h-40 object-cover project-thumb';
            img.loading = 'lazy';
            img.onerror = () => { img.src = placeholderThumb; };

            const body = document.createElement('div');
            body.className = 'p-6 flex-1 flex flex-col';

            const title = document.createElement('h3');
            title.className = 'text-xl font-semibold mb-2 text-blue-800';
            title.textContent = item.title || item.name;

            const desc = document.createElement('p');
            desc.className = 'text-gray-600 mb-4';
            desc.textContent = item.description || 'No description available.';

            const tags = document.createElement('div');
            tags.className = 'mb-4';
            (item.technologies || item.topics || item.languages || []).slice(0, 6).forEach(t => {
                tags.appendChild(createTagChip(t));
            });

            const links = document.createElement('div');
            links.className = 'mt-auto flex space-x-3';
            const repoLink = document.createElement('a');
            repoLink.href = item.repoUrl || item.html_url || '#';
            repoLink.target = '_blank';
            repoLink.rel = 'noopener noreferrer';
            repoLink.className = 'px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm';
            repoLink.textContent = 'GitHub';

            const snapsBtn = document.createElement('button');
            snapsBtn.type = 'button';
            snapsBtn.className = 'px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm';
            snapsBtn.textContent = 'Snapshots';
            if (item.snapshots && item.snapshots.length) {
                snapsBtn.onclick = () => openSnapshots(item);
            } else {
                snapsBtn.classList.add('opacity-50', 'cursor-not-allowed');
                snapsBtn.title = 'No snapshots available';
            }

            links.appendChild(repoLink);
            links.appendChild(snapsBtn);

            body.appendChild(title);
            body.appendChild(desc);
            body.appendChild(tags);
            body.appendChild(links);

            card.appendChild(img);
            card.appendChild(body);
            projectsGrid.appendChild(card);
        });
    }

    async function fetchLanguages(languagesUrl) {
        try {
            const res = await fetch(languagesUrl, { headers: { 'Accept': 'application/vnd.github+json' } });
            if (!res.ok) return [];
            const data = await res.json();
            return Object.keys(data);
        } catch {
            return [];
        }
    }

    async function fetchGithubProjects(username) {
        try {
            const res = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=12`, {
                headers: { 'Accept': 'application/vnd.github+json' }
            });
            if (!res.ok) throw new Error('Failed to load repositories');
            const repos = await res.json();

            const items = await Promise.all(repos
                .filter(r => !r.fork)
                .map(async r => {
                    const languages = await fetchLanguages(r.languages_url);
                    return {
                        name: r.name,
                        title: r.name,
                        description: r.description,
                        technologies: languages,
                        repoUrl: r.html_url,
                        demoUrl: r.homepage,
                        thumbnail: null
                    };
                })
            );

            if (!items.length) throw new Error('No repositories found.');
            renderProjects(items);
        } catch (err) {
            throw err;
        }
    }

    async function fetchManualProjects() {
        try {
            const res = await fetch('resources/projects.json');
            if (!res.ok) throw new Error('manual projects not found');
            const items = await res.json();
            renderProjects(items);
        } catch {
            projectsError.textContent = 'Set your GitHub username in script.js or add resources/projects.json.';
            projectsError.classList.remove('hidden');
        }
    }

    (async function init() {
        if (GITHUB_USERNAME) {
            try {
                await fetchGithubProjects(GITHUB_USERNAME);
            } catch (err) {
                projectsError.textContent = 'Error loading GitHub projects. Falling back to manual config.';
                projectsError.classList.remove('hidden');
                await fetchManualProjects();
            }
        } else {
            await fetchManualProjects();
        }
    })();
})();
