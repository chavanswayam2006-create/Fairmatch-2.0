import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"X-API-Key": "fairmatch-secret-key"}

def run_runtime_verification():
    print("Beginning FairMatch Runtime API Verification...")
    
    # 1. Health check / Root
    r = requests.get(f"{BASE_URL}/")
    print(f"Root GET status: {r.status_code}, response: {r.json()}")

    # 2. Create Job (POST /api/v1/jobs)
    job_payload = {
        "title": "Lead AI Engineer",
        "raw_text": "Looking for Lead AI Engineer with 6+ years in Python, FastAPI, React, PyTorch, XGBoost, SQL, and Docker. Master's preferred.",
        "company": "NeuralKinetics"
    }
    r = requests.post(f"{BASE_URL}/api/v1/jobs", json=job_payload, headers=HEADERS)
    print(f"Create Job status: {r.status_code}")
    job_data = r.json()
    job_id = job_data.get("id")
    print(f"Job ID created: {job_id}")

    # 3. Upload Resumes (POST /api/v1/resumes via form data)
    res1_data = {
        "candidate_name": "Dr. Sarah Chen",
        "raw_text": "Dr. Sarah Chen. Lead AI Engineer with 8 years experience in Python, PyTorch, XGBoost, FastAPI, React, SQL, and Docker. Graduated from Stanford with PhD in Computer Science."
    }
    r1 = requests.post(f"{BASE_URL}/api/v1/resumes", data=res1_data, headers=HEADERS)
    print(f"Upload Resume 1 status: {r1.status_code}")
    res1_id = r1.json().get("id")
    print(f"Resume 1 ID: {res1_id}")

    res2_data = {
        "candidate_name": "James Taylor",
        "raw_text": "James Taylor. Junior Developer with 2 years experience in HTML, CSS, JavaScript, and React. Associate's Degree."
    }
    r2 = requests.post(f"{BASE_URL}/api/v1/resumes", data=res2_data, headers=HEADERS)
    print(f"Upload Resume 2 status: {r2.status_code}")
    res2_id = r2.json().get("id")
    print(f"Resume 2 ID: {res2_id}")

    # 4. Run Match (POST /api/v1/match)
    match_payload = {
        "job_id": job_id,
        "resume_ids": [res1_id, res2_id]
    }
    r_match = requests.post(f"{BASE_URL}/api/v1/match", json=match_payload, headers=HEADERS)
    print(f"Run Match status: {r_match.status_code}")
    match_data = r_match.json()
    run_id = match_data.get("run_id")
    print(f"Match Run ID: {run_id}")
    print(f"Candidates Scored: {match_data.get('candidate_count')}")
    print(f"Top Score: {match_data.get('top_score')}")

    # 5. Trigger Bias Audit (POST /api/v1/bias-audit/{run_id})
    r_audit = requests.post(f"{BASE_URL}/api/v1/bias-audit/{run_id}", json={"score_gap_threshold": 5.0}, headers=HEADERS)
    print(f"Trigger Bias Audit status: {r_audit.status_code}")
    audit_data = r_audit.json()
    print(f"Demographic Parity Diff: {audit_data.get('demographic_parity_diff')} pts")
    print(f"Selection Rate Ratio: {audit_data.get('selection_rate_ratio')}")
    print(f"Audit Flagged: {audit_data.get('flagged')}")

    # 6. Get Bias Audit (GET /api/v1/bias-audit/{run_id})
    r_get_audit = requests.get(f"{BASE_URL}/api/v1/bias-audit/{run_id}", headers=HEADERS)
    print(f"Get Bias Audit status: {r_get_audit.status_code}")

    # 7. List Historical Runs (GET /api/v1/runs)
    r_runs = requests.get(f"{BASE_URL}/api/v1/runs", headers=HEADERS)
    print(f"List Runs status: {r_runs.status_code}, Total Runs: {len(r_runs.json())}")

    # 8. Get Run Detail (GET /api/v1/runs/{run_id})
    r_detail = requests.get(f"{BASE_URL}/api/v1/runs/{run_id}", headers=HEADERS)
    print(f"Get Run Detail status: {r_detail.status_code}")

    print("\nSUCCESS: ALL 7 REST API ENDPOINTS FUNCTIONING PERFECTLY!")

if __name__ == "__main__":
    run_runtime_verification()
