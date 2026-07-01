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
        const vh = (window.innerHeight || document.documentElement.clientHeight);
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
    const GITHUB_USERNAME = "ANShishiveni";
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
        span.className = 'inline-block border border-slate-800 bg-slate-900/50 text-cyan-400 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full';
        span.textContent = text;
        return span;
    }

    // Snapshots modal utilities
    function ensureSnapshotModal() {
        let modal = document.getElementById('snapshotModal');
        if (modal) return modal;

        modal = document.createElement('dialog');
        modal.id = 'snapshotModal';
        modal.className = 'bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl w-11/12 max-w-3xl relative p-0 outline-none';
        modal.setAttribute('aria-label', 'Project snapshots');
        modal.innerHTML = `
          <button id="snapshotClose" class="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 hover:bg-red-950/80 border border-slate-800 text-red-400 shadow focus:outline-none z-10" aria-label="Close snapshots">
            ×
          </button>
          <div class="p-4">
            <h3 id="snapshotTitle" class="text-xl font-bold mb-2 text-cyan-400"></h3>
            <div class="relative">
              <img id="snapshotImage" src="" alt="Project snapshot" class="w-full max-h-[60vh] object-contain rounded-lg bg-slate-950 border border-slate-800" />
              <button id="snapshotPrev" class="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-cyan-950/80 border border-slate-800 text-cyan-400 rounded-full p-2 shadow focus:outline-none" aria-label="Previous snapshot">‹</button>
              <button id="snapshotNext" class="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-cyan-950/80 border border-slate-800 text-cyan-400 rounded-full p-2 shadow focus:outline-none" aria-label="Next snapshot">›</button>
            </div>
            <div id="snapshotDots" class="flex justify-center gap-2 mt-3"></div>
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
                dot.className = 'w-2.5 h-2.5 rounded-full focus:outline-none transition ' + (i === index ? 'bg-cyan-400 shadow shadow-cyan-400/50' : 'bg-slate-700');
                dot.setAttribute('aria-label', `Go to snapshot ${i + 1}`);
                dot.onclick = () => { index = i; render(); };
                dotsEl.appendChild(dot);
            });
        }

        prevBtn.onclick = () => { index = (index - 1 + snapshots.length) % snapshots.length; render(); };
        nextBtn.onclick = () => { index = (index + 1) % snapshots.length; render(); };
        closeBtn.onclick = () => { modal.close(); };

        // Handle Escape key and click outside backdrop natively
        modal.onclose = () => {
            document.documentElement.style.overflow = '';
        };

        modal.onclick = (e) => {
            const rect = modal.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                modal.close();
            }
        };

        function onKey(e) {
            if (modal.open) {
                if (e.key === 'ArrowLeft') prevBtn.click();
                if (e.key === 'ArrowRight') nextBtn.click();
            }
        }
        document.addEventListener('keydown', onKey);
        modal.addEventListener('close', () => {
            document.removeEventListener('keydown', onKey);
        }, { once: true });

        render();
        modal.showModal();
        document.documentElement.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function slugify(value) {
        const s = String(value || '').toLowerCase().trim();
        return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function mimeFromPath(p) {
        const l = String(p || '').toLowerCase();
        if (l.endsWith('.png')) return 'image/png';
        if (l.endsWith('.jpg') || l.endsWith('.jpeg')) return 'image/jpeg';
        if (l.endsWith('.webp')) return 'image/webp';
        return 'image/png';
    }

    function getThumbPaths(item) {
        const base = item.thumbnail || `resources/projects/${slugify(item.slug || item.name)}.png`;
        let webp = base.replace(/\.(png|jpg|jpeg)$/i, '.webp');
        if (webp === base && !base.endsWith('.webp')) webp = `${base}.webp`;
        return { orig: base, webp };
    }

    function addPreloadLink(href) {
        const head = document.head;
        if (!head || !href) return;
        const exists = Array.from(head.querySelectorAll('link[rel="preload"][as="image"]')).some(l => l.getAttribute('href') === href);
        if (exists) return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = href;
        head.appendChild(link);
    }

    function renderProjects(items) {
        projectsGrid.innerHTML = '';
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            const card = document.createElement('div');
            card.className = 'cyber-card rounded-xl overflow-hidden flex flex-col relative';
            card.setAttribute('data-repo-url', item.repoUrl || item.html_url || '');

            const imgWrap = document.createElement('div');
            imgWrap.className = 'relative group';
            const paths = getThumbPaths(item);
            const picture = document.createElement('picture');
            
            const srcWebp = document.createElement('source');
            srcWebp.type = 'image/webp';
            srcWebp.srcset = paths.webp;
            picture.appendChild(srcWebp);
            
            const srcOrig = document.createElement('source');
            srcOrig.type = mimeFromPath(paths.orig);
            srcOrig.srcset = paths.orig;
            picture.appendChild(srcOrig);
            
            const img = document.createElement('img');
            img.src = paths.orig;
            img.alt = `${item.name} thumbnail`;
            img.className = 'w-full h-40 object-cover project-thumb';
            img.loading = idx < 3 ? 'eager' : 'lazy';
            img.decoding = 'async';
            if (idx < 3) { try { img.fetchPriority = 'high'; } catch {} }
            img.onerror = () => {
                img.src = placeholderThumb;
            };
            img.setAttribute('width', '640');
            img.setAttribute('height', '360');
            img.sizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';

            if (item.snapshots && item.snapshots.length) {
                img.classList.add('cursor-pointer');
                img.onclick = () => openSnapshots(item);
                const overlay = document.createElement('button');
                overlay.type = 'button';
                overlay.setAttribute('aria-label', 'View snapshots');
                overlay.setAttribute('aria-controls', 'snapshotModal');
                overlay.setAttribute('aria-expanded', 'false');
                overlay.className = 'absolute top-2 right-2 bg-slate-950/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition';
                overlay.innerHTML = '<i class="fas fa-eye"></i>';
                overlay.onclick = (e) => { e.stopPropagation(); openSnapshots(item); };
                imgWrap.appendChild(overlay);
            }

            picture.appendChild(img);
            imgWrap.appendChild(picture);

            const body = document.createElement('div');
            body.className = 'p-6 flex-1 flex flex-col';

            const title = document.createElement('h3');
            title.className = 'text-xl font-bold mb-2 text-white tracking-tight';
            title.textContent = item.title || item.name;

            const desc = document.createElement('p');
            desc.className = 'text-slate-400 mb-4 text-sm leading-relaxed';
            desc.textContent = item.description || 'No description available.';

            const tags = document.createElement('div');
            tags.className = 'mb-4';
            (item.technologies || item.topics || item.languages || []).slice(0, 6).forEach(t => {
                tags.appendChild(createTagChip(t));
            });

            const links = document.createElement('div');
            links.className = 'mt-auto flex space-x-3 items-center';
            const repoLink = document.createElement('a');
            repoLink.href = item.repoUrl || item.html_url || '#';
            repoLink.target = '_blank';
            repoLink.rel = 'noopener noreferrer';
            repoLink.className = 'px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition';
            repoLink.textContent = 'GitHub';

            links.appendChild(repoLink);

            body.appendChild(title);
            body.appendChild(desc);
            body.appendChild(tags);
            body.appendChild(links);

            card.appendChild(imgWrap);
            card.appendChild(body);
            projectsGrid.appendChild(card);

            if (idx < 3) { 
                addPreloadLink(paths.orig); 
                addPreloadLink(paths.webp); 
            }
        }
    }

    async function enrichProjectsWithGithub(username) {
        try {
            const res = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=12`, {
                headers: { 'Accept': 'application/vnd.github+json' }
            });
            if (!res.ok) return;
            const repos = await res.json();

            repos.forEach(repo => {
                const cleanUrl = repo.html_url.replace(/\/$/, '').toLowerCase();
                const cards = Array.from(document.querySelectorAll('[data-repo-url]'));
                const matchedCard = cards.find(c => {
                    const url = c.getAttribute('data-repo-url').replace(/\/$/, '').replace(/#$/, '').toLowerCase();
                    return url === cleanUrl;
                });

                if (matchedCard && repo.stargazers_count > 0) {
                    const linksDiv = matchedCard.querySelector('.flex-1 .mt-auto');
                    if (linksDiv) {
                        if (linksDiv.querySelector('.star-badge')) return;
                        
                        const starBadge = document.createElement('span');
                        starBadge.className = 'star-badge inline-flex items-center text-xs font-semibold text-amber-550 text-amber-500 bg-amber-950/20 border border-amber-900/30 px-2 py-1 rounded-lg ml-auto';
                        starBadge.innerHTML = `<i class="fas fa-star mr-1 text-amber-500"></i>${repo.stargazers_count}`;
                        linksDiv.appendChild(starBadge);
                    }
                }
            });
        } catch (err) {
            console.error('Error enriching projects with GitHub stats:', err);
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

    async function init() {
        await fetchManualProjects();
        if (GITHUB_USERNAME) {
            enrichProjectsWithGithub(GITHUB_USERNAME);
        }
    }
    
    init();
})();

// Automatically update copyright year
(function() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
})();
