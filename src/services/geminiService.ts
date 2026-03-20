import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface HardwareSpecs {
  cpuCores: number;
  ramGB: number;
  gpuInfo: string;
  gpuVRAM?: number;
  platform: string;
  isManual?: boolean;
}

export interface ModelRecommendation {
  name: string;
  size: string;
  description: string;
  reason: string;
  huggingFaceUrl: string;
}

export async function getModelRecommendations(specs: HardwareSpecs, useCase: string): Promise<ModelRecommendation[]> {
  const prompt = `
    Based on the following hardware specifications, recommend the top 5 most suitable Hugging Face LLM models specifically for the use case: "${useCase}".
    Consider models that can run locally using tools like Ollama, LM Studio, or llama.cpp.
    
    CRITICAL: Ensure the huggingFaceUrl is a valid, existing URL on Hugging Face. 
    For example, use "https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407" instead of non-existent versions.
    Double-check model paths (e.g., meta-llama/Llama-3.1-8B-Instruct).
    
    Hardware Specs:
    - CPU Cores: ${specs.cpuCores}
    - System RAM: ${specs.ramGB} GB
    - GPU Info: ${specs.gpuInfo}
    ${specs.gpuVRAM ? `- GPU VRAM: ${specs.gpuVRAM} GB` : ""}
    - Platform: ${specs.platform}
    - Detection Mode: ${specs.isManual ? "Manual Override" : "Automatic Probe"}
    
    The user is specifically interested in: ${useCase}.
    Provide recommendations that excel in this area while being compatible with the hardware.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            size: { type: Type.STRING, description: "e.g., 7B, 13B, 1.5B" },
            description: { type: Type.STRING },
            reason: { type: Type.STRING, description: "Why it fits this specific hardware" },
            huggingFaceUrl: { type: Type.STRING }
          },
          required: ["name", "size", "description", "reason", "huggingFaceUrl"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse recommendations", e);
    return [];
  }
}
