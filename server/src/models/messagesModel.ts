import { MessageStatus, MessageTypes } from '../constants/messageStatus';

export interface MessageRecord {
    PK: string;
    SK: string;
    id: string;
    to: string;
    from: string;
    timestamp: string;
    message: string;
    status: MessageStatus;
    messageType: MessageTypes;
}

export type Message = Omit<MessageRecord, 'PK' | 'SK'>;

export interface DeliveryRecord {
    PK: string;
    SK: string;
    id: string;
    to: string;
    from: string;
    timestamp: string;
    status: MessageStatus;
    messageType: MessageTypes;
}

export type MessageDeliveyRecord = Omit<DeliveryRecord, 'PK' | 'SK'>;

export interface GetMessagesByRoomIdResponse {
    messages: Message[];
    lastKey: string;
}
