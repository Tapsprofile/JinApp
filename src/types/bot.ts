export interface BotConfig {
  name: string;
  greeting: string;
  systemInstruction: string;
  color: string;
  enableSearch?: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
