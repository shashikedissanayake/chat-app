import { injectable } from 'inversify';
import { TransactWriteItemsInput, TransactGetItemsInput, Key } from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';
import { TableTypes } from '../../../constants/tableNames';
import {
    DbParam,
    GetAllOptions,
    KeyTypes,
    GetOptions,
    KeyConditionParams,
    KeyConditionParamsWithSortKey,
} from '../../../models/dbParam';
import { DbOperations } from '../../../constants/dbOperations';
import { Logger } from '../../logger';

@injectable()
export class DynamoDbQueryGenerator {
    public createItem(tableName: TableTypes, item: any): AWS.DynamoDB.DocumentClient.PutItemInput {
        return {
            TableName: tableName.toString(),
            Item: item,
            ConditionExpression: 'attribute_not_exists(id)',
        };
    }

    public putItem(tableName: TableTypes, item: any): AWS.DynamoDB.DocumentClient.PutItemInput {
        return {
            TableName: tableName.toString(),
            Item: item,
        };
    }

    public getBatchByKeys(tableNames: TableTypes[], value: any): AWS.DynamoDB.DocumentClient.BatchGetItemInput {
        const requestItems = {};
        for (const tableName of tableNames) {
            requestItems[tableName.toString()] = {
                Keys: value[tableName.toString()],
            };
        }
        return {
            RequestItems: requestItems,
        };
    }

    public getItemByKey(tableName: TableTypes, value: any): AWS.DynamoDB.DocumentClient.GetItemInput {
        return {
            TableName: tableName.toString(),
            Key: value,
        };
    }

    public getAllItemByIndexWithFilter(
        tableName: TableTypes,
        key: KeyConditionParams,
        options?: GetOptions,
    ): AWS.DynamoDB.DocumentClient.QueryInput {
        const filterParams = {};
        if (options?.filterValue) {
            for (let i = 0; i < options.filterValue.length; i += 1) {
                filterParams[`:param_${i}`] = options.filterValue[i];
            }
        }

        const expressionAttributes = {
            ':key': key.keyValue,
            ...filterParams,
        };

        const param: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: tableName,
            ScanIndexForward: options?.sort === 'ascending',
            ProjectionExpression: options?.attributes,
            IndexName: options?.index,
            KeyConditionExpression: `${key.keyCondition} :key`,
            ExpressionAttributeValues: expressionAttributes,
            ExclusiveStartKey: options?.startKey,
        };

        if (options?.filterExpression && options?.filterValue) {
            param.FilterExpression = options.filterExpression;
        }

        if (options?.limit) {
            param.Limit = options.limit;
        }
        return param;
    }

    public getAllItemByIndexWithSortKey(
        tableName: TableTypes,
        key: KeyConditionParamsWithSortKey,
        options?: GetOptions,
    ): AWS.DynamoDB.DocumentClient.QueryInput {
        const filterParams = {};
        if (options?.filterValue) {
            for (let i = 0; i < options.filterValue.length; i += 1) {
                filterParams[`:param_${i}`] = options.filterValue[i];
            }
        }

        for (let i = 0; i < key.keyValue.length; i += 1) {
            filterParams[`:key_${i}`] = key.keyValue[i];
        }

        const expressionAttributes = {
            ...filterParams,
        };

        const param: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: tableName,
            ScanIndexForward: options?.sort === 'ascending',
            ProjectionExpression: options?.attributes,
            IndexName: options?.index,
            KeyConditionExpression: key.keyCondition,
            ExpressionAttributeValues: expressionAttributes,
            ExclusiveStartKey: options?.startKey,
        };

        if (options?.filterExpression && options?.filterValue) {
            param.FilterExpression = options.filterExpression;
        }

        if (options?.limit) {
            param.Limit = options.limit;
        }
        return param;
    }

    public getAllItemByKey(
        tableName: TableTypes,
        hashKey: KeyTypes,
        options?: GetAllOptions,
    ): AWS.DynamoDB.DocumentClient.QueryInput {
        if (Object.keys(hashKey).length !== 1) {
            throw Error('Invalid HASH key');
        }
        const condition = {};
        const hashKeyName = Object.keys(hashKey)[0];
        condition[hashKeyName] = {
            ComparisonOperator: 'EQ',
            AttributeValueList: [hashKey[hashKeyName]],
        };

        const param: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: tableName,
            KeyConditions: condition,
            ScanIndexForward: options?.sort === 'ascending',
            AttributesToGet: options?.attributes,
            IndexName: options?.index,
        };

        if (options?.startKey) {
            if (Object.keys(options.startKey).length !== 1) {
                throw Error('Invalid RANGE key');
            }
            const rangeKeyName = Object.keys(options.startKey)[0];
            const startKey = {};
            startKey[hashKeyName] = hashKey[hashKeyName];
            startKey[rangeKeyName] = options.startKey[rangeKeyName];
            param.ExclusiveStartKey = startKey;
        }

        if (options?.limit) {
            param.Limit = options.limit;
        }
        return param;
    }

    public updateItem(tableName: TableTypes, key: any, values: any): AWS.DynamoDB.DocumentClient.UpdateItemInput {
        const { updateQuery, expressionAttributeValues, expressionAttributeNames } =
            this.generateUpdateExpression(values);
        return {
            TableName: tableName.toString(),
            Key: key,
            UpdateExpression: updateQuery,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'UPDATED_NEW',
        };
    }

    public updateItemLatest(
        tableName: TableTypes,
        key: any,
        values: any,
        conditions?: any,
    ): AWS.DynamoDB.DocumentClient.UpdateItemInput {
        const { updateExpression, conditionExpression, expressionAttributeValues, expressionAttributeNames } =
            this.generateUpdateExpressionModified(values, conditions);
        const params =
            conditionExpression !== ''
                ? {
                      TableName: tableName.toString(),
                      Key: key,
                      UpdateExpression: updateExpression,
                      ConditionExpression: conditionExpression,
                      ExpressionAttributeValues: expressionAttributeValues,
                      ExpressionAttributeNames: expressionAttributeNames,
                      ReturnValues: 'UPDATED_NEW',
                  }
                : {
                      TableName: tableName.toString(),
                      Key: key,
                      UpdateExpression: updateExpression,
                      ExpressionAttributeValues: expressionAttributeValues,
                      ExpressionAttributeNames: expressionAttributeNames,
                      ReturnValues: 'UPDATED_NEW',
                  };
        Logger.debug(DynamoDbQueryGenerator.name, 'updateItemLatest', params);
        return params;
    }

    public deleteItem(
        tableName: TableTypes,
        value: any,
        conditions?: any,
    ): AWS.DynamoDB.DocumentClient.DeleteItemInput {
        return conditions !== undefined
            ? {
                  TableName: tableName.toString(),
                  Key: value,
                  ConditionExpression: `#cod_name ${conditions.operation} :cod_value`,
                  ExpressionAttributeNames: { [`#cod_name`]: conditions.key },
                  ExpressionAttributeValues: { [`:cod_value`]: conditions.value },
              }
            : {
                  TableName: tableName.toString(),
                  Key: value,
              };
    }

    public getAllItems(tableName: TableTypes): AWS.DynamoDB.DocumentClient.ScanInput {
        return {
            TableName: tableName.toString(),
        };
    }

    public getItemByPaginationWithFilter(
        tableName: TableTypes,
        itemsPerPage: number,
        options: GetOptions,
    ): AWS.DynamoDB.DocumentClient.QueryInput {
        const filterParams = {};
        if (options?.filterValue) {
            for (let i = 0; i < options.filterValue.length; i += 1) {
                filterParams[`:param_${i}`] = options.filterValue[i];
            }
        }

        const params: AWS.DynamoDB.DocumentClient.ScanInput = {
            TableName: tableName.toString(),
            Limit: itemsPerPage,
        };

        if (options.startKey) {
            // set ExclusiveStartKey only when server get complete lastEvaluatedKey as sent by it
            params.ExclusiveStartKey = options.startKey;
        }

        if (options.filterExpression) {
            params.FilterExpression = options.filterExpression;
            params.ExpressionAttributeValues = filterParams;
        }

        if (options.attributes) {
            params.ProjectionExpression = options.attributes;
        }

        return params;
    }

    public getItemByPagination(
        tableName: TableTypes,
        itemsPerPage: number,
        lastEvaluatedKey?: Key,
    ): AWS.DynamoDB.DocumentClient.QueryInput {
        const params: AWS.DynamoDB.DocumentClient.ScanInput = {
            TableName: tableName.toString(),
            Limit: itemsPerPage,
        };

        if (lastEvaluatedKey) {
            // set ExclusiveStartKey only when server get complete lastEvaluatedKey as sent by it
            params.ExclusiveStartKey = lastEvaluatedKey;
        }

        return params;
    }

    public transactWriteItems(transactItems: DbParam[]): TransactWriteItemsInput {
        const paramArray = [];

        transactItems.forEach((item) => {
            const { tableName, values, key, dbOperation, conditions } = item;
            switch (dbOperation) {
                case DbOperations.PUT:
                    paramArray.push({
                        Put: this.createItem(tableName, values),
                    });
                    break;

                case DbOperations.UPDATE:
                    paramArray.push({
                        Update: this.updateItem(tableName, key, values),
                    });
                    break;

                case DbOperations.DELETE:
                    paramArray.push({
                        Delete: this.deleteItem(tableName, values, conditions),
                    });
                    break;
                case DbOperations.UPDATE_EXPRESSION:
                    paramArray.push({
                        Update: this.updateItemLatest(tableName, key, values, conditions),
                    });
                    break;
                default:
                    throw new Error('Unknown');
            }
        });

        return { TransactItems: paramArray };
    }

    public transactGetItems(transactItems: DbParam[]): TransactGetItemsInput {
        const paramArray = [];

        transactItems.forEach((item) => {
            const { tableName, values } = item;
            paramArray.push({
                Get: this.getItemByKey(tableName, values),
            });
        });

        return { TransactItems: paramArray };
    }

    public getId(tableName: TableTypes): AWS.DynamoDB.DocumentClient.UpdateItemInput {
        return {
            TableName: 'AtomicCounter',
            Key: {
                tableName: tableName.toString(),
            },
            UpdateExpression: 'SET id = id + :inc',
            ExpressionAttributeValues: {
                ':inc': 1,
            },
            ReturnValues: 'UPDATED_NEW',
        };
    }

    private generateUpdateExpression(values: any) {
        let updateQuery = 'set ';
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};
        let i = 0;
        for (const key in values) {
            if (key) {
                if (key.split('.').length > 1) {
                    const keys = key.split('.');
                    let finalKey = '';
                    for (let j = 0; j < keys.length; j += 1) {
                        expressionAttributeNames[`#key${i}_${j}`] = keys[j];
                        finalKey += `${j === 0 ? '' : '.'}#key${i}_${j}`;
                    }
                    expressionAttributeValues[`:val${i}`] = values[key];
                    updateQuery = `${updateQuery} ${i === 0 ? '' : ','}${finalKey} = :val${i}`;
                } else {
                    expressionAttributeNames[`#key${i}`] = key;
                    expressionAttributeValues[`:val${i}`] = values[key];
                    updateQuery = `${updateQuery} ${i === 0 ? '' : ','}#key${i} = :val${i}`;
                }
                i += 1;
            }
        }

        return { updateQuery, expressionAttributeValues, expressionAttributeNames };
    }

    private generateUpdateExpressionModified(values: any[], conditions?: any) {
        let updateExpression = 'SET ';
        let conditionExpression = '';
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};
        let i = 0;
        for (const val of values) {
            expressionAttributeValues[`:val_${i}`] = val.value;
            expressionAttributeNames[`#key_${i}`] = val.key;
            const query = val.operation ? `#key_${i} = #key_${i} ${val.operation} :val_${i}` : `#key_${i} = :val_${i}`;
            updateExpression = `${updateExpression} ${i === 0 ? '' : ','}${query}`;
            i += 1;
        }

        if (conditions) {
            expressionAttributeValues[`:cod_value`] = conditions.value;
            expressionAttributeNames[`#cod_name`] = conditions.key;
            conditionExpression = `#cod_name ${conditions.operation} :cod_value`;
        }

        return {
            updateExpression,
            conditionExpression,
            expressionAttributeValues,
            expressionAttributeNames,
        };
    }
}
