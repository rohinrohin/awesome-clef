const rx = (...parts) => new RegExp(parts.join("|"), "i");

const LIST = rx("awesome", "curated list", "curated index", "directory of");
const SDK = rx("(?<!ai-)\\bsdk\\b", "\\bclient\\b", "client for", "library for", "\\bmodule\\b", "wrapper", "\\bproxy\\b", "langchain", "llamaindex", "litellm", "gateway", "provider");
const SELFHOST = rx("self-?host", "\\blocal(ly)?\\b", "inference", "\\bvllm\\b", "llama\\.cpp", "\\bgguf\\b", "\\bmlx\\b", "apple silicon", "metal", "\\bgpu\\b", "docker", "\\bserver\\b", "nvfp4", "\\bfp8\\b", "strix", "\\bsnap\\b");
const FINETUNE = rx("fine-?tun", "\\blora\\b", "\\btrain", "\\brl\\b", "reinforcement", "quantiz", "distill");
const BROWSER = rx("browser", "computer.?use", "playwright", "chrome", "(chrome|firefox|safari|web) extension", "android", "\\bios\\b", "\\bdom\\b");
const AGENT = rx("\\bmcp\\b", "\\bpi\\b", "claude code", "codex", "opencode", "coding agent", "agent skill", "\\bskill", "tool.?call", "guardrail", "\\bgate\\b", "router", "routing", "\\bhook\\b", "harness", "cursor", "agents?\\b");
const RESEARCH = rx("benchmark", "\\bbench\\b", "\\beval", "\\bstudy\\b", "research", "calibrat", "comparison", "\\bvs\\b", "head-to-head", "experiment");
const DEMO = rx("playground", "\\bdemo", "\\bgame\\b", "webcam", "camera", "\\btry\\b", "showcase", "starter", "\\bpoc\\b", "proof of concept");

export function categorize(repo) {
  const fullName = repo.full_name || repo.repo || "";
  if (/^cloudflare\//i.test(fullName)) return "official";
  const text = `${fullName} ${repo.description || ""} ${(repo.topics || []).join(" ")}`;
  if (LIST.test(text)) return "lists";
  if (FINETUNE.test(text)) return "finetuning";
  if (RESEARCH.test(text) && !/\bmcp server\b/i.test(text)) return "research";
  if (BROWSER.test(text)) return "browser";
  if (AGENT.test(text)) return "agents";
  if (SDK.test(text)) return "sdks";
  if (SELFHOST.test(text)) return "selfhost";
  if (DEMO.test(text) || repo.homepage) return "demos";
  return "apps";
}

// A repo is relevant only with a Clef-specific signal. "clef" alone is a music term,
// so it must appear next to Cloudflare / decision-model context, or as a model id.
export const RELEVANT = /(@cf\/cloudflare\/clef|cloudflare\/clef|clef-flash|cloudflare'?s? clef|clef (decision|model)|\bclef\b.*\b(cloudflare|workers ai|decision model|systemone|system one|jev)\b|\b(cloudflare|workers ai|decision model|systemone|system one|jev)\b.*\bclef\b)/i;
export const CLEF_LAUNCH = "2026-10-01";
