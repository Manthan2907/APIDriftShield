"""
Executable Test Generator for API DriftShield
Generates targeted synthetic HTTP probes to reproduce or refute breaking change claims.
"""

import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("driftshield.test_generator")


def generate_tests(changes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates targeted executable HTTP black-box test probes for detected contract changes.
    
    Args:
        changes (list): List of change dictionaries
        
    Returns:
        list: List of executable test dictionaries
    """
    logger.info(f"Generating executable test probes for {len(changes)} changes")
    tests = []

    for idx, change in enumerate(changes):
        change_id = change.get("id", f"c_{idx+1}")
        ctype = change.get("type", "").lower()
        severity = change.get("severity", "safe")
        path = change.get("path") or f"/{change.get('schema', 'resource').lower()}"
        method = change.get("method") or "POST"
        field = change.get("field") or change.get("parameter") or "property"
        v1_val = change.get("v1_value")
        v2_val = change.get("v2_value")

        # 1. Endpoint removed -> expect 404
        if ctype in ["endpoint_removed", "route_removed", "method_removed"]:
            tests.append({
                "id": f"test_{change_id}_404",
                "change_id": change_id,
                "type": "endpoint_availability",
                "method": method.upper(),
                "path": path,
                "headers": {"Content-Type": "application/json", "Accept": "application/json"},
                "body": None,
                "expected_status": 404,
                "expected_v1_status": 200,
                "expected_v2_status": 404,
                "description": f"Verify endpoint '{method.upper()} {path}' returns HTTP 404 Not Found in v2",
                "reproduction_goal": "Prove that calling this route fails with 404 in v2."
            })

        # 2. Required field added -> send body without field -> expect 422
        elif ctype in ["required_field_added", "field_required_added", "parameter_made_required"]:
            tests.append({
                "id": f"test_{change_id}_422",
                "change_id": change_id,
                "type": "mandatory_field_omission",
                "method": method.upper() if method != "ALL" else "POST",
                "path": path,
                "headers": {"Content-Type": "application/json"},
                "body": {"sample_existing_field": "test_data"},
                "expected_status": 422,
                "expected_v1_status": 200,
                "expected_v2_status": 422,
                "description": f"Send request omitting newly required property '{field}' -> expect 422 Unprocessable Entity",
                "reproduction_goal": f"Prove that omitting '{field}' fails schema validation in v2."
            })

        # 3. Type changed -> send old type -> expect 400
        elif ctype in ["type_changed", "field_type_changed"]:
            body_payload = {}
            if str(v1_val).lower() in ["string", "str"]:
                body_payload[field] = "invalid_string_instead_of_int"
            elif str(v1_val).lower() in ["integer", "int", "number"]:
                body_payload[field] = 12345
            elif str(v1_val).lower() in ["boolean", "bool"]:
                body_payload[field] = True
            else:
                body_payload[field] = "legacy_v1_format_value"

            tests.append({
                "id": f"test_{change_id}_400",
                "change_id": change_id,
                "type": "type_mutation_probe",
                "method": method.upper() if method != "ALL" else "POST",
                "path": path,
                "headers": {"Content-Type": "application/json"},
                "body": body_payload,
                "expected_status": 400,
                "expected_v1_status": 200,
                "expected_v2_status": 400,
                "description": f"Send request with old type ({v1_val}) for '{field}' -> expect 400 Bad Request",
                "reproduction_goal": f"Prove that v2 rejects old payload data types."
            })

        # 4. Enum restricted -> send old enum value -> expect 422
        elif ctype in ["enum_restricted", "enum_value_removed"]:
            tests.append({
                "id": f"test_{change_id}_enum_422",
                "change_id": change_id,
                "type": "enum_narrowing_probe",
                "method": method.upper() if method != "ALL" else "POST",
                "path": path,
                "headers": {"Content-Type": "application/json"},
                "body": {field: str(v1_val or "deprecated_enum_option")},
                "expected_status": 422,
                "expected_v1_status": 200,
                "expected_v2_status": 422,
                "description": f"Send request with removed enum value '{v1_val or 'deprecated_option'}' -> expect 422",
                "reproduction_goal": "Prove that removed enum option is rejected in v2."
            })

        # 5. Security changed -> probe auth -> expect 401
        elif ctype in ["security_changed", "auth_scheme_changed"]:
            tests.append({
                "id": f"test_{change_id}_auth_401",
                "change_id": change_id,
                "type": "auth_regression_probe",
                "method": method.upper() if method != "ALL" else "GET",
                "path": path,
                "headers": {"Authorization": "Bearer legacy_v1_token"},
                "body": None,
                "expected_status": 401,
                "expected_v1_status": 200,
                "expected_v2_status": 401,
                "description": f"Send request with legacy authentication scope to '{path}' -> expect 401 Unauthorized",
                "reproduction_goal": "Prove that v2 requires new auth scope."
            })

        # 6. Generic breaking/caution change fallback
        elif severity in ["breaking", "caution"]:
            tests.append({
                "id": f"test_{change_id}_probe",
                "change_id": change_id,
                "type": "endpoint_availability" if severity == "breaking" else "safe_probe",
                "method": method.upper() if method != "ALL" else "GET",
                "path": path,
                "headers": {"Content-Type": "application/json"},
                "body": {"probe": True},
                "expected_status": 400 if severity == "breaking" else 200,
                "expected_v1_status": 200,
                "expected_v2_status": 400 if severity == "breaking" else 200,
                "description": f"Probe contract change '{ctype}' on route '{method} {path}'",
                "reproduction_goal": f"Verify behavioral difference between v1 and v2."
            })

    logger.info(f"Generated {len(tests)} test cases")
    return tests


class TestGenerator:
    """
    Synthesizes executable HTTP test probes from detected contract changes.
    These probes verify whether an API runtime actually exhibits breaking behavior.
    """

    def __init__(self, v1_spec: Optional[Dict[str, Any]] = None, v2_spec: Optional[Dict[str, Any]] = None):
        self.v1_spec = v1_spec or {}
        self.v2_spec = v2_spec or {}

    def generate_probes(self, classified_changes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generates probe list compatible with fixture runners."""
        tests = generate_tests(classified_changes)
        probes = []
        for t in tests:
            probes.append({
                "probe_id": t["id"],
                "change_id": t["change_id"],
                "type": t.get("type", "endpoint_availability"),
                "title": t["description"],
                "request": {
                    "method": t["method"],
                    "path": t["path"],
                    "headers": t.get("headers", {}),
                    "body": t.get("body")
                },
                "expected_v1": f"HTTP {t.get('expected_v1_status', 200)}",
                "expected_v2": f"HTTP {t.get('expected_status', 400)}",
                "assert_condition": f"v2_status == {t.get('expected_status', 400)}",
                "reproduction_goal": t.get("reproduction_goal", "")
            })
        return probes
