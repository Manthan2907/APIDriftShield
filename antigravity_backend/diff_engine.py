"""
Deterministic OpenAPI Diff Engine for API DriftShield
Pure structural comparison of OpenAPI 3.0/3.1 specifications.
No LLM hallucination - extracts exact path, method, schema, parameter, auth, and response changes.
"""

import json
from typing import List, Dict, Any, Optional, Set, Tuple


class OpenAPIDiffEngine:
    """
    Compares two OpenAPI specifications and extracts raw structural changes.
    Deterministic, reproducible, and policy-agnostic.
    """

    def __init__(self, v1_spec: Dict[str, Any], v2_spec: Dict[str, Any]):
        self.v1 = v1_spec if isinstance(v1_spec, dict) else {}
        self.v2 = v2_spec if isinstance(v2_spec, dict) else {}
        self.changes: List[Dict[str, Any]] = []

    def extract_changes(self) -> List[Dict[str, Any]]:
        """
        Extract all changes between v1 and v2.
        Returns a list of raw change dictionaries.
        """
        self.changes = []
        self._compare_paths()
        self._compare_schemas()
        self._compare_security()
        return self.changes

    def _compare_paths(self):
        """Detect added, removed, and modified endpoints and operations."""
        v1_paths = self.v1.get("paths", {}) or {}
        v2_paths = self.v2.get("paths", {}) or {}

        v1_path_keys = set(v1_paths.keys())
        v2_path_keys = set(v2_paths.keys())

        # Removed endpoints entirely
        for path in v1_path_keys - v2_path_keys:
            path_item = v1_paths[path] or {}
            methods = [m.lower() for m in path_item.keys() if m.lower() in ["get", "post", "put", "delete", "patch", "options", "head"]]
            for method in methods:
                op = path_item.get(method) or {}
                self.changes.append({
                    "id": f"diff_path_rm_{method}_{path.replace('/', '_')}",
                    "type": "endpoint_removed",
                    "path": path,
                    "method": method.upper(),
                    "operation_id": op.get("operationId", ""),
                    "summary": op.get("summary", ""),
                    "v1_value": "EXISTS",
                    "v2_value": "REMOVED",
                    "details": f"Endpoint {method.upper()} {path} exists in v1 but is completely absent in v2."
                })

        # Added endpoints
        for path in v2_path_keys - v1_path_keys:
            path_item = v2_paths[path] or {}
            methods = [m.lower() for m in path_item.keys() if m.lower() in ["get", "post", "put", "delete", "patch", "options", "head"]]
            for method in methods:
                op = path_item.get(method) or {}
                self.changes.append({
                    "id": f"diff_path_add_{method}_{path.replace('/', '_')}",
                    "type": "endpoint_added",
                    "path": path,
                    "method": method.upper(),
                    "operation_id": op.get("operationId", ""),
                    "summary": op.get("summary", ""),
                    "v1_value": "NONE",
                    "v2_value": "EXISTS",
                    "details": f"New endpoint {method.upper()} {path} added in v2."
                })

        # Overlapping paths - inspect individual HTTP methods & operations
        for path in v1_path_keys & v2_path_keys:
            self._compare_path_operations(path, v1_paths[path] or {}, v2_paths[path] or {})

    def _compare_path_operations(self, path: str, v1_path_item: Dict[str, Any], v2_path_item: Dict[str, Any]):
        methods = ["get", "post", "put", "delete", "patch", "options", "head"]
        v1_methods = {m for m in v1_path_item if m.lower() in methods}
        v2_methods = {m for m in v2_path_item if m.lower() in methods}

        # Removed method from existing path
        for method in v1_methods - v2_methods:
            op = v1_path_item.get(method) or {}
            self.changes.append({
                "id": f"diff_method_rm_{method}_{path.replace('/', '_')}",
                "type": "endpoint_removed",
                "path": path,
                "method": method.upper(),
                "operation_id": op.get("operationId", ""),
                "summary": op.get("summary", ""),
                "v1_value": "EXISTS",
                "v2_value": "REMOVED",
                "details": f"HTTP method {method.upper()} on path {path} was removed in v2."
            })

        # Added method to existing path
        for method in v2_methods - v1_methods:
            op = v2_path_item.get(method) or {}
            self.changes.append({
                "id": f"diff_method_add_{method}_{path.replace('/', '_')}",
                "type": "endpoint_added",
                "path": path,
                "method": method.upper(),
                "operation_id": op.get("operationId", ""),
                "summary": op.get("summary", ""),
                "v1_value": "NONE",
                "v2_value": "EXISTS",
                "details": f"HTTP method {method.upper()} on path {path} added in v2."
            })

        # Compare existing operations on both versions
        for method in v1_methods & v2_methods:
            v1_op = v1_path_item[method] or {}
            v2_op = v2_path_item[method] or {}
            self._compare_operation_details(path, method.upper(), v1_op, v2_op)

    def _compare_operation_details(self, path: str, method: str, v1_op: Dict[str, Any], v2_op: Dict[str, Any]):
        # 1. Operation security
        v1_sec = v1_op.get("security", None)
        v2_sec = v2_op.get("security", None)
        if v1_sec != v2_sec and (v1_sec is not None or v2_sec is not None):
            self.changes.append({
                "id": f"diff_sec_{method}_{path.replace('/', '_')}",
                "type": "security_changed",
                "path": path,
                "method": method,
                "v1_value": json.dumps(v1_sec) if v1_sec is not None else "GLOBAL/INHERITED",
                "v2_value": json.dumps(v2_sec) if v2_sec is not None else "GLOBAL/INHERITED",
                "details": f"Security scheme for {method} {path} modified."
            })

        # 2. Parameters (query, path, header)
        self._compare_parameters(path, method, v1_op.get("parameters", []) or [], v2_op.get("parameters", []) or [])

        # 3. Request Body
        self._compare_request_body(path, method, v1_op.get("requestBody", {}) or {}, v2_op.get("requestBody", {}) or {})

        # 4. Responses
        self._compare_responses(path, method, v1_op.get("responses", {}) or {}, v2_op.get("responses", {}) or {})

    def _compare_parameters(self, path: str, method: str, v1_params: List[Dict], v2_params: List[Dict]):
        v1_map = {f"{p.get('in', 'query')}:{p.get('name')}": p for p in v1_params if isinstance(p, dict)}
        v2_map = {f"{p.get('in', 'query')}:{p.get('name')}": p for p in v2_params if isinstance(p, dict)}

        # Removed parameters
        for key in set(v1_map.keys()) - set(v2_map.keys()):
            p = v1_map[key]
            self.changes.append({
                "id": f"diff_param_rm_{method}_{path.replace('/', '_')}_{p.get('name')}",
                "type": "parameter_removed",
                "path": path,
                "method": method,
                "parameter": p.get("name"),
                "param_in": p.get("in"),
                "v1_value": f"exists({p.get('in')}, req={p.get('required', False)})",
                "v2_value": "REMOVED",
                "details": f"Parameter '{p.get('name')}' in {p.get('in')} removed from {method} {path}."
            })

        # Added parameters
        for key in set(v2_map.keys()) - set(v1_map.keys()):
            p = v2_map[key]
            is_req = p.get("required", False)
            if is_req:
                self.changes.append({
                    "id": f"diff_param_req_add_{method}_{path.replace('/', '_')}_{p.get('name')}",
                    "type": "required_parameter_added",
                    "path": path,
                    "method": method,
                    "parameter": p.get("name"),
                    "param_in": p.get("in"),
                    "v1_value": "NONE",
                    "v2_value": f"required({p.get('in')})",
                    "details": f"New mandatory parameter '{p.get('name')}' in {p.get('in')} added to {method} {path}."
                })
            else:
                self.changes.append({
                    "id": f"diff_param_opt_add_{method}_{path.replace('/', '_')}_{p.get('name')}",
                    "type": "optional_parameter_added",
                    "path": path,
                    "method": method,
                    "parameter": p.get("name"),
                    "param_in": p.get("in"),
                    "v1_value": "NONE",
                    "v2_value": f"optional({p.get('in')})",
                    "details": f"Optional parameter '{p.get('name')}' in {p.get('in')} added to {method} {path}."
                })

        # Existing parameter changes (e.g. required flag flipped or type modified)
        for key in set(v1_map.keys()) & set(v2_map.keys()):
            p1 = v1_map[key]
            p2 = v2_map[key]
            # Required flipped false -> true
            if not p1.get("required", False) and p2.get("required", False):
                self.changes.append({
                    "id": f"diff_param_req_flip_{method}_{path.replace('/', '_')}_{p2.get('name')}",
                    "type": "parameter_made_required",
                    "path": path,
                    "method": method,
                    "parameter": p2.get("name"),
                    "param_in": p2.get("in"),
                    "v1_value": "optional",
                    "v2_value": "required",
                    "details": f"Parameter '{p2.get('name')}' changed from optional to required on {method} {path}."
                })

    def _compare_request_body(self, path: str, method: str, v1_rb: Dict[str, Any], v2_rb: Dict[str, Any]):
        v1_req = v1_rb.get("required", False)
        v2_req = v2_rb.get("required", False)

        if not v1_req and v2_req:
            self.changes.append({
                "id": f"diff_rb_req_{method}_{path.replace('/', '_')}",
                "type": "request_body_made_required",
                "path": path,
                "method": method,
                "v1_value": "optional",
                "v2_value": "required",
                "details": f"Request body for {method} {path} is now required."
            })

        # Inspect content schema properties
        v1_content = v1_rb.get("content", {}) or {}
        v2_content = v2_rb.get("content", {}) or {}

        for media_type in set(v1_content.keys()) & set(v2_content.keys()):
            s1 = v1_content[media_type].get("schema", {}) or {}
            s2 = v2_content[media_type].get("schema", {}) or {}
            self._compare_inline_schema(path, method, media_type, s1, s2)

    def _compare_inline_schema(self, path: str, method: str, media_type: str, s1: Dict[str, Any], s2: Dict[str, Any]):
        props1 = s1.get("properties", {}) or {}
        props2 = s2.get("properties", {}) or {}
        req1 = set(s1.get("required", []) or [])
        req2 = set(s2.get("required", []) or [])

        # Removed request property
        for prop in set(props1.keys()) - set(props2.keys()):
            self.changes.append({
                "id": f"diff_req_prop_rm_{method}_{path.replace('/', '_')}_{prop}",
                "type": "field_removed",
                "path": path,
                "method": method,
                "field": prop,
                "v1_value": props1[prop].get("type", "unknown"),
                "v2_value": "REMOVED",
                "details": f"Field '{prop}' removed from request body schema of {method} {path}."
            })

        # Required field added
        for prop in req2 - req1:
            self.changes.append({
                "id": f"diff_req_prop_req_add_{method}_{path.replace('/', '_')}_{prop}",
                "type": "field_required_added",
                "path": path,
                "method": method,
                "field": prop,
                "v1_value": "optional",
                "v2_value": "required",
                "details": f"Field '{prop}' is now required in request body of {method} {path}."
            })

        # Optional field added
        for prop in (set(props2.keys()) - set(props1.keys())) - req2:
            self.changes.append({
                "id": f"diff_req_prop_opt_add_{method}_{path.replace('/', '_')}_{prop}",
                "type": "optional_field_added",
                "path": path,
                "method": method,
                "field": prop,
                "v1_value": "NONE",
                "v2_value": f"optional({props2[prop].get('type', 'any')})",
                "details": f"Optional field '{prop}' added to request body of {method} {path}."
            })

        # Type change
        for prop in set(props1.keys()) & set(props2.keys()):
            t1 = props1[prop].get("type")
            t2 = props2[prop].get("type")
            if t1 and t2 and t1 != t2:
                self.changes.append({
                    "id": f"diff_req_prop_type_{method}_{path.replace('/', '_')}_{prop}",
                    "type": "field_type_changed",
                    "path": path,
                    "method": method,
                    "field": prop,
                    "v1_value": t1,
                    "v2_value": t2,
                    "details": f"Field '{prop}' type changed from '{t1}' to '{t2}' in request body of {method} {path}."
                })

    def _compare_responses(self, path: str, method: str, v1_res: Dict[str, Any], v2_res: Dict[str, Any]):
        v1_codes = set(v1_res.keys())
        v2_codes = set(v2_res.keys())

        for code in v1_codes - v2_codes:
            self.changes.append({
                "id": f"diff_res_code_rm_{method}_{path.replace('/', '_')}_{code}",
                "type": "response_removed",
                "path": path,
                "method": method,
                "status_code": code,
                "v1_value": f"HTTP {code}",
                "v2_value": "REMOVED",
                "details": f"HTTP response status {code} removed from {method} {path}."
            })

        for code in v2_codes - v1_codes:
            self.changes.append({
                "id": f"diff_res_code_add_{method}_{path.replace('/', '_')}_{code}",
                "type": "new_response_field",
                "path": path,
                "method": method,
                "status_code": code,
                "v1_value": "NONE",
                "v2_value": f"HTTP {code}",
                "details": f"New HTTP response status {code} added to {method} {path}."
            })

    def _compare_schemas(self):
        """Compare components.schemas globally."""
        v1_schemas = self.v1.get("components", {}).get("schemas", {}) or {}
        v2_schemas = self.v2.get("components", {}).get("schemas", {}) or {}

        v1_keys = set(v1_schemas.keys())
        v2_keys = set(v2_schemas.keys())

        for schema_name in v1_keys - v2_keys:
            self.changes.append({
                "id": f"diff_schema_rm_{schema_name}",
                "type": "schema_removed",
                "schema": schema_name,
                "v1_value": "EXISTS",
                "v2_value": "REMOVED",
                "details": f"Model/Schema '{schema_name}' removed from components."
            })

        for schema_name in v2_keys - v1_keys:
            self.changes.append({
                "id": f"diff_schema_add_{schema_name}",
                "type": "schema_added",
                "schema": schema_name,
                "v1_value": "NONE",
                "v2_value": "EXISTS",
                "details": f"New Model/Schema '{schema_name}' added in components."
            })

        for schema_name in v1_keys & v2_keys:
            s1 = v1_schemas[schema_name] or {}
            s2 = v2_schemas[schema_name] or {}
            self._compare_schema_definition(schema_name, s1, s2)

    def _compare_schema_definition(self, schema_name: str, s1: Dict[str, Any], s2: Dict[str, Any]):
        props1 = s1.get("properties", {}) or {}
        props2 = s2.get("properties", {}) or {}
        req1 = set(s1.get("required", []) or [])
        req2 = set(s2.get("required", []) or [])

        # Property removed
        for prop in set(props1.keys()) - set(props2.keys()):
            self.changes.append({
                "id": f"diff_model_prop_rm_{schema_name}_{prop}",
                "type": "field_removed",
                "schema": schema_name,
                "field": prop,
                "v1_value": props1[prop].get("type", "unknown"),
                "v2_value": "REMOVED",
                "details": f"Field '{prop}' removed from schema '{schema_name}'."
            })

        # Required field added
        for prop in req2 - req1:
            self.changes.append({
                "id": f"diff_model_prop_req_{schema_name}_{prop}",
                "type": "field_required_added",
                "schema": schema_name,
                "field": prop,
                "v1_value": "optional",
                "v2_value": "required",
                "details": f"Field '{prop}' in schema '{schema_name}' is now marked as required."
            })

        # Optional field added
        for prop in (set(props2.keys()) - set(props1.keys())) - req2:
            self.changes.append({
                "id": f"diff_model_prop_opt_{schema_name}_{prop}",
                "type": "optional_field_added",
                "schema": schema_name,
                "field": prop,
                "v1_value": "NONE",
                "v2_value": f"optional({props2[prop].get('type', 'any')})",
                "details": f"Optional field '{prop}' added to schema '{schema_name}'."
            })

        # Field type changed
        for prop in set(props1.keys()) & set(props2.keys()):
            t1 = props1[prop].get("type")
            t2 = props2[prop].get("type")
            f1 = props1[prop].get("format")
            f2 = props2[prop].get("format")
            if t1 and t2 and t1 != t2:
                self.changes.append({
                    "id": f"diff_model_prop_type_{schema_name}_{prop}",
                    "type": "field_type_changed",
                    "schema": schema_name,
                    "field": prop,
                    "v1_value": t1,
                    "v2_value": t2,
                    "details": f"Field '{prop}' in schema '{schema_name}' changed type from '{t1}' to '{t2}'."
                })
            elif f1 and f2 and f1 != f2:
                self.changes.append({
                    "id": f"diff_model_prop_format_{schema_name}_{prop}",
                    "type": "format_changed",
                    "schema": schema_name,
                    "field": prop,
                    "v1_value": f1,
                    "v2_value": f2,
                    "details": f"Field '{prop}' in schema '{schema_name}' changed format from '{f1}' to '{f2}'."
                })

            # Enum narrowing or mutation
            enum1 = props1[prop].get("enum")
            enum2 = props2[prop].get("enum")
            if enum1 and enum2 and set(enum1) != set(enum2):
                removed_vals = set(enum1) - set(enum2)
                if removed_vals:
                    self.changes.append({
                        "id": f"diff_model_enum_narrow_{schema_name}_{prop}",
                        "type": "enum_value_removed",
                        "schema": schema_name,
                        "field": prop,
                        "v1_value": json.dumps(enum1),
                        "v2_value": json.dumps(enum2),
                        "details": f"Enum values {list(removed_vals)} removed from '{schema_name}.{prop}'."
                    })

    def _compare_security(self):
        """Global security schemes diff."""
        v1_sec = self.v1.get("security", []) or []
        v2_sec = self.v2.get("security", []) or []

        if v1_sec != v2_sec and (len(v1_sec) > 0 or len(v2_sec) > 0):
            self.changes.append({
                "id": "diff_global_security",
                "type": "security_changed",
                "v1_value": json.dumps(v1_sec),
                "v2_value": json.dumps(v2_sec),
                "details": "Global API security requirements changed."
            })
