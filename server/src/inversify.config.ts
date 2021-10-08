import { Container } from 'inversify';
import 'reflect-metadata';
import { DynamoDbAdapterImpl } from './dependency/database/dynamodb/dynamoDbAdapterImpl';
import { DynamoDbQueryGenerator } from './dependency/database/dynamodb/dynamoDbQueryGenerator';

const container = new Container();
container.bind<DynamoDbAdapterImpl>(DynamoDbAdapterImpl).toSelf();
container.bind<DynamoDbQueryGenerator>(DynamoDbQueryGenerator).toSelf();

export { container };
