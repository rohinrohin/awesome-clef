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
const linkIcons = (p) => {
  const out = [];
  if (p.repo) out.push(`<a href="https://github.com/${esc(p.repo)}" title="GitHub repository">[repo]</a>`);
  if (p.site) out.push(`<a href="${esc(p.site)}" title="Website">[site]</a>`);
  if (p.post) out.push(`<a href="${esc(p.post)}" title="Post on X">[post]</a>`);
  if (!p.repo && !p.site && p.url) out.push(`<a href="${esc(p.url)}" title="Link">[link]</a>`);
  return `<span class="links">${out.join("")}</span>`;
};

const row = (p) => {
  const text = [p.name, p.description, p.language, ownerOf(p), p.category].filter(Boolean).join(" ").toLowerCase();
  const owner = ownerOf(p);
  return `<tr data-name="${esc(p.name.toLowerCase())}" data-stars="${p.stars || 0}" data-added="${esc(p.added || "")}" data-text="${esc(text)}">
  <td class="c-name"><a href="${esc(primaryUrl(p))}">${esc(p.name)}</a>${owner ? `<span class="owner">${esc(owner)}</span>` : ""}</td>
  <td class="c-desc">${esc(normalizeDescription(p.description))}</td>
  <td class="c-lang">${p.language ? esc(p.language) : '<span class="dim">—</span>'}</td>
  <td class="c-stars">${p.repo ? `<span class="stars">★ ${num(p.stars)}</span>` : '<span class="dim">—</span>'}</td>
  <td class="c-links">${linkIcons(p)}</td>
</tr>`;
};

const sections = categories
  .map((c, i) => {
    const items = byCategory[c.id];
    return `<section class="cat win" id="${esc(slug(c.title))}" data-cat="${esc(c.id)}">
  <div class="win-bar"><span>${String(i + 1).padStart(2, "0")} · ${esc(c.title)}</span><span class="win-bar-r"><span data-count>${items.length}</span> entries</span></div>
  <p class="blurb">${esc(c.blurb)}</p>
  <table class="dir">
    <thead><tr><th>Project</th><th>Description</th><th>Lang</th><th>Stars</th><th>Links</th></tr></thead>
    <tbody>
${items.map(row).join("\n")}
    </tbody>
  </table>
  <p class="empty mono" hidden>0 matches in this section.</p>
</section>`;
  })
  .join("\n\n");

const chips = [`<button class="chip is-active" data-filter="all" type="button">All</button>`]
  .concat(categories.map((c) => `<button class="chip" data-filter="${esc(c.id)}" type="button">${esc(c.title)}</button>`))
  .join("\n");

const featuredPool = projects
  // Projects built for Clef, not large general-purpose repos that added Clef support.
  .filter((p) => p.repo && (p.created || "") >= "2026-09-25" && !["official", "lists", "articles"].includes(p.category))
  .sort((a, b) => (b.stars || 0) - (a.stars || 0))
  .slice(0, 4);
const featured = featuredPool
  .map(
    (p) => `<a class="feat" href="${esc(primaryUrl(p))}">
  <span class="feat-stars">★ ${num(p.stars)}</span>
  <span class="feat-name">${esc(p.name)}</span>
  <span class="feat-desc">${esc(normalizeDescription(p.description))}</span>
  <span class="feat-owner">${esc(ownerOf(p) || "")}${p.language ? ` · ${esc(p.language)}` : ""}</span>
</a>`
  )
  .join("\n");

const repoCount = projects.filter((p) => p.repo).length;
const siteCount = projects.filter((p) => p.site).length;
// Count stars only for projects built since the Clef launch window, not large repos that added support.
const starsTotal = projects.reduce((n, p) => n + (p.repo && (p.created || "") >= "2026-09-25" ? p.stars || 0 : 0), 0);

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
  .replaceAll("{{FEATURED_COUNT}}", String(featuredPool.length))
  .replaceAll("{{BUILD_SHA}}", esc(sha))
  .replaceAll("{{REPO_URL}}", REPO_URL)
  .replaceAll("{{SUBMIT_URL}}", SUBMIT_URL)
  .replaceAll("{{BUILD_STRING}}", esc(`${sha} · ${data.updated} · ${projects.length} entries`))
  .replace("{{FEATURED}}", featured)
  .replace("{{CHIPS}}", chips)
  .replace("{{SECTIONS}}", sections);

writeFileSync(resolve(root, "site/index.html"), html);
// ---------- sitemap / robots ----------
writeFileSync(
  resolve(root, "site/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://awesomeclef.com/</loc><lastmod>${data.updated}</lastmod><changefreq>daily</changefreq></url>\n</urlset>\n`
);
writeFileSync(resolve(root, "site/robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: https://awesomeclef.com/sitemap.xml\n");
console.log(`Built README.md and site/index.html: ${projects.length} entries, ${repoCount} repos, ${siteCount} sites, ${num(starsTotal)} stars.`);
