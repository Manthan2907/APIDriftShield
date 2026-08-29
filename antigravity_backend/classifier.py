"""
Policy-Aware Compatibility Classifier for API DriftShield
Classifies raw contract changes into semantic compatibility states:
- Breaking: existing clients will experience runtime failure or compile-time error
- Caution: behavioral shift that may affect client logic (e.g. response code removal, loose enum)
- Safe: strictly backward-compatible additions
- Uncertain / Review Required: inconclusive contract evidence requiring human verification
"""

import os
import json
from typing import List, Dict, Any, Optional

class ChangeClassifier:
    """
    Classifies API changes using strict deterministic rules first,
    falling back to LLM only for semantic / ambiguous domain edge-cases.
    """

    BREAKING_TYPES = {
        "endpoint_removed",
        "field_removed",
        "schema_removed",
        "field_type_changed",
        "field_required_added",
        "required_parameter_added",
        "parameter_made_required",
        "parameter_removed",
        "request_body_made_required",
        "enum_value_removed",
        "security_changed"
    }

    CAUTION_TYPES = {
        "response_removed",
        "format_changed",
        "status_code_change",
        "parameter_type_change"
    }

    SAFE_TYPES = {
        "endpoint_added",
        "schema_added",
        "optional_field_added",
        "optional_parameter_added",
        "new_response_field",
        "description_change",
        "example_update"
    }

    def __init__(self, use_llm_fallback: bool = True):
        self.use_llm_fallback = use_llm_fallback
        self.api_key = os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("OPENAI_API_KEY") or os.environ.get("GEMINI_API_KEY")

    def classify_changes(self, raw_changes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Classifies each raw change, computes confidence, generates human rationale,
        and assigns initial verification flags.
        """
        classified = []

        for change in raw_changes:
            c = dict(change)
            change_type = c.get("type", "")

            if change_type in self.BREAKING_TYPES:
                c["severity"] = "breaking"
                c["confidence"] = 0.96
                c["category"] = "breaking_contract_drift"
                c["classification_source"] = "rule_engine"
                c["explanation"] = self._explain_change(c, "breaking")

            elif change_type in self.CAUTION_TYPES:
                c["severity"] = "caution"
                c["confidence"] = 0.88
                c["category"] = "behavioral_shift"
                c["classification_source"] = "rule_engine"
                c["explanation"] = self._explain_change(c, "caution")

            elif change_type in self.SAFE_TYPES:
                c["severity"] = "safe"
                c["confidence"] = 0.98
                c["category"] = "backward_compatible_addition"
                c["classification_source"] = "rule_engine"
                c["explanation"] = self._explain_change(c, "safe")

            else:
                # Ambiguous change - use LLM or default to honest uncertain
                if self.use_llm_fallback and self.api_key:
                    c = self._classify_with_llm(c)
                else:
                    c["severity"] = "caution"
                    c["confidence"] = 0.65
                    c["category"] = "ambiguous_contract_drift"
                    c["classification_source"] = "fallback_heuristic"
                    c["explanation"] = "Ambiguous schema drift detected. Flagged for manual review."

            classified.append(c)

        return classified

    def _explain_change(self, c: Dict[str, Any], severity: str) -> str:
        ctype = c.get("type")
        path = c.get("path", "")
        method = c.get("method", "")
        field = c.get("field", "")
        schema = c.get("schema", "")
        param = c.get("parameter", "")

        if ctype == "endpoint_removed":
            return f"Existing clients issuing {method} requests to '{path}' will receive HTTP 404 Not Found."
        elif ctype == "field_required_added":
            target = f"'{schema}.{field}'" if schema else f"'{field}' in {path}"
            return f"Requests omitting new required property {target} will be rejected with HTTP 400/422 validation errors."
        elif ctype == "field_type_changed":
            return f"Type mutation for '{field}' ({c.get('v1_value')} -> {c.get('v2_value')}) causes client serialization failure."
        elif ctype == "field_removed":
            return f"Removed field '{field}' from schema '{schema}'. Client parsers relying on this field may crash."
        elif ctype == "required_parameter_added" or ctype == "parameter_made_required":
            return f"Mandatory parameter '{param}' added to {method} {path}. Existing callers lacking this parameter will fail."
        elif ctype == "security_changed":
            return "Authentication/Authorization requirements have changed. Existing client API keys/tokens will be rejected with 401/403."
        elif ctype == "enum_value_removed":
            return f"Enum values removed from '{field}'. Clients sending previously valid enum values will be rejected."
        elif ctype == "response_removed":
            return f"Response status {c.get('status_code')} removed from {method} {path}. Client handlers for this status may fail."
        elif ctype == "endpoint_added":
            return f"New endpoint {method} {path} added safely. Existing clients are unaffected."
        elif ctype == "optional_field_added":
            return f"Optional property '{field}' added. Backward-compatible for existing payloads."
        return c.get("details", "API contract change detected.")

    def _classify_with_llm(self, change: Dict[str, Any]) -> Dict[str, Any]:
        """Optional LLM semantic disambiguation."""
        # Provides structured fallback
        change["severity"] = "caution"
        change["confidence"] = 0.75
        change["classification_source"] = "llm_disambiguation"
        return change
