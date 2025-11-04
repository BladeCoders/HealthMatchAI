import os
import json
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv
from typing import List
import logging

# NEW
# Use absolute import from the 'app' package
from app.models import Provider, SpecialtyRecommendation

# --- Configuration ---

# Load environment variables (GEMINI_API_KEY)
load_dotenv()

# Configure the Gemini API
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    logging.error("GEMINI_API_KEY not found. Please set it in your .env file.")
    exit()

# Set up the generative model
generation_config = {
    "temperature": 0.2,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
    # CRITICAL: This forces Gemini to output in JSON format.
    "response_mime_type": "application/json", 
}

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
)

# --- Mock Data Service (WBS 2.3) ---

# Define the path to the mock JSON data
DATA_FILE_PATH = Path(__file__).parent / "data" / "mock_providers.json"

def get_providers_by_specialty(specialty: str) -> List[Provider]:
    """
    Filters and returns providers from the mock JSON based on specialty.
    """
    try:
        with open(DATA_FILE_PATH, 'r') as f:
            all_providers = json.load(f)
        
        # Filter the list based on the specialty (case-insensitive)
        filtered_list = [
            Provider(**provider) for provider in all_providers 
            if provider["specialty"].lower() == specialty.lower()
        ]
        return filtered_list
    except FileNotFoundError:
        logging.error(f"Mock data file not found at: {DATA_FILE_PATH}")
        return []
    except Exception as e:
        logging.error(f"Error reading or parsing mock data: {e}")
        return []


# --- GenAI Service (WBS 2.2) ---

def get_specialty_recommendation(symptoms: str) -> SpecialtyRecommendation:
    """
    Calls the Gemini Pro API to get specialty recommendations based on symptoms.
    """
    
    # This is the prompt. It's engineered to be clear and to reference the JSON schema.
    # Pydantic's .model_json_schema() creates a schema definition Gemini can understand.
    prompt = f"""
    You are an expert medical triage assistant. Your role is to analyze a patient's symptoms
    and recommend the correct medical specialties.

    You must only respond in the following JSON format:
    {SpecialtyRecommendation.model_json_schema()}

    Do not include any other text, markdown, or explanations outside of the JSON structure.

    Patient Symptoms:
    "{symptoms}"
    """
    
    try:
        response = model.generate_content(prompt)
        
        # Parse the JSON text response from Gemini into our Pydantic model
        # This validates that Gemini followed the instructions
        response_data = json.loads(response.text)
        recommendation = SpecialtyRecommendation(**response_data)
        
        return recommendation
        
    except json.JSONDecodeError as e:
        logging.error(f"Gemini output was not valid JSON: {e}")
        logging.error(f"Gemini raw response: {response.text}")
        # Fallback in case of invalid JSON
        return SpecialtyRecommendation(
            specialties=["General Practitioner"],
            reasoning="Could not parse AI response. Please consult a General Practitioner."
        )
    except Exception as e:
        logging.error(f"An error occurred calling Gemini API: {e}")
        # General fallback
        return SpecialtyRecommendation(
            specialties=["General Practitioner"],
            reasoning=f"An error occurred: {e}"
        )