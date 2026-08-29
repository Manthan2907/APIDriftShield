"""
Baseline B1: Deterministic diff-based classifier (openapi-diff / deepdiff).
Uses structural comparison without any LLM involvement.

This is the "established standard" we measure against.
"""
import json
import sys
import subprocess
import tempfile
import os
from pathlib import Path


def _structural_diff(v1_spec: dict, v2_spec: dict) -> dict:
    """Perform structural diff between two OpenAPI specs.
    
    Uses deepdiff for small specs (<300KB serialized); falls back to manual
    diff for large specs (e.g. Stripe, GitHub) to avoid performance issues.
    """
    import json as _json
    spec_size = len(_json.dumps(v1_spec)) + len(_json.dumps(v2_spec))
    SIZE_LIMIT = 600_000  # 300KB each side
    
    if spec_size < SIZE_LIMIT:
        try:
            from deepdiff import DeepDiff
            diff = DeepDiff(v1_spec, v2_spec, ignore_order=True, 
                           exclude_regex_paths=[r"\['description'\]", r"\['example'\]", r"\['summary'\]"])
            return {
                "removed": list(diff.get("dictionary_item_removed", {}).keys()),
                "added": list(diff.get("dictionary_item_added", {}).keys()),
                "changed": list(diff.get("values_changed", {}).keys()),
                "type_changes": list(diff.get("type_changes", {}).keys()),
                "iterable_changes": list(diff.get("iterable_item_removed", {}).keys()),
            }
        except ImportError:
            pass
    
    # Fallback for large specs or missing deepdiff
    return _manual_structural_diff(v1_spec, v2_spec)


def _manual_structural_diff(v1: dict, v2: dict, max_depth: int = 4) -> dict:
    """Manual structural diff when deepdiff is not available or spec is too large."""
    removed = []
    added = []
    changed = []

    def diff_dicts(d1, d2, path="", depth=0):
        if depth > max_depth:
            return
        for key in d1:
            full_path = f"{path}.{key}" if path else key
            if key not in d2:
                removed.append(full_path)
            elif isinstance(d1[key], dict) and isinstance(d2[key], dict):
                diff_dicts(d1[key], d2[key], full_path, depth + 1)
            elif d1[key] != d2[key]:
                # Skip pure description/example/summary changes
                if key not in ("description", "example", "examples", "summary", "x-stoplight"):
                    changed.append(full_path)
        for key in d2:
            full_path = f"{path}.{key}" if path else key
            if key not in d1:
                added.append(full_path)

    diff_dicts(v1, v2)
    return {"removed": removed, "added": added, "changed": changed, "type_changes": [], "iterable_changes": []}


def classify_from_diff(diff_result: dict, mutation_type: str = "") -> tuple[str, str]:
    """Apply deterministic rules to classify a diff as breaking/safe/uncertain.
    
    Returns: (classification, reasoning)
    """
    removed = [r.lower() for r in diff_result.get("removed", [])]
    added = diff_result.get("added", [])
    changed = [c.lower() for c in diff_result.get("changed", [])]
    type_changes = diff_result.get("type_changes", [])

    breaking_signals = []
    safe_signals = []

    # Check for breaking patterns
    for path in removed:
        if any(seg in path for seg in ["paths.", "/get", "/post", "/put", "/delete", "/patch"]):
            breaking_signals.append(f"Endpoint/method removed: {path}")
        elif "required" in path:
            breaking_signals.append(f"Required field structure changed: {path}")
        elif "properties" in path:
            breaking_signals.append(f"Schema property removed: {path}")
        elif "securityschemes" in path or "security" in path:
            breaking_signals.append(f"Security definition removed: {path}")
        elif "enum" in path:
            breaking_signals.append(f"Enum value removed: {path}")

    for path in type_changes:
        breaking_signals.append(f"Type changed: {path}")

    # Check for safe patterns
    for path in added:
        path_l = path.lower()
        if "paths." in path_l:
            # New endpoint added
            safe_signals.append(f"New endpoint/method added: {path}")
        elif "properties" in path_l:
            safe_signals.append(f"New property added (check if required): {path}")

    for path in changed:
        if "description" in path or "summary" in path or "example" in path:
            safe_signals.append(f"Documentation-only change: {path}")

    # Classify
    if breaking_signals:
        return "breaking", f"Structural breaking signals detected: {'; '.join(breaking_signals[:3])}"
    elif safe_signals and not breaking_signals:
        return "safe", f"Additive/safe signals only: {'; '.join(safe_signals[:3])}"
    elif not removed and not type_changes and changed:
        # Only values changed
        change_paths = " ".join(changed)
        if any(kw in change_paths for kw in ["description", "summary", "example"]):
            return "safe", "Only documentation changed"
        return "uncertain", f"Value changes detected but unclear impact: {changed[:2]}"
    elif not removed and not added and not changed and not type_changes:
        return "safe", "No structural differences detected"
    else:
        return "uncertain", f"Ambiguous diff — removed={len(removed)}, added={len(added)}, changed={len(changed)}"


def run_baseline_b1(v1_spec: dict, v2_spec: dict, mutation_type: str = "", description: str = "") -> dict:
    """Baseline 1: Deterministic structural diff classifier.
    
    Returns dict with 'classification', 'reasoning', and 'diff_summary'.
    """
    diff = _structural_diff(v1_spec, v2_spec)
    classification, reasoning = classify_from_diff(diff, mutation_type)

    return {
        "classification": classification,
        "reasoning": reasoning,
        "diff_summary": {
            "removed_count": len(diff.get("removed", [])),
            "added_count": len(diff.get("added", [])),
            "changed_count": len(diff.get("changed", [])),
            "type_changes_count": len(diff.get("type_changes", [])),
            "top_removed": diff.get("removed", [])[:5],
            "top_added": diff.get("added", [])[:5]
        }
    }


def run_baseline_b1_from_paths(v1_spec_path: str, v2_spec_path: str) -> dict:
    """Load specs from disk and run B1 baseline."""
    with open(v1_spec_path) as f:
        if v1_spec_path.endswith('.yaml') or v1_spec_path.endswith('.yml'):
            import yaml
            v1 = yaml.safe_load(f)
        else:
            v1 = json.load(f)
    with open(v2_spec_path) as f:
        if v2_spec_path.endswith('.yaml') or v2_spec_path.endswith('.yml'):
            import yaml
            v2 = yaml.safe_load(f)
        else:
            v2 = json.load(f)
    return run_baseline_b1(v1, v2)


if __name__ == '__main__':
    # Smoke test
    v1 = {
        "openapi": "3.0.0",
        "info": {"title": "API", "version": "1.0"},
        "paths": {
            "/pet": {"get": {}, "post": {}},
            "/pet/{petId}": {"get": {}, "delete": {}}
        }
    }
    v2 = {
        "openapi": "3.0.0",
        "info": {"title": "API", "version": "2.0"},
        "paths": {
            "/pet": {"get": {}, "post": {}},
            "/pet/{petId}": {"get": {}}  # DELETE removed
        }
    }
    result = run_baseline_b1(v1, v2, "endpoint_removed", "DELETE /pet/{petId} removed")
    print(json.dumps(result, indent=2))
