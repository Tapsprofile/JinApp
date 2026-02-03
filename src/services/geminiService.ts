import { GoogleGenerativeAI, Part, GenerativeModel } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = (
  systemInstruction: string,
  enableSearch: boolean = false
): GenerativeModel => {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Call initializeGemini first.');
  }

  const tools = enableSearch
    ? [{ googleSearchRetrieval: {} }]
    : undefined;

  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction,
    tools,
  });
};

export const sendMessage = async (
  model: GenerativeModel,
  message: string,
  imageData?: { mimeType: string; data: string }
): Promise<string> => {
  try {
    const parts: (string | Part)[] = [message];

    // Support for Vision - inline image data
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    throw error;
  }
};

export const sendMessageStreaming = async (
  model: GenerativeModel,
  message: string,
  onChunk: (text: string) => void,
  imageData?: { mimeType: string; data: string }
): Promise<void> => {
  try {
    const parts: (string | Part)[] = [message];

    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      });
    }

    const result = await model.generateContentStream(parts);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText);
    }
  } catch (error) {
    console.error('Error in streaming message:', error);
    throw error;
  }
};
