# 🧠 RepairMate AI – Multimodal AI Repair Agent

**RepairMate AI** is a production-level multimodal AI agent system powered by **Google Gemini 2.0 Flash**. It empowers users to diagnose broken electronics and receive interactive, voice-guided repair instructions.

Built for the **Google Live Agent Challenge**, RepairMate AI demonstrates how advanced multimodal AI can see, hear, and reason to solve real-world technical problems while promoting sustainability.

---

## 🌟 Key Features

- **📸 Real-Time Vision Analysis:** Automatically detects electronic components and faults using Gemini's spatial reasoning.
- **🗺️ Visual Overlays:** AI-generated bounding boxes highlight exactly where the problem is on your screen.
- **🎙️ Voice Interaction:** Talk to your repair assistant hands-free using built-in Speech-to-Text and Text-to-Speech.
- **🧠 Structured Engineering Reasoning:** Professional-grade diagnostics including difficulty levels, estimated time, and precise tool requirements.
- **🛡️ Safety First:** Real-time detection of electrical hazards and critical safety warnings for dangerous repairs.
- **🌍 Sustainability Tracking:** Visualizes the carbon and e-waste impact of your repair.

---

## 🏗 Repository Structure

```text
/
├── frontend/        # Next.js web application
├── backend/         # Node.js/Express API server
├── ARCHITECTURE.md  # Detailed system architecture
└── README.md        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API Key

### Backend Setup

1.  Navigate to the `backend` directory.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file and add your `GEMINI_API_KEY`.
4.  Start the server: `npm start`.

### Frontend Setup

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`.
3.  Start the development server: `npm run dev`.
4.  Open `http://localhost:3000` in your browser.

---

## 🧪 Demo Mode

RepairMate AI includes a **Demo Mode** (toggleable in the UI) that allows you to experience the full multimodal workflow with simulated data, perfect for demonstration purposes without requiring a live hardware setup.

---

## 📜 License

This project is licensed under the MIT License.
