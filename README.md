# 🛠️ RepairMate AI

![RepairMate AI Banner](https://via.placeholder.com/1200x300/09090b/22d3ee?text=RepairMate+AI+-+Your+Intelligent+Repair+Assistant)

**RepairMate AI** is an elite, professional engineering and technical repair assistant powered by the **Google Gemini 3.1 Flash** model. It empowers users to diagnose broken devices, identify components, and receive step-by-step repair instructions simply by taking a photo. 

Built for the **Google Live Agent Challenge**, RepairMate AI promotes sustainability, reduces e-waste, and democratizes technical repair knowledge.

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

## 🚀 How It Uses Google Gemini

RepairMate AI heavily leverages the **Google GenAI SDK** (`@google/genai`) to power its core features, adhering to the best practices of the Google Live Agent Challenge:

1. **Multimodal Vision Analysis:** Uses Gemini's vision capabilities to analyze base64-encoded images of broken devices.
2. **Structured JSON Output:** Utilizes `responseSchema` and `responseMimeType: "application/json"` to force the Gemini model to return a strictly typed `RepairAnalysis` object. This allows the React frontend to render a beautiful, structured dashboard instead of a wall of text.
3. **System Instructions:** Employs a rigorous `SYSTEM_INSTRUCTION` to enforce a professional engineering tone, prevent hallucination, and prioritize user safety.
4. **Multi-turn Chat:** Maintains a conversation history (`role: 'user' | 'model'`) combined with the initial image context to provide a seamless follow-up chat experience.

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

## 🏗️ Architecture

1. **Landing Page:** User chooses to upload an image or use their device camera.
2. **Analysis Engine (`geminiService.ts`):** The image is converted to Base64 and sent to the `gemini-3-flash-preview` model along with a strict JSON schema.
3. **Dashboard (`AnalysisDashboard.tsx`):** The structured JSON response is parsed and rendered into a beautiful, easy-to-read dashboard showing tools, steps, and safety warnings.
4. **Chat Interface (`ChatInput.tsx` & `MessageBubble.tsx`):** Users can continue the conversation. The chat history is appended to the Gemini API request to maintain context.

---

## 🌱 Sustainability Impact

By empowering individuals to repair their own devices, RepairMate AI directly contributes to reducing global e-waste. Every successful repair extends the lifecycle of electronics, saving valuable resources and reducing carbon emissions associated with manufacturing new devices.

---

## 📜 License

This project is licensed under the MIT License.
