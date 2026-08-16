# FairMatch Integration Guide

This guide explains how to merge and embed the **FairMatch** Resume-JD Matching & Bias Detection Engine into an existing host application.

---

## 1. Architecture Overview

FairMatch is built as a **standalone microservice**:
- **Backend API**: FastAPI service running independently on port `8000`. Communicates with host applications server-to-server via REST API (`X-API-Key` authentication).
- **Frontend Dashboard / Widget**: React 19 + TypeScript application buildable as a standalone app or exported as an embeddable React library component (`FairMatchWidget`).

---

## 2. Backend Deployment

### Option A: One-Command Docker Compose Deployment
Deploy the API service alongside PostgreSQL using Docker Compose:

```bash
docker-compose up --build -d
```

The API service will start on `http://localhost:8000` with interactive OpenAPI documentation available at `http://localhost:8000/docs`.

### Option B: Local Python Environment
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```

### Environment Variables
| Environment Variable | Default Value | Purpose |
|----------------------|---------------|---------|
| `DATABASE_URL` | `sqlite:///./fairmatch.db` | Database connection string (SQLite or PostgreSQL) |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed host origins |

---

## 3. Authentication (`X-API-Key`)

All requests from the host site backend to FairMatch require an API Key passed in the request headers:

```http
X-API-Key: fairmatch-secret-key
```

Host applications perform user authentication on their own site and invoke FairMatch server-to-server or directly via authenticated client requests.

---

## 4. Embedding the React Widget

To embed FairMatch in a React host website:

```bash
npm install @neuralkinetics/fairmatch-widget
```

Import and place the `<FairMatchWidget />` component anywhere in your JSX:

```tsx
import { FairMatchWidget } from '@neuralkinetics/fairmatch-widget';

export function RecruiterDashboard() {
  return (
    <div className="candidate-match-card">
      <FairMatchWidget
        apiBaseUrl="https://api.yourdomain.com"
        apiKey="fairmatch-secret-key"
        jobId="job_12345"
        themeColor="#000000"
        onMatchComplete={(report) => {
          console.log('Match scores ready:', report);
        }}
      />
    </div>
  );
}
```

### Widget Props
- `apiBaseUrl`: URL of the FairMatch backend service (default: `http://127.0.0.1:8000`)
- `apiKey`: Host API Key header string
- `jobId`: Target Job Description ID
- `themeColor`: Primary brand accent color (default: `#000000`)
- `onMatchComplete`: Callback function triggered when candidate scoring completes

---

## 5. Non-React iFrame Embedding Fallback

For host websites built with HTML/PHP/Ruby/Python template engines:

```html
<iframe
  src="https://fairmatch.yourdomain.com?widget=true&job_id=job_12345&api_key=fairmatch-secret-key"
  width="100%"
  height="500"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e4e4e7;"
></iframe>
```

---

## 6. Core REST API Endpoints

```http
POST   /api/v1/jobs                 — Create job description
POST   /api/v1/resumes              — Upload resume (PDF, DOCX, Text)
POST   /api/v1/match                — Execute matching & SHAP feature breakdown
POST   /api/v1/bias-audit/{run_id}  — Trigger counterfactual bias test
GET    /api/v1/bias-audit/{run_id}  — Get counterfactual fairness report
GET    /api/v1/runs                 — List historical match runs
GET    /api/v1/runs/{run_id}        — Get detailed run results & audit log
```
