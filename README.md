# Basic Deployable Website

This is a simple static website starter.

## Files

- `index.html` - Main page
- `styles.css` - Stylesheet

## Run Locally

Just open `index.html` in your browser.

## SEO Build (Recommended)

Content is managed in `content.json`, while SEO pages are generated as static HTML.

For complete architecture and file-connection documentation, see:
- `WEBSITE_STRUCTURE.txt`

Run:

```bash
node build/generate-pages.js
```

This updates:
- `index.html`
- `about.html`
- `sitemap.xml`
- `robots.txt`

## Deploy to GitHub Pages

1. Create a GitHub repository and upload these files.
2. Push to branch `main`.
3. In GitHub repo: `Settings` -> `Pages`.
4. Under **Build and deployment**, set:
   - Source: `Deploy from a branch`
   - Branch: `main` and folder `/ (root)`
5. Save and wait 1-2 minutes.
6. Your site will be live at:
   - `https://<your-username>.github.io/<repo-name>/`

## Deploy to Other Hosting

Any static host works (Netlify, Vercel, Cloudflare Pages, shared hosting):

1. Upload `index.html` and `styles.css` to your site root (`public_html` or equivalent).
2. Ensure `index.html` is in the root directory.
3. Visit your domain.

## Customize

- Update site text in `index.html`.
- Change colors/fonts in `styles.css`.
- Replace email in the Contact section.
