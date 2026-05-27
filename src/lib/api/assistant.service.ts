import { axiosInstance } from './axios';

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatPayload {
  message: string;
  history?: ChatHistoryItem[];
  current_page?: string;
  locale?: string;
}

export const assistantService = {
  async chat(payload: ChatPayload): Promise<string> {
    const { data } = await axiosInstance.post<{ reply: string }>('/assistant/chat', payload);
    return data.reply;
  },
};
