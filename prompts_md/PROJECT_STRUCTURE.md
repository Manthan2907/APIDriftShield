# APIDriftShield - Project Folder Structure & Key Files

## 📁 Directory Tree

```text
APIDriftShield/
├── 📁 antigravity_backend/           # Python Backend (FastAPI & Drift Analysis Engine)
│   ├── 📁 test_cases/
│   │   └── test_cases.json          # Benchmark dataset & ground-truth drift cases
│   ├── evaluation_results.json      # Benchmark accuracy & performance metrics
│   ├── fixture_server.py            # Mock API server for dynamic verification testing
│   ├── impact_analyzer.py           # Breaking change classifier & risk scoring logic
│   ├── main.py                      # FastAPI app entrypoint with REST endpoints
│   ├── requirements.txt             # Python dependencies (fastapi, uvicorn, pydantic, etc.)
│   ├── test_generator.py            # Automated regression & integration test generator
│   └── verifier.py                  # Live API response verifier against OpenAPI schemas
│
├── 📁 example_specs/                 # Sample OpenAPI Specifications
│   ├── v1_sample.openapi.json       # Baseline API specification (v1)
│   └── v2_sample.openapi.json       # Evolved API specification with drifts (v2)
│
├── 📁 public/                        # Static assets (favicons, robots.txt, placeholder)
│
├── 📁 src/                           # React + TypeScript Frontend
│   ├── 📁 assets/                    # Static UI media & logos (shield-logo.png)
│   ├── 📁 components/
│   │   ├── 📁 features/             # Business & domain-specific UI components
│   │   │   ├── BenchmarkModal.tsx   # Model accuracy & benchmark evaluation modal
│   │   │   ├── ChangeItem.tsx       # Single detected drift/breaking change view
│   │   │   ├── DropZone.tsx         # Drag-and-drop OpenAPI JSON/YAML upload area
│   │   │   ├── FilterBar.tsx        # Severity, type, and search filters
│   │   │   ├── InputPanel.tsx       # Spec input configuration panel (file / URL / editor)
│   │   │   ├── ProgressBar.tsx      # Analysis progress indicator
│   │   │   ├── ResultsPanel.tsx     # Comprehensive diff & impact report panel
│   │   │   └── SummaryCards.tsx     # KPI metrics (Breaking, Warnings, Safe Changes)
│   │   ├── 📁 layout/
│   │   │   └── Navbar.tsx           # Global header navigation bar
│   │   └── 📁 ui/                   # Reusable UI component library (shadcn/ui primitives)
│   │       ├── button.tsx, card.tsx, dialog.tsx, table.tsx, toast.tsx, ...
│   ├── 📁 constants/
│   │   └── mockData.ts              # Sample analysis outputs and demo data
│   ├── 📁 hooks/
│   │   ├── use-mobile.tsx           # Responsive viewport hook
│   │   ├── use-toast.ts             # Toast notification trigger hook
│   │   └── useApiAnalysis.ts        # API diff analysis orchestrator hook
│   ├── 📁 lib/
│   │   ├── history.ts               # LocalStorage management for past drift analyses
│   │   ├── openApiDiff.ts           # Client-side fallback OpenAPI diff engine
│   │   └── utils.ts                 # Styling utilities (cn helper / tailwind-merge)
│   ├── 📁 pages/
│   │   ├── AnalyzerPage.tsx         # Main interactive API drift analyzer view
│   │   ├── DocsPage.tsx             # Interactive documentation & guide
│   │   ├── HistoryPage.tsx          # Past drift comparison runs & saved reports
│   │   ├── LandingPage.tsx          # Product landing & hero section
│   │   └── NotFound.tsx             # 404 error page
│   ├── 📁 types/
│   │   └── index.ts                 # Core TypeScript interfaces (Change, DriftReport, etc.)
│   ├── App.css / index.css          # Global styling & Tailwind directives
│   ├── App.tsx                      # Root component & React Router route definitions
│   └── main.tsx                     # React DOM entrypoint
│
├── 📄 Documentation & Prompts
│   ├── README.md                    # Main project overview & setup guide
│   ├── API_DriftShield_Complete_Roadmap.md # Feature roadmap and architecture blueprint
│   ├── REPRODUCTION_GUIDE.md        # Step-by-step reproduction and verification guide
│   ├── IMPROVEMENT_CHANGELOG.md     # Changelog of enhancements and fixes
│   ├── ANTIGRAVITY_BACKEND_PROMPTS.md
│   └── ONSPACE_FRONTEND_PROMPTS.md
│
└── ⚙️ Project Configuration
    ├── package.json                 # Node dependencies and scripts
    ├── vite.config.ts               # Vite bundler configuration
    ├── tsconfig.json                # TypeScript project configuration
    ├── tailwind.config.ts           # Tailwind styling configuration
    └── components.json              # shadcn/ui configuration
```

---

## 🌟 Main Important Files Breakdown

### 1. 🐍 Backend Engine (`antigravity_backend/`)
| File | Role & Description |
| :--- | :--- |
| **`main.py`** | FastAPI app containing REST endpoints (`/analyze`, `/verify`, `/benchmark`, `/generate-tests`). Orchestrates diffing, verification, and test generation. |
| **`impact_analyzer.py`** | Semantic diff engine comparing two OpenAPI specs. Categorizes changes into `BREAKING`, `WARNING`, `SAFE` and computes risk scores. |
| **`verifier.py`** | Validates runtime/live API responses against OpenAPI specs to detect real-world schema drift. |
| **`test_generator.py`** | Auto-generates pytest / executable test cases based on detected drift conditions. |
| **`fixture_server.py`** | Mock HTTP server simulating upstream API drift scenarios for test reproduction. |

### 2. ⚛️ Frontend Core (`src/`)
| File | Role & Description |
| :--- | :--- |
| **`pages/AnalyzerPage.tsx`** | The primary workspace where users upload two API specs (v1 & v2), trigger drift analysis, and review results. |
| **`hooks/useApiAnalysis.ts`** | Core stateful hook connecting the UI to backend analysis endpoints with client-side fallback. |
| **`lib/openApiDiff.ts`** | Client-side OpenAPI parser and diffing utility for offline/local-first diffing. |
| **`components/features/ResultsPanel.tsx`** | Displays structured drift breakdown, risk gauges, change lists, and remediation suggestions. |
| **`types/index.ts`** | Central TypeScript definitions for API endpoints, schemas, drift classifications, and report payloads. |

---
