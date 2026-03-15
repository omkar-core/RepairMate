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

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 data URL
}
