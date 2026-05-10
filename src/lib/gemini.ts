import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface AnalysisResult {
  locationPossible: string[];
  certainty: number;
  clues: {
    architectural: string;
    environmental: string;
    astronomical: string;
    insane: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export async function analyzeLocation(base64Image: string, insaneMode: boolean): Promise<AnalysisResult> {
  const prompt = `
    You are a professional GeoForensics expert. Analyze this image to pinpoint its exact location.
    
    1. Architectural Clues: Identify building style, window types, materials, or any localized infrastructure.
    2. Environmental Clues: Analyze vegetation, soil, road markings, signs, or weather indicators.
    3. Astronomical Clues: Analyze shadow length and direction to determine approximate sun position, time of day, and potential latitude/hemisphere. Look at cloud formations and wind direction (if visible through blowing objects).
    ${insaneMode ? "4. INSANE MODE: Perform intensive analysis of reflections in windows, sub-pixel textures, specific brick patterns, and subtle atmospheric distortions. Try to provide the most precise coordinates possible." : ""}

    Return the result in JSON format with the following structure:
    {
      "locationPossible": ["Probable City, Country", "Specific Area"],
      "certainty": number (0-100),
      "clues": {
        "architectural": "description",
        "environmental": "description",
        "astronomical": "description",
        "insane": "description (if insaneMode)"
      },
      "coordinates": { "lat": number, "lng": number } (Best guess if possible)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: "image/png" } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
