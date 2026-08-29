"""
Baseline B2: Tool + LLM hybrid.
Uses B1 (structural diff) output as context for Claude to make a final decision.
Better than B0 (raw LLM) but worse than the full DriftShield agent.
"""
import os
import json
import sys
import re
from pathlib import Path

# Add parent to path so we can import b1
sys.path.insert(0, str(Path(__file__).parent))
from b1_openapi_diff import run_baseline_b1


def run_baseline_b2(v1_spec: dict, v2_spec: dict, mutation_type: str = "", description: str = "") -> dict:
    """Baseline 2: Structural diff output + LLM final decision.
    
    Combines deterministic tooling (B1) with LLM reasoning.
    Returns dict with 'classification', 'reasoning', 'diff_summary'.
    """
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    except ImportError:
        # Fall back to B1 if anthropic not installed
        b1_result = run_baseline_b1(v1_spec, v2_spec, mutation_type, description)
        return {**b1_result, "fallback": "anthropic_not_installed"}

    # Step 1: Get structural diff from B1
    b1_result = run_baseline_b1(v1_spec, v2_spec, mutation_type, description)
    diff_summary = b1_result.get("diff_summary", {})
    b1_classification = b1_result.get("classification", "uncertain")

    # Step 2: Ask LLM to refine using the diff output as context
    prompt = f"""You are an API compatibility expert. A structural diff tool analyzed two OpenAPI specs and found:

Mutation description: {description}
Mutation type: {mutation_type}

Structural diff results:
- Removed items: {diff_summary.get('removed_count', 0)} (top: {diff_summary.get('top_removed', [])[:3]})
- Added items: {diff_summary.get('added_count', 0)} (top: {diff_summary.get('top_added', [])[:3]})  
- Changed values: {diff_summary.get('changed_count', 0)}
- Type changes: {diff_summary.get('type_changes_count', 0)}

The diff tool's initial classification: {b1_classification}
The diff tool's reasoning: {b1_result.get('reasoning', 'N/A')}

Based on this structural analysis, classify the change as:
- BREAKING: Existing clients will fail at runtime (get error responses or crashes)
- SAFE: Existing clients continue working without any changes
- UNCERTAIN: Cannot determine without more context; flag for human review

Consider: empty diffs = SAFE, endpoint removal = BREAKING, additive fields = SAFE, type changes = BREAKING.

Respond in JSON only:
{{
  "classification": "breaking|safe|uncertain",
  "reasoning": "concise explanation"
}}"""

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text.strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            result = json.loads(match.group())
            classification = result.get("classification", "uncertain").lower()
            if classification not in ("breaking", "safe", "uncertain"):
                classification = "uncertain"
            return {
                "classification": classification,
                "reasoning": result.get("reasoning", ""),
                "b1_classification": b1_classification,
                "diff_summary": diff_summary,
                "raw_response": raw
            }
        # Fall back to B1 result if parsing fails
        return {
            "classification": b1_classification,
            "reasoning": b1_result.get("reasoning", "Fallback to B1 result"),
            "b1_classification": b1_classification,
            "diff_summary": diff_summary
        }
    except Exception as e:
        return {
            "classification": b1_classification,
            "reasoning": f"LLM call failed ({str(e)}); using B1 fallback",
            "b1_classification": b1_classification,
            "diff_summary": diff_summary
        }


if __name__ == '__main__':
    v1 = {
        "openapi": "3.0.0",
        "info": {"title": "API", "version": "1.0"},
        "paths": {"/pet": {"get": {}, "post": {}}}
    }
    v2 = {
        "openapi": "3.0.0",
        "info": {"title": "API", "version": "2.0"},
        "paths": {}  # All endpoints removed
    }
    result = run_baseline_b2(v1, v2, "endpoint_removed", "All /pet endpoints removed")
    print(json.dumps(result, indent=2))
