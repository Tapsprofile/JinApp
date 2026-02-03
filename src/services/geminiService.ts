import { GoogleGenAI } from "@google/genai";

export interface InlineImage {
  mimeType: string;
  data: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  images?: InlineImage[];
}

export interface GeminiRequest {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
  messages: ChatMessage[];
  enableSearch?: boolean;
}

// Build Gemini parts with optional inlineData for vision.
const buildParts = (message: ChatMessage) => {
  const parts: Array<{ text?: string; inlineData?: InlineImage }> = [];

  if (message.text?.trim()) {
    parts.push({ text: message.text });
  }

  (message.images ?? []).forEach((image) => {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  });

  return parts;
};

// Normalize the SDK response into a plain text string.
const extractResponseText = async (result: unknown): Promise<string> => {
  const typedResult = result as {
    text?: string;
    response?: {
      text?: string | (() => string | Promise<string>);
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
  };

  if (typeof typedResult?.text === "string") {
    return typedResult.text;
  }

  const response = typedResult?.response;
  if (response?.text) {
    const value =
      typeof response.text === "function" ? response.text() : response.text;
    return typeof value === "string" ? value : await value;
  }

  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? "").join("");
};

// Service-layer entry point: supports dynamic tools and images.
export const generateGeminiResponse = async ({
  apiKey,
  model = "gemini-2.0-flash",
  systemInstruction,
  messages,
  enableSearch = false,
}: GeminiRequest): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  const contents = messages
    .map((message) => ({
      role: message.role,
      parts: buildParts(message),
    }))
    .filter((content) => content.parts.length > 0);

  // Only include Google Search when explicitly enabled.
  const tools = enableSearch ? [{ googleSearch: {} }] : undefined;

  const result = await ai.models.generateContent({
    model,
    contents,
    ...(systemInstruction ? { systemInstruction } : {}),
    ...(tools ? { tools } : {}),
  });

  const text = await extractResponseText(result);
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  return text.trim();
};
