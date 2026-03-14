# 🧠 RepairMate AI – Multimodal Repair Assistant Powered by Google Gemini

![RepairMate AI Banner](https://via.placeholder.com/1200x300/09090b/22d3ee?text=RepairMate+AI+-+Your+Intelligent+Repair+Assistant)

**RepairMate AI** is an elite, professional engineering and technical repair assistant powered by the **Google Gemini 3.1 Flash** model. It empowers users to diagnose broken devices, identify components, and receive step-by-step repair instructions simply by taking a photo. 

Built for the **Google Live Agent Challenge**, RepairMate AI promotes sustainability, reduces e-waste, and democratizes technical repair knowledge.

---

## 🎥 Live Demo

Try the live application:

https://repair-mate-seven.vercel.app/

Demo flow:

Upload image of broken device

Wait for AI analysis

Review repair instructions

Ask follow-up questions in chat

---

## 🏆 Google Live Agent Challenge Alignment

RepairMate AI demonstrates key challenge themes:

• Multimodal interaction (vision + language)
• Real-time AI assistance
• Structured AI reasoning
• Practical real-world problem solving

The project showcases how AI agents can assist humans in complex technical tasks.

---

## 🤖 Live AI Agent Experience

RepairMate AI functions as a real-time AI repair agent rather than a static diagnostic tool.

The agent can:

See the device through the user’s camera or uploaded image

Understand the problem through natural language

Reason about possible faults

Guide the user step-by-step during the repair

Continue assisting through follow-up conversation

This creates a continuous interactive repair session, similar to working with a real technician.

---

## 👁️ Multimodal Intelligence

RepairMate AI combines multiple AI capabilities:

• Vision – analyzes images of broken devices
• Language understanding – interprets user questions
• Reasoning – predicts likely causes of failure
• Conversation – provides contextual follow-up guidance

This multimodal interaction allows the AI to see, think, and explain repairs in real time.

---

## 🧑‍🔧 Agent Persona

RepairMate AI behaves like a professional engineering technician.

The assistant:

explains repairs in simple language

prioritizes safety

avoids uncertain instructions

recommends professional help for dangerous repairs

The goal is to make users feel like they are working with a knowledgeable repair expert.

---

## 🌟 Features

- **📸 Visual Diagnostics:** Upload or capture an image of a broken device, appliance, or component.
- **🧠 Advanced AI Analysis:** Powered by `gemini-3-flash-preview`, it identifies the device, brand, and visible components with high accuracy.
- **⚙️ Structured Repair Plans:** Generates a detailed JSON-structured response containing:
  - Difficulty level and estimated time.
  - Required tools and safety warnings.
  - Step-by-step repair instructions.
  - Sustainability impact (e-waste and carbon footprint saved).
- **💬 Context-Aware Follow-up Chat:** Ask specific questions about the repair. The AI retains the context of the image and the diagnostic report to provide highly relevant answers.
- **🛡️ Safety First:** Built-in safety protocols warn users about dangerous repairs (e.g., high voltage, CRT monitors) and recommend professional help when necessary.

---

## 📷 Camera-Based Diagnosis

Users can diagnose issues instantly using their device camera.

Workflow:

Open camera

Capture image of broken device

Ask a question

AI analyzes the image

Repair instructions appear

This enables real-time repair guidance.

---

## 📋 Example AI Diagnostic Output

Example analysis returned by the system:

Device Detected
Ceiling Fan – Electrical Appliance

Possible Issue
Loose power wire near terminal.

Repair Difficulty
Easy

Estimated Time
5 minutes

Required Tools
• screwdriver
• insulation tape

Repair Steps

Turn off the power supply

Remove the fan cover

Locate the loose wire

Reconnect the wire securely

Close the cover and restore power

Safety Warning
Always disconnect power before touching internal wiring.

---

## 🧠 AI Reasoning Transparency

RepairMate AI provides transparent reasoning by showing the factors used to reach a diagnosis.

Example reasoning:

Loose wire → 70% likelihood
Capacitor failure → 20%
Motor issue → 10%

This helps users understand why the AI made a particular recommendation.

---

## 🚀 How It Uses Google Gemini

RepairMate AI heavily leverages the **Google GenAI SDK** (`@google/genai`) to power its core features, adhering to the best practices of the Google Live Agent Challenge:

1. **Multimodal Vision Analysis:** Uses Gemini's vision capabilities to analyze base64-encoded images of broken devices.
2. **Structured JSON Output:** Utilizes `responseSchema` and `responseMimeType: "application/json"` to force the Gemini model to return a strictly typed `RepairAnalysis` object. This allows the React frontend to render a beautiful, structured dashboard instead of a wall of text.
3. **System Instructions:** Employs a rigorous `SYSTEM_INSTRUCTION` to enforce a professional engineering tone, prevent hallucination, and prioritize user safety.
4. **Multi-turn Chat:** Maintains a conversation history (`role: 'user' | 'model'`) combined with the initial image context to provide a seamless follow-up chat experience.

---

## 🏗 System Architecture

RepairMate AI architecture consists of:

User Interface
React + Tailwind UI

Image Processing Layer
Base64 image encoding

AI Analysis Layer
Gemini 3.1 Flash multimodal model

Response Engine
Structured JSON response generation

Repair Dashboard
Visual rendering of repair instructions

Conversation Engine
Context-aware follow-up chat

---

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Framer Motion (for animations), Lucide React (for icons)
- **AI Integration:** `@google/genai` SDK
- **Markdown Rendering:** `react-markdown`

---

## 🛠️ Installation & Setup

To run RepairMate AI locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/repairmate-ai.git
cd repairmate-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API key. 
*(Note: If running in a standard Vite environment, you may need to adapt the code to use `import.meta.env.VITE_GEMINI_API_KEY`. In the AI Studio environment, `process.env.GEMINI_API_KEY` is automatically injected).*

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Start the development server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 📷 Application Screenshots

Landing Page
Camera Capture
Repair Analysis Dashboard
AI Chat Interface

![Landing Page](screenshots/landing.png)
![Analysis Dashboard](screenshots/dashboard.png)
![Repair Steps](screenshots/repair.png)

---

## 🌍 Global Impact Potential

RepairMate AI can help reduce electronic waste by:

• enabling self-repair
• extending device lifespan
• reducing unnecessary replacements

Potential benefits:

• reduced global e-waste
• lower repair costs
• improved repair accessibility in rural areas

---

## 🔮 Future Enhancements

Planned improvements include:

• AR-based repair overlays
• real-time video diagnosis
• IoT device integration
• repair community knowledge base
• parts replacement marketplace

---

## 📜 License

This project is licensed under the MIT License.
