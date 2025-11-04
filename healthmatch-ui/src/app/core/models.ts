// This interface matches the Pydantic model in FastAPI
export interface SpecialtyRecommendation {
  specialties: string[];
  reasoning: string;
}

// This interface matches the Provider model
export interface Provider {
  id: number;
  name: string;
  specialty: string;
  location: string;
  availability: string[]; // List of ISO date strings
}
