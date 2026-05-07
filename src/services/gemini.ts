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

export async function classifyArticle(title: string, content: string, url?: string) {
  // --- Passo a Passo de Rotina (O Dia) ---
  if (url && (url.includes("odia.ig.com.br") || url.includes("odia.com.br"))) {
    const isApprovedRegion = url.includes("/mangaratiba") || url.includes("/itaguai");
    const isDiscardedRegion = url.includes("/teresopolis") || !isApprovedRegion;
    
    if (isDiscardedRegion) {
      return {
        category: "Negócios - Outros",
        sentiment: "Negativo" as Sentiment,
        explanation: "Descartado automaticamente conforme rotina do jornal 'O Dia' (Região não prioritária).",
        isRejected: true
      };
    }
  }

  const ai = getAiClient();
  const prompt = `
    Classifique a seguinte matéria sobre a Vale de acordo com o manual fornecido.
    
    TÍTULO: ${title}
    CONTEÚDO: ${content}
    URL: ${url || "Não informada"}

    MANUAL E REGRAS:
    ${CLASSIFICATION_MANUAL}

    REGRAS DE OURO:
    1. CATEGORIA: Escolha EXATAMENTE uma das categorias da lista abaixo.
    2. SENTIMENTO: Apenas "Positivo" ou "Negativo".
    3. REJEIÇÃO: Marque "isRejected: true" se a matéria não for sobre a Vale ou não se encaixar em nenhuma regra do manual.
    4. FUNDAÇÃO VALE: Se envolver a Fundação Vale, classifique como "Sustentabilidade - Fundação Vale".

    CATEGORIAS DISPONÍVEIS:
    ${CATEGORIES.join(", ")}

    Retorne apenas um JSON válido no formato:
    {
      "category": "String da Categoria Exata",
      "sentiment": "Positivo" | "Negativo",
      "explanation": "Explicação baseada no manual",
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
