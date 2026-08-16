# Practical bias-detection features & debiasing for a Resume/JD Matching Engine

1) Executive summary
- Modern hiring products can and should combine linguistic audits (e.g., gendered wording in JDs), model-fairness testing (counterfactual/proxy analyses), stage-by-stage adverse impact monitoring, and transparent explanations to reduce bias risk. 
- Regulators (EEOC, NYC Local Law 144, EU AI Act, Colorado AI Act) increasingly expect auditable selection-rate reporting by protected group, documented risk management, and clear notices to candidates; toolkits like Fairlearn, AIF360, Aequitas, Evidently, and testing platforms like Giskard accelerate compliant implementations. 
- Practically, we can deploy: (a) JD bias analysis with rule-based lexicons plus ML scoring and paraphrase suggestions, (b) matching models with protected-attribute masking + counterfactual tests, (c) fairness dashboards with impact ratios and CIs, (d) proactive bias alerts and immutable audit logs, and (e) recruiter-facing explanations using SHAP/LIME and model cards. 
- Recommended stack: Fairlearn for mitigation via ExponentiatedGradient, AIF360 for pre/post-processing options (Reweighing, Calibrated Equalized Odds), Aequitas/Evidently for audit dashboards, Captum/SHAP for explainability, plus name-anonymization in parsing and secure, purpose-limited demographic collection for audits (as required by law/policy). 

2) Detailed findings

2.1 Regulatory and audit context
- EEOC Title VII adverse impact with software/AI: In 2023, EEOC clarified that employers using algorithmic tools must assess whether tools produce disparate impact; the “four-fifths rule” (impact ratio < 0.8) is a rule of thumb signal, not a safe harbor, and significance tests may be needed for small samples [EEOC Technical Assistance (2023)](https://www.eeoc.gov/laws/guidance/technical-assistance-document-assessing-adverse-impact-software-algorithms-and-ai). 
- Uniform Guidelines on Employee Selection Procedures codify the 4/5ths rule and stress stage-level analyses (applicant → interview → offer) [UGESP, 29 CFR Part 1607](https://www.govinfo.gov/content/pkg/CFR-2019-title29-vol4/pdf/CFR-2019-title29-vol4-part1607.pdf). 
- NYC Local Law 144 (2023–): requires annual independent bias audits of automated employment decision tools and publication of selection or scoring impact by sex and race/ethnicity groups [NYC DCWP AEDT rules](https://rules.cityofnewyork.us/rule/notice-of-adoption-rules-regarding-automated-employment-decision-tools/). 
- NIST AI Risk Management Framework (2023) recommends continuous monitoring, documentation, and measurement of socio-technical harms and bias [NIST AI RMF 1.0](https://www.nist.gov/itl/ai-risk-management-framework). 
- EU AI Act (2024 text) classifies employment AI as “high-risk,” mandating data governance, logging, transparency, and post-market monitoring of performance and bias [EU AI Act, consolidated text 2024](https://eur-lex.europa.eu/). 
- Colorado AI Act (2024; effective 2026) imposes risk management and impact assessment obligations for “high-risk” AI decisions, including employment [Colorado SB24-205](https://leg.colorado.gov/bills/sb24-205).

Implication: Our product must compute and present adverse impact/selection rates by stage and group, log decisions, enable independent audits, and provide notices and documentation.

2.2 JD bias detection: gendered wording and inclusive language
- Gendered wording matters: controlled experiments show that “masculine-coded” wording in job ads reduces women’s sense of belonging and job appeal; swapping to “feminine-coded” wording can change applicant interest [Gaucher et al., 2011](https://journals.sagepub.com/doi/10.1177/0361684310385093). Tools such as Gender Decoder use Gaucher’s lexicons [Gender Decoder word list](https://github.com/katmatfield/gender-decoder). 
- Commercial inclusive-language tools (Textio, Datapeople) pair lexicons with ML models to suggest replacements and predict candidate pool impact; while proprietary, they popularized guidance like separating must-have vs. nice-to-have requirements and avoiding exclusionary terms [Textio overview](https://textio.com/). 
- Open-source inclusion linters like alex.js and “woke” can flag insensitive phrasing; integrating curated vocabularies for hiring (e.g., “rockstar,” “ninja,” “aggressive”) improves relevance [alex.js](https://github.com/get-alex/alex), [woke](https://github.com/get-woke/woke). 
- Paraphrase debiasing: counterfactual data augmentation and paraphrasing methods reduce gendered cues in text. While often explored in NLP tasks, they generalize: generate alternative JD phrasings that minimize gender cues while preserving constraints [Maudslay et al., 2019](https://aclanthology.org/P19-1165/). 
- Practical checklists: clarity on must-have vs. nice-to-have; avoid long laundry lists; limit unnecessary credentialism; use neutral titles; avoid exclusionary benefits framing; state pay range; describe flexible work policies; and add explicit inclusion statements. These changes have been linked to broader applicant pools in practice-oriented guides [LogicMelon (2024)](https://logicmelon.com/blog-post/adverse-impact).

2.3 Model fairness testing and debiasing for resume/JD matching
- Dropping protected attributes alone doesn’t remove bias because proxies persist (e.g., college, zip code, first name, organizations); fairness literature consistently warns against “fairness through unawareness” [Barocas, Hardt, Narayanan (Fair ML Book)](https://fairmlbook.org/). 
- Counterfactual/protected-attribute tests: Flip gendered names on identical resumes (or synthetically swap proxies) and check if rankings/scores change; strong evidence of encoded bias if decisions vary solely due to protected status. This method is widely endorsed in practical bias audits and tooling [VisionTrainingSystems (2026)](https://www.visiontrainingsystems.com/blogs/evaluating-bias-and-fairness-in-ai-algorithms-techniques-and-metrics). Causal variants formalize it: counterfactual situation testing (CST) examines “what would the outcome be if protected status differed” [CST, FAccT](https://dl.acm.org/doi/fullHtml/10.1145/3617694.3623222); counterfactual fairness provides a theoretical basis [Kusner et al., 2017](https://arxiv.org/abs/1703.06856). 
- Fairness metrics: 
  - Selection/impact ratio (IR) and pass-through rates by group at each funnel stage [EEOC (2023)](https://www.eeoc.gov/laws/guidance/technical-assistance-document-assessing-adverse-impact-software-algorithms-and-ai). 
  - Error-rate parity (FPR/FNR) and equalized odds; demographic parity vs. predictive parity tradeoffs [Fairlearn metrics](https://fairlearn.org/). 
  - Ranking fairness: exposure-aware metrics recognize harms in rank order, not just binary selection [Biega et al., 2018](https://dl.acm.org/doi/10.1145/3209978.3210063). 
- Mitigation strategies:
  - Pre-processing: Reweighing or learning fair representations reduce bias without changing model architecture [AIF360 docs](https://aif360.res.ibm.com/). 
  - In-processing: Constrained optimization (e.g., ExponentiatedGradient) enforces fairness during training [Agarwal et al., 2018; Fairlearn](https://fairlearn.org/main/user_guide/mitigation/exponentiated_gradient.html). 
  - Post-processing: Calibrated Equalized Odds or threshold optimization adjust decisions after scoring [AIF360 mitigations](https://aif360.readthedocs.io/). 
- Explainability: SHAP and LIME provide local feature attributions and reason codes; for deep transformer models, Captum (integrated gradients) and SHAP Transformers explain contributions of tokens/skills to match scores [SHAP](https://shap.readthedocs.io/), [LIME](https://arxiv.org/abs/1602.04938), [Captum](https://captum.ai/). 
- Ongoing monitoring: Slice-based dashboards (Fairlearn, Aequitas) and production monitors (Evidently, WhyLabs, Arize) track drift and fairness metrics over time; bias audits must be continuous, not one-off [Aequitas](https://aequitas.ml/), [Evidently fairness docs](https://docs.evidentlyai.com/user-guide/fairness/overview). 

2.4 Adverse impact analysis implementation
- Four-fifths rule: For each protected group g, IR_g = SelectionRate_g / SelectionRate_max. IR < 0.8 suggests adverse impact warranting further analysis [EEOC (2023)](https://www.eeoc.gov/laws/guidance/technical-assistance-document-assessing-adverse-impact-software-algorithms-and-ai). 
- Statistical tests: Chi-square or Fisher’s exact for small samples can supplement IR; OFCCP often flags disparities also by “two standard deviations” (≈ p < 0.05) to identify practical significance [UGESP; OFCCP guidance](https://www.dol.gov/agencies/ofccp/faqs). 
- Confidence intervals: Provide CIs around selection rates and IR via bootstrapping or delta method; display “insufficient data” when n is low (e.g., n<30) to reduce false alarms [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework). 
- Per-stage analysis: Audit attractions (views→applies), screening (applies→interviews), interviews→offers, offers→accepts, plus model-score distributions by group to detect earlier funnel barriers [EEOC (2023)](https://www.eeoc.gov/laws/guidance/technical-assistance-document-assessing-adverse-impact-software-algorithms-and-ai).

2.5 Protected attribute handling, inference, and privacy
- Collecting demographics enables auditing; simply refusing to collect can hinder fairness measurement. Lawful approaches include voluntary, purpose-limited, and securely stored self-ID with role-based access control [EEOC (2023)](https://www.eeoc.gov/laws/guidance/technical-assistance-document-assessing-adverse-impact-software-algorithms-and-ai), [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework). 
- Where self-ID is missing, name-based inference (e.g., Ethnicolr, wru, NamSor) is sometimes used for internal audits—but has accuracy and ethical limits and should be restricted, with opt-outs, aggregation, and never used in individual decisions [Ethnicolr](https://pypi.org/project/ethnicolr/), [wru](https://cran.r-project.org/web/packages/wru/), [NamSor](https://www.namsor.com/). 
- Parsing/matching hygiene: Mask names, photos, pronouns, and addresses during initial scoring to reduce direct bias; unmask later for human review. Proxy features (college, organizations) may still encode bias; thus masking is necessary but not sufficient [Fair ML Book](https://fairmlbook.org/). 

2.6 Fairness dashboards, alerts, and ATS audit trails
- Effective dashboards show: 
  - Stage-by-stage selection rates and IR by group (with CIs and sample sizes), 
  - Score distribution overlays, 
  - Top feature contributions per group (SHAP by slice), 
  - Threshold simulations (“what if we set interview cutoff to X?”), 
  - Data quality flags (missing demographics), 
  - Explanations and references to policy (e.g., “IR <0.8 triggers review per policy”). 
  Patterns from audit toolkits and regulatory guidance emphasize clarity, context, and documentation [Aequitas](https://aequitas.ml/), [Fairlearn dashboard](https://fairlearn.org/). 
- Bias alerts: Trigger alerts when IR < 0.8 and n≥a minimum per our policy, when subgroup false negatives spike, or when drift in applicant pool shifts predicted group mix. Escalate and require attestation before proceeding [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework). 
- Audit trails: Immutable logs of model versions, features, thresholds, data snapshots, decisions, overrides, rationale (reason codes), and who/when viewed or changed settings—aligned to NYC LL144 publishables and EU/Colorado logging expectations [NYC DCWP AEDT](https://rules.cityofnewyork.us/rule/notice-of-adoption-rules-regarding-automated-employment-decision-tools/), [EU AI Act synopsis](https://eur-lex.europa.eu/). 

3) Recommended approaches for OUR product

3.1 JD bias analyzer
- Pipeline: 
  - Rule-based lexicon pass using curated masculine-/feminine-coded words seeded from Gaucher et al. and Gender Decoder, expanded with embeddings and domain review [Gaucher 2011](https://journals.sagepub.com/doi/10.1177/0361684310385093), [Gender Decoder list](https://github.com/katmatfield/gender-decoder). 
  - ML scoring: fine-tune a small transformer classifier (e.g., DistilBERT) to predict “masculine-coded,” “feminine-coded,” “neutral” segments; train on annotated job ad snippets and augmented paraphrases. 
  - Paraphrase suggestions: Use Flan-T5-Small/XL with constrained decoding to replace flagged spans with neutral alternatives while preserving semantics; keep a deterministic top-k of vetted replacements (e.g., “aggressive”→“proactive,” “dominant”→“confident leader”). 
  - Inclusive checklist and readability: enforce must-have vs nice-to-have, pay range presence, reasonable requirement count (≤8 must-haves), and inclusive benefits statements. 
- Libraries/vendors: 
  - Rule-based: alex.js (extend dictionary) [alex.js](https://github.com/get-alex/alex). 
  - Paraphrase: Hugging Face transformers with Flan-T5; add a lexical constraint list; human-in-the-loop for first iteration. 
- Pros: fast, actionable, measurable; Cons: lexicon false positives; mitigation with ML + human review. 
- KPI: track applicant pool diversity and pass-through rate shifts after JD edits; compute pre/post IR at apply stage.

3.2 Parsing and anonymization
- During initial scoring, strip/mask: name, photo, pronouns, full address, birth year, marital status, headshots. Use deterministic placeholders so text lengths remain stable. 
- Entity filters: maintain a list of sensitive organizations (e.g., religious/affinity groups) to mask in first-pass scoring; keep a provenance map so recruiters can unmask later. 
- Tradeoff: small loss in context (e.g., networking groups may signal leadership) vs. reduced leakage of protected status.

3.3 Matching model fairness and explanations
- Model choices: 
  - Bi-encoder for retrieval (e.g., bge-small-en-v1.5 or e5-base) and a cross-encoder reranker (e.g., cross-encoder/ms-marco-MiniLM-L-6-v2) for top-N candidates; logit scores normalized to [0,100]. 
  - Add a transparent rules-based layer for must-have skills to gate minimum qualification. 
- Explainability: 
  - Use SHAP KernelExplainer for tabular features (skills matches, years, certifications). 
  - Use Captum integrated gradients on cross-encoder token inputs to highlight JD-vs-resume phrases driving relevance. 
  - Provide recruiter-facing reason codes: “+7: Required skill Python (5y) matched,” “−5: Missing ISO 27001,” “+3: Similar project: data migration,” with links to highlighted text [SHAP](https://shap.readthedocs.io/), [Captum](https://captum.ai/). 
- Fairness checks: 
  - Counterfactual set: For each shortlisted candidate, auto-generate variants with gender-flipped names and neutralized pronouns; verify rank/score changes ≤ epsilon (e.g., 1 score point or 1 rank position) for at least 95% of tests; investigate outliers [CST approach](https://dl.acm.org/doi/fullHtml/10.1145/3617694.3623222). 
  - Proxy ablation: Retrain/evaluate with removal or noise-injection on proxy features (college, zip); quantify effect on subgroup scores. 
- Mitigation: 
  - Start with pre-processing reweighing in AIF360 and then, if needed, in-processing ExponentiatedGradient in Fairlearn to enforce bounded demographic parity or equalized odds at the interview-threshold decision [Fairlearn EG](https://fairlearn.org/main/user_guide/mitigation/exponentiated_gradient.html), [AIF360](https://aif360.res.ibm.com/). 
  - If retraining isn’t feasible, post-process using Calibrated Equalized Odds or threshold-per-group with legal review (note: sensitive legally; document rationale) [AIF360](https://aif360.readthedocs.io/). 
- Ranking fairness: 
  - Monitor exposure parity within Top-K (e.g., top-10) by group for high-volume requisitions; use Biega et al.’s exposure-aware metrics to detect systemic underexposure [Biega 2018](https://dl.acm.org/doi/10.1145/3209978.3210063).

3.4 Adverse impact and fairness dashboard
- Metrics engine: 
  - Compute selection rates (per stage) and impact ratios by sex and race/ethnicity (following NYC LL144 categories when applicable), plus optional age and disability where lawful/collected. 
  - Provide 95% CIs via bootstrap (≥1000 resamples) and suppress reporting when n<30 per group unless explicitly requested with caution banners. 
  - Add statistical tests (chi-square; Fisher exact if expected counts <5) and OFCCP-style 2-SD flags [UGESP](https://www.govinfo.gov/content/pkg/CFR-2019-title29-vol4/pdf/CFR-2019-title29-vol4-part1607.pdf). 
- Dashboard design: 
  - Default view: Funnel with pass-through rates by group and IR badges (green ≥0.9, amber 0.8–0.9, red <0.8). 
  - Slice explorer: Job family, location, recruiter, source channel; export CSV/JSON and an audit-ready PDF. 
  - Threshold sandbox: Adjust interview cutoff and simulate IR/utility tradeoffs with Pareto curves. 
  - Data quality: Missingness panel and confidence indicators. 
- Tooling: 
  - Use Aequitas for quick audits/report templates [Aequitas](https://aequitas.ml/). 
  - Embed Fairlearn for mitigation experiments and comparative metric views [Fairlearn](https://fairlearn.org/). 
  - Use Evidently for continuous production monitoring and alerts [Evidently](https://docs.evidentlyai.com/user-guide/fairness/overview). 

3.5 Bias alerts and audit trails
- Alerts: 
  - Real-time Slack/Email when IR <0.8 with n≥30 at any stage; when subgroup FNR exceeds overall by >10pp; or when distribution drift in applicant demographics >5 SD from baseline week. 
  - Integrate with ticketing (Jira) to require owner acknowledgment and remediation notes. 
- Audit logging: 
  - Store: model version hash, training data snapshot ID, feature schema, thresholds, decision scores, reasons, recruiter overrides, time/user stamps. 
  - Immutable store: append-only (e.g., WORM S3 or immutable ledger DB), retention ≥3 years or per policy; periodic hash attestations for integrity [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework). 
  - NYC LL144: generate public audit summary with latest annual audit metrics; candidate notice templates (10 days in advance) and opt-out instructions [NYC DCWP](https://rules.cityofnewyork.us/rule/notice-of-adoption-rules-regarding-automated-employment-decision-tools/). 

3.6 Data and protected attribute governance
- Demographic data collection: Provide voluntary, separate-from-application forms with clear purposes, storage isolation, RBAC, and de-identification for analytics; aggregate in reports; never feed into per-candidate decisions.
- Inference (if used): Confine to offline, aggregated audit computations; document accuracy and error bars; allow customer opt-out. 
- DPIA/RAI: For EU/Colorado customers, ship templates for risk assessments and model cards (training data, known limitations, fairness test results) [EU AI Act](https://eur-lex.europa.eu/), [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework). 

4) Key numbers & facts table

- Four-fifths rule (80% rule): IR < 0.8 suggests adverse impact requiring investigation [EEOC (2023)](https://www.eeoc.gov/laws/guidance/technical-assistance-document-assessing-adverse-impact-software-algorithms-and-ai).
- UGESP: analyze selection procedures at each stage; keep validation evidence and records [UGESP](https://www.govinfo.gov/content/pkg/CFR-2019-title29-vol4/pdf/CFR-2019-title29-vol4-part1607.pdf).
- NYC LL144: requires independent annual bias audits; publish selection/scoring rates and impact by sex and race/ethnicity groups [NYC DCWP AEDT](https://rules.cityofnewyork.us/rule/notice-of-adoption-rules-regarding-automated-employment-decision-tools/).
- NIST AI RMF: calls for continuous measurement, documentation, and socio-technical risk management [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework).
- Gaucher et al. (2011): masculine-coded wording in job ads reduced women’s job appeal and sense of belonging in experiments [Gaucher 2011](https://journals.sagepub.com/doi/10.1177/0361684310385093).
- Gender Decoder: open lexicon tool built from Gaucher lists for job ad analysis [Gender Decoder](https://github.com/katmatfield/gender-decoder).
- Counterfactual testing: change only protected status (e.g., name) and check if decision changes; strong evidence of bias if it does [CST paper](https://dl.acm.org/doi/fullHtml/10.1145/3617694.3623222).
- Mitigation toolkits: Fairlearn (in-processing EG), IBM AIF360 (pre/post-processing), Aequitas (audit) [Fairlearn](https://fairlearn.org/), [AIF360](https://aif360.res.ibm.com/), [Aequitas](https://aequitas.ml/).
- Explainability: SHAP and LIME widely used for local feature attribution; Captum for deep models [SHAP](https://shap.readthedocs.io/), [LIME](https://arxiv.org/abs/1602.04938), [Captum](https://captum.ai/).
- Ranking fairness: exposure-based fairness for Top-K rankings to avoid systemic underexposure [Biega 2018](https://dl.acm.org/doi/10.1145/3209978.3210063).
- Statistical tests: use chi-square or Fisher’s exact with small samples to supplement IR; consider “2 SD” heuristic used in audits [OFCCP FAQs](https://www.dol.gov/agencies/ofccp/faqs).
- Colorado AI Act: high-risk AI (employment) covered; effective 2026; requires risk management and notices [SB24-205](https://leg.colorado.gov/bills/sb24-205).
- Name-based demographic inference libraries: Ethnicolr (Python), wru (R); use only for audits and with caution [Ethnicolr](https://pypi.org/project/ethnicolr/), [wru](https://cran.r-project.org/web/packages/wru/).
- Monitoring tools: Evidently supports fairness monitoring and dashboards [Evidently](https://docs.evidentlyai.com/user-guide/fairness/overview).

5) Concrete recommendations for our product

5.1 Must-ship features (Phase 1: 8–12 weeks)
- JD Bias Analyzer:
  - Lexicon + ML hybrid detector with Gaucher-derived vocabulary extended for tech roles; show per-sentence flags, neutral alternatives, and an “Inclusive JD Score.”
  - Enforce structured JD authoring: must-have vs nice-to-have, pay range, remote/flexible options checkbox; measure readability (e.g., Flesch).
- Anonymized first-pass scoring: Mask names, pronouns, photos, and addresses; strip headshots at parse; log masking policy to audit trail.
- Explainable matching:
  - Reason codes with top contributing skills/experiences (± contributions) and highlighted text.
  - SHAP on tabular features; Captum integrated gradients for cross-encoder tokens.
- Fairness and adverse impact reporting:
  - Compute selection rates and IR by sex and race/ethnicity where available; bootstrap 95% CIs; per-stage funnel charts.
  - Set policy thresholds: flag IR <0.8 with n≥30; amber for 0.8–0.9; require reviewer attestation before moving high-volume requisitions forward.
- Bias alerting + audit logs:
  - Slack/Email alerts when thresholds breached; create tickets with assigned owners.
  - Immutable audit logs storing model version, features, decisions, reasons, overrides, thresholds, and metrics snapshots.

5.2 Bias testing and mitigation (Phase 2: 8–12 weeks)
- Counterfactual testing harness:
  - Auto-generate gender-swapped and pronoun-neutral resumes for shortlisted candidates; assert ≤1 rank position or ≤1-point score shift in ≥95% of tests; report exceptions with token importance.
- Mitigation toolkit integration:
  - AIF360 pre-processing reweighing for training datasets; compare to baseline.
  - Fairlearn ExponentiatedGradient with demographic parity or relaxed equalized odds constraint at the interview decision threshold; measure utility/fairness tradeoffs; retain best model per policy.
- Ranking exposure audit:
  - For high-volume roles, compute exposure parity in Top-10/Top-20; alert when disparities exceed 10–15% absolute difference.

5.3 Governance and compliance (Ongoing)
- Demographic data collection:
  - Provide optional, separate self-ID forms; encrypt at rest; restrict to analytics service; publish privacy notice and data minimization policy.
- NYC LL144 support pack:
  - Export of required audit tables, public posting template, candidate notice template (10-day notice), and API endpoints for independent auditors.
- Model and system cards:
  - Publish training data summaries, known limitations (e.g., potential proxies), fairness test results (IR, error-rate parity), and mitigation used; link from dashboard.

5.4 Implementation specifics (libraries, models, thresholds)
- Libraries: 
  - NLP: Hugging Face transformers (Flan-T5, MiniLM cross-encoder), spaCy for parsing.
  - Explainability: shap>=0.45, captum>=0.7.
  - Fairness: fairlearn>=0.10, aif360>=0.6, aequitas>=0.42, evidently>=0.4.
  - Linters: alex.js as service, custom rule packs.
- Thresholds (initial; tune with customer policy): 
  - IR red flag <0.8, amber 0.8–0.9; minimum n per group 30 for flagging, 15 for “directional” amber with caution banner.
  - Counterfactual sensitivity: allowable max score delta 1 point or rank delta 1 for ≥95% of tested cases.

6) Open questions / risks / gaps
- Legal posture on post-processing by group: Adjusting thresholds per group (to satisfy equalized odds) can be sensitive under anti-discrimination law; require customer legal counsel and configuration toggles with clear documentation [EEOC (2023)](https://www.eeoc.gov/laws/guidance/technical-assistance-document-assessing-adverse-impact-software-algorithms-and-ai).
- Demographic inference ethics/accuracy: Name-based inference is imperfect and can introduce its own bias; should be opt-in, aggregated, and disabled by default in regulated deployments [Ethnicolr](https://pypi.org/project/ethnicolr/).
- Small sample sizes: Many requisitions have low n, making IR unstable; we need robust CIs, Bayesian shrinkage, or pooled analyses across time while transparently communicating uncertainty [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework).
- Ranking fairness metrics: Exposure parity is research-grade; customers may find it unfamiliar. Provide education and keep core compliance metrics (IR) front-and-center [Biega 2018](https://dl.acm.org/doi/10.1145/3209978.3210063).
- LLM paraphrase safety: Automated JD rewrites can change meaning or add commitments. Keep changes constrained and human-reviewed; preserve legal phrasing and pay transparency mandates.
- Proxy leakage: Even with name masking, proxies persist (schools, orgs). We must combine masking with counterfactual testing and mitigation; periodically review feature importances by slice [Fair ML Book](https://fairmlbook.org/).
- Global regulatory divergence: EU AI Act vs. US state/local rules (NYC, Colorado) differ; ship policy profiles per jurisdiction and keep updated as rules evolve.
- Recruiter experience trade-offs: Alerts and gating can create friction. Provide clear UX cues, override workflows with rationale capture, and KPIs showing improved fairness without undue burden.
- Data integration quality: Demographic fields from ATS/HRIS may be inconsistent; invest in schema mapping, validation, and secure isolation to avoid leakage into matching.

References (inline above)
- EEOC Technical Assistance (2023): assessing adverse impact with AI
- UGESP (29 CFR Part 1607)
- NYC DCWP AEDT rules
- NIST AI Risk Management Framework (2023)
- EU AI Act (2024 consolidated text)
- Colorado SB24-205 (2024)
- Gaucher et al. (2011) gendered wording in job ads
- Gender Decoder word lists
- Fairlearn, AIF360, Aequitas, Evidently toolkits
- SHAP, LIME, Captum explainability
- Counterfactual situation testing (CST)
- Ranking exposure fairness (Biega et al., 2018)
- Practical guidance on JD inclusivity (LogicMelon blog, 2024)

Appendix: Implementation snippets (high level)
- Impact ratio calculation:
  - For each group g: SR_g = selected_g / applicants_g; IR_g = SR_g / max_h SR_h. 
  - Bootstrap 95% CI for IR_g with 1000 resamples; flag if IR_g < 0.8 and n_g ≥ 30.
- Counterfactual testing harness:
  - Generate name-swapped copies (e.g., via a curated gendered-name list); re-score; compute deltas; log failing cases with token attributions (Captum).
- JD rewrite guardrails:
  - Only allow substitutions from vetted dictionary; enforce max-edit distance per sentence; require reviewer approval for high-impact sections (title, comp, EEO statements).