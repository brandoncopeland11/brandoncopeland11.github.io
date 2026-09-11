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

## Private analytics dashboard

This site now supports a private analytics dashboard at `https://brandoncopeland11.github.io/insights.html`.

It tracks:

- Daily unique visitors
- Session duration
- Page paths visited during each session
- Approximate section-level attention based on viewport focus
- Returning visitors using a first-party visitor ID stored in local storage

### Setup

1. Create a Supabase project.
2. Open `supabase/analytics.sql` in the Supabase SQL editor.
3. Replace `replace-with-your-email@example.com` with the email address you will use to sign in.
4. Run the SQL file.
5. In Supabase Auth, create your user account with that same email address.
6. Create a local `.env` file from `.env.example`.

```bash
cp .env.example .env
```

7. Fill in:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_TRACK_LOCAL_ANALYTICS=false
```

8. Restart the dev server or rebuild the site.
9. Visit `/insights.html` and sign in.

### Security model

- The dashboard page is not linked anywhere in the site navigation.
- Analytics writes are public so site visitors can create anonymous visit records.
- Analytics reads are restricted by Supabase row-level security to the email you set in `supabase/analytics.sql`.
- Because this is a static GitHub Pages site, this is a practical privacy layer for portfolio traffic, not a hardened analytics product for hostile traffic.

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
| `insights.html` | Private analytics dashboard route |
| `src/siteAnalytics.js` | Client-side visit, duration, and section tracking |
| `src/insights.js` | Dashboard UI and analytics aggregation |
| `src/data/projects.js` | Case studies for the masonry grid |
| `src/styles/main.css` | Layout and structure styles |
| `src/styles/insights.css` | Dashboard-specific styles |
| `case-studies/*.html` | Individual case study pages |
| `supabase/analytics.sql` | Supabase schema and row-level security policies |

## Customize content

1. Replace placeholder copy in `index.html` (name, bio, email, LinkedIn).
2. Update the featured project link and copy at the top of the `#work` section.
3. Edit `src/data/projects.js` to add/remove grid items and link to new case study HTML files.
4. Add a photo at `src/assets/` and update the about section `img` `src`.
