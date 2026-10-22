import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit to handle large base64 crop leaf or fruit images
app.use(express.json({ limit: "25mb" }));

// Helper to get or verify GoogleGenAI client
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to the Secrets panel in Settings.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Crop deficiency recognition endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, mimeType, cropHint } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Please provide an image for analysis." });
    }

    if (!mimeType) {
      return res.status(400).json({ error: "Please provide the image MIME type." });
    }

    // Try to initialize GenAI safely
    let ai;
    try {
      ai = getGenAIClient();
    } catch (apiKeyError: any) {
      return res.status(400).json({
        error: "API Key Error",
        details: apiKeyError.message,
        isSetupError: true
      });
    }

    // Prepare parts
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: image, // base64 string
      },
    };

    const textPart = {
      text: `Analyze this crop leaf or fruit image to detect plant nutrient deficiencies.
      
      Additional context provided by user:
      - Crop/plant hint: ${cropHint || "Not specified"}

      Perform an expert agricultural analysis. Determine:
      1. Whether this image is indeed a plant leaf or fruit. If not, flag it clearly.
      2. If it is a plant, identify the species/type of crop.
      3. Identify the primary nutrient deficiency (e.g., Nitrogen (N), Phosphorus (P), Potassium (K), Magnesium (Mg), Calcium (Ca), Iron (Fe), Zinc (Zn), Sulfur (S), Manganese (Mn), etc.) or if it is healthy or diseased.
      4. Estimate the confidence of your detection (0.0 to 1.0).
      5. Grade the severity of the deficiency (Healthy, Mild, Moderate, Severe).
      6. Note all visible visual symptoms.
      7. Provide a detailed scientific explanation of the deficiency, its role in plant physiology, its potential causes (e.g. soil pH, moisture), immediate cure/treatment steps, and long-term preventative measures.`
    };

    // Use robust retries and model fallbacks to handle temporary high demand / 503 errors
    let response;
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest"];
    let lastError: any = null;

    for (const model of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 2; // Try up to 2 times per model

      while (attempts < maxAttempts) {
        try {
          console.log(`Attempting analysis with model: ${model} (attempt ${attempts + 1})`);
          response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  detectedDeficiency: {
                    type: Type.STRING,
                    description: "The name of the nutrient deficiency detected (e.g., 'Nitrogen (N) Deficiency', 'Iron (Fe) Deficiency', 'Phosphorus (P) Deficiency', 'Potassium (K) Deficiency', 'Healthy (No Deficiency)', or 'Non-Plant Image' if the image is not a plant leaf or fruit)."
                  },
                  confidence: {
                    type: Type.NUMBER,
                    description: "Confidence level of the detection from 0.0 to 1.0"
                  },
                  cropType: {
                    type: Type.STRING,
                    description: "The detected type of crop or plant, e.g., 'Tomato', 'Corn', 'Apple', or 'Unknown'."
                  },
                  severity: {
                    type: Type.STRING,
                    description: "Severity level: 'Healthy', 'Mild', 'Moderate', 'Severe', or 'N/A' (if non-plant)."
                  },
                  symptoms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of visual symptoms observed in the leaf or fruit (e.g., interveinal chlorosis, purple margins, leaf curling)."
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A comprehensive agricultural explanation of what this deficiency is, its role in the plant, and how it impacts physiological health."
                  },
                  causes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Possible environmental or soil causes of the deficiency (e.g., high pH blocking iron uptake, sandy soils with low organic matter, excessive rain)."
                  },
                  recommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        action: { type: Type.STRING, description: "Name of the immediate remedy or action step (e.g., Apply Chelated Iron foliar spray, Adjust soil pH to 6.5)." },
                        details: { type: Type.STRING, description: "Detailed description of how to execute this cure/action." },
                        timeline: { type: Type.STRING, description: "When to carry this out (e.g., 'Immediate foliar application', 'Within 1 week', 'Post-harvest')." }
                      },
                      required: ["action", "details", "timeline"]
                    },
                    description: "Immediate cures and corrective treatment recommendations."
                  },
                  soilNutrientDetails: {
                    type: Type.OBJECT,
                    properties: {
                      deficientNutrient: { type: Type.STRING, description: "The primary nutrient that is deficient (e.g., 'Nitrogen (N)', 'Iron (Fe)', or 'None')." },
                      roleOfNutrient: { type: Type.STRING, description: "The major role of this nutrient in a healthy crop (e.g., 'Core component of chlorophyll, drives vegetative leaf growth')." }
                    },
                    required: ["deficientNutrient", "roleOfNutrient"]
                  },
                  preventativeMeasures: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Long-term farm/garden management strategies to prevent this deficiency in the future."
                  }
                },
                required: [
                  "detectedDeficiency",
                  "confidence",
                  "cropType",
                  "severity",
                  "symptoms",
                  "explanation",
                  "causes",
                  "recommendations",
                  "soilNutrientDetails",
                  "preventativeMeasures"
                ]
              }
            }
          });

          // Successfully obtained a response
          break;
        } catch (err: any) {
          lastError = err;
          attempts++;
          console.warn(`Error on ${model} (attempt ${attempts}): ${err.message || err}`);

          if (attempts < maxAttempts) {
            const delay = attempts * 1500;
            console.log(`Waiting ${delay}ms before retrying...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (response) {
        break;
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to analyze crop image using any of the configured models.");
    }

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Received an empty response from Gemini.");
    }

    const parsedResult = JSON.parse(textResult.trim());
    return res.json(parsedResult);

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return res.status(500).json({
      error: "Failed to analyze crop image",
      details: error.message || "Unknown error occurred during Gemini processing."
    });
  }
});

// 3. Static knowledge base of standard deficiencies
app.get("/api/knowledge-base", (req, res) => {
  const data = [
    {
      id: "nitrogen",
      nutrient: "Nitrogen (N)",
      role: "Essential for vegetative growth, protein synthesis, and chlorophyll production.",
      symptoms: ["Overall yellowing of older leaves first (chlorosis)", "Stunted growth", "Thin, spindly stems", "Pale green leaves"],
      causes: ["Sandy soils low in organic matter", "High rainfall causing leaching", "Cold soil temperatures limiting microbial activity"],
      treatments: ["Apply nitrogen-rich fertilizers (Urea, Ammonium Nitrate)", "Incorporate compost or manure", "Foliar spray with fish emulsion"],
      prevention: ["Grow nitrogen-fixing cover crops (legumes like clover/peas)", "Regular soil testing", "Maintain organic matter levels"]
    },
    {
      id: "phosphorus",
      nutrient: "Phosphorus (P)",
      role: "Key for energy transfer (ATP), root development, flowering, and seed production.",
      symptoms: ["Dark green or purplish tints on older leaf margins", "Delayed flowering or fruit ripening", "Poorly developed root system", "Stiff, upright leaves"],
      causes: ["Cold soils in early spring", "Soil pH below 5.5 or above 7.0 which locks phosphorus", "Highly clayey or compacted soils"],
      treatments: ["Incorporate Bone Meal or Rock Phosphate", "Apply balanced N-P-K fertilizer with high P", "Warm the soil using organic mulches"],
      prevention: ["Maintain soil pH between 6.0 and 7.0", "Avoid compaction with aerated soil beds", "Apply mycorrhizal fungi inoculants"]
    },
    {
      id: "potassium",
      nutrient: "Potassium (K)",
      role: "Regulates water movement (stomata operation), protein synthesis, and disease resistance.",
      symptoms: ["Scorching or browning of leaf margins (marginal necrosis)", "Weak, easily lodged stems", "Poor quality fruits/tubers with thin skins", "Chlorosis between veins near edges"],
      causes: ["Acidic soils", "Heavy potassium-leaching in sandy soils under high rainfall", "High calcium or magnesium competing with uptake"],
      treatments: ["Apply potassium sulfate, potassium chloride, or Greensand", "Spread wood ash around base (sparingly, increases pH)", "Apply kelp meal"],
      prevention: ["Apply potassium in split applications on sandy soils", "Maintain balanced calcium, magnesium, and potassium ratios in soil", "Incorporate organic compost"]
    },
    {
      id: "magnesium",
      nutrient: "Magnesium (Mg)",
      role: "Central atom of chlorophyll, acts as enzyme activator for carbohydrate transport.",
      symptoms: ["Interveinal chlorosis (yellowing between green veins) in older leaves", "Reddish-purple coloring on leaf margins", "Leaf curl or premature leaf drop"],
      causes: ["Sandy, acidic soils prone to leaching", "Excessive applications of potassium or calcium fertilizers", "Cool, wet soil conditions"],
      treatments: ["Drench or foliar spray with Epsom salts (Magnesium Sulfate)", "Apply dolomitic limestone to raise pH and add Mg"],
      prevention: ["Avoid over-fertilizing with potassium", "Regular applications of compost", "Apply dolomitic lime to acidic soils during bed prep"]
    },
    {
      id: "iron",
      nutrient: "Iron (Fe)",
      role: "Involved in chlorophyll synthesis, electron transfer in photosynthesis and respiration.",
      symptoms: ["Interveinal chlorosis in younger leaves first (creamy yellow while veins remain bright green)", "In severe cases, leaf turns ivory/white with necrosis"],
      causes: ["Alkaline soil pH (above 7.0) locking iron", "Wet, waterlogged, or poorly aerated soils", "High soil levels of phosphorus or copper"],
      treatments: ["Apply Chelated Iron as a foliar spray for immediate relief", "Apply sulfur to lower soil pH over time", "Improve soil drainage"],
      prevention: ["Keep soil pH below 6.5 for acid-loving crops", "Add organic compost to buffer pH", "Ensure aerated, well-draining soil"]
    },
    {
      id: "calcium",
      nutrient: "Calcium (Ca)",
      role: "Builds cell walls and membranes, vital for cell division and structural strength.",
      symptoms: ["Blossom-end rot in fruits (e.g. tomatoes, peppers having black leathery bottom)", "Tip burn on lettuce or cabbage", "Deformed, curled, or hook-shaped young leaves"],
      causes: ["Inconsistent watering limits calcium transport up the plant", "Acidic soils with low native calcium", "Excessive ammonium nitrogen"],
      treatments: ["Apply Calcium Chloride foliar spray", "Irrigate crops consistently to maintain steady calcium uptake", "Add gypsum (Calcium Sulfate) or lime"],
      prevention: ["Maintain stable soil moisture levels with drip irrigation", "Apply lime or gypsum prior to planting", "Avoid heavy nitrogen applications during fruit set"]
    }
  ];
  res.json(data);
});

// 4. Vite Dev/Prod handling
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
