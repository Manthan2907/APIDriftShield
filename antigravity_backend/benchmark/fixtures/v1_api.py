"""
v1_api.py — V1 Petstore API (baseline)
Represents the original API that clients are built against.

Run with: python v1_api.py
Listens on: http://localhost:8000
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

app = FastAPI(title="Petstore V1", version="1.0.0")


class Pet(BaseModel):
    id: Optional[int] = None
    name: str
    photoUrls: List[str]
    status: Optional[str] = None  # Optional in V1


@app.get("/pet/{petId}")
def get_pet(petId: int):
    """V1: GET /pet/{petId} — returns pet with photoUrls"""
    return {
        "id": petId,
        "name": "Fluffy",
        "photoUrls": ["http://example.com/photo1.jpg"],
        "status": "available"
    }


@app.delete("/pet/{petId}")
def delete_pet(petId: int):
    """V1: DELETE /pet/{petId} — exists and works"""
    return {"success": True, "deleted_id": petId}


@app.post("/pet", status_code=200)
def create_pet(pet: Pet):
    """V1: POST /pet — status is optional"""
    return {"id": 1, "name": pet.name, "photoUrls": pet.photoUrls, "status": pet.status}


@app.put("/pet", status_code=200)
def update_pet(pet: Optional[Pet] = None):
    """V1: PUT /pet — body is optional"""
    return {"id": 1, "updated": True}


@app.get("/pet/findByStatus")
def find_by_status(status: Optional[str] = None):  # Optional in V1
    """V1: GET /pet/findByStatus — status is optional"""
    return [{"id": 1, "name": "Fluffy", "status": status or "available"}]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
