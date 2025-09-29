import { requestWithRefresh } from "@/api/client";
import { AIChatInput } from "@/services/types";
import { v4 as uuidv4 } from 'uuid';

const UUIDChat = uuidv4();

type ChatAIResponse = {
  text: string;
};

export async function sendChatAI(input: AIChatInput): Promise<ChatAIResponse> {
    const data = {
        chat_id: UUIDChat,
        model_name: input.modelName || 'Gemma Model 2 (9B IT)',
        prompt: input.message
    }

    const res = await requestWithRefresh<ChatAIResponse>({
        method: 'POST',
        url: `/api/chat`,
        data,
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
}