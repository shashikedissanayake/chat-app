import { createContext, useState } from "react";
import { UserContextModel } from "../models/contexts";
import { CurrentUser, User } from "../models/users";

export const UserContext = createContext<UserContextModel>({} as UserContextModel);

const UserContextProvider = (props: any) => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(undefined);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

    const setUser = (user: CurrentUser) => {
        setCurrentUser(user);
    }

    const removeUser = () => {
        setCurrentUser(undefined);
    }

    return (
        <UserContext.Provider value={{ currentUser, setUser, removeUser, selectedUser, setSelectedUser }}>
            {props.children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;