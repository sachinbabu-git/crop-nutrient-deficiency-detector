export interface DeficiencyKnowledge {
  id: string;
  nutrient: string;
  role: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  prevention: string[];
}

export interface Recommendation {
  action: string;
  details: string;
  timeline: string;
}

export interface SoilNutrientDetails {
  deficientNutrient: string;
  roleOfNutrient: string;
}

export interface DiagnosticResult {
  detectedDeficiency: string;
  confidence: number;
  cropType: string;
  severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'N/A' | string;
  symptoms: string[];
  explanation: string;
  causes: string[];
  recommendations: Recommendation[];
  soilNutrientDetails: SoilNutrientDetails;
  preventativeMeasures: string[];
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  image: string; // Base64 or local blob url
  cropHint: string;
  result: DiagnosticResult;
}
