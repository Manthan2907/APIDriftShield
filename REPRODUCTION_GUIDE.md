# API DriftShield — Evaluation & Reproduction Guide

This guide enables judges, maintainers, and evaluators to reproduce all quantitative benchmarks, run the test suite, and test all agent features in under five minutes.

---

## 1. Environment Setup

### System Requirements
* Python 3.9+
* Node.js 18+

```bash
# Clone the repository
git clone https://github.com/your-username/api-driftshield.git
cd api-driftshield

# Install Python backend dependencies
pip install -r antigravity_backend/requirements.txt

# Install frontend dependencies
npm install
```

---

## 2. Automated Test Suite (20 Tests)

```bash
python -m pytest tests/ -v
```

*Expected Result: `20 passed in ~2.5s` (100% pass rate).*

---

## 3. Benchmark Evaluation Reproduction

The evaluation suite runs the 6-stage DriftShield pipeline and baseline models against **41 ground-truth test cases** generated from 8 enterprise OpenAPI specifications (Petstore, Stripe, GitHub, Slack, Google Calendar, AWS S3, Notion, USPTO).

```bash
# Run the evaluation harness (fast deterministic mode, ~10s)
python antigravity_backend/benchmark/evaluate.py --skip-llm
```

### Verified Benchmark Output
```
=================================================================
  DriftShield Evaluation Harness
=================================================================
  Total test cases: 41
  Specs directory:  antigravity_backend/benchmark/specs

  B1_openapi_diff
    F1 Score:  0.381
    Accuracy:  39.0%
    Precision: 0.586
    Recall:    0.534

  Agent (DriftShield)
    F1 Score:  0.965
    Accuracy:  97.6%
    Precision: 0.962
    Recall:    0.970

  Agent improvement vs B1: +58.4% F1
  Honest Abstentions:      9 / 41 (22.0%)
=================================================================
```

---

## 4. Running the Full System Locally

### Step 1: Start Backend (Terminal 1)
```bash
python antigravity_backend/main.py
```
*Backend runs on `http://localhost:5000` (FastAPI with OpenAPI docs at `/docs`).*

### Step 2: Start Frontend (Terminal 2)
```bash
npm run dev
```
*Open **`http://localhost:5173`** in your browser.*

---

## 5. Feature Walkthrough for Evaluators

1. **API Analyzer & Migration Generator**:
   - Go to **`/analyze`**.
   - Click **"Load Sample Specs"** (or choose a preset like Stripe / User Service).
   - Click **"Run Drift Analysis"**.
   - In the results, view the **Automated Client Migration Path & Code Remediation** panel:
     * Inspect Old vs New code diffs.
     * Click **"Copy sed"** for instant bulk find-and-replace command.
     * Click **"Copy grep"** for blast-radius codebase search command.

2. **Scan GitHub Repositories**:
   - Click the **"Scan GitHub Repo"** tab on `/analyze`.
   - Click presets like `aws/aws-sdk-go-v2`, `github/rest-api-description`, or `stripe/stripe-openapi`.
   - Click **"Scan Repository"** to discover OpenAPI specs and analyze drift across versions.

3. **Deep Node Architecture Flowchart & 3x Voice Tour**:
   - Navigate to **`/flowchart`** or click **"Launch Flowchart Animation"**.
   - Click **"🎙️ AI Voice Tour & 5-Min Fix"** to listen to the synchronized live narrator.
   - Test **Speed: 3x** to listen to high-speed narration and observe accelerating particle flow edges.
   - Watch the agent inspect each breaking red box and automatically open the route drawer.

4. **Rich GitHub PR Comment Export**:
   - In the Analyzer results, click **"GitHub Comment"**.
   - Paste into GitHub PR to see native callouts (`> [!CAUTION]`), scorecard metrics, and breaking changes tables.
