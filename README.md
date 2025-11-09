# 🧥 AI Outfit Simulator & Recommender

An AI-powered **web-based clothing simulation and outfit recommendation platform** that helps users visualize outfits and receive intelligent fashion suggestions.  
The system combines **Gemini AI**, **CLIP**, and **Stable Diffusion** to deliver natural language reasoning, visual similarity search, and realistic virtual try-on experiences.

---

## 🚀 Overview

This project allows users to:
- Upload images of clothing items or browse a virtual wardrobe.
- Receive **AI-suggested outfits** based on personal preferences, weather, and occasion.
- **Visualize outfits** on 3D human models through generative simulation.
- Search for **visually similar** or **style-compatible** items using CLIP embeddings.

The platform integrates cutting-edge AI models in a scalable, containerized web system suitable for AI software engineering and applied machine learning demonstrations.

---

## 🧠 Core Features

### 🪄 1. AI Outfit Recommendation (Gemini)
- Uses **Gemini AI** for natural-language style reasoning and outfit composition.
- Generates daily outfit suggestions based on text prompts like:
  > “Suggest a casual fall outfit using denim jackets and sneakers.”
- Supports user personalization (e.g., occasion, weather, or favorite color).

### 🖼️ 2. Outfit Similarity Search (CLIP)
- Employs **OpenAI CLIP ViT-B/32** embeddings for semantic image search.
- Encodes each clothing image into a shared visual-text space.
- Enables:
  - “Find similar items” search.
  - Outfit compatibility scoring (e.g., matching colors, textures, or aesthetics).
- Pretrained model requires no local training; optional fine-tuning supported using **DeepFashion** or **Polyvore Outfits** datasets.

### 🧍‍♀️ 3. Virtual Try-On Simulation (Diffusion Models)
- Integrates **Stable Diffusion** (or **SDXL**) for realistic try-on generation.
- Accepts two input images:
  - Human base image.
  - Clothing image.
- Produces a visual preview of the outfit via **image-to-image diffusion** or **inpainting**.
- Optionally fine-tuned on **VITON-HD** dataset for improved human–clothing alignment.

### 💬 4. Interactive Frontend
- Built with **Next.js** and **Three.js** for 3D model rendering and dynamic outfit previews.
- Supports drag-and-drop clothing selection and AI-generated outfit visualization.
- Provides detailed outfit reasoning and recommendations through chat-based UI.

---

## ⚙️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - Virtual Wardrobe UI                                      │
│  - AI Recommendation Chat Interface                         │
│  - Virtual Try-On Simulator                                 │
└────────┬──────────────┬──────────────┬──────────────────────┘
         │              │              │
         │              │              │
         ▼              ▼              ▼
┌────────────────┐ ┌────────────┐ ┌──────────────────┐
│  CLIP Service  │ │   Gemini   │ │    Diffusion     │
│   (Port 8001)  │ │  Service   │ │     Service      │
│                │ │ (Port 8002)│ │   (Port 8003)    │
│  - Image       │ │            │ │                  │
│    Embeddings  │ │  - Outfit  │ │  - Virtual       │
│  - FAISS       │ │    Recom-  │ │    Try-On        │
│    Search      │ │    mendation│ │  - Image         │
│  - Similarity  │ │  - Style   │ │    Generation    │
│    Matching    │ │    Advice  │ │  - Inpainting    │
└────────────────┘ └────────────┘ └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended) OR
- **Python 3.10+** and **Node.js 18+** (for manual setup)
- **Gemini API Key** (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Optional: **Hugging Face Token** (for faster model downloads)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alex-Shanyi-Yuan/AI-Outfit-Simulator-Recommender.git
   cd AI-Outfit-Simulator-Recommender
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Run the application**
   ```bash
   ./start.sh
   # Choose option 1 for Docker
   
   # Or manually:
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - CLIP API: http://localhost:8001
   - Gemini API: http://localhost:8002
   - Diffusion API: http://localhost:8003

⚠️ **Note**: First run will download AI models (~4-5 GB). This may take 10-30 minutes.

### Option 2: Manual Development Setup

#### Backend Services

**Terminal 1 - CLIP Service:**
```bash
cd services/clip-service
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Gemini Service:**
```bash
cd services/gemini-service
pip install -r requirements.txt
export GEMINI_API_KEY="your-api-key-here"
python main.py
```

**Terminal 3 - Diffusion Service:**
```bash
cd services/diffusion-service
pip install -r requirements.txt
python main.py
```

#### Frontend

**Terminal 4 - Next.js Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## 📖 Usage Guide

### 1. Virtual Wardrobe

1. Navigate to **Virtual Wardrobe** from the home page
2. Fill in clothing details (category, color, style)
3. Upload an image of your clothing item
4. Use **Search by Text** or **Search by Image** to find similar items
5. View your wardrobe collection

### 2. AI Outfit Recommender

1. Go to **AI Recommender**
2. Optionally set preferences (occasion, weather, style, colors)
3. Type your request, e.g.:
   - "Suggest a casual weekend outfit"
   - "What should I wear to a business meeting?"
   - "I need something for a summer wedding"
4. Receive AI-generated outfit suggestions with reasoning and styling tips

### 3. Virtual Try-On

1. Navigate to **Virtual Try-On**
2. Choose mode:
   - **Simple Try-On**: Text-based generation
   - **Image-to-Image**: Use actual clothing images
3. Upload a person image (required)
4. Upload clothing image (for img2img mode)
5. Adjust parameters (prompt, strength, guidance scale, steps)
6. Click **Generate Try-On**
7. Download or share the result

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Heroicons** - UI icons
- **Axios** - API communication
- **Three.js** - 3D rendering (optional enhancement)

### Backend Services

#### CLIP Service (Port 8001)
- **FastAPI** - High-performance API framework
- **Transformers** - Hugging Face transformers library
- **CLIP ViT-B/32** - OpenAI's vision-language model
- **FAISS** - Facebook AI Similarity Search
- **PyTorch** - Deep learning framework

#### Gemini Service (Port 8002)
- **FastAPI** - API framework
- **Google Generative AI** - Gemini API client
- **Gemini Pro** - Google's large language model

#### Diffusion Service (Port 8003)
- **FastAPI** - API framework
- **Diffusers** - Hugging Face diffusion models library
- **Stable Diffusion 1.5** - Image generation model
- **PyTorch** - Deep learning framework

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📁 Project Structure

```
AI-Outfit-Simulator-Recommender/
├── frontend/                    # Next.js frontend application
│   ├── app/
│   │   ├── page.tsx            # Home page
│   │   ├── wardrobe/           # Virtual wardrobe feature
│   │   ├── recommend/          # AI recommendation feature
│   │   └── try-on/             # Virtual try-on feature
│   ├── lib/
│   │   └── api.ts              # API client utilities
│   ├── package.json
│   └── Dockerfile
│
├── services/
│   ├── clip-service/           # CLIP similarity search service
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── gemini-service/         # Gemini recommendation service
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── diffusion-service/      # Stable Diffusion try-on service
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── docker-compose.yml          # Multi-service orchestration
├── .env.example                # Environment variables template
├── .gitignore
├── start.sh                    # Quick start script
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_TOKEN=your_huggingface_token_here  # Optional

# Service URLs (for Docker)
CLIP_SERVICE_URL=http://clip-service:8001
GEMINI_SERVICE_URL=http://gemini-service:8002
DIFFUSION_SERVICE_URL=http://diffusion-service:8003

# Frontend URLs (for local development)
NEXT_PUBLIC_CLIP_API=http://localhost:8001
NEXT_PUBLIC_GEMINI_API=http://localhost:8002
NEXT_PUBLIC_DIFFUSION_API=http://localhost:8003
```

### API Endpoints

#### CLIP Service (8001)
- `POST /upload` - Upload clothing item
- `POST /search/image` - Search by image
- `POST /search/text` - Search by text description
- `GET /items` - List all items

#### Gemini Service (8002)
- `POST /recommend` - Get outfit recommendations
- `POST /chat` - Fashion advice chat
- `POST /analyze-outfit` - Analyze outfit compatibility

#### Diffusion Service (8003)
- `POST /try-on/img2img` - Image-to-image try-on
- `POST /try-on/simple` - Text-based try-on
- `POST /try-on/inpaint` - Inpainting try-on
- `POST /generate-outfit` - Generate outfit visualization

---

## 🎯 Future Enhancements

### Phase 4: Advanced Features

- **Model Fine-Tuning**
  - Fine-tune Stable Diffusion on VITON-HD dataset
  - Fine-tune CLIP on DeepFashion or Polyvore Outfits
  
- **Enhanced 3D Visualization**
  - Full Three.js integration for 3D human models
  - Real-time outfit preview and rotation
  
- **User Personalization**
  - User accounts and authentication
  - Saved wardrobes and preferences
  - Outfit history and favorites
  - Social sharing features

- **Advanced Features**
  - Weather API integration for context-aware suggestions
  - Calendar integration for occasion planning
  - Multi-user outfit collaboration
  - Style trend analysis
  - Virtual closet organization

---

## 🐛 Troubleshooting

### Services won't start
- Check if ports 3000, 8001, 8002, 8003 are available
- Ensure Docker daemon is running
- Verify .env file has correct API keys

### CLIP service is slow
- First run downloads the CLIP model (~1GB)
- Consider using GPU acceleration if available

### Gemini service returns errors
- Verify GEMINI_API_KEY is set correctly
- Check API quota limits

### Diffusion service is very slow or OOM
- Stable Diffusion requires significant memory
- Reduce `num_inference_steps` parameter
- Use GPU if available
- Consider using smaller models

### Frontend can't connect to backend
- Check that all services are running
- Verify environment variables point to correct URLs
- Check Docker network connectivity

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using cutting-edge AI technologies**
