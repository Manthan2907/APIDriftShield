"""
Baseline Evaluator for API DriftShield Benchmarking
Implements standard naive static OpenAPI diffing + simple unverified heuristic/LLM summary.
Used as the competitive baseline to demonstrate measured improvement.
"""

from typing import List, Dict, Any

class BaselineDiffTool:
    """
    Standard naive baseline:
    - Performs basic JSON diff
    - Lacks runtime execution verification
    - Lacks downstream SDK/docs impact analysis
    - Does not abstain when evidence is incomplete (often guesses or hallucinates)
    """

    def analyze(self, v1_spec: Dict[str, Any], v2_spec: Dict[str, Any]) -> Dict[str, Any]:
        v1_paths = v1_spec.get("paths", {}) or {}
        v2_paths = v2_spec.get("paths", {}) or {}

        v1_schemas = v1_spec.get("components", {}).get("schemas", {}) or {}
        v2_schemas = v2_spec.get("components", {}).get("schemas", {}) or {}

        changes = []
        breaking_count = 0

        # Naive path diff
        for path in set(v1_paths.keys()) - set(v2_paths.keys()):
            changes.append({
                "type": "endpoint_removed",
                "path": path,
                "severity": "breaking",
                "confidence": 0.70
            })
            breaking_count += 1

        for path in set(v2_paths.keys()) - set(v1_paths.keys()):
            changes.append({
                "type": "endpoint_added",
                "path": path,
                "severity": "safe",
                "confidence": 0.70
            })

        # Naive schema diff (prone to false positives on harmless refactors or missing runtime nuance)
        for name in set(v1_schemas.keys()) - set(v2_schemas.keys()):
            changes.append({
                "type": "schema_removed",
                "schema": name,
                "severity": "breaking",
                "confidence": 0.65
            })
            breaking_count += 1

        for name in set(v2_schemas.keys()) - set(v1_schemas.keys()):
            changes.append({
                "type": "schema_added",
                "schema": name,
                "severity": "safe",
                "confidence": 0.65
            })

        # Inspect schema properties
        for name in set(v1_schemas.keys()) & set(v2_schemas.keys()):
            s1 = v1_schemas[name] or {}
            s2 = v2_schemas[name] or {}
            props1 = s1.get("properties", {}) or {}
            props2 = s2.get("properties", {}) or {}
            req2 = set(s2.get("required", []) or [])
            req1 = set(s1.get("required", []) or [])

            for p in req2 - req1:
                changes.append({
                    "type": "field_required_added",
                    "schema": name,
                    "field": p,
                    "severity": "breaking",
                    "confidence": 0.70
                })
                breaking_count += 1

            for p in set(props2.keys()) - set(props1.keys()) - req2:
                changes.append({
                    "type": "optional_field_added",
                    "schema": name,
                    "field": p,
                    "severity": "safe",
                    "confidence": 0.70
                })

            for p in set(props1.keys()) & set(props2.keys()):
                t1 = props1[p].get("type")
                t2 = props2[p].get("type")
                if t1 != t2 and t1 and t2:
                    changes.append({
                        "type": "type_changed",
                        "schema": name,
                        "field": p,
                        "severity": "breaking",
                        "confidence": 0.60
                    })
                    breaking_count += 1

        # Check security
        if v1_spec.get("security") != v2_spec.get("security") and (v1_spec.get("security") or v2_spec.get("security")):
            changes.append({
                "type": "security_changed",
                "severity": "breaking",
                "confidence": 0.70
            })
            breaking_count += 1

        return {
            "total_changes": len(changes),
            "breaking_changes": breaking_count,
            "safe_changes": len(changes) - breaking_count,
            "changes": changes,
            "overall_severity": "breaking" if breaking_count > 0 else "safe"
        }
