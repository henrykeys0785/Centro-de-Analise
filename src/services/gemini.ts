import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES, CLASSIFICATION_MANUAL } from "../constants";
import { Sentiment } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function classifyArticle(title: string, content: string) {
  const ai = getAiClient();
  const prompt = `
    Classifique a seguinte matéria sobre a Vale de acordo com o manual fornecido.
    
    TÍTULO (PRIORIDADE): ${title}
    CONTEÚDO: ${content}

    MANUAL E REGRAS:
    ${CLASSIFICATION_MANUAL}

    REGRAS DE OURO:
    1. O FOCO é o TÍTULO. Se houver múltiplos assuntos, o foco principal do título dita a categoria.
    2. SENTIMENTO: Apenas "Positivo" ou "Negativo". NÃO use "Neutro".
    3. REJEIÇÃO: Marque "isRejected: true" se a matéria não tiver NADA a ver com a Vale ou as categorias do manual.
    4. REGRAS DE PERSONAGENS: Matérias sobre o Dino e Mariana entram em "Reparação Mariana – Relações legais" com sentimento "Negativo".

    CATEGORIAS DISPONÍVEIS:
    ${CATEGORIES.join(", ")}

    Retorne apenas um JSON válido no formato:
    {
      "category": "String da Categoria Exata",
      "sentiment": "Positivo" | "Negativo",
      "explanation": "Breve explicação da classificação baseada no manual",
      "isRejected": boolean
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: Object.values(Sentiment) },
            explanation: { type: Type.STRING },
            isRejected: { type: Type.BOOLEAN }
          },
          required: ["category", "sentiment", "explanation", "isRejected"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Classification Error:", error);
    throw error;
  }
}
