import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenerativeAI | null = null;

function getAI(): GoogleGenerativeAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it to your environment variables.");
    }
    aiClient = new GoogleGenerativeAI(apiKey);
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are RepairMate AI, an elite, professional engineering and technical repair AI agent. Your purpose is to provide highly accurate, real-world, engineering-grade repair diagnostics and step-by-step solutions based strictly on the provided images and descriptions.

CRITICAL RULES:
1. SPATIAL DETECTION: Identify and locate electronic components (capacitors, resistors, ICs, connectors, etc.) and faulty areas. For each identified component or fault, provide normalized bounding box coordinates [ymin, xmin, ymax, xmax] in the range [0, 1000].
2. NO MOCK DATA OR GUESSING: Provide only factual, accurate information. If you cannot identify a component or issue with high certainty from the image, state exactly what is visible and what further testing (e.g., multimeter readings, continuity checks) is required.
3. PROFESSIONAL ENGINEERING TONE: Use precise technical terminology.
4. SAFETY FIRST: Highlight critical safety protocols. Detect potential electrical hazards (exposed wires, high voltage areas).
5. PRECISION: Provide exact tool specifications.

Uncertainty Handling & Image Quality:
If the image is blurry, too dark, too far away, or unidentifiable, set \`imageQuality.isClear\` to false, specify the \`issue\`, and provide a helpful \`feedbackMessage\` on how to take a better picture.`;

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
  componentsDetected: {
    name: string;
    box_2d: number[]; // [ymin, xmin, ymax, xmax]
    confidence: number;
  }[];
  possibleIssues: {
    issue: string;
    likelihood: number;
    box_2d?: number[];
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

    const response = await getAI().getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    }).generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            imageQuality: {
              type: SchemaType.OBJECT,
              properties: {
                isClear: { type: SchemaType.BOOLEAN },
                issue: { type: SchemaType.STRING },
                feedbackMessage: { type: SchemaType.STRING }
              },
              required: ["isClear"]
            },
            deviceIdentification: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING },
                brand: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
              },
              required: ["name", "category", "brand", "type"]
            },
            componentsDetected: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    box_2d: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER } },
                    confidence: { type: SchemaType.NUMBER }
                },
                required: ["name", "box_2d"]
              }
            },
            possibleIssues: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  issue: { type: SchemaType.STRING },
                  likelihood: { type: SchemaType.NUMBER },
                  box_2d: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER } }
                },
                required: ["issue", "likelihood"]
              }
            },
            faultLocationDescription: { type: SchemaType.STRING },
            difficulty: { type: SchemaType.STRING },
            estimatedTime: { type: SchemaType.STRING },
            toolsNeeded: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            repairSteps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            safetyWarnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            testRepair: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            confidenceScore: { type: SchemaType.NUMBER },
            alternativeSolutions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            professionalRecommendation: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            estimatedCost: { type: SchemaType.STRING },
            sustainabilityImpact: {
              type: SchemaType.OBJECT,
              properties: {
                eWasteSaved: { type: SchemaType.STRING },
                carbonSaved: { type: SchemaType.STRING }
              },
              required: ["eWasteSaved", "carbonSaved"]
            },
            learningSection: { type: SchemaType.STRING }
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

    const text = response.response.text() || "{}";
    return JSON.parse(text) as RepairAnalysis;
  } catch (error: any) {
    console.error("Error analyzing repair issue:", error);
    throw new Error("Failed to analyze the issue. Please try again.");
  }
}

export async function chatWithRepairMate(
  history: { role: 'user' | 'model', parts: any[] }[],
  message: string,
  image?: string
): Promise<string> {
  try {
    const chat = getAI().getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
    }).startChat({
        history: history.map(h => ({
            role: h.role,
            parts: h.parts.map(p => {
                if (p.text) return { text: p.text };
                if (p.inlineData) return { inlineData: p.inlineData };
                return p;
            })
        }))
    });

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

    const result = await chat.sendMessage(userParts);
    return result.response.text();
  } catch (error: any) {
    console.error("Error in chat:", error);
    throw new Error("Failed to send message. Please try again.");
  }
}
