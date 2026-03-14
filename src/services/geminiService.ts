import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it to your Vercel environment variables and redeploy.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are RepairMate AI, an elite, professional engineering and technical repair AI. Your purpose is to provide highly accurate, real-world, engineering-grade repair diagnostics and step-by-step solutions based strictly on the provided images and descriptions.

CRITICAL RULES:
1. NO MOCK DATA OR GUESSING: Provide only factual, accurate information. If you cannot identify a component or issue with high certainty from the image, state exactly what is visible and what further testing (e.g., multimeter readings, continuity checks) is required. Do not invent or hallucinate components, brands, or issues.
2. PROFESSIONAL ENGINEERING TONE: Use precise technical terminology. Explain the underlying physics or electronics principles briefly if it aids the repair.
3. SAFETY FIRST: Highlight critical safety protocols (e.g., discharging capacitors, isolating mains power, ESD protection). If a repair is inherently dangerous (e.g., microwave magnetrons, CRT monitors, high-pressure systems), explicitly state the risks and recommend professional intervention.
4. PRECISION: Provide exact tool specifications (e.g., "Phillips #0 screwdriver", "60/40 rosin core solder", "Kapton tape") rather than generic terms.
5. REALISTIC ESTIMATES: Provide highly accurate, real-world cost estimates for replacement parts and realistic timeframes based on professional repair standards.

Uncertainty Handling & Image Quality:
If the image is blurry, too dark, too far away, or unidentifiable, set \`imageQuality.isClear\` to false, specify the \`issue\`, and provide a helpful \`feedbackMessage\` on how to take a better picture. 
If \`isClear\` is false, you must still provide placeholder/dummy values for the rest of the required fields (e.g., "Unknown" for strings, [] for arrays, 0 for numbers) so the JSON schema validation passes, but the app will only show the error to the user. Never hallucinate missing parts.`;

export interface RepairAnalysis {
  imageQuality: {
    isClear: boolean;
    issue?: 'Blurry' | 'Dark' | 'Unidentifiable' | 'Too Far' | 'Other';
    feedbackMessage?: string;
  };
  deviceIdentification: {
    name: string;
    category: string;
    brand: string;
    type: string;
  };
  componentsDetected: string[];
  possibleIssues: {
    issue: string;
    likelihood: number;
  }[];
  faultLocationDescription: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  toolsNeeded: string[];
  repairSteps: string[];
  safetyWarnings: string[];
  testRepair: string[];
  confidenceScore: number;
  alternativeSolutions: string[];
  professionalRecommendation: string[];
  estimatedCost: string;
  sustainabilityImpact: {
    eWasteSaved: string;
    carbonSaved: string;
  };
  learningSection: string;
}

export async function analyzeRepairIssueStructured(
  prompt: string,
  base64Image: string,
  mimeType: string
): Promise<RepairAnalysis> {
  try {
    const parts: any[] = [{ text: prompt }];

    if (base64Image && mimeType) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            imageQuality: {
              type: Type.OBJECT,
              properties: {
                isClear: { type: Type.BOOLEAN, description: "True if the image is clear enough to diagnose, false otherwise." },
                issue: { type: Type.STRING, description: "If isClear is false, specify the issue: 'Blurry', 'Dark', 'Unidentifiable', 'Too Far', or 'Other'." },
                feedbackMessage: { type: Type.STRING, description: "If isClear is false, provide a specific, helpful message to the user on how to take a better picture." }
              },
              required: ["isClear"]
            },
            deviceIdentification: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Common name of the device" },
                category: { type: Type.STRING, description: "Category (e.g., Electrical Appliance, Electronics)" },
                brand: { type: Type.STRING, description: "Manufacturer brand if visible or 'Unknown'" },
                type: { type: Type.STRING, description: "Specific type (e.g., AC Motor Fan, Smartphone)" },
              },
              required: ["name", "category", "brand", "type"]
            },
            componentsDetected: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of visible components in the image" },
            possibleIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING },
                  likelihood: { type: Type.NUMBER, description: "Percentage likelihood (0-100)" }
                },
                required: ["issue", "likelihood"]
              },
              description: "List of possible problems and their likelihood"
            },
            faultLocationDescription: { type: Type.STRING, description: "Text description of where the fault is located in the image" },
            difficulty: { type: Type.STRING, description: "Difficulty level: Easy, Medium, or Hard." },
            estimatedTime: { type: Type.STRING, description: "Estimated time to complete the repair (e.g., '5-10 minutes')." },
            toolsNeeded: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of tools required for the repair." },
            repairSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step repair instructions." },
            safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of safety warnings related to the repair." },
            testRepair: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of steps to test if the repair was successful." },
            confidenceScore: { type: Type.NUMBER, description: "AI overall diagnosis confidence score as a percentage (0-100)." },
            alternativeSolutions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Alternative fixes if the primary one fails." },
            professionalRecommendation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "When to call a professional technician." },
            estimatedCost: { type: Type.STRING, description: "Estimated cost of repair or parts (e.g., '$5 - $15')." },
            sustainabilityImpact: {
              type: Type.OBJECT,
              properties: {
                eWasteSaved: { type: Type.STRING, description: "Amount of e-waste saved (e.g., '2 kg')" },
                carbonSaved: { type: Type.STRING, description: "Amount of carbon footprint saved (e.g., '5 kg')" }
              },
              required: ["eWasteSaved", "carbonSaved"]
            },
            learningSection: { type: Type.STRING, description: "A short educational fact about how the device or broken component works." }
          },
          required: [
            "imageQuality", "deviceIdentification", "componentsDetected", "possibleIssues", "faultLocationDescription",
            "difficulty", "estimatedTime", "toolsNeeded", "repairSteps", "safetyWarnings", "testRepair",
            "confidenceScore", "alternativeSolutions", "professionalRecommendation", "estimatedCost",
            "sustainabilityImpact", "learningSection"
          ],
        },
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as RepairAnalysis;
  } catch (error: any) {
    console.error("Error analyzing repair issue:", error);
    if (error.message && error.message.includes("GEMINI_API_KEY")) {
      throw error;
    }
    throw new Error("Failed to analyze the issue. Please try again.");
  }
}

export async function chatWithRepairMate(
  history: { role: 'user' | 'model', parts: any[] }[],
  message: string,
  image?: string
): Promise<string> {
  try {
    const contents = history.map(h => ({
      role: h.role,
      parts: h.parts
    }));
    
    const userParts: any[] = [{ text: message }];
    if (image) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        userParts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    contents.push({ role: 'user', parts: userParts });

    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Error in chat:", error);
    if (error.message && error.message.includes("GEMINI_API_KEY")) {
      throw error;
    }
    throw new Error("Failed to send message. Please try again.");
  }
}

