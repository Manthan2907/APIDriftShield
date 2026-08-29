"""
Migration Path & Code Remediation Generator for API DriftShield
Synthesizes actionable, step-by-step client migration paths, regex/sed commands, and replacement code snippets for breaking contract changes.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

logger = logging.getLogger("driftshield.migration_generator")


def generate_migration_paths(
    breaking_changes: List[Dict[str, Any]],
    v1_spec: Optional[Dict[str, Any]] = None,
    v2_spec: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    For each breaking change, generate exact migration steps, time estimates, and regex find-and-replace rules.
    """
    v1_spec = v1_spec or {}
    v2_spec = v2_spec or {}

    if not breaking_changes:
        return {
            "success": True,
            "migrations": [],
            "total_effort_hours": 0.0,
            "total_effort_minutes": 0,
            "message": "No breaking changes detected"
        }

    migrations = []
    total_effort_minutes = 0

    for idx, change in enumerate(breaking_changes):
        migration = generate_single_migration(change, v1_spec, v2_spec, idx + 1)
        migrations.append(migration)
        total_effort_minutes += migration.get("time_minutes", 10)

    hours = round(total_effort_minutes / 60, 1)
    completion_date = calculate_completion_date(total_effort_minutes)

    return {
        "success": True,
        "migrations": migrations,
        "total_effort_hours": hours,
        "total_effort_minutes": total_effort_minutes,
        "estimated_completion_date": completion_date
    }


def generate_single_migration(
    change: Dict[str, Any],
    v1_spec: Dict[str, Any],
    v2_spec: Dict[str, Any],
    index: int = 1
) -> Dict[str, Any]:
    """Generate migration path for ONE breaking change"""
    change_type = change.get("type", "").lower()
    cid = change.get("id", f"mig_{index}")
    path = change.get("path") or change.get("route") or "/resource"
    method = change.get("method", "GET").upper()
    field = change.get("field") or change.get("parameter") or "property"
    schema = change.get("schema") or path.strip("/").split("/")[0] or "Resource"

    # TYPE 1: ENDPOINT REMOVED
    if change_type in ["endpoint_removed", "route_removed", "method_removed"]:
        similar_endpoint = find_similar_endpoint(path, method, v2_spec)
        old_fn = endpoint_to_method_name(path, method)
        new_fn = endpoint_to_method_name(similar_endpoint["path"], similar_endpoint.get("method", method))

        return {
            "change_id": cid,
            "breaking_change_type": "Endpoint Removed",
            "change_description": f"{method} {path} no longer exists in v2 specification",
            "severity": "Critical",
            "old_code": f"client.{old_fn}(id)",
            "new_code": f"client.{new_fn}(id)  # Replaces deleted {path}",
            "effort": "Low",
            "time_minutes": 10,
            "steps": [
                f"1. Search codebase for all invocations of `client.{old_fn}()`",
                f"2. Replace target endpoint calls with `client.{new_fn}()`",
                f"3. Run integration tests in staging sandbox",
                f"4. Deploy updated SDK / microservice clients"
            ],
            "regex_find_replace": {
                "find": f"{old_fn}\\(",
                "replace": f"{new_fn}("
            },
            "bash_command": f'grep -r "{old_fn}" ./src --include="*.py" --include="*.ts" | wc -l',
            "similar_endpoint": similar_endpoint
        }

    # TYPE 2: REQUIRED FIELD ADDED
    elif change_type in ["required_field_added", "field_required_added", "parameter_made_required"]:
        schema_clean = schema.replace("{", "").replace("}", "").capitalize()
        return {
            "change_id": cid,
            "breaking_change_type": "Required Field Added",
            "change_description": f"Field `{field}` is now required in {schema_clean} request payload",
            "severity": "Critical",
            "old_code": f"client.create_{schema_clean.lower()}(name=\"John\")",
            "new_code": f"client.create_{schema_clean.lower()}(name=\"John\", {field}=\"<required_value>\")",
            "effort": "Medium",
            "time_minutes": 15,
            "steps": [
                f"1. Locate all `{schema_clean}` payload construction calls",
                f"2. Add mandatory property `{field}` to payload",
                f"3. Ensure `{field}` is collected from upstream client forms / config",
                f"4. Add unit test assertions verifying `{field}` is always present"
            ],
            "regex_find_replace": {
                "find": f"create_{schema_clean.lower()}\\(([^)]*?)\\)",
                "replace": f"create_{schema_clean.lower()}(\\1, {field}=\"<required_value>\")"
            },
            "bash_command": f'grep -r "create_{schema_clean.lower()}" ./src --include="*.ts" --include="*.py"',
            "field_info": {
                "field_name": field,
                "schema": schema_clean,
                "type": get_field_type(schema_clean, field, v2_spec),
                "description": get_field_description(schema_clean, field, v2_spec)
            }
        }

    # TYPE 3: TYPE CHANGED / TYPE NARROWED
    elif change_type in ["type_changed", "type_narrowed", "field_type_changed"]:
        old_type = str(change.get("v1_value") or "string")
        new_type = str(change.get("v2_value") or "integer")
        return {
            "change_id": cid,
            "breaking_change_type": "Type Changed",
            "change_description": f"Property `{field}` changed data type from `{old_type}` to `{new_type}`",
            "severity": "High",
            "old_code": f'payload = {{"{field}": "12345"}}  # Old type: {old_type}',
            "new_code": f'payload = {{"{field}": int(raw_val)}}  # New type: {new_type}',
            "effort": "Medium",
            "time_minutes": 20,
            "steps": [
                f"1. Find all serializers and request builders assigning `{field}`",
                f"2. Explicitly cast value to `{new_type}` before dispatching",
                f"3. Update client-side TypeScript interface / Python dataclass",
                f"4. Verify deserialization with test probes"
            ],
            "conversion_snippet": {
                "before": f'val = request.data["{field}"]  # {old_type}',
                "after": f'val = {new_type}(request.data["{field}"])  # {new_type}'
            },
            "type_mapping": {
                "old_type": old_type,
                "new_type": new_type,
                "conversion": f"{new_type}({field})"
            }
        }

    # TYPE 4: ENUM RESTRICTED
    elif change_type in ["enum_restricted", "enum_value_removed"]:
        removed_val = str(change.get("removed_value") or change.get("v1_value") or "deprecated_val")
        return {
            "change_id": cid,
            "breaking_change_type": "Enum Value Restricted",
            "change_description": f"Enum option `{removed_val}` has been removed from `{field}`",
            "severity": "High",
            "old_code": f'status = "{removed_val}"  # Removed in v2',
            "new_code": f'status = "active"  # Migrate to supported enum variant',
            "effort": "Medium",
            "time_minutes": 15,
            "steps": [
                f"1. Search codebase for references to enum value `{removed_val}`",
                f"2. Map `{removed_val}` to replacement active enum value",
                f"3. Update frontend dropdowns / client filters",
                f"4. Add fallback handler for legacy stored database records"
            ],
            "regex_find_replace": {
                "find": f'{field}\\s*=\\s*["\']?{removed_val}["\']?',
                "replace": f'{field} = "<supported_enum_value>"'
            },
            "bash_command": f'grep -r "{removed_val}" ./src --include="*.ts" --include="*.py"'
        }

    # TYPE 5: RESPONSE FIELD REMOVED
    elif change_type in ["response_field_removed", "response_body_field_removed"]:
        return {
            "change_id": cid,
            "breaking_change_type": "Response Field Removed",
            "change_description": f"Response field `{field}` on route `{path}` removed in v2",
            "severity": "High",
            "old_code": f'value = response.data["{field}"]  # KeyError if missing in v2',
            "new_code": f'value = response.data.get("{field}", default_fallback)',
            "effort": "Low",
            "time_minutes": 10,
            "steps": [
                f"1. Locate client response parsers accessing `.{field}`",
                f"2. Wrap with safe optional access or default fallback",
                f"3. Update UI components that display `{field}`"
            ],
            "regex_find_replace": {
                "find": f'\\.{field}',
                "replace": f'?.{field}'
            }
        }

    # TYPE 6: SECURITY / AUTH CHANGED
    elif change_type in ["security_changed", "auth_scheme_changed"]:
        return {
            "change_id": cid,
            "breaking_change_type": "Authentication Scheme Changed",
            "change_description": f"Route `{path}` requires upgraded authentication scope / token",
            "severity": "Critical",
            "old_code": "headers['Authorization'] = f'Bearer {legacy_token}'",
            "new_code": "headers['Authorization'] = f'Bearer {oauth2_scoped_token}'",
            "effort": "High",
            "time_minutes": 25,
            "steps": [
                "1. Update OAuth2 client token generation to request new scope",
                "2. Verify JWT token expiry and refresh handlers",
                "3. Test authentication against sandbox API endpoint"
            ]
        }

    # DEFAULT FALLBACK
    else:
        return {
            "change_id": cid,
            "breaking_change_type": change.get("type", "Contract Change").replace("_", " ").title(),
            "change_description": change.get("details") or f"Breaking contract change on route {path}",
            "severity": "Medium",
            "old_code": f"client.call_legacy_{path.strip('/').replace('/', '_')}()",
            "new_code": f"client.call_v2_{path.strip('/').replace('/', '_')}()",
            "effort": "Medium",
            "time_minutes": 15,
            "steps": [
                f"1. Review OpenAPI v2 specification diff for route `{path}`",
                f"2. Update request and response data types",
                f"3. Run automated end-to-end integration tests"
            ]
        }


def find_similar_endpoint(old_path: str, method: str, v2_spec: Dict[str, Any]) -> Dict[str, Any]:
    """Find similar replacement endpoint in v2 spec"""
    v2_paths = v2_spec.get("paths", {})
    resource = old_path.strip("/").split("/")[0] if "/" in old_path.strip("/") else old_path.strip("/")
    
    candidates = []
    for path, methods in v2_paths.items():
        if resource.lower() in path.lower():
            for m in methods.keys():
                if m.upper() == method.upper() or m.upper() in ["PUT", "PATCH", "POST"]:
                    score = calculate_path_similarity(old_path, path)
                    candidates.append({
                        "path": path,
                        "method": m.upper(),
                        "similarity_score": score
                    })
    
    if candidates:
        best = sorted(candidates, key=lambda x: x["similarity_score"], reverse=True)[0]
        return best
    
    return {
        "path": f"/{resource}/archive" if method == "DELETE" else f"/{resource}",
        "method": "PUT" if method == "DELETE" else method,
        "note": "Suggested alternative endpoint"
    }


def endpoint_to_method_name(path: str, method: str) -> str:
    """Convert /users/{id}/archive + PUT -> update_users_archive"""
    raw_parts = [p for p in path.strip("/").split("/") if p]
    # Filter out pure parameter placeholders like {id}, {userId}, {petId}
    meaningful = [p.replace("{", "").replace("}", "") for p in raw_parts if not (p.startswith("{") and p.endswith("}"))]
    
    if not meaningful:
        meaningful = ["resource"]

    method_map = {
        "GET": "get",
        "POST": "create",
        "PUT": "update",
        "DELETE": "delete",
        "PATCH": "patch"
    }
    prefix = method_map.get(method.upper(), "call")
    action_name = "_".join(meaningful)
    return f"{prefix}_{action_name}"


def calculate_path_similarity(path1: str, path2: str) -> float:
    """Calculate path similarity 0.0 - 1.0"""
    seg1 = path1.strip("/").split("/")
    seg2 = path2.strip("/").split("/")
    matching = sum(1 for s1, s2 in zip(seg1, seg2) if s1 == s2 or "{" in s1 or "{" in s2)
    total = max(len(seg1), len(seg2), 1)
    return round(matching / total, 2)


def get_field_type(schema: str, field: str, v2_spec: Dict[str, Any]) -> str:
    """Get field data type from spec"""
    schemas = v2_spec.get("components", {}).get("schemas", {})
    if schema in schemas:
        props = schemas[schema].get("properties", {})
        if field in props:
            return props[field].get("type", "string")
    return "string"


def get_field_description(schema: str, field: str, v2_spec: Dict[str, Any]) -> str:
    """Get description of field from spec"""
    schemas = v2_spec.get("components", {}).get("schemas", {})
    if schema in schemas:
        props = schemas[schema].get("properties", {})
        if field in props:
            return props[field].get("description", f"Mandatory parameter for {schema}")
    return f"Required field: {field}"


def calculate_completion_date(total_minutes: int) -> str:
    """Estimate completion date assuming standard development capacity"""
    hours_needed = max(total_minutes / 60, 0.5)
    work_days = hours_needed / 6.0
    completion = datetime.now() + timedelta(days=int(work_days) + 1)
    return completion.strftime("%Y-%m-%d")
