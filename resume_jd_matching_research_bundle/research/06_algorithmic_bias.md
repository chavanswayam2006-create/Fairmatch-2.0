# Bias in Hiring Algorithms & Fairness in ML: Research Report for a Resume/JD Matching Engine

## 1. Executive Summary

AI-driven resume screening has a documented history of producing discriminatory outcomes — from Amazon's 2014-2018 recruiting tool that penalized resumes containing the word "women's" ([Reuters, 2018](https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G)), to recent 2024 audits showing GPT-4 and Claude systematically favor resumes with white- and male-associated names ([Armstrong et al., 2024, "The Silicone Ceiling"](https://arxiv.org/abs/2405.04412); [Bloomberg, 2024](https://www.bloomberg.com/graphics/2024-openai-gpt-hiring-racial-discrimination/)). Bias enters via training labels (historical hiring decisions), feature choice (school, name, employment gaps), and embedding models that encode societal stereotypes. No single fairness definition satisfies all stakeholders — demographic parity, equal opportunity, equalized odds, counterfactual and individual fairness are mathematically incompatible in most realistic settings ([Kleinberg et al., 2016](https://arxiv.org/abs/1609.05807)) — so our product must let recruiters/HR choose metrics aligned with the legal regime (EEOC 4/5ths rule in the US, NYC LL144 bias audits, EU AI Act high-risk obligations). We recommend a layered approach: counterfactual name/gender/age swaps for pre-deployment testing, group fairness metrics (adverse impact ratio, equal opportunity difference) on ranked outputs, and per-JD linguistic bias detection using established gender-coded lexicons plus LLM-based auditors.

## 2. Detailed Findings

### 2.1 The Amazon case and why it still matters

Amazon's internal recruiting engine, trained on 10 years of resumes submitted mostly by men, learned to downweight the token "women's" (as in "women's chess club captain") and penalized graduates of two all-women's colleges ([Reuters, 2018](https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G); [Redress Compliance case study, 2025](https://redresscompliance.com/amazon-ai-hiring-tool-a-case-study-in-algorithmic-bias)). Key lessons:

- **Label bias**: the model's target was "who Amazon hired," inheriting historical bias.
- **Proxy variables**: gendered tokens (clubs, colleges, verbs like "executed" vs "supported") acted as proxies even after removing the gender field.
- **Removing the sensitive attribute is insufficient** — the "fairness through unawareness" fallacy ([Barocas, Hardt & Narayanan, *Fairness and Machine Learning*, 2023](https://fairmlbook.org/)).

### 2.2 Documented bias types in hiring ML

| Bias type | Mechanism | Representative evidence |
|---|---|---|
| **Gender** | Gendered verbs, clubs, career gaps | Amazon; [JobFair, 2024](https://arxiv.org/html/2406.15484v2) shows LLMs give lower scores to female-coded resumes |
| **Race / ethnicity** | Names as proxies (Bertrand & Mullainathan callback gap ~50%) | [Bertrand & Mullainathan, 2004](https://www.nber.org/papers/w9873); [Bloomberg GPT audit, 2024](https://www.bloomberg.com/graphics/2024-openai-gpt-hiring-racial-discrimination/) — GPT ranked Asian female names top and Black male names bottom |
| **Age** | Graduation year, dated technologies, "digital native" JD phrasing | [AARP, 2023](https://www.aarp.org/pri/topics/work-finances-retirement/employers-workforce/ageism-workplace-cost-report/) |
| **Disability** | Employment gaps, assistive-tech mentions | [Glazko et al., 2024, "Identifying and Improving Disability Bias in GPT-Based Resume Screening"](https://arxiv.org/abs/2402.01732) — resumes with disability-related awards ranked lower |
| **Name / school prestige** | "Elite" schools weighted; foreign credentials undervalued | [Rivera, *Pedigree*, 2015](https://press.princeton.edu/books/paperback/9780691169279/pedigree) |
| **Linguistic** | Non-native English, dialect, translated resumes | [Deshpande et al., 2020](https://dl.acm.org/doi/10.1145/3351095.3372828) on job-title embedding bias |
| **Structural / format** | PDF parsers failing on non-Western name orders, RTL scripts | practitioner reports (e.g., [Textio 2023 language bias study](https://textio.com/blog/language-bias-in-job-posts)) |

### 2.3 Fairness definitions — what they mean operationally

Given a protected attribute A, prediction Ŷ (shortlisted / not), true label Y (successful hire):

- **Demographic (statistical) parity**: P(Ŷ=1|A=a) equal across groups. Operationalized in US law as the **4/5ths rule / adverse impact ratio (AIR)**: min-group selection rate / max-group selection rate ≥ 0.80 ([EEOC UGESP](https://www.eeoc.gov/uniform-guidelines-employee-selection-procedures)).
- **Equal opportunity** ([Hardt et al., 2016](https://arxiv.org/abs/1610.02413)): equal true-positive rates — among qualified candidates, equal shortlist rates. Preferred when ground-truth "qualified" labels exist.
- **Equalized odds**: equal TPR *and* FPR. Stricter; harder to achieve.
- **Counterfactual fairness** ([Kusner et al., 2017](https://arxiv.org/abs/1703.06856)): decision unchanged if the candidate's protected attribute were counterfactually flipped, holding everything else equal. Very tractable for resume auditing — flip names/pronouns and re-score.
- **Individual fairness** ([Dwork et al., 2012](https://arxiv.org/abs/1104.3913)): similar candidates → similar scores under a task-specific similarity metric.

**Impossibility**: Kleinberg, Chouldechova (2016-17) proved you cannot simultaneously satisfy calibration + equalized odds when base rates differ. Product implication: expose *multiple* metrics; don't claim a single "fair" number.

### 2.4 Measuring bias in ranking (not just classification)

Resume matching is fundamentally a **ranking** problem, so classification fairness metrics need adaptation:

- **Exposure-based fairness** ([Singh & Joachims, 2018](https://arxiv.org/abs/1802.07281)): expected exposure (position-discounted) equal across groups.
- **rND / rKL / rRD** ([Yang & Stoyanovich, 2017](https://dl.acm.org/doi/10.1145/3085504.3085526)): rank-aware demographic disparity at prefix cutoffs.
- **FA*IR** ([Zehlike et al., 2017](https://arxiv.org/abs/1706.06368)): constrained top-k with statistical tests that protected group representation meets a floor at every prefix.
- **NDKL** (normalized discounted KL divergence): LinkedIn's production metric for ranking fairness ([Geyik et al., KDD 2019](https://arxiv.org/abs/1905.01989)).

### 2.5 Recent (2022-2026) audit research on AI hiring tools

- **Bloomberg / GPT-3.5 audit (2024)** — 1,000+ resumes with equivalent qualifications but demographically distinct names; GPT-3.5 selected Asian-female names as top candidate for a financial analyst role 17.2% of the time vs Black-male names 7.6% ([Bloomberg](https://www.bloomberg.com/graphics/2024-openai-gpt-hiring-racial-discrimination/)).
- **JobFair (arXiv 2406.15484, 2024)** — counterfactual gender swap on GPT-4, Claude 3, Gemini; found statistically significant male preference in most models ([paper](https://arxiv.org/html/2406.15484v2)).
- **Silicone Ceiling (Armstrong et al., 2024)** — GPT-3.5/4 audited for both race and gender in resume screening; systemic disadvantages for women and Black candidates ([arXiv 2405.04412](https://arxiv.org/abs/2405.04412)).
- **Disability bias in GPT (Glazko et al., CHI 2024)** — [arXiv 2402.01732](https://arxiv.org/abs/2402.01732).
- **HBR 3-year field study (2025)** — algorithmic hiring locked in one definition of fit, reducing measured bias on some axes while amplifying homogeneity ([HBR, Dec 2025](https://hbr.org/2025/12/new-research-on-ai-and-fairness-in-hiring)).

### 2.6 Regulatory landscape (affects what metrics we must expose)

- **NYC Local Law 144** (effective July 2023): AEDTs used for hiring in NYC require an independent bias audit computing selection rates and **impact ratios** per EEOC race/ethnicity and sex categories, published publicly ([NYC DCWP rules](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page)).
- **EU AI Act** (in force 2024, high-risk provisions phased through 2026): resume screening explicitly listed as high-risk (Annex III), requiring risk management, data governance, bias monitoring, and human oversight ([EU AI Act text](https://artificialintelligenceact.eu/)).
- **EEOC** technical assistance (May 2023) confirms Title VII applies to algorithmic tools; 4/5ths rule as a screening threshold ([EEOC guidance](https://www.eeoc.gov/laws/guidance/select-issues-assessing-adverse-impact-software-algorithms-and-artificial)).
- **Illinois AI Video Interview Act, Colorado AI Act (SB 205, 2026)**, California ADS regulations — all trending toward mandatory audit reports.

### 2.7 Tools and libraries

| Library | Strengths | Weaknesses |
|---|---|---|
| **IBM AIF360** ([aif360.res.ibm.com](https://aif360.res.ibm.com/)) | 70+ fairness metrics, pre/in/post-processing mitigations | Heavy, sklearn-centric, ranking support weak |
| **Microsoft Fairlearn** ([fairlearn.org](https://fairlearn.org/)) | Clean API, MetricFrame is excellent for group metrics, dashboard | Focused on classification/regression |
| **Google What-If Tool / TFMA** | Interactive counterfactual analysis | TF-centric |
| **Aequitas** (CMU/DSSG) ([aequitas.dssg.io](http://aequitas.dssg.io/)) | Audit-report-oriented, produces the exact bias report format regulators expect | Less mitigation tooling |
| **Holistic AI** (open source + SaaS) ([holisticai.readthedocs.io](https://holisticai.readthedocs.io/)) | Ranking fairness metrics (exposure, NDKL), LLM bias | Newer, smaller community |
| **FairLens, Themis-ML** | Data-level bias detection | Narrower scope |
| **LangTest / DeepEval / Giskard** | LLM bias red-teaming (name swaps, prompt perturbation) | Coverage of hiring-specific tests varies |

### 2.8 Debiasing techniques

- **Pre-processing**: reweighing ([Kamiran & Calders, 2012](https://link.springer.com/article/10.1007/s10115-011-0463-8)), disparate-impact remover, resume anonymization (strip name, address, photo, graduation year).
- **In-processing**: adversarial debiasing ([Zhang et al., 2018](https://arxiv.org/abs/1801.07593)), constrained optimization (Fairlearn's ExponentiatedGradient), counterfactual data augmentation of training data.
- **Post-processing**: **FA*IR re-ranking**, calibrated equalized odds, threshold optimization per group. Post-processing is legally riskier in the US (disparate treatment) but common in EU frameworks.
- **Embedding debiasing**: [Bolukbasi et al., 2016](https://arxiv.org/abs/1607.06520) (word embedding gender subspace removal) — largely superseded by contrastive fine-tuning; note [Gonen & Goldberg, 2019](https://arxiv.org/abs/1903.03862) showed geometric debiasing is superficial.

### 2.9 Linguistic bias in JDs

- **Gender-coded language**: Gaucher et al. (2011) established masculine-coded words ("competitive," "dominant") deter women applicants. Operationalized in **Textio**, **Gender Decoder** ([open-source list](https://gender-decoder.katmatfield.com/)), **Ongig**.
- **Ableist language**, **age-coded terms** ("digital native," "young energetic team"), **degree inflation**: JD auditors flag these. LLMs (GPT-4o, Claude 3.5) are now competitive at detecting subtle coded language given a few-shot prompt with the taxonomy.

## 3. Recommended Approaches for Our Product

### 3.1 Architecture

Add a **Fairness & Bias Module** as a sidecar service to the matcher, with three subsystems:

1. **JD Auditor** (pre-match): scans JD text for coded language, illegal criteria (age, citizenship), unnecessary requirements (degree/experience inflation).
2. **Model Auditor** (pre-deployment + scheduled): runs counterfactual test suites and group-fairness metrics on the ranker.
3. **Decision Auditor** (post-hoc, on recruiter actions): monitors selection rates in produced shortlists and recruiter accept/reject patterns.

### 3.2 Concrete recommendations

**Fairness metrics to expose (dashboard):**
- **Adverse Impact Ratio (AIR)** per EEOC group at top-k (k=10, 25, 50) — required for NYC LL144 audits.
- **Equal Opportunity Difference** where "positive" = recruiter-advanced candidates (proxy for Y).
- **Exposure-based ranking fairness (NDKL)** across gender and race proxies.
- **Counterfactual invariance score**: % of resumes whose top-k inclusion is unchanged under name/pronoun swap. Target ≥ 95%.
- **Score gap under counterfactual**: mean |score(orig) − score(swapped)|. Target < 0.02 on 0-1 scale.

**Thresholds & alerts:**
- AIR < 0.80 → red flag, block deployment or trigger review (per EEOC 4/5ths).
- AIR 0.80-0.90 → yellow, log and monitor.
- Counterfactual score gap > 0.05 → investigate features.

**Libraries to adopt:**
- **Fairlearn** for MetricFrame group metrics and post-processing constraints. *Pro*: clean API, actively maintained; *Con*: limited ranking metrics — supplement with custom NDKL/rKL implementations.
- **Aequitas** to auto-generate the audit report PDF/HTML that HR & legal want. *Pro*: report format matches regulator expectations.
- **Holistic AI** for ranking-specific metrics (exposure, representation at top-k). *Pro*: only OSS lib with production-quality ranking fairness; *Con*: smaller community — pin versions.
- **LangTest** or a custom harness for counterfactual name-swap tests on the embedding/LLM path.

**Counterfactual name test set:** build from **Rosenman et al. (2023) name-race distributions** and Census SSA gender-name data — ≥20 names per (race × gender) cell, run through matcher, compute score deltas. Reuse the [Bloomberg methodology](https://www.bloomberg.com/graphics/2024-openai-gpt-hiring-racial-discrimination/) for face-validity.

**JD auditor stack:**
- Rule-based lexicons: Kat Matfield's masculine/feminine coded word list, an ageism list (curate from AARP + Textio publications), disability/ableism list.
- LLM auditor: GPT-4o-mini or Claude 3.5 Haiku with a structured taxonomy prompt; return spans + severity. Cross-check with lexicon rules to reduce hallucinated flags.
- Readability grade & degree-requirement flag (many "bachelor's required" roles legally don't need it).

**Debiasing the matcher itself:**
- **Anonymize by default** during scoring: strip name, address, photo, non-technical clubs, graduation dates, and college prestige signals from the resume prior to embedding. Provide reveal only after shortlisting. This alone mitigates ~60-80% of name-based bias per Bloomberg audit patterns.
- Fine-tune the semantic matcher on a **skills-to-JD** contrastive objective (e.g., using [ESCO](https://esco.ec.europa.eu/) or [O*NET](https://www.onetonline.org/) skill taxonomies) instead of resume-to-hire outcome labels — avoids the Amazon label-bias trap.
- Base semantic model: **`BAAI/bge-large-en-v1.5`** or **`intfloat/e5-large-v2`** for embeddings — competitive on MTEB and less politically fine-tuned than provider-hosted LLMs. Avoid using end-to-end LLM ranking without a counterfactual test gate, given the 2024 audit failures.

**Human oversight**: enforce that the system produces *shortlists with justifications*, not scores that auto-reject. Aligns with EU AI Act Art. 14 and reduces disparate-impact liability.

## 4. Key Numbers & Facts Table

| Fact | Value | Source |
|---|---|---|
| Amazon's model penalized "women's" tokens | Confirmed, scrapped 2018 | [Reuters](https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G) |
| EEOC 4/5ths rule threshold | AIR ≥ 0.80 | [EEOC UGESP](https://www.eeoc.gov/uniform-guidelines-employee-selection-procedures) |
| Bertrand-Mullainathan callback gap (white vs Black names) | ~50% more callbacks | [NBER 9873](https://www.nber.org/papers/w9873) |
| GPT-3.5 top-choice rate: Asian-female vs Black-male names | 17.2% vs 7.6% | [Bloomberg 2024](https://www.bloomberg.com/graphics/2024-openai-gpt-hiring-racial-discrimination/) |
| NYC LL144 audit required | Annual, publicly posted | [NYC DCWP](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page) |
| EU AI Act — resume screening classification | High-risk (Annex III) | [AI Act](https://artificialintelligenceact.eu/) |
| Kleinberg impossibility (calibration vs equalized odds) | Cannot co-satisfy when base rates differ | [arXiv 1609.05807](https://arxiv.org/abs/1609.05807) |
| Disability-award resumes ranked lower by GPT-4 | Confirmed | [Glazko et al. 2024](https://arxiv.org/abs/2402.01732) |
| LinkedIn NDKL production metric | Deployed in Talent Search | [Geyik et al. KDD 2019](https://arxiv.org/abs/1905.01989) |
| Fairlearn / AIF360 / Aequitas | Actively maintained OSS | respective docs |

## 5. Open Questions, Risks, and Gaps

1. **Ground-truth "qualified" labels are unavailable.** Without them, equal opportunity/odds are approximated with recruiter behavior — which itself is biased. *Mitigation*: expose demographic parity + counterfactual metrics as primary; treat equal opportunity as supplementary with disclaimers.
2. **Inferring protected attributes for auditing is legally fraught.** In the US, using BISG (Bayesian Improved Surname Geocoding) to infer race for internal audits is defensible; storing inferred attributes is risky. *Mitigation*: compute audit metrics ephemerally, don't persist inferred demographics per candidate.
3. **Intersectionality**: single-axis fairness misses Black-women-specific effects ([Buolamwini & Gebru, 2018](http://proceedings.mlr.press/v81/buolamwini18a.html)). Our dashboard should include intersectional subgroup metrics but sample-size caveats apply.
4. **LLM/embedding bias is unstable across model versions.** Provider updates can silently change fairness properties. *Mitigation*: pin model versions; run counterfactual regression tests in CI.
5. **Fairness ↔ accuracy trade-off is real but often overstated.** Post-processing on the ranker will slightly reduce nDCG; be prepared to justify to customers.
6. **JD bias detection false positives** annoy hiring managers (e.g., flagging "competitive salary"). Need a tunable strictness slider and clear rationale strings.
7. **Explainability**: SHAP over the semantic matcher is expensive; consider surrogate keyword-attribution models for per-candidate explanations required by EU AI Act Art. 13.
8. **Global vs local fairness definitions**: EU views group parity more favorably than US law does. Product may need jurisdiction-configurable metric sets.
9. **Adversarial candidates** who game the anonymized system (e.g., keyword stuffing) — separate risk but relevant to overall matcher robustness.
10. **Data-provenance risk**: training on scraped LinkedIn data has legal + bias exposure. Prefer synthetic + licensed data for any fine-tuning.

**Bottom line for the product team**: bias detection is not a single number but a *panel* of complementary metrics driven by regulatory context (NYC LL144, EU AI Act, EEOC). Build the pipeline around **counterfactual auditing + adverse impact + rank-exposure fairness**, anonymize aggressively at scoring time, and never let the model auto-reject — always route through a human with an explanation. This posture is both defensible against the failure modes of Amazon/GPT-era systems and aligned with 2024-2026 regulation.