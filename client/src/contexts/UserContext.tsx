import { createContext, useState } from "react";
import { CurrentUser } from "../models/users";

export const UserContext = createContext<any>(undefined);

const UserContextProvider = (props: any) => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(undefined);

    const setUser = (user: CurrentUser) => {
        setCurrentUser(user);
    }

    const removeUser = () => {
        setCurrentUser(undefined);
    }

    return (
        <UserContext.Provider value={{ currentUser, setUser, removeUser } as any}>
            {props.children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;