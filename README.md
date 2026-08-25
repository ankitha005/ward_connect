# ADDA_360 — Bengaluru Ward Connect Platform

A full-stack civic tech portal for Bengaluru ward citizens. Built with **React + Vite + Express + MongoDB**.

## 🚀 Features
- 📝 Multi-step Complaint Filing with AI Smart Analyze
- 🤖 AI Chatbot with Ward Directory Context (Qwen2.5)
- 🌤️ Live Weather + AQI Widget (OpenWeatherMap)
- 📊 Survey System with full ward support
- 🗺️ Complaints Heatmap (Leaflet)
- 👤 Admin Dashboard with status updates
- 📢 Announcements & Emergency Ticker
- 🌙 Dark Mode Toggle
- ⭐ Complaint Feedback / Rating System
- 📱 Mobile Responsive

## 🛠️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env` in root:
```
VITE_WEATHER_API_KEY=your_openweathermap_key
HF_TOKEN=your_huggingface_token
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

### 3. Run development
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

## 🏗️ Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS v4 |
| Backend | Express.js, Node.js |
| Database | MongoDB + Mongoose |
| AI | HuggingFace Inference API (Qwen2.5, BLIP) |
| Maps | Leaflet + OpenStreetMap |
| Weather | OpenWeatherMap API |
| Auth | JWT |
| Animations | Framer Motion |

## 📁 Project Structure
```
new-civic-portal/
├── server/          # Express backend
│   ├── routes/      # API routes (ai, complaints, admin...)
│   └── index.js
├── src/
│   ├── components/  # Navbar, Chatbot, Weather, Loading...
│   ├── pages/       # Home, Complaints, Track, Survey...
│   ├── store/       # Zustand state management
│   ├── data/        # Ward & directory data
│   └── admin/       # Admin dashboard
└── public/
```

## 📜 License
MIT
