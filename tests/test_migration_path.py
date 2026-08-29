"""
Unit & Integration tests for Migration Path Generator.
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "antigravity_backend"))

from migration_generator import generate_migration_paths, generate_single_migration
from main import app

client = TestClient(app)


def test_empty_breaking_changes():
    """Verify response with 0 breaking changes."""
    res = generate_migration_paths([])
    assert res["success"] is True
    assert len(res["migrations"]) == 0
    assert res["total_effort_minutes"] == 0


def test_endpoint_removed_migration():
    """Verify migration path synthesis for endpoint removal."""
    change = {
        "id": "c_del_1",
        "type": "endpoint_removed",
        "path": "/users/{id}",
        "method": "DELETE",
        "severity": "breaking"
    }
    v2_spec = {
        "paths": {
            "/users/{id}/archive": {"put": {}}
        }
    }

    mig = generate_single_migration(change, {}, v2_spec)
    assert mig["change_id"] == "c_del_1"
    assert mig["breaking_change_type"] == "Endpoint Removed"
    assert "delete_users" in mig["old_code"]
    assert "archive" in mig["new_code"]
    assert len(mig["steps"]) >= 3
    assert "regex_find_replace" in mig
    assert "find" in mig["regex_find_replace"]


def test_required_field_migration():
    """Verify migration path synthesis for mandatory field addition."""
    change = {
        "id": "c_req_2",
        "type": "required_field_added",
        "path": "/accounts",
        "field": "org_id",
        "schema": "Account",
        "severity": "breaking"
    }

    mig = generate_single_migration(change, {}, {})
    assert mig["breaking_change_type"] == "Required Field Added"
    assert "org_id" in mig["new_code"]
    assert mig["time_minutes"] > 0
    assert "field_info" in mig


def test_type_changed_migration():
    """Verify migration path synthesis for type changes."""
    change = {
        "id": "c_typ_3",
        "type": "type_changed",
        "path": "/payments",
        "field": "amount",
        "v1_value": "string",
        "v2_value": "integer",
        "severity": "breaking"
    }

    mig = generate_single_migration(change, {}, {})
    assert mig["breaking_change_type"] == "Type Changed"
    assert "int(" in mig["new_code"]
    assert mig["time_minutes"] > 0
    assert "conversion_snippet" in mig


def test_api_generate_migration_path_endpoint():
    """Verify POST /api/generate-migration-path endpoint."""
    payload = {
        "breaking_changes": [
            {
                "id": "c1",
                "type": "endpoint_removed",
                "path": "/pets/{id}",
                "method": "DELETE",
                "severity": "breaking"
            },
            {
                "id": "c2",
                "type": "required_field_added",
                "path": "/pets",
                "field": "status",
                "schema": "Pet",
                "severity": "breaking"
            }
        ]
    }

    response = client.post("/api/generate-migration-path", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["migrations"]) == 2
    assert data["total_effort_minutes"] >= 20
    assert data["total_effort_hours"] >= 0.3
    assert "estimated_completion_date" in data
