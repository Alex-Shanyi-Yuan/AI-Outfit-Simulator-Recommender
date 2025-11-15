from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from sklearn.neighbors import NearestNeighbors
import numpy as np
import io
import os
import json
import pickle
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CLIP Similarity Search Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "openai/clip-vit-base-patch32")
VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "./data/embeddings")
METADATA_PATH = os.getenv("METADATA_PATH", "./data/metadata.json")

# Initialize CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Loading CLIP model: {MODEL_NAME} on {device}")
model = CLIPModel.from_pretrained(MODEL_NAME).to(device)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)

# Initialize vector storage using sklearn
EMBEDDING_DIM = 512
embeddings_array = None
nearest_neighbors = None
metadata = []

def load_or_create_index():
    global embeddings_array, nearest_neighbors, metadata
    os.makedirs(os.path.dirname(VECTOR_DB_PATH) or "./data", exist_ok=True)
    
    if os.path.exists(f"{VECTOR_DB_PATH}.pkl"):
        logger.info("Loading existing embeddings")
        with open(f"{VECTOR_DB_PATH}.pkl", 'rb') as f:
            embeddings_array = pickle.load(f)
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, 'r') as f:
                metadata = json.load(f)
        # Rebuild nearest neighbors index
        if len(embeddings_array) > 0:
            nearest_neighbors = NearestNeighbors(n_neighbors=min(10, len(embeddings_array)), metric='cosine')
            nearest_neighbors.fit(embeddings_array)
    else:
        logger.info("Creating new embeddings storage")
        embeddings_array = np.array([]).reshape(0, EMBEDDING_DIM)
        metadata = []
        save_index()

def save_index():
    with open(f"{VECTOR_DB_PATH}.pkl", 'wb') as f:
        pickle.dump(embeddings_array, f)
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f)

load_or_create_index()

class ItemMetadata(BaseModel):
    item_id: str
    category: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None
    description: Optional[str] = None

class SimilarityResult(BaseModel):
    item_id: str
    similarity_score: float
    metadata: dict

class SearchRequest(BaseModel):
    query_text: Optional[str] = None
    top_k: int = 5

def get_image_embedding(image: Image.Image) -> np.ndarray:
    """Generate CLIP embedding for an image."""
    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        image_features = model.get_image_features(**inputs)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    return image_features.cpu().numpy()[0]

def get_text_embedding(text: str) -> np.ndarray:
    """Generate CLIP embedding for text."""
    inputs = processor(text=[text], return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        text_features = model.get_text_features(**inputs)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    return text_features.cpu().numpy()[0]

@app.get("/")
async def root():
    return {
        "service": "CLIP Similarity Search Service",
        "model": MODEL_NAME,
        "total_items": len(metadata),
        "device": device
    }

@app.post("/upload", response_model=dict)
async def upload_item(
    file: UploadFile = File(...),
    item_id: Optional[str] = None,
    category: Optional[str] = None,
    color: Optional[str] = None,
    style: Optional[str] = None,
    description: Optional[str] = None
):
    """Upload a clothing item and generate its embedding."""
    global embeddings_array, nearest_neighbors
    try:
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Generate embedding
        embedding = get_image_embedding(image)
        
        # Add to embeddings array
        embeddings_array = np.vstack([embeddings_array, embedding.reshape(1, -1)])
        
        # Store metadata
        if item_id is None:
            item_id = f"item_{len(metadata)}"
        
        item_metadata = {
            "item_id": item_id,
            "category": category,
            "color": color,
            "style": style,
            "description": description,
            "filename": file.filename
        }
        metadata.append(item_metadata)
        
        # Rebuild nearest neighbors index
        nearest_neighbors = NearestNeighbors(n_neighbors=min(10, len(embeddings_array)), metric='cosine')
        nearest_neighbors.fit(embeddings_array)
        
        # Save index and metadata
        save_index()
        
        logger.info(f"Added item {item_id} to index")
        return {
            "success": True,
            "item_id": item_id,
            "total_items": len(metadata)
        }
    except Exception as e:
        logger.error(f"Error uploading item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search/image", response_model=List[SimilarityResult])
async def search_by_image(file: UploadFile = File(...), top_k: int = 5):
    """Search for similar items using an image."""
    try:
        if len(metadata) == 0:
            return []
        
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Generate embedding
        query_embedding = get_image_embedding(image)
        
        # Search using nearest neighbors
        k = min(top_k, len(embeddings_array))
        distances, indices = nearest_neighbors.kneighbors([query_embedding], n_neighbors=k)
        
        # Prepare results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(metadata):
                # Convert cosine distance to similarity score (0-1, higher is better)
                similarity_score = 1.0 - float(dist)
                results.append(SimilarityResult(
                    item_id=metadata[idx]["item_id"],
                    similarity_score=similarity_score,
                    metadata=metadata[idx]
                ))
        
        return results
    except Exception as e:
        logger.error(f"Error searching by image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search/text", response_model=List[SimilarityResult])
async def search_by_text(request: SearchRequest):
    """Search for items using text description."""
    try:
        if len(metadata) == 0:
            return []
        
        if not request.query_text:
            raise HTTPException(status_code=400, detail="query_text is required")
        
        # Generate text embedding
        query_embedding = get_text_embedding(request.query_text)
        
        # Search using nearest neighbors
        k = min(request.top_k, len(embeddings_array))
        distances, indices = nearest_neighbors.kneighbors([query_embedding], n_neighbors=k)
        
        # Prepare results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(metadata):
                similarity_score = 1.0 - float(dist)
                results.append(SimilarityResult(
                    item_id=metadata[idx]["item_id"],
                    similarity_score=similarity_score,
                    metadata=metadata[idx]
                ))
        
        return results
    except Exception as e:
        logger.error(f"Error searching by text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/items", response_model=List[dict])
async def list_items():
    """List all items in the database."""
    return metadata

@app.delete("/items/{item_id}")
async def delete_item(item_id: str):
    """Delete an item from the database."""
    # Note: FAISS doesn't support deletion easily, so we'd need to rebuild the index
    # This is a simplified version
    raise HTTPException(status_code=501, detail="Deletion not implemented yet")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
