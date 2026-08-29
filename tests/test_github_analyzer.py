"""
Unit and Integration tests for GitHub OpenAPI Repository Analyzer.
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "antigravity_backend"))

from github_analyzer import GitHubAnalyzer
from main import app

client = TestClient(app)


def test_parse_github_url_formats():
    """Verify various GitHub URL format parsers."""
    analyzer = GitHubAnalyzer()

    # 1. Full HTTPS URL
    p1 = analyzer.parse_github_url("https://github.com/stripe/stripe-openapi")
    assert p1["owner"] == "stripe"
    assert p1["repo"] == "stripe-openapi"
    assert p1["branch"] == "main"

    # 2. Owner/repo format
    p2 = analyzer.parse_github_url("stripe/stripe-openapi")
    assert p2["owner"] == "stripe"
    assert p2["repo"] == "stripe-openapi"
    assert p2["branch"] == "main"

    # 3. Branch @ format
    p3 = analyzer.parse_github_url("aws/aws-sdk-go-v2@v1.2.0")
    assert p3["owner"] == "aws"
    assert p3["repo"] == "aws-sdk-go-v2"
    assert p3["branch"] == "v1.2.0"

    # 4. Blob URL format
    p4 = analyzer.parse_github_url("https://github.com/stripe/stripe-openapi/blob/master")
    assert p4["owner"] == "stripe"
    assert p4["repo"] == "stripe-openapi"
    assert p4["branch"] == "master"


def test_analyze_github_repo_sample_fallback():
    """Verify analyzer returns specs and comparison for sample repos."""
    analyzer = GitHubAnalyzer()
    res = analyzer.analyze_github_repo("stripe/stripe-openapi")

    assert res["success"] is True
    assert "repo" in res
    assert res["repo"]["owner"] == "stripe"
    assert len(res["specs_found"]) >= 1
    assert "content" in res["specs_found"][0]


def test_analyze_github_repo_invalid_url():
    """Verify analyzer gracefully fails on invalid format."""
    analyzer = GitHubAnalyzer()
    res = analyzer.analyze_github_repo("invalid_no_slash")
    assert res["success"] is False
    assert "error" in res


def test_api_analyze_github_repo_endpoint():
    """Verify POST /api/analyze-github-repo FastAPI endpoint."""
    response = client.post("/api/analyze-github-repo", json={
        "github_url": "stripe/stripe-openapi",
        "compare_versions": True
    })

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "repo" in data
    assert data["repo"]["owner"] == "stripe"
    assert len(data["specs_analysis"]) >= 1

    # Check metrics
    assert "metrics" in data
    assert data["metrics"]["specs_analyzed"] >= 1
