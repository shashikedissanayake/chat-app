import { Message } from "./messages";
import { CurrentUser, User } from "./users";

export interface ChatContextModel {
    users: User[];
    messages: Message[];
    updateUsers: (users: User | User[]) => void;
    updateMessages: (messages: Message) => void;
}

export interface UserContextModel {
    currentUser: CurrentUser | undefined;
    selectedUser: User | undefined;
    setUser: (user: CurrentUser) => void;
    setSelectedUser: (user: User) => void;
    removeUser: () => void;
}