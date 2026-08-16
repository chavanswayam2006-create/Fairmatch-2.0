# Resume Parsing & Information Extraction Pipelines: Research Report

## 1. Executive Summary

Resume parsing has evolved from brittle regex/rule-based approaches (60–75% accuracy) through spaCy-based custom NER pipelines (85–88%) to LLM-based extractors that report 90%+ field-level accuracy on diverse layouts ([Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis)). For a production Resume/JD matching engine, the pragmatic architecture is a **hybrid pipeline**: high-fidelity document-to-text extraction (PyMuPDF as primary, pdfplumber for tables, OCR fallback via Tesseract/PaddleOCR, and layout-aware parsers like Docling/Marker for complex 2-column resumes), followed by an **LLM-based structured extraction** step (GPT-4o-mini / Claude Haiku / Llama-3-8B with JSON schema constraints) with a spaCy/regex safety net for contact fields. Handling 2-column layouts, scanned PDFs, and DOCX quirks remains the single biggest source of parsing errors and downstream matching/bias artifacts, so investment in text-extraction quality has higher ROI than swapping matcher models. This report specifies concrete libraries, models, thresholds, and a recommended architecture tailored to our product.

---

## 2. Detailed Findings

### 2.1 The Parsing Pipeline (Canonical Stages)

Modern resume parsers are composed of four stages ([MiHCM 2025](https://mihcm.com/resources/blog/ai-resume-parser-enhance-applicant-data-accuracy)):

1. **Document ingestion & text extraction** — convert PDF/DOCX/image → text + layout metadata.
2. **Section segmentation** — split into Contact, Summary, Experience, Education, Skills, Projects, Certifications.
3. **Entity extraction** — NER for names, orgs, dates, degrees, skills, titles.
4. **Normalization & linking** — map skills to taxonomies (ESCO, O*NET, EMSI/Lightcast), dates to ISO, degrees to canonical enums.

Stage 1 accuracy caps everything downstream: garbage text = garbage entities.

### 2.2 PDF/DOCX Extraction Libraries — Empirical Comparison

A public benchmark on 2,484 resumes across 20+ industries ([PDF Resume Extraction Framework](https://github.com/warazkhan/PDF-Resume-Text-Extraction-Analysis-Framework)) compared PyMuPDF, PyPDF2, pdfplumber, and Tesseract OCR. Key takeaways aligned with community consensus:

- **PyMuPDF (fitz)** — Fastest (10–50× PyPDF2), best default for text-based PDFs, preserves reading order reasonably for single-column. AGPL license is a concern; commercial license or PyMuPDF-based `pymupdf4llm` gives markdown-style output ideal for LLM ingestion ([PyMuPDF4LLM docs](https://pymupdf.readthedocs.io/en/latest/pymupdf4llm/)).
- **pdfplumber** — Slower but superior for **tables and precise bounding boxes**; useful for 2-column layouts because you can cluster words by x-coordinate. Built on pdfminer.six.
- **PyPDF2 / pypdf** — Reliable metadata but weaker text extraction; not recommended as primary.
- **pdfminer.six** — Solid low-level layout access; verbose API.
- **Tesseract OCR (via pytesseract + pdf2image)** — 95%+ character accuracy on clean scans, degrades on skewed or low-DPI ([MiHCM](https://mihcm.com/resources/blog/ai-resume-parser-enhance-applicant-data-accuracy)). PaddleOCR and AWS Textract typically outperform Tesseract on real-world scanned resumes.
- **Docling (IBM, 2024)** — Layout-aware document AI that outputs structured JSON with reading order, tables, and section hierarchy; strong on multi-column ([Docling GitHub](https://github.com/DS4SD/docling)).
- **Marker** (VikParuchuri) — PDF→Markdown converter using layout models (Surya OCR + LayoutLM-family); high fidelity for complex resumes, GPU-accelerated ([Marker GitHub](https://github.com/VikParuchuri/marker)).
- **Unstructured.io** — Popular pipeline with `partition_pdf` supporting hi-res mode (uses `detectron2` for layout); returns typed elements (Title, NarrativeText, ListItem) ([unstructured docs](https://docs.unstructured.io/)).
- **AWS Textract / Azure Document Intelligence / Google Document AI** — Managed OCR+layout with form/table extraction; production-grade for scanned resumes but $1.50–$50 per 1000 pages.
- **textract (Python)** — Wrapper over many backends (antiword, pdftotext); convenient but low quality relative to modern options.

For **DOCX**, `python-docx` gives structured paragraph/run access; convert legacy `.doc` via `libreoffice --headless --convert-to docx` or `antiword`.

### 2.3 2-Column Layouts, Scanned Resumes, and Reading Order

Two-column resumes (common in design/marketing/EU markets) are the top failure mode for naive parsers because linear text extraction interleaves left and right columns. Solutions:

- **Layout-aware models**: Docling, Marker, Unstructured hi-res, LayoutLMv3, or Nougat detect column regions and emit correct reading order.
- **Coordinate clustering with pdfplumber**: cluster words by x-midpoint using k-means (k=2), then sort each cluster top-to-bottom. Works well as a cheap heuristic.
- **Rendered PDF → vision LLM**: pass full-page images to GPT-4o / Claude 3.5 Sonnet / Gemini 2.0 with a JSON schema. This bypasses reading-order entirely and is now cost-competitive (~$0.005–0.02/resume with GPT-4o-mini).

For scanned resumes, the trend is toward **VLM-based parsers** (Resspar, GPT-4o vision, Qwen2.5-VL, InternVL) that take page images directly and generate structured JSON, obviating separate OCR ([Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis)).

### 2.4 Structured Extraction: Regex/NLP vs. LLM

**Regex/rule-based** (contact info, emails, phones, URLs, dates): still the highest-precision approach for well-defined patterns. Libraries: `phonenumbers`, `email-validator`, plus regex for LinkedIn/GitHub URLs.

**spaCy custom NER**: Trained on labeled resume corpora (e.g., DataTurks 220-resume dataset), reaches **85–88% F1** on entities like SKILL, ORG, DEGREE, DATE ([Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis)). Fast (~50–200 docs/sec on CPU), deterministic, but brittle to unseen formats and requires labeling investment.

**Open-source parsers**:
- **PyResparser** — spaCy + NLTK based; extracts name, email, phone, skills, education. Small skill dictionary; accuracy ~70–75% in the wild.
- **resume-parser-fast** / **pyresparser forks** — improved skill lists, still dictionary-driven.
- **OpenResume parser** ([xitanggg/open-resume](https://github.com/xitanggg/open-resume)) — browser-based, uses pdf.js + heuristics; excellent privacy story (client-side), moderate accuracy.
- **Affinda open-source components**, **HrFlow.ai SDK** — hybrid.
- **Sovren/Sovtech (now Textkernel)** — commercial, historically the accuracy leader before LLMs.

**LLM-based extraction**: A single prompt with a Pydantic/JSON schema on GPT-4o-mini or Claude 3.5 Haiku reaches **90%+ field-level accuracy** across diverse layouts without training data ([Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis)). Pros: zero training data, handles novel formats, multilingual (29–40+ languages per Textkernel/RChilli). Cons: cost ($0.001–0.02/resume), latency (1–5s), hallucination risk on missing fields, PII sent to third parties unless self-hosted.

**Hybrid is state of practice**: deterministic extractors for contact/URLs, LLM for narrative sections (experience bullets, projects, summary), taxonomy linker for skills.

### 2.5 Skill Extraction & Normalization

Skill extraction is where matching pipelines live or die:

- **Dictionary/gazetteer matching**: EMSI/Lightcast Open Skills (32k+ skills, free API), ESCO (13k skills, EU official), O*NET. Fast, explainable, but misses novel skills and confuses homographs ("Python" language vs. snake).
- **Contextual NER**: fine-tuned models like `jjzha/jobbert-base-cased` and `jjzha/escoxlmr-large-skill-extraction` from the **SkillSpan / ESCO-XLM-R** line ([Zhang et al., 2022, ACL](https://aclanthology.org/2022.naacl-main.366/)) achieve 0.60–0.75 F1 on the SkillSpan benchmark.
- **LLM extraction with taxonomy grounding**: prompt an LLM to extract skills, then embed and nearest-neighbor match to ESCO/Lightcast to canonicalize.

### 2.6 What Production ATS Systems Actually Do

Publicly documented behaviors of leading ATS/parsing vendors:

- **Textkernel** (used by Bullhorn, Monster, Randstad) — LLM parser with 29+ languages, semantic parsing, OCR, enrichment with external company/skill data ([Textkernel Parser](https://www.textkernel.com/products-solutions/parser/)).
- **RChilli** — 40+ languages, rich taxonomy tagging (skills, certifications, education), advertised **2-day integration** ([RChilli LLM parser](https://www.rchilli.com/documentation/feature-doc/llm-gpt-enhancement-parser)).
- **HireEZ, Eightfold, Beamery** — treat parsing as a means to build talent-graph embeddings; parse then embed into proprietary skill ontologies.
- **Workday, Greenhouse, Lever** — expose parsed fields but rely on Daxtra/Sovren/Textkernel under the hood.
- **Affinda** — API-first, publishes benchmarks claiming 95%+ on core fields.

Reported accuracies from vendors are typically measured on their own test sets; independent audits show **10–20 point drops on adversarial or creative layouts**.

---

## 3. Recommended Approach for OUR Product

### 3.1 Architecture

```
Upload (PDF/DOCX/image)
   │
   ├── Format detector (mimetype + magic bytes)
   │
   ├── Text extraction router:
   │     • Text-based PDF → PyMuPDF (pymupdf4llm markdown)
   │       + pdfplumber for tables
   │     • Complex layout (>1 col detected) → Docling OR Marker
   │     • Scanned/image PDF → PaddleOCR OR AWS Textract
   │     • DOCX → python-docx (paragraphs+styles)
   │     • Image → PaddleOCR
   │
   ├── Layout scoring (columns, tables, images) → route decision
   │
   ├── Structured extraction (hybrid):
   │     • Regex: email, phone (phonenumbers), URLs, dates
   │     • LLM (GPT-4o-mini or self-hosted Llama-3.1-8B-Instruct)
   │         with strict JSON schema (Pydantic + Instructor / Outlines)
   │         extracts: contact, education[], experience[], skills[],
   │         projects[], certs[], languages[]
   │     • spaCy NER as validator/fallback for skills & orgs
   │
   ├── Skill normalization → embed with `bge-small-en-v1.5` or
   │     `all-MiniLM-L6-v2`, nearest neighbor in ESCO + Lightcast
   │
   ├── Quality/confidence scoring per field (for bias audit trail)
   │
   └── Structured JSON → matching engine + audit log
```

### 3.2 Specific Recommendations

| Component | Recommendation | Rationale |
|---|---|---|
| Primary PDF text | **PyMuPDF** via `pymupdf4llm` | Fastest, markdown output ideal for LLM; watch AGPL |
| Complex layout | **Docling** (Apache-2.0) as primary, Marker as fallback | Best OSS layout AI in 2024–25 |
| OCR | **PaddleOCR** (open) + **AWS Textract** (managed fallback) | PaddleOCR outperforms Tesseract on real resumes; Textract for enterprise SLA |
| DOCX | `python-docx` + Mammoth for HTML view | Preserves styles/tables |
| Structured extraction | **GPT-4o-mini** with **Instructor** (Pydantic) or **Outlines** for constrained decoding | 90%+ accuracy at ~$0.001/resume; strict JSON |
| Self-host option | **Llama-3.1-8B-Instruct** or **Qwen2.5-7B-Instruct** via vLLM, JSON-constrained | For PII-sensitive customers (GDPR, EU AI Act) |
| Contact regex | `phonenumbers`, custom URL regex | Deterministic, near-100% precision |
| Skill extraction | LLM + **ESCO / Lightcast Open Skills** normalizer via embeddings | Explainable to bias auditors |
| Skill NER fallback | `jjzha/escoxlmr-large-skill-extraction` | Reproducible baseline for regression tests |
| Confidence scoring | Per-field LLM self-confidence + heuristic (regex hit, taxonomy match) | Feeds bias audit ("was skill X extracted with low confidence for candidate Y?") |

**Cost/latency budget** (target): <$0.01 and <4s per resume at p95.

### 3.3 Pros/Cons of the Recommended Stack

**Pros**
- Handles 2-column, scanned, and multilingual resumes.
- LLM extraction removes need for large labeled resume dataset (which we don't have).
- Deterministic regex + taxonomy normalization gives auditable trail for the bias-detection module.
- Self-host path exists for EU AI Act "high-risk" hiring compliance ([EU AI Act Art. 6 Annex III](https://artificialintelligenceact.eu/)).

**Cons**
- LLM cost scales with volume; must cache and batch.
- AGPL of PyMuPDF requires either license purchase or careful isolation.
- Docling/Marker require GPU for best throughput.
- LLM hallucination risk (fabricated employers/dates) — mitigate with schema constraints + span verification (require extracted strings to appear in source text).

### 3.4 Bias-Relevant Parsing Considerations

Parsing choices directly affect downstream bias:
- **Name/gender/ethnicity signals**: We must optionally **redact** names, addresses, photos, graduation years, and university names *before* the matching stage but *after* extraction into the audit-only path. Design the parser to emit these fields to a separate "sensitive attributes" bucket ([NYC Local Law 144](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page) mandates AEDT bias audits).
- **Photo detection**: PyMuPDF `page.get_images()` + face detector to flag photo-containing resumes (common in EU/LatAm/APAC) for redaction.
- **OCR error rates by demographic**: OCR error rates can vary with fonts common in non-English resumes; track parsing quality by language/region as a fairness metric.

---

## 4. Key Numbers & Facts Table

| Fact | Value | Source |
|---|---|---|
| Traditional ATS keyword parsing accuracy | 60–70% | [Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis) |
| Rule-based NLP parser accuracy | 75–80% | [Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis) |
| Custom spaCy NER accuracy | 85–88% | [Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis) |
| Multi-agent / LLM parser accuracy | 90%+ | [Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis) |
| OCR character accuracy (clean scan, Tesseract) | >95% | [MiHCM 2025](https://mihcm.com/resources/blog/ai-resume-parser-enhance-applicant-data-accuracy) |
| Textkernel LLM parser languages | 29+ | [Textkernel](https://www.textkernel.com/products-solutions/parser/) |
| RChilli LLM parser languages | 40+ | [RChilli](https://www.rchilli.com/documentation/feature-doc/llm-gpt-enhancement-parser) |
| RChilli claimed integration time | 2 days | [RChilli](https://www.rchilli.com/documentation/feature-doc/llm-gpt-enhancement-parser) |
| Benchmark dataset size (PDF extraction) | 2,484 resumes, 20+ industries | [warazkhan/PDF-Resume-Extraction](https://github.com/warazkhan/PDF-Resume-Text-Extraction-Analysis-Framework) |
| PyMuPDF speed vs. PyPDF2 | ~10–50× faster | community benchmarks, [PyMuPDF](https://pymupdf.readthedocs.io/) |
| ESCO skills taxonomy size | ~13,900 skills | [ESCO](https://esco.ec.europa.eu/) |
| Lightcast Open Skills taxonomy size | 32,000+ skills | [Lightcast Open Skills](https://lightcast.io/open-skills) |
| SkillSpan skill NER F1 (JobBERT) | 0.60–0.75 | [Zhang et al., NAACL 2022](https://aclanthology.org/2022.naacl-main.366/) |
| GPT-4o-mini extraction cost (typical resume) | ~$0.001–0.003 | OpenAI pricing 2024–25 |
| NYC AEDT bias audit annual requirement | Mandatory since Jul 2023 | [NYC LL 144](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page) |
| Reported screening time reduction (LLM matcher) | 70% (with 40% quality lift) | [Zylos 2026](https://zylos.ai/en/research/2026-01-18-ai-resume-matching-candidate-analysis) |

---

## 5. Open Questions, Risks & Gaps

1. **Ground-truth dataset**: We do not have a labeled resume corpus. Options: (a) hand-label 500–1000 resumes with Prodigy/Argilla; (b) use Kaggle Resume Dataset (2,400+); (c) synthesize with LLMs but risk distribution shift. **Risk**: without ground truth we cannot measure parser regressions or subgroup accuracy for bias reporting.

2. **License risk (PyMuPDF AGPL)**: If we ship parsing in a hosted SaaS, AGPL likely triggers source disclosure. Decision needed: buy commercial license (~$3–10k/yr) or switch to `pdfminer.six` + Docling.

3. **LLM data-residency & PII**: Enterprise HR customers (esp. EU) will resist sending resumes to OpenAI. We need a self-hosted Llama-3.1/Qwen2.5 path from day one and clear DPA documentation ([EU AI Act](https://artificialintelligenceact.eu/) classifies hiring AI as high-risk).

4. **Hallucination in structured extraction**: LLMs sometimes fabricate employers, dates, or degree names. Mitigation: verify every extracted span exists as a substring (or fuzzy match ≥ 0.9) in source text; drop or flag otherwise. Needs to be a hard gate.

5. **Two-column detection heuristic**: What signal triggers Docling vs. PyMuPDF? Column count via layout model adds latency. Proposal: run PyMuPDF first, run a cheap column detector on bounding boxes, escalate to Docling only if columns > 1 or text-density anomaly.

6. **Scanned resume prevalence**: Unknown in our target market. Need a customer sample to size OCR spend.

7. **Non-English & non-Latin scripts**: If we target India/MENA/APAC, we need to test Arabic RTL, CJK, and Devanagari. PaddleOCR and Textract handle these; PyMuPDF+regex fails on RTL.

8. **LinkedIn-style profiles**: Not a PDF problem — LinkedIn "Save to PDF" outputs a structured layout that's parseable, but scraped/pasted profiles need HTML/markdown handling. Consider a separate ingestion path.

9. **Skill taxonomy choice**: ESCO (EU-flavored, official, free) vs. Lightcast (broader, US-industry, freemium) vs. O*NET. This decision affects bias reporting (some taxonomies embed geographic/industry bias in their skill hierarchies).

10. **Bias-audit granularity**: Should per-field parsing confidence be surfaced in bias reports (e.g., "for candidates from University X, skill extraction confidence averaged 0.62 vs. 0.85 baseline")? This is a novel fairness metric but data-hungry.

11. **Versioning & reproducibility**: LLM extractors drift when providers update models. We must pin model versions (`gpt-4o-mini-2024-07-18`) and log them per parse for audit reproducibility — required under NYC LL 144 and EU AI Act.

12. **Throughput at scale**: A large customer bulk-uploading 100k historical resumes needs a batch path (async queue, spot GPUs for Docling/vLLM). Design for this early.