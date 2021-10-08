export interface User {
    PK: string;
    SK: string;
    id: string;
    name: string;
    isOnline: boolean;
    password: string;
}

export type UserDetails = Omit<User, 'password' | 'PK' | 'SK'>;

export type GetAllUsersResponse = UserDetails[];
