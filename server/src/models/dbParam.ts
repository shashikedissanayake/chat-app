import { DbOperations } from '../constants/dbOperations';
import { TableTypes } from '../constants/tableNames';

export interface DbParam {
    tableName: TableTypes;
    values: any;
    key?: any;
    dbOperation?: DbOperations;
    conditions?: any;
}
export type KeyTypes = { [key: string]: string | number };

export type GetAllOptions = {
    limit?: number;
    startKey?: KeyTypes;
    sort?: 'ascending' | 'descending';
    attributes?: string[];
    index?: string;
};

export type KeyConditionParams = {
    keyCondition: string;
    keyValue: string;
};

export type KeyConditionParamsWithSortKey = {
    keyCondition: string;
    keyValue: string[];
};

export type GetOptions = {
    index?: string;
    limit?: number;
    startKey?: any;
    sort?: 'ascending' | 'descending';
    attributes?: string;
    filterExpression?: string;
    filterValue?: (string | number)[];
};

export interface BatchWriteParams {
    dbOperation: 'Put';
    tableName: TableTypes;
    putRequests: Record<string, any>[];
}
