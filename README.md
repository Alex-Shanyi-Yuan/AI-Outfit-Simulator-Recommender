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
