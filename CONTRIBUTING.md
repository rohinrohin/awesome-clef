# Contributing

Thanks for adding to the list. The whole directory lives in one file, `data/projects.json`. The README and the site at [awesomeclef.com](https://awesomeclef.com) are generated from it.

## Add a project

1. Fork the repo and add an object to the `projects` array in `data/projects.json`:

   ```json
   {
     "name": "ry",
     "repo": "ygwyg/ry",
     "site": "https://route-yes-example.burcs.workers.dev",
     "description": "An AI router for 404s, powered by Cloudflare Clef.",
     "category": "apps",
     "language": "TypeScript",
     "stars": 0,
     "added": "2026-10-08"
   }
   ```

   - `repo` is `owner/name` on GitHub, or `null` for a project that only has a website.
   - `site` is a live URL (demo, docs, product page) or `null`.
   - `url` is only needed when there is neither a repo nor a site, for example an article.
   - `category` is one of the `id` values in the `categories` array at the top of the file.
   - `stars` and `language` are refreshed automatically for GitHub repos. Leave `stars` at `0`.

2. Check it:

   ```bash
   npm run validate
   ```

3. Open a pull request that changes only `data/projects.json`. Do not commit `README.md` or `site/index.html`; CI regenerates both after merge. One project per PR keeps review quick.

If you would rather not edit JSON, [open an issue](https://github.com/rohinrohin/awesome-clef/issues/new?template=submit-project.yml) with the link and a sentence about what it does.

## What gets listed

A project qualifies if it has at least one of:

- real Clef usage: it calls `@cf/cloudflare/clef` / `@cf/cloudflare/clef-flash` on Workers AI, or runs the [open weights](https://huggingface.co/Cloudflare/clef)
- a library, SDK, integration, or inference runtime that specifically supports Clef
- an application, demo, or experiment built with Clef
- a benchmark or evaluation that includes Clef
- technical write-ups specifically about Clef

Not listed: projects that only mention Cloudflare, projects that only support Jev and "should work" with Clef, generic AI directories, SEO pages, empty or placeholder repos, and duplicates. Clef is Jev / System One API compatible, but compatibility alone is not enough; we want evidence the project was used or tested with Clef.

## How discovery works

A nightly GitHub Action:

1. **Refreshes** stars, languages, homepages, and renames for every listed repo, rebuilds, and deploys.
2. **Discovers** new repos (`scripts/discover.mjs`) via GitHub repository search (Clef-specific phrases in names, descriptions, and topics) and code search (`@cf/cloudflare/clef`, `@cf/cloudflare/clef-flash`, `Cloudflare/clef`, `Cloudflare/clef-flash`).
3. **Opens a pull request** with the candidates that pass the bar, plus a list of weaker hits for a manual look. Nothing is published until a maintainer merges it.

"clef" is also a music term, so repository hits need Cloudflare / decision-model context next to the word. False positives go in `data/exclude.json` so they never come back.

## Maintenance scripts

```bash
npm run refresh                     # update stars, language, homepages, renames, and mark removed repos
npm run discover                    # print Clef repos that are not listed yet, with the evidence for each
npm run discover -- --add           # append the ones that pass the bar to data/projects.json
npm run discover -- --report=r.md   # also write a markdown review report
npm run validate                    # check data/projects.json (fields, categories, duplicates)
npm run build                       # regenerate README.md, site/index.html, sitemap.xml, robots.txt
npm run dev                         # build and serve the site on http://localhost:4173
```

Set `GITHUB_TOKEN` to avoid rate limits; code search only runs when it is set.

Entries whose repo returns 404 are kept in the data with `"gone": true` and hidden from the README and site until they come back.
