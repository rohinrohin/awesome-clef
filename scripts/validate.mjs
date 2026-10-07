#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const categories = new Set(data.categories.map((c) => c.id));
const errors = [];
const seen = new Map();
const url = /^https?:\/\/\S+$/;

data.projects.forEach((p, i) => {
  const where = `projects[${i}] ${p.name || p.repo || "(unnamed)"}`;
  if (!p.name || typeof p.name !== "string") errors.push(`${where}: name is required`);
  if (!categories.has(p.category)) errors.push(`${where}: unknown category "${p.category}"`);
  if (typeof p.description !== "string" || p.description.trim().length < 20) errors.push(`${where}: description must be at least 20 characters`);
  if (p.repo != null && !/^[\w.-]+\/[\w.-]+$/.test(p.repo)) errors.push(`${where}: repo must be owner/name, got "${p.repo}"`);
  for (const k of ["site", "url", "post"]) if (p[k] != null && !url.test(p[k])) errors.push(`${where}: ${k} must be an http(s) URL`);
  if (!p.repo && !p.site && !p.url) errors.push(`${where}: needs a repo, site, or url`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.added || "")) errors.push(`${where}: added must be YYYY-MM-DD`);
  if (p.stars != null && !Number.isInteger(p.stars)) errors.push(`${where}: stars must be an integer`);
  const key = (p.repo || p.url || p.site).toLowerCase();
  if (seen.has(key)) errors.push(`${where}: duplicate of ${seen.get(key)} (${key})`);
  else seen.set(key, where);
});

if (errors.length) {
  console.error(`data/projects.json: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`data/projects.json: ${data.projects.length} entries valid.`);
