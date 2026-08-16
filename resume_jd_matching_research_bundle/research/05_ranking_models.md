# ML Ranking Models and Evaluation for Resume/JD Matching

## 1. Executive Summary

Modern candidate-job matching systems converge on a **hybrid, multi-stage architecture**: (1) a lexical + semantic retrieval layer (BM25 + dense embeddings) generates candidates, (2) a **two-tower** bi-encoder scores at scale, and (3) a **cross-encoder transformer reranker** or **LambdaMART (XGBoost/LightGBM)** learning-to-rank (LTR) model applies fine-grained ordering using engineered features (skill overlap, experience gap, location, seniority). Evaluation for our recruiter-facing product should prioritize **NDCG@10, MAP, MRR, and Recall@100** on a labeled resume–JD corpus assembled from Kaggle/Indeed dumps plus internal recruiter-labeled data, augmented with active learning to bootstrap labels. Cold-start (new JD/resume, no clicks) is handled by content-based tower embeddings and skill taxonomies (ESCO/O*NET). A/B testing must be **interleaved** with fairness-aware evaluation given our bias-detection mandate, since ranking changes disproportionately affect demographic subgroups.

## 2. Detailed Findings

### 2.1 Learning-to-Rank with Gradient Boosted Trees

XGBoost and LightGBM remain the industry workhorses for LTR over engineered features because they handle heterogeneous tabular signals (numeric skill scores, categorical location codes, ordinal seniority), require little tuning, and train quickly on millions of query-doc pairs. XGBoost supports three ranking objectives: `rank:pairwise` (LambdaRank/LambdaMART, MART + pairwise loss), `rank:ndcg` (uses an NDCG-derived gradient, generally the strongest for graded relevance), and `rank:map` (for binary relevance) ([XGBoost LTR docs](https://www.tutorialspoint.com/xgboost/xgboost-learning-to-rank.htm)). LightGBM's `lambdarank` objective produces comparable or better NDCG on the MSLR-WEB10K benchmark with faster training, and is widely used at LinkedIn, Airbnb, and Yelp for search ranking.

Typical LTR features for resume–JD matching (see [Zhu et al., "Person-Job Fit"](https://arxiv.org/abs/1810.04040) and LinkedIn engineering posts):
- **Skill overlap**: Jaccard, TF-IDF cosine, weighted skill hit rate on required vs. nice-to-have skills.
- **Semantic similarity**: cosine between JD and resume sentence-transformer embeddings.
- **Experience**: years-of-experience delta, seniority level match.
- **Education**: degree level, field-of-study similarity.
- **Location/remote**: distance, remote-work flag match.
- **Recency**: last-role recency, resume freshness.
- **Company/industry signals**: prior industry match, company-size preference.

### 2.2 Transformer Rerankers (Cross-Encoders)

Cross-encoders concatenate `[JD; resume]` and produce a single relevance score with full cross-attention — more accurate but O(N) per query. State-of-the-art rerankers as of 2024–2025:

- **BGE reranker v2** (BAAI) — `BAAI/bge-reranker-v2-m3` supports multilingual, up to 8k tokens, strong on MTEB reranking ([BGE on HF](https://huggingface.co/BAAI/bge-reranker-v2-m3)).
- **Cohere Rerank 3** — hosted API, 4k context, top of BEIR reranking leaderboards ([Cohere Rerank](https://cohere.com/blog/rerank-3)).
- **Jina Reranker v2** — 1024-token, permissively licensed.
- **MonoT5 / RankT5** — encoder-decoder rerankers, well-studied academic baselines.
- **ColBERT v2 / PLAID** — late-interaction, a middle ground between bi- and cross-encoders ([Santhanam et al., 2022](https://arxiv.org/abs/2112.01488)).

For resume–JD specifically, **JobBERT** ([Zhang et al., 2022](https://arxiv.org/abs/2109.09605)) and **ConFit** ([Yu et al., 2024](https://arxiv.org/abs/2401.16349)) fine-tune sentence encoders on contrastive resume–JD pairs and report 5–10 point NDCG@10 gains over generic BERT.

### 2.3 Two-Tower / Bi-Encoder Retrieval

Two-tower architectures encode JDs and resumes independently, enabling ANN retrieval (FAISS, ScaNN, Qdrant, pgvector) over millions of candidates in <50 ms. Training uses in-batch negatives with contrastive loss (InfoNCE) or triplet loss. Recommended base encoders (2024):

- `sentence-transformers/all-mpnet-base-v2` (768-d, strong general baseline).
- `BAAI/bge-large-en-v1.5` — top MTEB retrieval scores ([MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard)).
- `intfloat/e5-large-v2` and `e5-mistral-7b-instruct` for higher recall at higher latency cost.
- Domain-tuned: `TechWolf/JobBERT-v2` and **ConFit** ([ConFit paper](https://arxiv.org/abs/2401.16349)) explicitly for resume/JD.

Hard-negative mining (retrieving near-miss JDs that recruiters rejected) is critical; the [DPR paper](https://arxiv.org/abs/2004.04906) and [ANCE](https://arxiv.org/abs/2007.00808) show 3–8 point NDCG gains from mined hard negatives vs. random negatives.

### 2.4 Hybrid Search Architecture

Empirically, **BM25 + dense fusion via Reciprocal Rank Fusion (RRF)** or a small linear model outperforms either alone by 5–15% NDCG on BEIR ([Thakur et al., BEIR, 2021](https://arxiv.org/abs/2104.08663)). Production stacks (Elastic, Vespa, OpenSearch, Weaviate) natively support hybrid scoring. The canonical pipeline:

```
JD query → [BM25 top-1000] ∪ [dense top-1000]
        → RRF merge → top-200
        → cross-encoder rerank → top-50
        → LambdaMART with business features → final top-10
```

### 2.5 Evaluation Metrics

For graded recruiter labels (e.g., 0=reject, 1=maybe, 2=interview, 3=hire), **NDCG@K** is the primary metric because it credits both position and relevance grade. Complementary:

- **MAP** — binary relevance, penalizes missing relevant candidates anywhere in the list.
- **MRR** — position of first relevant hit; useful when recruiters only look at top 3.
- **Recall@100 / Recall@1000** — retrieval-stage health check; if the reranker's ceiling is low recall, downstream ranking cannot recover.
- **Precision@10** — recruiter-facing UX metric: "of the 10 candidates shown, how many were shortlisted?"

Reference values on public resume–JD-adjacent benchmarks: strong systems achieve NDCG@10 ≈ 0.55–0.70 on the [TalentCLEF 2024/2025](https://talentclef.github.io/) shared task and MAP ≈ 0.35–0.50 on the [Recsys Challenge 2016/2017 job recs](http://www.recsyschallenge.com/2017/) datasets.

### 2.6 Datasets

Publicly available resume–JD datasets useful for pretraining or benchmarking:

- **Kaggle "Resume-Job Matching Dataset"** (applicant + vacancy + Invitation/Rejection label) ([Kaggle](https://www.kaggle.com/datasets/darysha/hse-hackathon)).
- **Kaggle "Resume Dataset"** (~2400 resumes across 25 categories) — good for classification pretraining.
- **ResuméAtlas** — large-scale resume corpus (~13k resumes) for classification ([Alsentzer et al., 2024, arXiv:2406.18125](https://arxiv.org/html/2406.18125v1)).
- **CareerBuilder / Indeed / Glassdoor scrapes** — heavily used in academic works; licensing varies.
- **TalentCLEF 2024/2025** — job-title matching and skill matching shared tasks with labeled data ([TalentCLEF](https://talentclef.github.io/)).
- **ESCO** and **O*NET** — occupation/skill taxonomies (not a labeled matching set, but essential as features and cold-start signals).
- **Zhu et al. "Person-Job Fit"** — released a Chinese resume–JD interaction dataset ([arXiv:1810.04040](https://arxiv.org/abs/1810.04040)).

### 2.7 Annotation Strategies & Active Learning

Recruiter time is expensive (~$1–3 per labeled pair). Strategies:

- **Weak supervision from ATS signals**: application → screened → phone → onsite → offer → hire form a natural graded relevance scale (0–5). Snorkel-style labeling functions ([Ratner et al., 2020](https://arxiv.org/abs/1711.10160)) can aggregate these into probabilistic labels.
- **Pairwise preference elicitation**: showing recruiters "A vs. B" is 2–3× faster and more reliable than absolute scores ([Chapelle & Chang, 2011](http://proceedings.mlr.press/v14/chapelle11a/chapelle11a.pdf)).
- **Active learning**: uncertainty sampling (BALD, margin) plus diversity sampling. [Modal](https://modal.com/) and [Cleanlab](https://cleanlab.ai/) provide tooling; a 2023 study showed active learning cuts label budget by 40–60% for text ranking ([Wang et al., 2023](https://arxiv.org/abs/2305.03027)).
- **LLM-as-annotator**: GPT-4-class models produce silver labels within 5–10% of human agreement for resume–JD relevance ([Zheng et al., 2023](https://arxiv.org/abs/2306.05685)); use for pretraining, not gold eval.

### 2.8 A/B Testing and Online Evaluation

- **Interleaving** (Team-Draft, Optimized Interleaving) has 10–100× the statistical power of A/B split for ranking ([Radlinski & Craswell, 2013](https://www.microsoft.com/en-us/research/publication/optimized-interleaving-for-online-retrieval-evaluation/)).
- Primary online KPI: **recruiter shortlist rate @ top-10**, **time-to-first-shortlist**, **application-to-interview conversion**.
- Critically for us: stratify online metrics by demographic proxies (gender-inferred, ethnicity-inferred, age band from graduation year) to detect fairness regressions — see [Yang & Stoyanovich, 2017](https://arxiv.org/abs/1610.08559) on fair ranking metrics (rKL, rND, rRD).

### 2.9 Cold-Start Handling

- **New JD**: rely on the JD tower embedding + skill-taxonomy expansion (ESCO parent/child skills) + BM25.
- **New resume**: same in reverse; enrich with skill graph, title normalization (ESCO/O*NET), and inferred seniority.
- **New employer** (no prior hiring signal): backoff to industry- and role-family-level priors.
- **Meta-learning / prompt-based LLM scoring** as a warm-start reranker before enough clicks accumulate ([Bao et al., 2023, "TALLRec"](https://arxiv.org/abs/2305.00447)).

## 3. Recommended Approaches for Our Product

### 3.1 Architecture (recommended)

```
Stage 0: JD/resume parsing → structured skills, titles, years, education
Stage 1: Hybrid retrieval
         - BM25 (OpenSearch) over skills+titles+text
         - Dense: bge-large-en-v1.5 fine-tuned on our pairs → Qdrant/pgvector
         - RRF fusion → top 200
Stage 2: Cross-encoder rerank
         - BAAI/bge-reranker-v2-m3 fine-tuned on recruiter labels → top 50
Stage 3: LambdaMART (LightGBM lambdarank) with business features
         - Skill match %, YoE delta, seniority, location, salary band, freshness
         - Also consumes stage-2 score as a feature
         - Produces final top-10 with SHAP explanations
Stage 4: Fairness post-processing
         - DetConstSort or FA*IR re-ranking for demographic parity in top-K
```

**Pros**: modular, each stage independently improvable, explainable via SHAP on the LGBM layer, latency budget (~300 ms end-to-end for 1M candidate pool with ANN + reranker on GPU).
**Cons**: 4 models to maintain; requires labeled data at multiple stages.

### 3.2 Specific tool/model picks

| Layer | Recommendation | Alternative | Why |
|---|---|---|---|
| Lexical | OpenSearch BM25 | Elasticsearch, Vespa | OSS, hybrid search built-in |
| Dense encoder | `BAAI/bge-large-en-v1.5` fine-tuned | `all-mpnet-base-v2`, `e5-large-v2` | Top MTEB, permissive license |
| Vector DB | Qdrant (self-host) or pgvector | Weaviate, Pinecone | Filtered ANN for location/role filters |
| Reranker | `BAAI/bge-reranker-v2-m3` | Cohere Rerank 3 (API), ColBERTv2 | 8k context handles long resumes |
| LTR | LightGBM `lambdarank` | XGBoost `rank:ndcg` | Fast, great with SHAP |
| Feature store | Feast | Tecton | OSS, integrates with LGBM training |
| Experimentation | GrowthBook + interleaving harness | Statsig | OSS, supports stratified analysis |
| Fair reranking | FA*IR (`fairsearch-fair-python`) | DetConstSort | Off-the-shelf, audited |

### 3.3 Training data plan

1. **Bootstrap** with Kaggle Resume-Job Matching dataset + ResuméAtlas + scraped JDs, using ATS-style weak labels.
2. **LLM silver labels**: use GPT-4o-mini to score 100k JD-resume pairs on a 0–3 scale; train initial bi-encoder and reranker.
3. **Recruiter gold labels**: 5k–10k pairs via pairwise preference UI, prioritized by active learning (margin sampling on reranker confidence).
4. **Continuous learning**: ATS outcomes (shortlist, interview, hire) feed weekly LTR retraining.

### 3.4 Evaluation plan

- **Offline**: NDCG@10 (primary), Recall@100 (retrieval), MRR (top-of-list quality), Precision@10 (UX). Report per-slice (gender-inferred, ethnicity-inferred, age band, job family).
- **Fairness offline**: exposure disparity, rKL@K, demographic parity in top-10 ([Yang & Stoyanovich](https://arxiv.org/abs/1610.08559)).
- **Online**: interleaving vs. current ranker on shortlist rate; guardrail on fairness metrics — auto-rollback on >5% subgroup regression.

### 3.5 Cold-start policy

- **New JD**: use skill-taxonomy expansion + dense retrieval only; disable LTR (insufficient features) until 20+ applications collected.
- **New resume**: enrich via ESCO skill inference, use bi-encoder + reranker; skip business-feature LTR features that require history.

## 4. Key Numbers & Facts Table

| Item | Value | Source |
|---|---|---|
| XGBoost ranking objectives | `rank:pairwise`, `rank:ndcg`, `rank:map` | [XGBoost LTR](https://www.tutorialspoint.com/xgboost/xgboost-learning-to-rank.htm) |
| BEIR hybrid (BM25+dense) uplift | +5–15% NDCG over single method | [Thakur 2021](https://arxiv.org/abs/2104.08663) |
| BGE-reranker-v2-m3 context | 8192 tokens, multilingual | [HF card](https://huggingface.co/BAAI/bge-reranker-v2-m3) |
| BERT + augmented Indeed resumes | 92% classification acc. | [ResuméAtlas](https://arxiv.org/html/2406.18125v1) |
| Interleaving power vs. A/B | 10–100× more sensitive | [Radlinski & Craswell 2013](https://www.microsoft.com/en-us/research/publication/optimized-interleaving-for-online-retrieval-evaluation/) |
| Active learning label savings | 40–60% for text ranking | [Wang 2023](https://arxiv.org/abs/2305.03027) |
| Hard-negative mining gain | +3–8 pts NDCG (DPR/ANCE) | [ANCE 2020](https://arxiv.org/abs/2007.00808) |
| Typical resume–JD NDCG@10 SOTA | 0.55–0.70 | [TalentCLEF](https://talentclef.github.io/) |
| LLM-as-judge agreement with humans | ~80–90% on relevance | [Zheng 2023](https://arxiv.org/abs/2306.05685) |
| Kaggle Resume-JD Matching size | ~11k applicant-vacancy pairs | [Kaggle](https://www.kaggle.com/datasets/darysha/hse-hackathon) |

## 5. Open Questions, Risks, and Gaps

1. **Label proxy validity**: ATS outcomes (interview, hire) encode existing recruiter bias. Using them as ground truth for LTR risks **bias amplification**. Mitigation: audit label distributions by demographic slice; consider counterfactual LTR ([Joachims et al., 2017](https://arxiv.org/abs/1608.04468)) or IPS reweighting.

2. **Fairness vs. accuracy tradeoff**: FA*IR/DetConstSort reranking typically costs 1–3 NDCG points. We need product-level guidance on acceptable tradeoff and whether to expose the "fairness knob" to recruiters.

3. **Long-context resumes**: senior candidate resumes exceed 4k tokens; bge-reranker-v2-m3 handles 8k, but cross-encoder latency scales quadratically. Consider chunked reranking or section-level scoring.

4. **Cold-start evaluation**: no established public benchmark for cold-start resume/JD matching — we may need to construct our own held-out cold-JD split.

5. **Legal/regulatory**: NYC Local Law 144, EU AI Act (high-risk employment), and Illinois AI Video Interview Act may require **annual bias audits**, disparate-impact reporting, and candidate notification. Our evaluation harness must produce audit-ready reports.

6. **Data licensing**: scraped Indeed/LinkedIn/Glassdoor data has murky licensing; hiQ v. LinkedIn is settled but risk remains. Prefer Kaggle-licensed and synthetic/LLM-generated data for training corpora we redistribute.

7. **Domain drift**: skill vocabularies evolve (e.g., "prompt engineering," "LangChain") faster than yearly retraining cycles. Need continuous embedding refresh — plan quarterly bi-encoder fine-tuning.

8. **Two-tower shortcut learning**: bi-encoders often latch onto surface features (job title exact match) and miss transferable skills. Consider skill-graph-augmented training and evaluation slices for career-changers.

9. **Explainability granularity**: SHAP on LTR explains business features but not the reranker's decision. Investigate integrated gradients or attention rollout on the cross-encoder for recruiter-facing rationales.

10. **A/B test contamination**: recruiters share candidate pools; interleaved rankings can leak between test/control cells. Need cluster randomization by recruiter or job-family.