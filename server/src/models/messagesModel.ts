import { MessageStatus, MessageTypes } from '../constants/messageStatus';

export interface Message {
    id: string;
    to: string;
    from: string;
    timestamp: string;
    message?: string;
    status: MessageStatus;
    messageType: MessageTypes;
}
