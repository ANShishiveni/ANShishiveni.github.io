# Landing Page

## Overview
A GitHub Pages-compatible portfolio website showcasing projects, skills and education 

## Features
- Responsive layout optimized for GitHub Pages
- Projects section with titles, descriptions, technologies, demos, and repo links
- Dynamic fetching from GitHub API (with manual `resources/projects.json` fallback)
- Consistent color scheme and professional typography.
- Mobile-first design with optimized asset paths

## Configuration
1. Set your GitHub username in `script.js`:
   - `const GITHUB_USERNAME = "your-username";`
2. Optional manual projects:
   - Edit `resources/projects.json` to add custom entries or overrides.
3. GitHub Pages:
   - For user site: repo must be named `your-username.github.io`.
   - For project site: any repo name; set `_config.yml` `baseurl: "/<repo-name>"` and keep all asset paths relative (already done).

## Deployment
- Push to `main` branch.
- Enable GitHub Pages:
  - Settings → Pages → Build from `GitHub Actions` or from `main` (root).
- If using project site, update `_config.yml` `baseurl` as noted.

## Asset Paths
- All local assets use relative paths (e.g., `resources/...`) to work under both root and subpath deployments.
- Thumbnails auto-resolve from `resources/projects/<repo-name>.png`; if missing, a placeholder is used.

## CI
- Asset path checks via PowerShell script `scripts/check-assets.ps1` and workflow `.github/workflows/asset-check.yml`.

## Notes

This project is a static landing page built with plain HTML, CSS, and JavaScript. It uses Tailwind CSS, and Font Awesome. There is no build system; the site is served as static files.

## Path Resolution Strategy

- Use relative paths for local assets to ensure compatibility across development and production, including sub-path deployments (e.g., GitHub Pages project sites).
  - Example: `resources/profile.png`, not `/resources/profile.png`.
- Keep all local assets under `resources/`.
- External dependencies are loaded via absolute HTTPS URLs (CDNs).
- Avoid leading slashes in local asset references to prevent broken links when the site is not served from the domain root.


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
