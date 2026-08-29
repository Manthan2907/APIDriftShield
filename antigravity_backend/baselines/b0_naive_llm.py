"""
Baseline B0: Naive LLM
Asks Claude to classify API changes directly from spec snippets.
No deterministic tooling — pure LLM classification.
"""
import os
import json
import sys
import re

def run_baseline_b0(v1_spec: dict, v2_spec: dict, mutation_type: str = "", description: str = "") -> dict:
    """Baseline 0: Naive LLM — just ask Claude to classify the change.
    
    Returns:
        dict with 'classification' (breaking|safe|uncertain) and 'reasoning'
    """
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    except ImportError:
        return {"classification": "uncertain", "reasoning": "anthropic not installed"}

    # Truncate large specs to fit context
    v1_snippet = json.dumps(v1_spec, indent=2)[:3000]
    v2_snippet = json.dumps(v2_spec, indent=2)[:3000]

    prompt = f"""You are an API compatibility expert. Compare these two OpenAPI specs and classify the change.

Mutation description: {description}

V1 Spec (current production version):
{v1_snippet}

V2 Spec (proposed new version):
{v2_snippet}

Classify this change as exactly one of:
- BREAKING: Existing clients will fail (get error responses or crashes)  
- SAFE: Existing clients continue working without any changes
- UNCERTAIN: Cannot determine without more context; flag for human review

Respond in JSON format only:
{{
  "classification": "breaking|safe|uncertain",
  "reasoning": "brief explanation of why"
}}"""

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text.strip()
        # Extract JSON from response
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            result = json.loads(match.group())
            classification = result.get("classification", "uncertain").lower()
            # Normalize
            if classification not in ("breaking", "safe", "uncertain"):
                classification = "uncertain"
            return {
                "classification": classification,
                "reasoning": result.get("reasoning", ""),
                "raw_response": raw
            }
        return {"classification": "uncertain", "reasoning": "Could not parse LLM response", "raw_response": raw}
    except Exception as e:
        return {"classification": "uncertain", "reasoning": f"LLM call failed: {str(e)}"}


if __name__ == '__main__':
    # Quick smoke test
    v1 = {"openapi": "3.0.0", "info": {"title": "API", "version": "1.0"}, "paths": {"/pet": {"get": {}, "post": {}}}}
    v2 = {"openapi": "3.0.0", "info": {"title": "API", "version": "2.0"}, "paths": {"/pet": {"get": {}}}}
    result = run_baseline_b0(v1, v2, "endpoint_method_removed", "POST /pet method removed")
    print(json.dumps(result, indent=2))
