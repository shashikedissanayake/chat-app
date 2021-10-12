import { LastEvaluatedKey, Message } from "./messages";
import { CurrentUser, User } from "./users";

export interface ChatContextModel {
    users: User[];
    messages: Message[];
    updateUsers: (users: User | User[]) => void;
    updateMessages: (messages: Message | Message[]) => void;
    cleanMessages: () => void;
    lastEvaluatedKey: LastEvaluatedKey | undefined;
    setLastEvaluatedKey: (key: LastEvaluatedKey) => void;
}

export interface UserContextModel {
    currentUser: CurrentUser | undefined;
    selectedUser: User | undefined;
    selectedRoomId: string | undefined;
    setSelectedRoomId: (roomId: string) => void;
    setUser: (user: CurrentUser) => void;
    setSelectedUser: (user: User) => void;
    removeUser: () => void;
}