# Brandon Copeland, Product Designer Portfolio

Source for [brandoncopeland11.github.io](https://brandoncopeland11.github.io/). A one-page portfolio with case study detail pages, built with plain HTML, CSS, and JavaScript on [Vite](https://vite.dev/).

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

To check the production build locally:

```bash
npm run build
npm run preview
```

## Deployment

Every push to `main` builds the site and deploys `dist/` to GitHub Pages through `.github/workflows/deploy.yml`.

1. Preview changes with `npm run dev`.
2. Run `npm run build` to confirm the build passes.
3. Commit and push to `main`.
4. Wait for the "Deploy to GitHub Pages" action to finish, then hard refresh the live site.

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Home page: hero, work, about (experience, skills, tools), and contact |
| `case-studies/<slug>/index.html` | Case study pages: `collection-ads`, `add-to-list-ux`, `flyer-swiping` |
| `case-studies/project-*/` | Images and video for each case study |
| `src/main.js` | Home page behaviour: work cards, experience cards, nav, theme |
| `src/story.js`, `src/storyMusic.js` | "Get to know me" story overlay and its background music |
| `src/data/projects.js` | Work cards and "next project" order |
| `src/data/experience.js` | Work history cards |
| `src/data/story.js` | Story slides |
| `src/styles/main.css` | All site styles |
| `public/assets/` | Static files served as-is: resume PDF, logos, profile photo |
| `vite.config.js` | Build entry points for each page |

## Adding a case study

1. Create `case-studies/<slug>/index.html`, using an existing case study as a template.
2. Add the page to `pages` in `vite.config.js` so it's included in the build.
3. Add an entry to `src/data/projects.js` to show it on the home page.

## Content rules

Site copy avoids em dashes. See `.cursor/rules/no-em-dashes.mdc`.
