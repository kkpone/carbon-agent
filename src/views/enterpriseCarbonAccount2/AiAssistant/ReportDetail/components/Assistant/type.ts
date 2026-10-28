enum MessageType {
  'question' = 'question',
  'answer' = 'answer',
}

export interface IMessage {
  id: string;
  content: string | React.ReactNode;
  time: string;
  type: MessageType;
  netError: boolean;
}
