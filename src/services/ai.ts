import { AIChatInput } from "@/services/types";
import { v4 as uuidv4 } from 'uuid';
import { mockBackend } from "./mockBackend";

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

    return mockBackend.sendChat({ modelName: data.model_name, message: data.prompt });
}