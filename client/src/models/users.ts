export interface User {
    id: string;
    name: string;
    isOnline: boolean;
}

export interface CurrentUser extends User {
    token: string;
}