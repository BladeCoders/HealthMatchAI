from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.models import SymptomRequest, SpecialtyRecommendation, Provider
from app.services import get_specialty_recommendation, get_providers_by_specialty

# Initialize the FastAPI app
app = FastAPI(
    title="HealthMatch AI API",
    description="API for symptom-based provider search (CODEVibe 2025 MVP)",
    version="1.0.0"
)

# --- CORS Middleware ---
# This is crucial to allow your Angular frontend to communicate with this backend.
# We'll allow all origins for the hackathon.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- API Endpoints ---

@app.get("/", tags=["Health"])
def read_root():
    """A simple health check endpoint."""
    return {"status": "ok", "message": "Welcome to HealthMatch AI API"}


@app.post("/symptom-check", 
          response_model=SpecialtyRecommendation, 
          tags=["Symptom Checker"])
async def check_symptoms(request: SymptomRequest):
    """
    Receives patient symptoms and returns AI-powered specialty recommendations.
    """
    try:
        recommendation = get_specialty_recommendation(request.symptoms)
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/providers/{specialty}", 
         response_model=List[Provider], 
         tags=["Providers"])
async def get_providers(specialty: str):
    """
    Retrieves a list of mock providers based on the specified specialty.
    """
    providers = get_providers_by_specialty(specialty)
    if not providers:
        raise HTTPException(
            status_code=404, 
            detail=f"No providers found for specialty: {specialty}"
        )
    return providers