from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Gemini Outfit Recommendation Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize model
model = genai.GenerativeModel('gemini-pro')

class OutfitRequest(BaseModel):
    prompt: str
    occasion: Optional[str] = None
    weather: Optional[str] = None
    style_preference: Optional[str] = None
    color_preference: Optional[str] = None
    available_items: Optional[List[dict]] = None

class OutfitRecommendation(BaseModel):
    outfit_description: str
    items: List[dict]
    reasoning: str
    style_tips: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

def build_recommendation_prompt(request: OutfitRequest) -> str:
    """Build a detailed prompt for Gemini based on user request."""
    prompt_parts = [
        "You are an expert fashion stylist and outfit recommender.",
        f"\nUser Request: {request.prompt}"
    ]
    
    if request.occasion:
        prompt_parts.append(f"\nOccasion: {request.occasion}")
    
    if request.weather:
        prompt_parts.append(f"\nWeather: {request.weather}")
    
    if request.style_preference:
        prompt_parts.append(f"\nStyle Preference: {request.style_preference}")
    
    if request.color_preference:
        prompt_parts.append(f"\nColor Preference: {request.color_preference}")
    
    if request.available_items:
        prompt_parts.append(f"\nAvailable Items in Wardrobe: {len(request.available_items)} items")
        items_desc = "\n".join([
            f"- {item.get('category', 'Item')}: {item.get('color', 'unknown color')}, "
            f"{item.get('style', 'unknown style')}"
            for item in request.available_items[:20]  # Limit to avoid token overflow
        ])
        prompt_parts.append(f"\n{items_desc}")
    
    prompt_parts.append(
        "\n\nPlease suggest a complete outfit with the following structure:"
        "\n1. **Outfit Description**: A brief overview of the complete look"
        "\n2. **Items**: List each clothing item (top, bottom, shoes, accessories)"
        "\n3. **Reasoning**: Why this outfit works for the given context"
        "\n4. **Style Tips**: Additional advice for styling this outfit"
        "\n\nProvide a detailed, fashionable, and practical recommendation."
    )
    
    return "".join(prompt_parts)

@app.get("/")
async def root():
    return {
        "service": "Gemini Outfit Recommendation Service",
        "status": "active" if GEMINI_API_KEY else "API key not configured"
    }

@app.post("/recommend", response_model=dict)
async def recommend_outfit(request: OutfitRequest):
    """Generate outfit recommendations using Gemini AI."""
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Gemini API key not configured"
            )
        
        # Build prompt
        prompt = build_recommendation_prompt(request)
        logger.info(f"Generating recommendation for: {request.prompt}")
        
        # Generate response
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate recommendation"
            )
        
        # Parse response
        recommendation_text = response.text
        
        # Extract structured data (simplified parsing)
        # In production, you might want more sophisticated parsing
        sections = {
            "outfit_description": "",
            "items": [],
            "reasoning": "",
            "style_tips": ""
        }
        
        # Simple section extraction
        current_section = None
        for line in recommendation_text.split('\n'):
            line = line.strip()
            if '**Outfit Description' in line or 'Outfit Description:' in line:
                current_section = 'outfit_description'
            elif '**Items' in line or 'Items:' in line:
                current_section = 'items'
            elif '**Reasoning' in line or 'Reasoning:' in line:
                current_section = 'reasoning'
            elif '**Style Tips' in line or 'Style Tips:' in line:
                current_section = 'style_tips'
            elif line and current_section:
                if current_section == 'items' and (line.startswith('-') or line.startswith('•')):
                    item_text = line.lstrip('-•').strip()
                    sections['items'].append({"description": item_text})
                elif current_section != 'items':
                    sections[current_section] += line + " "
        
        return {
            "success": True,
            "recommendation": {
                "outfit_description": sections['outfit_description'].strip(),
                "items": sections['items'] if sections['items'] else [
                    {"description": "See full recommendation below"}
                ],
                "reasoning": sections['reasoning'].strip(),
                "style_tips": sections['style_tips'].strip()
            },
            "full_text": recommendation_text
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=dict)
async def chat(request: ChatRequest):
    """General fashion advice chat interface."""
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Gemini API key not configured"
            )
        
        # Build chat prompt
        system_context = (
            "You are a helpful fashion assistant. Provide friendly, "
            "practical fashion advice and outfit suggestions."
        )
        
        full_prompt = f"{system_context}\n\n"
        if request.context:
            full_prompt += f"Context: {request.context}\n\n"
        full_prompt += f"User: {request.message}\n\nAssistant:"
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        return {
            "success": True,
            "response": response.text
        }
        
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-outfit", response_model=dict)
async def analyze_outfit(items: List[dict]):
    """Analyze compatibility of selected outfit items."""
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Gemini API key not configured"
            )
        
        items_desc = "\n".join([
            f"- {item.get('category', 'Item')}: {item.get('color', 'unknown')}, "
            f"{item.get('style', 'unknown')}"
            for item in items
        ])
        
        prompt = (
            f"As a fashion expert, analyze the following outfit combination:\n\n"
            f"{items_desc}\n\n"
            f"Provide:\n"
            f"1. Compatibility score (1-10)\n"
            f"2. What works well\n"
            f"3. Potential improvements\n"
            f"4. Overall assessment"
        )
        
        response = model.generate_content(prompt)
        
        return {
            "success": True,
            "analysis": response.text
        }
        
    except Exception as e:
        logger.error(f"Error analyzing outfit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
