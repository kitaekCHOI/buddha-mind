import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the API client
const apiKey = process.env.API_KEY || '';

if (!apiKey) {
  console.warn("Gemini API Key is missing. Chat and quotes will use fallback responses.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy' });

const SYSTEM_INSTRUCTION = `
당신은 지혜롭고 자비로운 불교 스님(법사)입니다. 
사용자의 고민을 경청하고, 초기 불교 경전이나 대승 불교의 가르침, 선(Zen) 이야기를 바탕으로 위로와 조언을 해주세요.
말투는 항상 공손하고 온화한 '하십시오'체를 사용하세요 (예: "그렇습니다, 불자님.", "마음을 편안히 하십시오.").
답변은 너무 길지 않게, 핵심을 꿰뚫는 통찰을 제공하되 따뜻함을 잃지 마세요.
가능하다면 관련된 경전 구절을 인용하여 깊이를 더해주세요.
`;

export const createMonkChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topK: 40,
    },
  });
};

/**
 * Sends a message to the monk and streams the response back.
 * Returns an AsyncGenerator that yields text chunks.
 */
export const sendMessageStream = async function* (chat: Chat, message: string): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    // Simulate streaming for fallback message
    const fallbackMsg = "현재 마음의 연결(API Key)이 원활하지 않습니다. 설정에서 API 키를 확인해주세요.";
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    await delay(500);
    const chunkSize = 5;
    for (let i = 0; i < fallbackMsg.length; i += chunkSize) {
      yield fallbackMsg.slice(i, i + chunkSize);
      await delay(50);
    }
    return;
  }

  try {
    const streamResult = await chat.sendMessageStream({ message });
    
    for await (const chunk of streamResult) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    yield "지금은 깊은 명상 중이라 답변을 드리기 어렵습니다. 잠시 후 다시 시도해 주세요.";
  }
};

export const generateDailyQuote = async (): Promise<string> => {
  if (!apiKey) {
    return '"마음이 모든 것이다. 당신이 생각하는 대로 된다." - 붓다';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: '불교 경전이나 큰스님들의 말씀 중에서 하루를 시작하기 좋은 짧고 감동적인 명언 하나를 추천해줘. 출처도 함께 명시해줘. 형식: "명언" - 출처',
    });
    return response.text || '"마음이 모든 것이다. 당신이 생각하는 대로 된다." - 붓다';
  } catch (error) {
    console.error("Daily Quote Error:", error);
    return '"오늘 하루도 자비로운 마음으로 살아가십시오." - 마음의 등불';
  }
};