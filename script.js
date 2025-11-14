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
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // Form validation
    function validateField(field, errorElement, validationRules) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check if field is required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }

        // Subject validation (prevent spam)
        if (field.id === 'subject' && value) {
            if (value.length < 3) {
                isValid = false;
                errorMessage = 'Subject must be at least 3 characters long.';
            }
            if (value.length > 100) {
                isValid = false;
                errorMessage = 'Subject must be less than 100 characters.';
            }
        }

        // Message validation
        if (field.id === 'message' && value) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long.';
            }
            if (value.length > 1000) {
                isValid = false;
                errorMessage = 'Message must be less than 1000 characters.';
            }
        }

        // Update UI
        if (isValid) {
            field.classList.remove('border-red-500');
            field.classList.add('border-gray-300');
            errorElement.classList.add('hidden');
        } else {
            field.classList.remove('border-gray-300');
            field.classList.add('border-red-500');
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
        }

        return isValid;
    }

    // Real-time validation
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(field => {
        field.addEventListener('blur', () => {
            const errorElement = document.getElementById(field.id + 'Error');
            if (errorElement) {
                validateField(field, errorElement);
            }
        });
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot check (spam protection)
        const honeypot = document.getElementById('honeypot');
        if (honeypot.checked) {
            console.log('Bot detected');
            return;
        }

        // Validate all fields
        let isFormValid = true;
        const fieldsToValidate = [
            { field: document.getElementById('name'), error: document.getElementById('nameError') },
            { field: document.getElementById('email'), error: document.getElementById('emailError') },
            { field: document.getElementById('subject'), error: document.getElementById('subjectError') },
            { field: document.getElementById('message'), error: document.getElementById('messageError') },
            { field: document.getElementById('agree'), error: document.getElementById('agreeError') }
        ];

        fieldsToValidate.forEach(({ field, error }) => {
            if (!validateField(field, error)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');
        const formSuccess = document.getElementById('formSuccess');
        const formError = document.getElementById('formError');

        submitBtn.disabled = true;
        submitText.textContent = 'Sending...';
        submitSpinner.classList.remove('hidden');
        formSuccess.classList.add('hidden');
        formError.classList.add('hidden');

        // Prepare form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            to: 'absalomshishiveni67@mail.com'
        };

        try {
            // Initialize EmailJS
            emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key

            // Send email using EmailJS
            const templateParams = {
                to_email: 'absalomshishiveni67@mail.com',
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message
            };

            await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);

            // Show success message
            formSuccess.textContent = 'Thank you! Your message has been sent successfully. I will get back to you soon.';
            formSuccess.classList.remove('hidden');
            contactForm.reset();

        } catch (error) {
            console.error('Email sending failed:', error);
            // Show error message
            formError.textContent = 'Sorry, there was an error sending your message. Please try again or contact me directly.';
            formError.classList.remove('hidden');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitText.textContent = 'Send Message';
            submitSpinner.classList.add('hidden');
        }
    });
}

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
            repoLink.className = 'px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm';
            repoLink.textContent = 'GitHub';

            const demoLink = document.createElement('a');
            demoLink.href = item.demoUrl || item.homepage || '#';
            demoLink.target = '_blank';
            demoLink.className = 'px-3 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 text-sm';
            demoLink.textContent = 'Live Demo';
            if (!demoLink.href || demoLink.href === '#') {
                demoLink.classList.add('opacity-50', 'cursor-not-allowed');
                demoLink.onclick = (e) => e.preventDefault();
            }

            links.appendChild(repoLink);
            links.appendChild(demoLink);

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
