#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const template = readFileSync(resolve(root, "scripts/template.html"), "utf8");

const categories = data.categories;
const projects = data.projects.filter((p) => !p.gone);
const byCategory = Object.fromEntries(categories.map((c) => [c.id, []]));
for (const p of projects) {
  if (!byCategory[p.category]) throw new Error(`Unknown category "${p.category}" on ${p.name}`);
  byCategory[p.category].push(p);
}
for (const list of Object.values(byCategory)) {
  list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (b.stars || 0) - (a.stars || 0) || a.name.localeCompare(b.name));
}

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (n) => new Intl.NumberFormat("en-US").format(n || 0);
const slug = (id) => id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const primaryUrl = (p) => p.url || (p.repo ? `https://github.com/${p.repo}` : p.site);
const ownerOf = (p) => (p.repo ? p.repo.split("/")[0] : null);
const normalizeDescription = (d = "") => {
  let s = d.trim().replace(/\s+/g, " ");
  if (!s) return "";
  s = s[0].toUpperCase() + s.slice(1);
  if (!/[.!?。]$/.test(s)) s += ".";
  return s;
};

// ---------- README ----------
const readmeSections = categories
  .map((c) => {
    const items = byCategory[c.id]
      .map((p) => {
        const extra = [p.site && p.repo ? `[site](${p.site})` : null, p.post ? `[post](${p.post})` : null].filter(Boolean);
        const suffix = extra.length ? ` (${extra.join(", ")})` : "";
        return `- [${p.name}](${primaryUrl(p)})${suffix} - ${normalizeDescription(p.description)}`;
      })
      .join("\n");
    return `## ${c.title}\n\n${c.blurb}\n\n${items}`;
  })
  .join("\n\n");

const contents = categories.map((c) => `- [${c.title}](#${slug(c.title)})`).join("\n");

const REPO_URL = "https://github.com/rohinrohin/awesome-clef";
const SUBMIT_URL = `${REPO_URL}/issues/new?template=submit-project.yml`;

const readme = `# Awesome Clef [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> A curated list of projects, tools, SDKs, applications, experiments and resources built around [Cloudflare Clef](https://developers.cloudflare.com/workers-ai/models/clef/).

Site: **[awesomeclef.com](https://awesomeclef.com)** (searchable, with GitHub stars refreshed daily).

Clef and Clef-flash are Cloudflare's open-weight decision models. They take a state (text, JSON, images or video) plus a schema of typed questions (\`noul\`, \`choice\`, \`score\`) and return a probability for every allowed answer in one forward pass, without generating text. Workers AI ids \`@cf/cloudflare/clef\` (27B) and \`@cf/cloudflare/clef-flash\` (9B), weights on [Hugging Face](https://huggingface.co/Cloudflare/clef) under Apache 2.0, launched 2026-10-01 ([announcement](https://blog.cloudflare.com/clef-decision-models/)).

Community-maintained. Not affiliated with Cloudflare. A listing means a project meets the [inclusion rules](CONTRIBUTING.md#what-gets-listed), not that it has been reviewed for quality or security; read the code before you depend on it. To add a project, open a pull request or [file an issue](${SUBMIT_URL}). See [CONTRIBUTING.md](CONTRIBUTING.md).

${num(projects.length)} entries · last refreshed ${data.updated}

## Contents

${contents}
- [Contributing](#contributing)

${readmeSections}

## Contributing

Pull requests welcome. Edit \`data/projects.json\` (it drives both this README and the site) and run \`npm run validate\`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the entry format and inclusion criteria.

## License

[CC0 1.0](LICENSE). Forked from [awesome-jev](https://github.com/hellogumbo/awesome-jev) (also CC0). Linked projects, names and trademarks belong to their owners.
`;

writeFileSync(resolve(root, "README.md"), readme);

// ---------- Site ----------
const catTitle = Object.fromEntries(categories.map((c) => [c.id, c.short || c.title]));
const ICON_ARROW = `<svg viewBox="0 0 16 16" aria-hidden="true" class="size-4 shrink-0 fill-current"><path fill-rule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"/></svg>`;
const ICON_STAR = `<svg viewBox="0 0 16 16" aria-hidden="true" class="size-4 shrink-0 fill-brand-500"><path fill-rule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clip-rule="evenodd"/></svg>`;
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return "Link"; } };
const link = (href, label) =>
  `<a href="${esc(href)}" class="relative z-10 flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300">${label}${ICON_ARROW}</a>`;
const linkIcons = (p) => {
  const out = [];
  if (p.repo) out.push(link(`https://github.com/${p.repo}`, "GitHub"));
  if (p.site) out.push(link(p.site, "Site"));
  if (p.post) out.push(link(p.post, "Post"));
  if (!p.repo && !p.site && p.url) out.push(link(p.url, esc(hostOf(p.url))));
  return out.join("");
};

const row = (p) => {
  const text = [p.name, p.description, p.language, ownerOf(p), p.category, catTitle[p.category]].filter(Boolean).join(" ").toLowerCase();
  const owner = ownerOf(p);
  const meta = [p.language, catTitle[p.category]].filter(Boolean).map(esc).join(" · ");
  return `<li class="item relative flex flex-col gap-2 rounded-xl bg-white p-5 ring-1 ring-stone-950/10 hover:ring-brand-500/60 dark:bg-stone-900 dark:ring-white/10 dark:hover:ring-brand-500/50" data-name="${esc(p.name.toLowerCase())}" data-stars="${p.stars || 0}" data-added="${esc(p.added || "")}" data-text="${esc(text)}">
  <div class="flex items-baseline gap-2">
    <h3 class="min-w-0 text-base font-semibold [overflow-wrap:anywhere]"><a href="${esc(primaryUrl(p))}" class="hover:text-brand-700 dark:hover:text-brand-400">${esc(p.name)}</a></h3>
    ${owner ? `<p class="min-w-0 truncate text-sm text-stone-500 dark:text-stone-400">${esc(owner)}</p>` : ""}
    ${p.repo ? `<p class="ml-auto flex shrink-0 items-center gap-1 text-sm text-stone-600 tabular-nums dark:text-stone-300">${ICON_STAR}${num(p.stars)}</p>` : ""}
  </div>
  <p class="text-base/7 text-pretty text-stone-600 sm:text-sm/6 dark:text-stone-400">${esc(normalizeDescription(p.description))}</p>
  <div class="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1">
    <p class="font-mono text-xs text-stone-500 dark:text-stone-400">${meta}</p>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">${linkIcons(p)}</div>
  </div>
</li>`;
};

const sections = categories
  .map((c) => {
    const items = byCategory[c.id];
    if (!items.length) return "";
    return `<section class="cat pt-12" id="${esc(slug(c.title))}" data-cat="${esc(c.id)}">
  <div>
    <h2 class="flex items-center gap-3 text-2xl font-semibold tracking-tight text-balance">${esc(c.title)} <span data-count class="rounded-full bg-brand-500/10 px-2 py-0.5 font-mono text-xs font-medium text-brand-700 tabular-nums dark:text-brand-300">${items.length}</span></h2>
    <p class="mt-1 max-w-[56ch] text-base text-pretty text-stone-600 sm:text-sm/6 dark:text-stone-400">${esc(c.blurb)}</p>
  </div>
  <ul role="list" class="list mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
${items.map(row).join("\n")}
  </ul>
  <p class="empty py-4 text-base text-stone-500 dark:text-stone-400" hidden>No matches in this section.</p>
</section>`;
  })
  .join("\n\n");

const chipClass =
  "chip shrink-0 rounded-full px-3 py-1.5 text-base font-medium text-stone-600 ring-1 ring-stone-950/10 hover:text-stone-950 aria-pressed:bg-brand-500/10 aria-pressed:text-brand-800 aria-pressed:ring-brand-500/40 sm:py-1 sm:text-sm/6 dark:text-stone-300 dark:ring-white/10 dark:hover:text-white dark:aria-pressed:text-brand-300";
const chips = [`<button type="button" class="${chipClass}" data-filter="all" aria-pressed="true">All</button>`]
  .concat(categories.filter((c) => byCategory[c.id].length).map((c) => `<button type="button" class="${chipClass}" data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.short || c.title)}</button>`))
  .join("\n");

const repoCount = projects.filter((p) => p.repo).length;
const siteCount = projects.filter((p) => p.site).length;
const starsTotal = projects.reduce((n, p) => n + (p.repo ? p.stars || 0 : 0), 0);

const articleCount = projects.filter((p) => p.category === "articles").length;
let sha = "local";
try { sha = execSync("git rev-parse --short HEAD", { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch {}
const updatedLong = new Date(data.updated + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const html = template
  .replaceAll("{{PROJECT_COUNT}}", num(projects.length))
  .replaceAll("{{REPO_COUNT}}", num(repoCount))
  .replaceAll("{{SITE_COUNT}}", num(siteCount))
  .replaceAll("{{STARS_TOTAL}}", num(starsTotal))
  .replaceAll("{{UPDATED}}", esc(data.updated))
  .replaceAll("{{UPDATED_LONG}}", esc(updatedLong))
  .replaceAll("{{ARTICLE_COUNT}}", num(articleCount))
  .replaceAll("{{BUILD_SHA}}", esc(sha))
  .replaceAll("{{REPO_URL}}", REPO_URL)
  .replaceAll("{{SUBMIT_URL}}", SUBMIT_URL)
  .replaceAll("{{BUILD_STRING}}", esc(`${sha} · ${data.updated} · ${projects.length} entries`))
  .replace("{{CHIPS}}", chips)
  .replace("{{SECTIONS}}", sections);

writeFileSync(resolve(root, "site/index.html"), html);
execSync("npx tailwindcss -i scripts/styles.css -o site/styles.css --minify", { cwd: root, stdio: ["ignore", "ignore", "inherit"] });

// ---------- sitemap / robots ----------
writeFileSync(
  resolve(root, "site/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://awesomeclef.com/</loc><lastmod>${data.updated}</lastmod><changefreq>daily</changefreq></url>\n</urlset>\n`
);
writeFileSync(resolve(root, "site/robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: https://awesomeclef.com/sitemap.xml\n");
console.log(`Built README.md and site/index.html: ${projects.length} entries, ${repoCount} repos, ${siteCount} sites, ${num(starsTotal)} stars.`);
