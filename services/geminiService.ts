import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getComfortingResponse = async (ventText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User is venting: "${ventText}". 
      Provide a very short (max 20 words), warm, and philosophical comforting message in Chinese (Simplified) to help them let go. 
      Do not be preachy. Be like a wise friend or a fortune cookie.`,
    });
    return response.text || "深呼吸，让烦恼随风而去。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "烦恼已消散在虚空中。";
  }
};