# API DriftShield — Evaluation & Reproduction Guide

This guide enables judges, maintainers, and evaluators to reproduce all quantitative benchmarks, run the test suite, test all agent features, and evaluate the AI Strategic Remediation engine.

---

## 🌐 Live Production Demo
* **Railway App**: **[https://apidriftshield.up.railway.app](https://apidriftshield.up.railway.app)**
* **FastAPI Docs**: **[https://apidriftshield.up.railway.app/docs](https://apidriftshield.up.railway.app/docs)**

---

## 1. Environment Setup

### System Requirements
* Python 3.9+
* Node.js 18+

```bash
# Clone the repository
git clone https://github.com/Manthan2907/APIDriftShield.git
cd APIDriftShield

# Create .env from template
cp .env.example .env

# Install Python backend dependencies
pip install -r antigravity_backend/requirements.txt

# Install frontend dependencies
npm install
```

### Environment Variables (`.env`)
```env
PORT=5000
# Optional: Set your Groq or Gemini API key for instant AI prompt synthesis
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
```

---

## 2. Automated Test Suite (20 Tests)

```bash
python -m pytest tests/ -v
```

*Expected Result: `20 passed in ~4.2s` (100% pass rate).*

---

## 3. Benchmark Evaluation Reproduction

The evaluation suite runs the 7-stage DriftShield pipeline and baseline models against **41 ground-truth test cases** generated from 8 enterprise OpenAPI specifications (Petstore, Stripe, GitHub, Slack, Google Calendar, AWS S3, Notion, USPTO).

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
*Open **`http://localhost:5173/analyze`** in your browser.*

---

## 5. Feature Walkthrough for Evaluators

1. **API Analyzer & AI Strategic Prompt Generator**:
   - Go to **`/analyze`**.
   - Click **"Load Sample Specs"** (or choose a preset like Stripe / User Service).
   - Click **"Run Drift Analysis"**.
   - Click **"✨ AI Fix Prompt (Cursor / Claude)"**:
     * Inspect the unified refactoring directive for Cursor / Claude Code.
     * View the 5-Minute Zero-Downtime Gateway Hotfix (Cloudflare Worker proxy).
     * View the Client SDK Interceptor snippet.
   - In the **Automated Client Migration Path** accordion:
     * Inspect Old vs New code diffs.
     * Click **"Copy sed"** for instant bulk find-and-replace command.
     * Filter by root causes (`Removed Routes`, `Required Fields`).

2. **Scan GitHub Repositories**:
   - In `/analyze`, switch to the **"Scan GitHub Repo"** tab.
   - Enter `stripe/stripe-openapi` or `aws/aws-sdk-go-v2`.
   - Click **"Scan Repository for Specs"**.
   - Click **"Run Full DriftShield Analysis"** to analyze discovered specs directly from the GitHub tree.

3. **Interactive Deep Architecture Graph & AI Voice Tour**:
   - Navigate to **`/flowchart`** (or click **"Launch Interactive Flowchart"** from results).
   - Select speed `[1x, 2x, 3x]` and click **"Play AI Voice Narration"**.
   - The voice agent walks through every node, opens the route inspector drawer, and narrates the exact 5-minute fix in high-contrast light mode.
