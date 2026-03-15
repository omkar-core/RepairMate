import { RepairAnalysis } from './types';

export const MOCK_ANALYSIS: RepairAnalysis = {
  imageQuality: { isClear: true },
  deviceIdentification: {
    name: "Smartphone (iPhone 13)",
    category: "Electronics",
    brand: "Apple",
    type: "Mobile Device"
  },
  componentsDetected: [
    { name: "OLED Display Panel", box_2d: [100, 100, 900, 900], confidence: 0.98 },
    { name: "Logic Board", box_2d: [200, 300, 500, 700], confidence: 0.92 },
    { name: "Battery Connector", box_2d: [550, 450, 650, 550], confidence: 0.85 }
  ],
  possibleIssues: [
    { issue: "Broken Digitizer / Cracked Glass", likelihood: 95, box_2d: [150, 150, 450, 850] }
  ],
  faultLocationDescription: "Visible spiderweb cracking across the upper half of the display panel.",
  difficulty: 'Medium',
  estimatedTime: "45-60 minutes",
  toolsNeeded: ["Pentalobe P2 Screwdriver", "Tri-point Y000 Screwdriver", "Suction Cup", "Plastic Spudger", "Heat Gun / Hair Dryer"],
  repairSteps: [
    "Power down the device completely.",
    "Remove the two pentalobe screws next to the Lightning connector.",
    "Apply heat to the edges of the display to soften the adhesive.",
    "Use a suction cup and spudger to carefully lift the display panel.",
    "Disconnect the battery and display cables from the logic board.",
    "Install the new display assembly and reattach cables.",
    "Apply new adhesive and seal the device."
  ],
  safetyWarnings: [
    "Avoid puncturing the lithium-ion battery.",
    "Do not apply excessive heat; keep heat gun moving.",
    "Wear eye protection when handling broken glass."
  ],
  testRepair: [
    "Check touch responsiveness across the entire screen.",
    "Verify FaceID and front camera functionality.",
    "Check for any light bleed around the edges."
  ],
  confidenceScore: 92,
  alternativeSolutions: ["Local repair shop screen replacement", "Official Apple service center"],
  professionalRecommendation: ["Highly recommended if you are not comfortable working with tiny screws and delicate flex cables."],
  estimatedCost: "$80 - $150 (Part only)",
  sustainabilityImpact: {
    eWasteSaved: "0.2 kg",
    carbonSaved: "15 kg CO2e"
  },
  learningSection: "The digitizer is a layer of glass that converts your touch into electrical signals. It is often fused with the OLED display in modern smartphones."
};
