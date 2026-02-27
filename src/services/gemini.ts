import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateEncouragement() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate a short, warm, encouraging message for a 70-year-old man practicing cognitive exercises after a stroke. Keep it simple and positive.",
  });
  return response.text;
}

export async function generateNamingQuestion() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate a simple naming/word-finding question for a cognitive test. Provide a clear, simple description of a common object (e.g., 'A tool used to drive nails into wood') and 4 options, one being the correct answer. Return as JSON.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING }
        },
        required: ["description", "options", "correctAnswer"]
      }
    }
  });

  const text = response.text || "{}";
  const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanJson);
}
