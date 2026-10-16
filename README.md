# 🍳 Smart AI Kitchen Assistant (Smart Kitchen Pal)

An intelligent, multi-modal kitchen assistant that detects ingredients from photos, estimates spatial volume to calculate real-time nutritional values, and suggests recipes using semantic RAG (Retrieval-Augmented Generation).

---

## 🌟 Key Features

- **Multi-Modal Visual Ingredient Detection:** Identifies food items, proteins, vegetables, and condiments with precise bounding boxes and category classifications.
- **Dynamic Volume & Nutrition Scaling:** Uses spatial visual estimation to compute ingredient mass in grams and dynamically scale calories, protein, carbs, and fats via USDA FoodData Central standards.
- **Semantic Recipe Retrieval (RAG):** Powered by dense vector embeddings (`BAAI/bge-large-en-v1.5`) and ChromaDB vector search to find the best recipes matching detected ingredients.
- **Dietary & Cuisine Intelligence:** Flags vegetarian vs. non-vegetarian items, suggests regional cuisines, and detects recipe compatibility.
- **Modern Interactive Dashboard:** Built with React 18, Vite, TypeScript, Lucide Icons, and Tailwind CSS with dark-mode aesthetic.

---

## 🏗️ Architecture & Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Computer Vision & Inference:** Multi-modal Vision API & Foundation Ensemble
- **Embeddings & Vector Search:** HuggingFace `sentence-transformers` (`BAAI/bge-large-en-v1.5`), ChromaDB
- **Nutrition Intelligence:** USDA FoodData Central REST API with algorithmic caching and fallback macros
- **Server:** Uvicorn ASGI

### Frontend
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS & Radix UI primitives
- **Icons:** Lucide React

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+) & npm
- Python (3.10+)
- Google Gemini API Key

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY
```

Run the backend server:
```bash
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
# In the root directory:
npm install

# Start the development server
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) (or the port displayed in your terminal) to start using the assistant.

---

## 📁 Project Structure

```text
smart-kitchen-pal/
├── backend/
│   ├── config.py             # App settings & feature flags
│   ├── main.py               # FastAPI routes and endpoints
│   ├── models/               # Vision & multi-modal detection pipeline
│   ├── services/             # Nutrition (USDA), RAG Recipe Engine, Feedback, Waste Tracker
│   ├── db/                   # Chroma vector database & SQLite store
│   └── requirements.txt      # Python dependencies
├── src/
│   ├── components/kitchen/   # VisionOutput, NutritionPanel, RecipeCards, WasteTracker
│   ├── hooks/                # Frontend custom hooks (useAnalyzeFood, etc.)
│   ├── types/                # TypeScript interface definitions
│   └── pages/                # Main application view
├── public/                   # Static assets & favicons
└── README.md
```

---

## 📄 License
This project is open-source and available under the MIT License.
