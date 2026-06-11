# Portfolio

One-page product designer portfolio with case study detail pages.

## Preview locally

```bash
cd /Users/Brandon.Copeland/Desktop/Personal/Portfolio
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Publish changes to GitHub Pages

The live site is published from the `main` branch to:

```text
https://brandoncopeland11.github.io/
```

Recommended process:

1. Make edits locally.
2. Preview them with `npm run dev`.
3. When the site is in a good place, run:

```bash
npm run pages:check
git status
```

4. If the build passes and the changed files look right, commit and push:

```bash
git add .
git commit -m "Describe the change"
git push
```

5. Wait for the GitHub Pages deployment to finish in GitHub Actions, then hard refresh the live site.

If you want help publishing, ask Cursor to "check, commit, and push the portfolio changes." Cursor should run the build first, review the changed files, commit only the intended changes, push to `main`, and verify the live URL.

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | One-page home: hero, work (featured + masonry grid), about, contact |
| `src/data/projects.js` | Case studies for the masonry grid |
| `src/styles/main.css` | Layout and structure styles |
| `case-studies/*.html` | Individual case study pages |

## Customize content

1. Replace placeholder copy in `index.html` (name, bio, email, LinkedIn).
2. Update the featured project link and copy at the top of the `#work` section.
3. Edit `src/data/projects.js` to add/remove grid items and link to new case study HTML files.
4. Add a photo at `src/assets/` and update the about section `img` `src`.
