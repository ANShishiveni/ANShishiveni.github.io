# My Landing Page

This project is a static landing page built with plain HTML, CSS, and JavaScript. It uses Tailwind CSS, Font Awesome, and EmailJS via CDNs. There is no build system; the site is served as static files.

## Path Resolution Strategy

- Use relative paths for local assets to ensure compatibility across development and production, including sub-path deployments (e.g., GitHub Pages project sites).
  - Example: `resources/profile.png`, not `/resources/profile.png`.
- Keep all local assets under `resources/`.
- External dependencies are loaded via absolute HTTPS URLs (CDNs).
- Avoid leading slashes in local asset references to prevent broken links when the site is not served from the domain root.

## Asset References

- Favicon: `resources/profile.png`
- Images: `resources/profile.png`, `resources/it-essentials.png`, `resources/NetworkingEssentials.png`
- Document: `resources/CV.pdf`
- Stylesheet: `style.css`
- Script: `script.js`
- CDNs: Tailwind (`https://cdn.tailwindcss.com`), Font Awesome CSS, EmailJS browser SDK

## Development

1. Serve the project locally (any static server). Example with Python:
   - `python -m http.server 5500`
   - Open `http://localhost:5500/`
2. Verify images, favicon, and CV download work.

## EmailJS Setup

Update `script.js` with your EmailJS credentials:
- `emailjs.init("YOUR_PUBLIC_KEY")`
- `emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)`

## Automated Asset Checks

- A PowerShell script `scripts/check-assets.ps1` validates:
  - Local asset references exist on disk.
  - Remote CDN links respond to a HEAD request.
- GitHub Actions workflow runs the script on push and pull requests.

### Run Locally (Windows PowerShell)

`pwsh ./scripts/check-assets.ps1`

## CI

GitHub Actions workflow `.github/workflows/asset-check.yml` runs on Windows and fails the build if any broken asset paths are detected.

## Notes

- If migrating to a build system later, maintain relative asset paths or configure a `base` URL appropriately.
- Consider adding Subresource Integrity (SRI) and `preconnect` for CDNs in future hardening.