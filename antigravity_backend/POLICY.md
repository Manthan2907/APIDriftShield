# API Backward Compatibility Policy
**DriftShield uses this policy as the ground-truth classification reference for all test cases and evaluation.**

---

## What "Backward Compatible" Means

An API change is **backward compatible** if and only if:
- Existing clients can **continue sending old valid requests** (client→server direction) without modification.
- Existing clients can **continue parsing old valid responses** (server→client direction) without modification.
- Existing clients **do NOT need to update** their code, configuration, or credentials.

---

## Breaking Changes (Always classify as: `breaking`)

These changes will cause runtime failures for existing clients:

| # | Change Type | Client Impact |
|---|---|---|
| 1 | **Removed endpoint** | Clients call deleted path → HTTP 404 Not Found |
| 2 | **Required field added** (request body) | Old request missing field → HTTP 422 Validation Error |
| 3 | **Type narrowed** (request) — e.g. `any` → `integer` | Old type no longer accepted → HTTP 400 Bad Request |
| 4 | **Type changed** (request/response) — e.g. `string` → `integer` | Serialization or validation failures |
| 5 | **Response field removed** | Client expects field that is now gone → NullPointerException or KeyError |
| 6 | **Response status code removed** | Client handler for old status code never triggered |
| 7 | **Security strengthened** | New required authentication → HTTP 401/403 |
| 8 | **Enum value removed** | Old value no longer valid → HTTP 422 |
| 9 | **Required parameter added** (query/path/header) | Old requests missing it → HTTP 400/422 |
| 10 | **Base URL changed** | Clients target wrong endpoint → connection errors |
| 11 | **Request body made required** | Old requests without body → HTTP 400 |
| 12 | **HTTP method removed** from existing path | HTTP 405 Method Not Allowed |
| 13 | **Schema component removed** | All routes using that schema fail validation |

---

## Safe Changes (Always classify as: `safe`)

These changes are strictly additive and do not affect existing clients:

| # | Change Type | Why Safe |
|---|---|---|
| 1 | **Optional field added** (request) | Old requests without it still valid |
| 2 | **New endpoint added** | Doesn't touch existing routes |
| 3 | **Description/example-only change** | No schema or runtime impact |
| 4 | **Optional field added** (response) | Clients ignore unknown fields |
| 5 | **New optional response field** | Same as above |
| 6 | **Required field relaxed to optional** | Old clients sending it still work |
| 7 | **New HTTP method added** to existing path | Existing method still works |
| 8 | **New response status code added** | Old status codes remain |
| 9 | **New schema component added** | Additive, not referenced by existing routes |

---

## Uncertain (Classify as: `uncertain` — requires human review)

These changes may or may not be breaking depending on client implementation details:

| # | Change Type | Why Uncertain |
|---|---|---|
| 1 | **`$ref` target changed** | Depends on what changed inside the referenced schema |
| 2 | **`nullable` added** (request) | Clients sending non-null still work; impact depends on logic |
| 3 | **Default value changed** | Depends on whether clients rely on the default |
| 4 | **Deprecation added** (but still works) | Works now, may break in future release |
| 5 | **Media type changed** — e.g. `application/json` → `application/x-msgpack` | Depends on client content-type handling |
| 6 | **Enum value added** (request) | Breaking if server strictly validates enum; safe if it ignores extras |
| 7 | **minLength/maxLength tightened** | May cause previously valid requests to fail |
| 8 | **Response status code changed** — e.g. `200` → `201` | Depends on client status checking strictness |
| 9 | **Header requirement changed** | Depends on how client sends headers |

---

## Evaluation Rules

1. If **any** breaking change is detected with supporting evidence → classify as `breaking`
2. If **only** safe changes are detected → classify as `safe`
3. If schema is ambiguous, evidence is inconclusive, or change falls in uncertain category → classify as `uncertain` and **abstain** rather than guess
4. Every claim must be supported by a schema path, test probe result, or HTTP status code evidence
5. The `uncertain_rate` must be reported in evaluation results separately — abstention is a feature, not a failure

---

## Key Principle

> *"Static diffing identifies possible contract risk; executable evidence determines whether that risk deserves an alert. LLM confidence is not evidence."*

DriftShield uses this policy document as the ground truth for all 30-40 benchmark test cases.
