# Skill Taxonomies and Ontologies for Resume/JD Matching Engines

## 1. Executive Summary

Modern resume/JD matching engines depend on a canonical **skills ontology** to normalize the messy free-text vocabulary of resumes and job postings into stable identifiers that support scoring, aggregation, and fairness auditing. The dominant taxonomies are **ESCO** (13,939 skills, open, EU-official, multilingual), **O*NET** (US-official, occupation-centric with skill/knowledge/ability layers), **Lightcast Open Skills** (~32k+ skills, commercial but with a free open subset, frequently updated from job postings), the **LinkedIn Skills Graph** (~41k+ skills, proprietary), and **SFIA** (for IT competency levels). For a new product, the practical winning pattern is a **hybrid ontology**: adopt ESCO or Lightcast Open Skills as the backbone, layer O*NET occupation→skill mappings for title inference, and use transformer embeddings (e.g., SapBERT/JobBERT/E5) plus LLM-assisted extraction to normalize surface forms to canonical URIs. This report details each taxonomy, current extraction methods (2023–2025), and a specific recommended architecture.

## 2. Detailed Findings

### 2.1 Major Taxonomies — Coverage and Fit

**ESCO (European Skills, Competences, Qualifications and Occupations)**
- Version 1.2.0 (2024) contains **3,039 occupations** and **13,939 skills/competences**, organized in a hierarchical/skill-pillar structure, mapped to ISCO-08 occupations, and available in **28 European languages** ([ESCO portal](https://esco.ec.europa.eu/en/classification)).
- Distributed as RDF, CSV, and via SPARQL/REST API; each skill has a stable URI (`http://data.europa.eu/esco/skill/...`), preferred label, alt labels, and description — ideal features for embedding-based matching.
- Skill types are split into **knowledge**, **skill/competence**, and **transversal skills** (a 2022 pillar), which is directly useful for bias audits (distinguishing "hard" credentials from soft/transversal traits that can carry demographic bias).
- Open license (European Union Public License), no per-call cost — a key advantage over commercial taxonomies.

**O*NET (US DOL)**
- The [O*NET database](https://www.onetcenter.org/database.html) (v29.1, 2025) covers ~**923 SOC-based occupations** with structured attributes: Skills (35), Knowledge (33), Abilities (52), Work Activities, Tools & Technology, and detailed importance/level ratings.
- Not a granular skill taxonomy per se — its "skills" list is small and abstract (e.g., "Active Listening", "Programming"). However, its **Tools & Technology** and **Detailed Work Activities (DWA)** lists provide concrete technology terms.
- Best use in a matching engine: **occupation inference** and **skill importance weighting** by SOC code, not as the primary skill vocabulary.

**Lightcast Open Skills (formerly Burning Glass / Emsi Skills)**
- [Lightcast Open Skills](https://lightcast.io/open-skills) is a large, job-posting-derived taxonomy (~32,000+ skills as of 2024), updated monthly from Lightcast's crawl of ~1B+ postings.
- Split into: **Specialized Skills** (e.g., "Kubernetes"), **Common Skills** (soft/transversal), and **Certifications**. Each has a stable ID, type, category, subcategory, and description.
- The Open Skills subset is free with attribution via a public API; the full Lightcast Skills API is commercial ([Lightcast taxonomies](https://lightcast.io/our-taxonomies)).
- **LOT (Lightcast Occupation Taxonomy)** provides 1,800+ specialized occupations updated annually, richer than SOC for tech roles.

**LinkedIn Skills Graph**
- Proprietary; LinkedIn reports **41,000+ skills** with rich co-occurrence and skill-to-skill relations powering their "Skills-First" hiring initiative and Recruiter/LinkedIn Learning ([LinkedIn Engineering — Building a knowledge graph](https://engineering.linkedin.com/blog/2020/introducing-the-linkedin-knowledge-graph)).
- Not directly licensable outside LinkedIn's platform; useful only as a **conceptual reference** and via Talent Insights API for enterprise customers.

**SFIA (Skills Framework for the Information Age)**
- v8 (2021, refreshed 2024): **147 professional skills** with 7 responsibility/competency **levels** ([SFIA Foundation](https://sfia-online.org/en/sfia-8)). Licensed (free for individuals, fee for commercial products).
- Value for us: **level/seniority inference** in IT roles (Level 3 vs Level 5 "Programming/software development"), which pure skill-tag matching misses.

**Other taxonomies worth knowing**
- **ISCO-08** (occupations, ILO) — international occupational standard used by ESCO.
- **WEF "Reskilling Revolution"** skill families — high-level; used for macro reports, not matching.
- **CEDEFOP** OVATE for ESCO-tagged EU job vacancy data — good benchmark corpus.

### 2.2 Skill Extraction and Normalization — State of the Art (2023–2025)

**Dictionary/gazetteer + fuzzy matching (baseline).** Fast, explainable, but brittle to synonyms and multi-word expressions. Libraries: [spaCy PhraseMatcher](https://spacy.io/api/phrasematcher), FlashText, RapidFuzz. Achieves ~0.55–0.70 F1 on ESCO extraction benchmarks.

**Transformer embedding retrieval (current default).** Encode candidate spans and the full taxonomy with the same encoder; use cosine similarity + threshold. This is the approach in [esco-skill-extractor](https://github.com/KonstantinosPetrakis/esco-skill-extractor) (uses sentence-transformers, MIT license) and JobBERT ([Zhang et al., 2022 "SkillSpan"](https://arxiv.org/abs/2204.12811)). Key models:
- **all-MiniLM-L6-v2** / **all-mpnet-base-v2** (sentence-transformers) — solid general-purpose baselines.
- **JobBERT** ([jjzha/jobbert-base-cased](https://huggingface.co/jjzha/jobbert-base-cased)) — continued pretraining on 3.2M English job postings, better for JD text.
- **E5-large-v2** / **BGE-large** — SOTA retrieval encoders (2023–2024), strong zero-shot on skill linking.
- **ESCOXLM-R** ([Zhang et al., 2023](https://arxiv.org/abs/2305.12092)) — XLM-R pretrained with ESCO taxonomy signal, best multilingual skill linking F1.

**Sequence labeling for span extraction.** Fine-tune BERT/DeBERTa on labeled skill spans (SkillSpan, Kompetencer, GNEHM datasets). [SkillSpan](https://github.com/kris927b/SkillSpan) reports token-level F1 ~0.60 for skill spans and ~0.55 for knowledge spans on the House corpus (2022). Combining with a retriever (**extract-then-link**) is standard.

**LLM-based extraction (2024–2025).** GPT-4o, Claude 3.5/4, Llama-3.1-70B with few-shot prompts + JSON schema achieve **F1 in the 0.75–0.85 range** on ESCO linking without training data ([Decorte et al., 2023, "Extreme Multi-Label Skill Extraction Training Using Large Language Models"](https://arxiv.org/abs/2307.10778); [Nguyen et al., 2024, "Rethinking Skill Extraction"](https://arxiv.org/abs/2402.03832)). Best pattern: LLM generates candidate skill phrases → dense retriever links each to nearest ESCO/Lightcast URI → LLM verifier confirms. This is the pipeline used by [ESCOX/ESCO Skill Extractor](https://www.sciencedirect.com/science/article/pii/S2665963825000326) (Kavargyris et al., 2025) inside the EU SKILLAB project.

**Skill inference from job titles.** Two industry-standard approaches:
1. **Title → SOC/ISCO/LOT normalization**, then lookup of associated skills. O*NET provides direct occupation→skill importance ratings; ESCO provides occupation→essentialSkill/optionalSkill relations. Libraries: [SOCcer](https://soccer.nci.nih.gov/) (NCI), [pyonet](https://pypi.org/project/pyonet/), Lightcast Titles API.
2. **Embedding-based nearest-neighbor** on the taxonomy's occupation labels (used by [Textkernel](https://www.textkernel.com/) and [Eightfold](https://eightfold.ai/)).

### 2.3 Skill Normalization Sub-problems

- **Synonym/alias collapse:** "JS" → "JavaScript"; "k8s" → "Kubernetes". Handled by alt-label tables in ESCO/Lightcast + embedding fallback.
- **Granularity mismatch:** "AWS" vs "AWS Lambda" vs "AWS DynamoDB". Solution: keep hierarchical `broader/narrower` relations from ESCO's skill hierarchy and use both parent and child for scoring.
- **Skill vs tool vs certification:** ESCO conflates; Lightcast separates. For explainability we want to keep this split (e.g., PMP certification ≠ "project management" skill).
- **Language / locale:** ESCO is best-in-class multilingual; Lightcast has UK/DE/FR/ES coverage; O*NET is English-only.
- **Soft skills and bias risk:** transversal skills ("leadership", "cultural fit") disproportionately correlate with demographic bias in resume scoring ([Wilson & Caliskan 2024, "Gender, Race, and Intersectional Bias in Resume Screening via LLMs"](https://arxiv.org/abs/2407.20371)). The taxonomy should tag these so the bias detector can treat them differently.

### 2.4 Commercial Vendors and Their Ontologies

| Vendor | Taxonomy | Notes |
|---|---|---|
| **Lightcast** | Open Skills + LOT | Best coverage for US labor market; commercial API |
| **Textkernel (Bullhorn)** | Proprietary + ESCO mapping | Strong parser; ESCO-aligned exports ([Textkernel Skills Intelligence](https://www.textkernel.com/skills-intelligence/)) |
| **Eightfold AI** | Proprietary "Talent Graph" | Deep-learning-derived; closed |
| **SkyHive (Cornerstone)** | Proprietary "Occupational Intelligence" | Includes adjacency/reskilling paths |
| **TabiyaMoonshot** | Open, ESCO-extended | Non-profit, adds informal/gig-economy skills |
| **WorkGrid / Draup** | Proprietary | Aimed at workforce planning |

## 3. Recommended Approaches for OUR Product

### 3.1 Recommendation: Hybrid ESCO-primary + Lightcast Open Skills overlay

**Primary backbone: ESCO v1.2.0**
- Pros: Open license, 28 languages, stable URIs, RDF-ready, hierarchical, occupation ↔ skill relations built in, transversal-skill tagging supports our bias detector, well-supported in academic tooling.
- Cons: Weaker on emerging US-specific tech skills (e.g., "LangChain", "dbt", "Vertex AI") — typically 6–12 month lag.
- Storage: load into Postgres + pgvector (or Neo4j if we want graph queries). Each row = ESCO URI, preferredLabel, altLabels[], description, skillType, broaderConcept, essentialForOccupations[], embedding vector.

**Overlay: Lightcast Open Skills (free tier)**
- Use to patch tech-skill coverage gaps. Maintain a mapping table `lightcast_id ↔ esco_uri` populated via embedding similarity (cosine ≥ 0.85) + human review for the top 2,000 tech skills.
- Pros: fresh, US-market-aligned. Cons: free tier has rate limits and attribution requirements; full API is paid.

**Occupation layer: ESCO occupations + O*NET SOC + Lightcast LOT**
- Store cross-walks so a JD title "Senior Data Engineer" resolves to ESCO occupation, SOC 15-2051.00, and LOT ID. Use O*NET importance ratings to weight inferred skills.

**Seniority layer: SFIA levels for IT roles**
- License SFIA for commercial use ([SFIA licensing](https://sfia-online.org/en/about-sfia/how-sfia-works/using-sfia)). Map extracted evidence ("led team of 6", "5 years experience") to SFIA levels 1–7 for programming/architecture/data skills. Optional in v1; adds strong explainability.

### 3.2 Extraction Pipeline (specific stack)

1. **Document parsing:** [unstructured.io](https://github.com/Unstructured-IO/unstructured) + [pdfplumber](https://github.com/jsvine/pdfplumber) for PDFs; python-docx for DOCX.
2. **Section segmentation:** rule-based + a small fine-tuned classifier (DistilBERT) to identify Experience / Education / Skills / Projects sections.
3. **Span candidate extraction:**
   - Fast path: spaCy PhraseMatcher over ESCO+Lightcast alt-labels (recall booster).
   - Neural path: fine-tuned **DeBERTa-v3-base** on [SkillSpan](https://github.com/kris927b/SkillSpan) + [Kompetencer](https://github.com/jjzha/kompetencer) merged; expect F1 ~0.65–0.72.
   - LLM path (higher quality tier): Claude 3.5 Sonnet or GPT-4o-mini with structured JSON output; cache aggressively.
4. **Linking to ontology (normalization):** encode candidate spans + all ESCO/Lightcast entries with **BGE-large-en-v1.5** or **JobBERT-v2**; store embeddings in **pgvector** or **Qdrant**. Top-k=5 retrieval; accept if cosine ≥ **0.72** (tune on held-out set); LLM verifier for 0.60–0.72 band.
5. **Title inference:** encode JD title and match to ESCO occupations; expand to essentialSkills as *implicit* JD skills (weight 0.5 vs 1.0 for explicit).
6. **Storage schema:** every extracted skill row carries `{surface_form, canonical_uri, confidence, source_span, taxonomy, skill_type, is_transversal}` — the `is_transversal` flag feeds the bias detector.

### 3.3 Thresholds and Benchmarks to Adopt

| Setting | Recommended value | Rationale |
|---|---|---|
| Cosine threshold, auto-accept | 0.72 | Balances P/R on ESCO linking per [Decorte 2023](https://arxiv.org/abs/2307.10778) |
| Cosine threshold, LLM-verify | 0.60–0.72 | Middle-band reduces false positives |
| Title→occupation top-k | 3 | Multiple occupations often valid |
| Implicit-skill weight | 0.5 | Weighted lower than explicit resume skills |
| Skill embedding model | BGE-large-en-v1.5 (retrieval) + JobBERT (domain) ensemble | Best F1 in our internal expectation |

### 3.4 Alternatives Considered and Rejected (with reasons)

- **Lightcast-only:** better US coverage but paid, single-vendor lock-in, no multilingual roadmap alignment with future EU customers.
- **LinkedIn Skills Graph:** not licensable outside their platform.
- **Build our own from scratch:** 12–18 month effort; no strategic advantage over ESCO baseline.
- **O*NET as primary skill list:** too coarse (35 skills); use only for occupation weighting.

## 4. Key Numbers & Facts Table

| Fact | Value | Source |
|---|---|---|
| ESCO v1.2.0 skills | 13,939 | [ESCO portal](https://esco.ec.europa.eu/en/classification/skill_main) |
| ESCO occupations | 3,039 | [ESCO portal](https://esco.ec.europa.eu/en/classification/occupation_main) |
| ESCO languages | 28 | [ESCO](https://esco.ec.europa.eu/en) |
| O*NET occupations (v29.1) | ~923 | [O*NET DB](https://www.onetcenter.org/database.html) |
| O*NET skills list size | 35 | [O*NET Content Model](https://www.onetcenter.org/content.html) |
| Lightcast Open Skills count | ~32,000+ | [Lightcast Open Skills](https://lightcast.io/open-skills) |
| Lightcast LOT specialized occupations | 1,800+ | [Lightcast Taxonomies](https://lightcast.io/our-taxonomies) |
| LinkedIn Skills Graph size (reported) | 41,000+ | [LinkedIn Engineering](https://engineering.linkedin.com/blog/2020/introducing-the-linkedin-knowledge-graph) |
| SFIA v8 skills | 147 across 7 levels | [SFIA](https://sfia-online.org/en/sfia-8) |
| SkillSpan token-F1 (BERT) | ~0.60 | [Zhang 2022](https://arxiv.org/abs/2204.12811) |
| LLM skill extraction F1 (GPT-4 class) | 0.75–0.85 | [Decorte 2023](https://arxiv.org/abs/2307.10778) |
| ESCOXLM-R multilingual F1 gain over XLM-R | +2–4 pts | [Zhang 2023](https://arxiv.org/abs/2305.12092) |
| esco-skill-extractor default similarity threshold | ~0.55 (configurable) | [GitHub](https://github.com/KonstantinosPetrakis/esco-skill-extractor) |

## 5. Open Questions, Risks, and Gaps

1. **Ontology freshness vs stability.** ESCO updates ~annually; tech skills evolve monthly. Do we run a **shadow taxonomy** for unmatched high-frequency spans and promote them quarterly? Recommend yes, with human review.
2. **Legal/licensing on Lightcast full API.** Open Skills is free but the richer skill relations, categories, and monthly updates are gated. Decide budget before v1 ships.
3. **SFIA commercial license fees.** Need commercial partner agreement before embedding SFIA level inference in a paid product.
4. **Bias risks embedded in taxonomies.** Transversal skills ("cultural fit", "leadership presence") and occupation stereotypes (e.g., "nurse" gender skew in embeddings) can leak bias into scoring. Our bias detector must (a) flag matches driven predominantly by transversal skills, and (b) audit occupation→skill inferences for demographic disparity. See [De-Arteaga et al. 2019, "Bias in Bios"](https://arxiv.org/abs/1901.09451) and [Wilson & Caliskan 2024](https://arxiv.org/abs/2407.20371).
5. **Cross-walk quality.** Auto-mapping Lightcast↔ESCO via embeddings has ~85–90% top-1 accuracy in our expectation; the remaining 10–15% will produce silent scoring errors. Budget for manual curation of the top 2,000 skills.
6. **Multilingual scope.** If we serve non-English resumes in v1, ESCOXLM-R or multilingual E5 must be used; JobBERT is English-only.
7. **Skill importance / weighting.** Neither ESCO nor Lightcast Open Skills expose good "importance" weights. O*NET does, but only at occupation level. We may need to learn weights from historical hire/reject data — which itself risks re-encoding past hiring bias. Fairness-aware weight learning is an open R&D item.
8. **Skill inference explainability.** Implicit skills inferred from titles must be clearly labeled in the UI, or recruiters will treat them as if they were on the resume — a legal and fairness risk under EU AI Act "high-risk" employment provisions ([EU AI Act Annex III](https://artificialintelligenceact.eu/annex/3/)).
9. **Emerging GenAI skills.** "Prompt engineering", "LLM ops", "RAG" appeared in postings in 2023 and are still partially missing from ESCO 1.2. Plan quarterly patch releases from Lightcast + internal curation.
10. **Evaluation dataset.** We need an internal gold-labeled set of ~500 resumes and 500 JDs with ESCO/Lightcast URIs to measure extraction P/R/F1 and to unit-test bias metrics. Budget ~2 annotator-weeks.

---
**Bottom line for the team:** Adopt ESCO v1.2.0 as the canonical ontology, overlay Lightcast Open Skills for tech freshness, use O*NET/LOT for occupation inference and importance weighting, and optionally SFIA for seniority. Extract with a hybrid (PhraseMatcher + fine-tuned DeBERTa + LLM fallback) pipeline, link with BGE-large/JobBERT embeddings in pgvector, and carry `skill_type`/`is_transversal` flags end-to-end so the bias-detection module can reason about them explicitly.