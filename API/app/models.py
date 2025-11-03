from pydantic import BaseModel, Field
from typing import List

# --- Provider Models ---

class Provider(BaseModel):
    """Defines the structure for a single healthcare provider."""
    id: int
    name: str
    specialty: str
    location: str
    availability: List[str]

# --- Symptom Check Models ---

class SymptomRequest(BaseModel):
    """The request body for the /symptom-check endpoint."""
    symptoms: str = Field(..., example="I have a sharp pain in my left knee when I walk up stairs.")

class SpecialtyRecommendation(BaseModel):
    """
    The Pydantic model Gemini Pro will be forced to follow.
    This is also the response model for our /symptom-check endpoint.
    """
    specialties: List[str] = Field(..., description="List of 1-3 recommended medical specialties.")
    reasoning: str = Field(..., description="A brief (1-2 sentence) explanation for the recommendation.")