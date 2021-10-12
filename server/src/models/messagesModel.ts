import { MessageStatus, MessageTypes } from '../constants/messageStatus';

export interface MessageRecord {
    PK: string;
    SK: string;
    id: string;
    to: string;
    from: string;
    timestamp: string;
    viewedTimestamp?: string;
    message: string;
    status: MessageStatus;
}

export type Message = Omit<MessageRecord, 'PK' | 'SK'> & {
    messageType: MessageTypes;
};

export type MessageDeliveyRecord = Omit<MessageRecord, 'PK' | 'SK' | 'message'> & {
    messageType: MessageTypes;
};

export interface GetMessagesByRoomIdResponse {
    messages: Message[];
    lastEvaluatedKey: string;
}
