export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Sutra {
  id: string;
  title: string;
  shortDescription: string;
  content: string; // The full text
}

export enum AppRoute {
  HOME = '/',
  MEDITATION = '/meditate',
  CHAT = '/chat',
  SUTRAS = '/sutras'
}

export interface DailyQuote {
  text: string;
  author: string;
  source?: string;
}