import { MessageStatus, MessageTypes } from '../constants/messageStatus';

export interface Message {
    id: string;
    to: string;
    from: string;
    timestamp: string;
    message: string;
    status: MessageStatus;
}

export interface ServerEvents {
    id: string;
    to: string;
    from: string;
    timestamp: string;
    message?: string;
    status: MessageStatus;
    messageType: MessageTypes;
}

export interface MessagesSent {
    to: string;
    message: string;
    messageType: MessageTypes;
}

export interface StatusSent {
    to: string;
    id: string;
    status: MessageStatus;
    messageType: MessageTypes;
}

export type MessageComponent = Omit<Message, 'id'>;