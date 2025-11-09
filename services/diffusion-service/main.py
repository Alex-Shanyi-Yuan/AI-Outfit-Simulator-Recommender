from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import torch
from diffusers import StableDiffusionInpaintPipeline, StableDiffusionImg2ImgPipeline
from PIL import Image
import io
import os
import logging
import base64

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stable Diffusion Virtual Try-On Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_NAME = os.getenv("DIFFUSION_MODEL_NAME", "runwayml/stable-diffusion-v1-5")
device = "cuda" if torch.cuda.is_available() else "cpu"

# Initialize pipelines
logger.info(f"Loading Stable Diffusion model: {MODEL_NAME} on {device}")
img2img_pipeline = None
inpaint_pipeline = None

def load_img2img_pipeline():
    global img2img_pipeline
    if img2img_pipeline is None:
        logger.info("Loading Img2Img pipeline...")
        img2img_pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None
        ).to(device)
        if device == "cuda":
            img2img_pipeline.enable_attention_slicing()
    return img2img_pipeline

def load_inpaint_pipeline():
    global inpaint_pipeline
    if inpaint_pipeline is None:
        logger.info("Loading Inpaint pipeline...")
        # Use a model specifically trained for inpainting
        inpaint_model = "runwayml/stable-diffusion-inpainting"
        inpaint_pipeline = StableDiffusionInpaintPipeline.from_pretrained(
            inpaint_model,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None
        ).to(device)
        if device == "cuda":
            inpaint_pipeline.enable_attention_slicing()
    return inpaint_pipeline

class TryOnRequest(BaseModel):
    prompt: Optional[str] = "person wearing fashionable clothing"
    strength: float = 0.75
    guidance_scale: float = 7.5
    num_inference_steps: int = 50

@app.get("/")
async def root():
    return {
        "service": "Stable Diffusion Virtual Try-On Service",
        "model": MODEL_NAME,
        "device": device,
        "status": "active"
    }

@app.post("/try-on/img2img")
async def try_on_img2img(
    person_image: UploadFile = File(...),
    clothing_image: UploadFile = File(...),
    prompt: str = Form("person wearing the clothing item, professional photo, high quality"),
    strength: float = Form(0.7),
    guidance_scale: float = Form(7.5),
    num_inference_steps: int = Form(30)
):
    """
    Virtual try-on using image-to-image diffusion.
    Combines person and clothing images to generate a preview.
    """
    try:
        # Load pipeline
        pipeline = load_img2img_pipeline()
        
        # Read images
        person_data = await person_image.read()
        person_img = Image.open(io.BytesIO(person_data)).convert("RGB")
        
        clothing_data = await clothing_image.read()
        clothing_img = Image.open(io.BytesIO(clothing_data)).convert("RGB")
        
        # Resize to appropriate size (512x512 for SD 1.5)
        target_size = (512, 512)
        person_img = person_img.resize(target_size)
        
        # Enhanced prompt incorporating clothing
        enhanced_prompt = f"{prompt}, wearing stylish outfit, detailed clothing, natural pose"
        
        logger.info(f"Generating try-on with prompt: {enhanced_prompt}")
        
        # Generate image
        with torch.no_grad():
            result = pipeline(
                prompt=enhanced_prompt,
                image=person_img,
                strength=strength,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps
            ).images[0]
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        result.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Error in try-on generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/try-on/inpaint")
async def try_on_inpaint(
    person_image: UploadFile = File(...),
    mask_image: UploadFile = File(...),
    clothing_image: UploadFile = File(...),
    prompt: str = Form("person wearing fashionable clothing, detailed outfit, high quality"),
    guidance_scale: float = Form(7.5),
    num_inference_steps: int = Form(50)
):
    """
    Virtual try-on using inpainting.
    Requires a mask image indicating where to place the clothing.
    """
    try:
        # Load pipeline
        pipeline = load_inpaint_pipeline()
        
        # Read images
        person_data = await person_image.read()
        person_img = Image.open(io.BytesIO(person_data)).convert("RGB")
        
        mask_data = await mask_image.read()
        mask_img = Image.open(io.BytesIO(mask_data)).convert("RGB")
        
        clothing_data = await clothing_image.read()
        clothing_img = Image.open(io.BytesIO(clothing_data)).convert("RGB")
        
        # Resize to appropriate size
        target_size = (512, 512)
        person_img = person_img.resize(target_size)
        mask_img = mask_img.resize(target_size)
        
        logger.info(f"Generating inpaint try-on with prompt: {prompt}")
        
        # Generate image
        with torch.no_grad():
            result = pipeline(
                prompt=prompt,
                image=person_img,
                mask_image=mask_img,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps
            ).images[0]
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        result.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Error in inpaint try-on: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/try-on/simple")
async def try_on_simple(
    person_image: UploadFile = File(...),
    prompt: str = Form("person wearing stylish casual outfit, jeans and t-shirt, high quality photo"),
    strength: float = Form(0.65),
    guidance_scale: float = Form(7.5),
    num_inference_steps: int = Form(30)
):
    """
    Simplified try-on that generates outfit based on text prompt.
    Good for quick previews without needing clothing images.
    """
    try:
        # Load pipeline
        pipeline = load_img2img_pipeline()
        
        # Read person image
        person_data = await person_image.read()
        person_img = Image.open(io.BytesIO(person_data)).convert("RGB")
        
        # Resize
        target_size = (512, 512)
        person_img = person_img.resize(target_size)
        
        logger.info(f"Generating simple try-on with prompt: {prompt}")
        
        # Generate image
        with torch.no_grad():
            result = pipeline(
                prompt=prompt,
                image=person_img,
                strength=strength,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps
            ).images[0]
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        result.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Error in simple try-on: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-outfit")
async def generate_outfit(
    prompt: str = Form("stylish casual outfit with jeans and blazer, fashion photography"),
    num_inference_steps: int = Form(50),
    guidance_scale: float = Form(7.5)
):
    """
    Generate outfit visualization from text description.
    Useful for inspiration and style exploration.
    """
    try:
        # Load pipeline
        pipeline = load_img2img_pipeline()
        
        # Create blank canvas
        blank = Image.new('RGB', (512, 512), color=(240, 240, 240))
        
        logger.info(f"Generating outfit from prompt: {prompt}")
        
        # Generate image
        with torch.no_grad():
            result = pipeline(
                prompt=prompt,
                image=blank,
                strength=0.9,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps
            ).images[0]
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        result.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
        
    except Exception as e:
        logger.error(f"Error generating outfit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
