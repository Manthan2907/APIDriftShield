"""
v2_api.py — V2 Petstore API (mutated, has breaking changes)
Simulates the new version with 2 deliberate breaking changes.

Run with: python v2_api.py
Listens on: http://localhost:8001

Breaking changes vs V1:
  1. DELETE /pet/{petId} — REMOVED (clients get 404)
  2. status field in POST /pet — now REQUIRED (old requests get 422)
  3. PUT /pet — request body now required (old empty calls get 422)
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

app = FastAPI(title="Petstore V2", version="2.0.0")


class Pet(BaseModel):
    id: Optional[int] = None
    name: str
    photoUrls: List[str]
    status: str  # ⚠️  NOW REQUIRED — Breaking change #2


@app.get("/pet/{petId}")
def get_pet(petId: int):
    """V2: GET /pet/{petId} — still works (safe change)"""
    return {
        "id": petId,
        "name": "Fluffy",
        "photoUrls": ["http://example.com/photo1.jpg"],
        "status": "available"
        # photoUrls still present (not removed here)
    }


# ⚠️  DELETE /pet/{petId} intentionally REMOVED — Breaking change #1
# Old clients calling DELETE /pet/{petId} will receive 404 Not Found


@app.post("/pet", status_code=200)
def create_pet(pet: Pet):
    """V2: POST /pet — status is now required"""
    return {"id": 1, "name": pet.name, "status": pet.status}


@app.put("/pet", status_code=200)
def update_pet(pet: Pet):  # ⚠️ Body now required — Breaking change #3
    """V2: PUT /pet — request body is now required"""
    return {"id": pet.id or 1, "updated": True}


@app.get("/pet/findByStatus")
def find_by_status(status: str):  # ⚠️  Now REQUIRED — Breaking change #4
    """V2: GET /pet/findByStatus — status is now required"""
    return [{"id": 1, "name": "Fluffy", "status": status}]


# ✅ New endpoint added (safe change — doesn't break existing clients)
@app.post("/pet/bulk")
def create_pets_bulk(pets: List[Pet]):
    """V2: New bulk create endpoint"""
    return {"created": len(pets)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
