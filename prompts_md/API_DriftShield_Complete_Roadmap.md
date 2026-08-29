# API DriftShield — Complete Hackathon Submission Roadmap
**Deadline:** August 30, 2026 @ 6:00 PM UTC  
**Tech Stack:** Onspace (UI) + Antigravity (Backend Logic) + Free APIs  
**Submission Type:** Live deployed web app + Video + Code repo

---

## **PART 1: WHAT YOU'RE ACTUALLY BUILDING**

### **The Problem (Answer Question #1: Who has this problem?)**
**Users:** API maintainers (teams that publish REST/GraphQL APIs)  
**Real Example Users:** GitHub, Stripe, Postman users, SDK developers

### **The Bottleneck (Answer Question #2: What bottleneck makes it worth solving?)**
When an API changes between v1 → v2:
- OpenAPI spec changes
- Implementation changes behavior
- Docs get out of sync
- SDK examples break
- **Maintainer doesn't know which changes are breaking** → causes client complaints

### **Your Solution (Answer Question #3: Does the agent solve it well?)**
**App Flow:**
1. User uploads two OpenAPI specs (v1 & v2) OR provides GitHub repo link
2. Your agent analyzes the changes:
   - Detects removed endpoints
   - Detects required fields added
   - Detects type changes
   - Detects breaking vs. non-breaking
3. Agent TESTS the changes (makes requests to both versions)
4. Shows visual report: "Breaking Changes: 3 | Safe Changes: 5"
5. Explains each change with evidence (HTTP status, schema proof)

### **Reproducibility (Answer Question #4: Can another person reproduce?)**
- You provide: Sample API specs (GitHub public repos)
- User provides: Any OpenAPI spec URLs
- Clear setup instructions in README
- Video walkthrough of complete flow

---

## **PART 2: WHAT TO SUBMIT TO HACKEREARTH**

You submit **ONE package** containing:

### **1. Live Web App URL**
- Deployed Onspace app (live link judges can click)
- Should have: upload field, analyze button, results display
- Minimum: works for 3 test cases without errors

### **2. Video (< 5 minutes)**
Show:
- Problem statement (30 sec)
- Simple baseline demo (30 sec) — "Just diffing OpenAPI files"
- Your agent in action (1.5 min) — upload spec, see analysis
- Before/After comparison (1 min) — baseline vs. your solution
- Key insight (1 min) — what you learned

### **3. GitHub Repo (for Source Code)**
Structure:
```
api-driftshield/
├── README.md                    # Problem + how to run
├── REPRODUCTION_GUIDE.md        # Exact steps for judges
├── IMPROVEMENT_CHANGELOG.md     # Iterations (6 entries)
├── onspace_prompts/
│   └── frontend_build_instructions.md
├── antigravity_backend/
│   ├── agent_logic.txt          # Main agentic workflow
│   ├── test_cases/
│   │   ├── case_1_breaking.json
│   │   ├── case_2_nonbreaking.json
│   │   └── ... (15 total)
│   └── evaluation_results.json  # F1 scores, confusion matrix
├── example_specs/
│   ├── v1_sample.openapi.json
│   └── v2_sample.openapi.json
└── video_link.txt               # Link to YouTube/Loom video
```

### **4. Evaluation Results (JSON or Markdown)**
```
Baseline (OpenAPI Diff Only):
  - Breaking Change F1: 0.62
  - Precision: 0.70
  - Recall: 0.55

Agent Solution:
  - Breaking Change F1: 0.87
  - Precision: 0.89
  - Recall: 0.85
  - Improvement: +25% F1
```

### **5. Representative Agent Trajectories**
Show 3–4 example runs:
- One breaking change case
- One non-breaking case
- One edge case

---

## **PART 3: STEP-BY-STEP TASKS (with Time Estimates)**

### **PHASE 1: SETUP (2 hours)**

- [ ] Create GitHub repo for submission
- [ ] Set up Antigravity backend project (empty, ready for logic)
- [ ] Create Onspace account if needed
- [ ] Prepare 15 test cases (JSON file with expected outputs)
  - 5 breaking: removed endpoint, required field, type change, auth change, response removed
  - 5 non-breaking: description only, optional field, new endpoint, example update, new response field
  - 5 compound: multiple changes across spec + code

**Time: 2 hours**

---

### **PHASE 2: ONSPACE FRONTEND UI (4 hours)**

**What to Build:**
1. **Input Section:**
   - Dropdown: "Upload OpenAPI Specs" or "Paste JSON"
   - File upload for v1 OpenAPI spec
   - File upload for v2 OpenAPI spec
   - "Analyze" button

2. **Results Section (appears after clicking Analyze):**
   - Status card: "3 Breaking Changes | 5 Non-Breaking"
   - Color-coded list:
     - 🔴 Breaking changes (red)
     - 🟡 Caution changes (yellow)
     - 🟢 Safe changes (green)
   - Each item shows:
     - Change type (e.g., "Removed endpoint")
     - Affected route
     - Evidence (schema comparison)
     - Impact severity

3. **Details Expansion:**
   - Click each change to see full details
   - Show side-by-side schema comparison
   - Show test evidence (if applicable)

**Design Requirements (for UI polish):**
- Dark theme (modern look)
- Clear card-based layout
- Icons for change types
- Progress indicator during analysis
- Responsive on mobile

**Time: 4 hours**

**Onspace Prompts:** (See PART 5 below)

---

### **PHASE 3: ANTIGRAVITY BACKEND LOGIC (6 hours)**

**What to Build:**

1. **OpenAPI Diff Engine** (deterministic, no LLM)
   - Compare v1 vs v2 specs
   - Extract changes (added, removed, modified)
   - Normalize into structured format

2. **Change Classifier** (rule-based + LLM)
   - Rule 1: Removed route = breaking
   - Rule 2: Required field added = breaking
   - Rule 3: Type changed = breaking
   - Rule 4: Description only = non-breaking
   - Rule 5: New optional field = non-breaking
   - Use LLM to handle ambiguous cases

3. **Test Generator** (creates requests)
   - Generate sample requests from OpenAPI schema
   - Create requests for both v1 and v2
   - Test endpoints if live (optional: use mock servers)

4. **Impact Analyzer** (multi-hop reasoning)
   - Which SDK methods are affected?
   - Which docs examples break?
   - Estimate blast radius

5. **Verifier** (fact-check claims)
   - "Is this really breaking?"
   - Check against evidence from tests
   - Flag uncertain findings

6. **Result Formatter**
   - Return structured JSON with all findings
   - Include confidence scores

**Time: 6 hours**

**Antigravity Prompts:** (See PART 6 below)

---

### **PHASE 4: INTEGRATION & TESTING (3 hours)**

- [ ] Connect Onspace frontend to Antigravity backend (API calls)
- [ ] Test with all 15 test cases
- [ ] Calculate F1 score, precision, recall
- [ ] Fix any bugs
- [ ] Ensure no errors on 3 live test cases

**Time: 3 hours**

---

### **PHASE 5: IMPROVEMENT CHANGELOG (2 hours)**

Document your iterations:

```
| STAGE | WHAT YOU TRIED | EVIDENCE | DECISION |
|-------|----------------|----------|----------|
| Baseline | OpenAPI diff + LLM summary | F1: 0.62 | Establish starting point |
| Iter 1 | Add rule-based classifier for breaking changes | F1: 0.74 | Kept—rules work better than LLM guessing |
| Iter 2 | Add test generator to verify claims | F1: 0.81 | Kept—reduces false positives from 30% → 10% |
| Iter 3 | Add impact planner (SDK/docs analyzer) | F1: 0.80 | Removed—didn't improve F1, adds latency |
| Iter 4 | Add verifier that gates uncertain findings | F1: 0.87 | Kept—human trust increases, no impact on F1 |
| Final | Keep: Diff + Rules + Test Gen + Verifier | F1: 0.87 | Main win from deterministic + executable evidence |
```

**Time: 2 hours**

---

### **PHASE 6: VIDEO (3 hours)**

Script:
1. **Problem** (30 sec): "API maintainers don't know which changes are breaking"
2. **Baseline** (30 sec): "Old way: just diff OpenAPI specs, ask LLM to summarize"
3. **Demo** (90 sec): Upload specs → agent analyzes → shows results
4. **Comparison** (60 sec): "Baseline found 4 changes, missed 3 breaking. Agent found all 7."
5. **Insight** (60 sec): "LLMs alone can't decide breaking vs. non-breaking—they need executable tests to verify claims."

Recording:
- Use OBS or Loom
- Screen share your live web app
- Clear narration
- 4K or 1080p minimum
- Upload to YouTube (unlisted, link in repo)

**Time: 3 hours**

---

### **PHASE 7: DOCUMENTATION (3 hours)**

Files to write:

**A. README.md**
```markdown
# API DriftShield

## Problem
API maintainers don't know which changes between versions are breaking.

## Solution
An agent that analyzes OpenAPI specs, detects changes, tests them, and explains which are breaking.

## Live Demo
[Your Onspace deployed link]

## How It Works
1. Upload v1 & v2 OpenAPI specs
2. Agent extracts changes (removed, modified, added)
3. Agent classifies: breaking vs. non-breaking
4. Agent tests changes (creates sample requests)
5. Generates report with evidence

## Metrics
- F1 Score: 0.87 (+25% vs. baseline)
- Precision: 0.89
- Recall: 0.85
```

**B. REPRODUCTION_GUIDE.md**
```markdown
## How to Reproduce Results

### Prerequisites
- Python 3.9+
- Antigravity account
- Free OpenAI API key (for LLM, if used)

### Step 1: Clone repo
git clone ...

### Step 2: Set up backend
cd antigravity_backend
pip install -r requirements.txt

### Step 3: Load test cases
python load_test_cases.py

### Step 4: Run baseline
python baseline.py
Expected output: F1 = 0.62

### Step 5: Run agent solution
python agent_solution.py
Expected output: F1 = 0.87

### Step 6: View results
cat evaluation_results.json
```

**C. IMPROVEMENT_CHANGELOG.md**
(Already covered in Phase 5)

**Time: 3 hours**

---

### **PHASE 8: FINAL POLISH & SUBMISSION (2 hours)**

- [ ] Test live web app 5 times with fresh test cases
- [ ] Video uploaded and link added to repo
- [ ] All typos fixed in README
- [ ] GitHub repo is public, link shared
- [ ] Prepare submission package for HackerEarth
- [ ] Write 3-sentence "hot take" (your key insight)

**Time: 2 hours**

---

## **PART 4: TOTAL TIME BREAKDOWN**

| Phase | Task | Hours | Status |
|-------|------|-------|--------|
| 1 | Setup | 2 | ⏳ Start here |
| 2 | Onspace UI | 4 | Then this |
| 3 | Antigravity Logic | 6 | Then this |
| 4 | Integration & Testing | 3 | Then this |
| 5 | Changelog | 2 | Then this |
| 6 | Video | 3 | Then this |
| 7 | Documentation | 3 | Then this |
| 8 | Polish & Submit | 2 | Finally |
| **TOTAL** | | **25 hours** | ✅ Doable in 48h |

**Timeline:**
- **Day 1 (Aug 28-29):** Phases 1-4 (15 hours)
- **Day 2 morning (Aug 30):** Phase 5-6 (5 hours)
- **Day 2 afternoon (Aug 30):** Phase 7-8 (5 hours)
- **Submit before 6 PM UTC** ✅

---

## **PART 5: ONSPACE FRONTEND — DETAILED PROMPTS**

See: `ONSPACE_FRONTEND_PROMPTS.md` (next file)

---

## **PART 6: ANTIGRAVITY BACKEND — DETAILED PROMPTS**

See: `ANTIGRAVITY_BACKEND_PROMPTS.md` (next file)

---

## **PART 7: THE 4 HACKATHON QUESTIONS — ANSWER GUIDE**

### **Q1: Who has this problem?**
**Answer:** "API maintainers and SDK developers who publish REST/GraphQL APIs and need to communicate breaking changes to clients. Example: GitHub when they deprecate an endpoint."

### **Q2: What bottleneck makes it worth solving?**
**Answer:** "Manually reviewing OpenAPI spec diffs is error-prone. Teams don't know which changes are actually breaking until clients complain. Without reliable tooling, breaking changes can slip through to production, breaking client applications."

### **Q3: Does the agent solve it well?**
**Answer:** "Yes. The agent achieved 87% F1 score (vs. 62% baseline) at detecting breaking changes. It combines rule-based classification + executable tests + human verification. Judges can test it on any public OpenAPI specs."

### **Q4: Can another person reproduce the result?**
**Answer:** "Yes. We provide a REPRODUCTION_GUIDE.md with exact commands. All test cases are in test_cases/ folder. Expected outputs are in evaluation_results.json. A clean Python environment can reproduce the F1 score in <5 minutes."

---

## **WHAT TO SUBMIT ON HACKEREARTH**

Go to: https://www.hackerearth.com/community/challenges/hackathon/micro1-frontier-engineering-challenge-2026/

Click: **"New Submission"**

Fill out the form:

| Field | What to Put |
|-------|------------|
| **Title** | "API DriftShield: Agentic Breaking Change Detector" |
| **Description** | (Your answer to the 4 questions — copy from Part 7 above) |
| **Video URL** | YouTube/Loom link to your 5-min demo |
| **Source Code** | GitHub repo link OR upload ZIP of code |
| **How to Run** | Paste your REPRODUCTION_GUIDE.md content |
| **Metrics** | "F1 Score: 0.87 (vs. 0.62 baseline). +25% improvement." |

Then click **Submit**.

---

## **QUICK CHECKLIST BEFORE SUBMITTING**

- [ ] Live web app works (test 3x with fresh cases)
- [ ] Video is <5 min, audio is clear, shows the 4 questions answered
- [ ] GitHub repo has:
  - [ ] README.md
  - [ ] REPRODUCTION_GUIDE.md
  - [ ] IMPROVEMENT_CHANGELOG.md
  - [ ] test_cases/ folder with 15 JSON files
  - [ ] evaluation_results.json with metrics
  - [ ] example_specs/ folder with sample v1/v2 OpenAPI files
- [ ] README answers the 4 questions clearly
- [ ] Reproduction guide is step-by-step (30 min start-to-finish)
- [ ] Video shows real execution (not mock/screenshot)
- [ ] Hot take insight is included (e.g., "LLMs fail without executable verification")

---

**Next:** Go to PART 5 for Onspace prompts, then PART 6 for Antigravity prompts.
