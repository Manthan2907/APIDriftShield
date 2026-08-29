"""
Integration tests for the API DriftShield FastAPI application.
Tests all endpoints:
- POST /api/analyze-api-drift
- GET  /api/health
- GET  /health
- GET  /api/benchmark
- POST /api/generate-tests
- POST /api/verify
- GET  /api/export
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "antigravity_backend"))

from main import app

client = TestClient(app)


def test_health_endpoints():
    """Verify health check responses."""
    resp1 = client.get("/api/health")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["status"] == "healthy"
    assert "timestamp" in data1

    resp2 = client.get("/health")
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "healthy"


def test_analyze_api_drift_breaking_case():
    """Verify /api/analyze-api-drift with breaking endpoint removal."""
    v1_spec = {
        "openapi": "3.0.0",
        "info": {"title": "User Service", "version": "1.0.0"},
        "paths": {
            "/users/{id}": {
                "delete": {
                    "summary": "Delete user",
                    "responses": {"204": {"description": "User deleted"}}
                }
            }
        }
    }
    v2_spec = {
        "openapi": "3.0.0",
        "info": {"title": "User Service", "version": "2.0.0"},
        "paths": {}
    }

    payload = {
        "v1_spec": v1_spec,
        "v2_spec": v2_spec,
        "v1_name": "v1.json",
        "v2_name": "v2.json"
    }

    response = client.post("/api/analyze-api-drift", json=payload)
    assert response.status_code == 200
    body = response.json()

    # Required Submission Structure Verification
    assert body["success"] is True
    assert body["status_code"] == 200
    assert "data" in body
    assert "breaking_changes" in body["data"]
    assert "safe_changes" in body["data"]
    assert "uncertain_changes" in body["data"]
    
    assert len(body["data"]["breaking_changes"]) >= 1
    breaking_item = body["data"]["breaking_changes"][0]
    assert breaking_item["severity"] == "breaking"
    assert "confidence" in breaking_item
    assert "evidence" in breaking_item

    # Metrics Verification
    assert "metrics" in body
    assert body["metrics"]["f1_score"] == 0.965
    assert body["metrics"]["accuracy"] == 0.976
    assert body["metrics"]["precision"] == 0.962
    assert body["metrics"]["recall"] == 0.962
    assert body["metrics"]["unsupported_claim_rate"] == 0.0
    assert body["metrics"]["processing_time_ms"] >= 0
    assert body["error"] is None


def test_analyze_api_drift_safe_case():
    """Verify /api/analyze-api-drift with safe optional field addition."""
    v1_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Petstore", "version": "1.0.0"},
        "paths": {
            "/pets": {
                "get": {
                    "summary": "List pets",
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }
    v2_spec = {
        "openapi": "3.0.0",
        "info": {"title": "Petstore", "version": "2.0.0"},
        "paths": {
            "/pets": {
                "get": {
                    "summary": "List pets",
                    "parameters": [
                        {"name": "limit", "in": "query", "required": False, "schema": {"type": "integer"}}
                    ],
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }

    payload = {
        "v1_spec": v1_spec,
        "v2_spec": v2_spec
    }

    response = client.post("/api/analyze-api-drift", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert len(body["data"]["breaking_changes"]) == 0
    assert len(body["data"]["safe_changes"]) >= 1


def test_benchmark_endpoint():
    """Verify /api/benchmark returns benchmark metrics."""
    response = client.get("/api/benchmark")
    assert response.status_code == 200
    data = response.json()
    assert "baselines" in data
    assert "agent" in data
    assert data["total_cases"] == 41


def test_generate_tests_endpoint():
    """Verify /api/generate-tests synthesizes executable HTTP probes."""
    changes = [
        {
            "id": "c1",
            "type": "endpoint_removed",
            "path": "/users",
            "method": "GET",
            "severity": "breaking"
        },
        {
            "id": "c2",
            "type": "required_field_added",
            "path": "/accounts",
            "method": "POST",
            "field": "org_id",
            "severity": "breaking"
        }
    ]

    response = client.post("/api/generate-tests", json={"changes": changes})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 2
    assert len(data["tests"]) >= 2
    assert data["tests"][0]["expected_status"] == 404
    assert data["tests"][1]["expected_status"] == 422


def test_verify_endpoint():
    """Verify /api/verify evidence gating."""
    changes = [
        {
            "id": "c1",
            "type": "endpoint_removed",
            "path": "/users",
            "severity": "breaking",
            "evidence": "Endpoint DELETE /users missing in v2"
        },
        {
            "id": "c2",
            "type": "optional_field_added",
            "path": "/pets",
            "severity": "safe",
            "evidence": "Optional field added"
        }
    ]

    response = client.post("/api/verify", json={"changes": changes, "test_results": []})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["unsupported_count"] == 0
    assert len(data["verified"]) >= 2


def test_export_endpoint():
    """Verify /api/export generates reports."""
    resp_gh = client.get("/api/export?format=github")
    assert resp_gh.status_code == 200
    assert "DriftShield" in resp_gh.text

    resp_slack = client.get("/api/export?format=slack")
    assert resp_slack.status_code == 200
    assert "DriftShield" in resp_slack.text

    resp_csv = client.get("/api/export?format=csv")
    assert resp_csv.status_code == 200
    assert "ID,Type,Path" in resp_csv.text
