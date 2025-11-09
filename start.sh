#!/bin/bash

# AI Outfit Simulator & Recommender - Development Start Script

echo "🧥 AI Outfit Simulator & Recommender"
echo "===================================="
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys:"
    echo "   - GEMINI_API_KEY (required for recommendations)"
    echo "   - HUGGINGFACE_TOKEN (optional, for faster model downloads)"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
fi

echo ""
echo "Choose how to run the application:"
echo "1) Docker (recommended - runs all services)"
echo "2) Development mode (manual - run services individually)"
echo ""
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo "🐳 Starting with Docker..."
        echo ""
        echo "This will:"
        echo "  - Build all service images"
        echo "  - Start CLIP, Gemini, and Diffusion services"
        echo "  - Start the Next.js frontend"
        echo ""
        echo "⚠️  Note: First run will download AI models (~4-5 GB)"
        echo "         This may take 10-30 minutes depending on your connection."
        echo ""
        read -p "Continue? [y/N]: " confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            docker-compose up --build
        else
            echo "Cancelled."
        fi
        ;;
    2)
        echo ""
        echo "🔧 Development Mode Instructions:"
        echo ""
        echo "You'll need to run each service in separate terminals:"
        echo ""
        echo "Terminal 1 - CLIP Service:"
        echo "  cd services/clip-service"
        echo "  pip install -r requirements.txt"
        echo "  python main.py"
        echo ""
        echo "Terminal 2 - Gemini Service:"
        echo "  cd services/gemini-service"
        echo "  pip install -r requirements.txt"
        echo "  python main.py"
        echo ""
        echo "Terminal 3 - Diffusion Service:"
        echo "  cd services/diffusion-service"
        echo "  pip install -r requirements.txt"
        echo "  python main.py"
        echo ""
        echo "Terminal 4 - Frontend:"
        echo "  cd frontend"
        echo "  npm install"
        echo "  npm run dev"
        echo ""
        echo "Then open http://localhost:3000 in your browser"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
