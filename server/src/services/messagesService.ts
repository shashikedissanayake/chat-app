import { inject, injectable } from 'inversify';
import moment = require('moment');
import { v4 as uuidv4 } from 'uuid';
import { MessageStatus, MessageTypes } from '../constants/messageStatus';
import { DBPrefixes, TableTypes } from '../constants/tableNames';
import { DatabaseAdapter } from '../dependency/database/databaseAdapter';
import { DynamoDbAdapterImpl } from '../dependency/database/dynamodb/dynamoDbAdapterImpl';
import {
    DeliveryRecord,
    GetMessagesByRoomIdResponse,
    Message,
    MessageDeliveyRecord,
    MessageRecord,
} from '../models/messagesModel';

@injectable()
export class MessagesService {
    private readonly db: DatabaseAdapter;
    // PK: room#{room_id}
    // SK: message#{timestamp}#{message_id}

    constructor(@inject(DynamoDbAdapterImpl) db: DatabaseAdapter) {
        this.db = db;
    }

    public async storeMessage(
        roomId: string,
        to: string,
        from: string,
        type: MessageTypes,
        message?: string,
        id?: string,
        status?: MessageStatus,
    ): Promise<Message | MessageDeliveyRecord> {
        const timestamp = moment().utc().format();

        try {
            switch (type) {
                case MessageTypes.CHAT_MESSAGES: {
                    const messageId = uuidv4();
                    const messageRecord: MessageRecord = {
                        PK: `${DBPrefixes.ROOMS}#${roomId}`,
                        SK: `${DBPrefixes.MESSAGES}#${timestamp}#${messageId}`,
                        id: messageId,
                        from,
                        to,
                        timestamp,
                        status: MessageStatus.SENT,
                        messageType: type,
                        message,
                    };

                    await this.db.createItem(TableTypes.CHAT_TABLE, messageRecord);
                    return Promise.resolve({
                        id: messageRecord.id,
                        from: messageRecord.from,
                        to: messageRecord.to,
                        timestamp: messageRecord.timestamp,
                        status: messageRecord.status,
                        messageType: messageRecord.messageType,
                        message: messageRecord.message,
                    } as Message);
                }
                case MessageTypes.STATUS_UPDATES: {
                    const deliveryRecord: DeliveryRecord = {
                        PK: `${DBPrefixes.ROOMS}#${roomId}`,
                        SK: `${DBPrefixes.SEEN}#${id}#${from}`,
                        id,
                        from,
                        to,
                        timestamp,
                        status,
                        messageType: type,
                    };

                    await this.db.createItem(TableTypes.CHAT_TABLE, deliveryRecord);
                    return Promise.resolve({
                        id: deliveryRecord.id,
                        from: deliveryRecord.from,
                        to: deliveryRecord.to,
                        timestamp: deliveryRecord.timestamp,
                        status: deliveryRecord.status,
                        messageType: deliveryRecord.messageType,
                    } as MessageDeliveyRecord);
                }
                default: {
                    console.log('Unknown message type');
                    return Promise.reject(new Error('Unknown message type'));
                }
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // public async getMessagesByRoomId(roomId: string, lastKey?: string): Promise<GetMessagesByRoomIdResponse> {
    //     try {
    //         const messageList: MessageRecord[] = await this.db.getItemsByIndexWithSortKey(
    //             TableTypes.CHAT_TABLE,
    //             {
    //                 keyCondition: `PK = :key_0 AND begins_with(SK, :key_1)`,
    //                 keyValue: [`${DBPrefixes.ROOMS}#${roomId}`, DBPrefixes.MESSAGES],
    //             },
    //             { startKey: lastKey, sort: 'descending', limit: 10 },
    //         );

    //         if (!messageList || messageList?.length < 1) {
    //             return Promise.resolve({ messages: [], lastKey: undefined } as GetMessagesByRoomIdResponse);
    //         }

    //         const batchGetItemInput = {};
    //         batchGetItemInput[TableTypes.CHAT_TABLE] = messageList.map((message) => {
    //             return {
    //                 keyCondition: `PK = :key_0 AND begins_with(SK, :key_1)`,
    //                 keyValue: [`${message.PK}`, `${DBPrefixes.SEEN}#${message.id}`],
    //             };
    //         });
    //         console.log(batchGetItemInput);
    //         const viewedList = await this.db.getBatchItem([TableTypes.CHAT_TABLE], batchGetItemInput);
    //         console.log(viewedList)
    //         return Promise.resolve({ messages: [], lastKey: undefined });
    //     } catch (error) {
    //         return Promise.reject(error);
    //     }
    // }
}
