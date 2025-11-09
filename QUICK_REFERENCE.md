# Quick Reference Guide

## 🚀 Quick Commands

### Docker Mode (Recommended)
```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart clip-service
```

### Development Mode
```bash
# CLIP Service (Terminal 1)
cd services/clip-service && python main.py

# Gemini Service (Terminal 2)
cd services/gemini-service && python main.py

# Diffusion Service (Terminal 3)
cd services/diffusion-service && python main.py

# Frontend (Terminal 4)
cd frontend && npm run dev
```

## 🔗 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main web interface |
| CLIP API | http://localhost:8001 | Similarity search |
| Gemini API | http://localhost:8002 | Outfit recommendations |
| Diffusion API | http://localhost:8003 | Virtual try-on |

## 📋 API Examples

### CLIP Service

**Upload Item:**
```bash
curl -X POST http://localhost:8001/upload \
  -F "file=@shirt.jpg" \
  -F "category=top" \
  -F "color=blue" \
  -F "style=casual"
```

**Search by Text:**
```bash
curl -X POST http://localhost:8001/search/text \
  -H "Content-Type: application/json" \
  -d '{"query_text": "red dress", "top_k": 5}'
```

**List Items:**
```bash
curl http://localhost:8001/items
```

### Gemini Service

**Get Recommendation:**
```bash
curl -X POST http://localhost:8002/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Suggest a business casual outfit",
    "occasion": "business",
    "weather": "cool"
  }'
```

**Chat:**
```bash
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What shoes go with a blue suit?"}'
```

### Diffusion Service

**Simple Try-On:**
```bash
curl -X POST http://localhost:8003/try-on/simple \
  -F "person_image=@person.jpg" \
  -F "prompt=person wearing casual jeans and t-shirt" \
  -F "num_inference_steps=30" \
  --output result.png
```

**Image-to-Image:**
```bash
curl -X POST http://localhost:8003/try-on/img2img \
  -F "person_image=@person.jpg" \
  -F "clothing_image=@shirt.jpg" \
  -F "prompt=person wearing the clothing item" \
  --output result.png
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
HUGGINGFACE_TOKEN=your_huggingface_token_here

# Service URLs (Docker uses internal network)
CLIP_SERVICE_URL=http://clip-service:8001
GEMINI_SERVICE_URL=http://gemini-service:8002
DIFFUSION_SERVICE_URL=http://diffusion-service:8003

# Frontend URLs (for local development)
NEXT_PUBLIC_CLIP_API=http://localhost:8001
NEXT_PUBLIC_GEMINI_API=http://localhost:8002
NEXT_PUBLIC_DIFFUSION_API=http://localhost:8003
```

## 🐛 Debugging

### Check Service Health
```bash
# CLIP
curl http://localhost:8001/

# Gemini
curl http://localhost:8002/

# Diffusion
curl http://localhost:8003/
```

### View Docker Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs clip-service
docker-compose logs gemini-service
docker-compose logs diffusion-service
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

### Check Resource Usage
```bash
# Docker stats
docker stats

# Disk usage
docker system df
```

## 🧹 Cleanup

### Remove Containers
```bash
docker-compose down
```

### Remove Volumes (WARNING: Deletes data)
```bash
docker-compose down -v
```

### Clean Everything
```bash
docker-compose down -v --rmi all
docker system prune -a
```

## 📊 Performance Tips

### Speed Up Stable Diffusion
- Reduce `num_inference_steps` (e.g., 20-30 instead of 50)
- Lower `guidance_scale` slightly
- Use GPU if available

### Reduce Memory Usage
- Use smaller batch sizes
- Lower image resolution
- Close unused applications

### Faster Model Loading
- Keep Docker containers running
- Use volume mounts for model cache
- Set HUGGINGFACE_TOKEN for faster downloads

## 🎯 Common Workflows

### 1. Building a Wardrobe
1. Go to Virtual Wardrobe page
2. Upload 5-10 clothing items with metadata
3. Test similarity search

### 2. Getting Outfit Suggestions
1. Build wardrobe first (optional but recommended)
2. Go to AI Recommender
3. Set preferences (occasion, weather, style)
4. Chat with AI for suggestions

### 3. Visualizing an Outfit
1. Go to Virtual Try-On
2. Upload a person photo
3. Choose mode (simple or img2img)
4. Adjust parameters
5. Generate and download

## 📱 Mobile Access

Access from mobile device on same network:
```
http://<your-computer-ip>:3000
```

Find your IP:
```bash
# Linux/Mac
ifconfig | grep inet

# Windows
ipconfig
```

## 🔒 Security Notes

- **Never commit .env file** (contains API keys)
- **Don't expose ports publicly** without authentication
- **Use HTTPS in production**
- **Implement rate limiting** for public deployments

## 📚 File Locations

| Item | Location |
|------|----------|
| Uploaded wardrobe data | `clip-data` volume |
| Model cache | `diffusion-models` volume |
| Frontend code | `frontend/` |
| Backend services | `services/` |
| Environment config | `.env` |

## 🎨 Customization

### Change Color Scheme
Edit `frontend/tailwind.config.js`

### Modify Prompts
Edit prompt defaults in respective page components

### Add New Features
1. Backend: Add endpoints in service `main.py` files
2. Frontend: Create components in `frontend/app/`
3. API: Update `frontend/lib/api.ts`

## 📞 Support

- Check `IMPLEMENTATION.md` for detailed docs
- Read `README.md` for full guide
- Check service logs for errors
- Verify API keys are set correctly

Happy coding! 🚀
