# Keyword-Based Matching Methods for Resume/JD Matching Engines

## 1. Executive Summary

Keyword-based matching remains the backbone of virtually every commercial Applicant Tracking System (ATS) and is a required baseline layer in any modern resume/JD matching engine, even when semantic embeddings are used on top. The state-of-the-art in 2024–2026 is **hybrid retrieval**: sparse lexical scoring (BM25, TF-IDF, or learned sparse models like SPLADE) fused with dense embedding similarity, gated by structured skill extraction (KeyBERT, spaCy, or LLM-based extractors). Pure keyword matching is fast, explainable, and legally defensible, but suffers from vocabulary mismatch, gaming (keyword stuffing), and bias amplification when JDs contain culturally loaded terms. For our product, we recommend a three-layer scoring architecture: (1) hard filter on must-have skills via normalized skill taxonomy, (2) BM25 over a skill-weighted field-structured index (Elasticsearch/OpenSearch), and (3) dense semantic re-ranking — with the final score exposed as a weighted, explainable breakdown to satisfy both recruiters and bias-audit requirements.

## 2. Detailed Findings

### 2.1 Classical Sparse Scoring: TF-IDF and BM25

**TF-IDF** weights terms by term frequency times inverse document frequency, giving high weight to terms rare in the corpus but frequent in a document. It's the historical baseline for resume matching and still widely used because it's cheap, deterministic, and explainable ([scikit-learn TfidfVectorizer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html)).

**BM25 (Best Matching 25)** is a probabilistic refinement that adds (a) term-frequency saturation via the `k1` parameter (default ~1.2–2.0) and (b) length normalization via `b` (default 0.75), preventing long documents from dominating and preventing repeated keywords from linearly boosting scores ([Elastic BM25 similarity docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html)). BM25 consistently beats TF-IDF on IR benchmarks like MS MARCO and BEIR and is the default in Elasticsearch, OpenSearch, and Lucene ([BEIR benchmark, Thakur et al., 2021](https://arxiv.org/abs/2104.08663)).

For resume/JD matching, **BM25F** (fielded BM25) is particularly relevant — it allows different weights per field (skills, job title, experience, education), so a keyword hit in the "skills" field can be weighted 3× a hit in "hobbies" ([BM25F original paper, Robertson et al.](https://www.microsoft.com/en-us/research/publication/simple-bm25-extension-to-multiple-weighted-fields/)).

**Learned sparse retrieval** (SPLADE, uniCOIL) is a 2022+ direction that produces BM25-compatible sparse vectors from transformers, offering semantic expansion while retaining inverted-index efficiency and explainability ([SPLADE v2, Formal et al., 2022](https://arxiv.org/abs/2109.10086)).

### 2.2 Keyphrase Extraction Methods

Extracting the right *keywords* from resumes and JDs is often more important than the scoring function itself. Comparative studies from 2022 evaluated nine algorithms including statistical (TF-IDF, Log-Likelihood, Chi-square), hybrid (RAKE, YAKE, Topia), graph-based (TextRank), and neural (KeyBERT) approaches ([Terra Linguistica, 2022](https://human.spbstu.ru/en/article/2022.50.02)).

- **RAKE (Rapid Automatic Keyword Extraction)**: unsupervised, uses stop-word delimited candidate phrases scored by word co-occurrence degree/frequency. Fast, no training, but noisy on short JDs ([rake-nltk](https://github.com/csurfer/rake-nltk)).
- **YAKE!**: unsupervised, statistical, language-agnostic, works well on short documents — good fit for job posts. Uses features like term casing, position, and relatedness to context ([YAKE GitHub](https://github.com/LIAAD/yake)).
- **TextRank**: graph-based PageRank over word co-occurrence graph; solid baseline in spaCy via `pytextrank` ([pytextrank](https://github.com/DerwenAI/pytextrank)).
- **KeyBERT**: embeds the document with a sentence transformer (default `all-MiniLM-L6-v2`), embeds candidate n-grams, ranks by cosine similarity. Supports MMR (Maximal Marginal Relevance) for diversity — the Nexus resume-matching framework specifically recommends `MMR=True, diversity=0.4` for JD keyword extraction ([Nexus, 2026](https://www.sciencedirect.com/science/article/pii/S1877050926018041); [KeyBERT docs](https://maartengr.github.io/KeyBERT/)).
- **spaCy + PhraseMatcher / EntityRuler**: rule-based extraction against a curated skill lexicon — highest precision when the skill taxonomy is well-maintained ([spaCy Matcher](https://spacy.io/usage/rule-based-matching)).
- **LLM-based extraction** (GPT-4o, Claude, Llama-3): highest recall on implicit skills ("built REST APIs" → "REST", "API design") but costly and non-deterministic; increasingly used with structured output (JSON schema).

Recent resume-matching systems typically **combine** approaches: spaCy/EntityRuler over a canonical skill ontology (ESCO, O*NET, EMSI/Lightcast) for known skills, plus KeyBERT for open-ended discovery ([ESCO skills taxonomy](https://esco.ec.europa.eu/en/classification/skill_main), [O*NET](https://www.onetonline.org/)).

### 2.3 Boolean and Keyword Search in ATS

Commercial ATSs (Workday, Greenhouse, Taleo, iCIMS, Lever) still lean heavily on Boolean search (`"Python" AND ("AWS" OR "GCP") AND NOT "intern"`) as the primary recruiter tool. ATS "resume scores" are typically weighted keyword overlap between the JD skills list and the resume text, penalized by formatting issues (tables, images, columns break parsers) ([Avua: Resume Score vs ATS Score, 2026](https://blogs.avua.com/comparison/resume-score-vs-ats-score); [Jobscan ATS resume guide](https://www.jobscan.co/blog/ats-resume/)). This creates well-documented gaming behavior — candidates stuff white keywords or copy JD phrases verbatim, which our bias-detection layer needs to flag.

### 2.4 Hybrid Keyword + Semantic Scoring

The dominant 2023–2026 pattern is **hybrid retrieval**: run BM25 and dense retrieval in parallel, then fuse.

**Fusion strategies:**
- **Reciprocal Rank Fusion (RRF)**: `score(d) = Σ 1/(k + rank_i(d))` with `k=60` typical. Parameter-free, robust, now built into Elasticsearch, OpenSearch, Weaviate, Qdrant ([RRF, Cormack et al., 2009](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf); [Elasticsearch RRF docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html)).
- **Convex combination**: `final = α · norm(BM25) + (1-α) · cosine(dense)`, with α tuned on held-out matches (typically α=0.3–0.5 favors dense).
- **Cross-encoder re-ranking**: retrieve top-K (K=50–200) with hybrid, re-rank with a cross-encoder like `ms-marco-MiniLM-L-12-v2` or `bge-reranker-v2-m3` ([BGE reranker](https://huggingface.co/BAAI/bge-reranker-v2-m3)).

The Nexus framework (2026) uses a dual BERT + Sentence-BERT design layered atop keyword extraction, demonstrating that semantic layers give the biggest lift on paraphrased skills ("ML" ↔ "machine learning", "cloud" ↔ "AWS/GCP/Azure") ([Nexus, 2026](https://www.sciencedirect.com/science/article/pii/S1877050926018041)).

### 2.5 Weighting Required vs Nice-to-Have Skills

JDs almost always separate "required" from "preferred" skills, but this structure is usually lost in downstream matching. Best practice:

1. **JD segmentation** with an LLM or classifier into `required_skills`, `preferred_skills`, `responsibilities`, `qualifications`.
2. **Two-stage scoring**: hard filter on required skills (candidate must have ≥ X% of must-haves), then soft scoring on preferred.
3. **Score formula** commonly used in industry:

```
match_score = w_req · (matched_required / total_required)
            + w_pref · (matched_preferred / total_preferred)
            + w_sem · semantic_similarity(resume, jd)
            + w_exp · experience_alignment
            + w_edu · education_alignment
```

Typical weights: `w_req=0.45, w_pref=0.20, w_sem=0.20, w_exp=0.10, w_edu=0.05`, but these must be tuned per role family. LinkedIn's Recruiter and Eightfold expose similar weighted breakdowns to recruiters ([Eightfold Talent Intelligence](https://eightfold.ai/products/talent-intelligence/)).

### 2.6 Strengths and Weaknesses of Keyword Matching

**Strengths:**
- **Explainability**: recruiters see exactly which terms matched — critical for EEOC/GDPR/EU AI Act compliance ([EU AI Act, high-risk HR systems](https://artificialintelligenceact.eu/)).
- **Speed**: inverted-index lookups over millions of resumes in milliseconds.
- **Precision on jargon**: exact matches for "Kubernetes", "HIPAA", "CFA Level II" are unambiguous.
- **Auditability**: deterministic, reproducible, easy to unit-test.

**Weaknesses:**
- **Vocabulary mismatch / synonymy**: "RN" vs "Registered Nurse", "JS" vs "JavaScript" — mitigated with synonym expansion or embeddings.
- **No context**: "managed Python developers" ≠ "wrote Python code".
- **Keyword stuffing / gaming**: white-text keyword injection is a documented adversarial pattern.
- **Bias amplification**: JD terms like "rockstar", "digital native", "recent graduate" carry demographic signal; strict keyword matching propagates these ([Gaucher et al., 2011 on gendered wording](https://gap.hks.harvard.edu/evidence-gendered-wording-job-advertisements-exists-and-sustains-gender-inequality); [Textio research on inclusive language](https://textio.com/)).
- **Sparse resumes penalized**: candidates who describe achievements narratively (common among some demographics) score lower than those who list buzzword-dense bullet points.

### 2.7 Datasets and Benchmarks

- **BEIR** (heterogeneous IR benchmark, includes zero-shot BM25 baselines) — useful for calibrating hybrid retrieval ([BEIR](https://github.com/beir-cellar/beir)).
- **Resume-JD matching**: no gold-standard public benchmark exists at scale; the LiveCareer and Kaggle Resume datasets are commonly used ([Kaggle Resume Dataset](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset)).
- **Skill extraction**: **SkillSpan** (Zhang et al., 2022) provides annotated JDs for skill-span extraction ([SkillSpan](https://aclanthology.org/2022.naacl-main.366/)); **ESCO** and **Lightcast Open Skills** provide taxonomies.

## 3. Recommended Approaches for Our Product

### 3.1 Architecture Recommendation

**Layer 1 — Structured skill extraction (offline, at ingest):**
- Use **spaCy 3.7+ EntityRuler** with a curated skill lexicon derived from **ESCO** (~13k skills) + **Lightcast Open Skills** (~32k), normalized to canonical IDs.
- Augment with **KeyBERT** (model: `all-mpnet-base-v2` for quality or `all-MiniLM-L6-v2` for speed; `keyphrase_ngram_range=(1,3)`, `use_mmr=True`, `diversity=0.4`) to catch out-of-taxonomy skills, per Nexus recommendation ([KeyBERT](https://maartengr.github.io/KeyBERT/)).
- For high-value docs, LLM extraction (GPT-4o-mini or Llama-3.1-8B) with a strict JSON schema returning `{required_skills, preferred_skills, years_experience, education}`.

**Layer 2 — Sparse retrieval and hard filter:**
- **OpenSearch** or **Elasticsearch** with **BM25F**, field-weighted: `skills^3, title^2, experience^1.5, body^1`.
- Tune `k1=1.2, b=0.75` initially; grid-search on labeled recruiter feedback.
- Hard filter: `matched_required_skills / total_required_skills ≥ 0.6` (configurable per role).

**Layer 3 — Dense semantic scoring:**
- Sentence-Transformers `all-mpnet-base-v2` or domain-tuned `bge-large-en-v1.5` for resume and JD embeddings ([BGE models](https://huggingface.co/BAAI/bge-large-en-v1.5)).
- Store in **Qdrant** or **pgvector**; cosine similarity.

**Layer 4 — Fusion and re-ranking:**
- **RRF** (k=60) to combine BM25 and dense top-100.
- Cross-encoder re-rank top-25 with `bge-reranker-v2-m3` for final score.

**Layer 5 — Explainable match score:**
```
final = 0.45·required_coverage + 0.20·preferred_coverage
      + 0.20·semantic_sim + 0.10·experience_fit + 0.05·education_fit
```
Return per-skill hit/miss list, matched phrases with offsets, and BM25/dense sub-scores for UI display.

### 3.2 Bias-Detection Hooks in the Keyword Layer

- **JD-side scan**: flag gendered/ageist/ableist terms via a maintained lexicon (Textio-style) + a classifier trained on Gaucher et al. word lists.
- **Keyword-weighting audit**: log the top-20 keywords contributing to score; disparate impact analysis across demographic proxies.
- **Anti-stuffing**: detect white text, keyword-density outliers (z-score on TF distribution), and duplicated JD phrases in resumes.
- **Synonym expansion transparency**: log every synonym/embedding expansion applied so audits can reproduce scores.

### 3.3 Tooling Choices — Pros/Cons

| Component | Recommended | Alternative | Why |
|---|---|---|---|
| Sparse index | OpenSearch 2.x (BM25F + hybrid built-in) | Elasticsearch, Vespa | Open-source, native hybrid RRF, mature |
| Skill extraction | spaCy + EntityRuler + ESCO/Lightcast | LLM-only | Deterministic, auditable, cheap |
| Keyphrase (open) | KeyBERT (mpnet) | YAKE, RAKE | Best quality; MMR diversity |
| Dense embeddings | bge-large-en-v1.5 | OpenAI text-embedding-3-large | On-prem, GDPR-friendly, top MTEB score |
| Re-ranker | bge-reranker-v2-m3 | Cohere Rerank 3 | Multilingual, on-prem |
| Vector store | Qdrant | pgvector, Weaviate | Fast filtering + payload metadata |

## 4. Key Numbers & Facts Table

| Fact | Value | Source |
|---|---|---|
| BM25 default parameters | k1=1.2, b=0.75 | [Elastic docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html) |
| RRF default k | 60 | [Cormack 2009](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) |
| KeyBERT recommended MMR/diversity for JDs | MMR=True, diversity=0.4 | [Nexus 2026](https://www.sciencedirect.com/science/article/pii/S1877050926018041) |
| ESCO skill taxonomy size | ~13,890 skills | [ESCO](https://esco.ec.europa.eu/) |
| Lightcast Open Skills size | ~32,000 skills | [Lightcast](https://lightcast.io/open-skills) |
| BEIR BM25 zero-shot NDCG@10 avg | ~0.428 (strong baseline) | [BEIR paper](https://arxiv.org/abs/2104.08663) |
| Sentence-Transformers `all-mpnet-base-v2` STS-b | 0.858 Spearman | [SBERT models](https://www.sbert.net/docs/pretrained_models.html) |
| BGE-large-en-v1.5 MTEB avg | 64.23 | [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard) |
| Typical ATS keyword-match threshold to pass initial screen | 60–75% keyword overlap | [Jobscan](https://www.jobscan.co/blog/ats-resume/) |
| EU AI Act — HR systems classified as | High-risk (Annex III) | [EU AI Act](https://artificialintelligenceact.eu/) |
| SkillSpan dataset size | ~14.5k sentences, ~12k skill spans | [SkillSpan NAACL 2022](https://aclanthology.org/2022.naacl-main.366/) |

## 5. Open Questions, Risks, and Gaps

1. **No gold-standard resume-JD benchmark**: we will need to construct an internal labeled set (recruiter thumbs-up/down on 5–10k pairs) to tune α, RRF k, and field weights. Cold-start risk.
2. **Skill taxonomy drift**: ESCO/Lightcast update quarterly; new skills ("LangChain", "vLLM", "MCP") lag by 6–12 months. Need an in-house "emerging skills" pipeline via KeyBERT + human review.
3. **Multilingual resumes**: BM25 tokenization and skill lexicons are English-heavy. If we support EU/APAC hiring, need per-language analyzers and multilingual embeddings (`bge-m3`, `paraphrase-multilingual-mpnet`).
4. **Bias in the skill taxonomy itself**: ESCO underrepresents care work, informal experience, and non-Western credentials — this could disadvantage protected groups. Requires explicit audit.
5. **Adversarial keyword stuffing**: how aggressively do we penalize? False positives (e.g., a legitimate skills list) could hurt fair candidates. Need calibrated detector with human-in-loop.
6. **Explainability vs performance**: cross-encoder re-rankers give the biggest quality lift but are the hardest to explain. We may need to expose only sparse+dense sub-scores in the UI and use the re-ranker score as an internal tiebreaker.
7. **Legal exposure of match scores**: in NYC (Local Law 144), Illinois, and under EU AI Act, an automated match score used in hiring may require bias audits and candidate disclosure. Ensure every score component is loggable and reproducible.
8. **LLM-based extraction non-determinism**: if we use GPT-4o for skill extraction, the same resume can yield slightly different skill lists across runs — hurts reproducibility of audits. Mitigate with `temperature=0`, cached outputs, and versioned prompts.
9. **Weight tuning is per role family**: engineering vs sales vs nursing need very different `w_req/w_sem` mixes. Requires either per-family calibration or a learning-to-rank model on top.
10. **Interaction with semantic layer**: over-reliance on embeddings can silently mask keyword misses on hard requirements (licenses, security clearance). The hard filter on required skills must sit *before* semantic scoring to prevent this failure mode.