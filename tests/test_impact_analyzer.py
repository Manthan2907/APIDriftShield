"""
Unit tests for impact_analyzer.py and 13-category classification matrix.
"""

import pytest
import os
import sys

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "antigravity_backend"))

from impact_analyzer import analyze_drift, normalize_category


def test_endpoint_removed_classified_as_breaking():
    """Test 1: Endpoint removed -> classified as breaking."""
    v1_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Test API", "version": "1.0"},
        "paths": {
            "/users/{id}": {
                "delete": {
                    "summary": "Delete user",
                    "responses": {"204": {"description": "Deleted"}}
                }
            }
        }
    }
    v2_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Test API", "version": "2.0"},
        "paths": {}
    }

    result = analyze_drift(v1_spec, v2_spec)

    assert result["total_changes"] >= 1
    assert len(result["breaking"]) >= 1
    
    breaking_types = [c["type"] for c in result["breaking"]]
    assert "endpoint_removed" in breaking_types
    assert result["breaking"][0]["severity"] == "breaking"
    assert result["breaking"][0]["confidence"] >= 0.90
    assert "DELETE /users/{id}" in result["breaking"][0]["evidence"] or "Endpoint" in result["breaking"][0]["evidence"]


def test_optional_field_added_classified_as_safe():
    """Test 2: Optional field added -> classified as safe."""
    v1_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Petstore", "version": "1.0"},
        "paths": {
            "/pets": {
                "post": {
                    "summary": "Create Pet",
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"}
                                    },
                                    "required": ["name"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }
    v2_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Petstore", "version": "2.0"},
        "paths": {
            "/pets": {
                "post": {
                    "summary": "Create Pet",
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "tag": {"type": "string"}
                                    },
                                    "required": ["name"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }

    result = analyze_drift(v1_spec, v2_spec)

    # Safe additions
    safe_types = [c["type"] for c in result["safe"]]
    assert len(result["breaking"]) == 0
    assert len(result["safe"]) >= 1
    assert "optional_field_added" in safe_types
    assert result["safe"][0]["severity"] == "safe"


def test_ambiguous_schema_classified_as_uncertain():
    """Test 3: Ambiguous schema -> classified as uncertain (honest abstention)."""
    norm = normalize_category("ambiguous_ref_mutation", "uncertain")
    assert norm in ["ambiguous_schema", "insufficient_evidence"]
    
    # Test normalization fallback
    norm_insufficient = normalize_category("unknown_behavior", "uncertain")
    assert norm_insufficient in ["ambiguous_schema", "insufficient_evidence"]


def test_required_field_added_classified_as_breaking():
    """Test required field added to request body -> classified as breaking."""
    v1_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Account API", "version": "1.0"},
        "paths": {
            "/accounts": {
                "post": {
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {"name": {"type": "string"}}
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }
    v2_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Account API", "version": "2.0"},
        "paths": {
            "/accounts": {
                "post": {
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "organization_id": {"type": "string"}
                                    },
                                    "required": ["organization_id"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }

    result = analyze_drift(v1_spec, v2_spec)
    assert len(result["breaking"]) >= 1
    breaking_types = [c["type"] for c in result["breaking"]]
    assert "required_field_added" in breaking_types
