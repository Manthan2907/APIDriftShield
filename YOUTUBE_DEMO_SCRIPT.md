# API DriftShield — Official Video Demonstration Script & Recording Guide

This document provides the exact word-for-word speech and screen-recording choreography for your hackathon submission video (Micro1 Frontier Engineering Challenge 2026).

---

## Recording Checklist & Quick Setup

* **Live Deployment URL**: `https://apidriftshield.up.railway.app`
* **Target Video Length**: 3 minutes 30 seconds to 4 minutes
* **Screen Resolution**: 1920x1080 (1080p), Fullscreen browser, Light Theme
* **Pacing**: Speak at a clear, confident, and professional pace.

---

## Act-by-Act Speech & Screen Recording Choreography

### Act 1: The Problem & Developer Bottleneck (0:00 – 0:35)

**On Screen:**
1. Open the browser at `https://apidriftshield.up.railway.app`.
2. Show the landing page with the headline: *"Evidence-First API Compatibility & Remediation Agent"*.
3. Scroll gently over the 13 RFC policy categories and benchmark metrics.

**Spoken Script:**
> "Every software team maintaining public or internal APIs faces a critical bottleneck: silent API drift and breaking contract changes.
> 
> When APIs evolve from version one to version two, traditional diff tools simply dump raw JSON differences. They cannot tell you if client applications will crash with HTTP 400 or 404 errors, they do not trace downstream SDK blast radius, and when large enterprise schemas produce hundreds of breaking changes, engineers are trapped in over 160 hours of manual code rewrites.
> 
> Worse, generative AI models hallucinate compatibility claims without evidence.
> 
> We built **API DriftShield** — an evidence-first, deterministic compatibility agent that turns contract changes into verified release decisions, 5-minute gateway hotfixes, and quantified financial liability reports."

---

### Act 2: API Analyzer & 6-Stage Deterministic Engine (0:35 – 1:20)

**On Screen:**
1. Click the **"API Analyzer"** tab in the top navigation bar (or click *"Launch API Analyzer"*).
2. Click the blue button **"Load Sample Specs"** on the left panel.
3. Show the progress bar executing: *Parsing OpenAPI $\rightarrow$ AST Structural Diff $\rightarrow$ 13 Policy Categories $\rightarrow$ Test Evidence & Blast Radius*.
4. Point the cursor to the results dashboard:
   - Point to the **"3 Breaking Changes"** badge.
   - Point to the **"0.965 F1 Benchmark"** and **"0.0% Hallucinations"** badge.
   - Scroll down to the change card: show the **Deterministic AST Diff**, **Downstream Impact (SDK & Docs)**, and the **Generated Test Probe** (curl test case verifying the HTTP 400 failure).

**Spoken Script:**
> "Let us start in the API Analyzer. I will click 'Load Sample Specs' to compare our production baseline against our candidate release.
> 
> Unlike naive LLMs, DriftShield executes a deterministic 6-stage pipeline. It performs an Abstract Syntax Tree diff, classifies mutations against 13 strict RFC compatibility policies, synthesizes targeted HTTP test probes, and validates them in an empirical execution sandbox.
> 
> On our 41-case enterprise benchmark, DriftShield achieves a 0.965 F1 score — a 58.4% improvement over openapi-diff — with exactly zero unsupported claims.
> 
> Notice that for every breaking change, DriftShield generates synthetic test evidence confirming runtime failure modes, and maps the exact blast radius across client SDKs and documentation endpoints."

---

### Act 3: AI Strategic Remediation & Cursor/Claude Directives (1:20 – 1:55)

**On Screen:**
1. At the top of the results panel, click the purple button **"AI Strategic Remediation"**.
2. A modal opens with tabs: *Cursor / Claude / Copilot Prompt*, *Gateway Hotfix*, *SDK Middleware*.
3. Click through each tab:
   - Show the generated refactoring prompt.
   - Click the **"Gateway Hotfix (Cloudflare / Express)"** tab to show the zero-downtime proxy snippet.
   - Click the **"Client SDK Middleware"** tab.
4. Close the modal and scroll down to show the **"Automated Migration Paths"** panel with `sed -i` commands and `grep` search patterns.

**Spoken Script:**
> "To solve the 160-hour migration trap, DriftShield features an AI Strategic Remediation Engine powered by server-side Groq and Gemini integrations.
> 
> With one click, DriftShield synthesizes hundreds of schema mutations into a single, structured refactoring directive for Cursor AI, Claude Code, or GitHub Copilot. Instead of days of manual work, an engineering team can refactor their entire client codebase in under two minutes.
> 
> Furthermore, it automatically generates a 5-minute zero-downtime Gateway Hotfix proxy snippet and a 15-line SDK middleware wrapper to prevent immediate production outages."

---

### Act 4: Release Readiness Scorecard (1:55 – 2:35)

**On Screen:**
1. Click the **"Release Readiness"** tab in the top navigation bar (`/release-readiness`).
2. Click the button **"Auto-Fill from Run History"** (or *"Load Sample Data"*).
3. Click the black button **"Compute Release Readiness Score"**.
4. Show the animated score gauge (e.g. *72 / 100 — Caution*).
5. Scroll through:
   - **8 Factor Breakdown** progress bars (Breaking changes, migration effort, docs coverage, SDK status, deprecation window).
   - **Blockers Callout** (Red alerts).
   - **Release Timeline** (Day 0 to Day 90 plan).
6. Click **"Export PDF Report"** briefly to show the clean print preview.

**Spoken Script:**
> "Next, how does an engineering manager know if a candidate release is safe to ship?
> 
> We navigate to the **Release Readiness Scorecard**. Clicking 'Auto-Fill from Run History' instantly pulls our analyzed contract facts into an objective 8-factor Go/No-Go decision engine.
> 
> DriftShield evaluates migration effort, documentation coverage, SDK availability, and deprecation timelines to generate a calibrated 0 to 100 release readiness score.
> 
> It highlights critical blockers that must be resolved before deployment, provides actionable recommendations, and generates a structured day-by-day release timeline."

---

### Act 5: API Stability Dashboard & Competitor Benchmarking (2:35 – 3:15)

**On Screen:**
1. Click the **"Stability"** tab in the top navigation bar (`/stability`).
2. Click the button **"Load Sample 5-Version History"**.
3. Click **"Analyze Stability & Benchmarks"**.
4. Point to:
   - The interactive release timeline (v1.0 to v2.1).
   - The Recharts **Breaking Changes Trend** line graph and **Safe Additions** bar chart.
   - The **Competitive Benchmarking Table** comparing the user's API against Stripe, Shopify, and GitHub.
   - The **Predictive Insights** box.

**Spoken Script:**
> "For long-term architectural planning, we built the **API Stability Dashboard**.
> 
> Maintainers can track up to ten historical OpenAPI versions. DriftShield plots version-over-version stability trends, tracking breaking changes versus safe additions over time.
> 
> Crucially, DriftShield benchmarks your API directly against industry leaders like Stripe, Shopify, and GitHub — comparing annualized breaking change rates, deprecation windows, and migration success percentages.
> 
> Based on your velocity, it even forecasts the optimal release date for your next major version."

---

### Act 6: Breaking Change Financial Liability Report (3:15 – 3:50)

**On Screen:**
1. Click the **"Liability Report"** tab in the top navigation bar (`/liability`).
2. On the left panel under *1-Click Presets*, click **"SaaS Scale ($20k ARR)"** (or click *"Auto-Fill from Run"*).
3. Click the black button **"Calculate Financial Liability"**.
4. Show the loading animation and the resulting dashboard:
   - **Total Estimated Liability Banner** (e.g. *$1,529,750* in bold red font with mitigated estimate).
   - **Best / Likely / Worst Case Scenarios**.
   - **Recharts Interactive Pie Chart** (Liability Composition) and **Risk Radar Chart**.
   - **Mitigation ROI Analysis Bar Chart** (Cost vs Savings) and Strategy Cards (e.g. *90-Day Extended Deprecation — 16.6x ROI*).
   - **Board Presentation Talking Points**.
5. Click **"Export Board PDF"** to demonstrate the executive report.

**Spoken Script:**
> "Finally, our flagship capability: the **Breaking Change Liability Report**.
> 
> Technical debates often stall because nobody can quantify the financial cost of a breaking change. DriftShield bridges engineering and executive leadership by converting contract mutations into concrete dollar figures.
> 
> Powered by Groq and Gemini with deterministic fallback, DriftShield calculates Revenue at Risk across three-year customer lifetime value, enterprise churn exposure, support ticket overhead, and reputation damage.
> 
> It delivers an ROI-ranked mitigation playbook — demonstrating how strategies like an extended deprecation window or automated migration guides can reduce liability by over 60%.
> 
> With one click, maintainers can export a board-ready PDF report formatted for executive decision-making."

---

### Act 7: Summary & Conclusion (3:50 – 4:10)

**On Screen:**
1. Return to the main navigation or docs page (`/docs`).
2. Show the GitHub repository link and live Railway deployment.

**Spoken Script:**
> "In summary, API DriftShield is a complete, production-grade compatibility platform:
> - Deterministic 0.965 F1 diffing with zero hallucinations.
> - Instant AI code remediation and gateway hotfixes.
> - Go/No-Go release scoring and multi-version stability modeling.
> - And financial liability analysis for executive teams.
> 
> DriftShield is fully open-source, verified by 20 automated tests, and live right now on Railway.
> 
> Thank you."

---

## Quick Reference Summary Table

| Timestamp | Section | Key Visual to Show | Key Talking Point |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:35** | Introduction | Landing Page (`/`) | The 160-hour migration trap & unverified LLM claims |
| **0:35 – 1:20** | API Analyzer | Analyzer Page (`/analyze`) | 6-stage deterministic engine, 0.965 F1 score, runtime test probes |
| **1:20 – 1:55** | AI Remediation | Remediation Modal | Cursor/Claude prompts, 5-min gateway hotfix, SDK middleware |
| **1:55 – 2:35** | Release Readiness | Scorecard (`/release-readiness`) | 8-factor Go/No-Go score, blockers, and timeline |
| **2:35 – 3:15** | Stability Dashboard | Stability Page (`/stability`) | Multi-version trends & benchmarks vs Stripe, Shopify, GitHub |
| **3:15 – 3:50** | Liability Report | Liability Page (`/liability`) | Dollar impact ($1.5M), ROI mitigation playbook, Board PDF |
| **3:50 – 4:10** | Conclusion | Live App & Repo | Production deployment on Railway, 20/20 tests passing |
