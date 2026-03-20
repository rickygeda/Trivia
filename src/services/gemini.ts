import { GoogleGenAI, Type } from "@google/genai";
import { Question, Personality } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateTriviaQuestions(
  topic: string, 
  personality: Personality, 
  count: number = 5, 
  difficulty: string = 'Intermedio'
): Promise<Question[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera ${count} preguntas de trivia únicas, desafiantes e interesantes sobre ${topic}. 
    NIVEL DE DIFICULTAD: ${difficulty}. Es crucial que las preguntas se ajusten estrictamente a este nivel.
    Las preguntas deben estar en el estilo de ${personality.name} (${personality.description}).
    EVITA PREGUNTAS COMUNES O REPETITIVAS. Busca datos curiosos, oscuros o poco conocidos para asegurar máxima variedad.
    Incluye 4 opciones para cada pregunta y marca claramente la respuesta correcta.
    También proporciona una explicación breve y apropiada para la personalidad para la respuesta.
    TODO EL CONTENIDO DEBE ESTAR EN ESPAÑOL.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING, description: "The trivia question text" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Exactly 4 options"
            },
            correctAnswer: { type: Type.STRING, description: "The exact text of the correct option" },
            explanation: { type: Type.STRING, description: "A brief explanation in the host's personality" }
          },
          required: ["id", "text", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse trivia questions", e);
    return [];
  }
}
