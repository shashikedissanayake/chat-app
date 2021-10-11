import { inject, injectable } from 'inversify';
import moment = require('moment');
import { v4 as uuidv4 } from 'uuid';
import { MessageStatus, MessageTypes } from '../constants/messageStatus';
import { DBPrefixes, TableTypes } from '../constants/tableNames';
import { DatabaseAdapter } from '../dependency/database/databaseAdapter';
import { DynamoDbAdapterImpl } from '../dependency/database/dynamodb/dynamoDbAdapterImpl';
import { Message, MessageDeliveyRecord, MessageRecord } from '../models/messagesModel';

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
        message: string,
        messageType: MessageTypes,
    ): Promise<Message> {
        const timestamp = moment().utc().format();

        try {
            const messageId = uuidv4();
            const messageRecord: MessageRecord = {
                PK: `${DBPrefixes.ROOMS}#${roomId}`,
                SK: `${DBPrefixes.MESSAGES}#${timestamp}#${messageId}`,
                id: messageId,
                from,
                to,
                timestamp,
                status: MessageStatus.SENT,
                message,
            };

            await this.db.createItem(TableTypes.CHAT_TABLE, messageRecord);
            return Promise.resolve({
                id: messageRecord.id,
                from: messageRecord.from,
                to: messageRecord.to,
                timestamp: messageRecord.timestamp,
                status: messageRecord.status,
                message: messageRecord.message,
                messageType,
            } as Message);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async changeDelivaryStatusByMessageId(
        roomId: string,
        to: string,
        from: string,
        timestamp: string,
        messageId: string,
        status: MessageStatus,
        messageType: MessageTypes,
    ): Promise<MessageDeliveyRecord> {
        const viewedTimestamp = moment().utc().format();

        try {
            const message: MessageRecord = await this.db.getItem(TableTypes.CHAT_TABLE, {
                PK: `${DBPrefixes.ROOMS}#${roomId}`,
                SK: `${DBPrefixes.MESSAGES}#${timestamp}#${messageId}`,
            });

            if (!message) {
                return Promise.reject(new Error('Not found'));
            }
            if (message.to !== to) {
                return Promise.reject(new Error('Wrong operation'));
            }

            await this.db.updateItem(
                TableTypes.CHAT_TABLE,
                {
                    PK: `${DBPrefixes.ROOMS}#${roomId}`,
                    SK: `${DBPrefixes.MESSAGES}#${timestamp}#${messageId}`,
                },
                { viewedTimestamp, status },
            );

            return Promise.resolve({
                from,
                to,
                id: messageId,
                status,
                timestamp,
                viewedTimestamp,
                messageType,
            } as MessageDeliveyRecord);
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
