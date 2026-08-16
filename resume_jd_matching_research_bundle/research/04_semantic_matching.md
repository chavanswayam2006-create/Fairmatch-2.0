# Semantic Matching & Embeddings for Resume–JD Similarity: Research Report

## 1. Executive Summary

Semantic matching for resume-to-JD retrieval has converged on a **two-stage architecture**: a bi-encoder (sentence-transformer) for fast candidate retrieval over millions of resumes, followed by a **cross-encoder reranker** (e.g., `ms-marco-MiniLM`, BGE reranker) on the top-K. State-of-the-art open embedding models (BGE-M3, E5-Mistral-7B, Nomic-Embed, Voyage, OpenAI `text-embedding-3-large`) now consistently top the [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard) with retrieval nDCG@10 in the 55–65 range, and small models like `all-MiniLM-L6-v2` (384-dim, 22M params) still deliver ~90% of the quality at <5% of the cost for short text. For HR-specific matching, fine-tuning a mid-size encoder (BGE-base or E5-base) on labeled resume-JD pairs plus a cross-encoder reranker, augmented with **LLM-as-judge** evaluation using GPT-4o/Claude for offline benchmarking, is the pragmatic sweet spot. Key risks include semantic-only scoring hiding demographic bias (name/school proxies leak into embeddings) and the lack of a public gold-standard resume-JD benchmark, requiring us to build an internal eval set.

---

## 2. Detailed Findings

### 2.1 Bi-encoder embedding models — the current landscape

The [MTEB benchmark](https://arxiv.org/abs/2210.07316) (Massive Text Embedding Benchmark, Muennighoff et al., 2022, updated continuously) is the de-facto evaluation suite covering 56+ tasks including retrieval, reranking, clustering, and STS. Key models relevant to resume-JD:

| Model | Params | Dim | MTEB Avg | Notes |
|---|---|---|---|---|
| `all-MiniLM-L6-v2` | 22M | 384 | ~56.3 | Ubiquitous baseline; extremely fast; 256-token max ([HF card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)) |
| `all-mpnet-base-v2` | 110M | 768 | ~57.8 | Higher quality bi-encoder, 384-token max |
| `BAAI/bge-small-en-v1.5` | 33M | 384 | ~62.2 | Strong retrieval; 512 tokens ([BGE paper](https://arxiv.org/abs/2309.07597)) |
| `BAAI/bge-base-en-v1.5` | 109M | 768 | ~63.5 | Best quality/cost sweet spot |
| `BAAI/bge-large-en-v1.5` | 335M | 1024 | ~64.2 | Marginal gain over base |
| `BAAI/bge-m3` | 568M | 1024 | ~66 | Multilingual + hybrid dense/sparse/colbert ([BGE-M3 paper](https://arxiv.org/abs/2402.03216)) |
| `intfloat/e5-base-v2` | 110M | 768 | ~61.5 | Requires "query:"/"passage:" prefixes ([E5 paper](https://arxiv.org/abs/2212.03533)) |
| `intfloat/e5-mistral-7b-instruct` | 7B | 4096 | ~66.6 | LLM-based; instruction-tunable but expensive ([paper](https://arxiv.org/abs/2401.00368)) |
| `hkunlp/instructor-xl` | 1.5B | 768 | ~61.8 | Task-instruction conditioned ([Instructor paper](https://arxiv.org/abs/2212.09741)) |
| `nomic-embed-text-v1.5` | 137M | 768 (Matryoshka) | ~62.3 | Open weights, 8K context ([Nomic blog](https://blog.nomic.ai/posts/nomic-embed-text-v1)) |
| OpenAI `text-embedding-3-small` | — | 1536 (adjustable) | ~62.3 | $0.02/1M tokens ([OpenAI announcement](https://openai.com/blog/new-embedding-models-and-api-updates)) |
| OpenAI `text-embedding-3-large` | — | 3072 | ~64.6 | $0.13/1M tokens |
| `voyage-3-large` | — | 1024 | ~65+ | Voyage AI, strong retrieval, $0.18/1M ([Voyage docs](https://docs.voyageai.com/docs/embeddings)) |
| Cohere `embed-v3.0` | — | 1024 | ~64.5 | Native multilingual + compressed int8/binary ([Cohere blog](https://cohere.com/blog/introducing-embed-v3)) |

The 2024–2025 trend: **Matryoshka Representation Learning** ([Kusupati et al., 2022](https://arxiv.org/abs/2205.13147)) is now standard (Nomic, OpenAI v3, Snowflake Arctic-Embed) — you can truncate a 1024-dim vector to 256 or 128 dims with modest quality loss (~1-3 nDCG points), cutting vector DB storage 4-8x.

### 2.2 Cross-encoder rerankers

Bi-encoders are lossy (single vector per doc). Cross-encoders jointly encode `[query, doc]` and produce a relevance score with much higher accuracy — but at ~100–1000x the latency per pair, so they're used to rerank top-K (typically K=50–200).

Key rerankers:
- **`cross-encoder/ms-marco-MiniLM-L-6-v2`** and `-L-12-v2` — trained on MS MARCO passage ranking; the standard baseline ([SBERT docs](https://www.sbert.net/docs/pretrained_cross-encoders.html)). Adds ~10-15 nDCG@10 points over bi-encoder alone on BEIR tasks.
- **`BAAI/bge-reranker-v2-m3`** — multilingual, top-tier open reranker ([HF](https://huggingface.co/BAAI/bge-reranker-v2-m3)).
- **`mixedbread-ai/mxbai-rerank-large-v1`** — competitive open weights ([blog](https://www.mixedbread.ai/blog/mxbai-rerank-v1)).
- **Cohere Rerank 3** — hosted API, $2.00/1K searches, exceptionally strong on long-context enterprise docs ([Cohere Rerank](https://cohere.com/rerank)).
- **Jina Reranker v2** — 278M params, multilingual, fast ([Jina](https://jina.ai/reranker/)).

Two-stage retrieve+rerank pipelines typically add **+8 to +20% nDCG@10** over dense retrieval alone on BEIR-like benchmarks ([BEIR paper](https://arxiv.org/abs/2104.08663)).

### 2.3 Domain-specific work on resume-JD matching

Published research is fragmented and often uses proprietary data:
- **JobBERT** ([Zbib et al., 2022](https://arxiv.org/abs/2109.09605)) — fine-tuned BERT on job posting corpora for occupation classification/ESCO linking; open weights on HF (`jjzha/jobbert-base-cased`).
- **ConFit** ([Yu et al., 2024](https://arxiv.org/abs/2401.16349)) — contrastive fine-tuning of encoders on resume-JD pairs; reports ~10-15% MRR improvement over off-the-shelf sentence-transformers.
- **Resume-Job Description Matching** ([Lavi et al., 2021](https://arxiv.org/abs/2106.13957)) — SBERT + entity extraction; baseline for skill-aware semantic scoring.
- **TalentCLEF 2024** ([talentclef.github.io](https://talentclef.github.io/)) — first shared task on multilingual skill matching; useful benchmark data.
- **ESCO/O*NET taxonomies** — the [ESCO API](https://esco.ec.europa.eu/en/use-esco/esco-api) and [O*NET](https://www.onetcenter.org/) provide standardized skill/occupation ontologies that anchor embeddings semantically and reduce spurious matches.

### 2.4 Fine-tuning embeddings for career text

Off-the-shelf general embeddings underweight occupational jargon ("SOX compliance," "MLOps," "RN-BSN"). Fine-tuning approaches:

1. **Contrastive fine-tuning with (resume, JD, label) triples** using MultipleNegativesRankingLoss or InfoNCE in [sentence-transformers](https://sbert.net/docs/sentence_transformer/training_overview.html). Needs ~5K–50K positive pairs.
2. **Hard-negative mining** — retrieve top-K non-matches with base model, filter, re-train. BGE-M3 and E5 papers show this is critical.
3. **GPL / synthetic queries** ([Wang et al., 2022](https://arxiv.org/abs/2112.07577)) — generate synthetic JDs from resumes with an LLM (as the [netsol/resume-score-details](https://huggingface.co/datasets/netsol/resume-score-details) dataset does with GPT-4o) then contrastively train.
4. **LoRA adapters** on E5/BGE — cheap (< $50 on a single A100), reversible.

### 2.5 LLM-as-judge for relevance scoring

Because gold labels are scarce, **LLM-as-judge** has become the standard offline eval technique ([Zheng et al. 2023, MT-Bench](https://arxiv.org/abs/2306.05685)). For our domain:
- Prompt GPT-4o / Claude 3.5 Sonnet with a JD, a resume, and a rubric (skills fit, experience level, domain overlap, must-haves). Ask for a 1–5 score + reasons.
- Correlation with human recruiter judgment reaches Spearman ρ ≈ 0.7–0.85 in similar retrieval-eval settings ([Judging LLM-as-a-judge](https://arxiv.org/abs/2306.05685)).
- Known biases: position bias, length bias, self-preference — mitigate with pairwise comparisons, randomized order, and multiple judges (GPT-4o + Claude ensemble).
- Costs: ~$0.005–0.02 per resume-JD judgment with GPT-4o-mini; feasible for eval sets of 1–10K pairs.

The [netsol/resume-score-details](https://huggingface.co/datasets/netsol/resume-score-details) dataset (1,031 GPT-4o-scored resume/JD pairs with macro/micro criteria) is a ready-made starting point for supervised fine-tuning or eval.

### 2.6 Open datasets

- **[Kaggle Resume Dataset (Snehaan Bhawal)](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset)** — 2,400+ resumes across 24 categories; useful for classification, not paired matching.
- **[Bright et al. Job Postings](https://www.kaggle.com/datasets/PromptCloudHQ/us-jobs-on-monstercom)** and LinkedIn scrapes — for JD-side pretraining.
- **[netsol/resume-score-details](https://huggingface.co/datasets/netsol/resume-score-details)** — 1,031 synthetic labeled pairs (2024).
- **[ESCO skills dataset](https://esco.ec.europa.eu/en/use-esco/download)** — 13K skills across languages; for skill-taxonomy grounding.
- **[TalentCLEF 2024/2025](https://talentclef.github.io/)** — multilingual job title matching.
- **BEIR** ([Thakur et al., 2021](https://arxiv.org/abs/2104.08663)) — general retrieval benchmark; use for sanity checks, not domain evaluation.
- **MTEB career/recruitment tasks** — limited but growing.

There is **no widely accepted public gold-standard resume↔JD relevance benchmark** akin to MS MARCO. Every serious vendor builds their own with recruiter labels.

### 2.7 Cost / quality / latency tradeoffs

Rough throughput (single A10G GPU, batch 32):
- `all-MiniLM-L6-v2`: ~14K sentences/sec, negligible cost
- `bge-base-en-v1.5`: ~3K sentences/sec
- `bge-large-en-v1.5`: ~1K sentences/sec
- `e5-mistral-7b`: ~50–100 sentences/sec, needs A100
- OpenAI `text-embedding-3-small`: API-bound, 3000 RPM default, $0.02/1M tokens
- Cross-encoder rerank on top-100 (`ms-marco-MiniLM-L-6-v2`): ~50 ms/query on GPU

Storage: 384-dim float32 = 1.5 KB/vec; 1M resumes = 1.5 GB. With int8 quantization (BGE, Cohere) → ~400 MB. Binary embeddings ([Cohere blog](https://cohere.com/blog/int8-binary-embeddings), 2024) → 48 MB with ~95% quality retention.

---

## 3. Recommended Approaches for OUR Product

### 3.1 Recommended architecture (two-stage + hybrid)

```
Resume/JD → chunker → 
  [Stage 0] BM25/keyword + skill-taxonomy overlap (ESCO)
  [Stage 1] Bi-encoder dense retrieval (BGE-base fine-tuned)  
  [Stage 2] Cross-encoder rerank (bge-reranker-v2-m3) on top 50
  [Stage 3] LLM explainer (GPT-4o-mini) generates rationale + skill gap
→ Composite score (weighted) → Bias audit layer → UI
```

### 3.2 Specific model choices

**Primary bi-encoder: `BAAI/bge-base-en-v1.5`, later fine-tuned.**
- Pros: 63.5 MTEB, 768-dim, 512-token context, Apache-2.0, no API dependency, well-supported.
- Cons: English-only; use `bge-m3` if we need multilingual.
- Alternative for MVP speed: `all-MiniLM-L6-v2` — 5–10x faster, ~5-7 pts lower on retrieval; ideal for prototyping and a "fast tier."

**Reranker: `BAAI/bge-reranker-v2-m3`** on top-50.
- Pros: Best open reranker; multilingual future-proofing; ~50 ms/pair on GPU.
- Cons: Latency; run only on top-K.
- Alternative: **Cohere Rerank 3** if we want zero-ops and can accept vendor cost (~$2/1K searches).

**Embedding API fallback: OpenAI `text-embedding-3-large` with `dimensions=1024`** — for tenants who prefer no self-hosted models.

**LLM-as-judge (offline eval only): GPT-4o + Claude 3.5 Sonnet ensemble** with pairwise ranking prompts + randomized position.

**Skill anchoring: ESCO + O*NET taxonomies.** Embed all ESCO skills once; at query time, extract skills from both resume and JD, compute a skill-vector-overlap score, and blend with semantic score. This dramatically reduces bias-inducing surface features (school name, prose style) contributing to the score.

### 3.3 Composite scoring recommendation

```
final_score = 0.45 * cross_encoder_rerank_score
            + 0.30 * skill_overlap_score (ESCO-anchored)
            + 0.15 * keyword/BM25_score
            + 0.10 * structured_match (years, seniority, location)
```
Weights should be tuned on our internal labeled set. The **explicit skill and structured components are critical for bias mitigation and explainability** — recruiters can see *why* a candidate matched, and legal can audit which signals drove decisions.

### 3.4 Fine-tuning plan

1. Bootstrap with `netsol/resume-score-details` (1,031 GPT-4o pairs) + LLM-generated synthetic pairs from our own resume corpus.
2. Get 2K–5K recruiter-labeled resume-JD pairs (thumbs up/down + optional 1-5 rating) via a review UI.
3. Fine-tune `bge-base-en-v1.5` with MultipleNegativesRankingLoss, hard-negative mining, 3–5 epochs, LoRA adapters. Expected lift: +5–10 nDCG@10 on internal eval.
4. Also fine-tune the reranker on triples (JD, positive resume, hard-negative resume).
5. Re-evaluate quarterly; watch for distribution drift (new roles, new skills).

### 3.5 Vector store

- **[Qdrant](https://qdrant.tech/)** or **[Weaviate](https://weaviate.io/)** for on-prem; both support hybrid (dense+sparse BM25), payload filtering (location, seniority), and int8 quantization.
- **pgvector** if we're staying in Postgres for simplicity (fine up to ~1M vectors with HNSW).
- Avoid Pinecone lock-in unless we need managed simplicity.

### 3.6 Bias considerations specific to embeddings

Semantic embeddings **encode socioeconomic and demographic signals** — university prestige, name origin, address ZIP, prose sophistication. Research shows embedding-based ranking can amplify historical bias ([De-Arteaga et al., 2019, "Bias in Bios"](https://arxiv.org/abs/1901.09451); [Wilson & Caliskan, 2024, on LLM name bias](https://arxiv.org/abs/2402.14875)). Mitigations we should build:
- **Redact PII (name, address, photo, graduation years, non-essential school info) before embedding** for the ranking pathway; keep original for display.
- **Counterfactual testing** — swap names/schools/genders and measure score deltas (per [Fairness Gym](https://github.com/google/ml-fairness-gym)).
- **Skill-anchored scoring blend** as above lowers pure-embedding contribution to final rank.
- Log all embedding→score contributions for audit.

---

## 4. Key Numbers & Facts Table

| Fact | Value | Source |
|---|---|---|
| `all-MiniLM-L6-v2` params / dim / max tokens | 22M / 384 / 256 | [HF card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) |
| `bge-base-en-v1.5` MTEB avg | ~63.5 | [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard) |
| `e5-mistral-7b-instruct` MTEB avg | ~66.6 | [E5-Mistral paper](https://arxiv.org/abs/2401.00368) |
| OpenAI text-embedding-3-small pricing | $0.02 / 1M tokens | [OpenAI](https://openai.com/blog/new-embedding-models-and-api-updates) |
| OpenAI text-embedding-3-large pricing | $0.13 / 1M tokens | [OpenAI](https://openai.com/blog/new-embedding-models-and-api-updates) |
| Cohere Rerank 3 pricing | $2.00 / 1K searches | [Cohere](https://cohere.com/rerank) |
| Cross-encoder rerank lift over dense alone | +8 to +20 nDCG@10 | [BEIR](https://arxiv.org/abs/2104.08663) |
| Matryoshka dim reduction quality loss (768→256) | ~1–3 nDCG pts | [Kusupati 2022](https://arxiv.org/abs/2205.13147) |
| Binary embedding storage reduction | ~32x with ~95% quality | [Cohere int8/binary blog](https://cohere.com/blog/int8-binary-embeddings) |
| netsol resume-score-details dataset size | 1,031 GPT-4o labeled pairs | [HF dataset](https://huggingface.co/datasets/netsol/resume-score-details) |
| LLM-as-judge correlation with humans (MT-Bench) | Spearman ~0.7–0.85 | [Zheng 2023](https://arxiv.org/abs/2306.05685) |
| ESCO skills taxonomy size | ~13,900 skills, multilingual | [ESCO](https://esco.ec.europa.eu/) |
| Typical bi-encoder throughput (MiniLM, A10G) | ~14K sentences/sec | SBERT benchmarks |

---

## 5. Open Questions / Risks / Gaps

1. **No public gold benchmark for resume-JD relevance.** We must invest in an internal labeled evaluation set (target: 2K–5K recruiter-labeled pairs across job families) before we can meaningfully compare model choices. Without this, all model claims are anecdotal.
2. **Bias leakage through embeddings.** Even redacted resumes still contain proxies (writing style, company prestige, immigration-linked phrasing). Do we need adversarial de-biasing (e.g., [INLP](https://arxiv.org/abs/2004.07667)) on our fine-tuned encoder? Trade-off: quality drops.
3. **Long-context handling.** Resumes commonly exceed 512 tokens. Should we (a) chunk by section (experience/skills/education) and pool max, (b) use long-context models like `bge-m3` (8K), `nomic-embed` (8K), or `voyage-3` (32K)? Chunk-and-pool tends to be more explainable but harder to tune.
4. **Multilingual roadmap.** If we serve EU/APAC, `bge-m3` or Cohere multilingual becomes mandatory; English-only choices lock us in.
5. **LLM-judge cost at scale.** Using GPT-4o for online scoring is prohibitive; keep LLM only for offline eval and top-K rationale generation.
6. **Vendor lock-in vs. control.** OpenAI/Cohere/Voyage APIs give quick wins but mean we cannot fully audit or fine-tune the embedding, which conflicts with our bias-audit product promise. Recommendation: self-host BGE for the auditable pathway, optionally offer OpenAI as a "fast tier" with a disclosure.
7. **Legal defensibility of semantic scores.** EEOC/NYC Local Law 144 and EU AI Act require explanations of automated employment decisions. Pure embedding cosine similarity is hard to defend; the composite score with explicit skill/structured components is much easier to justify.
8. **Distribution drift.** New job titles ("Prompt Engineer," "AI Safety Researcher") emerge fast; we need a re-training cadence and a "new skills" ingestion loop tied to ESCO extensions.
9. **Cross-encoder calibration.** Reranker scores are not probabilities; if we surface them to recruiters as percentages we must calibrate (Platt scaling / isotonic regression) on labeled data.
10. **Data licensing.** Kaggle/Monster resume datasets often have unclear commercial licenses — need clean-room review before training on them.