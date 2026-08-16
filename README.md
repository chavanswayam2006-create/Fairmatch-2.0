# FairMatch — AI Resume-JD Matching Engine with Robustness & Fairness Auditing

**FairMatch** is a full-stack, modular, explainable, and auditable AI resume-to-job-description matching engine with a built-in fairness & robustness auditing layer.

Designed for high-precision recruiting teams, FairMatch ranks candidates based on semantic embedding similarity and structured skill/experience metrics while generating counterfactual transparency reports across candidate formatting structures, education tiers, and career gaps.

---

## 1. Features & Architecture

- **Sleek Minimal Black-and-White Interface**: Includes a high-end full-screen hero landing page (`FairMatch AI` design system) built with React 19, Vite, and Framer Motion (`motion/react`), featuring smooth viewport video backgrounds and responsive footer layouts.
- **Structured Resume & JD Ingestion**: Parses PDF, DOCX, and plain text documents using `pdfplumber` and `python-docx` to extract normalized skill taxonomies, years of experience, degree levels, and institution names.
- **Hybrid ML Matching Engine**: Combines `sentence-transformers` semantic similarity, Jaccard skill overlap, weighted tech skill matches, experience deltas, and education level ranks inside an **XGBoost Re-Ranker** model predicting match scores (0–100).
- **Per-Prediction SHAP Explainability**: Calculates SHAP values for every candidate score breakdown (e.g. `+18` skill overlap, `+12` semantic similarity, `-6` experience gap).
- **Counterfactual Robustness Auditing Harness**: Generates controlled perturbations across candidate name formatting structures (standard, hyphenated, mononym/initials, diacritics), university prestige tiers, and career gaps.
- **Fairness Metrics & Compliance**: Computes Formatting Parity Difference and Selection Rate Ratio (SRR). Automatically flags match runs where variant score gaps exceed a configurable threshold (default: `5.0` points).

---

## 2. Quick Start

### Running Backend API
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Train XGBoost matcher model (optional, synthetic weights included)
python backend/scripts/train_model.py

# Run FastAPI server
python backend/app/main.py
```
FastAPI server will run on `http://127.0.0.1:8000`. Access interactive API documentation at `http://127.0.0.1:8000/docs`.

### Running Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to view the full application (Hero Landing Page + FairMatch Dashboard).

---

## 3. Methodological Overview & ML Pipeline

```
Resume & JD Input
       │
       ├── Document Parser (PDF / DOCX / TXT)
       │     ├── Text & Contact Extraction
       │     ├── Skill Taxonomy Normalizer (Tech & Domain Skills)
       │     └── Years of Experience & Education Rank Classifier
       │
       ├── Feature Extraction Vector
       │     ├── Semantic Cosine Similarity (SentenceTransformers / TF-IDF)
       │     ├── Jaccard Skill Overlap Ratio
       │     ├── Weighted Skill Coverage Ratio
       │     ├── Experience Match Delta Score
       │     └── Education Level Rank Score
       │
       ├── XGBoost Re-Ranker Model (Outputs 0–100 Match Score)
       │
       ├── SHAP Explainability Engine (Per-candidate Feature Contributions)
       │
       └── Counterfactual Bias Audit Harness (Synthetic Perturbation & Fairlearn Metrics)
```

---

## 4. Limitations & Fairness Audit Scope

> [!WARNING]
> **Synthetic Proxy Testing Disclaimer**:
> The counterfactual bias detection module in FairMatch relies on **synthetic name and institution variants** generated dynamically for audit testing purposes.
> - **No Protected Attribute Collection**: FairMatch **never** collects, infers, or uses real demographic attributes (race, gender, age, disability) from actual candidate profiles.
> - **Synthetic Proxies as Audit Benchmarks**: Name lists and university classifications represent statistical proxy benchmarks. They serve to test whether the matching model's feature weights or semantic embeddings accidentally penalize specific naming structures, prestige tiers, or career gap formats.
> - **Human-in-the-Loop Requirement**: An audit flag indicates that counterfactual score variations exceeded allowable thresholds, requiring HR compliance review under regulations such as **NYC Local Law 144** or the **EU AI Act**. It does not constitute a legal determination of intent or bias.
