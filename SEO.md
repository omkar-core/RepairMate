# SEO.md

Search-engine and social-sharing preparation for the single-page app. Lighthouse
`categories:seo` ≥ 0.9 is an **error-level** gate in `.lighthouserc.json`.

## On-page metadata (`index.html`)

- `lang="en"`, viewport with `viewport-fit=cover`.
- `<title>`: "RepairMate AI - Fix Broken Devices Instantly with AI".
- `meta[name="description"]` + keywords (repair, DIY repair, AI repair
  assistant, tech repair, e-waste).
- `meta[name="robots"]` = `index, follow`.
- `referrer` = `strict-origin-when-cross-origin`.
- Canonical URL pinned to https://repair-mate-seven.vercel.app/.
- Favicon: `/favicon.svg`.

## Social graph

- **Open Graph:** `og:type` website, `og:title`, `og:description`, `og:url`,
  `og:site_name`.
- **Twitter Card:** `summary_large_card`-style `twitter:card` + title/
  description.

## Crawling assets (`public/`)

- `robots.txt`:

  ```text
  User-agent: *
  Allow: /

  Sitemap: https://repair-mate-seven.vercel.app/sitemap.xml
  ```

- `sitemap.xml`: single URL at the canonical origin, `changefreq=monthly`,
  `priority=1.0`.
- `security.txt` at `/.well-known/security.txt` with contact + policy links.

> The app is a single-page client-rendered app: crawlers that execute JS will
> index the hero copy rendered by React; static HTML is intentionally lean.
> If long-tail landing pages become a goal, add prerendering or SSR as a phase
> (see `PHASES.md`).

## Notes & maintenance

- When the deployment origin changes, update canonical URL, OG/Twitter URLs,
  `robots.txt` sitemap, and `sitemap.xml` together. `APP_URL` in
  `ENVIRONMENT.md` mirrors this.
- Keep title/description aligned with actual page content — search engines
  penalize mismatch.
- Audit via `npm run lighthouse` (SEO category).