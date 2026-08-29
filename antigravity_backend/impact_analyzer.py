"""
Downstream Impact Analyzer for API DriftShield
Traces affected client SDK methods, documentation snippets, code repositories,
and calculates the blast radius of API contract drift.
"""

import os
import re
import logging
from functools import lru_cache
from typing import List, Dict, Any, Optional

from diff_engine import OpenAPIDiffEngine
from classifier import ChangeClassifier

logger = logging.getLogger("driftshield.impact_analyzer")

# 13 Standard Ground-Truth Categories
BREAKING_CATEGORIES = {
    "endpoint_removed",
    "required_field_added",
    "type_changed",
    "enum_restricted",
    "response_field_removed",
    "security_changed",
    "status_code_changed",
}

SAFE_CATEGORIES = {
    "optional_field_added",
    "new_endpoint",
    "description_only",
    "new_response_field",
}

UNCERTAIN_CATEGORIES = {
    "ambiguous_schema",
    "insufficient_evidence",
}


@lru_cache(maxsize=32)
def load_policy_rules(policy_path: str = "POLICY.md") -> Dict[str, Any]:
    """
    Loads and caches backward compatibility rules from POLICY.md.
    """
    rules = {
        "breaking": list(BREAKING_CATEGORIES),
        "safe": list(SAFE_CATEGORIES),
        "uncertain": list(UNCERTAIN_CATEGORIES),
    }
    resolved_path = policy_path
    if not os.path.exists(resolved_path):
        resolved_path = os.path.join(os.path.dirname(__file__), policy_path)
    
    if os.path.exists(resolved_path):
        try:
            with open(resolved_path, "r", encoding="utf-8") as f:
                content = f.read()
                rules["raw_policy_length"] = len(content)
        except Exception as e:
            logger.warning(f"Could not load custom policy file at {resolved_path}: {e}")

    return rules


def normalize_category(raw_type: str, severity: str) -> str:
    """
    Normalizes arbitrary internal diff types into one of the 13 ground-truth categories.
    """
    t = raw_type.lower()
    
    # 1. Breaking mappings
    if "endpoint_removed" in t or "route_removed" in t or "method_removed" in t:
        return "endpoint_removed"
    if "required" in t and ("added" in t or "made" in t):
        return "required_field_added"
    if "type" in t and ("changed" in t or "narrowed" in t or "mismatch" in t):
        return "type_changed"
    if "enum" in t and ("removed" in t or "restricted" in t or "narrowed" in t):
        return "enum_restricted"
    if "response" in t and ("removed" in t or "field_removed" in t):
        return "response_field_removed"
    if "security" in t or "auth" in t:
        return "security_changed"
    if "status" in t and ("changed" in t or "removed" in t):
        return "status_code_changed"
        
    # 2. Safe mappings
    if "optional" in t and "added" in t:
        return "optional_field_added"
    if "new_endpoint" in t or "endpoint_added" in t or "method_added" in t:
        return "new_endpoint"
    if "description" in t or "summary" in t or "doc" in t:
        return "description_only"
    if "response" in t and "added" in t:
        return "new_response_field"
        
    # 3. Uncertain mappings
    if "ambiguous" in t or "ref_changed" in t or "nullable" in t:
        return "ambiguous_schema"
    if "insufficient" in t or "unknown" in t:
        return "insufficient_evidence"
        
    # Fallback based on severity
    if severity == "breaking":
        return "endpoint_removed" if "endpoint" in t else "type_changed"
    elif severity == "safe":
        return "optional_field_added"
    else:
        return "ambiguous_schema"


def analyze_drift(v1_spec: Dict[str, Any], v2_spec: Dict[str, Any], policy_file: str = "POLICY.md") -> Dict[str, Any]:
    """
    Analyze drift between two OpenAPI specifications according to the 13-category policy matrix.
    
    Args:
        v1_spec (dict): OpenAPI 3.0/3.1 spec (baseline production version)
        v2_spec (dict): OpenAPI 3.0/3.1 spec (proposed new version)
        policy_file (str): Path to POLICY.md ground-truth rules
    
    Returns:
        dict: {
            "breaking": List[dict],
            "safe": List[dict],
            "uncertain": List[dict],
            "total_changes": int
        }
        
    Example:
        result = analyze_drift(v1, v2)
        print(len(result['breaking']))
    """
    logger.info("Starting analyze_drift for OpenAPI specs")
    load_policy_rules(policy_file)

    # 1. Structural AST Diff
    diff_engine = OpenAPIDiffEngine(v1_spec, v2_spec)
    raw_changes = diff_engine.extract_changes()
    logger.info(f"Extracted {len(raw_changes)} raw structural changes")

    # 2. Semantic Classification
    classifier = ChangeClassifier(use_llm_fallback=False)
    classified_changes = classifier.classify_changes(raw_changes)

    # 3. Enrich Impact & Map to 13 Categories
    analyzer = ImpactAnalyzer()
    enriched = analyzer.analyze_impact(classified_changes)

    breaking_list: List[Dict[str, Any]] = []
    safe_list: List[Dict[str, Any]] = []
    uncertain_list: List[Dict[str, Any]] = []

    for c in enriched:
        raw_type = c.get("type", "")
        sev = c.get("severity", "uncertain")
        category = normalize_category(raw_type, sev)
        
        path = c.get("path", "")
        method = c.get("method", "ALL")
        field = c.get("field") or c.get("parameter") or ""
        v1_val = c.get("v1_value")
        v2_val = c.get("v2_value")

        # Construct concrete evidence string
        if category == "endpoint_removed":
            evidence = f"Endpoint '{method} {path}' exists in v1 but is missing from v2 spec."
        elif category == "required_field_added":
            evidence = f"Schema diff: mandatory field '{field or 'property'}' added to request body in v2."
        elif category == "type_changed":
            evidence = f"Type mutation: '{field}' shifted from '{v1_val}' (v1) to '{v2_val}' (v2)."
        elif category == "enum_restricted":
            evidence = f"Enum restriction: Allowed values for '{field}' narrowed in v2."
        elif category == "response_field_removed":
            evidence = f"Response schema diff: field '{field}' removed from response body in v2."
        elif category == "security_changed":
            evidence = f"Security scheme modified: new mandatory authentication scope or scheme applied."
        elif category == "status_code_changed":
            evidence = f"HTTP response status codes modified for route '{method} {path}'."
        elif category == "optional_field_added":
            evidence = f"Backward-compatible addition: optional field '{field}' added."
        elif category == "new_endpoint":
            evidence = f"New endpoint '{method} {path}' added; existing endpoints untouched."
        elif category == "description_only":
            evidence = f"Documentation / description update only; zero runtime or schema impact."
        elif category == "new_response_field":
            evidence = f"Non-breaking response addition: optional field '{field}' added to response."
        elif category == "ambiguous_schema":
            evidence = f"Ambiguous schema reference mutation on '{field or path}'; runtime validation uncertain."
        else:
            evidence = f"Insufficient schema evidence for '{field or path}'; flagged for human review."

        confidence = c.get("confidence", 0.99 if category in BREAKING_CATEGORIES else (0.95 if category in SAFE_CATEGORIES else 0.50))
        
        entry = {
            "id": c.get("id", f"change_{len(breaking_list)+len(safe_list)+len(uncertain_list)+1}"),
            "type": category,
            "path": path,
            "method": method,
            "field": field,
            "severity": "breaking" if category in BREAKING_CATEGORIES else ("safe" if category in SAFE_CATEGORIES else "uncertain"),
            "confidence": round(confidence, 2),
            "evidence": evidence,
            "details": c.get("details", evidence),
            "reasoning": c.get("explanation", evidence),
            "impact_items": c.get("impact_items", []),
            "affected_docs": c.get("affected_docs", []),
            "migration_guide": c.get("migration_guide", ""),
            "v1_value": v1_val,
            "v2_value": v2_val,
        }

        if category in BREAKING_CATEGORIES:
            breaking_list.append(entry)
        elif category in SAFE_CATEGORIES:
            safe_list.append(entry)
        else:
            uncertain_list.append(entry)

    total = len(breaking_list) + len(safe_list) + len(uncertain_list)
    logger.info(f"Analysis complete: {len(breaking_list)} breaking, {len(safe_list)} safe, {len(uncertain_list)} uncertain")

    return {
        "breaking": breaking_list,
        "safe": safe_list,
        "uncertain": uncertain_list,
        "total_changes": total,
    }


class ImpactAnalyzer:
    """
    Analyzes downstream blast radius across:
    1. Client SDK method names & signatures
    2. Documentation tutorials & code snippets
    3. Integration test suites and migration effort
    """

    def analyze_impact(self, changes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enriches each change with downstream impact items and concrete migration actions.
        """
        for change in changes:
            impact_items = []
            affected_docs = []
            migration_guide = ""

            path = change.get("path", "")
            method = change.get("method", "GET").upper()
            field = change.get("field", "")
            schema = change.get("schema", "")
            param = change.get("parameter", "")
            ctype = change.get("type", "")

            # Infer SDK method names
            sdk_method = self._infer_sdk_method(method, path)

            if ctype in ["endpoint_removed", "route_removed", "method_removed"]:
                impact_items.append({
                    "name": "Python SDK",
                    "affected": f"client.{sdk_method}()",
                    "detail": "Method calls will throw HTTP 404 ApiNotFoundError"
                })
                impact_items.append({
                    "name": "TypeScript SDK",
                    "affected": f"apiClient.{sdk_method}()",
                    "detail": "Compiler/runtime error: endpoint removed"
                })
                affected_docs.append(f"docs/reference/{path.strip('/').replace('/', '-')}.md")
                affected_docs.append("README.md#quickstart-examples")
                migration_guide = f"Deprecate '{method} {path}' with an API Sunset header, or direct clients to replacement endpoint."

            elif ctype in ["field_required_added", "required_parameter_added", "parameter_made_required", "required_field_added"]:
                prop_name = field or param
                impact_items.append({
                    "name": "Payload Serializers",
                    "affected": f"{schema or 'Request'}Schema",
                    "detail": f"Omitting '{prop_name}' will trigger 422 Unprocessable Entity"
                })
                impact_items.append({
                    "name": "Client Callers",
                    "affected": f"{sdk_method}(...)",
                    "detail": f"Callers must provide mandatory parameter '{prop_name}'"
                })
                affected_docs.append(f"docs/models/{schema or 'requests'}.md")
                migration_guide = f"Provide a sensible default value for '{prop_name}' on the server, or phase in required validation with telemetry."

            elif ctype in ["field_type_changed", "type_changed"]:
                impact_items.append({
                    "name": "SDK Type Definitions",
                    "affected": f"{schema or 'Type'}.d.ts",
                    "detail": f"Type mismatch: '{change.get('v1_value')}' -> '{change.get('v2_value')}'"
                })
                impact_items.append({
                    "name": "JSON Parsers",
                    "affected": "Client Response Deserialization",
                    "detail": "Type casting exceptions during JSON decoding"
                })
                affected_docs.append(f"docs/schemas/{schema or 'models'}.md")
                migration_guide = f"Accept both '{change.get('v1_value')}' and '{change.get('v2_value')}' in the server controller during a transitional release."

            elif ctype == "security_changed":
                impact_items.append({
                    "name": "Auth Middleware",
                    "affected": "Authorization Header / API Keys",
                    "detail": "All client authentication tokens must be reissued or updated"
                })
                affected_docs.append("docs/authentication.md")
                migration_guide = "Support dual-authentication schemes during migration grace period."

            elif ctype in ["enum_value_removed", "enum_restricted"]:
                impact_items.append({
                    "name": "Client Enum Encoders",
                    "affected": f"{schema or 'Enum'}.{field}",
                    "detail": "Legacy enum strings rejected by schema validator"
                })
                affected_docs.append(f"docs/enums/{schema}_{field}.md")
                migration_guide = "Maintain backward-compatible enum parsing on the server with fallback handling."

            else:
                # Safe additions
                impact_items.append({
                    "name": "Client SDKs",
                    "affected": f"{sdk_method or 'API Model'}",
                    "detail": "Non-breaking addition. Clients can optionally adopt new capabilities."
                })
                affected_docs.append("CHANGELOG.md (feature addition)")
                migration_guide = "No mandatory migration required for existing consumers."

            change["impact_items"] = impact_items
            change["affected_docs"] = affected_docs
            change["migration_guide"] = migration_guide

        return changes

    def _infer_sdk_method(self, method: str, path: str) -> str:
        clean_path = re.sub(r"\{[a-zA-Z0-9_]+\}", "", path).strip("/").replace("/", "_").replace("-", "_")
        prefix = method.lower()
        return f"{prefix}_{clean_path}" if clean_path else prefix
