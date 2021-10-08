import { Key } from 'aws-sdk/clients/dynamodb';
import { TableTypes } from '../../constants/tableNames';
import {
    DbParam,
    GetAllOptions,
    GetOptions,
    KeyConditionParams,
    KeyConditionParamsWithSortKey,
    KeyTypes,
} from '../../models/dbParam';

export interface DatabaseAdapter {
    createItem(tableName: TableTypes, param: any): Promise<any>;

    putItem(tableName: TableTypes, param: any): Promise<any>;

    getBatchItem(tableName: TableTypes[], value: any): Promise<any>;

    getItem(tableName: TableTypes, value: any): Promise<any>;

    updateItem(
        tableName: TableTypes,
        key: any,
        values: any,
        condition?: { key: string; value: any; operation: string },
    ): Promise<any>;

    deleteItem(tableName: TableTypes, param: any): Promise<void>;

    getAllItems(tableName: TableTypes): Promise<any>;

    getItemsByIndexWithFilter(tableName: TableTypes, key: KeyConditionParams, options?: GetOptions): Promise<any>;

    getItemsByIndexWithSortKey(
        tableName: TableTypes,
        key: KeyConditionParamsWithSortKey,
        options?: GetOptions,
    ): Promise<any>;

    get(tableName: TableTypes, hashKey: KeyTypes, options?: GetAllOptions): Promise<any>;

    transactWriteItems(transactItems: DbParam[]): Promise<any>;

    transactGetItems(transactItems: DbParam[]): Promise<any>;

    getItemByPaginationWithFilter(tableName: TableTypes, itemsPerPage: number, options?: GetOptions): Promise<any>;

    getItemByPagination(tableName: TableTypes, itemsPerPage: number, lastEvaluatedKey?: Key): Promise<any>;

    getId(tableName: TableTypes): Promise<any>;
}
