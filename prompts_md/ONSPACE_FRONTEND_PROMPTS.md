# ONSPACE FRONTEND PROMPTS — API DriftShield UI

**Estimated Time:** 4 hours  
**Platform:** Onspace (low-code UI builder)  
**Output:** Deployed live web app URL

---

## **PROMPT 1: Initial App Setup**

**Copy & paste this into Onspace:**

```
Create a full-stack web app called "API DriftShield" with the following design:

LAYOUT:
- Header: Dark navy background (#1a1f3a), white text
  - Logo: "🛡️ API DriftShield"
  - Subtitle: "Detect Breaking API Changes in Seconds"
- Main content: Two-column layout
  - Left: Input panel (30% width)
  - Right: Results panel (70% width, initially hidden)

COLOR SCHEME:
- Background: #0f1419 (dark)
- Cards: #1a1f3a (dark blue)
- Primary button: #4f46e5 (indigo)
- Breaking changes: #ef4444 (red)
- Non-breaking: #10b981 (green)
- Caution: #f59e0b (amber)
- Text: #f1f5f9 (light gray)

RESPONSIVE:
- Mobile: Single column (stack vertically)
- Tablet/Desktop: Two columns

Make it look modern and professional, not like a generic form. Use rounded corners, proper spacing, and hover effects on buttons.
```

---

## **PROMPT 2: Input Panel (Left Side)**

**Copy & paste this into Onspace Input Form:**

```
Create an INPUT PANEL (left side, 30% width) with these components:

SECTION 1: API SPECIFICATION INPUT
═════════════════════════════════
Title: "API Versions"
Subtitle: "Upload or paste your OpenAPI specifications"

Component A: V1 Specification Input
- Label: "Version 1 (Current/Old)"
- Type: File Upload + Text Area (user can choose)
- File type: .json, .yaml (accept OpenAPI 3.0)
- Placeholder for text area: "Paste your v1 OpenAPI spec here or upload a file..."
- Max file size display: "Max 10MB"

Component B: V2 Specification Input  
- Label: "Version 2 (New/Updated)"
- Type: File Upload + Text Area (same as above)
- Placeholder: "Paste your v2 OpenAPI spec here or upload a file..."

SECTION 2: QUICK EXAMPLE TOGGLE
════════════════════════════════
- Button: "Load Sample Specs" (gray, outline style)
- Clicking it pre-fills v1 and v2 with valid example OpenAPI specs
- Helps users test without typing manually

SECTION 3: ACTION BUTTONS
═════════════════════════
Primary Button: "Analyze APIs" (indigo, large)
- Disabled state: grayed out until both v1 and v2 are filled
- Loading state: Shows spinner + "Analyzing..."
- On click: Send specs to backend (Antigravity)

Secondary Button: "Clear All" (ghost button, gray)
- Clears both input fields

SECTION 4: HELP TEXT (collapsible)
═════════════════════════════════
- Question: "What is an OpenAPI spec?"
- Answer: "An OpenAPI specification is a standard format for describing REST APIs. You can export it from your API documentation tool (Swagger, Postman, etc.)."
- Question: "What changes will you detect?"
- Answer: "Removed endpoints, added required fields, type changes, authentication changes, and more. Breaking changes are highlighted in red."

STYLING:
- Cards with subtle borders (#2d3748)
- Smooth transitions and hover effects
- Clear visual hierarchy (titles > subtitles > inputs)
- Error state: Show red border + error message if input is invalid JSON

RESPONSIVENESS:
- On mobile: Full width
- On desktop: 30% of screen width with fixed position (sticky)
```

---

## **PROMPT 3: Results Panel (Right Side)**

**Copy & paste this into Onspace Results Component:**

```
Create a RESULTS PANEL (right side, 70% width, hidden until after analysis):

SECTION 1: SUMMARY CARDS (Top)
═════════════════════════════
Show 4 cards in a row (responsive grid):

Card 1: "Total Changes"
- Big number: {{ totalChanges }} (e.g., "8")
- Subtext: "changes detected"
- Icon: 📊

Card 2: "Breaking Changes" (RED)
- Big number: {{ breakingCount }} (e.g., "3")
- Subtext: "require action"
- Background: Light red (#7f1d1d)
- Icon: 🔴

Card 3: "Safe Changes" (GREEN)
- Big number: {{ safeCount }} (e.g., "5")
- Subtext: "backward compatible"
- Background: Light green (#064e3b)
- Icon: 🟢

Card 4: "Impact Score"
- Percentage: {{ impactScore }}% (e.g., "42%")
- Subtext: "overall severity"
- Background: Light blue (#0c2340)
- Icon: ⚠️

SECTION 2: PROGRESS BAR
══════════════════════
Show a simple horizontal bar:
- Red portion: Breaking changes %
- Green portion: Safe changes %
- Tooltip on hover shows exact counts

SECTION 3: DETAILED CHANGES LIST
════════════════════════════════
For each change detected, show a CARD with:

Card Structure:
┌─────────────────────────────────────────┐
│ [Icon] CHANGE TYPE                      │
│ Route: POST /users                      │
│ Status: BREAKING / SAFE                 │
│ ─────────────────────────────────────────│
│ Description: Required field added...    │
│ Evidence: Schema comparison shows...    │
│ ─────────────────────────────────────────│
│ [Expand Details ▼]                      │
└─────────────────────────────────────────┘

Card Styling:
- Breaking: Red left border (#ef4444)
- Safe: Green left border (#10b981)
- Caution: Amber left border (#f59e0b)

Card Fields:
- Icon: Different icon per change type (see ICON GUIDE below)
- Change Type: "Endpoint Removed" / "Field Required" / "Type Changed" etc.
- Route/Path: e.g., "POST /users"
- Severity Badge: "BREAKING" (red), "SAFE" (green), "CAUTION" (amber)
- Description: One-line human-readable explanation
- Evidence: What proof backs this claim (schema diff, test result)
- "Expand Details" button: Shows full schema comparison

SECTION 4: EXPORT REPORT (Bottom)
════════════════════════════════
Button: "Download Report" (blue outline)
- Generates PDF or JSON with:
  - All findings
  - Evidence details
  - Recommendations for maintainers
  
Button: "Copy as Markdown" (blue outline)
- Copies findings as GitHub-ready markdown for PR description

ICON GUIDE:
─────────────
🔴 Removed Endpoint
🟡 Required Field Added  
🟠 Type Changed
🟢 Optional Field Added
🔵 Description Updated
🟣 New Endpoint
🔷 Authentication Changed
🟤 Response Field Removed

EMPTY STATE (before analysis):
- Show placeholder message: "Upload two API specs above and click 'Analyze' to see results here"
- Icon: 📁
```

---

## **PROMPT 4: Detailed Expansion View**

**Copy & paste this into Onspace Modal/Expansion:**

```
When user clicks "Expand Details" on a change card, show a MODAL or EXPANSION with:

SCHEMA COMPARISON (Side-by-side):
─────────────────────────────────
Left column (v1):
```
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "required": false    ← Was optional
          }
        }
      }
    }
  }
}
```

Right column (v2):
```
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "required": true    ← NOW REQUIRED
          }
        }
      }
    }
  }
}
```

Highlight differences in YELLOW for added, RED for removed, BLUE for changed.

IMPACT ANALYSIS:
────────────────
"Affected SDKs:"
- Python SDK: 3 methods affected (example_sdk.py:45)
- JavaScript SDK: 2 methods affected (example_sdk.js:120)
- Go SDK: 1 method affected (example_sdk.go:89)

"Affected Documentation Examples:"
- README.md line 230: Shows example without email (will break)
- API Guide.md line 450: Shows old auth flow

"Test Evidence:"
- Test case: Create user without email
- v1 Result: Success (200 OK)
- v2 Result: Failure (422 Unprocessable Entity)
- Confirms: This is a breaking change

"Recommendation:"
- Action: Update SDK code
- Severity: HIGH
- Release notes: "⚠️ Breaking: email field now required. Update client code before upgrading."

Close button: [✕]
```

---

## **PROMPT 5: Loading & Error States**

**Copy & paste this into Onspace State Management:**

```
LOADING STATE (while backend processes):
═════════════════════════════════════════
- Disable "Analyze APIs" button
- Show spinning loader: "Analyzing your APIs... (may take 10-30 seconds)"
- Dim input panel slightly
- Show progress: "Step 1/4: Parsing specifications..."
- Then: "Step 2/4: Detecting changes..."
- Then: "Step 3/4: Generating tests..."
- Then: "Step 4/4: Verifying findings..."

ERROR STATES:
═════════════
ERROR 1: Invalid JSON/YAML
- Show alert box (red background)
- Message: "Invalid OpenAPI spec in Version 1. Check JSON syntax."
- Highlight the line number where error occurs
- Button: "Close"

ERROR 2: Backend Timeout
- Show alert: "Analysis took too long. Try with smaller specs."
- Button: "Try Again"

ERROR 3: No internet/Backend Down
- Show alert: "Backend service unavailable. Try again later."
- Provide fallback: "Or download our CLI tool to run locally."

SUCCESS STATE:
══════════════
- Show success toast (green): "✓ Analysis complete!"
- Fade in results panel smoothly
- Auto-scroll to first breaking change (if any)
```

---

## **PROMPT 6: Mobile Responsiveness**

**Copy & paste this into Onspace Responsive Design:**

```
MOBILE VIEW (< 768px width):
════════════════════════════

Layout: Single column (stack vertically)
1. Header (full width)
2. Input panel (full width, 80% of viewport)
3. Results panel (full width, scrollable)

Typography:
- Header size: Smaller on mobile
- Card text: Legible on small screen
- Numbers: Still prominent

Buttons:
- Full width on mobile
- Larger touch targets (min 44px height)

Results:
- Summary cards: 2x2 grid on mobile (vs 4x1 on desktop)
- Change cards: Full width, slightly more padding
- Expansion modal: Full screen overlay on mobile

TABLET VIEW (768px - 1024px):
════════════════════════════
- Same as desktop, but with adjusted column widths
- Input: 35% width
- Results: 65% width
```

---

## **PROMPT 7: Interactive Features**

**Copy & paste this into Onspace Interactions:**

```
HOVER EFFECTS:
══════════════
- Change cards: Slight background color shift + shadow expand
- Buttons: Color change + scale 102%
- Icons: Tooltip appears on hover

CLICK BEHAVIORS:
════════════════
- "Load Sample Specs": Pre-fills both input fields with valid JSON (instant, no delay)
- "Analyze APIs": Sends POST request to backend (Antigravity API endpoint)
  - Request body: {v1_spec, v2_spec}
  - Wait for response: {changes: [...], breaking_count, safe_count, ...}
  - Display results

- "Expand Details": Show modal with schema comparison + evidence
- "Download Report": Generate JSON + download
- "Copy as Markdown": Copy to clipboard, show "✓ Copied!" toast

KEYBOARD SHORTCUTS (nice to have):
═════════════════════════════════
- Ctrl+Enter (or Cmd+Enter): Trigger "Analyze APIs"
- Escape: Close modals/expansions
```

---

## **PROMPT 8: Sample Data for Testing**

**Copy & paste this into Onspace (for Load Sample Specs button):**

```
When user clicks "Load Sample Specs", auto-fill with these examples:

V1 SPEC (sample_v1_openapi.json):
{
  "openapi": "3.0.0",
  "info": {
    "title": "User API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "operationId": "listUsers",
        "responses": {
          "200": {
            "description": "List of users",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "operationId": "createUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UserInput"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created"
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "operationId": "getUser",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {"type": "string"}
          }
        ],
        "responses": {
          "200": {
            "description": "User details"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"},
          "email": {"type": "string"},
          "age": {"type": "integer"}
        }
      },
      "UserInput": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"}
        },
        "required": ["name"]
      }
    }
  }
}

V2 SPEC (sample_v2_openapi.json):
{
  "openapi": "3.0.0",
  "info": {
    "title": "User API",
    "version": "2.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "operationId": "listUsers",
        "responses": {
          "200": {
            "description": "List of users",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "operationId": "createUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UserInput"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"},
          "email": {"type": "string"},
          "age": {"type": "integer"}
        }
      },
      "UserInput": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"}
        },
        "required": ["name", "email"]  ← EMAIL NOW REQUIRED (BREAKING)
      }
    }
  }
}

EXPECTED RESULTS AFTER ANALYSIS:
═════════════════════════════════
Total Changes: 1
Breaking Changes: 1
Safe Changes: 0
Impact Score: 100%

Change Details:
1. BREAKING: Required field added
   - Path: components.schemas.UserInput.properties.email
   - Type: "email" field changed from optional to required
   - Impact: All clients creating users without email will fail (422)
   - Evidence: Schema comparison, test confirms 422 response
```

---

## **FINAL CHECKLIST FOR ONSPACE**

Before deploying, verify:

- [ ] Input panel accepts file upload AND text paste
- [ ] "Load Sample Specs" button works and pre-fills form
- [ ] "Analyze APIs" button connects to Antigravity backend
- [ ] Results panel displays all 4 summary cards
- [ ] Change cards show proper color-coding (red/green/amber)
- [ ] Expand Details modal shows schema comparison
- [ ] Download Report generates valid JSON/PDF
- [ ] Mobile view stacks vertically (test on phone)
- [ ] Loading state shows progress indicators
- [ ] Error handling displays user-friendly messages
- [ ] All text is spell-checked
- [ ] Colors are consistent with design spec
- [ ] Hover effects are smooth (not jerky)
- [ ] App loads in < 3 seconds
- [ ] Deploy to Onspace and get live URL

---

**Next Step:** Go to ANTIGRAVITY_BACKEND_PROMPTS.md for backend logic
