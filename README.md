# Awesome Clef [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> A curated list of projects, tools, SDKs, applications, experiments and resources built around [Cloudflare Clef](https://developers.cloudflare.com/workers-ai/models/clef/).

Site: **[awesomeclef.com](https://awesomeclef.com)** (searchable, with GitHub stars refreshed daily).

Clef and Clef-flash are Cloudflare's open-weight decision models. They take a state (text, JSON, images or video) plus a schema of typed questions (`noul`, `choice`, `score`) and return a probability for every allowed answer in one forward pass, without generating text. Workers AI ids `@cf/cloudflare/clef` (27B) and `@cf/cloudflare/clef-flash` (9B), weights on [Hugging Face](https://huggingface.co/Cloudflare/clef) under Apache 2.0, launched 2026-10-01 ([announcement](https://blog.cloudflare.com/clef-decision-models/)).

Community-maintained. Not affiliated with Cloudflare. A listing means a project meets the [inclusion rules](CONTRIBUTING.md#what-gets-listed), not that it has been reviewed for quality or security; read the code before you depend on it. To add a project, open a pull request or [file an issue](https://github.com/rohinrohin/awesome-clef/issues/new?template=submit-project.yml). See [CONTRIBUTING.md](CONTRIBUTING.md).

110 entries · last refreshed 2026-10-07

## Contents

- [Official](#official)
- [SDKs & integrations](#sdks-integrations)
- [Agents & tooling](#agents-tooling)
- [Browser & computer use](#browser-computer-use)
- [Applications](#applications)
- [Demos & playgrounds](#demos-playgrounds)
- [Benchmarks & evals](#benchmarks-evals)
- [Fine-tuning & RL](#fine-tuning-rl)
- [Self-hosting & inference](#self-hosting-inference)
- [Other lists](#other-lists)
- [Articles & tutorials](#articles-tutorials)
- [Contributing](#contributing)

## Official

Docs, weights, and announcements from Cloudflare.

- [Introducing Clef (launch post)](https://blog.cloudflare.com/clef-decision-models/) - Cloudflare's announcement of the Clef and Clef-flash open-weight decision models and the RL fine-tuning platform, with benchmark results.
- [Clef on Workers AI](https://developers.cloudflare.com/workers-ai/models/clef/) - Model page for @cf/cloudflare/clef, the 27B multimodal decision model: usage, input/output schema, context window, and pricing.
- [Clef-flash on Workers AI](https://developers.cloudflare.com/workers-ai/models/clef-flash/) - Model page for @cf/cloudflare/clef-flash, the fast 9B decision model: usage, schema, and pricing.
- [Clef weights](https://huggingface.co/Cloudflare/clef) - Open weights for Clef (27B) on Hugging Face, Apache 2.0 licensed.
- [Clef-flash weights](https://huggingface.co/Cloudflare/clef-flash) - Open weights for Clef-flash (9B) on Hugging Face, Apache 2.0 licensed.
- [Clef evals dashboard](https://clef-evals.workers-ai-mle.workers.dev) - Cloudflare's interactive results for Clef and Clef-flash across the evaluation suite from the launch post.
- [Clef RL fine-tuning interest form](https://www.cloudflare.com/resource/clef-rl-interest) - Sign-up for Cloudflare's reinforcement-learning fine-tuning service for Clef, delivered first through forward-deployed engineers.
- [langchain-cloudflare](https://github.com/cloudflare/langchain-cloudflare) - LangChain integrations for Cloudflare. Includes decision-model support for Clef and Clef-flash on Workers AI, with a notebook and Workers example.

## SDKs & integrations

Client libraries, framework integrations, and gateways with Clef support.

- [yoagent](https://github.com/yologdev/yoagent) ([site](https://yologdev.github.io/yoagent/)) - Rust agent loop with a decision module and a Workers integration, including a Clef worker example.
- [cc-router](https://github.com/finch-xu/cc-router) ([site](https://ccrouter.app)) - Desktop LLM gateway that aggregates provider quotas for Claude Code and similar tools; ships a Cloudflare Clef provider.
- [neurolink](https://github.com/juspay/neurolink) ([site](https://neurolink.ink)) - Multi-provider AI SDK with a Cloudflare Clef provider for calibrated decide() calls alongside generate and stream.
- [PSAICloudflareClef](https://github.com/dfinke/PSAICloudflareClef) - PowerShell module for Cloudflare Workers AI Clef typed decisions.
- [clef](https://github.com/luandro/clef) - Jev-compatible System One API proxy for clef and clef-flash, running on Cloudflare Workers.
- [clef-server](https://github.com/assb-lab/clef-server) - Inference server and Python client for Cloudflare Clef / Clef-Flash (Jev/SystemOne API).
- [n8n-nodes-system-one](https://github.com/diegohh0411/n8n-nodes-system-one) - N8n community node for System One decision models (Jev, Clef) via OpenRouter, TypeSafe, Cloudflare Workers AI, or any compatible endpoint.

## Agents & tooling

Routers, gates, MCP servers, and skills that put Clef inside coding agents and agent loops.

- [holon](https://github.com/holon-run/holon) ([site](https://holon.run)) - Agent workbench for ongoing work with a pluggable decision subsystem; Cloudflare Clef is its first decision backend.
- [claude-router](https://github.com/alexei-led/claude-router) - Claude Code plugin that auto-picks the right model for each turn — micro, low, medium, or high tier — using Jev/Clef routing.
- [ClefMCP](https://github.com/HighlyLoadedEgo/ClefMCP) ([site](https://www.npmjs.com/package/clef-mcp)) - Local MCP server exposing the Cloudflare Clef-Flash decision model to AI agents — structured decisions with probability outputs, fully offline via llama.cpp.
- [pi-model-router](https://github.com/alexei-led/pi-model-router) - Pi extension for four-tier model routing with budget controls and fallbacks; can use Cloudflare Clef as a routing advisor.
- [clef-router](https://github.com/Gjusev/clef-router) ([site](https://pypi.org/project/clef-router/)) - Route prompts between cheap and frontier LLMs with Cloudflare's Clef decision model. OpenAI-compatible proxy + library.
- [clef-model-router](https://github.com/AbelNavarro/clef-model-router) - Claude Code mod that uses Cloudflare Clef to automatically select the model and reasoning effort for each turn.
- [odds](https://github.com/acoyfellow/odds) ([site](https://odds.coey.dev)) - Ask for odds, not prose. Clef decision models in Pi codemode through your own authenticated AI Gateway.
- [building-with-decision-models](https://github.com/aaddrick/building-with-decision-models) - Unofficial skill for building with decision models (Jev, Clef, pplx-decider, ai_decide, Ollama): typed decisions, calibrated confidence, provider differences, and prior art sorted by implementation shape.
- [clef-gate](https://github.com/dwain-barnes/clef-gate) - Claude Code mod: asks a local Clef decision model whether a tool call or subagent is needed before paying for it.
- [clef-model-router (dwain-barnes)](https://github.com/dwain-barnes/clef-model-router) - Claude Code mod that routes each turn to the cheapest sufficient model with Clef; fork adding a fully local backend (llama-server, Ollama).
- [clef-screen-triage](https://github.com/sakamoto-sann/clef-screen-triage) - Codex skill that hands screen-state checks to Clef-flash, with a Japanese guide and evaluation notes.
- [jev-mcp](https://github.com/drmedia/jev-mcp) - MCP server for decision models with TypeSafe Jev, Cloudflare Clef, OpenRouter, and local providers.
- [judge-clef](https://github.com/nicolasmertens/judge-clef) - Tells you when to /compact: exact Claude Code context size per turn plus a Cloudflare Clef judgment of whether now is a good moment.
- [llama-cot-sentinel](https://github.com/u9401066/llama-cot-sentinel) - Step-checked chain of thought for llama-server: a decision model (Clef-Flash) reviews every reasoning step and steers with rollback or reflection.
- [openwebui-jev-model-router](https://github.com/gianlucaravior/openwebui-jev-model-router) - Routes Open WebUI requests to configured chat models using Cloudflare JEV or Clef. Model selection considers model descriptions, capabilities, context profiles, tools and Voice Mode.
- [pi-auto-router](https://github.com/lucasamonrc/pi-auto-router) - An Auto model for pi: classifies each prompt with Cloudflare Clef (or TypeSafe Jev) and routes it to the best-fitting model you have.
- [pi-magic8ball](https://github.com/neruok/pi-magic8ball) - Advisory choices for Pi with a neutral context builder and Jev or Clef classifiers.
- [pi-safely](https://github.com/dcowsill/pi-safely) - Claude Code-style auto mode for pi, gated by System One decision models (Cloudflare Clef via OpenRouter, or TypeSafe Jev).
- [pi-system-one](https://github.com/mastnacek/pi-system-one) - System One intelligent classifier router, tool dispatcher, and JEV/Clef decision engine for Pi coding agent.
- [pointsman](https://github.com/jadeonstudio/pointsman) - Typed decisions and bounded evidence workflows for agents via MCP, CLI and JS; Jev/Laya runtime adapters and reproducible local Laya/Clef evaluation.
- [skills-cloudflare-clef](https://github.com/lyhu/skills-cloudflare-clef) - Agent skill for local Cloudflare Clef typed decisions, with classic datasets and live browser benchmarks.

## Browser & computer use

Browser, desktop, and mobile automation with Clef choosing the action.

- [clef-browser](https://github.com/zachsents/clef-browser) - Drive your own logged-in Chrome with Cloudflare's Clef decision model — CLI + MCP server + Chrome extension bridge.
- [multi-modal-jev-browser](https://github.com/foklepoint/multi-modal-jev-browser) - A browser agent where a small decision model (Jev, Clef) picks each action and a vision LLM steps in only when it is unsure. CLI, library and MCP server.
- [veil](https://github.com/force416/veil) - Chrome extension that hides X / Twitter replies matching a natural-language condition, judged by Cloudflare Clef.

## Applications

Products, services, and pipelines that call Clef.

- [jev-search](https://github.com/superagents-lab/jev-search) ([site](https://jev.s1.dev)) - Web search with decision models for source selection, query understanding, and relevance ranking; supports choosing Clef as the model.
- [ry](https://github.com/ygwyg/ry) ([site](https://route-yes-example.burcs.workers.dev)) - Ry stands for route yes: an AI router for 404s, powered by Cloudflare Clef.
- [awesome-x](https://github.com/RadRebelSam/awesome-x) ([site](https://awesomex.radrebeldeveloper.com)) - Awesome lists that maintain themselves. Crawls GitHub and npm, has a decision model (Cloudflare Clef or Jev) judge each candidate against one sentence you write, then publishes the README and site. No dependencies.
- [clef-compactor](https://github.com/Gjusev/clef-compactor) - Query-aware RAG context compaction with Cloudflare Clef: keep the evidence, cut noisy retrieval context.
- [ai-code-review-agent](https://github.com/akshatdodhiya/ai-code-review-agent) ([site](https://cloudflare-code-reviewer.akshat-codes.workers.dev)) - Automated pull-request review agent on Cloudflare Workers: 7-pillar security pipeline, a Clef decision gate, and a multi-model review committee - running entirely on the free tier. Built during ClawBuilders S1:E5.
- [cf-pr-reviewer](https://github.com/kravchuk-ivan/cf-pr-reviewer) - Automated GitHub PR reviewer on Cloudflare Workers: Clef triage, multi-model review committee, inline one-click suggestions.
- [clef (NikhileshThiru)](https://github.com/NikhileshThiru/clef) ([site](https://nikhileshthiru.pages.dev)) - Homelab decision engine running Clef-flash (GGUF) on a 6 GB laptop GPU to triage Gmail, filter news, and watch job boards.
- [clef-rag](https://github.com/MersivMedia/clef-rag) - Clef-steered ingestion and retrieval for any vector database: Cloudflare Workers AI, self-hosted, or local Clef / Clef-flash weights.
- [clef-theft-detection](https://github.com/Yz613/clef-theft-detection) - Grocery checkout-loss shrink detection service using Cloudflare Clef (@cf/cloudflare/clef).
- [cloudflare-compliance-reviewer](https://github.com/Clawbuilders/cloudflare-compliance-reviewer) - ClawBuilders S1:E6: a policy-as-code agent committee for GitHub PRs on Cloudflare (Agents SDK, Workflows, R2, Workers AI + Clef, Regorus).
- [compliance-preview-auditor](https://github.com/Clawbuilders/compliance-preview-auditor) - ClawBuilders S1:E6 bonus: audit a live preview URL with Cloudflare Browser Rendering — axe-core, third parties before consent, and Clef vision.
- [er-decision-support](https://github.com/zalomea/er-decision-support) - CPU-only research prototype for emergency-department triage support, pairing a small web UI and typed API with a local Clef-flash GGUF model.
- [LegalClefs](https://github.com/omaxito/LegalClefs) - Legal Clefs turns immigration case files into targeted research across French administrative case law. It combines an LLM for legal issue decomposition with Cloudflare’s Clef decision model to classify court decisions at scale and surface arguments, counterarguments, and matching precedents.
- [quant-decision-engine](https://github.com/zinxer/quant-decision-engine) - Regex reads words, decision models read meaning: a Go reference implementation that gates crypto news signals with Cloudflare's open-weight Clef-flash decision model.
- [sim4options](https://github.com/jstdlee/sim4options) - Options Quest: learn options trading one decision at a time, with Kon the fox. Vue + Cloudflare Workers, D1, Workers AI (Clef).

## Demos & playgrounds

Playgrounds, games, and small experiments you can run.

- [clef-webcam](https://github.com/lucataco/clef-webcam) - Run Cloudflare's clef-flash decision model locally on your webcam.
- [clef-pictionary](https://github.com/jillesme/clef-pictionary) - Pictionary where Clef (a decision model on Workers AI) guesses your drawing live.
- [blind-earth-clef-jev](https://github.com/dylanler/blind-earth-clef-jev) - Blind-Earth land/water maps with Cloudflare Clef / Clef-flash and TypeSafe Jev (System One choice).
- [bot-club](https://github.com/jackdnl/bot-club) - A playful AI nightclub. Cloudflare Clef-flash decides who gets in, live.
- [clef-airy](https://github.com/ajdunn2/clef-airy) - Mac/Win Electron app for testing Jev, System One, and similar decision APIs inc. local models like Clef with Ollama. Build requests using forms or JSON and explore structured responses. Made with NativePHP.
- [clef-demo](https://github.com/tehtommeh/clef-demo) - Demo of CloudFlare's Clef decision model https://huggingface.co/Cloudflare/clef-flash.
- [clef-playground](https://github.com/szerintedmi/clef-playground) - Local playground for Cloudflare's Clef decision models (clef / clef-flash): edit state, images and questions; see probabilities, latency and cost.
- [clef-playground (JordanDalton)](https://github.com/JordanDalton/clef-playground) - Playground for Cloudflare's Clef decision models: typed questions, images, latency and cost.
- [clef-playground (sw30labs)](https://github.com/sw30labs/clef-playground) - Run Cloudflare Clef locally on Apple Silicon with an MLX playground, typed decisions, and a SystemOne-compatible API.
- [clefcam](https://github.com/tmchow/clefcam) - A camera that follows your rules, powered by Cloudflare Clef Flash.
- [heist](https://github.com/acoyfellow/heist) ([site](https://heist.coey.dev)) - A prompt injection game: get VaultBot, Meta's Llama 3.3 70B on Workers AI, to leak a vault code while Cloudflare Clef scores your message below 0.5.
- [ours-privacy-demo](https://github.com/jhomra21/ours-privacy-demo) - Synthetic healthcare consent regression demo with browser evidence and optional Cloudflare Clef assessments.

## Benchmarks & evals

Benchmarks, evaluations, and head-to-head comparisons.

- [Jev Decision Index](https://huggingface.co/spaces/multimodalart/jev-decision-index) - Hugging Face Space leaderboard comparing decision models, including Clef and Clef-flash, cited in Cloudflare's launch post.
- [clef-evals](https://github.com/Gjusev/clef-evals) ([site](https://pypi.org/project/clef-evals/)) - Calibration-first evaluation toolkit for Cloudflare's Clef decision models. Judge cheap, audit confidence.
- [admission-decision-eval](https://github.com/nicia-ai/admission-decision-eval) - Decision models on a knowledge-base write-admission task: Jev, Clef, Clef-flash.
- [benchessmark](https://github.com/ickas/benchessmark) - Chess as a benchmark for decision models: Jev vs Clef, graded by Stockfish, with a replay viewer and video export.
- [blackbox](https://github.com/acoyfellow/blackbox) ([site](https://blackbox.coey.dev)) - Replay a Pi agent log as a timeline and see which step the Clef model scores as the fault.
- [decision-map-bench](https://github.com/move38studios/decision-map-bench) - How well do decision models know geography? Jev, Clef, Clef-flash and Laya on a 2° world grid.
- [decision-model-benchmarks](https://github.com/asopitech-publishing/decision-model-benchmarks) - Reproducible Strands, Clef, laya, and Jev decision-model benchmarks.
- [jev-clef-experiments](https://github.com/edumntg/jev-clef-experiments) - Clef and Jev (System One decision models) driving simulators: cart-pole, double pendulum, Super Mario Bros from pixels.
- [jev-vs-clef](https://github.com/rmax-ai/jev-vs-clef) - Head-to-head stress comparison of Jev (TypeSafe System One) vs Cloudflare Clef / Clef-flash decision models — launch-week 159-call battery, harness, and raw evidence.
- [local-decision](https://github.com/mthomas100/local-decision) - Run Cloudflare's Clef decision models locally on Apple Silicon (llama.cpp + MLX), with a calibrated, machine-truth benchmark.
- [mobile-mcp-navigation-benchmark](https://github.com/guhcostan/mobile-mcp-navigation-benchmark) - Local paired benchmark: Luna vs CLEF-Flash for iOS navigation through Mobile MCP.
- [system-one-security](https://github.com/ankushchadha/system-one-security) - Rerunnable security experiments on System One decision models (TypeSafe Jev, Cloudflare Clef): state poisoning, prompt injection, truncation, and guard questions.
- [system1-decision-benchmark](https://github.com/Sj0605-DataSci/system1-decision-benchmark) - Common-ground benchmark of 50 System-1 decision models (Jev, Clef, Kev, Nimble, Tev1 vs embeddings, rerankers, NLI, prompted LLMs) on 22 datasets.
- [system1-rerank-bench](https://github.com/dchristopoulos/system1-rerank-bench) - Do System 1 decision models work as RAG rerankers? Jev, Clef-flash and Laya vs an LLM and six open rerankers on BEIR, with paired confidence intervals.

## Fine-tuning & RL

Training, fine-tuning, and quantization recipes for Clef weights.

- [unsloth](https://github.com/unslothai/unsloth) ([site](https://unsloth.ai/docs)) - Local UI and library to run and train LLMs; includes Clef model support and a Clef training benchmark script.
- [clef-finetune](https://github.com/MersivMedia/clef-finetune) - Fine-tune Cloudflare's open-source Clef / Clef-flash decision models (LoRA + joint schema head) for vertical decisions like insurance claims and compliance.
- [clef-finetuning](https://github.com/upendrasingh1/clef-finetuning) - Fine-tuning Cloudflare Clef decision models on a 12 GB GPU for real-time entity resolution, with Hugging Face TRL comparisons.
- [clef-snake-quantization](https://github.com/cameronbergh/clef-snake-quantization) - Less Precision, Better Decisions? An exploratory CLEF-Flash backbone quantization study on Snake.
- [jev-smol](https://github.com/DanielMcSheehy/jev-smol) - Embedded text+image decision model with a Jev/CLEF System One API, built on SmolVLM2-500M: data pipelines, synthetic generators, LoRA training, eval harness.
- [stackcraft](https://github.com/kkarimi/stackcraft) - A reproducible Clef-flash fine-tuning study with a playable falling-block game, paired evaluation, and tutorials.

## Self-hosting & inference

Run the open Clef weights on your own hardware.

- [ollama](https://github.com/ollama/ollama) ([site](https://ollama.com)) - Run open models locally; includes Clef model support in its runners.
- [Rapid-MLX](https://github.com/raullenchai/Rapid-MLX) ([site](https://rapidmlx.com)) - OpenAI-compatible inference server for Apple Silicon built on MLX, with System One support for the Clef family.
- [simple-jev](https://github.com/featherless-ai/simple-jev) - Turn open models into a Jev-style classifier endpoint; includes a Hugging Face server for Clef.
- [coreai-model-zoo](https://github.com/john-rocky/coreai-model-zoo) ([site](https://john-rocky.github.io/coreai-model-zoo/)) - Models and conversion recipes for Apple's Core AI on iPhone and Mac, including a Clef-flash port.
- [vllm-jev](https://github.com/mode-io/vllm-jev) - Native vLLM serving for Jev-style decision models, with Clef support and export.
- [convert](https://github.com/ggml-org/convert) ([site](https://huggingface.co/ggml-org)) - Scripts to convert models to GGUF, with recipes for Clef and Clef-flash.
- [cleffa](https://github.com/zknpr/cleffa) - Native C11 + Metal inference engine for Cloudflare Clef and Clef-Flash on Apple Silicon (BF16, Jev/SystemOne API). Built after ds4.
- [open-jevlike-infer](https://github.com/Arcobalneo/open-jevlike-infer) ([site](https://huggingface.co/Cloudflare/clef-flash)) - Production inference server for open Jev-like decision models (Jev/SystemOne /v1/systemone). Clef-Flash on vLLM: 45 ms p50, 2x throughput, verified against the reference.
- [clef-flash](https://github.com/irr/clef-flash) - Local Jev/System One server for Cloudflare/clef-flash — 9B multimodal decision model, one forward pass per request.
- [Clef-flash GGUF](https://huggingface.co/ggml-org/Clef-Flash-GGUF) - GGUF quantizations of Clef-flash from ggml-org for llama.cpp and other local runtimes.
- [clef-flash-api](https://github.com/iwaitu/clef-flash-api) ([site](https://hub.docker.com/r/iwaitu/clef-flash-api)) - Resident Clef Flash NVFP4 structured decision API with Docker deployment.
- [clef-flash-local](https://github.com/turlockmike/clef-flash-local) - Run Cloudflare's Clef-Flash decision model locally on a 16 GB GPU: FP8 + compiled, micro-batched /v1/systemone (Jev/SystemOne API) with Ollama pass-through.
- [clef-flash-snap](https://github.com/canonical/clef-flash-snap) ([site](https://snapcraft.io/clef-flash)) - Snap package for local inference with Clef-flash.
- [clef-flash-vllm-fp8](https://github.com/cryguy/clef-flash-vllm-fp8) - Cloudflare Clef-Flash on vLLM on one 24 GB GPU: a /v1/systemone server with an FP8 recipe that keeps its Decision Index score.
- [clef-hrx](https://github.com/zacharydenton/clef-hrx) - Local Cloudflare CLEF inference on AMD Strix Halo, written in Rust and Loom.
- [clef-lcv](https://github.com/BlueFinLab-ai/clef-lcv) - Self-hosted portal and API for Cloudflare's Clef decision models on a single NVIDIA GPU.
- [jevjam](https://github.com/beremaran/jevjam) - Self-hosted MCP server and Jev-compatible HTTP API for small decision models (Laya, Julia-1, clef-flash) on one GPU, in Docker.
- [rverdict](https://github.com/sepatel/rverdict) - A native Rust decision engine in the "System One" family (Jev, Strands Decider, Von, Laya, Clef).

## Other lists

Related curated lists.

- [awesome-decision-models](https://github.com/AnotiaWang/awesome-decision-models) ([site](https://anotiawang.github.io/awesome-decision-models/)) - A curated list of decision models (System One / typed decision models): hosted APIs, open-weight models, runtimes, SDKs, applications, benchmarks, and papers.

## Articles & tutorials

Write-ups, explainers, and discussion.

- [Hacker News discussion](https://news.ycombinator.com/item?id=49923692) - Hacker News thread on the Clef launch post.
- [A deep dive into Clef, Cloudflare's decision model](https://flaviocopes.com/clef/) - Flavio Copes walks through what Clef is, how typed questions work, and how to call it.
- [Cloudflare Clef: Jev-compatible, benchmarked and priced](https://www.developersdigest.tech/blog/cloudflare-clef-decision-models-2026) - Developers Digest summary of Clef's API compatibility, benchmark results, latency, and pricing.
- [Jev vs Clef on a warranty-returns desk](https://warike.tech/blog/jev-vs-clef-decision-models) - Write-up comparing Jev and Clef on the same policy in a Go warranty-returns service (code: warike/warranty-returns).
- [Cloudflare says Clef means humans no longer need to be in the loop](https://the-decoder.com/cloudflare-says-its-new-clef-model-means-humans-no-longer-need-to-be-in-the-loop-for-ai-agents/) - The Decoder's news coverage of the Clef launch and Cloudflare's agent claims.

## Contributing

Pull requests welcome. Edit `data/projects.json` (it drives both this README and the site) and run `npm run validate`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the entry format and inclusion criteria.

## License

[CC0 1.0](LICENSE). Forked from [awesome-jev](https://github.com/hellogumbo/awesome-jev) (also CC0). Linked projects, names and trademarks belong to their owners.
