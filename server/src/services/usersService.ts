import { inject, injectable } from 'inversify';
import { DBPrefixes, TableTypes } from '../constants/tableNames';
import { DatabaseAdapter } from '../dependency/database/databaseAdapter';
import { DynamoDbAdapterImpl } from '../dependency/database/dynamodb/dynamoDbAdapterImpl';
import { GetAllUsersResponse, User, UserDetails } from '../models/usersModel';

@injectable()
export class UserService {
    private readonly db: DatabaseAdapter;
    // PK: user
    // SK: user#{user_id}

    constructor(@inject(DynamoDbAdapterImpl) db: DatabaseAdapter) {
        this.db = db;
    }

    public async getAllUsers(): Promise<GetAllUsersResponse> {
        try {
            const { data }: { data: User[] } = await this.db.getItemsByIndexWithSortKey(TableTypes.CHAT_TABLE, {
                keyCondition: 'PK = :key_0',
                keyValue: [`${DBPrefixes.USERS}`],
            });
            return Promise.resolve(
                data.map((user) => {
                    return {
                        id: user.id,
                        name: user.name,
                        isOnline: user.isOnline,
                    };
                }) as GetAllUsersResponse,
            );
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async getUserById(id: string): Promise<User> {
        try {
            const user: User = await this.db.getItem(TableTypes.CHAT_TABLE, {
                PK: `${DBPrefixes.USERS}`,
                SK: `${DBPrefixes.USERS}#${id}`,
            });

            return Promise.resolve(user);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async setOnline(id: string, isOnline: boolean): Promise<UserDetails> {
        try {
            const user: User = await this.db.getItem(TableTypes.CHAT_TABLE, {
                PK: `${DBPrefixes.USERS}`,
                SK: `${DBPrefixes.USERS}#${id}`,
            });

            if (!user) return Promise.reject(new Error('No user found'));

            const updatedUser: User = await this.db.updateItem(
                TableTypes.CHAT_TABLE,
                {
                    PK: `${DBPrefixes.USERS}`,
                    SK: `${DBPrefixes.USERS}#${id}`,
                },
                {
                    isOnline,
                },
            );
            return Promise.resolve({
                id: user.id,
                name: user.name,
                isOnline: updatedUser.isOnline,
            } as UserDetails);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
