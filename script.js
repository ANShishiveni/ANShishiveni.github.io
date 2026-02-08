// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuBtn.setAttribute('aria-expanded', String(isOpen));
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
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

    function updateActive() {
        const vh = window.innerHeight;
        const centerY = vh / 2;
        let bestId = null;
        let bestDist = Infinity;
        sections.forEach(sec => {
            const r = sec.getBoundingClientRect();
            if (r.top < vh * 0.9 && r.bottom > vh * 0.1) {
                const d = Math.abs(r.top + r.height / 2 - centerY);
                if (d < bestDist) { bestDist = d; bestId = sec.id; }
            }
        });
        if (bestId) setActive(bestId);
    }

    const observer = new IntersectionObserver(() => { updateActive(); }, {
        root: null,
        rootMargin: '-15% 0px -15% 0px',
        threshold: [0.1, 0.3, 0.5, 0.7]
    });

    sections.forEach(sec => observer.observe(sec));

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => { updateActive(); ticking = false; });
        }
    }, { passive: true });

    const initialId = (location.hash || '').replace('#', '') || (sections[0] && sections[0].id);
    if (initialId) setActive(initialId);
    updateActive();
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
                font-family="ui-sans-serif, system-ui, sans-serif" font-size="24" fill="#9ca3af">
            No Preview
          </text>
        </svg>
        `);

    // Helper: Check if WebP image exists (HEAD request)
    async function imageExists(url) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            return !!res && res.ok;
        } catch {
            return false;
        }
    }

    // Helper: Determine paths for local thumbnails (manual or GitHub-based naming)
    function getThumbPaths(item) {
        // If 'thumbnail' is explicitly set in JSON (manual projects), use it.
        // Assuming manual JSON might have "images/project.jpg"
        // We'll try to find a .webp version if the manual one is not explicit about extension or if we want to enforce structure.
        // BUT for simplicity, if item.thumbnail is provided, we respect it.
        // If not, we derive from item.name for GitHub repos.

        let base = '';
        if (item.thumbnail) {
            // e.g. "images/screenshot1.png"
            // We strip extension to find potential webp
            const lastDot = item.thumbnail.lastIndexOf('.');
            if (lastDot !== -1) {
                base = item.thumbnail.substring(0, lastDot);
            } else {
                base = item.thumbnail;
            }
            // If the manual path is just a file name, assume images/ folder? 
            // The existing projects.json seems to use relative paths like "images/..." or just names?
            // Let's assume projects.json provides full relative path.
            return {
                orig: item.thumbnail,
                webp: base + '.webp'
            };
        } else {
            // Default for GitHub repos: images/{name}.jpg + .webp
            return {
                orig: `images/${item.name}.jpg`,
                webp: `images/${item.name}.webp`
            };
        }
    }

    function mimeFromPath(path) {
        if (path.endsWith('.png')) return 'image/png';
        if (path.endsWith('.gif')) return 'image/gif';
        return 'image/jpeg';
    }

    async function renderProjects(items) {
        projectsGrid.innerHTML = '';
        
        // Prioritize first 3 items for LCP
        const priorityItems = items.slice(0, 3);
        const otherItems = items.slice(3);

        const createCard = async (item, index) => {
            const card = document.createElement('div');
            card.className = 'glass rounded-lg shadow-md card-hover overflow-hidden flex flex-col relative';

            const imgWrap = document.createElement('div');
            imgWrap.className = 'relative group';
            const paths = getThumbPaths(item);
            const picture = document.createElement('picture');
            const hasWebp = await imageExists(paths.webp);
            if (hasWebp) {
                const srcWebp = document.createElement('source');
                srcWebp.type = 'image/webp';
                srcWebp.srcset = paths.webp;
                picture.appendChild(srcWebp);
            }
            const srcOrig = document.createElement('source');
            srcOrig.type = mimeFromPath(paths.orig);
            srcOrig.srcset = paths.orig;
            picture.appendChild(srcOrig);
            const img = document.createElement('img');
            img.src = paths.orig;
            img.alt = `${item.name} thumbnail`;
            img.className = 'w-full h-48 object-cover transform group-hover:scale-105 transition duration-500';
            img.loading = index < 3 ? 'eager' : 'lazy';
            if (index < 3) img.fetchPriority = 'high';
            
            // Add error handler to fall back to placeholder
            img.onerror = () => {
                // If original image fails, replace the whole picture content with placeholder
                img.src = placeholderThumb;
                img.srcset = ''; // clear any srcset
                // remove sources to ensure fallback displays
                while (picture.firstChild !== img) {
                    picture.removeChild(picture.firstChild);
                }
            };

            picture.appendChild(img);
            imgWrap.appendChild(picture);

            // Overlay with "View Snapshot"
            const overlay = document.createElement('div');
            overlay.className = 'absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center';
            // Make entire overlay clickable for modal, or just a button?
            // Let's use a button for accessibility
            const viewBtn = document.createElement('button');
            viewBtn.className = 'text-white font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors';
            viewBtn.textContent = 'View Snapshot';
            viewBtn.setAttribute('aria-label', `View snapshot of ${item.title}`);
            viewBtn.onclick = (e) => {
                e.stopPropagation(); // prevent card click if we add one later
                openModal(img.src, item.title);
            };
            overlay.appendChild(viewBtn);
            imgWrap.appendChild(overlay);

            card.appendChild(imgWrap);

            const content = document.createElement('div');
            content.className = 'p-6 flex flex-col flex-grow';

            const title = document.createElement('h3');
            title.className = 'text-xl font-bold mb-2 text-white';
            title.textContent = item.title;
            content.appendChild(title);

            const desc = document.createElement('p');
            desc.className = 'text-gray-300 mb-4 flex-grow';
            desc.textContent = item.description || 'No description available.';
            content.appendChild(desc);

            const tags = document.createElement('div');
            tags.className = 'flex flex-wrap gap-2 mb-4';
            (item.technologies || []).forEach(tech => {
                const span = document.createElement('span');
                span.className = 'px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm';
                span.textContent = tech;
                tags.appendChild(span);
            });
            content.appendChild(tags);

            const links = document.createElement('div');
            links.className = 'flex justify-between mt-auto pt-4 border-t border-gray-700';

            if (item.repoUrl) {
                const repoLink = document.createElement('a');
                repoLink.href = item.repoUrl;
                repoLink.target = '_blank';
                repoLink.rel = 'noopener noreferrer';
                repoLink.className = 'text-gray-300 hover:text-white flex items-center transition-colors';
                repoLink.innerHTML = '<i class="fab fa-github mr-2"></i> Code';
                links.appendChild(repoLink);
            }

            if (item.demoUrl) {
                const demoLink = document.createElement('a');
                demoLink.href = item.demoUrl;
                demoLink.target = '_blank';
                demoLink.rel = 'noopener noreferrer';
                demoLink.className = 'text-blue-400 hover:text-blue-300 flex items-center transition-colors';
                demoLink.innerHTML = '<i class="fas fa-external-link-alt mr-2"></i> Live Demo';
                links.appendChild(demoLink);
            }

            content.appendChild(links);
            card.appendChild(content);
            projectsGrid.appendChild(card);
        };

        // Render items sequentially to maintain order but fetch images in parallel
        for (let i = 0; i < items.length; i++) {
            await createCard(items[i], i);
        }
    }

    // Modal logic
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'fixed inset-0 z-50 hidden flex items-center justify-center bg-black bg-opacity-90 p-4';
    modal.innerHTML = `
        <div class="relative max-w-4xl w-full max-h-screen">
            <button id="modalClose" class="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300 focus:outline-none" aria-label="Close modal">&times;</button>
            <img id="modalImg" src="" alt="Project Snapshot" class="w-full h-auto max-h-[85vh] object-contain rounded shadow-lg">
            <p id="modalCaption" class="text-center text-white mt-2 text-lg font-semibold"></p>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('#modalImg');
    const modalCaption = modal.querySelector('#modalCaption');
    const modalClose = modal.querySelector('#modalClose');

    function openModal(src, caption) {
        modalImg.src = src;
        modalCaption.textContent = caption;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
        modalClose.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
        modalImg.src = '';
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    async function fetchLanguages(url) {
        if (!url) return [];
        try {
            const res = await fetch(url);
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
            await renderProjects(items);
        } catch (err) {
            throw err;
        }
    }

    async function fetchManualProjects() {
        try {
            const res = await fetch('resources/projects.json');
            if (!res.ok) throw new Error('manual projects not found');
            const items = await res.json();
            await renderProjects(items);
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

// Automatically update copyright year
(function() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
})();
