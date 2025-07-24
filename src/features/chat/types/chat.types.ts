// Chat feature types
export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}