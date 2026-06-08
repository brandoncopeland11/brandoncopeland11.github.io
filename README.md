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
