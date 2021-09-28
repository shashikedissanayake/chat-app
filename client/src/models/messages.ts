export interface Message {
    id: string;
    to: string;
    from: string;
    timestamp: string;
    message: string;
}

export type MessageComponent = Omit<Message, 'id'>;