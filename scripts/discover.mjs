#!/usr/bin/env node
// Finds GitHub repos that use Cloudflare Clef and are not in data/projects.json yet.
// Two signals: repository search (name/description/topics) and code search for the
// model ids (code search needs GITHUB_TOKEN). Prints candidates by default.
//   --add            append candidates that pass the inclusion bar to data/projects.json
//   --report=FILE    write a markdown review report (used as the nightly PR body)
//   --days=N         only repos pushed in the last N days (default 7)
// Nothing is published directly: the nightly workflow opens a pull request for review.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { categorize, RELEVANT } from "./categorize.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = resolve(root, "data/projects.json");
const data = JSON.parse(readFileSync(file, "utf8"));
const exclude = JSON.parse(readFileSync(resolve(root, "data/exclude.json"), "utf8"));
const args = process.argv.slice(2);
const add = args.includes("--add");
const reportPath = (args.find((a) => a.startsWith("--report=")) || "").slice(9);
const days = Number((args.find((a) => a.startsWith("--days=")) || "--days=7").slice(7));
const since = new Date(Date.now() - days * 86400e3).toISOString().slice(0, 10);
const today = new Date().toISOString().slice(0, 10);

const known = new Set(data.projects.filter((p) => p.repo).map((p) => p.repo.toLowerCase()));
const skip = new Set(exclude.repos.map((r) => r.toLowerCase()));
const names = new Set(data.projects.map((p) => p.name));
const token = process.env.GITHUB_TOKEN;
const headers = { Accept: "application/vnd.github+json", "User-Agent": "awesome-clef-discover" };
if (token) headers.Authorization = `Bearer ${token}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const repoQueries = [
  `"cloudflare clef" pushed:>=${since}`,
  `clef-flash pushed:>=${since}`,
  `clef cloudflare pushed:>=${since}`,
  `clef workers-ai pushed:>=${since}`,
  `clef "decision model" pushed:>=${since}`,
  `clef systemone pushed:>=${since}`,
  `clef jev pushed:>=${since}`,
  `topic:clef pushed:>=${since}`,
];
// Exact model ids / Hugging Face ids in source, READMEs, and config.
const codeQueries = ['"@cf/cloudflare/clef"', '"@cf/cloudflare/clef-flash"', '"Cloudflare/clef-flash"', '"Cloudflare/clef"'];

const found = new Map(); // full_name lower -> { repo, evidence:Set }
const note = (r, why) => {
  const key = r.full_name.toLowerCase();
  if (known.has(key) || skip.has(key) || r.fork || r.archived) return;
  if (!found.has(key)) found.set(key, { repo: r, evidence: new Set() });
  found.get(key).evidence.add(why);
};

for (const q of repoQueries) {
  for (let page = 1; page <= 3; page++) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=updated&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`${q} p${page}: ${res.status}`);
      break;
    }
    const body = await res.json();
    for (const r of body.items || []) {
      // Name/description must say Clef; topics alone are too easy to stuff.
      if (RELEVANT.test(`${r.full_name} ${r.description || ""}`)) note(r, "description");
      else if (RELEVANT.test(`${r.full_name} ${r.description || ""} ${(r.topics || []).join(" ")}`)) note(r, "topics");
    }
    if ((body.items || []).length < 100) break;
    await sleep(2500);
  }
}

if (token) {
  const codeRepos = new Map();
  for (const q of codeQueries) {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=100&page=${page}`, { headers });
      if (!res.ok) {
        console.warn(`code ${q} p${page}: ${res.status}`);
        break;
      }
      const body = await res.json();
      for (const it of body.items || []) {
        const key = it.repository.full_name.toLowerCase();
        if (!codeRepos.has(key)) codeRepos.set(key, { name: it.repository.full_name, paths: new Set() });
        codeRepos.get(key).paths.add(it.path);
      }
      if ((body.items || []).length < 100) break;
      await sleep(7000); // code search allows ~10 requests/minute
    }
    await sleep(7000);
  }
  for (const [key, { name, paths }] of codeRepos) {
    if (known.has(key) || skip.has(key)) continue;
    const res = await fetch(`https://api.github.com/repos/${name}`, { headers });
    if (!res.ok) continue;
    const r = await res.json();
    if (r.pushed_at.slice(0, 10) < since) continue;
    note(r, `code: ${[...paths].slice(0, 3).join(", ")}`);
  }
} else {
  console.warn("GITHUB_TOKEN not set: skipping code search (model-id usage).");
}

const description = (r) => (r.description || "").trim().replace(/\s+/g, " ");

// Optional: ask Clef itself (Clef-flash on Workers AI) whether each candidate really uses Clef,
// and which category fits. Needs CLOUDFLARE_ACCOUNT_ID and a token with Workers AI access.
const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_AI_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const readme = async (name) => {
  const res = await fetch(`https://api.github.com/repos/${name}/readme`, { headers: { ...headers, Accept: "application/vnd.github.raw" } });
  return res.ok ? (await res.text()).slice(0, 4000) : "";
};
const judge = async (r) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/run/@cf/cloudflare/clef-flash`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "clef-flash",
      state: { repository: r.full_name, description: r.description || "", topics: r.topics || [], readme: await readme(r.full_name) },
      questions: {
        uses_clef: {
          type: "noul",
          instructions:
            "Does this repository itself use Cloudflare's Clef or Clef-flash decision model (calling @cf/cloudflare/clef on Workers AI, running the Clef weights, or supporting Clef as a named backend)? Merely mentioning Cloudflare, Jev, or decision models in general is not enough.",
        },
        category: {
          type: "choice",
          instructions: "Which directory category fits this project best?",
          criteria: Object.fromEntries(data.categories.filter((c) => c.id !== "official").map((c) => [c.id, c.blurb])),
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Workers AI ${res.status}`);
  const { result } = await res.json();
  return { uses: result.answers.uses_clef.noul, category: result.answers.category.choice, confidence: result.answers.category.confidence };
};
if (cfAccount && cfToken) {
  let failed = 0;
  for (const c of found.values()) {
    try {
      c.clef = await judge(c.repo);
    } catch (e) {
      if (++failed === 3) console.warn(`Clef judge disabled after errors: ${e.message}`);
      if (failed >= 3) break;
    }
  }
} else {
  console.warn("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_AI_TOKEN not set: skipping the Clef relevance check.");
}
const categoryOf = (c) => (c.clef && c.clef.confidence >= 0.5 ? c.clef.category : categorize(c.repo));
const clefNote = (c) => (c.clef ? `clef: uses ${c.clef.uses.toFixed(2)}, suggests ${c.clef.category} (${c.clef.confidence.toFixed(2)})` : null);

// Inclusion bar for automatic proposals. Everything still goes through PR review.
// - the description itself must say it is about Clef (not just a code hit in a big repo)
// - a real description and a non-trivial repo (size is in KB)
// - when Clef judged it, Clef must agree it really uses Clef
const qualifies = ({ repo: r, evidence, clef }) => {
  if (clef && clef.uses < 0.5) return false;
  if (!evidence.has("description") && !(clef && clef.uses >= 0.85)) return false;
  if (description(r).length < 20) return false;
  if (r.size < 20) return false;
  if (categorize(r) === "lists") return r.stargazers_count >= 5;
  return true;
};
const site = (r) => {
  const h = (r.homepage || "").trim();
  if (!/^https?:\/\//.test(h) || /github\.com|huggingface\.co\/Cloudflare|developers\.cloudflare\.com/i.test(h)) return null;
  return h;
};
const uniqueName = (r) => {
  const base = r.full_name.split("/")[1];
  const name = names.has(base) ? `${base} (${r.full_name.split("/")[0]})` : base;
  names.add(name);
  return name;
};

const rows = [...found.values()].sort((a, b) => b.repo.stargazers_count - a.repo.stargazers_count);
const line = (c) => {
  const r = c.repo;
  return `${qualifies(c) ? "+" : " "}${String(r.stargazers_count).padStart(6)}  ${r.full_name.padEnd(45)} ${(r.language || "-").padEnd(12)} ${categoryOf(c)}\n         ${description(r) || "(no description)"}\n         evidence: ${[...c.evidence, clefNote(c)].filter(Boolean).join("; ")}${site(r) ? `\n         ${site(r)}` : ""}`;
};

console.log(`${rows.length} candidates pushed since ${since} not yet listed:\n`);
for (const c of rows) console.log(line(c));
console.log(`\n${rows.filter(qualifies).length} pass the bar (+).`);

if (reportPath) {
  const md = (c) => {
    const r = c.repo;
    return `- [${r.full_name}](https://github.com/${r.full_name}) ★${r.stargazers_count} · ${r.language || "-"} · \`${categoryOf(c)}\` — ${description(r) || "_no description_"}  \n  evidence: ${[...c.evidence, clefNote(c)].filter(Boolean).join("; ")}`;
  };
  const yes = rows.filter(qualifies);
  const maybe = rows.filter((c) => !qualifies(c));
  writeFileSync(
    reportPath,
    `Nightly discovery for repos pushed since ${since}.\n\n` +
      `**Before merging:** open each repo and confirm it really uses Clef. Fix the category or description in \`data/projects.json\` if needed, and move false positives to \`data/exclude.json\`.\n\n` +
      `### Added in this PR (${yes.length})\n\n${yes.map(md).join("\n") || "_none_"}\n\n` +
      `### Needs a manual look, not added (${maybe.length})\n\nCode hits in larger repos, thin descriptions, or tiny repos. Add by hand if they genuinely support Clef.\n\n${maybe.map(md).join("\n") || "_none_"}\n`
  );
}

if (!add) process.exit(0);

const added = [];
for (const c of rows) {
  if (!qualifies(c)) continue;
  const r = c.repo;
  added.push({
    name: uniqueName(r),
    repo: r.full_name,
    site: site(r),
    description: description(r),
    category: categoryOf(c),
    language: r.language || null,
    stars: r.stargazers_count,
    added: today,
    created: r.created_at.slice(0, 10),
    pushed: r.pushed_at.slice(0, 10),
  });
}
if (added.length) {
  data.projects.push(...added);
  data.updated = today;
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}
console.log(`Added ${added.length} of ${rows.length} candidates (pushed since ${since}).`);
for (const p of added) console.log(`  + ${p.repo} [${p.category}] ★${p.stars}`);
