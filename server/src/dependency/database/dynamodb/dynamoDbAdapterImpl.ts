/* eslint-disable @typescript-eslint/no-unused-vars */
import AWS = require('aws-sdk');
import { injectable, inject } from 'inversify';
import {
    PutItemInput,
    GetItemInput,
    UpdateItemInput,
    DeleteItemInput,
    ScanInput,
    TransactWriteItemsInput,
    TransactGetItemsInput,
    ScanOutput,
    Key,
    QueryInput,
    BatchGetItemInput,
} from 'aws-sdk/clients/dynamodb';
import { DatabaseAdapter } from '../databaseAdapter';
import { DynamoDbQueryGenerator } from './dynamoDbQueryGenerator';
import { TableTypes } from '../../../constants/tableNames';
import {
    DbParam,
    GetAllOptions,
    KeyTypes,
    GetOptions,
    KeyConditionParams,
    KeyConditionParamsWithSortKey,
} from '../../../models/dbParam';
import { Logger } from '../../logger';

AWS.config.update({
    region: 'us-east-1',
});

const docClient = new AWS.DynamoDB.DocumentClient();
// Refer to conditional updates for https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Syntax
@injectable()
export class DynamoDbAdapterImpl implements DatabaseAdapter {
    private queryGenerator: DynamoDbQueryGenerator;

    constructor(@inject(DynamoDbQueryGenerator) queryGenerator: DynamoDbQueryGenerator) {
        this.queryGenerator = queryGenerator;
    }

    public async createItem(tableName: TableTypes, param: any): Promise<any> {
        const createQueryParam: PutItemInput = this.queryGenerator.createItem(tableName, param);

        return new Promise<any>((resolve, reject) => {
            docClient.put(createQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'createItem', err);
                    // console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'createItem', createQueryParam.Item);
                    // console.log('Added item:', JSON.stringify(createQueryParam.Item, null, 2));
                    resolve(createQueryParam.Item);
                }
            });
        });
    }

    public async putItem(tableName: TableTypes, param: any): Promise<any> {
        const createQueryParam: PutItemInput = this.queryGenerator.putItem(tableName, param);

        return new Promise<any>((resolve, reject) => {
            docClient.put(createQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'putItem', err);
                    // console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'putItem', createQueryParam.Item);
                    // console.log('Added item:', JSON.stringify(createQueryParam.Item, null, 2));
                    resolve(createQueryParam.Item);
                }
            });
        });
    }

    public async getBatchItem(tableName: TableTypes[], value: any): Promise<any> {
        const getBatchParam: BatchGetItemInput = this.queryGenerator.getBatchByKeys(tableName, value);
        return new Promise<any>((resolve, reject) => {
            docClient.batchGet(getBatchParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getBatchItem', err);
                    // console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getBatchItem', data);
                    // console.log('Get Item succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Responses);
                }
            });
        });
    }

    public async getItem(tableName: TableTypes, value: any): Promise<any> {
        const getQueryParam: GetItemInput = this.queryGenerator.getItemByKey(tableName, value);

        return new Promise<any>((resolve, reject) => {
            docClient.get(getQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getItem', err);
                    // console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getItem', data);
                    // console.log('Get Item succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Item);
                }
            });
        });
    }

    public async updateItem(
        tableName: TableTypes,
        key: any,
        values: any,
        condition?: { key: string; value: any; operation: string },
    ): Promise<any> {
        const updateQueryParam: UpdateItemInput =
            condition !== undefined
                ? this.queryGenerator.updateItemLatest(tableName, key, values, condition)
                : this.queryGenerator.updateItem(tableName, key, values);

        return new Promise<any>((resolve, reject) => {
            docClient.update(updateQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'updateItem', err);
                    // console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'updateItem', data);
                    // console.log('Update Item succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Attributes);
                }
            });
        });
    }

    public async deleteItem(tableName: TableTypes, param: any): Promise<void> {
        const deleteQueryParam: DeleteItemInput = this.queryGenerator.deleteItem(tableName, param);

        return new Promise<void>((resolve, reject) => {
            docClient.delete(deleteQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'deleteItem', err);
                    // console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'deleteItem', data);
                    // console.log('Delete Item succeeded:', JSON.stringify(data, null, 2));
                    resolve();
                }
            });
        });
    }

    public async getAllItems(tableName: TableTypes): Promise<any> {
        const getAllItemsQueryParam: ScanInput = this.queryGenerator.getAllItems(tableName);

        return new Promise<any>((resolve, reject) => {
            docClient.scan(getAllItemsQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getAllItems', err);
                    // console.error('Unable to get all items. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getAllItems', data);
                    // console.log('Get all Items succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Items);
                }
            });
        });
    }

    public async getItemsByIndexWithFilter(
        tableName: TableTypes,
        key: KeyConditionParams,
        options?: GetOptions,
    ): Promise<any> {
        const getAllItemsQueryParam: QueryInput = this.queryGenerator.getAllItemByIndexWithFilter(
            tableName,
            key,
            options,
        );
        return new Promise<any>((resolve, reject) => {
            docClient.query(getAllItemsQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getItemsByIndexWithFilter', err);
                    // console.error('Unable to get all items. Error:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getItemsByIndexWithFilter', data);
                    // console.log('Get all Items succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Items);
                }
            });
        });
    }

    public async getItemsByIndexWithSortKey(
        tableName: TableTypes,
        key: KeyConditionParamsWithSortKey,
        options?: GetOptions,
    ): Promise<any> {
        const getAllItemsQueryParam: QueryInput = this.queryGenerator.getAllItemByIndexWithSortKey(
            tableName,
            key,
            options,
        );
        return new Promise<any>((resolve, reject) => {
            docClient.query(getAllItemsQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getItemsByIndexWithSortKey', err);
                    // console.error('Unable to get all items. Error:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getItemsByIndexWithSortKey', data);
                    // console.log('Get all Items succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Items);
                }
            });
        });
    }

    public async get(tableName: TableTypes, hashKey: KeyTypes, options?: GetAllOptions): Promise<any> {
        const getAllItemsQueryParam: QueryInput = this.queryGenerator.getAllItemByKey(tableName, hashKey, options);
        return new Promise<any>((resolve, reject) => {
            docClient.query(getAllItemsQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'get', err);
                    // console.error('Unable to get all items. Error:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'get', data);
                    // console.log('Get all Items succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Items);
                }
            });
        });
    }

    public async transactWriteItems(transactItems: DbParam[]): Promise<any> {
        const transactWriteItemsQueryParam: TransactWriteItemsInput =
            this.queryGenerator.transactWriteItems(transactItems);

        return new Promise<any>((resolve, reject) => {
            docClient.transactWrite(transactWriteItemsQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'transactWriteItems', err);
                    // console.error('Transaction Failed. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'transactWriteItems', data);
                    // console.log('Transaction succeeded:', JSON.stringify(data, null, 2));
                    resolve(data);
                }
            });
        });
    }

    public async transactGetItems(transactItems: DbParam[]): Promise<any> {
        const transactGetItemsQueryParam: TransactGetItemsInput = this.queryGenerator.transactGetItems(transactItems);

        return new Promise<any>((resolve, reject) => {
            docClient.transactGet(transactGetItemsQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'transactGetItems', err);
                    // console.error('Transaction Failed. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'transactGetItems', data);
                    // console.log('Transaction succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Responses);
                }
            });
        });
    }

    public async getItemByPaginationWithFilter(
        tableName: TableTypes,
        itemsPerPage: number,
        options?: GetOptions,
    ): Promise<any> {
        const searchQueryParam: ScanInput = this.queryGenerator.getItemByPaginationWithFilter(
            tableName,
            itemsPerPage,
            options,
        );

        return new Promise<any>((resolve, reject) => {
            docClient.scan(searchQueryParam, (err, data: ScanOutput) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getItemByPaginationWithFilter', err);
                    // console.error('Transaction Failed. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getItemByPaginationWithFilter', data);
                    // console.log('Transaction succeeded:', JSON.stringify(data, null, 2));
                    resolve({ data: data.Items, lastEvaluatedKey: data.LastEvaluatedKey });
                }
            });
        });
    }

    public async getItemByPagination(
        tableName: TableTypes,
        itemsPerPage: number,
        lastEvaluatedKey?: Key,
    ): Promise<any> {
        let searchQueryParam: ScanInput;
        if (lastEvaluatedKey) {
            searchQueryParam = this.queryGenerator.getItemByPagination(tableName, itemsPerPage, lastEvaluatedKey);
        } else {
            searchQueryParam = this.queryGenerator.getItemByPagination(tableName, itemsPerPage);
        }

        return new Promise<any>((resolve, reject) => {
            docClient.scan(searchQueryParam, (err, data: ScanOutput) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getItemByPagination', err);
                    // console.error('Transaction Failed. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getItemByPagination', data);
                    // console.log('Transaction succeeded:', JSON.stringify(data, null, 2));
                    resolve({ data: data.Items, lastEvaluatedKey: data.LastEvaluatedKey });
                }
            });
        });
    }

    public async getId(tableName: TableTypes): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const updateQueryParam: UpdateItemInput = this.queryGenerator.getId(tableName);

            docClient.update(updateQueryParam, (err, data) => {
                if (err) {
                    Logger.error(DynamoDbAdapterImpl.name, 'getId', err);
                    // console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    Logger.debug(DynamoDbAdapterImpl.name, 'getId', data);
                    // console.log('Update Item succeeded:', JSON.stringify(data, null, 2));
                    resolve(data.Attributes);
                }
            });
        });
    }
}
